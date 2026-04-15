<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? `编辑国家` : '新建国家'"
    width="680px"
    :close-on-click-modal="false"
    header-class="cm-country-form-hd"
    body-class="cm-country-form-bd"
    footer-class="cm-country-form-ft"
    @close="handleClose"
  >
    <!-- 副标题 -->
    <div class="form-subtitle">
      {{ isEdit ? '修改国家信息，带 * 号为必填项' : '请填写国家基本信息，带 * 号为必填项' }}
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="country-form">
      <!-- 代码 + 三位数代码 -->
      <div class="form-row">
        <div class="form-item">
          <div class="form-label">国家代码 <span class="required">*</span></div>
          <div class="form-hint">两位字母代码</div>
          <el-form-item prop="code">
            <el-input
              v-model="form.code"
              placeholder="e.g. US"
              class="dark-input"
              :disabled="isEdit"
              maxlength="2"
              @input="onCodeInput"
            />
          </el-form-item>
        </div>
        <div class="form-item">
          <div class="form-label">三位数代码 <span class="required">*</span></div>
          <el-form-item prop="code3">
            <el-input
              v-model="form.code3"
              placeholder="e.g. 840"
              class="dark-input"
              maxlength="3"
            />
          </el-form-item>
        </div>
      </div>

      <!-- Criteria ID + 国旗 -->
      <div class="form-row">
        <div class="form-item">
          <div class="form-label">Criteria ID</div>
          <el-form-item prop="criteriaId">
            <el-input v-model="form.criteriaId" placeholder="e.g. 2840" class="dark-input" />
          </el-form-item>
        </div>
        <div class="form-item form-item--flag">
          <div class="form-label">国旗图标</div>
          <div class="form-hint flag-hint">PNG / JPG / WebP，最大 512KB；保存前需上传成功</div>
          <div class="flag-upload-row">
            <ElUpload
              :key="flagUploadKey"
              class="flag-uploader"
              :show-file-list="false"
              :auto-upload="false"
              :limit="1"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              :on-change="onFlagFileChange"
            >
              <div v-if="form.flagIconUrl" class="flag-uploader-trigger" role="button" tabindex="0">
                <img :src="form.flagIconUrl" alt="" class="flag-preview-img" />
                <span class="flag-uploader-text">{{ isEdit ? '更换' : '上传' }}</span>
              </div>
              <div v-else class="flag-uploader-trigger flag-uploader-trigger--empty">
                <el-icon class="flag-uploader-plus"><Plus /></el-icon>
                <span>上传图标</span>
              </div>
            </ElUpload>
            <button
              v-if="form.flagIconUrl"
              class="flag-clear-btn"
              type="button"
              @click="clearFlagIcon"
            >
              清除
            </button>
          </div>
        </div>
      </div>

      <!-- 中文名称 -->
      <div class="form-row form-row--full">
        <div class="form-item">
          <div class="form-label">中文名称 <span class="required">*</span></div>
          <el-form-item prop="nameCn">
            <el-input v-model="form.nameCn" placeholder="请输入中文名称" class="dark-input" />
          </el-form-item>
        </div>
      </div>

      <!-- 国家名称（英文） -->
      <div class="form-row form-row--full">
        <div class="form-item">
          <div class="form-label">国家名称 <span class="required">*</span></div>
          <el-form-item prop="nameEn">
            <el-input
              v-model="form.nameEn"
              placeholder="请输入国家名称（英文）"
              class="dark-input"
            />
          </el-form-item>
        </div>
      </div>

      <!-- 别名 -->
      <div class="form-section-title">
        自定义名称（别名）
        <span class="hint-text">最多可添加5个别名</span>
      </div>
      <div class="alias-list">
        <div v-for="(alias, idx) in form.aliases" :key="idx" class="alias-item">
          <el-input
            v-model="form.aliases[idx]"
            :placeholder="`国家名称${idx + 2}`"
            class="dark-input alias-input"
          />
          <button class="alias-del-btn" type="button" @click="removeAlias(idx)">
            <el-icon><Delete /></el-icon>删除
          </button>
        </div>
      </div>
      <button v-if="form.aliases.length < 5" class="add-alias-btn" type="button" @click="addAlias">
        <el-icon><Plus /></el-icon> 添加别名
      </button>

      <!-- 时区 + 电话代码 -->
      <div class="form-row" style="margin-top: 18px">
        <div class="form-item">
          <div class="form-label">时区 <span class="required">*</span></div>
          <el-form-item prop="timezone">
            <el-select v-model="form.timezone" class="dark-select full-width">
              <el-option v-for="tz in props.timezoneOptions" :key="tz" :label="tz" :value="tz" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-item">
          <div class="form-label">电话代码 <span class="required">*</span></div>
          <el-form-item prop="phoneCode">
            <el-input v-model="form.phoneCode" placeholder="e.g. 86" class="dark-input" />
          </el-form-item>
        </div>
      </div>

      <!-- 货币 + 货币符号 -->
      <div class="form-row">
        <div class="form-item">
          <div class="form-label">货币</div>
          <el-form-item prop="currency">
            <el-select
              v-model="form.currency"
              class="dark-select full-width"
              clearable
              placeholder="请选择货币"
              @change="onCurrencyChange"
            >
              <el-option v-for="c in props.currencyOptions" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-item">
          <div class="form-label">货币符号</div>
          <el-form-item prop="currencySymbol">
            <el-input v-model="form.currencySymbol" placeholder="e.g. ¥" class="dark-input" />
          </el-form-item>
        </div>
      </div>

      <!-- 地区 + 是否主要市场 -->
      <div class="form-row">
        <div class="form-item">
          <div class="form-label">地区</div>
          <el-form-item prop="region">
            <el-select
              v-model="form.region"
              class="dark-select full-width"
              placeholder="请选择地区"
            >
              <el-option v-for="r in props.regionOptions" :key="r" :label="r" :value="r" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-item form-item--switch">
          <div class="form-label">是否主要市场</div>
          <el-switch v-model="form.isMainMarket" class="dark-switch" />
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <ElButton class="btn-cancel" @click="handleClose">取消</ElButton>
        <ElButton class="btn-submit" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '确认创建' }}
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { uploadCountryFlagIcon } from '@/api/config-management/country-management'
  import type { CountryItem, CountryFormModel } from '../types'

  defineOptions({ name: 'CountryFormDialog' })

  const CURRENCY_SYMBOL_MAP: Record<string, string> = {
    'USD - 美元': '$',
    'EUR - 欧元': '€',
    'CNY - 人民币': '¥',
    'JPY - 日元': '¥',
    'GBP - 英镑': '£',
    'AUD - 澳元': 'A$',
    'CAD - 加元': 'C$',
    'SGD - 新元': 'S$',
    'KRW - 韩元': '₩',
    'BRL - 雷亚尔': 'R$',
    'MXN - 比索': 'MX$'
  }

  const props = defineProps<{
    visible: boolean
    editData?: CountryItem | null
    timezoneOptions: string[]
    regionOptions: string[]
    currencyOptions: string[]
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: CountryFormModel, isEdit: boolean]
  }>()

  const formRef = ref<FormInstance>()

  const isEdit = computed(() => !!props.editData?.code)
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const MAX_FLAG_BYTES = 512 * 1024
  const flagUploadKey = ref(0)

  const defaultForm = (): CountryFormModel => ({
    code: '',
    code3: '',
    criteriaId: '',
    flagIconUrl: '',
    nameCn: '',
    nameEn: '',
    aliases: [],
    timezone: 'GMT+8',
    phoneCode: '',
    currency: '',
    currencySymbol: '',
    region: '亚太',
    isMainMarket: false
  })

  const form = reactive<CountryFormModel>(defaultForm())

  watch(
    () => props.editData,
    (val) => {
      if (val) {
        Object.assign(form, { ...defaultForm(), ...val, aliases: [...(val.aliases ?? [])] })
      } else {
        Object.assign(form, defaultForm())
      }
    },
    { immediate: true }
  )

  const rules: FormRules = {
    code: [
      { required: true, message: '请输入国家代码', trigger: 'blur' },
      { pattern: /^[A-Za-z]{2}$/, message: '两位字母代码，如 US', trigger: 'blur' }
    ],
    code3: [
      { required: true, message: '请输入三位数代码', trigger: 'blur' },
      { pattern: /^\d{3}$/, message: '三位数字，如 840', trigger: 'blur' }
    ],
    nameCn: [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
    nameEn: [{ required: true, message: '请输入国家名称（英文）', trigger: 'blur' }],
    timezone: [{ required: true, message: '请选择时区', trigger: 'change' }],
    phoneCode: [{ required: true, message: '请输入电话代码', trigger: 'blur' }]
  }

  const onCodeInput = () => {
    form.code = form.code.toUpperCase()
    if (form.code.length === 2 && !form.criteriaId) {
      // 自动填充 criteriaId 前缀
    }
  }

  const onFlagFileChange = async (uploadFile: UploadFile) => {
    const raw = uploadFile.raw
    if (!raw) return
    if (!raw.type.startsWith('image/')) {
      ElMessage.error('请上传图片文件')
      return
    }
    if (raw.size > MAX_FLAG_BYTES) {
      ElMessage.error('图片需小于 512KB')
      return
    }
    try {
      const { url } = await uploadCountryFlagIcon(raw)
      form.flagIconUrl = url
    } catch {
      ElMessage.error('上传失败，请重试')
    }
  }

  const clearFlagIcon = () => {
    form.flagIconUrl = ''
    flagUploadKey.value += 1
  }

  const onCurrencyChange = (val: string) => {
    form.currencySymbol = CURRENCY_SYMBOL_MAP[val] ?? ''
  }

  const addAlias = () => {
    if (form.aliases.length < 5) form.aliases.push('')
  }

  const removeAlias = (idx: number) => {
    form.aliases.splice(idx, 1)
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (!valid) return
      // filter empty aliases
      const cleaned: CountryFormModel = {
        ...form,
        code: form.code.toUpperCase(),
        aliases: form.aliases.filter((a) => a.trim() !== '')
      }
      emit('success', cleaned, isEdit.value)
    })
  }

  const handleClose = () => {
    emit('update:visible', false)
    formRef.value?.resetFields()
    Object.assign(form, defaultForm())
  }
