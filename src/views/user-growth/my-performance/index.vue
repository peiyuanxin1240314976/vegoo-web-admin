<template>
  <div class="my-performance-page art-full-height">
    <MyPerformanceHeader
      :person-options="data.personOptions"
      :person-id="data.selectedPersonId"
      :period-type="data.periodType"
      :period-value="data.selectedPeriodValue"
      :period-options="data.periodOptions"
      left-primary="当前日期：2026-03-04"
      left-secondary="计算日期：2026-03-01 至 2026-03-04"
      left-tertiary="时区：PST (UTC-8)"
      left-quaternary="货币：USD"
      left-hint="注意：一周内及回收周期内的数据会回更，此页面数据仅供参考，并非最终绩效结果；每个月度前3天仍然展示上个月度的数据。"
      :person-label="$t('myPerformance.header.person')"
      :export-label="$t('myPerformance.header.export')"
      :quarter-label="$t('myPerformance.header.quarter')"
      :month-label="$t('myPerformance.header.month')"
      @update:person-id="onPersonChange"
      @update:period-type="onPeriodTypeChange"
      @update:period-value="onPeriodValueChange"
    />

    <div class="top-row">
      <MyPerformanceTopCard
        :person="selectedPerson"
        :kpis="data.topKpis"
        :responsible-label="$t('myPerformance.personCard.responsible')"
      />
    </div>

    <ElRow :gutter="16" class="data-row">
      <ElCol :xs="24" :lg="7" class="left-col">
        <div class="left-stack">
          <MyPerformancePanelKpiAchievement
            :title="$t('myPerformance.panels.kpiAchievement')"
            :achievement="data.kpiAchievement"
            :col-label="$t('myPerformance.kpiTable.col.label')"
            :col-target="$t('myPerformance.kpiTable.col.target')"
            :col-actual="$t('myPerformance.kpiTable.col.actual')"
            :col-rate="$t('myPerformance.kpiTable.col.rate')"
            :col-score="$t('myPerformance.kpiTable.col.score')"
          />
          <MyPerformancePanelRoiTrend :title="data.roiTrend.title" :points="data.roiTrend.points" />
          <MyPerformancePanelSpendProgress
            v-if="data.periodType === 'month'"
            :title="data.spendProgress.title"
            :data="data.spendProgress.data"
            :hint-text="spendAchievementHint"
          />
          <MyPerformancePanelPerformanceHistory
            :title="data.performanceHistory.title"
            :list="data.performanceHistory.list"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :lg="17" class="right-col">
        <div class="right-wrap">
          <MyPerformancePanelAppDimensionTable
            :title="data.appTable.title"
            :list="data.appTable.list"
            :summary="data.appTable.summary"
            :header-hint="$t('myPerformance.appTableHeader.hint')"
            :col-app="$t('myPerformance.table.col.app')"
            :col-platform="$t('myPerformance.table.col.platform')"
            :col-source="$t('myPerformance.table.col.source')"
            :col-window="$t('myPerformance.table.col.window')"
            :col-reach-rate="$t('myPerformance.table.col.reachRate')"
            :col-min-rate="$t('myPerformance.table.col.minRate')"
            :col-deviation-coef="$t('myPerformance.table.col.deviationCoef')"
            :col-min-profit="$t('myPerformance.table.col.minProfit')"
            :col-ad-spend="$t('myPerformance.table.col.adSpend')"
            :col-calculated-spend="$t('myPerformance.table.col.calculatedSpend')"
            :col-roi="$t('myPerformance.table.col.roi')"
            :col-commission-spend="$t('myPerformance.table.col.commissionSpend')"
            :col-estimated-profit="$t('myPerformance.table.col.estimatedProfit')"
            :col-cpa="$t('myPerformance.table.col.cpa')"
            :col-score="$t('myPerformance.table.col.score')"
            :col-status="$t('myPerformance.table.col.status')"
          />

          <div class="table-hint">
            <div class="table-hint__title">{{ $t('myPerformance.tableHint.title') }}</div>
            <ol class="table-hint__list">
              <li>{{ $t('myPerformance.tableHint.items.0') }}</li>
              <li>{{ $t('myPerformance.tableHint.items.1') }}</li>
              <li>{{ $t('myPerformance.tableHint.items.2') }}</li>
              <li>{{ $t('myPerformance.tableHint.items.3') }}</li>
            </ol>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import MyPerformanceHeader from './components/my-performance-header.vue'
  import MyPerformanceTopCard from './components/my-performance-top-card.vue'
  import MyPerformancePanelKpiAchievement from './components/panel-kpi-achievement.vue'
  import MyPerformancePanelRoiTrend from './components/panel-roi-trend.vue'
  import MyPerformancePanelAppDimensionTable from './components/panel-app-dimension-table.vue'
  import MyPerformancePanelSpendProgress from './components/panel-spend-progress.vue'
  import MyPerformancePanelPerformanceHistory from './components/panel-performance-history.vue'
  import { buildMyPerformanceMockData, DEFAULT_PERIOD, MOCK_MY_PERFORMANCE_DATA } from './mock/data'
  import type { MyPerformancePeriodType, MyPerformancePageData } from './types'

  defineOptions({ name: 'MyPerformance' })

  const { t } = useI18n()

  const data = ref<MyPerformancePageData>(MOCK_MY_PERFORMANCE_DATA)

  const selectedPerson = computed(() => {
    return (
      data.value.personOptions.find((p) => p.id === data.value.selectedPersonId) ??
      data.value.personOptions[0]
    )
  })

  const spendAchievementHint = computed(() => {
    const d = data.value.spendProgress?.data
    if (!d) return ''
    const remaining = d.target - d.spend
    if (remaining <= 0) return t('myPerformance.spendAchievement.hintReached')
    const amount = '$' + remaining.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return t('myPerformance.spendAchievement.hint', { amount })
  })

  function rebuild(periodType: MyPerformancePeriodType, periodValue: string, personId: string) {
    data.value = buildMyPerformanceMockData(periodType, periodValue, personId)
  }

  function onPersonChange(personId: string) {
    rebuild(data.value.periodType, data.value.selectedPeriodValue, personId)
  }

  function onPeriodTypeChange(periodType: MyPerformancePeriodType) {
    const options =
      periodType === 'quarter' ? data.value.periodOptions.quarter : data.value.periodOptions.month
    const nextValue = options[0]?.value ?? DEFAULT_PERIOD.periodValue
    rebuild(periodType, nextValue, data.value.selectedPersonId)
  }

  function onPeriodValueChange(periodValue: string) {
    rebuild(data.value.periodType, periodValue, data.value.selectedPersonId)
  }
</script>

<style scoped lang="scss">
  .my-performance-page {
    padding: 16px 20px 24px;
  }

  .top-row {
    margin-bottom: 16px;
  }

  .data-row {
    padding-bottom: 24px;
  }

  .left-col,
  .right-col {
    min-width: 0;
  }

  .left-col {
    overflow: hidden;
  }

  .right-wrap {
    min-width: 0;
    overflow: hidden;
  }

  .table-hint {
    padding: 10px 14px;
    margin-top: 12px;
    color: rgb(161 161 170 / 92%);
    background: rgb(39 39 42 / 18%);
    border: 1px solid rgb(39 39 42 / 40%);
    border-radius: 12px;
  }

  .table-hint__title {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 650;
    color: rgb(244 244 245 / 70%);
  }

  .table-hint__list {
    padding-left: 16px;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;

    li + li {
      margin-top: 2px;
    }
  }

  .left-stack {
    display: grid;
    gap: 16px;
    min-width: 0;

    > * {
      min-width: 0;
    }

    :deep(.panel) {
      width: 100%;
      min-width: 0;
    }
  }
</style>
