<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑凭证' : '新建凭证'"
    width="560px"
    :close-on-click-modal="false"
    header-class="cred-form-dialog-hd"
    body-class="cred-form-dialog-bd"
    footer-class="cred-form-dialog-ft"
  >
    <!-- 副标题：关联账户 -->
    <div v-if="accountData" class="dialog-subtitle">
      关联账户：{{ accountData.accountName }}（{{ accountData.id }}）
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="cred-form">
      <!-- 凭证名称 -->
      <div class="form-item">
        <div class="form-label">凭证名称 <span class="required">*</span></div>
        <div class="form-control">
          <el-form-item prop="name">
            <el-input v-model="form.name" placeholder="请输入凭证名称" class="dark-input" />
          </el-form-item>
        </div>
      </div>

      <!-- 凭证类型 -->
      <div class="form-item">
        <div class="form-label">凭证类型 <span class="required">*</span></div>
        <div class="form-control">
          <div v-if="isEdit" class="readonly-field">
            <span class="readonly-text">{{ form.credentialType }}</span>
          </div>
          <el-form-item v-else prop="credentialType">
            <el-select v-model="form.credentialType" class="dark-select full-width">
              <el-option v-for="t in credTypeOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- Client ID -->
      <div class="form-item">
        <div class="form-label">Client ID <span class="required">*</span></div>
        <div class="form-control">
          <el-form-item prop="config.clientId">
            <el-input
              v-model="form.config.clientId"
              placeholder="请输入 Client ID"
              class="dark-input"
            />
          </el-form-item>
        </div>
      </div>

      <!-- Client Secret -->
      <div class="form-item">
        <div class="form-label">Client Secret <span class="required">*</span></div>
        <div class="form-control">
          <el-form-item prop="config.clientSecret">
            <el-input
              v-model="form.config.clientSecret"
              :type="showFields.clientSecret ? 'text' : 'password'"
              placeholder="••••••••••••••"
              class="dark-input"
            >
              <template #suffix>
                <button
                  class="eye-btn"
                  @click.prevent="showFields.clientSecret = !showFields.clientSecret"
                >
                  <svg
                    v-if="showFields.clientSecret"
                    viewBox="0 0 16 16"
                    fill="none"
                    width="14"
                    height="14"
                  >
                    <path
                      d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                      stroke="currentColor"
                      stroke-width="1.3"
                    />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3" />
                  </svg>
                  <svg v-else viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path
                      d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.7 5.3 1.5 7 1.5 8s2.5 5 6.5 5a7 7 0 0 0 3.7-1.1M6 3.2A7 7 0 0 1 8 3c4 0 6.5 5 6.5 5a9.4 9.4 0 0 1-1.7 2.4"
                      stroke="currentColor"
                      stroke-width="1.3"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </div>

      <!-- Access Token -->
      <div class="form-item">
        <div class="form-label">Access Token</div>
        <div class="form-control">
          <el-input
            v-model="form.config.accessToken"
            :type="showFields.accessToken ? 'text' : 'password'"
            placeholder=""
            class="dark-input"
          >
            <template #suffix>
              <button
                class="eye-btn"
                @click.prevent="showFields.accessToken = !showFields.accessToken"
              >
                <svg
                  v-if="showFields.accessToken"
                  viewBox="0 0 16 16"
                  fill="none"
                  width="14"
                  height="14"
                >
                  <path
                    d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                    stroke="currentColor"
                    stroke-width="1.3"
                  />
                  <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3" />
                </svg>
                <svg v-else viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path
                    d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.7 5.3 1.5 7 1.5 8s2.5 5 6.5 5a7 7 0 0 0 3.7-1.1M6 3.2A7 7 0 0 1 8 3c4 0 6.5 5 6.5 5a9.4 9.4 0 0 1-1.7 2.4"
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- Refresh Token -->
      <div class="form-item">
        <div class="form-label">Refresh Token</div>
        <div class="form-control">
          <el-input
            v-model="form.config.refreshToken"
            :type="showFields.refreshToken ? 'text' : 'password'"
            placeholder=""
            class="dark-input"
          >
            <template #suffix>
              <button
                class="eye-btn"
                @click.prevent="showFields.refreshToken = !showFields.refreshToken"
              >
                <svg
                  v-if="showFields.refreshToken"
                  viewBox="0 0 16 16"
                  fill="none"
                  width="14"
                  height="14"
                >
                  <path
                    d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                    stroke="currentColor"
                    stroke-width="1.3"
                  />
                  <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3" />
                </svg>
                <svg v-else viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path
                    d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.7 5.3 1.5 7 1.5 8s2.5 5 6.5 5a7 7 0 0 0 3.7-1.1M6 3.2A7 7 0 0 1 8 3c4 0 6.5 5 6.5 5a9.4 9.4 0 0 1-1.7 2.4"
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 过期时间 -->
      <div class="form-item">
        <div class="form-label">过期时间</div>
        <div class="form-control">
          <el-date-picker
            v-model="form.expireTime"
            type="datetime"
            placeholder="2024-06-26 10:30"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            class="dark-date-picker full-width"
          />
        </div>
      </div>

      <!-- 关联应用 -->
      <div class="form-item">
        <div class="form-label">关联应用</div>
        <div class="form-control">
          <div class="app-tags-input">
            <span v-for="app in form.apps" :key="app" class="app-tag">
              {{ app }}
              <button class="app-tag-remove" @click.prevent="removeApp(app)">×</button>
            </span>
            <el-select
              v-model="addingApp"
              placeholder="选择应用"
              class="dark-select app-add-select"
              @change="handleAddApp"
            >
              <el-option v-for="a in availableApps" :key="a" :label="a" :value="a" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div class="form-item form-item--textarea">
        <div class="form-label form-label--top">备注</div>
        <div class="form-control">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder=""
            class="dark-input dark-textarea"
          />
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <ElButton round class="btn-cancel" @click="handleCancel">取消</ElButton>
        <ElButton round class="btn-submit" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '保存并验证' }}
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, reactive } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { appOptions } from '../mock/data'
  import type { AdAccountItem, CredentialItem, CredentialFormModel } from '../types'

  defineOptions({ name: 'CredentialFormDialog' })

  const props = defineProps<{
    visible: boolean
    editData: CredentialItem | null
    accountData?: AdAccountItem | null
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
  const credTypeOptions = ['客户端 Token', '服务账号证书', 'OAuth2'] as const
  const submitting = ref(false)
  const addingApp = ref('')
  const formRef = ref<FormInstance>()

  const showFields = reactive({ clientSecret: false, accessToken: false, refreshToken: false })

  const defaultForm = (): CredentialFormModel => ({
    name: '',
    source: '',
    group: '',
    credentialType: '客户端Token',
    expireTime: '',
    remark: '',
    apps: [],
    config: {
      account: '',
      password: '',
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: ''
    }
  })

  const form = ref<CredentialFormModel>(defaultForm())

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
            expireTime: '',
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
        Object.assign(showFields, { clientSecret: false, accessToken: false, refreshToken: false })
        formRef.value?.clearValidate()
      }
    }
  )

  const availableApps = computed(() => appOptions.filter((a) => !form.value.apps.includes(a)))

  const removeApp = (app: string) => {
    form.value.apps = form.value.apps.filter((a) => a !== app)
  }

  const handleAddApp = (val: string) => {
    if (val && !form.value.apps.includes(val)) form.value.apps.push(val)
    addingApp.value = ''
  }

  const rules: FormRules = {
    name: [{ required: true, message: '请输入凭证名称', trigger: 'blur' }],
    credentialType: [{ required: true, message: '请选择凭证类型', trigger: 'change' }],
    'config.clientId': [{ required: true, message: '请输入 Client ID', trigger: 'blur' }],
    'config.clientSecret': [
      { required: !isEdit.value, message: '请输入 Client Secret', trigger: 'blur' }
    ]
  }

  const handleCancel = () => emit('update:visible', false)

  const handleSubmit = async () => {
    await formRef.value?.validate()
    submitting.value = true
    try {
      await new Promise((r) => setTimeout(r, 600))
      emit('success', {
        ...form.value,
        apps: [...form.value.apps],
        config: { ...form.value.config }
      })
      emit('update:visible', false)
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss">
  .el-dialog:has(.cred-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__header.cred-form-dialog-hd {
    padding: 18px 24px 0;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__title {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__body.cred-form-dialog-bd {
    max-height: 74vh;
    padding: 0 !important;
    overflow-y: auto;
    background: var(--cm-dialog-bg-inner);

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--cm-dialog-border);
      border-radius: 2px;
    }
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-dialog__footer.cred-form-dialog-ft {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-form-item {
    width: 100%;
    margin-bottom: 0;
  }

  .el-dialog:has(.cred-form-dialog-bd) .el-form-item__error {
    padding-top: 3px;
    font-size: 11px;
    color: #ef4444;
  }
</style>

<style lang="scss" scoped>
  // ─── 副标题 ────────────────────────────────────────────
  .dialog-subtitle {
    padding: 6px 24px 14px;
    font-size: 12px;
    color: #64748b;
    border-bottom: 1px solid var(--cm-dialog-border, rgb(255 255 255 / 8%));
  }

  // ─── 表单 ──────────────────────────────────────────────
  .cred-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 24px;
  }

  .form-item {
    display: flex;
    align-items: flex-start;

    &--textarea {
      align-items: flex-start;
    }
  }

  .form-label {
    box-sizing: border-box;
    flex-shrink: 0;
    width: 100px;
    padding-top: 9px;
    padding-right: 14px;
    font-size: 13px;
    color: #94a3b8;
    text-align: right;
    white-space: nowrap;

    &--top {
      padding-top: 9px;
    }
  }

  .form-control {
    flex: 1;
    min-width: 0;

    :deep(.el-form-item) {
      width: 100%;
      margin-bottom: 0;
    }
  }

  .required {
    margin-left: 2px;
    color: #ef4444;
  }

  // ─── 只读字段 ──────────────────────────────────────────
  .readonly-field {
    display: flex;
    align-items: center;
    min-height: 36px;
    padding: 0 12px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 7px;
  }

  .readonly-text {
    font-size: 13px;
    color: #64748b;
  }

  // ─── 密码眼睛按钮 ──────────────────────────────────────
  .eye-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    color: #64748b;
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.15s;

    &:hover {
      color: #94a3b8;
    }
  }

  // ─── 日期选择器 ────────────────────────────────────────
  .dark-date-picker {
    &.full-width {
      width: 100%;
    }

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover {
        border-color: rgb(59 130 246 / 40%) !important;
      }
      &.is-focus {
        border-color: #3b82f6 !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;
      &::placeholder {
        color: #475569 !important;
      }
    }

    :deep(.el-input__suffix .el-icon) {
      color: #64748b !important;
    }
  }

  // ─── 关联应用 ──────────────────────────────────────────
  .app-tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-height: 38px;
    padding: 6px 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 7px;
  }

  .app-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    color: #3b82f6;
    background: rgb(59 130 246 / 10%);
    border-radius: 4px;
  }

  .app-tag-remove {
    padding: 0;
    font-size: 14px;
    line-height: 1;
    color: #3b82f6;
    cursor: pointer;
    background: none;
    border: none;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }

  .app-add-select {
    width: 100px;

    :deep(.el-select__wrapper) {
      height: 26px !important;
      min-height: 26px !important;
      padding: 0 8px !important;
      font-size: 12px;
      color: #3b82f6;
      background: transparent !important;
      border: 1px dashed rgb(59 130 246 / 40%) !important;
      border-radius: 4px;
      box-shadow: none !important;
    }
  }

  // ─── 底部按钮 ──────────────────────────────────────────
  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 24px;
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
    background: #0d9488 !important;
    border: none !important;
    border-radius: 8px !important;
    &:hover {
      filter: brightness(1.1);
    }
  }

  // ─── 深色输入通用 ──────────────────────────────────────
  .dark-input {
    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover {
        border-color: rgb(59 130 246 / 40%) !important;
      }
      &.is-focus {
        border-color: #3b82f6 !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;
      &::placeholder {
        color: #475569 !important;
      }
    }
  }

  .dark-textarea {
    :deep(.el-textarea__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;
      resize: vertical;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;
      &::placeholder {
        color: #475569 !important;
      }
      &:hover {
        border-color: rgb(59 130 246 / 40%) !important;
      }
      &:focus {
        border-color: #3b82f6 !important;
      }
    }
  }

  .dark-select {
    &.full-width {
      width: 100%;
    }

    :deep(.el-select__wrapper) {
      color: #e2e8f0;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;
      &:hover {
        border-color: rgb(59 130 246 / 40%) !important;
      }
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
