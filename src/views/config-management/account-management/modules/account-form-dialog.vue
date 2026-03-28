<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑广告账户' : '新建广告账户'"
    width="600px"
    :close-on-click-modal="false"
    header-class="acc-form-dialog-hd"
    body-class="acc-form-dialog-bd"
    footer-class="acc-form-dialog-ft"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="acc-form">

      <!-- 广告平台 -->
      <div class="form-item">
        <div class="form-label">广告平台 <span v-if="!isEdit" class="required">*</span></div>
        <div class="form-control">
          <div v-if="isEdit" class="readonly-field">
            <span class="readonly-text">{{ form.source }}</span>
          </div>
          <el-form-item v-else prop="source">
            <el-select v-model="form.source" placeholder="请选择广告平台" class="dark-select full-width">
              <el-option v-for="p in PLATFORM_CONFIGS" :key="p.value" :label="p.label" :value="p.value" />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- 账户ID -->
      <div class="form-item">
        <div class="form-label">账户ID <span class="required">*</span></div>
        <div class="form-control">
          <div v-if="isEdit" class="readonly-field">
            <span class="readonly-text">{{ form.id }}</span>
          </div>
          <el-form-item v-else prop="id">
            <el-input v-model="form.id" placeholder="ACC-XXXXXX" class="dark-input" />
          </el-form-item>
        </div>
      </div>

      <!-- 账户名称 -->
      <div class="form-item">
        <div class="form-label">账户名称 <span class="required">*</span></div>
        <div class="form-control">
          <el-form-item prop="accountName">
            <el-input v-model="form.accountName" placeholder="请输入账户名称" class="dark-input" />
          </el-form-item>
        </div>
      </div>

      <!-- 账户类型 -->
      <div class="form-item">
        <div class="form-label">账户类型 <span class="required">*</span></div>
        <div class="form-control form-control--center">
          <div v-if="isEdit" class="readonly-type-row">
            <span :class="['type-dot', form.accountType === '直投' ? 'type-dot--direct' : 'type-dot--proxy']" />
            <span class="readonly-text">{{ form.accountType }}</span>
          </div>
          <el-radio-group v-else v-model="form.accountType" class="dark-radio-group">
            <el-radio value="直投">直投</el-radio>
            <el-radio value="代投">代投</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 归属BC/BM -->
      <div class="form-item">
        <div class="form-label">归属BC/BM</div>
        <div class="form-control">
          <div v-if="isEdit" class="readonly-field">
            <span class="readonly-text">{{ form.bcBm || '—' }}</span>
          </div>
          <el-select v-else v-model="form.bcBm" placeholder="请选择BC/BM" class="dark-select full-width" clearable>
            <el-option v-for="b in bcBmOptions" :key="b" :label="b" :value="b" />
          </el-select>
        </div>
      </div>

      <!-- 归属代理商 -->
      <div class="form-item">
        <div class="form-label">归属代理商</div>
        <div class="form-control">
          <div v-if="isEdit" class="readonly-field">
            <span class="readonly-text readonly-text--muted">
              {{ form.accountType === '直投' ? '直投' : (form.agency || '—') }}
            </span>
          </div>
          <el-select
            v-else
            v-model="form.agency"
            placeholder="请选择代理商"
            class="dark-select full-width"
            :disabled="form.accountType === '直投'"
            clearable
          >
            <el-option v-for="a in agencyOptions" :key="a" :label="a" :value="a" />
          </el-select>
        </div>
      </div>

      <!-- 投放平台 -->
      <div class="form-item">
        <div class="form-label">投放平台 <span class="required">*</span></div>
        <div class="form-control form-control--center">
          <div class="check-group">
            <el-checkbox v-model="platformAndroid" class="dark-checkbox">安卓</el-checkbox>
            <el-checkbox v-model="platformIos" class="dark-checkbox">iOS</el-checkbox>
          </div>
        </div>
      </div>

      <!-- 投放应用 -->
      <div class="form-item">
        <div class="form-label">投放应用</div>
        <div class="form-control">
          <div class="app-tags-input">
            <span v-for="app in form.apps" :key="app" class="app-tag">
              {{ app }}
              <button class="app-tag-remove" @click="removeApp(app)">×</button>
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

      <!-- 消耗上限 -->
      <div class="form-item">
        <div class="form-label">消耗上限</div>
        <div class="form-control">
          <el-input v-model="form.spendLimit" placeholder="0.00" class="dark-input spend-limit-input">
            <template #prefix><span class="input-affix">$</span></template>
            <template #suffix><span class="input-affix">/月</span></template>
          </el-input>
        </div>
      </div>

      <!-- 货币 -->
      <div class="form-item">
        <div class="form-label">货币 <span class="required">*</span></div>
        <div class="form-control">
          <div v-if="isEdit" class="readonly-field">
            <span class="readonly-text">{{ form.currency }}</span>
          </div>
          <el-form-item v-else prop="currency">
            <el-select v-model="form.currency" class="dark-select full-width">
              <el-option v-for="c in currencyOptions" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
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
            placeholder="请输入备注信息"
            class="dark-input dark-textarea"
          />
        </div>
      </div>

    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <ElButton round class="btn-cancel" @click="handleClose">取消</ElButton>
        <ElButton round class="btn-submit" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '保存' }}
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AdAccountItem, AccountFormModel } from '../types'
  import { appOptions, bcBmOptions, agencyOptions } from '../mock/data'

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
  const addingApp = ref('')

  const isEdit = computed(() => !!props.editData?.id)
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const currencyOptions = ['USD', 'CNY', 'EUR', 'GBP', 'JPY', 'HKD', 'SGD']

  const defaultForm = (): AccountFormModel => ({
    id: '',
    source: '',
    accountName: '',
    accountType: '直投',
    bcBm: '',
    agency: '',
    platform: ['安卓'],
    apps: [],
    spendLimit: '',
    currency: 'USD',
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

  const availableApps = computed(() => appOptions.filter((a) => !form.apps.includes(a)))

  const removeApp = (app: string) => {
    form.apps = form.apps.filter((a) => a !== app)
  }

  const handleAddApp = (app: string) => {
    if (app && !form.apps.includes(app)) form.apps.push(app)
    addingApp.value = ''
  }

  // 账户类型切换时清空代理商
  watch(() => form.accountType, (val) => {
    if (val === '直投') form.agency = ''
  })

  watch(
    () => props.editData,
    (val) => {
      if (val) {
        Object.assign(form, {
          ...defaultForm(),
          id: val.id,
          source: val.source,
          accountName: val.accountName,
          accountType: val.accountType,
          bcBm: val.bcBm,
          agency: val.agency,
          platform: [...val.platform],
          apps: [...val.apps],
          spendLimit: val.spendLimit ? String(val.spendLimit) : '',
          currency: val.currency || 'USD',
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
    id: [
      { required: true, message: '请输入账户ID', trigger: 'blur' },
      {
        pattern: /^ACC-[A-Za-z0-9]+$/,
        message: '账户ID格式不正确，请检查后重试',
        trigger: 'blur'
      }
    ],
    accountName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
    currency: [{ required: true, message: '请选择货币', trigger: 'change' }]
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
    Object.assign(form, defaultForm())
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
    padding-top: 3px;
    font-size: 11px;
    color: #ef4444;
  }
</style>

<style lang="scss" scoped>
  .acc-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 24px;
  }

  .form-item {
    display: flex;
    gap: 0;
    align-items: flex-start;

    &--textarea {
      align-items: flex-start;
    }
  }

  .form-label {
    box-sizing: border-box;
    flex-shrink: 0;
    width: 90px;
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

    &--center {
      display: flex;
      align-items: center;
      min-height: 36px;
    }

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

    &--muted { color: #475569; }
  }

  .readonly-type-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .type-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--direct { background: #3b82f6; }
    &--proxy { background: #a78bfa; }
  }

  // ─── 账户类型单选 ──────────────────────────────────────
  .dark-radio-group {
    display: flex;
    gap: 20px;
    align-items: center;

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

  // ─── 投放平台复选框 ────────────────────────────────────
  .check-group {
    display: flex;
    gap: 16px;
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

  // ─── 投放应用 tags ─────────────────────────────────────
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

  // ─── 消耗上限 ──────────────────────────────────────────
  .input-affix {
    font-size: 13px;
    color: #64748b;
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

    &:hover { filter: brightness(1.1); }
  }

  // ─── 深色通用输入样式 ──────────────────────────────────
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
      resize: vertical;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

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

    :deep(.el-select__wrapper.is-disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
</style>
