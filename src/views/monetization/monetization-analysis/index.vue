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

    <!-- 2. 顶部核心指标 KPI 卡片 -->
    <MonetizationKpiCards :kpi-list="overview?.kpi ?? []" />

    <!-- 3. 收入与 eCPM 趋势 -->
    <MonetizationRevenueEcpMTrend :data="overview?.revenueEcpMTrend ?? null" />

    <!-- 4. 填充率监控 -->
    <MonetizationFillRateMonitoring :data="overview?.fillRateTrend ?? null" />

    <!-- 5. Waterfall 配置 + IAP 收入分析 -->
    <ElRow :gutter="16" class="monetization-body">
      <ElCol :xs="24" :md="12">
        <MonetizationWaterfallConfig :data="overview?.waterfallLevels ?? []" />
      </ElCol>
      <ElCol :xs="24" :md="12">
        <MonetizationIapRevenueAnalysis :data="overview?.iapAnalysis ?? null" />
      </ElCol>
    </ElRow>

    <!-- 6. eCPM 趋势 - 按广告类型 -->
    <MonetizationEcpmTrendByAdType :data="overview?.ecpmByAdType ?? null" />

    <!-- 7. 广告平台表现表格 -->
    <MonetizationAdPlatformPerformance :data="overview?.adPlatformPerformance ?? []" />

    <!-- 8. AI 洞察与建议 -->
    <MonetizationAiInsights :data="overview?.aiInsights ?? []" />
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

  .monetization-body {
    margin-bottom: 16px;
  }
</style>
