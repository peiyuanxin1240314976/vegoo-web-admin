<template>
  <ElDialog
    :model-value="visible"
    title="手动输入汇率"
    width="440px"
    :close-on-click-modal="false"
    header-class="cm-er-manual-hd"
    body-class="cm-er-manual-bd"
    footer-class="cm-er-manual-ft"
    @update:model-value="emit('update:visible', $event)"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="pair-row">
        <ElFormItem label="货币对" prop="baseCurrency" class="pair-item">
          <ElSelect v-model="form.baseCurrency" placeholder="来源货币">
            <ElOption v-for="c in currencyList" :key="c" :label="c" :value="c" />
          </ElSelect>
        </ElFormItem>
        <span class="pair-sep">/</span>
        <ElFormItem label=" " prop="quoteCurrency" class="pair-item">
          <ElSelect v-model="form.quoteCurrency" placeholder="目标货币">
            <ElOption v-for="c in currencyList" :key="c" :label="c" :value="c" />
          </ElSelect>
        </ElFormItem>
      </div>

      <ElFormItem label="汇率值" prop="rate">
        <ElInput
          v-model.number="form.rate"
          placeholder="请输入汇率值"
          type="number"
          step="0.0001"
        />
      </ElFormItem>

      <div class="date-row">
        <ElFormItem label="生效日期" prop="effectiveDate" class="date-item">
          <AppDatePicker
            v-model="form.effectiveDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="生效时间" prop="effectiveTime" class="date-item">
          <ElTimePicker
            v-model="form.effectiveTime"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
        </ElFormItem>
      </div>

      <ElFormItem label="覆盖自动同步" class="toggle-item">
        <div class="toggle-row">
          <ElSwitch v-model="form.overrideAuto" active-color="#2dd4bf" />
          <span class="toggle-tip">启用后会优先使用手动输入的汇率值</span>
        </div>
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="2" placeholder="可选备注信息" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton round @click="emit('update:visible', false)">取消</ElButton>
      <ElButton round type="primary" :loading="saving" @click="handleSave">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ManualRateFormModel, OptionItem } from '../types'

  defineOptions({ name: 'RateManualDialog' })

  interface Props {
    visible: boolean
    currencyOptions?: OptionItem[]
  }

  const props = withDefaults(defineProps<Props>(), {
    currencyOptions: () => []
  })

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [payload: ManualRateFormModel]
  }>()

  const currencyValues = computed(() => props.currencyOptions.map((item) => item.value))
  const currencyList = computed(() =>
    currencyValues.value.length > 0 ? currencyValues.value : ['USD', 'EUR', 'GBP', 'JPY']
  )

  const formRef = ref<FormInstance>()
  const saving = ref(false)

  const form = reactive<ManualRateFormModel>({
    baseCurrency: '',
    quoteCurrency: '',
    rate: 0,
    effectiveDate: '',
    effectiveTime: '00:00',
    overrideAuto: false,
    remark: ''
  })

  const rules: FormRules = {
    baseCurrency: [{ required: true, message: '请选择来源货币', trigger: 'change' }],
    quoteCurrency: [{ required: true, message: '请选择目标货币', trigger: 'change' }],
    rate: [
      { required: true, message: '请输入汇率值', trigger: 'blur' },
      {
        validator: (_rule: unknown, value: number, callback: (e?: Error) => void) => {
          if (!value || value <= 0) {
            callback(new Error('汇率值必须大于0'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
  }

  watch(
    () => form.baseCurrency,
    () => {
      if (form.baseCurrency === form.quoteCurrency) {
        form.quoteCurrency = ''
      }
    }
  )

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return
      const base = currencyList.value[0] ?? 'USD'
      const quote = currencyList.value.find((item) => item !== base) ?? base
      form.baseCurrency = base
      form.quoteCurrency = quote
    },
    { immediate: true }
  )

  const handleSave = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    saving.value = true
    await new Promise((r) => setTimeout(r, 600))
    saving.value = false
    emit('success', { ...form })
    emit('update:visible', false)
    ElMessage.success('汇率保存成功')
  }
</script>

<style lang="scss" scoped>
  .pair-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }

  .pair-item {
    flex: 1;
  }

  .pair-sep {
    flex-shrink: 0;
    margin-bottom: 4px;
    font-size: 18px;
    font-weight: 600;
    line-height: 32px;
    color: #64748b;
  }

  .date-row {
    display: flex;
    gap: 12px;
  }

  .date-item {
    flex: 1;
  }

  .toggle-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .toggle-tip {
    font-size: 12px;
    color: #64748b;
  }
</style>

<style lang="scss">
  :has(.cm-er-manual-bd) {
    --cm-dialog-bg: #111827;
    --cm-dialog-bg-inner: #1a2540;
    --cm-dialog-border: rgb(255 255 255 / 8%);

    .cm-er-manual-hd {
      padding: 18px 20px 14px;
      font-size: 15px;
      font-weight: 600;
      color: #e2e8f0;
      background: var(--cm-dialog-bg) !important;
      border-bottom: 1px solid var(--cm-dialog-border);

      .el-dialog__title {
        color: #e2e8f0;
      }

      .el-dialog__headerbtn .el-dialog__close {
        color: #64748b;

        &:hover {
          color: #e2e8f0;
        }
      }
    }

    .cm-er-manual-bd {
      padding: 20px;
      background: var(--cm-dialog-bg) !important;

      .el-form-item__label {
        font-size: 12px;
        color: #94a3b8;
      }

      .el-input__wrapper,
      .el-select__wrapper,
      .el-textarea__inner {
        color: #e2e8f0;
        background: var(--cm-dialog-bg-inner) !important;
        border: 1px solid var(--cm-dialog-border) !important;
        box-shadow: none !important;

        &:hover,
        &:focus-within {
          border-color: #2dd4bf !important;
        }
      }

      .el-input__inner,
      .el-textarea__inner {
        color: #e2e8f0;
      }

      .el-select-dropdown {
        background: #1a2540 !important;
        border-color: var(--cm-dialog-border) !important;
      }
    }

    .cm-er-manual-ft {
      padding: 12px 20px 18px;
      background: var(--cm-dialog-bg) !important;
      border-top: 1px solid var(--cm-dialog-border);
    }
  }
</style>
