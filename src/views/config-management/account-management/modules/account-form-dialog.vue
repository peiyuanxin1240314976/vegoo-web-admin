<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? `编辑广告账户 ${editData?.id}` : '新建广告账户'"
    width="580px"
    :close-on-click-modal="false"
    header-class="acc-form-dialog-hd"
    body-class="acc-form-dialog-bd"
    footer-class="acc-form-dialog-ft"
    @close="handleClose"
  >
    <!-- 编辑模式：顶部信息提示 -->
    <div v-if="isEdit" class="edit-info-bar">
      <el-icon class="info-icon"><InfoFilled /></el-icon>
      账户ID: {{ editData?.id }}
      &nbsp;·&nbsp; {{ editData?.source }}
      &nbsp;·&nbsp; 创建: {{ editData?.createTime }}
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="acc-form">
      <!-- 广告平台（仅新建） -->
      <div v-if="!isEdit" class="form-item">
        <div class="form-label">广告平台 <span class="required">*</span></div>
        <el-form-item prop="source">
          <el-select v-model="form.source" placeholder="请选择广告平台" class="dark-select full-width">
            <el-option
              v-for="p in PLATFORM_CONFIGS"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 账户名称 -->
      <div class="form-item">
        <div class="form-label">账户名称 <span class="required">*</span></div>
        <el-form-item prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账户名称" class="dark-input" />
        </el-form-item>
      </div>

      <!-- 账户类型（新建时可选，编辑时显示 badge） -->
      <div class="form-item">
        <div class="form-label">账户类型 <span class="required">*</span></div>
        <template v-if="isEdit">
          <span
            :class="[
              'type-badge-static',
              form.accountType === '直投' ? 'type-badge-static--direct' : 'type-badge-static--proxy'
            ]"
          >
            {{ form.accountType }}
          </span>
        </template>
        <template v-else>
          <div class="account-type-row">
            <el-radio-group v-model="form.accountType" class="dark-radio-group">
              <el-radio value="直投">直投</el-radio>
              <el-radio value="代投">代投</el-radio>
            </el-radio-group>
            <div class="open-amount-row">
              <span class="form-label-inline">开户金额</span>
              <el-input v-model="openAmountStr" class="dark-input amount-input" placeholder="$500">
                <template #prefix>$</template>
              </el-input>
            </div>
          </div>
        </template>
      </div>

      <!-- 归属代理商（直投时不显示） -->
      <div v-if="form.accountType === '代投'" class="form-item">
        <div class="form-label">归属代理商</div>
        <el-form-item>
          <el-select v-model="form.agency" placeholder="请选择代理商" class="dark-select full-width">
            <el-option
              v-for="a in agencyOptions"
              :key="a"
              :label="a"
              :value="a"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 归属BC/BM -->
      <div class="form-item">
        <div class="form-label">归属BC/BM</div>
        <el-form-item>
          <el-select v-model="form.bcBm" placeholder="请选择BC/BM" class="dark-select full-width">
            <el-option
              v-for="b in bcBmOptions"
              :key="b"
              :label="b"
              :value="b"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 投放应用 -->
      <div class="form-item">
        <div class="form-label">投放应用</div>
        <div class="app-tags-input">
          <span
            v-for="app in form.apps"
            :key="app"
            class="app-tag"
          >
            {{ app }}
            <button class="app-tag-remove" @click="removeApp(app)">×</button>
          </span>
          <el-select
            v-model="addingApp"
            placeholder="+ 添加"
            class="dark-select app-add-select"
            @change="handleAddApp"
          >
            <el-option
              v-for="a in availableApps"
              :key="a"
              :label="a"
              :value="a"
            />
          </el-select>
        </div>
      </div>

      <!-- 投放平台 + 账户用途 -->
      <div class="form-row-2">
        <div class="form-item">
          <div class="form-label">投放平台</div>
          <div class="check-group">
            <el-checkbox v-model="platformAndroid" label="安卓" class="dark-checkbox">安卓</el-checkbox>
            <el-checkbox v-model="platformIos" label="iOS" class="dark-checkbox">iOS</el-checkbox>
          </div>
        </div>
        <div class="form-item">
          <div class="form-label">账户用途</div>
          <div class="check-group">
            <el-checkbox
              v-for="p in purposeOptions"
              :key="p"
              v-model="purposeChecked[p]"
              class="dark-checkbox"
            >
              {{ p }}
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 关联凭据（新建）/ 更换凭据（编辑） -->
      <div class="form-item">
        <div class="form-label">{{ isEdit ? '更换凭据' : '关联凭据' }}</div>
        <div class="credential-select-row">
          <el-select v-model="form.credential" class="dark-select" style="width: 160px">
            <el-option
              v-for="c in credentialOptions"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
          <div v-if="isEdit && form.credential" class="cred-status">
            <span class="cred-dot" />
            当前凭据: {{ form.credential }} &nbsp;● 验证正常
          </div>
          <span v-else class="cred-hint">用于API调用</span>
        </div>
      </div>

      <!-- 备注 -->
      <div class="form-item">
        <div class="form-label">备注</div>
        <el-form-item>
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="选填"
            class="dark-input dark-textarea"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <ElButton round class="btn-cancel" @click="handleClose">取消</ElButton>
        <ElButton round class="btn-submit" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '提交开户申请' }}
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { InfoFilled } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AdAccountItem, AccountFormModel } from '../types'
  import { appOptions, bcBmOptions, credentialOptions, agencyOptions } from '../mock/data'

  defineOptions({ name: 'AccountFormDialog' })

  const props = defineProps<{
    visible: boolean
    editData?: AdAccountItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: AccountFormModel]
  }>()

  const formRef = ref<FormInstance>()
  const openAmountStr = ref('500')
  const addingApp = ref('')

  const isEdit = computed(() => !!props.editData?.id)
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const purposeOptions = ['广告投放', '用户获取', '品牌建设']

  const defaultForm = (): AccountFormModel => ({
    source: '',
    accountName: '',
    accountType: '直投',
    openAmount: 500,
    agency: '',
    bcBm: '',
    apps: [],
    platform: ['安卓'],
    purposes: ['广告投放', '用户获取'],
    credential: '',
    remark: ''
  })

  const form = reactive<AccountFormModel>(defaultForm())

  const platformAndroid = computed({
    get: () => form.platform.includes('安卓'),
    set: (v) => {
      if (v) { if (!form.platform.includes('安卓')) form.platform.push('安卓') }
      else { form.platform = form.platform.filter((p) => p !== '安卓') }
    }
  })

  const platformIos = computed({
    get: () => form.platform.includes('iOS'),
    set: (v) => {
      if (v) { if (!form.platform.includes('iOS')) form.platform.push('iOS') }
      else { form.platform = form.platform.filter((p) => p !== 'iOS') }
    }
  })

  const purposeChecked = computed(() => {
    const obj: Record<string, boolean> = {}
    for (const p of purposeOptions) {
      obj[p] = form.purposes.includes(p)
    }
    return new Proxy(obj, {
      set(target, key, value) {
        target[key as string] = value as boolean
        if (value) {
          if (!form.purposes.includes(key as string)) form.purposes.push(key as string)
        } else {
          form.purposes = form.purposes.filter((p) => p !== key)
        }
        return true
      }
    })
  })

  const availableApps = computed(() => appOptions.filter((a) => !form.apps.includes(a)))

  const removeApp = (app: string) => {
    form.apps = form.apps.filter((a) => a !== app)
  }

  const handleAddApp = (app: string) => {
    if (app && !form.apps.includes(app)) form.apps.push(app)
    addingApp.value = ''
  }

  watch(
    () => props.editData,
    (val) => {
      if (val) {
        Object.assign(form, {
          ...defaultForm(),
          source: val.source,
          accountName: val.accountName,
          accountType: val.accountType,
          agency: val.agency,
          bcBm: val.bcBm,
          apps: [...val.apps],
          platform: [...val.platform],
          purposes: [...val.purposes],
          credential: val.credential,
          remark: val.remark
        })
      } else {
        Object.assign(form, defaultForm())
      }
    },
    { immediate: true }
  )

  const rules: FormRules = {
    source: [{ required: true, message: '请选择广告平台', trigger: 'change' }],
    accountName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }]
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      emit('success', { ...form })
    })
  }

  const handleClose = () => {
    emit('update:visible', false)
    formRef.value?.resetFields()
  }
