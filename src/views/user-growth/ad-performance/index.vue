<template>
  <div class="ad-performance-page art-full-height flex flex-col">
    <ElRow :gutter="16" class="ad-performance-page__body">
      <!-- 左侧：筛选、数据展示、趋势图、表格 -->
      <ElCol :xs="24" :xl="19" class="ad-performance-page__left">
        <div class="ad-performance-page__section ad-performance-page__section--filters">
          <AdPerformanceFilters
            :filter="mock.filter"
            :app-count="53"
            @search="onFilterSearch"
            @export="onExport"
            @refresh="onRefresh"
          />
        </div>
        <div class="ad-performance-page__section ad-performance-page__section--kpi">
          <AdPerformanceKpiCards :kpi="mock.kpi" />
        </div>
        <div class="ad-performance-page__section ad-performance-page__section--trend">
          <AdPerformanceTrendCharts :spend-trend="mock.spendTrend" :roi7d-trend="mock.roi7dTrend" />
        </div>
        <div class="ad-performance-page__section ad-performance-page__section--table">
          <AdPerformanceTable
            :campaign-rows="mock.campaignTableRows"
            :country-rows="mock.countryTableRows"
            :owner-rows="mock.ownerTableRows"
            :owner-team-summary="mock.ownerTeamSummary"
            :account-rows="mock.accountTableRows"
            :account-summary="mock.accountSummary"
            :loading="loading"
            :pagination="mock.pagination"
            @pagination:current-change="onPageChange"
            @pagination:size-change="onPageSizeChange"
          />
        </div>
      </ElCol>
      <!-- 右侧：广告平台分布、应用分布、异常预警 -->
      <ElCol :xs="24" :xl="5" class="ad-performance-page__right">
        <AdPerformanceDistribution
          :channel-distribution="mock.channelDistribution"
          :app-distribution="mock.appDistribution"
          :owner-share-distribution="mock.ownerShareDistribution"
          layout="vertical"
        />
        <div class="ad-performance-page__section ad-performance-page__section--alerts">
          <AdPerformanceAlerts :alerts="mock.alerts" @action="onAlertAction" />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import AdPerformanceFilters from './modules/ad-performance-filters.vue'
  import AdPerformanceKpiCards from './modules/ad-performance-kpi-cards.vue'
  import AdPerformanceTrendCharts from './modules/ad-performance-trend-charts.vue'
  import AdPerformanceDistribution from './modules/ad-performance-distribution.vue'
  import AdPerformanceTable from './modules/ad-performance-table.vue'
  import AdPerformanceAlerts from './modules/ad-performance-alerts.vue'
  import { MOCK_AD_PERFORMANCE } from './mock/data'
  import type { AdPerformanceFilter } from './types'

  defineOptions({ name: 'AdPerformance' })

  function getMockCopy() {
    return {
      ...MOCK_AD_PERFORMANCE,
      filter: { ...MOCK_AD_PERFORMANCE.filter },
      pagination: { ...MOCK_AD_PERFORMANCE.pagination }
    }
  }

  const mock = ref(getMockCopy())
  const loading = ref(false)

  function onFilterSearch(filter: AdPerformanceFilter) {
    mock.value.filter = { ...filter }
  }

  function onExport() {
    // 占位，后续接导出接口
  }

  function onRefresh() {
    mock.value = getMockCopy()
  }

  function onPageChange(page: number) {
    mock.value.pagination = { ...mock.value.pagination, current: page }
  }

  function onPageSizeChange(size: number) {
    mock.value.pagination = {
      ...mock.value.pagination,
      size,
      current: 1
    }
  }

  function onAlertAction() {
    // 占位：暂停/查看/优化
  }
</script>

<style scoped lang="scss">
  .ad-performance-page {
    min-width: 0;
    padding-bottom: 24px;
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
    margin-bottom: 16px;
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
</style>
