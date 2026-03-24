<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? `编辑凭据 ${editData?.name}` : '新建凭据'"
    width="520px"
    :close-on-click-modal="false"
    header-class="cred-form-dialog-hd"
    body-class="cred-form-dialog-bd"
    footer-class="cred-form-dialog-ft"
  >
    <!-- 编辑警告栏 -->
    <div v-if="isEdit" class="warn-bar">
      <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="warn-icon">
        <path d="M8 2L14 13H2L8 2Z" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M8 6v4M8 11.5v.5" stroke="#f59e0b" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      修改凭据内容将影响 <strong>{{ editData?.accountCount }}</strong> 个关联账户的API调用，请谨慎操作
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="cred-form"
    >
      <!-- 凭据名称 -->
      <el-form-item label="凭据名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入凭据名称" class="form-input" clearable />
      </el-form-item>

      <!-- 广告平台 + 分组（同行） -->
      <div class="form-row">
        <el-form-item label="广告平台" prop="source" class="form-col">
          <el-select
            v-if="!isEdit"
            v-model="form.source"
            placeholder="请选择"
            class="form-select"
            clearable
          >
            <el-option v-for="p in PLATFORM_CONFIGS" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
          <!-- 编辑时不可改平台 -->
          <div v-else class="readonly-val">{{ editData?.source }}</div>
        </el-form-item>
        <el-form-item label="分组" prop="group" class="form-col">
          <el-select v-model="form.group" placeholder="请选择" class="form-select">
            <el-option v-for="g in groupOptions" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 凭据类型（新建时显示；编辑时不可改） -->
      <el-form-item v-if="!isEdit" label="凭据类型" prop="credentialType">
        <div class="radio-inline">
          <label
            v-for="t in credTypeOptions"
            :key="t"
            :class="['radio-item', { 'radio-item--active': form.credentialType === t }]"
            @click="form.credentialType = t"
          >
            <span :class="['radio-dot', { 'radio-dot--checked': form.credentialType === t }]" />
            {{ t }}
          </label>
        </div>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" placeholder="可填写凭据用途说明" class="form-input" clearable />
      </el-form-item>

      <!-- 关联应用 -->
      <el-form-item label="关联应用" prop="apps">
        <div class="apps-editor">
          <div class="apps-tags">
            <span v-for="app in form.apps" :key="app" class="app-tag">
              {{ app }}
              <button class="app-tag-del" @click="removeApp(app)">×</button>
            </span>
            <el-select
              v-model="addingApp"
              placeholder="+ 添加"
              class="app-add-select"
              size="small"
              clearable
              @change="handleAddApp"
            >
              <el-option
                v-for="opt in availableApps"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </div>
        </div>
      </el-form-item>

      <!-- 凭据配置 -->
      <div class="config-section-title">{{ isEdit ? '更新凭据配置' : '凭据配置' }}</div>

      <el-form-item label="账号" prop="config.account">
        <el-input v-model="form.config.account" placeholder="账号 / 邮箱" class="form-input" clearable />
      </el-form-item>

      <template v-if="showClientId">
        <el-form-item label="客户端 ID" prop="config.clientId">
          <el-input v-model="form.config.clientId" placeholder="Client ID" class="form-input" clearable />
        </el-form-item>
        <el-form-item label="客户端密码" prop="config.clientSecret">
          <el-input
            v-model="form.config.clientSecret"
            type="password"
            placeholder="Client Secret"
            class="form-input"
            show-password
          />
        </el-form-item>
      </template>

      <el-form-item label="访问令牌" prop="config.accessToken">
        <el-input
          v-model="form.config.accessToken"
          type="password"
          placeholder="Access Token"
          class="form-input"
          show-password
        />
      </el-form-item>

      <template v-if="isEdit || form.credentialType === '客户端Token'">
        <el-form-item label="刷新令牌" prop="config.refreshToken">
          <el-input
            v-model="form.config.refreshToken"
            type="password"
            placeholder="Refresh Token（可选）"
            class="form-input"
            show-password
          />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <span v-if="!isEdit" class="footer-tip">保存后自动进行接口验证</span>
        <div class="footer-btns">
          <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
          <ElButton round class="dialog-btn dialog-btn--submit" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存并重新验证' : '保存并验证' }}
          </ElButton>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import { appOptions, credentialGroupOptions } from '../mock/data'
  import type { CredentialItem, CredentialFormModel } from '../types'

  defineOptions({ name: 'CredentialFormDialog' })

  const props = defineProps<{
    visible: boolean
    editData: CredentialItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: CredentialFormModel]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const isEdit = computed(() => !!props.editData?.id)

  const credTypeOptions: CredentialItem['credentialType'][] = ['客户端Token', '服务号', '证书文件']
  const groupOptions = credentialGroupOptions

  const showClientId = computed(() =>
    form.value.credentialType === '客户端Token' || form.value.credentialType === '服务号'
  )

  const defaultForm = (): CredentialFormModel => ({
    name: '',
    source: '',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '',
    apps: [],
    config: { account: '', password: '', clientId: '', clientSecret: '', accessToken: '', refreshToken: '' }
  })

  const form = ref<CredentialFormModel>(defaultForm())
  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const addingApp = ref('')

  watch(
    () => props.visible,
    (v) => {
      if (v) {
        if (props.editData) {
          form.value = {
            name: props.editData.name,
            source: props.editData.source,
            group: props.editData.group,
            credentialType: props.editData.credentialType,
            remark: props.editData.remark,
            apps: [...props.editData.apps],
            config: {
              account: props.editData.config.account ?? '',
              password: '',
              clientId: props.editData.config.clientId ?? '',
              clientSecret: '',
              accessToken: '',
              refreshToken: ''
            }
          }
        } else {
          form.value = defaultForm()
        }
        formRef.value?.clearValidate()
      }
    }
  )

  const availableApps = computed(() =>
    appOptions.filter((a) => !form.value.apps.includes(a))
  )

  const removeApp = (app: string) => {
    form.value.apps = form.value.apps.filter((a) => a !== app)
  }

  const handleAddApp = (val: string) => {
    if (val && !form.value.apps.includes(val)) {
      form.value.apps.push(val)
    }
    addingApp.value = ''
  }

  const rules: FormRules = {
    name:   [{ required: true, message: '请输入凭据名称', trigger: 'blur' }],
    source: [{ required: true, message: '请选择广告平台', trigger: 'change' }]
  }

  const handleCancel = () => emit('update:visible', false)

  const handleSubmit = async () => {
    await formRef.value?.validate()
    submitting.value = true
    try {
      await new Promise((r) => setTimeout(r, 800))
      emit('success', { ...form.value, apps: [...form.value.apps], config: { ...form.value.config } })
    } finally {
      submitting.value = false
    }
  }
