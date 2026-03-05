<template>
  <div class="monetization-filters">
    <span class="filter-label">日期范围</span>
    <ElSelect
      v-model="dateRangeModel"
      size="small"
      class="filter-select"
      placeholder="最近30天"
      @change="onDateRangeChange"
    >
      <ElOption label="今日" value="today" />
      <ElOption label="昨日" value="yesterday" />
      <ElOption label="本周" value="week" />
      <ElOption label="最近30天" value="month" />
    </ElSelect>
    <span class="filter-label">App选择：</span>
    <ElSelect v-model="appModel" size="small" class="filter-select" placeholder="全部">
      <ElOption label="全部" value="" />
      <ElOption label="Weather8" value="weather8" />
    </ElSelect>
    <span class="filter-label">国家：</span>
    <ElSelect v-model="countryModel" size="small" class="filter-select" placeholder="全部国家">
      <ElOption label="全部国家" value="" />
      <ElOption label="US 美国" value="US" />
    </ElSelect>
    <span class="filter-label">广告平台筛选：</span>
    <ElSelect v-model="platformModel" size="small" class="filter-select" placeholder="全部平台">
      <ElOption label="全部平台" value="" />
    </ElSelect>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { MonetizationDateRange } from '../types'

  defineOptions({ name: 'MonetizationDateRangeFilters' })

  const props = withDefaults(defineProps<{ modelValue?: MonetizationDateRange }>(), {
    modelValue: 'month'
  })
  const emit = defineEmits<{
    (e: 'update:modelValue', value: MonetizationDateRange): void
    (
      e: 'filterChange',
      payload: { dateRange: MonetizationDateRange; app: string; country: string; platform: string }
    ): void
  }>()

  const dateRangeModel = computed({
    get: () => props.modelValue,
    set: (v: MonetizationDateRange) => emit('update:modelValue', v)
  })
  const appModel = ref('')
  const countryModel = ref('')
  const platformModel = ref('')

  function onDateRangeChange() {
    emit('filterChange', {
      dateRange: dateRangeModel.value,
      app: appModel.value,
      country: countryModel.value,
      platform: platformModel.value
    })
  }
</script>

<style scoped lang="scss">
  .monetization-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
    margin-bottom: 16px;

    .filter-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .filter-select {
      width: 120px;
    }
  }
</style>
