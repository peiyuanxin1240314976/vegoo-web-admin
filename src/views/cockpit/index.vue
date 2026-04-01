<template>
  <div class="cockpit-page flex flex-col">
    <div class="cockpit-page-fx" aria-hidden="true"></div>
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

    <ScenarioSimulationDialog v-model="showScenarioSimulation" />
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
  import ScenarioSimulationDialog from './modules/scenario-simulation-dialog.vue'
  // dev测试提交
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
    position: relative;
    min-width: 0;
    padding: 20px 24px 28px;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          rgb(16 185 129 / 42%) 0%,
          rgb(6 182 212 / 20%) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          rgb(59 130 246 / 38%) 0%,
          rgb(139 92 246 / 18%) 38%,
          transparent 58%
        ),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 18%) 0%, transparent 55%),
        radial-gradient(
          ellipse 55% 42% at 76% 4%,
          rgb(34 211 238 / 22%) 0%,
          rgb(59 130 246 / 10%) 40%,
          transparent 58%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation:
        cockpit-aurora-drift 14s ease-in-out infinite alternate,
        cockpit-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 8%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > *:not(.cockpit-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .cockpit-page-fx {
    position: absolute;
    inset: 0 0 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 14%) 55deg,
      rgb(6 182 212 / 10%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 12%) 200deg,
      rgb(52 211 153 / 8%) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 10%) 330deg,
      rgb(249 115 22 / 6%) 350deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: cockpit-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes cockpit-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    50% {
      opacity: 1;
      transform: scale(1.06) translate(1.2%, -1.2%);
    }

    100% {
      opacity: 0.82;
      transform: scale(1) translate(-1.2%, 1.2%);
    }
  }

  @keyframes cockpit-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.04);
    }
  }

  @keyframes cockpit-fx-spin {
    to {
      transform: rotate(360deg);
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
    margin-bottom: 20px;
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
    margin-bottom: 0;
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

  @media (width <= 768px) {
    .cockpit-page {
      padding-bottom: 16px;
    }
  }

  /* 小屏：彻底移除装饰层，释放 GPU 合成层与绘制开销（与 md 栅格断点一致） */
  @media (width <= 992px) {
    .cockpit-page::before,
    .cockpit-page::after {
      /* content: none 完全移除伪元素，不再占用任何合成层或绘制资源 */
      content: none;
    }

    .cockpit-page-fx {
      /* display: none 移除元素 + 撤销 will-change，彻底释放 GPU 纹理分配 */
      display: none;
      will-change: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cockpit-page::before,
    .cockpit-page::after,
    .cockpit-page-fx {
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
    border-radius: 12px;

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
  }

  html.dark .el-card.cockpit-panel .el-card__header,
  html.dark .el-card.cockpit-map-panel .el-card__header {
    position: relative;
    z-index: 1;
    background: transparent;
    border-bottom: 1px solid rgb(96 165 250 / 14%);
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

  html.dark .cockpit-pace-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 12px;

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

    .pace-header {
      position: relative;
      z-index: 1;
      background: transparent;
      border-bottom: 1px solid rgb(96 165 250 / 14%);
    }

    .pace-body {
      position: relative;
      z-index: 1;
      background: transparent;
    }
  }

  html:not(.dark) .cockpit-pace-panel {
    position: relative;
    overflow: hidden;
    background: var(--el-bg-color);
    border-radius: 12px;

    @include ap-card-mesh;

    .pace-header,
    .pace-body {
      position: relative;
      z-index: 1;
    }
  }

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
