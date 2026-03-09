<template>
  <div class="cockpit-page" v-loading="loading">
    <!-- 1. 日期范围 + 2. 顶部操作栏 -->
    <div class="cockpit-header">
      <CockpitDateRangeTabs :model-value="dateRange" @update:model-value="onDateRangeChange" />
      <CockpitTopBarActions />
    </div>

    <!-- 3. 全局 KPI 卡片（6 个：总收入、付费收入、广告支出、有效订阅、DAU、预估利润） -->
    <CockpitGlobalKpiCards :kpi-list="overview?.kpi ?? []" />

    <!-- 4. 警示与提示 -->
    <CockpitAlertMessages
      :alert-summary-metrics="overview?.alertSummaryMetrics"
      :alert-banners="overview?.alertBanners ?? []"
    />

    <!-- 第二排：三列（收入与成本趋势 | 业务分布地图 | Top3 + 智能预警） -->
    <ElRow :gutter="16" class="cockpit-body cockpit-row-2">
      <ElCol :xs="24" :md="8">
        <CockpitRevenueCostTrend :trend-data="overview?.revenueCostTrend" />
      </ElCol>
      <ElCol :xs="24" :md="8">
        <CockpitBusinessMap
          :map-countries="overview?.mapCountries ?? []"
          :map-legend="overview?.mapLegend ?? []"
        />
      </ElCol>
      <ElCol :xs="24" :md="8">
        <div class="cockpit-col3-row1">
          <CockpitTop3Panels
            :top-revenue="overview?.topRevenue ?? []"
            :top-spend="overview?.topSpend ?? []"
            :top-user="overview?.topUser ?? []"
          />
        </div>
        <div class="cockpit-col3-row2">
          <CockpitSmartAlerts :alerts="overview?.smartAlerts ?? []" />
        </div>
      </ElCol>
    </ElRow>

    <!-- 第三排：三列（消耗节奏监控 | 收入 Top 5 Apps | Top10 Campaigns） -->
    <ElRow :gutter="16" class="cockpit-body cockpit-row-3">
      <ElCol :xs="24" :md="8">
        <CockpitSpendPaceMonitor :list="overview?.spendPace ?? []" />
      </ElCol>
      <ElCol :xs="24" :md="8">
        <CockpitTop5AppsRevenue :list="overview?.top5Apps ?? []" />
      </ElCol>
      <ElCol :xs="24" :md="8">
        <CockpitTop10Campaigns :table-data="overview?.top10Campaigns ?? []" />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { useCockpitData } from './composables/useCockpitData'
  import type { CockpitDateRange } from './types'
  import CockpitDateRangeTabs from './modules/date-range-tabs.vue'
  import CockpitTopBarActions from './modules/top-bar-actions.vue'
  import CockpitGlobalKpiCards from './modules/global-kpi-cards.vue'
  import CockpitAlertMessages from './modules/alert-messages.vue'
  import CockpitRevenueCostTrend from './modules/revenue-cost-trend.vue'
  import CockpitSpendPaceMonitor from './modules/spend-pace-monitor.vue'
  import CockpitBusinessMap from './modules/business-map.vue'
  import CockpitTop3Panels from './modules/top3-panels.vue'
  import CockpitSmartAlerts from './modules/smart-alerts.vue'
  import CockpitTop5AppsRevenue from './modules/top5-apps-revenue.vue'
  import CockpitTop10Campaigns from './modules/top10-campaigns.vue'

  defineOptions({ name: 'Cockpit' })

  const { overview, loading, dateRange, load } = useCockpitData()

  function onDateRangeChange(value: CockpitDateRange) {
    dateRange.value = value
    load({ dateRange: value })
  }
</script>

<style scoped lang="scss">
  .cockpit-page {
    padding-bottom: 20px;
  }

  .cockpit-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .cockpit-body {
    margin-bottom: 16px;

    .cockpit-panel,
    .cockpit-map-panel {
      margin-bottom: 16px;
    }
  }

  .cockpit-row-2 .cockpit-col3-row1 {
    margin-bottom: 16px;
  }

  .cockpit-row-2 .cockpit-col3-row2 {
    margin-bottom: 0;
  }
</style>
