<template>
  <div class="ad-performance-filters">
    <div class="ad-performance-filters__left">
      <div class="ad-performance-filter-chip ad-performance-filter-chip--static">
        <ElIcon class="ad-performance-filter-chip__icon"><Calendar /></ElIcon>
        <span class="ad-performance-filter-chip__label">
          {{ tr('adPerformance.filterDate', '日期') }}
        </span>
        <span class="ad-performance-filter-chip__value">{{ dateRangeLabel }}</span>
      </div>

      <ElSelect
        :model-value="filter.app"
        :placeholder="tr('adPerformance.filterApp', '应用')"
        class="ad-performance-filter-select"
        :prefix-icon="Grid"
        @update:model-value="onAppChange"
      >
        <ElOption :label="appAllLabel" value="" />
        <ElOption
          v-for="opt in appOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>

      <ElSelect
        :model-value="filter.adPlatform"
        :placeholder="tr('adPerformance.filterAdPlatform', '广告平台')"
        class="ad-performance-filter-select"
        :prefix-icon="Promotion"
        @update:model-value="onAdPlatformChange"
      >
        <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
        <ElOption
          v-for="opt in adPlatformOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>

      <ElSelect
        :model-value="filter.account"
        :placeholder="tr('adPerformance.filterAccount', '账户')"
        class="ad-performance-filter-select"
        :prefix-icon="User"
        @update:model-value="onAccountChange"
      >
        <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
      </ElSelect>

      <ElSelect
        :model-value="filter.country"
        :placeholder="tr('adPerformance.filterCountry', '国家')"
        class="ad-performance-filter-select"
        :prefix-icon="Flag"
        @update:model-value="onCountryChange"
      >
        <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
      </ElSelect>

      <ElButton
        round
        class="ad-performance-filter-action-btn ad-performance-filter-action-btn--export"
        @click="$emit('export')"
      >
        {{ tr('adPerformance.exportReport', '导出报表') }}
      </ElButton>
      <ElButton
        round
        class="ad-performance-filter-action-btn ad-performance-filter-action-btn--refresh"
        :icon="RefreshRight"
        @click="$emit('refresh')"
      />
    </div>

    <div
      class="ad-performance-date-slider"
      :style="dateSliderStyle"
      role="tablist"
      aria-label="日期筛选"
    >
      <div class="ad-performance-date-slider__thumb" aria-hidden="true" />
      <button
        v-for="opt in dateRangeOptions"
        :key="opt.value"
        type="button"
        class="ad-performance-date-slider__item"
        :class="{ 'is-active': opt.value === filter.dateRange }"
        role="tab"
        :aria-selected="opt.value === filter.dateRange"
        @click="onDateChange(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, Flag, Grid, Promotion, RefreshRight, User } from '@element-plus/icons-vue'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { AdPerformanceFilter } from '../types'

  defineOptions({ name: 'AdPerformanceFilters' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const props = withDefaults(
    defineProps<{
      filter: AdPerformanceFilter
      appCount?: number
    }>(),
    { appCount: 0 }
  )

  const emit = defineEmits<{
    (e: 'search', filter: AdPerformanceFilter): void
    (e: 'export'): void
    (e: 'refresh'): void
  }>()

  function emitSearch(partial: Partial<AdPerformanceFilter>) {
    emit('search', { ...props.filter, ...partial })
  }

  function onDateChange(v: AdPerformanceFilter['dateRange']) {
    emitSearch({ dateRange: v })
  }

  function onAppChange(v: string) {
    emitSearch({ app: v ?? '' })
  }

  function onAdPlatformChange(v: string) {
    emitSearch({ adPlatform: v ?? '' })
  }

  function onAccountChange(v: string) {
    emitSearch({ account: v ?? '' })
  }

  function onCountryChange(v: string) {
    emitSearch({ country: v ?? '' })
  }

  const dateRangeOptions = [
    { value: 'today' as const, label: '今日' },
    { value: 'yesterday' as const, label: '昨日' },
    { value: 'last7d' as const, label: '近7天' },
    { value: 'month' as const, label: '本月' }
  ]

  const dateRangeLabel = computed(() => {
    const hit = dateRangeOptions.find((item) => item.value === props.filter.dateRange)
    return hit?.label ?? '-'
  })

  const activeDateIndex = computed(() => {
    const idx = dateRangeOptions.findIndex((item) => item.value === props.filter.dateRange)
    return idx >= 0 ? idx : 0
  })

  const dateSliderStyle = computed(() => {
    return {
      '--date-slider-count': String(dateRangeOptions.length),
      '--date-slider-index': String(activeDateIndex.value)
    } as Record<string, string>
  })

  const appAllLabel = computed(() => (props.appCount ? `全部(${props.appCount})` : '全部'))

  const appOptions = computed(() => [
    { value: 'Weather5', label: 'Weather5' },
    { value: 'BloodSugar2', label: 'BloodSugar2' },
    { value: 'PhoneTracker', label: 'PhoneTracker' },
    { value: 'FaceMe', label: 'FaceMe' },
    { value: 'HealthTracker', label: 'HealthTracker' }
  ])

  const adPlatformOptions = [
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'meta', label: 'Meta' },
    { value: 'kwai', label: 'Kwai' },
    { value: 'mintegral', label: 'Mintegral' }
  ]
</script>

<style scoped lang="scss">
  .ad-performance-filters {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  .ad-performance-filters__left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-filter-chip {
    --ad-performance-filter-accent: var(--art-success);

    display: inline-flex;
    gap: 6px;
    align-items: center;
    height: 30px;
    padding: 0 8px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 9999px;
  }

  .ad-performance-filter-chip__icon {
    font-size: 14px;
    color: var(--ad-performance-filter-accent);
  }

  .ad-performance-filter-chip__label {
    color: var(--el-text-color-secondary);
  }

  .ad-performance-filter-chip__value {
    color: var(--ad-performance-filter-accent);
  }

  .ad-performance-filter-select {
    width: 116px;
    min-width: 100px;
    max-width: 100%;
  }

  :deep(.ad-performance-filter-select) {
    --el-input-focus-border-color: var(--art-success);
    --el-border-color-hover: rgb(16 185 129 / 75%);
    --el-color-primary: var(--art-success);
    --el-border-color-focus: var(--art-success);
  }

  :deep(.ad-performance-filter-select .el-input__wrapper) {
    padding: 0 8px;
    background: var(--default-box-color);
    border-radius: 9999px;
    box-shadow: none;
  }

  :deep(.ad-performance-filter-select .el-input__inner) {
    font-size: 12px;
    text-overflow: ellipsis;
  }

  :deep(.ad-performance-filter-select .el-input__prefix-inner) {
    margin-right: 2px;
  }

  :deep(.ad-performance-filter-select .el-input__prefix-inner svg) {
    width: 14px;
    height: 14px;
    color: var(--art-success);
  }

  :deep(.ad-performance-filter-select .el-select__caret) {
    color: var(--art-success);
  }

  :deep(.ad-performance-filter-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--art-success) inset !important;
  }

  :deep(.ad-performance-filter-select .el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px rgb(16 185 129 / 45%) inset;
  }

  .ad-performance-filter-action-btn {
    --el-button-bg-color: transparent;
    --el-button-text-color: var(--art-success);
    --el-button-border-color: rgb(16 185 129 / 50%);
    --el-button-hover-text-color: var(--art-success);
    --el-button-hover-border-color: var(--art-success);
    --el-button-hover-bg-color: rgb(16 185 129 / 12%);
    --el-button-active-text-color: var(--art-success);
    --el-button-active-border-color: var(--art-success);
    --el-button-active-bg-color: rgb(16 185 129 / 18%);
  }

  :deep(.ad-performance-filter-action-btn .el-icon) {
    color: var(--art-success);
  }

  .ad-performance-filter-action-btn:focus-visible {
    box-shadow: 0 0 0 2px rgb(16 185 129 / 35%);
  }

  .ad-performance-filters__date-tabs {
    flex: none;
  }

  .ad-performance-date-slider {
    --date-slider-height: 30px;
    --date-slider-pad: 4px;
    --date-slider-thumb-radius: 9999px;
    --date-slider-inner-width: calc(100% - var(--date-slider-pad) * 2);
    --date-slider-step: calc(var(--date-slider-inner-width) / var(--date-slider-count));

    position: relative;
    display: inline-grid;
    grid-template-columns: repeat(var(--date-slider-count), 1fr);
    align-items: center;
    height: var(--date-slider-height);
    padding: var(--date-slider-pad);
    overflow: hidden;
    user-select: none;
    background: rgb(255 255 255 / 6%);
    border: 1px solid var(--default-border);
    border-radius: 9999px;
  }

  .ad-performance-date-slider__thumb {
    position: absolute;
    top: var(--date-slider-pad);
    bottom: var(--date-slider-pad);
    left: calc(var(--date-slider-pad) + var(--date-slider-step) * var(--date-slider-index));
    width: var(--date-slider-step);
    background: var(--art-success);
    border-radius: var(--date-slider-thumb-radius);
    box-shadow: 0 0 0 1px rgb(255 255 255 / 8%) inset;
    transition:
      left 160ms ease,
      width 160ms ease;
  }

  .ad-performance-date-slider__item {
    position: relative;
    z-index: 1;
    height: calc(var(--date-slider-height) - var(--date-slider-pad) * 2);
    padding: 0 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 9999px;
    outline: none;
  }

  .ad-performance-date-slider__item:hover {
    color: var(--el-text-color-primary);
  }

  .ad-performance-date-slider__item.is-active {
    color: #fff;
  }

  .ad-performance-date-slider__item:focus-visible {
    box-shadow: 0 0 0 2px rgb(16 185 129 / 35%);
  }
</style>
