<template>
  <div class="cockpit-page flex flex-col">
    <!-- 1. 日期范围 + 2. 顶部操作栏 -->
    <div class="cockpit-page__section cockpit-page__section--header cockpit-entry-1">
      <div class="cockpit-header">
        <CockpitDateRangeTabs :model-value="dateRange" @update:model-value="onDateRangeChange" />
        <CockpitTopBarActions
          v-model="date"
          @open-scenario-simulation="showScenarioSimulation = true"
        />
      </div>
    </div>

    <div class="cockpit-entry-2">
      <!-- 3. 第一排 KPI 卡片 + 4. 警示与提示：只调一次 POST .../cockpit/overall，两处共用该次返回的 data -->
      <ElSkeleton :loading="moduleLoading.kpiAlert" animated>
        <template #template>
          <div class="cockpit-skeleton-card-list">
            <ElSkeletonItem
              v-for="i in 4"
              :key="`kpi-${i}`"
              variant="p"
              class="cockpit-s-line w24"
            />
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
    </div>

    <div class="cockpit-entry-3">
      <!-- 第二排：三列（左25% | 中50% 业务分布地图 | 右25%） -->
      <ElRow :gutter="16" class="cockpit-body cockpit-row-2">
        <ElCol :xs="24" :md="7">
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
        <ElCol :xs="24" :md="5">
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
              <div class="cockpit-top3-panels-wrap">
                <CockpitTop3Panels
                  :top-revenue="overview?.topRevenue ?? []"
                  :top-bad-review="overview?.topBadReview ?? []"
                  :top-user="overview?.topUser ?? []"
                  :date-range="dateRange"
                />
              </div>
            </ElSkeleton>
          </div>
        </ElCol>
      </ElRow>

      <!-- 第三排：左侧保留，右侧两块上下结构 -->
      <ElRow :gutter="16" class="cockpit-body cockpit-row-3">
        <ElCol :xs="24" :md="7">
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

        <ElCol :xs="24" :md="17">
          <div class="cockpit-row-3-stack">
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
          </div>
        </ElCol>
      </ElRow>
    </div>

    <ScenarioSimulationDialog v-if="showScenarioSimulation" v-model="showScenarioSimulation" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, defineAsyncComponent } from 'vue'
  import { useCockpitData } from './composables/useCockpitData'
  import type { CockpitDateRange } from './types'
  import CockpitDateRangeTabs from './modules/date-range-tabs.vue'
  import CockpitTopBarActions from './modules/top-bar-actions.vue'
  import CockpitGlobalKpiCards from './modules/global-kpi-cards.vue'
  import CockpitAlertMessages from './modules/alert-messages.vue'
  /** 重组件异步分包，减轻首进驾驶舱的 parse/执行与离页卸载峰值 */
  const CockpitRevenueCostTrend = defineAsyncComponent(
    () => import('./modules/revenue-cost-trend.vue')
  )
  const CockpitSpendPaceMonitor = defineAsyncComponent(
    () => import('./modules/spend-pace-monitor.vue')
  )
  const CockpitBusinessMap = defineAsyncComponent(() => import('./modules/business-map.vue'))
  const CockpitTop3Panels = defineAsyncComponent(() => import('./modules/top3-panels.vue'))
  const CockpitSmartAlerts = defineAsyncComponent(() => import('./modules/smart-alerts.vue'))
  const CockpitRevenueStructureFlow = defineAsyncComponent(
    () => import('./modules/revenue-structure-flow.vue')
  )
  const ScenarioSimulationDialog = defineAsyncComponent(
    () => import('./modules/scenario-simulation-dialog.vue')
  )
  defineOptions({ name: 'Cockpit' })

  const showScenarioSimulation = ref(false)
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
    --cockpit-border: rgb(110 164 255 / 22%);
    --cockpit-highlight: rgb(255 255 255 / 13%);
    --cockpit-shadow: 0 22px 54px rgb(2 6 23 / 52%), 0 10px 24px rgb(2 6 23 / 36%);

    position: relative;
    min-width: 0;
    padding: 14px 14px 18px;
    overflow: hidden;
    background:
      radial-gradient(circle at 12% 10%, rgb(23 84 255 / 18%), transparent 26%),
      radial-gradient(circle at 82% 8%, rgb(94 57 255 / 14%), transparent 24%),
      radial-gradient(circle at 70% 34%, rgb(18 169 255 / 10%), transparent 24%),
      linear-gradient(180deg, #040816 0%, #050b18 34%, #030712 100%);
    border: 1px solid rgb(72 120 255 / 10%);
    border-radius: 24px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 5%),
      0 0 0 1px rgb(10 19 43 / 82%),
      0 28px 90px rgb(2 6 23 / 44%);

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 66% 42% at 6% 3%,
          rgb(23 166 255 / 30%) 0%,
          rgb(80 70 255 / 16%) 36%,
          transparent 60%
        ),
        radial-gradient(
          ellipse 55% 42% at 98% 4%,
          rgb(118 92 255 / 26%) 0%,
          rgb(31 140 255 / 16%) 32%,
          transparent 60%
        ),
        radial-gradient(ellipse 42% 28% at 50% 18%, rgb(0 214 255 / 8%) 0%, transparent 56%),
        radial-gradient(
          ellipse 64% 44% at 76% 4%,
          rgb(255 138 61 / 11%) 0%,
          rgb(35 125 255 / 10%) 40%,
          transparent 60%
        );
      opacity: 0.9;
      mask-image: linear-gradient(to bottom, black 0%, black 34%, transparent 72%);
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(148 163 184 / 4.5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(148 163 184 / 4.5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(56 189 248 / 7%) 1px, transparent 1px);
      background-size:
        42px 42px,
        42px 42px,
        84px 84px;
      opacity: 0.8;
      mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  .cockpit-entry-1 {
    animation: cockpit-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.05s;
  }

  .cockpit-entry-2 {
    animation: cockpit-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.12s;
  }

  .cockpit-entry-3 {
    flex: 1;
    min-width: 0;
    animation: cockpit-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.2s;
  }

  @keyframes cockpit-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  .cockpit-page__section--header {
    margin-bottom: 12px;
  }

  .cockpit-skeleton-card-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 12px;
  }

  .cockpit-skeleton-block,
  .cockpit-skeleton-panel {
    display: grid;
    gap: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
    background:
      linear-gradient(180deg, rgb(13 21 42 / 90%), rgb(8 14 30 / 92%)),
      radial-gradient(circle at top, rgb(59 130 246 / 12%), transparent 54%);
    border: 1px solid var(--cockpit-border);
    border-radius: 18px;
    box-shadow:
      inset 0 1px 0 var(--cockpit-highlight),
      var(--cockpit-shadow);
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
    gap: 14px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
  }

  .cockpit-body {
    margin-bottom: 18px;

    .cockpit-panel,
    .cockpit-map-kpi {
      margin-bottom: 18px;
    }
  }

  .cockpit-row-2 {
    align-items: stretch;

    .cockpit-col3-row1 {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin-bottom: 0;
    }
  }

  .cockpit-row-2 :deep(.channel-roi-panel) {
    min-height: 100%;
  }

  .cockpit-row-2 :deep(.channel-roi-panel .panel-header) {
    padding: 10px 14px;
  }

  .cockpit-row-2 :deep(.channel-roi-panel .panel-body) {
    padding: 8px 10px 10px;
  }

  .cockpit-row-2 :deep(.channel-roi-panel .roi-table) {
    font-size: 12px;
  }

  .cockpit-row-2 :deep(.cockpit-map-kpi .cockpit-map-panel > .el-card__header) {
    padding: 10px 14px;
  }

  .cockpit-row-2 :deep(.cockpit-map-kpi .map-wrap) {
    min-height: 0;
  }

  .cockpit-row-2 :deep(.cockpit-map-kpi .map-chart) {
    height: clamp(300px, 46vh, 460px);
  }

  .cockpit-row-2 :deep(.cockpit-map-kpi .map-empty) {
    min-height: clamp(300px, 43vh, 440px);
  }

  .cockpit-row-2 :deep(.cockpit-top3-panels) {
    gap: 10px;
  }

  .cockpit-row-2 :deep(.top3-module__header) {
    padding: 10px 12px;
  }

  .cockpit-row-2 :deep(.top3-module__list) {
    padding: 6px 10px 10px;
  }

  .cockpit-row-2 :deep(.top3-row) {
    min-height: 32px;
    padding: 4px 0;
  }

  .cockpit-row-2 :deep(.top3-row__app-icon) {
    width: 24px;
    height: 24px;
  }

  .cockpit-row-2 :deep(.top3-row__medal) {
    font-size: 20px;
  }

  .cockpit-row-3-stack {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  .cockpit-row-roi__col {
    min-width: 0;
  }

  .cockpit-top3-panels-wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .cockpit-top3-panels-wrap :deep(.cockpit-top3-panels) {
    height: 100%;
  }

  @media (width <= 768px) {
    .cockpit-page {
      padding: 12px 12px 16px;
      border-radius: 18px;
    }
  }

  /* 小屏：彻底移除装饰层，释放 GPU 合成层与绘制开销（与 md 栅格断点一致） */
  @media (width <= 992px) {
    .cockpit-page::before,
    .cockpit-page::after {
      /* content: none 完全移除伪元素，不再占用任何合成层或绘制资源 */
      content: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cockpit-page::before,
    .cockpit-page::after {
      animation: none;
    }

    .cockpit-entry-1,
    .cockpit-entry-2,
    .cockpit-entry-3 {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
</style>

<style lang="scss">
  @use '../user-growth/ad-performance/styles/ap-card-fx' as *;

  /* 深色：与广告成效同系霓虹面板 */
  html.dark .cockpit-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgb(8 14 30 / 92%), rgb(5 10 24 / 96%)),
      radial-gradient(circle at 12% -6%, rgb(37 99 235 / 14%), transparent 34%),
      radial-gradient(circle at 88% -4%, rgb(168 85 247 / 12%), transparent 28%);
    border: 1px solid rgb(92 140 255 / 22%);
    border-radius: 20px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 8%),
      0 18px 42px rgb(2 6 23 / 44%),
      0 0 0 1px rgb(30 41 59 / 40%);

    @include ap-neon-bg;
    @include ap-card-mesh;
    @include ap-panel-hover;

    &:hover,
    &:active {
      transform: none !important;
    }

    &:active {
      transition-duration: var(--duration-fast);
    }

    &::after {
      position: absolute;
      inset: 1px;
      pointer-events: none;
      content: '';
      background:
        linear-gradient(180deg, rgb(255 255 255 / 5%), transparent 16%),
        radial-gradient(circle at top, rgb(96 165 250 / 10%), transparent 34%);
      border-radius: inherit;
      opacity: 0.9;
    }
  }

  html.dark .el-card.cockpit-panel .el-card__header,
  html.dark .el-card.cockpit-map-panel .el-card__header {
    position: relative;
    z-index: 1;
    background: transparent;
    border-bottom: 1px solid rgb(96 165 250 / 12%);
  }

  html.dark .el-card.cockpit-panel .el-card__body,
  html.dark .el-card.cockpit-map-panel .el-card__body {
    position: relative;
    z-index: 1;
    background: transparent;
  }

  /* 浅色：Top3 等保持白底，不参与深色霓虹底 */
  html:not(.dark) .cockpit-panel:not(.top3-module) {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgb(37 99 235 / 6%), transparent 55%),
      radial-gradient(circle at bottom right, rgb(14 116 144 / 4%), transparent 55%), #0b1120;
    border: 1px solid rgb(148 163 184 / 25%);
    border-radius: 12px;
    box-shadow:
      0 10px 30px rgb(15 23 42 / 40%),
      inset 0 0 0 1px rgb(15 23 42 / 85%);
    transition:
      box-shadow 0.42s var(--ease-out),
      border-color 0.32s var(--ease-default);

    @include ap-card-mesh;

    &:hover {
      border-color: rgb(96 165 250 / 45%);
      box-shadow:
        0 18px 40px rgb(15 23 42 / 45%),
        0 0 0 1px rgb(96 165 250 / 15%),
        inset 0 1px 0 rgb(186 230 253 / 10%);
    }
  }

  /* 消耗节奏监控已在模块内部改为 KPI 卡片外壳（旋转边框/深浅色），此处不再做全局覆盖 */

  /* 面板头部：左标题 + 右侧操作区 */
  .cockpit-panel__header {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 14px;
  }

  html.dark .cockpit-panel__header {
    color: #e5e7eb;
    background: transparent;
    border-bottom: 1px solid rgb(96 165 250 / 18%);
  }

  html:not(.dark) .cockpit-panel__header {
    color: var(--el-text-color-primary);
    background: linear-gradient(
      90deg,
      rgb(248 250 252 / 95%),
      rgb(241 245 249 / 88%),
      rgb(248 250 252 / 95%)
    );
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  html.dark .cockpit-panel__title {
    @include ap-title-gradient;
  }

  html:not(.dark) .cockpit-panel__title {
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