</script>

<style lang="scss">
  .el-dialog:has(.acc-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.acc-form-dialog-bd) .el-dialog__header.acc-form-dialog-hd {
    padding: 18px 24px 16px;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.acc-form-dialog-bd) .el-dialog__title {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.acc-form-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }

  .el-dialog:has(.acc-form-dialog-bd) .el-dialog__body.acc-form-dialog-bd {
    max-height: 72vh;
    padding: 0 !important;
    overflow-y: auto;
    background: var(--cm-dialog-bg-inner);

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb {
      background: var(--cm-dialog-border);
      border-radius: 2px;
    }
  }

  .el-dialog:has(.acc-form-dialog-bd) .el-dialog__footer.acc-form-dialog-ft {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }

  .el-dialog:has(.acc-form-dialog-bd) .el-form-item {
    margin-bottom: 0;
  }

  .el-dialog:has(.acc-form-dialog-bd) .el-form-item__error {
    font-size: 11px;
    color: #ef4444;
  }
</style>

<style lang="scss" scoped>
  .edit-info-bar {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 10px 20px;
    font-size: 12px;
    color: #60a5fa;
    background: rgb(59 130 246 / 8%);
    border-bottom: 1px solid rgb(59 130 246 / 15%);

    .info-icon {
      font-size: 14px;
    }
  }

  .acc-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .form-label {
    font-size: 12px;
    color: #94a3b8;
  }

  .required {
    margin-left: 2px;
    color: #ef4444;
  }

  .form-label-inline {
    flex-shrink: 0;
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
  }

  // ─── 账户类型行 ────────────────────────────────────────
  .account-type-row {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .dark-radio-group {
    :deep(.el-radio__label) {
      font-size: 13px;
      color: #e2e8f0;
    }

    :deep(.el-radio__inner) {
      background: rgb(255 255 255 / 5%);
      border-color: rgb(255 255 255 / 20%);
    }

    :deep(.el-radio__input.is-checked .el-radio__inner) {
      background: #3b82f6;
      border-color: #3b82f6;
    }
  }

  .open-amount-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .amount-input {
    width: 100px;
  }

  // ─── 账户类型只读 badge ────────────────────────────────
  .type-badge-static {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;

    &--direct {
      color: #3b82f6;
      background: rgb(59 130 246 / 12%);
    }

    &--proxy {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
    }
  }

  // ─── 应用 tags ─────────────────────────────────────────
  .app-tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 7px;
  }

  .app-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    color: #94a3b8;
    background: rgb(255 255 255 / 8%);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 4px;
  }

  .app-tag-remove {
    padding: 0;
    font-size: 14px;
    line-height: 1;
    color: #64748b;
    cursor: pointer;
    background: none;
    border: none;

    &:hover { color: #ef4444; }
  }

  .app-add-select {
    width: 90px;

    :deep(.el-select__wrapper) {
      height: 24px !important;
      min-height: 24px !important;
      padding: 0 8px !important;
      font-size: 12px;
      color: #3b82f6;
      background: transparent !important;
      border: 1px dashed rgb(59 130 246 / 30%) !important;
      border-radius: 4px;
      box-shadow: none !important;
    }
  }

  // ─── 两列行 ────────────────────────────────────────────
  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .check-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .dark-checkbox {
    :deep(.el-checkbox__label) {
      font-size: 13px;
      color: #e2e8f0;
    }

    :deep(.el-checkbox__inner) {
      background: rgb(255 255 255 / 5%);
      border-color: rgb(255 255 255 / 20%);
    }

    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background: #3b82f6;
      border-color: #3b82f6;
    }
  }

  // ─── 凭据选择行 ────────────────────────────────────────
  .credential-select-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .cred-status {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    color: #22c55e;
  }

  .cred-dot {
    width: 7px;
    height: 7px;
    background: #22c55e;
    border-radius: 50%;
  }

  .cred-hint {
    font-size: 12px;
    color: #64748b;
  }

  // ─── 底部 ──────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 20px;
  }

  .btn-cancel {
    padding: 8px 20px !important;
    color: #94a3b8 !important;
    background: transparent !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #e2e8f0 !important;
      border-color: rgb(255 255 255 / 20%) !important;
    }
  }

  .btn-submit {
    padding: 8px 24px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: #3b82f6 !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover { filter: brightness(1.1); }
  }

  // ─── 深色通用样式 ──────────────────────────────────────
  .dark-input {
    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover { border-color: rgb(59 130 246 / 40%) !important; }
      &.is-focus { border-color: #3b82f6 !important; }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;

      &::placeholder { color: #475569 !important; }
    }
  }

  .dark-textarea {
    :deep(.el-textarea__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;
      resize: none;

      &::placeholder { color: #475569 !important; }
      &:hover { border-color: rgb(59 130 246 / 40%) !important; }
      &:focus { border-color: #3b82f6 !important; }
    }
  }

  .dark-select {
    &.full-width { width: 100%; }

    :deep(.el-select__wrapper) {
      color: #e2e8f0;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover { border-color: rgb(59 130 246 / 40%) !important; }
    }

    :deep(.el-select__selected-item) {
      font-size: 13px;
      color: #e2e8f0 !important;
    }

    :deep(.el-select__placeholder) {
      font-size: 13px;
      color: #475569 !important;
    }
  }
</style>
