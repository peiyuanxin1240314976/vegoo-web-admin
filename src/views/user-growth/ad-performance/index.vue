<template>
  <div v-loading="loading" class="ad-performance-page art-full-height flex flex-col">
    <div class="ad-performance-page__section ad-performance-page__section--filters">
      <AdPerformanceFilters
        :filter="page.filter"
        :meta-options="meta"
        :app-count="appCountFromMeta"
        @search="onFilterSearch"
        @export="onExport"
        @refresh="onRefresh"
      />
    </div>

    <ElRow :gutter="16" class="ad-performance-page__body">
      <ElCol :xs="24" :md="17" :xl="19" class="ad-performance-page__left">
        <div class="ad-performance-page__section ad-performance-page__section--kpi">
          <AdPerformanceKpiCards :kpi="page.kpi" />
        </div>
        <div class="ad-performance-page__section ad-performance-page__section--trend">
          <AdPerformanceTrendCharts :spend-trend="page.spendTrend" :roi7d-trend="page.roi7dTrend" />
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
            :filter-date-range="page.filter.dateRange"
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
          layout="vertical"
        />
        <div class="ad-performance-page__section ad-performance-page__section--alerts">
          <AdPerformanceAlerts :alerts="page.alerts" @action="onAlertAction" />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
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

  function onRefresh() {
    refreshAll()
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

  @media (width <= 768px) {
    .ad-performance-page {
      padding-bottom: 16px;
    }

    .ad-performance-page__right {
      margin-top: 4px;
    }
  }
</style>