</script>

<!-- 非 scoped：利用 :has() 定向覆盖 ElDialog -->
<style lang="scss">
  .el-dialog:has(.cred-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__header.cred-form-dialog-hd {
    padding: 18px 20px 16px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__body.cred-form-dialog-bd {
    padding: 18px 20px 4px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__footer.cred-form-dialog-ft {
    padding: 14px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  // ─── 警告栏 ──────────────────────────────────────────
  .warn-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 13px;
    color: #fcd34d;
    background: rgb(245 158 11 / 8%);
    border: 1px solid rgb(245 158 11 / 20%);
    border-radius: 8px;

    strong { color: #f59e0b; }
  }

  .warn-icon { flex-shrink: 0; }

  // ─── 表单 ────────────────────────────────────────────
  .cred-form {
    :deep(.el-form-item__label) {
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
    }

    :deep(.el-form-item) { margin-bottom: 16px; }
  }

  .form-input,
  .form-select {
    width: 100%;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px;
      box-shadow: none !important;
      transition: border-color 0.18s;

      &:hover { border-color: rgb(255 255 255 / 18%) !important; }
      &:focus-within { border-color: #3b82f6 !important; }
    }

    :deep(.el-input__inner),
    :deep(.el-select__placeholder) {
      font-size: 13px;
      color: #e2e8f0;
      &::placeholder { color: #475569; }
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 14px;
  }

  .form-col { min-width: 0; }

  .readonly-val {
    padding: 9px 12px;
    font-size: 13px;
    color: #94a3b8;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 7px;
  }

  // ─── 凭据类型 radio ──────────────────────────────────
  .radio-inline {
    display: flex;
    gap: 12px;
  }

  .radio-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.15s;

    &--active { color: #e2e8f0; }
  }

  .radio-dot {
    display: block;
    width: 14px;
    height: 14px;
    background: rgb(255 255 255 / 10%);
    border: 2px solid rgb(255 255 255 / 20%);
    border-radius: 50%;
    transition: all 0.18s;

    &--checked {
      background: #3b82f6;
      border-color: #3b82f6;
    }
  }

  // ─── 关联应用 ────────────────────────────────────────
  .apps-editor {
    width: 100%;
  }

  .apps-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-height: 36px;
    padding: 6px 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 7px;
    transition: border-color 0.18s;

    &:focus-within { border-color: #3b82f6; }
  }

  .app-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    color: #3b82f6;
    background: rgb(59 130 246 / 10%);
    border-radius: 4px;
  }

  .app-tag-del {
    font-size: 14px;
    line-height: 1;
    color: #3b82f6;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 0;
    opacity: 0.7;
    &:hover { opacity: 1; }
  }

  .app-add-select {
    width: 100px;

    :deep(.el-select__wrapper) {
      background: transparent !important;
      border: 1px dashed rgb(59 130 246 / 30%) !important;
      border-radius: 4px !important;
      min-height: 26px !important;
      box-shadow: none !important;
      padding: 0 8px !important;
    }

    :deep(.el-select__placeholder) {
      font-size: 12px !important;
      color: #3b82f6 !important;
    }
  }

  // ─── 凭据配置小标题 ──────────────────────────────────
  .config-section-title {
    margin-bottom: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  // ─── 底部 ────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-tip {
    font-size: 11px;
    color: #475569;
  }

  .footer-btns {
    display: flex;
    gap: 8px;
  }

  .dialog-btn {
    border-radius: 8px !important;

    &--cancel {
      color: #94a3b8 !important;
      background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      &:hover { color: #e2e8f0 !important; border-color: rgb(255 255 255 / 20%) !important; }
    }

    &--submit {
      color: #fff !important;
      background: #3b82f6 !important;
      border: none !important;
      &:hover { filter: brightness(1.1); }
    }
  }
</style>
