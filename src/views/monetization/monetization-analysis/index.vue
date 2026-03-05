<template>
  <div class="monetization-analysis-page" v-loading="loading">
    <!-- 1. 日期与筛选 -->
    <div class="monetization-header">
      <MonetizationDateRangeFilters
        :model-value="dateRange"
        @update:model-value="onDateRangeChange"
        @filterChange="onFilterChange"
      />
    </div>

    <!-- 第一排：顶部核心指标 KPI 卡片 -->
    <MonetizationKpiCards :kpi-list="overview?.kpi ?? []" />

    <!-- 第二排：Grid 3 列 2 行；第1列=收入eCPM(上)+IAP(下)，第2列=填充率(上)+eCPM按类型(下)，第3列=Waterfall(整列) -->
    <div class="monetization-row-2">
      <div class="monetization-grid-cell monetization-grid-cell--c1-r1">
        <div class="monetization-grid-cell-inner">
          <MonetizationRevenueEcpMTrend :data="overview?.revenueEcpMTrend ?? null" />
        </div>
      </div>
      <div class="monetization-grid-cell monetization-grid-cell--c2-r1">
        <div class="monetization-grid-cell-inner">
          <MonetizationFillRateMonitoring :data="overview?.fillRateTrend ?? null" />
        </div>
      </div>
      <div class="monetization-grid-cell monetization-grid-cell--c3-r1-r2">
        <div class="monetization-grid-cell-inner">
          <MonetizationWaterfallConfig :data="overview?.waterfallLevels ?? []" />
        </div>
      </div>
      <div class="monetization-grid-cell monetization-grid-cell--c1-r2">
        <div class="monetization-grid-cell-inner">
          <MonetizationIapRevenueAnalysis :data="overview?.iapAnalysis ?? null" />
        </div>
      </div>
      <div class="monetization-grid-cell monetization-grid-cell--c2-r2">
        <div class="monetization-grid-cell-inner">
          <MonetizationEcpmTrendByAdType :data="overview?.ecpmByAdType ?? null" />
        </div>
      </div>
    </div>

    <!-- 第三排：广告平台表现、AI 洞察与建议 -->
    <div class="monetization-row-3">
      <MonetizationAdPlatformPerformance :data="overview?.adPlatformPerformance ?? []" />
      <MonetizationAiInsights :data="overview?.aiInsights ?? []" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useMonetizationAnalysisData } from './composables/useMonetizationAnalysisData'
  import type { MonetizationDateRange } from './types'
  import MonetizationDateRangeFilters from './modules/date-range-filters.vue'
  import MonetizationKpiCards from './modules/kpi-cards.vue'
  import MonetizationRevenueEcpMTrend from './modules/revenue-ecpm-trend.vue'
  import MonetizationFillRateMonitoring from './modules/fill-rate-monitoring.vue'
  import MonetizationWaterfallConfig from './modules/waterfall-config.vue'
  import MonetizationIapRevenueAnalysis from './modules/iap-revenue-analysis.vue'
  import MonetizationEcpmTrendByAdType from './modules/ecpm-trend-by-ad-type.vue'
  import MonetizationAdPlatformPerformance from './modules/ad-platform-performance.vue'
  import MonetizationAiInsights from './modules/ai-insights.vue'

  defineOptions({ name: 'MonetizationAnalysis' })

  const { overview, loading, dateRange, load } = useMonetizationAnalysisData()

  function onDateRangeChange(value: MonetizationDateRange) {
    dateRange.value = value
    load({ dateRange: value })
  }

  function onFilterChange() {
    load({ dateRange: dateRange.value })
  }
</script>

<style scoped lang="scss">
  .monetization-analysis-page {
    padding-bottom: 20px;
  }

  .monetization-header {
    margin-bottom: 16px;
  }

  /* 第二排：固定整体高度，第一/二列 4 块各占 50%，第三列 1 块占 100%，实现上下对齐 */
  .monetization-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    gap: 16px;
    min-height: 0;
    margin-bottom: 16px;

    @media (width >= 768px) {
      grid-template-rows: 50% 50%;
      grid-template-columns: repeat(3, 1fr);
      height: 560px;
    }
  }

  .monetization-grid-cell {
    display: flex;
    flex-direction: column;
    min-height: 0;

    @media (width >= 768px) {
      min-height: 0;
      overflow: hidden;

      &--c1-r1 {
        grid-row: 1;
        grid-column: 1;
      }

      &--c2-r1 {
        grid-row: 1;
        grid-column: 2;
      }

      &--c3-r1-r2 {
        grid-row: 1 / -1;
        grid-column: 3;
        height: 100%;
      }

      &--c1-r2 {
        grid-row: 2;
        grid-column: 1;
      }

      &--c2-r2 {
        grid-row: 2;
        grid-column: 2;
      }
    }
  }

  .monetization-grid-cell-inner {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    @media (width >= 768px) {
      overflow: auto;
    }
  }

  /* 第三列 Waterfall：内层占满整列 100% 高度 */
  .monetization-grid-cell--c3-r1-r2 .monetization-grid-cell-inner {
    @media (width >= 768px) {
      height: 100%;
    }
  }

  .monetization-row-3 > * + * {
    margin-top: 16px;
  }
</style>
