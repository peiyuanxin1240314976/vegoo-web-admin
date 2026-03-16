<template>
  <div class="cockpit-page" v-loading="loading">
    <!-- 1. 日期范围 + 2. 顶部操作栏 -->
    <div class="cockpit-header">
      <CockpitDateRangeTabs :model-value="dateRange" @update:model-value="onDateRangeChange" />
      <CockpitTopBarActions />
    </div>

    <!-- 3. 第一排 KPI 卡片 + 4. 警示与提示：只调一次 POST .../cockpit/overall，两处共用该次返回的 data -->
    <CockpitGlobalKpiCards :kpi-list="overview?.kpi ?? []" />

    <!-- 4. 警示与提示（与 KPI 同接口，data.alertSummaryMetrics / data.alertBanners） -->
    <CockpitAlertMessages
      :alert-summary-metrics="overview?.alertSummaryMetrics"
      :alert-banners="overview?.alertBanners ?? []"
    />

    <!-- 第二排：三列（左25% | 中50% 业务分布地图 | 右25%） -->
    <ElRow :gutter="16" class="cockpit-body cockpit-row-2">
      <ElCol :xs="24" :md="6">
        <CockpitSpendPaceMonitor :list="overview?.spendPace ?? []" />
      </ElCol>
      <ElCol :xs="24" :md="12">
        <CockpitBusinessMap
          :map-countries="overview?.mapCountries ?? []"
          :map-legend="overview?.mapLegend ?? []"
        />
      </ElCol>
      <ElCol :xs="24" :md="6">
        <div class="cockpit-col3-row1">
          <CockpitTop3Panels
            :top-revenue="overview?.topRevenue ?? []"
            :top-bad-review="overview?.topBadReview ?? []"
            :top-user="overview?.topUser ?? []"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 第三排：三列（左25% | 中50% 近7日收入结构流向 | 右25%） -->
    <ElRow :gutter="16" class="cockpit-body cockpit-row-3">
      <ElCol :xs="24" :md="6">
        <CockpitRevenueCostTrend :list="overview?.channelRoiInstall" />
      </ElCol>
      <ElCol :xs="24" :md="12">
        <CockpitRevenueStructureFlow :flow-data="overview?.revenueStructureFlow" />
      </ElCol>
      <ElCol :xs="24" :md="6">
        <CockpitSmartAlerts :alerts="overview?.smartAlerts ?? []" />
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
  import CockpitRevenueStructureFlow from './modules/revenue-structure-flow.vue'
  // dev测试提交
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
    margin-bottom: 0;
  }
</style>

<style lang="scss">
  /* Cockpit 通用面板样式：统一圆角 / 边框 / 背景 / 阴影 */
  .cockpit-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgb(56 189 248 / 14%), transparent 55%),
      radial-gradient(circle at bottom right, rgb(59 130 246 / 12%), transparent 55%), #020617;
    border: 1px solid rgb(148 163 184 / 35%);
    border-radius: 10px;
    box-shadow:
      0 18px 45px rgb(15 23 42 / 65%),
      inset 0 0 0 1px rgb(15 23 42 / 90%);
  }

  html:not(.dark) .cockpit-panel {
    background:
      radial-gradient(circle at top left, rgb(37 99 235 / 6%), transparent 55%),
      radial-gradient(circle at bottom right, rgb(14 116 144 / 4%), transparent 55%), #0b1120;
    border-color: rgb(148 163 184 / 25%);
    box-shadow:
      0 10px 30px rgb(15 23 42 / 40%),
      inset 0 0 0 1px rgb(15 23 42 / 85%);
  }

  /* 面板头部：左标题 + 右侧操作区 */
  .cockpit-panel__header {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 14px;
    color: #e5e7eb;
    background: linear-gradient(
      90deg,
      rgb(15 23 42 / 90%),
      rgb(15 23 42 / 75%),
      rgb(15 23 42 / 90%)
    );
    border-bottom: 1px solid rgb(30 64 175 / 55%);
  }

  .cockpit-panel__title {
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .cockpit-panel__actions {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: #9ca3af;
  }
</style>
