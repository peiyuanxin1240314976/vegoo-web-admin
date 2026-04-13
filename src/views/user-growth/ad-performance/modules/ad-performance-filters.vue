<template>
  <div class="ad-performance-filters">
    <div class="ad-performance-filters__left">
      <ElDatePicker
        v-model="dateRangeValue"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="~"
        :start-placeholder="tr('adPerformance.startDate', '开始日期')"
        :end-placeholder="tr('adPerformance.endDate', '结束日期')"
        class="ad-performance-date-picker"
        :prefix-icon="Calendar"
        :shortcuts="datePickerShortcuts"
        unlink-panels
      />

      <ElSelect
        :model-value="draft.app"
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
        :model-value="draft.adPlatform"
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
        :model-value="draft.account"
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
        :model-value="draft.country"
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
        class="ad-performance-filter-action-btn ad-performance-filter-action-btn--query"
        :disabled="!isDirty"
        @click="onQuery"
      >
        {{ tr('adPerformance.query', '查询') }}
      </ElButton>
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
  </div>
</template>

<script setup lang="ts">
  import { Calendar, Flag, Grid, Promotion, RefreshRight, User } from '@element-plus/icons-vue'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { AdPerformanceFilter, AdPerformanceMetaFilterResponse } from '../types'
  import { cloneAppDate, getAppNow } from '@/utils/app-now'

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

  const draft = ref<AdPerformanceFilter>({ ...props.filter })

  const isDirty = computed(() => {
    const a = props.filter
    const b = draft.value
    return (
      String(a.startDate ?? '') !== String(b.startDate ?? '') ||
      String(a.endDate ?? '') !== String(b.endDate ?? '') ||
      String(a.app ?? '') !== String(b.app ?? '') ||
      String(a.adPlatform ?? '') !== String(b.adPlatform ?? '') ||
      String(a.account ?? '') !== String(b.account ?? '') ||
      String(a.country ?? '') !== String(b.country ?? '')
    )
  })

  function onQuery() {
    emit('search', { ...draft.value })
  }

  function patchDraft(partial: Partial<AdPerformanceFilter>) {
    draft.value = { ...draft.value, ...partial }
  }

  function onAppChange(v: string) {
    patchDraft({ app: v ?? '' })
  }

  function onAdPlatformChange(v: string) {
    patchDraft({ adPlatform: v ?? '' })
  }

  function onAccountChange(v: string) {
    patchDraft({ account: v ?? '' })
  }

  function onCountryChange(v: string) {
    patchDraft({ country: v ?? '' })
  }

  const dateRangeValue = computed<[string, string] | null>({
    get() {
      const start = draft.value.startDate?.trim()
      const end = draft.value.endDate?.trim()
      if (start && end) return [start, end]
      return null
    },
    set(v) {
      if (v) {
        patchDraft({ startDate: v[0], endDate: v[1] })
      }
    }
  })

  const datePickerShortcuts = [
    {
      text: '今日',
      value: () => {
        const d = getAppNow()
        return [d, d]
      }
    },
    {
      text: '昨日',
      value: () => {
        const d = cloneAppDate(getAppNow())
        d.setDate(d.getDate() - 1)
        return [d, d]
      }
    },
    {
      text: '近7天',
      value: () => {
        const end = getAppNow()
        const start = cloneAppDate(end)
        start.setDate(start.getDate() - 6)
        return [start, end]
      }
    },
    {
      text: '本月',
      value: () => {
        const end = getAppNow()
        const start = cloneAppDate(end)
        start.setDate(1)
        return [start, end]
      }
    },
    {
      text: '上月',
      value: () => {
        const today = getAppNow()
        const start = cloneAppDate(today)
        start.setDate(1)
        start.setMonth(start.getMonth() - 1)
        const end = cloneAppDate(today)
        end.setDate(0)
        return [start, end]
      }
    },
    {
      text: '近30天',
      value: () => {
        const end = getAppNow()
        const start = cloneAppDate(end)
        start.setDate(start.getDate() - 29)
        return [start, end]
      }
    }
  ]

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

  watch(
    () => props.filter,
    (v) => {
      draft.value = { ...v }
    },
    { deep: true, immediate: true }
  )
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

  /* ── 日期区间选择器 ──────────────────────────────────────────── */
  .ad-performance-date-picker {
    width: 248px;
    min-width: 200px;
    max-width: 100%;
  }

  :deep(.ad-performance-date-picker) {
    --el-input-focus-border-color: #10b981;
    --el-border-color-hover: rgb(16 185 129 / 75%);
    --el-color-primary: #10b981;
    --el-border-color-focus: #10b981;
    --el-component-size: 40px;
  }

  :deep(.ad-performance-date-picker .el-input__wrapper),
  :deep(.ad-performance-date-picker.el-date-editor .el-range-input),
  :deep(.ad-performance-date-picker.el-date-editor) {
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.ad-performance-date-picker.el-date-editor) {
    height: 40px;
    padding: 0 12px;
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range-input) {
    font-size: 13px;
    color: var(--el-text-color-primary);
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range-separator) {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range__icon) {
    color: #10b981;
    filter: drop-shadow(0 0 5px rgb(16 185 129 / 50%));
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range__close-icon) {
    color: var(--el-text-color-secondary);
  }

  :deep(.ad-performance-date-picker.el-date-editor:hover) {
    border-color: rgb(16 185 129 / 60%);
    box-shadow: 0 0 12px rgb(16 185 129 / 18%);
  }

  :deep(.ad-performance-date-picker.el-date-editor.is-active),
  :deep(.ad-performance-date-picker.el-date-editor:focus-within) {
    background: rgb(16 185 129 / 10%);
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgb(16 185 129 / 20%);
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
    transition: box-shadow 0.22s ease;

    &:hover {
      box-shadow: 0 0 22px rgb(16 185 129 / 28%);
    }
  }

  :deep(.ad-performance-filter-action-btn .el-icon) {
    font-size: 16px;
    color: #10b981;
  }

  .ad-performance-filter-action-btn:focus-visible {
    box-shadow: 0 0 0 3px rgb(16 185 129 / 40%);
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

    .ad-performance-date-picker {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
