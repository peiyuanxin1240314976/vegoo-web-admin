<template>
  <div class="cockpit-date-range">
    <ElRadioGroup
      :model-value="modelValue"
      size="small"
      class="date-range-tabs"
      @update:model-value="onModelValueChange"
    >
      <ElRadioButton label="today">今日</ElRadioButton>
      <ElRadioButton label="yesterday">昨日</ElRadioButton>
      <ElRadioButton label="week">本周</ElRadioButton>
      <ElRadioButton label="month">本月</ElRadioButton>
    </ElRadioGroup>
  </div>
</template>

<script setup lang="ts">
  import type { CockpitDateRange } from '../types'

  defineOptions({ name: 'CockpitDateRangeTabs' })

  withDefaults(defineProps<{ modelValue?: CockpitDateRange }>(), { modelValue: 'today' })
  const emit = defineEmits<{ (e: 'update:modelValue', value: CockpitDateRange): void }>()

  const onModelValueChange = (v: string | number | boolean | undefined) => {
    emit('update:modelValue', (v ?? 'today') as CockpitDateRange)
  }
</script>

<style scoped lang="scss">
  .cockpit-date-range {
    .date-range-tabs {
      :deep(.el-radio-button__inner) {
        margin-right: 4px;
        border-radius: 4px;
      }

      /* 未选中：深灰背景 */
      :deep(.el-radio-button:not(.is-active) .el-radio-button__inner) {
        color: var(--el-text-color-primary);
        background: var(--el-fill-color-dark);
        border-color: var(--el-fill-color-dark);
      }

      /* 选中：深蓝背景 */
      :deep(.el-radio-button.is-active .el-radio-button__inner) {
        color: #fff;
        background: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }
    }
  }
</style>
