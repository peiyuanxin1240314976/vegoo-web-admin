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
        <ElInput v-model="form.mccAccount" :placeholder="mccPlaceholder" readonly disabled />
        <div class="conversion-dialog__hint">
          {{ $t('conversionManagement.hintAfterSelectPlatform') }}
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
      <ElFormItem :label="$t('conversionManagement.conversionType')" prop="conversionDisplayType">
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
      <ElFormItem :label="$t('conversionManagement.billingType')" prop="billingType">
        <ElInput :model-value="form.billingType || ''" readonly disabled />
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
  import type { AdPlatformType, ConversionMappingItem, ConversionMappingForm } from '../types'
  import {
    fetchConversionMetaDialogOptions,
    fetchConversionMetaDisplayTypeOptions
  } from '@/api/user-growth/conversion-management'
  import {
    MOCK_AD_PLATFORM_OPTIONS,
    MOCK_APP_OPTIONS_FOR_DIALOG,
    MOCK_CONVERSION_DISPLAY_TYPE_OPTIONS
  } from '../mock/data'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ConversionMappingDialog' })

  const { t } = useI18n()

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

  const adPlatformOptions = ref(MOCK_AD_PLATFORM_OPTIONS)
  const appOptionsForDialog = ref(MOCK_APP_OPTIONS_FOR_DIALOG)
  const conversionNameMetaOptions = ref<
    {
      conversionName: string
      conversionId: string
      billingType?: string
      platformConversionType?: string
    }[]
  >([])
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

  const mccPlaceholder = computed(() =>
    form.source ? '' : t('conversionManagement.hintAfterSelectPlatform')
  )

  const conversionIdDisplay = computed(
    () => form.conversionId || t('conversionManagement.conversionIdAutoFilled')
  )

  const defaultForm: ConversionMappingForm = {
    source: undefined,
    adPlatform: undefined,
    mccAccount: '',
    appId: '',
    conversionName: '',
    conversionId: '',
    systemDisplayName: 'IAP购买',
    conversionDisplayType: 'paid',
    billingType: '',
    status: 'enabled',
    remarks: ''
  }

  const form = reactive<ConversionMappingForm>({ ...defaultForm })

  const rules: FormRules = {
    source: [{ required: true, message: '请选择广告平台', trigger: 'change' }],
    mccAccount: [{ required: true, message: '请先选择广告平台以加载 MCC 账户', trigger: 'change' }],
    appId: [{ required: true, message: '请选择应用', trigger: 'change' }],
    conversionName: [{ required: true, message: '请选择或输入转化名称', trigger: 'change' }],
    systemDisplayName: [{ required: true, message: '请输入系统显示名称', trigger: 'blur' }]
  }

  async function loadDialogMeta(params: { source?: string; mccAccount?: string; appId?: string }) {
    try {
      const res = await fetchConversionMetaDialogOptions({
        source: params.source,
        adPlatform: params.source,
        mccAccount: params.mccAccount,
        appId: params.appId
      })
      adPlatformOptions.value = res.adPlatforms?.length ? res.adPlatforms : MOCK_AD_PLATFORM_OPTIONS
      appOptionsForDialog.value = res.apps?.length ? res.apps : MOCK_APP_OPTIONS_FOR_DIALOG
      conversionNameMetaOptions.value = res.conversions ?? []
      form.mccAccount = res.mccAccounts?.[0]?.value ?? params.mccAccount ?? ''
    } catch {
      ElMessage.error('加载弹窗选项失败')
    }
  }

  async function onSourceChange() {
    form.adPlatform = form.source
    await loadDialogMeta({ source: form.source })
  }

  function onConversionNameChange() {
    if (form.conversionName) {
      const found = conversionNameMetaOptions.value.find(
        (r) => r.conversionName === form.conversionName
      )
      form.conversionId = found?.conversionId ?? `auto-${Date.now()}`
      form.billingType = found?.billingType ?? ''
      form.platformConversionType = found?.platformConversionType
    } else {
      form.conversionId = ''
    }
  }

  function onStatusChange(val: string | number | boolean) {
    form.status = val === true || val === 'true' ? 'enabled' : 'unmapped'
  }

  /** 根据平台选项反查 source（编辑回显兜底） */
  function getAdPlatformByMcc(mccAccount: string): AdPlatformType | undefined {
    if (!mccAccount) return undefined
    return undefined
  }

  watch(
    () => [props.visible, props.rowData],
    () => {
      if (props.visible) {
        void fetchConversionMetaDisplayTypeOptions()
          .then((res) => {
            if (res.options?.length) conversionDisplayTypeMetaOptions.value = res.options
          })
          .catch(() => {})

        if (props.type === 'edit' && props.rowData) {
          const row = props.rowData as ConversionMappingForm
          const mcc = props.rowData.mccAccount ?? ''
          Object.assign(form, {
            source: row.source ?? row.adPlatform ?? getAdPlatformByMcc(mcc),
            adPlatform: row.source ?? row.adPlatform ?? getAdPlatformByMcc(mcc),
            mccAccount: props.rowData.mccAccount ?? '',
            appId: props.rowData.appId ?? '',
            conversionName: props.rowData.conversionName ?? '',
            conversionId: props.rowData.conversionId ?? '',
            systemDisplayName: props.rowData.systemDisplayName ?? '',
            conversionDisplayType: (row.conversionDisplayType ??
              'paid') as ConversionMappingForm['conversionDisplayType'],
            billingType: props.rowData.billingType ?? '',
            status: props.rowData.status ?? 'enabled',
            remarks: row.remarks ?? ''
          })
          void loadDialogMeta({
            source: form.source,
            mccAccount: form.mccAccount,
            appId: form.appId
          })
        } else {
          Object.assign(form, defaultForm)
          void loadDialogMeta({})
        }
      }
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
