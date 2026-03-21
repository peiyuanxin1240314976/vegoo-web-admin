<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑应用' : '新增应用'"
    class="app-form-dialog"
    width="760px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="app-form">
      <!-- 基础信息 -->
      <div class="form-section">
        <div class="section-title">基础信息</div>
        <div class="form-grid">
          <!-- 应用名 -->
          <div class="form-item">
            <div class="form-label">应用名 <span class="required">*</span></div>
            <el-form-item prop="appName">
              <el-input v-model="form.appName" placeholder="请输入应用名称" class="dark-input" />
            </el-form-item>
          </div>
          <!-- 平台 -->
          <div class="form-item">
            <div class="form-label">平台 <span class="required">*</span></div>
            <el-form-item prop="platform">
              <el-select v-model="form.platform" class="dark-select full-width">
                <el-option value="Android">
                  <span class="platform-opt platform-opt--android">
                    <span class="platform-dot" />Android
                  </span>
                </el-option>
                <el-option value="iOS">
                  <span class="platform-opt platform-opt--ios">
                    <span class="platform-dot" />iOS
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <!-- 类别 -->
          <div class="form-item">
            <div class="form-label">类别 <span class="required">*</span></div>
            <el-form-item prop="category">
              <el-select
                v-model="form.category"
                placeholder="请选择类别"
                class="dark-select full-width"
              >
                <el-option v-for="opt in categoryOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </div>
          <!-- 图标 -->
          <div class="form-item form-item--icon-row" style="grid-row: span 2">
            <div class="form-label">图标</div>
            <div class="icon-upload-area" @click="triggerIconUpload">
              <template v-if="iconPreview">
                <img :src="iconPreview" class="icon-preview-img" alt="icon" />
                <button class="icon-reupload-btn" @click.stop="triggerIconUpload">重新上传</button>
              </template>
              <template v-else>
                <el-icon class="upload-icon"><Upload /></el-icon>
                <div class="upload-text">点击上传图标</div>
                <div class="upload-hint">支持 PNG/JPG 512×512</div>
              </template>
            </div>
            <input
              ref="iconInputRef"
              type="file"
              accept="image/png,image/jpeg"
              style="display: none"
              @change="handleIconChange"
            />
          </div>
          <!-- ID -->
          <div class="form-item">
            <div class="form-label">ID <span class="required">*</span></div>
            <el-form-item prop="id">
              <el-input
                v-model="form.id"
                placeholder="如：Weather5A"
                class="dark-input"
                :disabled="isEdit"
              />
            </el-form-item>
          </div>
          <!-- 应用简称 -->
          <div class="form-item">
            <div class="form-label">应用简称</div>
            <el-form-item prop="shortName">
              <el-input v-model="form.shortName" placeholder="如：W5" class="dark-input" />
            </el-form-item>
          </div>
        </div>
      </div>

      <!-- 技术标识 -->
      <div class="form-section">
        <div class="section-title">技术标识</div>
        <div class="form-grid form-grid--full">
          <div class="form-item form-item--full">
            <div class="form-label">Bundle ID <span class="required">*</span></div>
            <el-form-item prop="bundleId">
              <el-input
                v-model="form.bundleId"
                placeholder="com.accurate.weather.forecast.live"
                class="dark-input"
              />
            </el-form-item>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-item">
            <div class="form-label">软件包ID</div>
            <el-form-item>
              <el-input
                v-model="form.packageId"
                placeholder="com.accurate.weather.forecast.live"
                class="dark-input"
              />
            </el-form-item>
          </div>
          <div class="form-item">
            <div class="form-label">应用商店ID</div>
            <el-form-item>
              <el-input
                v-model="form.storeId"
                placeholder="com.accurate.weather.forecast.live 或数字ID"
                class="dark-input"
              />
            </el-form-item>
          </div>
          <div class="form-item form-item--full">
            <div class="form-label">地址</div>
            <el-form-item>
              <el-input v-model="form.url" placeholder="https://" class="dark-input" />
            </el-form-item>
          </div>
        </div>
      </div>

      <!-- 报表配置 -->
      <div class="form-section">
        <div class="section-title">报表配置</div>
        <div class="report-config-grid">
          <!-- 报表时区 -->
          <div class="form-item">
            <div class="form-label">报表时区</div>
            <el-select v-model="form.timezone" class="dark-select full-width">
              <el-option v-for="tz in timezoneOptions" :key="tz" :label="tz" :value="tz" />
            </el-select>
          </div>
          <!-- 优先级 -->
          <div class="form-item">
            <div class="form-label">优先级</div>
            <el-input-number
              v-model="form.priority"
              :min="1"
              :max="999"
              class="dark-input-number"
              controls-position="right"
            />
          </div>
          <!-- 状态 -->
          <div class="form-item">
            <div class="form-label">状态</div>
            <el-select v-model="form.status" class="dark-select full-width">
              <el-option label="正常" value="正常" />
              <el-option label="禁用" value="禁用" />
            </el-select>
          </div>
        </div>

        <!-- 开关配置 -->
        <div class="toggle-grid">
          <div class="toggle-item">
            <span class="toggle-label">数据独立</span>
            <el-switch
              v-model="form.dataIsolation"
              class="dark-switch"
              active-text="ON"
              inactive-text="OFF"
            />
          </div>
          <div class="toggle-item">
            <span class="toggle-label">启用工具</span>
            <el-switch
              v-model="form.toolEnabled"
              class="dark-switch"
              active-text="ON"
              inactive-text="OFF"
            />
          </div>
          <div class="toggle-item">
            <span class="toggle-label">预生成报表文件</span>
            <el-switch
              v-model="form.preGenReport"
              class="dark-switch"
              active-text="ON"
              inactive-text="OFF"
            />
          </div>
          <div class="toggle-item">
            <span class="toggle-label">使用订单明细</span>
            <el-switch
              v-model="form.useOrderDetail"
              class="dark-switch"
              active-text="ON"
              inactive-text="OFF"
            />
          </div>
          <div class="toggle-item">
            <span class="toggle-label">报表展示订单</span>
            <el-switch
              v-model="form.showOrderReport"
              class="dark-switch"
              active-text="ON"
              inactive-text="OFF"
            />
          </div>
        </div>
      </div>
    </el-form>

    <!-- 底部 -->
    <template #footer>
      <div class="dialog-footer">
        <div v-if="isEdit" class="last-modify-info"> 最后修改：李四 2024-03-15 14:30 </div>
        <div class="footer-btns">
          <span class="required-hint">标有 * 为必填项</span>
          <ElButton round class="btn-cancel" @click="handleClose">取消</ElButton>
          <ElButton round class="btn-submit" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '确认创建' }}
          </ElButton>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { Upload } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ApplicationFormModel, ApplicationFormPayload } from '../types'

  defineOptions({ name: 'AppFormDialog' })

  const props = defineProps<{
    visible: boolean
    editData?: ApplicationFormModel | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: ApplicationFormPayload]
  }>()

  // ─── 响应式状态 ────────────────────────────────────────
  const formRef = ref<FormInstance>()
  const iconInputRef = ref<HTMLInputElement>()
  const iconPreview = ref<string>('')

  const isEdit = computed(() => !!props.editData?.id)
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const defaultForm = (): ApplicationFormModel => ({
    id: '',
    appName: '',
    platform: 'Android',
    category: '',
    shortName: '',
    bundleId: '',
    packageId: '',
    storeId: '',
    url: '',
    timezone: 'PST',
    priority: 1,
    status: '正常',
    dataIsolation: false,
    toolEnabled: false,
    preGenReport: false,
    useOrderDetail: false,
    showOrderReport: false
  })

  const form = reactive<ApplicationFormModel>(defaultForm())

  watch(
    () => props.editData,
    (val) => {
      if (val) {
        Object.assign(form, { ...defaultForm(), ...val })
        iconPreview.value = ''
      } else {
        Object.assign(form, defaultForm())
        iconPreview.value = ''
      }
    },
    { immediate: true }
  )

  // ─── 选项配置 ──────────────────────────────────────────
  const categoryOptions = ['Weather', 'Health', 'Finance', 'Travel', 'Shopping', 'Entertainment']
  const timezoneOptions = ['PST', 'EST', 'CST', 'MST', 'UTC', 'GMT+8']

  // ─── 表单校验 ──────────────────────────────────────────
  const rules: FormRules = {
    appName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
    platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
    category: [{ required: true, message: '请选择类别', trigger: 'change' }],
    id: [
      { required: true, message: '请输入应用ID', trigger: 'blur' },
      { pattern: /^[A-Za-z0-9]+$/, message: 'ID只能包含字母和数字', trigger: 'blur' }
    ],
    bundleId: [{ required: true, message: '请输入Bundle ID', trigger: 'blur' }]
  }

  // ─── 事件处理 ──────────────────────────────────────────
  const triggerIconUpload = () => iconInputRef.value?.click()

  const handleIconChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      iconPreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) emit('success', { ...form } as ApplicationFormPayload)
    })
  }

  const handleClose = () => {
    emit('update:visible', false)
    formRef.value?.resetFields()
    iconPreview.value = ''
  }
