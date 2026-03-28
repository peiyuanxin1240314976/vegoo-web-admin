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
          v-for="opt in appOptionsForSelect"
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
          v-for="opt in adPlatformOptionsForSelect"
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
        <ElOption
          v-for="opt in accountOptionsForSelect"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>

      <ElSelect
        :model-value="filter.country"
        :placeholder="tr('adPerformance.filterCountry', '国家')"
        class="ad-performance-filter-select"
        :prefix-icon="Flag"
        @update:model-value="onCountryChange"
      >
        <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
        <ElOption
          v-for="opt in countryOptionsForSelect"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
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
        aria-label="刷新数据"
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
  import type { AdPerformanceFilter, AdPerformanceMetaFilterResponse } from '../types'

  defineOptions({ name: 'AdPerformanceFilters' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const props = withDefaults(
    defineProps<{
      filter: AdPerformanceFilter
      appCount?: number
      /** 来自 meta-filter-options；未就绪时用本地默认选项 */
      metaOptions?: AdPerformanceMetaFilterResponse | null
    }>(),
    { appCount: 0, metaOptions: null }
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

  const defaultDateRangeOptions = [
    { value: 'today' as const, label: '今日' },
    { value: 'yesterday' as const, label: '昨日' },
    { value: 'last7d' as const, label: '近7天' },
    { value: 'month' as const, label: '本月' }
  ]

  const dateRangeOptions = computed(() => {
    const m = props.metaOptions?.dateRangeOptions
    return m?.length ? m : defaultDateRangeOptions
  })

  const dateRangeLabel = computed(() => {
    const hit = dateRangeOptions.value.find((item) => item.value === props.filter.dateRange)
    return hit?.label ?? '-'
  })

  const activeDateIndex = computed(() => {
    const idx = dateRangeOptions.value.findIndex((item) => item.value === props.filter.dateRange)
    return idx >= 0 ? idx : 0
  })

  const dateSliderStyle = computed(() => {
    return {
      '--date-slider-count': String(dateRangeOptions.value.length),
      '--date-slider-index': String(activeDateIndex.value)
    } as Record<string, string>
  })

  const appAllLabel = computed(() => (props.appCount ? `全部(${props.appCount})` : '全部'))

  const defaultAppOptions = [
    { value: 'Weather5', label: 'Weather5' },
    { value: 'BloodSugar2', label: 'BloodSugar2' },
    { value: 'PhoneTracker', label: 'PhoneTracker' },
    { value: 'FaceMe', label: 'FaceMe' },
    { value: 'HealthTracker', label: 'HealthTracker' }
  ]

  const defaultAdPlatformOptions = [
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'meta', label: 'Meta' },
    { value: 'kwai', label: 'Kwai' },
    { value: 'mintegral', label: 'Mintegral' }
  ]

  const appOptionsForSelect = computed(() => {
    const m = props.metaOptions?.appOptions?.filter((o) => o.value !== '')
    if (m?.length) return m
    return defaultAppOptions
  })

  const adPlatformOptionsForSelect = computed(() => {
    const m = props.metaOptions?.adPlatformOptions?.filter((o) => o.value !== '')
    if (m?.length) return m
    return defaultAdPlatformOptions
  })

  const accountOptionsForSelect = computed(() => {
    const m = props.metaOptions?.accountOptions?.filter((o) => o.value !== '')
    return m ?? []
  })

  const countryOptionsForSelect = computed(() => {
    const m = props.metaOptions?.countryOptions?.filter((o) => o.value !== '')
    if (m?.length) return m
    return [
      { label: 'US', value: 'US' },
      { label: 'UK', value: 'UK' },
      { label: 'CA', value: 'CA' },
      { label: 'JP', value: 'JP' },
      { label: 'BR', value: 'BR' }
    ]
  })
</script>

<style scoped lang="scss">
  /* ── 整体筛选栏容器 ─────────────────────────────────────────── */
  .ad-performance-filters {
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

  /* ── 左侧筛选项行 ────────────────────────────────────────────── */
  .ad-performance-filters__left {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
  }

  /* ── 日期显示徽章 ────────────────────────────────────────────── */
  .ad-performance-filter-chip {
    --ad-performance-filter-accent: #10b981;

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

  .ad-performance-filter-chip__icon {
    font-size: 16px;
    color: var(--ad-performance-filter-accent);
    filter: drop-shadow(0 0 6px rgb(16 185 129 / 55%));
  }

  .ad-performance-filter-chip__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-filter-chip__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--ad-performance-filter-accent);
    text-shadow: 0 0 10px rgb(16 185 129 / 50%);
  }

  /* ── 下拉选择器 ──────────────────────────────────────────────── */
  .ad-performance-filter-select {
    width: 134px;
    min-width: 110px;
    max-width: 100%;
  }

  :deep(.ad-performance-filter-select) {
    --el-input-focus-border-color: #10b981;
    --el-border-color-hover: rgb(16 185 129 / 75%);
    --el-color-primary: #10b981;
    --el-border-color-focus: #10b981;
    --el-component-size: 40px;
  }

  :deep(.ad-performance-filter-select .el-input__wrapper) {
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

  :deep(.ad-performance-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.ad-performance-filter-select .el-input__prefix-inner) {
    margin-right: 4px;
  }

  :deep(.ad-performance-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: #10b981;
    filter: drop-shadow(0 0 5px rgb(16 185 129 / 50%));
  }

  :deep(.ad-performance-filter-select .el-select__caret) {
    color: #10b981;
  }

  :deep(.ad-performance-filter-select .el-input__wrapper.is-focus) {
    background: rgb(16 185 129 / 10%) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
  }

  :deep(.ad-performance-filter-select .el-input__wrapper:hover) {
    border-color: rgb(16 185 129 / 60%);
    box-shadow: 0 0 12px rgb(16 185 129 / 18%);
  }

  /* ── 操作按钮 ─────────────────────────────────────────────────── */
  .ad-performance-filter-action-btn {
    --el-button-size: 40px;
    --el-button-bg-color: rgb(16 185 129 / 8%);
    --el-button-text-color: #10b981;
    --el-button-border-color: rgb(16 185 129 / 40%);
    --el-button-hover-text-color: #34d399;
    --el-button-hover-border-color: #10b981;
    --el-button-hover-bg-color: rgb(16 185 129 / 16%);
    --el-button-active-text-color: #34d399;
    --el-button-active-border-color: #10b981;
    --el-button-active-bg-color: rgb(16 185 129 / 22%);

    font-size: 14px;
    box-shadow: 0 0 14px rgb(16 185 129 / 12%);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease;

    &:hover {
      box-shadow: 0 0 22px rgb(16 185 129 / 28%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  :deep(.ad-performance-filter-action-btn .el-icon) {
    font-size: 16px;
    color: #10b981;
  }

  .ad-performance-filter-action-btn:focus-visible {
    box-shadow: 0 0 0 3px rgb(16 185 129 / 40%);
  }

  .ad-performance-filters__date-tabs {
    flex: none;
  }

  /* ── 日期切换滑动条 ─────────────────────────────────────────── */
  .ad-performance-date-slider {
    position: relative;
    display: inline-grid;
    flex-shrink: 0;
    grid-template-columns: repeat(var(--date-slider-count), 1fr);
    align-items: center;
    height: var(--date-slider-height);
    padding: var(--date-slider-pad);
    overflow: hidden;
    user-select: none;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(16 185 129 / 25%);
    border-radius: 9999px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 8%),
      0 0 20px rgb(16 185 129 / 10%);

    --date-slider-height: 40px;
    --date-slider-pad: 4px;
    --date-slider-thumb-radius: 9999px;
    --date-slider-inner-width: calc(100% - var(--date-slider-pad) * 2);
    --date-slider-step: calc(var(--date-slider-inner-width) / var(--date-slider-count));
  }

  .ad-performance-date-slider__thumb {
    position: absolute;
    top: var(--date-slider-pad);
    bottom: var(--date-slider-pad);
    left: calc(var(--date-slider-pad) + var(--date-slider-step) * var(--date-slider-index));
    width: var(--date-slider-step);
    background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: var(--date-slider-thumb-radius);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 10%) inset,
      0 0 16px rgb(16 185 129 / 45%),
      0 0 30px rgb(16 185 129 / 20%);
    transition:
      left 180ms ease,
      width 180ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .ad-performance-date-slider__item {
    position: relative;
    z-index: 1;
    height: calc(var(--date-slider-height) - var(--date-slider-pad) * 2);
    padding: 0 16px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    touch-action: manipulation;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 9999px;
    outline: none;
    transition: color 0.18s ease;
  }

  .ad-performance-date-slider__item:hover {
    color: var(--el-text-color-primary);
  }

  .ad-performance-date-slider__item.is-active {
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 10px rgb(255 255 255 / 55%);
  }

  .ad-performance-date-slider__item:focus-visible {
    box-shadow: 0 0 0 2px rgb(16 185 129 / 40%);
  }

  /* ── 小屏响应 ─────────────────────────────────────────────────── */
  @media (width <= 768px) {
    .ad-performance-filters {
      flex-direction: column;
      align-items: stretch;
      padding: 14px 16px;
    }

    .ad-performance-filters__left {
      justify-content: flex-start;
    }

    .ad-performance-date-slider {
      width: 100%;
    }

    .ad-performance-date-slider__item {
      padding: 0 10px;
    }
  }
</style>
