<template>
  <ElDialog
    :model-value="visible"
    :title="
      type === 'add'
        ? $t('conversionManagement.dialogAddTitle')
        : $t('conversionManagement.dialogEditTitle')
    "
    width="560px"
    top="8vh"
    destroy-on-close
    custom-class="conversion-dialog"
    @update:model-value="handleClose"
  >
    <ElAlert
      v-if="type === 'edit'"
      type="warning"
      :title="$t('conversionManagement.editWarning')"
      show-icon
      class="conversion-dialog__alert"
    />
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="conversion-dialog__form"
    >
      <ElFormItem :label="$t('conversionManagement.platform')" prop="platform" required>
        <ElSelect
          v-model="form.platform"
          :placeholder="$t('conversionManagement.selectTerminalPlatform')"
          :disabled="type === 'edit'"
          popper-class="conversion-dialog-select-dropdown"
          style="width: 100%"
          @change="onPlatformChange"
        >
          <ElOption
            v-for="opt in platformOptionsForDialog"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.adPlatform')" prop="source" required>
        <ElSelect
          v-model="form.source"
          :placeholder="$t('conversionManagement.selectAdPlatform')"
          :disabled="type === 'edit'"
          popper-class="conversion-dialog-select-dropdown"
          style="width: 100%"
          @change="onSourceChange"
        >
          <ElOption
            v-for="opt in adPlatformOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <div class="conversion-dialog__hint">
          {{ $t('conversionManagement.hintAfterSelectPlatform') }}
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.mccAccount')" prop="mccAccount" required>
        <ElInput
          v-model="form.mccAccount"
          :placeholder="$t('conversionManagement.mccAccountPlaceholder')"
          clearable
        />
        <div class="conversion-dialog__hint">
          {{ $t('conversionManagement.hintMccManual') }}
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.appId')" prop="appId" required>
        <ElSelect
          v-model="form.appId"
          :placeholder="$t('conversionManagement.selectApp')"
          :disabled="type === 'edit'"
          popper-class="conversion-dialog-select-dropdown"
          style="width: 100%"
        >
          <ElOption
            v-for="opt in appOptionsForDialog"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <div class="conversion-dialog__hint">
          {{ $t('conversionManagement.hintAppFromPlatform') }}
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.conversionName')" prop="conversionName" required>
        <ElSelect
          v-model="form.conversionName"
          :placeholder="$t('conversionManagement.selectOrEnterConversionName')"
          :disabled="type === 'edit'"
          popper-class="conversion-dialog-select-dropdown"
          filterable
          allow-create
          default-first-option
          style="width: 100%"
          @change="onConversionNameChange"
          @blur="onConversionNameBlur"
        >
          <ElOption
            v-for="opt in conversionNameOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <div class="conversion-dialog__hint">
          {{ $t('conversionManagement.hintConversionNameFromPlatform') }}
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.conversionId')" prop="conversionId">
        <ElInput :model-value="conversionIdDisplay" readonly disabled />
        <div class="conversion-dialog__hint">
          {{ $t('conversionManagement.hintConversionIdAuto') }}
        </div>
      </ElFormItem>
      <ElFormItem
        :label="$t('conversionManagement.systemDisplayName')"
        prop="systemDisplayName"
        required
      >
        <ElInput v-model="form.systemDisplayName" />
        <div class="conversion-dialog__hint">
          {{ $t('conversionManagement.hintSystemDisplayName') }}
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.conversionType')" prop="platformConversionType">
        <ElSelect
          v-model="form.platformConversionType"
          :placeholder="$t('conversionManagement.selectConversionType')"
          popper-class="conversion-dialog-select-dropdown"
          style="width: 100%"
        >
          <ElOption
            v-for="opt in platformConversionTypeSelectOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        :label="$t('conversionManagement.conversionDisplayType')"
        prop="conversionDisplayType"
      >
        <ElSelect
          v-model="form.conversionDisplayType"
          popper-class="conversion-dialog-select-dropdown"
          style="width: 100%"
        >
          <ElOption
            v-for="opt in conversionDisplayTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.billingType')" prop="billingType" required>
        <ElRadioGroup v-model="form.billingType" class="conversion-dialog__billing-radio">
          <ElRadio value="CPI">{{ $t('conversionManagement.billingCpi') }}</ElRadio>
          <ElRadio value="CPA">{{ $t('conversionManagement.billingCpa') }}</ElRadio>
          <ElRadio value="CPE">{{ $t('conversionManagement.billingCpe') }}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.status')" prop="status">
        <ElSwitch
          :model-value="form.status === 'enabled'"
          active-text=""
          inactive-text=""
          @update:model-value="onStatusChange"
        />
        <span class="conversion-dialog__status-text">
          {{
            form.status === 'enabled'
              ? $t('conversionManagement.statusEnabled')
              : $t('conversionManagement.statusUnmapped')
          }}
        </span>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.remarks')" prop="remarks">
        <ElInput
          v-model="form.remarks"
          type="textarea"
          :rows="3"
          :placeholder="$t('conversionManagement.remarksOptional')"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="conversion-dialog__footer">
        <ElButton plain @click="handleClose">{{ $t('conversionManagement.cancel') }}</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
          {{
            type === 'add'
              ? $t('conversionManagement.confirmAdd')
              : $t('conversionManagement.saveChanges')
          }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type {
    AdPlatformType,
    BillingType,
    ConversionDisplayType,
    ConversionMappingItem,
    ConversionMappingForm
  } from '../types'
  import {
    fetchConversionMappingsDetail,
    fetchConversionMetaDialogOptions,
    fetchConversionMetaDisplayTypeOptions
  } from '@/api/user-growth/conversion-management'
  import { useCockpitMetaFilterOptions } from '@/composables/use-cockpit-meta-filter'
  import {
    findConversionTypeOptionByValue,
    normalizeConversionTypeValueToOption,
    useConversionMetaConversionTypeOptions
  } from '@/composables/use-conversion-meta-conversion-type'
  import {
    MOCK_AD_PLATFORM_OPTIONS,
    MOCK_APP_OPTIONS_FOR_DIALOG,
    MOCK_CONVERSION_DISPLAY_TYPE_OPTIONS,
    MOCK_CONVERSION_TYPE_OPTIONS,
    MOCK_PLATFORM_OPTIONS
  } from '../mock/data'
  import { getAppNowMs } from '@/utils/app-now'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ConversionMappingDialog' })

  const { t } = useI18n()
  const { cockpitMeta, ensureCockpitMetaLoaded } = useCockpitMetaFilterOptions()
  const { optionsForLabelMatch, ensureLoaded: ensureConversionMetaConversionTypeLoaded } =
    useConversionMetaConversionTypeOptions()

  /** 公用 meta：终端平台 → `platformOptions`（弹窗内不含「全部」空值项） */
  const platformOptionsForDialog = computed(() => {
    const raw = cockpitMeta.value?.platformOptions
    const list = raw?.filter((o) => o.value !== '')
    return list?.length ? list : MOCK_PLATFORM_OPTIONS.filter((o) => o.value !== '')
  })

  /** 公用 meta：广告平台 → `sourceOptions`；应用 → `appOptions`（弹窗内不含「全部」空值项） */
  const adPlatformOptions = computed(() => {
    const raw = cockpitMeta.value?.sourceOptions
    const list = raw?.filter((o) => o.value !== '')
    return list?.length ? list : MOCK_AD_PLATFORM_OPTIONS
  })

  const appOptionsForDialog = computed(() => {
    const raw = cockpitMeta.value?.appOptions
    const list = raw?.filter((o) => o.value !== '')
    return list?.length ? list : MOCK_APP_OPTIONS_FOR_DIALOG
  })

  const props = withDefaults(
    defineProps<{
      visible: boolean
      type: 'add' | 'edit'
      rowData?: Partial<ConversionMappingItem> | null
    }>(),
    { rowData: null }
  )

  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void
    (e: 'submit', form: ConversionMappingForm): void
  }>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const conversionNameMetaOptions = ref<
    {
      conversionName: string
      conversionId: string
      billingType?: string
      platformConversionType?: string
    }[]
  >([])

  function normalizeBillingType(input: unknown): BillingType | undefined {
    if (input === 'CPA' || input === 'CPI' || input === 'CPE' || input === '') return input
    return undefined
  }

  function normalizeConversionOptions(input: unknown) {
    if (!Array.isArray(input)) return []
    return input
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const row = item as Record<string, unknown>
        const conversionName =
          typeof row.conversionName === 'string' ? row.conversionName : undefined
        const conversionId = typeof row.conversionId === 'string' ? row.conversionId : undefined
        if (!conversionName || !conversionId) return null
        return {
          conversionName,
          conversionId,
          billingType: normalizeBillingType(row.billingType),
          platformConversionType:
            typeof row.platformConversionType === 'string' ? row.platformConversionType : undefined
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }
  const platformConversionTypeMetaOptions = ref<{ label: string; value: string }[]>([])

  function applyPlatformConversionTypeFallback() {
    platformConversionTypeMetaOptions.value = MOCK_CONVERSION_TYPE_OPTIONS.filter(
      (o) => o.value !== ''
    )
  }

  async function loadPlatformConversionTypeOptions() {
    try {
      await ensureConversionMetaConversionTypeLoaded()
      const list = optionsForLabelMatch.value
      if (list.length) {
        platformConversionTypeMetaOptions.value = [...list]
      } else {
        applyPlatformConversionTypeFallback()
        ElMessage.warning(t('conversionManagement.loadConversionTypeOptionsEmpty'))
      }
    } catch {
      applyPlatformConversionTypeFallback()
      ElMessage.error(t('conversionManagement.loadConversionTypeOptionsFailed'))
    }
  }

  const platformConversionTypeSelectOptions = computed(() => {
    const base = platformConversionTypeMetaOptions.value
    const cur = form.platformConversionType
    if (typeof cur === 'string' && cur && !findConversionTypeOptionByValue(base, cur)) {
      return [{ label: cur, value: cur }, ...base]
    }
    return base
  })

  const conversionDisplayTypeMetaOptions = ref(
    MOCK_CONVERSION_DISPLAY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))
  )

  const conversionDisplayTypeKeyMap: Record<string, string> = {
    paid: 'conversionTypePaid',
    activation: 'conversionTypeActivation',
    behavior: 'conversionTypeBehavior',
    revenue: 'conversionTypeRevenue'
  }
  const conversionDisplayTypeOptions = computed(() =>
    conversionDisplayTypeMetaOptions.value.map((o) => ({
      label: t(`conversionManagement.${conversionDisplayTypeKeyMap[o.value] ?? o.value}`, o.label),
      value: o.value
    }))
  )

  const conversionNameOptions = computed(() =>
    conversionNameMetaOptions.value.map((o) => ({
      label: o.conversionName,
      value: o.conversionName
    }))
  )

  function billingTypeForForm(input: unknown): BillingType {
    const n = normalizeBillingType(input)
    return n === 'CPA' || n === 'CPI' || n === 'CPE' ? n : 'CPI'
  }

  const conversionIdDisplay = computed(
    () => form.conversionId || t('conversionManagement.conversionIdAutoFilled')
  )

  const defaultForm: ConversionMappingForm = {
    platform: '',
    source: undefined,
    adPlatform: undefined,
    mccAccount: '',
    appId: '',
    conversionName: '',
    conversionId: '',
    platformConversionType: '',
    systemDisplayName: 'IAP购买',
    conversionDisplayType: 'paid',
    billingType: 'CPI',
    status: 'enabled',
    remarks: ''
  }

  const form = reactive<ConversionMappingForm>({ ...defaultForm })

  const rules: FormRules = {
    platform: [{ required: true, message: '请选择终端平台', trigger: 'change' }],
    source: [{ required: true, message: '请选择广告平台', trigger: 'change' }],
    mccAccount: [{ required: true, message: '请输入 MCC 账户', trigger: 'blur' }],
    appId: [{ required: true, message: '请选择应用', trigger: 'change' }],
    conversionName: [{ required: true, message: '请选择或输入转化名称', trigger: 'change' }],
    systemDisplayName: [{ required: true, message: '请输入系统显示名称', trigger: 'blur' }],
    platformConversionType: [
      {
        validator: (_rule, value, callback) => {
          if (value === undefined || value === null || value === '') {
            callback(new Error(t('conversionManagement.selectConversionType')))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    billingType: [{ required: true, message: '请选择计费类型', trigger: 'change' }]
  }

  async function loadDialogMeta(params: {
    source?: string
    mccAccount?: string
    appId?: string
    platform?: string
  }) {
    try {
      const res = await fetchConversionMetaDialogOptions({
        source: params.source,
        adPlatform: params.source,
        mccAccount: params.mccAccount,
        appId: params.appId,
        platform: params.platform
      })
      conversionNameMetaOptions.value = normalizeConversionOptions(res.conversions)
    } catch {
      ElMessage.error('加载弹窗选项失败')
    }
  }

  async function onPlatformChange() {
    await loadDialogMeta({
      source: form.source,
      platform: form.platform,
      mccAccount: form.mccAccount,
      appId: form.appId
    })
  }

  async function onSourceChange() {
    form.adPlatform = form.source
    await loadDialogMeta({
      source: form.source,
      platform: form.platform,
      mccAccount: form.mccAccount,
      appId: form.appId
    })
  }

  function onConversionNameChange() {
    const raw = form.conversionName
    const name = typeof raw === 'string' ? raw.trim() : ''
    if (!name) {
      form.conversionId = ''
      form.platformConversionType = ''
      return
    }
    const found = conversionNameMetaOptions.value.find((r) => r.conversionName === name)
    if (found) {
      form.conversionId = found.conversionId
      const bt = normalizeBillingType(found.billingType)
      if (bt) form.billingType = billingTypeForForm(bt)
      form.platformConversionType =
        typeof found.platformConversionType === 'string' ? found.platformConversionType : ''
    } else {
      form.conversionId = ''
      form.platformConversionType = ''
    }
    syncFormPlatformConversionTypeFromOptions()
  }

  /** 手动输入的转化名称在失焦后生成转化 ID（时间戳）；下拉选中项在 change 时已带入平台 ID */
  function onConversionNameBlur() {
    if (props.type === 'edit') return
    const raw = form.conversionName
    const name = typeof raw === 'string' ? raw.trim() : ''
    if (!name) {
      form.conversionId = ''
      form.platformConversionType = ''
      return
    }
    const found = conversionNameMetaOptions.value.find((r) => r.conversionName === name)
    if (found) {
      form.conversionId = found.conversionId
      const bt = normalizeBillingType(found.billingType)
      if (bt) form.billingType = billingTypeForForm(bt)
      form.platformConversionType =
        typeof found.platformConversionType === 'string' ? found.platformConversionType : ''
    } else if (!form.conversionId) {
      form.conversionId = String(getAppNowMs())
    }
    syncFormPlatformConversionTypeFromOptions()
  }

  function onStatusChange(val: string | number | boolean) {
    form.status = val === true || val === 'true' ? 'enabled' : 'unmapped'
  }

  /** 根据平台选项反查 source（编辑回显兜底） */
  function getAdPlatformByMcc(mccAccount: string): AdPlatformType | undefined {
    if (!mccAccount) return undefined
    return undefined
  }

  /** 与 meta `value` 一致的广告平台转化类型取值（列表 `conversionDisplayType` 可能仅存此类 value） */
  const META_PLATFORM_CONVERSION_VALUES = new Set([
    'PHONE_CALL_LEAD',
    'DOWNLOAD',
    'PURCHASE',
    'ADD_TO_CART',
    'PAGE_VIEW',
    'BEGIN_CHECKOUT'
  ])

  function pickFormConversionDisplayCategory(
    m: Partial<ConversionMappingItem>
  ): ConversionDisplayType {
    const x = m.conversionDisplayType
    if (x === 'paid' || x === 'activation' || x === 'behavior' || x === 'revenue') {
      return x
    }
    return 'paid'
  }

  function pickPlatformConversionValue(m: Partial<ConversionMappingItem>): string {
    if (typeof m.platformConversionType === 'string' && m.platformConversionType) {
      return m.platformConversionType
    }
    const d = m.conversionDisplayType
    if (typeof d === 'string' && d) {
      if ([...META_PLATFORM_CONVERSION_VALUES].some((x) => x.toLowerCase() === d.toLowerCase())) {
        return d
      }
    }
    return ''
  }

  function syncFormPlatformConversionTypeFromOptions() {
    const list = platformConversionTypeMetaOptions.value
    form.platformConversionType = normalizeConversionTypeValueToOption(
      list,
      form.platformConversionType
    )
  }

  /** 编辑回显：详情覆盖列表；列表 `conversionDisplayType` 可能为 meta value，详情同字段为展示分类 paid 等 */
  async function applyEditFormFromRow(rowData: Partial<ConversionMappingItem>) {
    let merged: Partial<ConversionMappingItem> = { ...rowData }
    if (rowData.id) {
      try {
        const detail = await fetchConversionMappingsDetail({ id: String(rowData.id) })
        if (detail && typeof detail === 'object') {
          merged = { ...rowData, ...detail }
        }
      } catch {
        // 保留列表行
      }
    }
    const row = merged as ConversionMappingForm
    const mcc = merged.mccAccount ?? ''
    Object.assign(form, {
      platform: merged.platform ?? '',
      source: row.source ?? row.adPlatform ?? getAdPlatformByMcc(mcc),
      adPlatform: row.source ?? row.adPlatform ?? getAdPlatformByMcc(mcc),
      mccAccount: merged.mccAccount ?? '',
      appId: merged.appId ?? '',
      conversionName: merged.conversionName ?? '',
      conversionId: merged.conversionId ?? '',
      platformConversionType: pickPlatformConversionValue(merged),
      systemDisplayName: merged.systemDisplayName ?? '',
      conversionDisplayType: pickFormConversionDisplayCategory(merged),
      billingType: billingTypeForForm(merged.billingType),
      status: merged.status ?? 'enabled',
      remarks: row.remarks ?? ''
    })
    void loadDialogMeta({
      source: form.source,
      platform: form.platform,
      mccAccount: form.mccAccount,
      appId: form.appId
    })
  }

  watch(
    () => [props.visible, props.type, props.rowData] as const,
    async () => {
      if (!props.visible) return
      void ensureCockpitMetaLoaded()
      await loadPlatformConversionTypeOptions()
      void fetchConversionMetaDisplayTypeOptions()
        .then((res) => {
          if (res.options?.length) conversionDisplayTypeMetaOptions.value = res.options
        })
        .catch(() => {})

      if (props.type === 'edit' && props.rowData) {
        await applyEditFormFromRow(props.rowData)
      } else {
        Object.assign(form, defaultForm)
        void loadDialogMeta({})
      }
      syncFormPlatformConversionTypeFromOptions()
    },
    { immediate: true }
  )

  function handleClose() {
    emit('update:visible', false)
  }

  async function handleSubmit() {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) {
        submitLoading.value = true
        emit('submit', { ...form, adPlatform: form.source })
        submitLoading.value = false
        handleClose()
      }
    })
  }
</script>

<style scoped lang="scss">
  .conversion-dialog__alert {
    margin-bottom: 16px;
  }

  .conversion-dialog__form {
    padding-right: 8px;

    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  .conversion-dialog__hint {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }

  .conversion-dialog__status-text {
    margin-left: 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  .conversion-dialog__billing-radio {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
  }
</style>

<style lang="scss">
  /* 使用表单类名保证弹窗内样式生效（Dialog 可能未挂 custom-class） */
  .conversion-dialog__form {
    .el-switch.is-checked .el-switch__core {
      background-color: var(--el-color-success) !important;
      border-color: var(--el-color-success) !important;
    }

    .el-select .el-select__wrapper.is-focused {
      box-shadow: 0 0 0 1px var(--el-color-success) inset !important;
    }

    .el-select .el-select__wrapper.is-hovering:not(.is-focused) {
      box-shadow: 0 0 0 1px var(--el-color-success) inset !important;
    }

    .el-input:not(.is-disabled) .el-input__wrapper:hover {
      box-shadow: 0 0 0 1px var(--el-color-success) inset !important;
    }

    .el-input:not(.is-disabled) .el-input__wrapper.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-success) inset !important;
    }

    .el-textarea:not(.is-disabled) .el-textarea__inner:hover {
      box-shadow: 0 0 0 1px var(--el-color-success) inset !important;
    }

    .el-textarea:not(.is-disabled) .el-textarea__inner:focus {
      box-shadow: 0 0 0 1px var(--el-color-success) inset !important;
    }

    .el-radio__input.is-checked + .el-radio__label {
      color: var(--el-color-success);
    }

    .el-radio__input.is-checked .el-radio__inner {
      background: var(--el-color-success);
      border-color: var(--el-color-success);
    }
  }

  .conversion-dialog__footer {
    .el-button--primary {
      --el-button-bg-color: var(--el-color-success-light-3);
      --el-button-border-color: var(--el-color-success-light-3);
      --el-button-text-color: var(--el-color-white);
      --el-button-hover-bg-color: var(--el-color-success);
      --el-button-hover-border-color: var(--el-color-success);
      --el-button-hover-text-color: var(--el-color-white);
      --el-button-active-bg-color: var(--el-color-success-dark-2);
      --el-button-active-border-color: var(--el-color-success-dark-2);
      --el-button-active-text-color: var(--el-color-white);

      color: var(--el-color-white) !important;
      background-color: var(--el-color-success-light-3) !important;
      border-color: var(--el-color-success-light-3) !important;
    }

    .el-button--primary:hover,
    .el-button--primary:focus {
      color: var(--el-color-white) !important;
      background-color: var(--el-color-success) !important;
      border-color: var(--el-color-success) !important;
    }

    .el-button--primary:active {
      color: var(--el-color-white) !important;
      background-color: var(--el-color-success-dark-2) !important;
      border-color: var(--el-color-success-dark-2) !important;
    }

    .el-button.is-plain {
      --el-button-border-color: var(--el-color-success);
      --el-button-text-color: var(--el-color-success);
    }

    .el-button.is-plain:hover,
    .el-button.is-plain:focus {
      --el-button-hover-border-color: var(--el-color-success);
      --el-button-hover-text-color: var(--el-color-success);
      --el-button-hover-bg-color: var(--el-color-success-light-9);
    }
  }

  .conversion-dialog {
    .el-dialog__header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .el-dialog__body {
      max-height: 70vh;
      padding: 20px;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 12px 20px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .conversion-dialog-select-dropdown {
    .el-select-dropdown__item.is-selected {
      color: var(--el-color-success) !important;
      background-color: var(--el-color-success-light-9) !important;
    }

    .el-select-dropdown__item.is-selected:hover,
    .el-select-dropdown__item.is-hovering {
      color: var(--el-color-success) !important;
      background-color: var(--el-color-success-light-9) !important;
    }
  }

  html.dark .conversion-dialog {
    .el-dialog__header,
    .el-dialog__body,
    .el-dialog__footer {
      border-color: var(--el-border-color);
    }

    .el-dialog__body {
      background: var(--el-bg-color);
    }
  }
</style>
