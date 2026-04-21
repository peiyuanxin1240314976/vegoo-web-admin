<script setup lang="ts">
  /**
   * 评论与评分监控 — 页面容器（样式对齐广告成效页）
   */
  import { ref, reactive, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { Iphone, Reading } from '@element-plus/icons-vue'
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

  /** 单选应用 id ↔ `draftFilters.appIds`（POST `appIds[]`） */
  const draftAppId = computed({
    get: () => (draftFilters.appIds?.length === 1 ? draftFilters.appIds[0] : ''),
    set: (v: string) => {
      draftFilters.appIds = toAppIdsRequestBody(v)
    }
  })

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
      <div class="rrm-filters">
        <div class="rrm-filters__left">
          <!-- <div class="rrm-filter-chip">
            <ElIcon class="rrm-filter-chip__icon"><Calendar /></ElIcon>
            <span class="rrm-filter-chip__label">日期范围</span>
            <span class="rrm-filter-chip__value">{{ dateRangeDisplay }}</span>
          </div> -->

          <AppPlatformSearchSelect
            v-model="draftAppId"
            mode="app"
            class="rrm-filter-app-select-wrap"
            input-class="rrm-filter-app-select__trigger"
            placeholder="应用"
            search-placeholder="搜索类别/应用名称/应用简称"
            all-label="全部应用"
            :setting-apps="settingAppsForSelect"
            :height="40"
            :width="140"
            :min-width="110"
            :max-width="140"
            radius="9999px"
            dropdown-class="rrm-filter-popper"
            :show-platform-suffix="true"
          />

          <ElSelect
            v-model="draftFilters.platform"
            placeholder="应用商店"
            class="rrm-filter-select rrm-filter-select--platform"
            :prefix-icon="Iphone"
            popper-class="rrm-filter-popper"
          >
            <ElOption
              v-for="o in platformOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
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
            popper-class="rrm-filter-popper"
          />

          <ElSelect
            v-model="draftFilters.language"
            placeholder="语言"
            class="rrm-filter-select rrm-filter-select--lang"
            :prefix-icon="Reading"
            popper-class="rrm-filter-popper"
          >
            <ElOption
              v-for="o in languageOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>

          <ElButton
            round
            class="rrm-filter-action-btn rrm-filter-action-btn--query"
            @click="onQuery"
          >
            查询
          </ElButton>

          <!-- <ElButton
            round
            class="rrm-filter-action-btn rrm-filter-action-btn--export"
            @click="handleExport"
          >
            导出
          </ElButton> -->
        </div>
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

  /* ── 筛选栏（对齐 ad-performance-filters）── */
  .rrm-filters {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 14px 16px;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    padding: 18px 20px;
    overflow: hidden;
    background: rgb(10 10 14 / 82%);
    isolation: isolate;
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);

    &::before {
      position: absolute;
      top: -35%;
      right: -12%;
      width: 44%;
      height: 170%;
      pointer-events: none;
      content: '';
      background: radial-gradient(
        ellipse at center,
        color-mix(in srgb, var(--art-primary) 32%, transparent) 0%,
        transparent 65%
      );
      opacity: 0.65;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(
          color-mix(in srgb, var(--art-primary) 7%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--art-primary) 7%, transparent) 1px,
          transparent 1px
        );
      background-size:
        28px 28px,
        28px 28px;
      opacity: 0.32;
      mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 100%);
    }
  }

  .rrm-filters__left {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: nowrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--default-box-color) 72%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent);
    border-radius: 14px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 7%),
      0 0 18px color-mix(in srgb, var(--art-primary) 12%, transparent);
  }

  .rrm-filters > * {
    position: relative;
    z-index: 1;
  }

  .rrm-filter-chip {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 30%, transparent);
    border-radius: 9999px;
    box-shadow: 0 0 16px color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  }

  .rrm-filter-chip__icon {
    font-size: 16px;
    color: var(--el-color-primary);
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--el-color-primary) 55%, transparent));
  }

  .rrm-filter-chip__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .rrm-filter-chip__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-color-primary);
    text-shadow: 0 0 10px color-mix(in srgb, var(--el-color-primary) 50%, transparent);
  }

  .rrm-filter-app-select-wrap {
    flex: 0 0 auto;
    width: 140px;
    min-width: 110px;
    max-width: 100%;
  }

  :deep(.rrm-filter-app-select__trigger.app-platform-search-select) {
    box-sizing: border-box;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 12px !important;
    font-size: 14px !important;
    background: color-mix(in srgb, var(--rrm-accent) 6%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--rrm-accent) 28%, transparent) !important;
    box-shadow: none !important;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.rrm-filter-app-select__trigger .app-platform-search-select__text) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.rrm-filter-app-select__trigger .app-platform-search-select__suffix) {
    color: var(--rrm-accent);
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--rrm-accent) 50%, transparent));
  }

  :deep(.rrm-filter-app-select__trigger:hover),
  :deep(.rrm-filter-app-select__trigger.is-open) {
    background: color-mix(in srgb, var(--rrm-accent) 10%, transparent) !important;
    border-color: color-mix(in srgb, var(--rrm-accent) 60%, transparent) !important;
    box-shadow: 0 0 12px color-mix(in srgb, var(--rrm-accent) 18%, transparent) !important;
  }

  .rrm-filter-select {
    width: 140px;
    min-width: 110px;
    max-width: 100%;
  }

  .rrm-filter-select--platform {
    width: 200px;
    min-width: 160px;
  }

  .rrm-filter-select--lang {
    width: 130px;
  }

  :deep(.rrm-filter-select) {
    --el-input-border-color: color-mix(in srgb, var(--rrm-accent) 28%, transparent);
    --el-input-focus-border-color: var(--rrm-accent);
    --el-border-color: color-mix(in srgb, var(--rrm-accent) 28%, transparent);
    --el-border-color-hover: color-mix(in srgb, var(--rrm-accent) 75%, transparent);
    --el-border-color-focus: var(--rrm-accent);
    --el-component-size: 40px;
  }

  :deep(.rrm-filter-select .el-input__wrapper) {
    padding: 0 12px;
    background: color-mix(in srgb, var(--rrm-accent) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--rrm-accent) 28%, transparent);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.rrm-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.rrm-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: var(--rrm-accent);
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--rrm-accent) 50%, transparent));
  }

  :deep(.rrm-filter-select .el-select__caret) {
    color: var(--rrm-accent);
  }

  :deep(.rrm-filter-select .el-input__wrapper.is-focus) {
    background: color-mix(in srgb, var(--rrm-accent) 10%, transparent) !important;
    border-color: var(--rrm-accent) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--rrm-accent) 20%, transparent) !important;
  }

  :deep(.rrm-filter-select .el-input__wrapper:hover) {
    border-color: color-mix(in srgb, var(--rrm-accent) 60%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--rrm-accent) 18%, transparent);
  }

  .rrm-filter-date {
    flex: 0 0 auto;
    width: 204px;
    max-width: 100%;
  }

  :deep(.rrm-filter-date) {
    --el-input-border-color: color-mix(in srgb, var(--rrm-accent) 28%, transparent);
    --el-input-focus-border-color: var(--rrm-accent);
    --el-border-color: color-mix(in srgb, var(--rrm-accent) 28%, transparent);
    --el-border-color-hover: color-mix(in srgb, var(--rrm-accent) 75%, transparent);
    --el-border-color-focus: var(--rrm-accent);
    --el-component-size: 40px;
  }

  :deep(.rrm-filter-date .el-input__wrapper) {
    min-height: 40px;
    padding: 0 6px 0 8px;
    background: color-mix(in srgb, var(--rrm-accent) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--rrm-accent) 28%, transparent);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.rrm-filter-date .el-input__wrapper:hover) {
    border-color: color-mix(in srgb, var(--rrm-accent) 60%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--rrm-accent) 18%, transparent);
  }

  :deep(.rrm-filter-date .el-input__wrapper.is-focus) {
    background: color-mix(in srgb, var(--rrm-accent) 10%, transparent) !important;
    border-color: var(--rrm-accent) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--rrm-accent) 20%, transparent) !important;
  }

  :deep(.rrm-filter-date .el-range-input) {
    width: 72px;
    font-size: 12px;
    color: var(--el-text-color-primary);
    text-align: left;
  }

  :deep(.rrm-filter-date .el-range-separator) {
    flex-shrink: 0;
    padding: 0 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  :deep(.rrm-filter-date .el-range__icon) {
    margin-right: 2px;
    color: var(--rrm-accent);
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--rrm-accent) 50%, transparent));
  }

  .rrm-filter-action-btn {
    --el-button-size: 40px;
    --el-button-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-button-text-color: var(--el-color-primary);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent);
    --el-button-hover-text-color: var(--el-color-primary-light-3);
    --el-button-hover-border-color: var(--el-color-primary);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 16%, transparent);

    font-size: 14px;
    box-shadow: 0 0 14px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    transition: box-shadow 0.22s ease;

    &:hover:not(:disabled) {
      box-shadow: 0 0 22px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
    }
  }

  .rrm-filter-action-btn--query {
    --el-button-bg-color: color-mix(in srgb, var(--el-color-primary) 24%, transparent);
    --el-button-text-color: var(--el-color-white);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 58%, transparent);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 34%, transparent);
    --el-button-hover-text-color: var(--el-color-white);
    --el-button-hover-border-color: var(--el-color-primary);
  }

  .rrm-filter-action-btn--query:disabled {
    cursor: not-allowed;
    opacity: 0.42;
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

    /* 应用选择器不参与 flex-grow，否则会单独占满第一行把其余筛选项挤到下一行 */
    .rrm-filter-app-select-wrap {
      flex: 0 0 auto;
      width: 140px;
      min-width: 110px;
      max-width: 140px;
    }

    .rrm-filter-select,
    .rrm-filter-select--platform,
    .rrm-filter-select--lang {
      flex: 0 1 auto;
      min-width: 0;
    }

    .rrm-filter-date {
      flex: 0 1 200px;
      min-width: 160px;
    }

    .rrm-filters__left {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-gutter: stable;
    }
  }

  @media (width <= 768px) {
    .reviews-ratings-monitor-page {
      padding: 16px 12px 20px;
    }

    .rrm-filters {
      flex-direction: column;
      align-items: stretch;
      padding: 14px;
    }

    .rrm-filters__left {
      flex-wrap: wrap;
      justify-content: flex-start;
      padding: 8px;
      overflow-x: visible;
    }

    .rrm-filter-app-select-wrap,
    .rrm-filter-select,
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

    .rrm-filter-chip {
      flex-wrap: wrap;
      min-height: 0;
      padding: 8px 12px;
    }

    .rrm-filter-action-btn {
      flex: 1 1 auto;
      min-width: 0;
    }

    .rrm-filter-app-select-wrap,
    .rrm-filter-select,
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

    .rrm-filters::before,
    .rrm-filters::after {
      display: none;
    }
  }