</script>

<style lang="scss">
  .el-dialog:has(.cm-country-form-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.cm-country-form-bd) .el-dialog__header.cm-country-form-hd {
    padding: 18px 24px 14px;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.cm-country-form-bd) .el-dialog__title {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cm-country-form-bd) .el-dialog__headerbtn .el-icon {
    font-size: 16px;
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.cm-country-form-bd) .el-dialog__body.cm-country-form-bd {
    max-height: 70vh;
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

  .el-dialog:has(.cm-country-form-bd) .el-dialog__footer.cm-country-form-ft {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }

  .el-dialog:has(.cm-country-form-bd) .el-form-item {
    margin-bottom: 0;
  }

  .el-dialog:has(.cm-country-form-bd) .el-form-item__error {
    margin-top: 2px;
    font-size: 11px;
    color: #ef4444;
  }
</style>

<style lang="scss" scoped>
  .form-subtitle {
    padding: 10px 24px 0;
    font-size: 12px;
    color: #64748b;
  }

  .country-form {
    padding: 16px 24px 20px;
  }

  // ─── 行布局 ────────────────────────────────────────────
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 16px;
    margin-bottom: 14px;

    &--full {
      grid-template-columns: 1fr;
    }
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &--switch {
      flex-direction: row;
      gap: 12px;
      align-items: center;
      padding-top: 24px;
    }

    &--flag {
      justify-content: flex-start;
    }
  }

  .form-label {
    font-size: 12px;
    color: #94a3b8;
  }

  .form-hint {
    margin-top: -4px;
    font-size: 11px;
    color: #475569;
  }

  .required {
    margin-left: 2px;
    color: #ef4444;
  }

  .flag-hint {
    margin-top: -2px;
  }

  .flag-upload-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .flag-uploader {
    :deep(.el-upload) {
      border: none;
    }
  }

  .flag-uploader-trigger {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 140px;
    padding: 6px 12px;
    cursor: pointer;
    background: rgb(45 212 191 / 10%);
    border: 1px dashed rgb(45 212 191 / 45%);
    border-radius: 8px;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;

    &:hover {
      background: rgb(45 212 191 / 16%);
      border-color: rgb(45 212 191 / 65%);
    }

    &--empty {
      min-height: 44px;
      font-size: 13px;
      color: #2dd4bf;
    }
  }

  .flag-preview-img {
    width: 40px;
    height: 30px;
    object-fit: cover;
    border-radius: 4px;
  }

  .flag-uploader-text {
    font-size: 12px;
    color: #94a3b8;
  }

  .flag-uploader-plus {
    font-size: 18px;
    color: #2dd4bf;
  }

  .flag-clear-btn {
    padding: 6px 12px;
    font-size: 12px;
    color: #94a3b8;
    cursor: pointer;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 6px;
    transition:
      color 0.15s ease,
      border-color 0.15s ease;

    &:hover {
      color: #e2e8f0;
      border-color: rgb(255 255 255 / 18%);
    }
  }

  // ─── 别名 ──────────────────────────────────────────────
  .form-section-title {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
  }

  .hint-text {
    font-size: 11px;
    font-weight: 400;
    color: #475569;
  }

  .alias-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
  }

  .alias-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .alias-input {
    flex: 1;
  }

  .alias-del-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    color: #ef4444;
    white-space: nowrap;
    cursor: pointer;
    background: rgb(239 68 68 / 8%);
    border: 1px solid rgb(239 68 68 / 20%);
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      background: rgb(239 68 68 / 15%);
    }
  }

  .add-alias-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 12px;
    font-size: 12px;
    color: #2dd4bf;
    cursor: pointer;
    background: none;
    border: none;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
    }
  }

  // ─── 底部 ──────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    gap: 10px;
    align-items: center;
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
    color: #0b1120 !important;
    background: #2dd4bf !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover {
      filter: brightness(1.1);
    }
  }

  // ─── 深色输入框 ────────────────────────────────────────
  .dark-input {
    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

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

  .dark-switch {
    :deep(.el-switch__core) {
      background-color: rgb(255 255 255 / 10%) !important;
      border-color: transparent !important;
    }

    :deep(.el-switch.is-checked .el-switch__core) {
      background-color: #2dd4bf !important;
    }
  }
</style>
