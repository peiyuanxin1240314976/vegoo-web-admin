<script setup lang="ts">
  /**
   * 评论与评分监控 — 页面容器（样式对齐广告成效页）
   */
  import { ref, reactive, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { Calendar, Iphone, Reading, Search } from '@element-plus/icons-vue'
  import ReviewMonitorSummary from './components/ReviewMonitorSummary.vue'
  import ReviewMonitorDetail from './components/ReviewMonitorDetail.vue'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import type { GlobalFilter } from '@/api/product-operations/reviews-ratings-monitor'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import { toAppIdsRequestBody } from '@/utils/app-id-request'

  defineOptions({ name: 'ReviewsRatingsMonitor' })

  function createDefaultFilter(): GlobalFilter {
    const end = getAppNow()
    const start = cloneAppDate(end)
    // 保持原默认跨度（近 7 天）：结束为今天，开始往前推 6 天
    start.setDate(start.getDate() - 6)
    return {
      appIds: [],
      platform: '',
      startDate: formatYYYYMMDD(start),
      endDate: formatYYYYMMDD(end),
      language: ''
    }
  }

  /** 已应用条件（传入子组件，仅点「查询」后更新） */
  const appliedFilters = reactive<GlobalFilter>(createDefaultFilter())
  /** 表单草稿（用于编辑筛选条件） */
  const draftFilters = reactive<GlobalFilter>({ ...createDefaultFilter() })

  function onQuery() {
    Object.assign(appliedFilters, draftFilters)
  }

  const activeTab = ref<'summary' | 'detail'>('summary')

  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)
  const settingAppsForSelect = computed(() => cockpitMeta.value?.settingApps ?? [])
  const firstAppId = computed(() => String(settingAppsForSelect.value[0]?.sAppId ?? '').trim())

  /** 单选应用 id ↔ `draftFilters.appIds`（POST `appIds[]`） */
  const draftAppId = computed({
    get: () => [...(draftFilters.appIds ?? [])],
    set: (v: string | string[]) => {
      draftFilters.appIds = toAppIdsRequestBody(v)
    }
  })

  watch(
    firstAppId,
    (appId) => {
      if (!appId) return
      if (draftFilters.appIds.length === 0) {
        draftFilters.appIds = toAppIdsRequestBody(appId)
      }
      if (appliedFilters.appIds.length === 0) {
        appliedFilters.appIds = toAppIdsRequestBody(appId)
      }
    },
    { immediate: true }
  )

  const platformOptions = [
    { label: 'Google Play / App Store', value: '' },
    { label: 'Google Play', value: 'google_play' },
    { label: 'App Store', value: 'app_store' }
  ]

  const languageOptions = [
    { label: '语言: 全部', value: '' },
    { label: '中文', value: 'zh' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' }
  ]

  const dateShortcuts = dateRangeShortcuts

  const dateRange = computed({
    get: () =>
      draftFilters.startDate && draftFilters.endDate
        ? [draftFilters.startDate, draftFilters.endDate]
        : [],
    set: (val: string[] | null) => {
      if (val && val.length === 2) {
        draftFilters.startDate = val[0]
        draftFilters.endDate = val[1]
      } else {
        draftFilters.startDate = ''
        draftFilters.endDate = ''
      }
    }
  })

  // const dateRangeDisplay = computed(() => {
  //   const s = draftFilters.startDate?.trim()
  //   const e = draftFilters.endDate?.trim()
  //   if (s && e) return `${s} ~ ${e}`
  //   return '请选择'
  // })

  const tabSliderStyle = computed(() => ({
    '--rrm-tab-count': '2',
    '--rrm-tab-index': activeTab.value === 'summary' ? '0' : '1'
  }))

  // function handleExport() {
  //   console.log('导出数据', appliedFilters)
  // }

  const totalCount = ref(988)
</script>

<template>
  <div class="reviews-ratings-monitor-page flex flex-col art-full-height">
    <div class="rrm-page-fx" aria-hidden="true" />

    <div
      class="reviews-ratings-monitor-page__section reviews-ratings-monitor-page__section--filters rrm-entry-1"
    >
      <div class="rrm-filters rrm-filter-panel">
        <AppPlatformSearchSelect
          v-model="draftAppId"
          mode="app"
          class="rrm-filter-select rrm-filter-select--app"
          input-class="rrm-filter-select__input"
          placeholder="应用"
          search-placeholder="搜索类别/应用名称/应用简称"
          all-label="全部应用"
          :setting-apps="settingAppsForSelect"
          :height="36"
          :min-width="200"
          :max-width="240"
          dropdown-class="rrm-filter__popper"
          :show-platform-suffix="true"
        />

        <ElSelect
          v-model="draftFilters.platform"
          placeholder="应用商店"
          class="rrm-filter-select rrm-filter-select--platform"
          :prefix-icon="Iphone"
          popper-class="rrm-filter__popper"
        >
          <ElOption v-for="o in platformOptions" :key="o.value" :label="o.label" :value="o.value" />
        </ElSelect>

        <AppDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="起"
          end-placeholder="止"
          value-format="YYYY-MM-DD"
          class="rrm-filter-date"
          :shortcuts="dateShortcuts"
          popper-class="rrm-filter__popper"
          :prefix-icon="Calendar"
        />

        <ElSelect
          v-model="draftFilters.language"
          placeholder="语言"
          class="rrm-filter-select rrm-filter-select--lang"
          :prefix-icon="Reading"
          popper-class="rrm-filter__popper"
        >
          <ElOption v-for="o in languageOptions" :key="o.value" :label="o.label" :value="o.value" />
        </ElSelect>

        <ElButton type="primary" plain round class="rrm-query-btn" :icon="Search" @click="onQuery">
          查询
        </ElButton>
      </div>
    </div>

    <div class="reviews-ratings-monitor-page__section rrm-entry-2">
      <div class="rrm-tab-slider" role="tablist" aria-label="汇总与明细" :style="tabSliderStyle">
        <div class="rrm-tab-slider__thumb" aria-hidden="true" />
        <button
          type="button"
          class="rrm-tab-slider__item"
          :class="{ 'is-active': activeTab === 'summary' }"
          role="tab"
          :aria-selected="activeTab === 'summary'"
          @click="activeTab = 'summary'"
        >
          汇总分析
        </button>
        <button
          type="button"
          class="rrm-tab-slider__item"
          :class="{ 'is-active': activeTab === 'detail' }"
          role="tab"
          :aria-selected="activeTab === 'detail'"
          @click="activeTab = 'detail'"
        >
          <span>明细列表</span>
          <span class="rrm-tab-badge">{{ totalCount }}</span>
        </button>
      </div>
    </div>

    <div class="reviews-ratings-monitor-page__body">
      <transition name="rrm-tab-fade" mode="out-in">
        <ReviewMonitorSummary v-if="activeTab === 'summary'" :key="'s'" :filters="appliedFilters" />
        <ReviewMonitorDetail
          v-else
          :key="'d'"
          :filters="appliedFilters"
          @update:total="totalCount = $event"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../../user-growth/styles/app-platform-select-ad-theme.scss' as apSelect;
  @use '../../user-growth/styles/filter-bar-theme.scss' as filterTheme;

  .reviews-ratings-monitor-page {
    --rrm-accent: var(--theme-color, var(--art-primary, #3b82f6));

    position: relative;
    min-width: 0;
    padding: 20px 24px 28px;
    overflow-x: clip;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          color-mix(in srgb, var(--el-color-primary) 42%, transparent) 0%,
          rgb(6 182 212 / 20%) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          rgb(59 130 246 / 38%) 0%,
          rgb(139 92 246 / 18%) 38%,
          transparent 58%
        ),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 18%) 0%, transparent 55%),
        radial-gradient(
          ellipse 55% 42% at 76% 4%,
          rgb(34 211 238 / 22%) 0%,
          rgb(59 130 246 / 10%) 40%,
          transparent 58%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation:
        rrm-aurora-drift 14s ease-in-out infinite alternate,
        rrm-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 8%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > *:not(.rrm-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .rrm-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 14%) 55deg,
      rgb(6 182 212 / 10%) 80deg,
      transparent 130deg,
      color-mix(in srgb, var(--el-color-primary) 12%, transparent) 200deg,
      color-mix(in srgb, var(--el-color-primary-light-3) 8%, transparent) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 10%) 330deg,
      rgb(249 115 22 / 6%) 350deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: rrm-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes rrm-aurora-drift {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(18deg);
      opacity: 1;
      transform: scale(1.06) translate(1.2%, -1.2%);
    }

    100% {
      filter: hue-rotate(-12deg);
      opacity: 0.82;
      transform: scale(1) translate(-1.2%, 1.2%);
    }
  }

  @keyframes rrm-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.08) skewX(1deg);
    }
  }

  @keyframes rrm-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .rrm-entry-1 {
    animation: rrm-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.05s;
  }

  .rrm-entry-2 {
    animation: rrm-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.12s;
  }

  @keyframes rrm-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .reviews-ratings-monitor-page__section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .reviews-ratings-monitor-page__section--filters {
    margin-bottom: 16px;
  }

  .reviews-ratings-monitor-page__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  /* ── 筛选栏（filter-bar-theme，对齐广告成效筛选模板）── */
  .rrm-filters.rrm-filter-panel {
    @include filterTheme.filter-panel(14px 16px);
    @include filterTheme.filter-panel-children;
    @include filterTheme.filter-row;

    min-width: 0;
  }

  .rrm-filter-select--platform {
    @include filterTheme.filter-select-size(200px, 160px, 220px);
  }

  .rrm-filter-select--lang {
    flex: 0 0 130px;
    width: 130px;
    min-width: 130px;
    max-width: 130px;
  }

  :deep(.rrm-filter-date) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
    --el-date-editor-width: 250px;
    --el-date-editor-daterange-width: 250px;
  }

  @include filterTheme.date-range-trigger('.rrm-filter-date', 250px);
  @include filterTheme.element-select-trigger('.rrm-filter-select');
  @include apSelect.apply-app-platform-select-ad-theme(
    '.rrm-filters.rrm-filter-panel',
    'rrm-filter-select__input',
    'rrm-filter__popper',
    240px,
    200px,
    240px
  );
  @include filterTheme.select-popper('rrm-filter__popper');
  @include filterTheme.app-platform-popper('rrm-filter__popper');
  @include filterTheme.date-picker-popper('rrm-filter__popper');

  :global(.rrm-filter__popper.el-popper),
  :global(.rrm-filter__popper.el-select__popper),
  :global(.rrm-filter__popper.el-picker__popper) {
    z-index: 4000 !important;
  }

  :deep(.rrm-filter-select),
  :deep(.rrm-filter-select__input) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  .rrm-filter-panel :deep(.rrm-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  .rrm-filter-panel :deep(.rrm-query-btn.el-button:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  /* ── Tab 滑动条（对齐 ad-performance-date-slider）── */
  .rrm-tab-slider {
    --rrm-tab-height: 40px;
    --rrm-tab-pad: 4px;
    --rrm-tab-inner-width: calc(100% - var(--rrm-tab-pad) * 2);
    --rrm-tab-step: calc(var(--rrm-tab-inner-width) / var(--rrm-tab-count));

    position: relative;
    display: inline-grid;
    grid-template-columns: repeat(var(--rrm-tab-count), 1fr);
    align-items: center;
    height: var(--rrm-tab-height);
    padding: var(--rrm-tab-pad);
    overflow: hidden;
    user-select: none;
    background: rgb(255 255 255 / 5%);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 25%, transparent);
    border-radius: 9999px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 8%),
      0 0 20px color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  }

  .rrm-tab-slider__thumb {
    position: absolute;
    top: var(--rrm-tab-pad);
    bottom: var(--rrm-tab-pad);
    left: calc(var(--rrm-tab-pad) + var(--rrm-tab-step) * var(--rrm-tab-index));
    width: var(--rrm-tab-step);
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    border-radius: 9999px;
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 10%) inset,
      0 0 16px color-mix(in srgb, var(--el-color-primary) 45%, transparent),
      0 0 30px color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    transition:
      left 180ms ease,
      width 180ms ease;
  }

  .rrm-tab-slider__item {
    position: relative;
    z-index: 1;
    display: inline-flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    height: calc(var(--rrm-tab-height) - var(--rrm-tab-pad) * 2);
    padding: 0 20px;
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

  .rrm-tab-slider__item:hover {
    color: var(--el-text-color-primary);
  }

  .rrm-tab-slider__item.is-active {
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 10px rgb(255 255 255 / 55%);
  }

  .rrm-tab-slider__item:focus-visible {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 40%, transparent);
  }

  .rrm-tab-badge {
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
    background: rgb(0 0 0 / 22%);
    border-radius: 9999px;
  }

  .rrm-tab-slider__item:not(.is-active) .rrm-tab-badge {
    color: var(--el-text-color-secondary);
    background: rgb(255 255 255 / 8%);
  }

  /* Tab 内容过渡 */
  .rrm-tab-fade-enter-active,
  .rrm-tab-fade-leave-active {
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }

  .rrm-tab-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .rrm-tab-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }

  @media (width <= 1024px) {
    .reviews-ratings-monitor-page {
      padding: 18px 18px 24px;
    }

    .rrm-filter-select--app {
      flex: 0 0 auto;
    }

    .rrm-filter-select--platform,
    .rrm-filter-select--lang {
      flex: 0 1 auto;
      min-width: 0;
    }

    .rrm-filter-date {
      flex: 0 1 220px;
      min-width: 200px;
    }

    .rrm-filters.rrm-filter-panel {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-gutter: stable;
    }
  }

  @media (width <= 768px) {
    .reviews-ratings-monitor-page {
      padding: 16px 12px 20px;
    }

    .rrm-filters.rrm-filter-panel {
      flex-wrap: wrap;
      overflow-x: visible;
    }

    .rrm-filter-select--app,
    .rrm-filter-select--platform,
    .rrm-filter-select--lang {
      flex: 1 1 calc(50% - 6px);
      width: auto;
      max-width: none;
    }

    .rrm-filter-date {
      flex: 1 1 100%;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }

    .rrm-tab-slider {
      width: 100%;
    }

    .rrm-tab-slider__item {
      padding: 0 12px;
    }
  }

  @media (width <= 480px) {
    .reviews-ratings-monitor-page {
      padding: 12px 10px 16px;
    }

    .rrm-filters.rrm-filter-panel :deep(.rrm-query-btn.el-button) {
      flex: 1 1 auto;
      min-width: 0;
    }

    .rrm-filter-select--app,
    .rrm-filter-select--platform,
    .rrm-filter-select--lang {
      flex: 1 1 100%;
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reviews-ratings-monitor-page::before,
    .rrm-page-fx {
      animation: none;
    }

    .rrm-entry-1,
    .rrm-entry-2 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .rrm-tab-slider__thumb {
      transition: none;
    }

    .rrm-filters.rrm-filter-panel {
      transition: none;
    }
  }
</style>