</style>

<style lang="scss">
  .rrm-filter-popper.el-select__popper,
  .rrm-filter-popper.el-picker__popper {
    --el-bg-color-overlay: rgb(18 20 28 / 96%);
  }

  .rrm-filter-popper.el-select__popper {
    border-color: color-mix(in srgb, var(--el-color-primary) 35%, transparent) !important;
  }

  .rrm-filter-popper .el-select-dropdown__item {
    color: var(--el-text-color-regular) !important;
  }

  .rrm-filter-popper .el-select-dropdown__item.is-hovering,
  .rrm-filter-popper .el-select-dropdown__item:hover {
    color: var(--el-color-primary) !important;
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent) !important;
  }

  .rrm-filter-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: var(--el-color-primary) !important;
  }

  .rrm-filter-popper.el-picker-panel,
  .rrm-filter-popper .el-picker-panel {
    border-color: color-mix(in srgb, var(--el-color-primary) 35%, transparent) !important;
  }

  .rrm-filter-popper .el-date-table td.in-range div {
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent) !important;
  }

  .rrm-filter-popper .el-date-table td.start-date div,
  .rrm-filter-popper .el-date-table td.end-date div {
    color: #fff !important;
    background: linear-gradient(
      135deg,
      var(--el-color-primary),
      var(--el-color-primary-dark-2)
    ) !important;
  }
</style>
