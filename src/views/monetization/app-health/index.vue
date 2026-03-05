<template>
  <div class="app-health-page" v-loading="loading">
    <!-- 第一排：标题 + 筛选 + KPI 卡片 -->
    <AppHealthHeaderFilters
      v-model:app="filterApp"
      v-model:date-range="filterDate"
      v-model:compare="compareWithPrev"
      @export="onExport"
    />
    <AppHealthKpiCards :cards="overview?.kpiCards ?? []" />

    <!-- 第二排：用户漏斗、留存热力图、收入构成 -->
    <div class="app-health-row-2">
      <div class="app-health-cell">
        <AppHealthUserFunnel :data="overview?.funnel ?? []" />
      </div>
      <div class="app-health-cell">
        <AppHealthRetentionHeatmap :data="overview?.retention ?? []" />
      </div>
      <div class="app-health-cell">
        <AppHealthRevenueComposition :data="overview?.revenueComposition ?? null" />
      </div>
    </div>

    <!-- 第三排：应用指标矩阵 -->
    <div class="app-health-row-3">
      <AppHealthMetricsTable :data="overview?.metricsTable ?? []" @detail="onDetail" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { AppHealthMetricsRow } from './types'
  import { MOCK_APP_HEALTH } from './mock/data'
  import AppHealthHeaderFilters from './modules/header-filters.vue'
  import AppHealthKpiCards from './modules/kpi-cards.vue'
  import AppHealthUserFunnel from './modules/user-funnel.vue'
  import AppHealthRetentionHeatmap from './modules/retention-heatmap.vue'
  import AppHealthRevenueComposition from './modules/revenue-composition.vue'
  import AppHealthMetricsTable from './modules/app-metrics-table.vue'

  defineOptions({ name: 'AppHealth' })

  const loading = ref(false)
  const filterApp = ref('')
  const filterDate = ref('month')
  const compareWithPrev = ref(true)
  const overview = ref(MOCK_APP_HEALTH)

  onMounted(() => {
    // 后续可在此请求接口拉取 overview
  })

  function onExport() {
    // 导出报表
  }

  function onDetail(row: AppHealthMetricsRow) {
    console.log('onDetail', row)
    // 跳转详情或打开抽屉
  }
</script>

<style scoped lang="scss">
  .app-health-page {
    padding-bottom: 20px;
  }

  .app-health-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;

    @media (width >= 992px) {
      grid-template-columns: repeat(3, 1fr);
      min-height: 360px;
    }
  }

  .app-health-cell {
    display: flex;
    flex-direction: column;
    min-height: 320px;
  }

  .app-health-row-3 {
    margin-bottom: 16px;
  }
</style>
