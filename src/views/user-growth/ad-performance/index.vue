<template>
  <div class="ad-performance-page flex flex-col">
    <div class="ap-page-fx" aria-hidden="true"></div>
    <div class="ad-performance-page__section ad-performance-page__section--filters ap-entry-1">
      <AdPerformanceFilters
        :filter="page.filter"
        :meta-options="meta"
        :app-count="appCountFromMeta"
        @search="onFilterSearch"
        @export="onExport"
        @refresh="onRefresh"
      />
    </div>

    <ElRow :gutter="16" class="ad-performance-page__body ap-entry-2">
      <ElCol :xs="24" :md="17" :xl="19" class="ad-performance-page__left">
        <div class="ad-performance-page__section ad-performance-page__section--kpi">
          <AdPerformanceKpiCards :kpi="page.kpi" :loading="cardLoading" />
        </div>
        <div class="ad-performance-page__section ad-performance-page__section--trend">
          <AdPerformanceTrendCharts
            :spend-trend="page.spendTrend"
            :roi7d-trend="page.roi7dTrend"
            :loading="cardLoading"
          />
        </div>
        <div class="ad-performance-page__section ad-performance-page__section--table">
          <AdPerformanceTable
            :active-tab="activeTableTab"
            :table-keyword="tableKeyword"
            :campaign-rows="page.campaignTableRows"
            :country-rows="page.countryTableRows"
            :owner-rows="page.ownerTableRows"
            :owner-team-summary="page.ownerTeamSummary"
            :account-rows="page.accountTableRows"
            :account-summary="page.accountSummary"
            :loading="tableLoading"
            :pagination="page.pagination"
            :filter-start-date="page.filter.startDate"
            :filter-end-date="page.filter.endDate"
            @pagination:current-change="onPageChange"
            @pagination:size-change="onPageSizeChange"
            @update:active-tab="onTableTabChange"
            @update:table-keyword="setTableKeyword"
            @keyword-search="onTableKeywordSearch"
            @data-mutated="refreshAll"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="7" :xl="5" class="ad-performance-page__right">
        <AdPerformanceDistribution
          :channel-distribution="page.channelDistribution"
          :app-distribution="page.appDistribution"
          :owner-share-distribution="page.ownerShareDistribution"
          :loading="cardLoading"
          layout="vertical"
        />
        <div class="ad-performance-page__section ad-performance-page__section--alerts">
          <AdPerformanceAlerts
            :alerts="page.alerts"
            :loading="cardLoading"
            @action="onAlertAction"
          />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import AdPerformanceFilters from './modules/ad-performance-filters.vue'
  import AdPerformanceKpiCards from './modules/ad-performance-kpi-cards.vue'
  import AdPerformanceTrendCharts from './modules/ad-performance-trend-charts.vue'
  import AdPerformanceDistribution from './modules/ad-performance-distribution.vue'
  import AdPerformanceTable from './modules/ad-performance-table.vue'
  import AdPerformanceAlerts from './modules/ad-performance-alerts.vue'
  import { useAdPerformancePage } from './composables/useAdPerformancePage'

  defineOptions({ name: 'AdPerformance' })

  const {
    meta,
    page,
    loading,
    tableLoading,
    activeTableTab,
    tableKeyword,
    setTableKeyword,
    appCountFromMeta,
    onFilterSearch,
    refreshAll,
    onTableTabChange,
    onTableKeywordSearch,
    onPageChange,
    onPageSizeChange,
    onExport,
    onAlertAction
  } = useAdPerformancePage()

  const cardLoading = computed(() => loading.value)

  function onRefresh() {
    refreshAll()
  }
</script>

<style scoped lang="scss">
  .ad-performance-page {
    position: relative;
    min-width: 0;
    padding: 20px 24px 28px;
    overflow-x: clip;

    /* 极光辐射层 ── 仅顶部可见，向下淡出 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          rgb(16 185 129 / 42%) 0%,
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
        ap-aurora-drift 14s ease-in-out infinite alternate,
        ap-bg-flow 22s ease-in-out infinite alternate;
    }

    /* 网格纹理层 ── 仅顶部点阵 */
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

    > *:not(.ap-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .ap-page-fx {
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
      rgb(16 185 129 / 12%) 200deg,
      rgb(52 211 153 / 8%) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 10%) 330deg,
      rgb(249 115 22 / 6%) 350deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: ap-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes ap-aurora-drift {
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

  @keyframes ap-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.08) skewX(1deg);
    }
  }

  @keyframes ap-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ap-entry-1 {
    animation: ap-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.05s;
  }

  .ap-entry-2 {
    animation: ap-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.18s;
  }

  @keyframes ap-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ad-performance-page__body {
    flex: 1;
    min-width: 0;
  }

  .ad-performance-page__left {
    min-width: 0;
  }

  .ad-performance-page__right {
    min-width: 0;
  }

  .ad-performance-page__section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .ad-performance-page__section--filters {
    margin-bottom: 20px;
  }

  .ad-performance-page__section--kpi {
    margin-bottom: 16px;
  }

  .ad-performance-page__section--trend {
    margin-bottom: 16px;
  }

  .ad-performance-page__section--table {
    margin-bottom: 0;
  }

  .ad-performance-page__section--alerts {
    margin-top: 16px;
    margin-bottom: 0;
  }

  @media (width <= 768px) {
    .ad-performance-page {
      padding-bottom: 16px;
    }

    .ad-performance-page__right {
      margin-top: 4px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ad-performance-page::before,
    .ap-page-fx {
      animation: none;
    }

    .ap-entry-1,
    .ap-entry-2 {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
</style>
