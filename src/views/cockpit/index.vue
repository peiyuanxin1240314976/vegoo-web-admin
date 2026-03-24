<template>
  <div class="cockpit-page">
    <!-- 1. 日期范围 + 2. 顶部操作栏 -->
    <div class="cockpit-header">
      <CockpitDateRangeTabs :model-value="dateRange" @update:model-value="onDateRangeChange" />
      <CockpitTopBarActions v-model="date" />
    </div>

    <!-- 3. 第一排 KPI 卡片 + 4. 警示与提示：只调一次 POST .../cockpit/overall，两处共用该次返回的 data -->
    <ElSkeleton :loading="moduleLoading.kpiAlert" animated>
      <template #template>
        <div class="cockpit-skeleton-card-list">
          <ElSkeletonItem v-for="i in 4" :key="`kpi-${i}`" variant="p" class="cockpit-s-line w24" />
        </div>
      </template>
      <CockpitGlobalKpiCards :kpi-list="overview?.kpi ?? []" />
    </ElSkeleton>

    <!-- 4. 警示与提示（与 KPI 同接口，data.alertSummaryMetrics / data.alertBanners） -->
    <ElSkeleton :loading="moduleLoading.kpiAlert" animated>
      <template #template>
        <div class="cockpit-skeleton-block">
          <ElSkeletonItem
            v-for="i in 3"
            :key="`alert-${i}`"
            variant="p"
            class="cockpit-s-line w96"
          />
        </div>
      </template>
      <CockpitAlertMessages
        :alert-summary-metrics="overview?.alertSummaryMetrics"
        :alert-banners="overview?.alertBanners ?? []"
      />
    </ElSkeleton>

    <!-- 第二排：三列（左25% | 中50% 业务分布地图 | 右25%） -->
    <ElRow :gutter="16" class="cockpit-body cockpit-row-2">
      <ElCol :xs="24" :md="6">
        <ElSkeleton :loading="moduleLoading.spendPace" animated>
          <template #template>
            <div class="cockpit-skeleton-panel">
              <ElSkeletonItem
                v-for="i in 8"
                :key="`spend-${i}`"
                variant="p"
                class="cockpit-s-line w92"
              />
            </div>
          </template>
          <CockpitSpendPaceMonitor :list="overview?.spendPace ?? []" />
        </ElSkeleton>
      </ElCol>
      <ElCol :xs="24" :md="12">
        <ElSkeleton :loading="moduleLoading.map" animated>
          <template #template>
            <div class="cockpit-skeleton-panel">
              <ElSkeletonItem
                v-for="i in 10"
                :key="`map-${i}`"
                variant="p"
                class="cockpit-s-line w95"
              />
            </div>
          </template>
          <CockpitBusinessMap
            :map-countries="overview?.mapCountries ?? []"
            :map-legend="overview?.mapLegend ?? []"
          />
        </ElSkeleton>
      </ElCol>
      <ElCol :xs="24" :md="6">
        <div class="cockpit-col3-row1">
          <ElSkeleton :loading="moduleLoading.top3" animated>
            <template #template>
              <div class="cockpit-skeleton-panel">
                <ElSkeletonItem
                  v-for="i in 8"
                  :key="`top3-${i}`"
                  variant="p"
                  class="cockpit-s-line w92"
                />
              </div>
            </template>
            <CockpitTop3Panels
              :top-revenue="overview?.topRevenue ?? []"
              :top-bad-review="overview?.topBadReview ?? []"
              :top-user="overview?.topUser ?? []"
            />
          </ElSkeleton>
        </div>
      </ElCol>
    </ElRow>

    <!-- 第三排：三列（左25% | 中50% 近7日收入结构流向 | 右25%） -->
    <ElRow :gutter="16" class="cockpit-body cockpit-row-3">
      <ElCol :xs="24" :md="6">
        <ElSkeleton :loading="moduleLoading.channelRoi" animated>
          <template #template>
            <div class="cockpit-skeleton-panel">
              <ElSkeletonItem
                v-for="i in 8"
                :key="`roi-${i}`"
                variant="p"
                class="cockpit-s-line w92"
              />
            </div>
          </template>
          <CockpitRevenueCostTrend :list="overview?.channelRoiInstall" />
        </ElSkeleton>
      </ElCol>
      <ElCol :xs="24" :md="12">
        <ElSkeleton :loading="moduleLoading.revenueFlow" animated>
          <template #template>
            <div class="cockpit-skeleton-panel">
              <ElSkeletonItem
                v-for="i in 10"
                :key="`flow-${i}`"
                variant="p"
                class="cockpit-s-line w95"
              />
            </div>
          </template>
          <CockpitRevenueStructureFlow :flow-data="overview?.revenueStructureFlow" />
        </ElSkeleton>
      </ElCol>
      <ElCol :xs="24" :md="6">
        <ElSkeleton :loading="moduleLoading.smartAlerts" animated>
          <template #template>
            <div class="cockpit-skeleton-panel">
              <ElSkeletonItem
                v-for="i in 8"
                :key="`smart-${i}`"
                variant="p"
                class="cockpit-s-line w92"
              />
            </div>
          </template>
          <CockpitSmartAlerts :alerts="overview?.smartAlerts ?? []" />
        </ElSkeleton>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
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

  const { overview, moduleLoading, dateRange, date, load } = useCockpitData()
  const suppressNextDateWatch = ref(false)

  function onDateRangeChange(value: CockpitDateRange) {
    dateRange.value = value
    // 让「日期范围 tabs」也驱动同一个 date，从而触发全局刷新
    suppressNextDateWatch.value = true
    load({ dateRange: value })
  }

  // 顶部日期选择器（单日）变更时，刷新全量模块接口
  watch(
    date,
    (v, oldV) => {
      if (!v || v === oldV) return
      if (suppressNextDateWatch.value) {
        suppressNextDateWatch.value = false
        return
      }
      load({ date: v, dateRange: dateRange.value })
    },
    { flush: 'post' }
  )
</script>

<style scoped lang="scss">
  .cockpit-page {
    padding-bottom: 20px;
  }

  .cockpit-skeleton-card-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .cockpit-skeleton-block,
  .cockpit-skeleton-panel {
    display: grid;
    gap: 10px;
    padding: 12px;
    margin-bottom: 16px;
    background: #131d2f;
    border: 1px solid rgb(148 163 184 / 25%);
    border-radius: 10px;
  }

  .cockpit-skeleton-panel {
    min-height: 220px;
  }

  .cockpit-s-line {
    height: 12px;
    border-radius: 6px;
  }

  .w24 {
    width: 100%;
  }

  .w92 {
    width: 92%;
  }

  .w95 {
    width: 95%;
  }

  .w96 {
    width: 96%;
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
