<template>
  <ElDialog
    :model-value="visible"
    :title="
      type === 'add'
        ? $t('conversionManagement.dialogAddTitle')
        : $t('conversionManagement.dialogEditTitle')
    "
    width="560px"
    destroy-on-close
    @update:model-value="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="conversion-dialog__form"
    >
      <ElFormItem :label="$t('conversionManagement.platform')" prop="platform">
        <ElSelect
          v-model="form.platform"
          :placeholder="$t('conversionManagement.filterPlatform')"
          style="width: 100%"
        >
          <ElOption :label="$t('conversionManagement.android')" value="android" />
          <ElOption :label="$t('conversionManagement.ios')" value="ios" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.appPackage')" prop="appPackage">
        <ElInput v-model="form.appPackage" :placeholder="$t('conversionManagement.appPackage')" />
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.conversionName')" prop="conversionName">
        <ElInput v-model="form.conversionName" type="textarea" :rows="2" />
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.conversionId')" prop="conversionId">
        <ElInput v-model="form.conversionId" />
      </ElFormItem>
      <ElFormItem
        :label="$t('conversionManagement.platformConversionType')"
        prop="platformConversionType"
      >
        <ElSelect v-model="form.platformConversionType" style="width: 100%">
          <ElOption
            v-for="opt in conversionTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.systemDisplayName')" prop="systemDisplayName">
        <ElInput v-model="form.systemDisplayName" />
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.billingType')" prop="billingType">
        <ElSelect v-model="form.billingType" clearable style="width: 100%">
          <ElOption label="CPA" value="CPA" />
          <ElOption label="CPI" value="CPI" />
          <ElOption label="CPE" value="CPE" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('conversionManagement.status')" prop="status">
        <ElSelect v-model="form.status" style="width: 100%">
          <ElOption :label="$t('conversionManagement.statusEnabled')" value="enabled" />
          <ElOption :label="$t('conversionManagement.statusDuplicate')" value="duplicate" />
          <ElOption :label="$t('conversionManagement.statusUnmapped')" value="unmapped" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">{{ $t('conversionManagement.cancel') }}</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ $t('conversionManagement.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ConversionMappingItem, ConversionMappingForm } from '../types'
  import { MOCK_CONVERSION_TYPE_OPTIONS } from '../mock/data'

  defineOptions({ name: 'ConversionMappingDialog' })

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

  const conversionTypeOptions = MOCK_CONVERSION_TYPE_OPTIONS.filter((o) => o.value)

  const defaultForm: ConversionMappingForm = {
    platform: 'android',
    appPackage: '',
    conversionName: '',
    conversionId: '',
    platformConversionType: '',
    systemDisplayName: '',
    billingType: '',
    status: 'enabled'
  }

  const form = reactive<ConversionMappingForm>({ ...defaultForm })

  const rules: FormRules = {
    platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
    appPackage: [{ required: true, message: '请输入应用包名', trigger: 'blur' }],
    conversionName: [{ required: true, message: '请输入转化名称', trigger: 'blur' }],
    conversionId: [{ required: true, message: '请输入转化 ID', trigger: 'blur' }],
    platformConversionType: [
      {
        required: true,
        message: '请选择广告平台转化类型',
        trigger: 'change'
      }
    ],
    systemDisplayName: [
      {
        required: true,
        message: '请输入系统显示名称',
        trigger: 'blur'
      }
    ],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  watch(
    () => [props.visible, props.rowData],
    () => {
      if (props.visible) {
        if (props.type === 'edit' && props.rowData) {
          Object.assign(form, {
            platform: props.rowData.platform,
            appPackage: props.rowData.appPackage,
            conversionName: props.rowData.conversionName,
            conversionId: props.rowData.conversionId,
            platformConversionType: props.rowData.platformConversionType,
            systemDisplayName: props.rowData.systemDisplayName,
            billingType: props.rowData.billingType ?? '',
            status: props.rowData.status ?? 'enabled'
          })
        } else {
          Object.assign(form, defaultForm)
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
        emit('submit', { ...form })
        submitLoading.value = false
        handleClose()
      }
    })
  }
</script>

<style scoped lang="scss">
  .conversion-dialog__form {
    padding-right: 8px;
  }
</style>
