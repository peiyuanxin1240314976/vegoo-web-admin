<template>
  <div class="conversion-data-filters">
    <div class="conversion-data-filters__inner">
      <div class="conversion-data-filters__row">
        <div class="conversion-data-filter-chip conversion-data-filter-chip--static">
          <ElIcon class="conversion-data-filter-chip__icon"><Calendar /></ElIcon>
          <span class="conversion-data-filter-chip__label">
            {{ $t('conversionManagement.dataFilterDateLabel') }}
          </span>
          <span class="conversion-data-filter-chip__value">{{ dateRangeChipText }}</span>
        </div>

        <ElDatePicker
          v-model="form.dateRange"
          type="daterange"
          unlink-panels
          range-separator="-"
          value-format="YYYY-MM-DD"
          :start-placeholder="$t('conversionManagement.dataFilterStart')"
          :end-placeholder="$t('conversionManagement.dataFilterEnd')"
          class="conversion-data-filters__date"
          @change="doSearch"
        />
        <ElSelect
          v-model="form.platform"
          :placeholder="$t('conversionManagement.filterPlatform')"
          clearable
          class="conversion-data-filter-select"
          :prefix-icon="Monitor"
          @change="doSearch"
        >
          <ElOption
            v-for="opt in platformOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElSelect
          v-model="form.appId"
          :placeholder="$t('conversionManagement.filterApp')"
          clearable
          class="conversion-data-filter-select"
          :prefix-icon="Grid"
          @change="doSearch"
        >
          <ElOption
            v-for="opt in appOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElSelect
          v-model="form.conversionType"
          :placeholder="$t('conversionManagement.filterConversionType')"
          clearable
          class="conversion-data-filter-select"
          :prefix-icon="TrendCharts"
          @change="doSearch"
        >
          <ElOption
            v-for="opt in conversionTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElButton
          type="primary"
          round
          class="conversion-data-filter-action-btn"
          @click="doSearch"
          v-ripple
        >
          {{ $t('conversionManagement.dataFilterSearch') }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, Grid, Monitor, TrendCharts } from '@element-plus/icons-vue'
  import type { ConversionDataFilterParams } from '../types'
  import {
    MOCK_DATA_TAB_APP_OPTIONS,
    MOCK_CONVERSION_TYPE_OPTIONS,
    MOCK_PLATFORM_OPTIONS
  } from '../mock/data'

  defineOptions({ name: 'ConversionDataFilters' })

  const props = defineProps<{
    filter: ConversionDataFilterParams
    platformOptions?: { label: string; value: string }[]
    appOptions?: { label: string; value: string }[]
    conversionTypeOptions?: { label: string; value: string }[]
  }>()

  const emit = defineEmits<{
    (e: 'search', payload: ConversionDataFilterParams): void
  }>()

  const platformOptions = computed(() => props.platformOptions ?? MOCK_PLATFORM_OPTIONS)
  const appOptions = computed(() => props.appOptions ?? MOCK_DATA_TAB_APP_OPTIONS)
  const conversionTypeOptions = computed(
    () => props.conversionTypeOptions ?? MOCK_CONVERSION_TYPE_OPTIONS
  )

  const form = reactive({
    dateRange: [props.filter?.startDate ?? '', props.filter?.endDate ?? ''] as [string, string],
    platform: String(props.filter?.platform ?? ''),
    appId: String(props.filter?.appId ?? ''),
    conversionType: String(props.filter?.conversionType ?? '')
  })

  const dateRangeChipText = computed(() => {
    const r = form.dateRange
    if (r?.[0] && r?.[1]) return `${r[0]} — ${r[1]}`
    return '—'
  })

  watch(
    () => props.filter,
    (v) => {
      if (!v) return
      form.dateRange = [v.startDate ?? '', v.endDate ?? ''] as [string, string]
      form.platform = v.platform ?? ''
      form.appId = v.appId ?? ''
      form.conversionType = v.conversionType ?? ''
    },
    { deep: true }
  )

  function doSearch() {
    const hasRange = Boolean(form.dateRange?.[0] && form.dateRange?.[1])
    emit('search', {
      ...(hasRange ? { startDate: form.dateRange![0], endDate: form.dateRange![1] } : {}),
      platform: form.platform,
      appId: form.appId,
      conversionType: form.conversionType
    })
  }