</script>

<style lang="scss">
  // ─── 弹窗全局样式（非 scoped 以覆盖 el-dialog） ────────
  .app-form-dialog {
    --bg-dialog: #131c2e;
    --bg-inner: #0f1829;
    --border: rgb(255 255 255 / 8%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 12%);
    --android-green: #22c55e;
    --ios-blue: #60a5fa;
    --red: #ef4444;

    .el-dialog {
      background: var(--bg-dialog) !important;
      border: 1px solid var(--border);
      border-radius: 12px !important;
      box-shadow: 0 24px 80px rgb(0 0 0 / 60%) !important;
    }

    .el-dialog__header {
      padding: 18px 24px 16px;
      margin: 0;
      background: var(--bg-inner);
      border-bottom: 1px solid var(--border);
      border-radius: 12px 12px 0 0;
    }

    .el-dialog__title {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: var(--text-primary) !important;
    }

    .el-dialog__headerbtn .el-icon {
      font-size: 16px;
      color: var(--text-muted) !important;

      &:hover {
        color: var(--text-primary) !important;
      }
    }

    .el-dialog__body {
      max-height: 68vh;
      padding: 0 !important;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgb(255 255 255 / 10%);
        border-radius: 2px;
      }
    }

    .el-dialog__footer {
      padding: 0 !important;
      background: var(--bg-inner);
      border-top: 1px solid var(--border);
      border-radius: 0 0 12px 12px;
    }

    .el-form-item {
      margin-bottom: 0;
    }

    .el-form-item__error {
      margin-top: 2px;
      font-size: 11px;
      color: var(--red);
    }
  }

  // ─── 下拉选项层 ────────────────────────────────────────
  .el-select-dropdown {
    background: #1a2540 !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;

    .el-select-dropdown__item {
      color: #94a3b8 !important;

      &:hover,
      &.is-hovering {
        color: #2dd4bf !important;
        background: rgb(45 212 191 / 8%) !important;
      }

      &.is-selected {
        color: #2dd4bf !important;
        background: rgb(45 212 191 / 12%) !important;
      }
    }
  }
</style>

<style lang="scss" scoped>
  .app-form {
    padding: 20px 24px;
  }

  // ─── Section ───────────────────────────────────────────
  .form-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    padding-left: 8px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
    color: #2dd4bf;
    border-left: 3px solid #2dd4bf;
  }

  // ─── 表单网格 ──────────────────────────────────────────
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 16px;

    &--full {
      grid-template-columns: 1fr;
    }
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  .form-label {
    font-size: 12px;
    color: #94a3b8;
  }

  .required {
    margin-left: 2px;
    color: #ef4444;
  }

  // ─── 图标上传区 ────────────────────────────────────────
  .icon-upload-area {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 110px;
    cursor: pointer;
    background: rgb(255 255 255 / 3%);
    border: 1.5px dashed rgb(255 255 255 / 15%);
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: rgb(45 212 191 / 4%);
      border-color: #2dd4bf;
    }
  }

  .upload-icon {
    font-size: 22px;
    color: #64748b;
  }

  .upload-text {
    font-size: 12px;
    color: #64748b;
  }

  .upload-hint {
    font-size: 11px;
    color: #475569;
  }

  .icon-preview-img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 10px;
  }

  .icon-reupload-btn {
    padding: 3px 10px;
    margin-top: 4px;
    font-size: 11px;
    color: #2dd4bf;
    cursor: pointer;
    background: rgb(45 212 191 / 10%);
    border: 1px solid rgb(45 212 191 / 30%);
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      background: rgb(45 212 191 / 20%);
    }
  }

  // ─── 报表配置 ──────────────────────────────────────────
  .report-config-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px 16px;
    margin-bottom: 16px;
  }

  .toggle-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 8px;
  }

  .toggle-label {
    font-size: 12px;
    color: #94a3b8;
  }

  // ─── 底部 ──────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
  }

  .last-modify-info {
    font-size: 12px;
    color: #64748b;
  }

  .footer-btns {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: auto;
  }

  .required-hint {
    font-size: 12px;
    color: #64748b;
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
    color: #0b1120 !important;
    background: #2dd4bf !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover {
      filter: brightness(1.1);
    }
  }

  // ─── 深色输入框统一样式 ────────────────────────────────
  .dark-input {
    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;
      transition: border-color 0.15s;

      &:hover {
        border-color: rgb(45 212 191 / 40%) !important;
      }

      &.is-focus {
        border-color: #2dd4bf !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;

      &::placeholder {
        color: #475569 !important;
      }
    }

    :deep(.el-input__inner:disabled) {
      color: #64748b !important;
      cursor: not-allowed;
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
        border-color: rgb(45 212 191 / 40%) !important;
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

  .dark-input-number {
    width: 100%;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover {
        border-color: rgb(45 212 191 / 40%) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;
    }

    :deep(.el-input-number__increase),
    :deep(.el-input-number__decrease) {
      color: #94a3b8 !important;
      background: rgb(255 255 255 / 5%) !important;
      border-color: rgb(255 255 255 / 10%) !important;

      &:hover {
        color: #2dd4bf !important;
      }
    }
  }

  // ─── Switch 样式 ───────────────────────────────────────
  .dark-switch {
    :deep(.el-switch__core) {
      background-color: rgb(255 255 255 / 10%) !important;
      border-color: transparent !important;
    }

    :deep(.el-switch.is-checked .el-switch__core) {
      background-color: #2dd4bf !important;
    }

    :deep(.el-switch__label) {
      font-size: 11px !important;
      color: #64748b !important;
    }

    :deep(.el-switch__label.is-active) {
      color: #2dd4bf !important;
    }
  }

  // ─── 平台选项 ──────────────────────────────────────────
  .platform-opt {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;

    &--android {
      color: #22c55e;
    }

    &--ios {
      color: #60a5fa;
    }
  }

  .platform-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    .platform-opt--android & {
      background: #22c55e;
    }

    .platform-opt--ios & {
      background: #60a5fa;
    }
  }
</style>