</script>

<style scoped lang="scss">
  .conversion-data-filters__inner {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 16px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 18px 20px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
  }

  .conversion-data-filters__row {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
  }

  .conversion-data-filter-chip {
    --cm-filter-accent: #10b981;

    display: inline-flex;
    gap: 7px;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    background: rgb(16 185 129 / 8%);
    border: 1px solid rgb(16 185 129 / 30%);
    border-radius: 9999px;
    box-shadow: 0 0 16px rgb(16 185 129 / 10%);
  }

  .conversion-data-filter-chip__icon {
    font-size: 16px;
    color: var(--cm-filter-accent);
    filter: drop-shadow(0 0 6px rgb(16 185 129 / 55%));
  }

  .conversion-data-filter-chip__label {
    max-width: 200px;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
  }

  .conversion-data-filter-chip__value {
    font-size: 13px;
    font-weight: 600;
    color: var(--cm-filter-accent);
    text-shadow: 0 0 10px rgb(16 185 129 / 50%);
  }

  .conversion-data-filters__date {
    flex: 0 1 200px;
    width: 200px;
    min-width: 170px;
    max-width: 100%;
  }

  /* Element Plus daterange root node also carries el-input__wrapper; force width to avoid being stretched */
  :deep(.conversion-data-filters__date.el-date-editor--daterange) {
    flex: 0 0 200px;
    width: 200px !important;
    min-width: 170px !important;
    max-width: 200px !important;
  }

  :deep(.conversion-data-filters__date .el-input__wrapper) {
    min-height: 40px;
    padding: 0 12px;
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.conversion-data-filters__date .el-input__wrapper.is-focus) {
    background: rgb(16 185 129 / 10%) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
  }

  :deep(.conversion-data-filters__date .el-range-separator) {
    color: var(--el-text-color-secondary);
  }

  :deep(.conversion-data-filters__date .el-range-input) {
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  .conversion-data-filter-select {
    width: 134px;
    min-width: 110px;
    max-width: 100%;
  }

  :deep(.conversion-data-filter-select) {
    --el-input-focus-border-color: #10b981;
    --el-border-color-hover: rgb(16 185 129 / 75%);
    --el-color-primary: #10b981;
    --el-border-color-focus: #10b981;
    --el-component-size: 40px;
  }

  :deep(.conversion-data-filter-select .el-input__wrapper) {
    padding: 0 12px;
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.conversion-data-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.conversion-data-filter-select .el-input__prefix-inner) {
    margin-right: 4px;
  }

  :deep(.conversion-data-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: #10b981;
    filter: drop-shadow(0 0 5px rgb(16 185 129 / 50%));
  }

  :deep(.conversion-data-filter-select .el-select__caret) {
    color: #10b981;
  }

  :deep(.conversion-data-filter-select .el-input__wrapper.is-focus) {
    background: rgb(16 185 129 / 10%) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
  }

  :deep(.conversion-data-filter-select .el-input__wrapper:hover) {
    border-color: rgb(16 185 129 / 60%);
    box-shadow: 0 0 12px rgb(16 185 129 / 18%);
  }

  .conversion-data-filter-action-btn {
    --el-button-size: 40px;

    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    background: linear-gradient(135deg, rgb(16 185 129 / 92%), rgb(5 150 105 / 88%));
    border: 1px solid rgb(16 185 129 / 55%);
    box-shadow:
      0 0 18px rgb(16 185 129 / 28%),
      inset 0 1px 0 rgb(255 255 255 / 12%);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease;

    &:hover {
      box-shadow:
        0 0 26px rgb(16 185 129 / 42%),
        inset 0 1px 0 rgb(255 255 255 / 18%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (width <= 768px) {
    .conversion-data-filters__inner {
      padding: 14px 16px;
    }

    .conversion-data-filter-chip {
      flex-wrap: wrap;
      width: 100%;
      white-space: normal;
    }
  }
</style>
