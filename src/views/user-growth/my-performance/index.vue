<template>
  <div class="my-performance-page art-full-height">
    <div class="mp-page-fx" aria-hidden="true"></div>
    <div class="mp-entry-header">
      <MyPerformanceHeader
        :person-options="data.personOptions"
        :person-id="data.selectedPersonId"
        :period-type="data.periodType"
        :period-value="data.selectedPeriodValue"
        :period-options="data.periodOptions"
        :left-primary="leftPrimaryText"
        :left-secondary="leftSecondaryText"
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
    </div>

    <div class="top-row">
      <MyPerformanceTopCard
        :loading="cardLoading"
        :person="selectedPerson"
        :kpis="data.topKpis"
        :responsible-label="$t('myPerformance.personCard.responsible')"
      />
    </div>

    <ElRow :gutter="16" class="data-row">
      <ElCol :xs="24" :lg="7" class="left-col">
        <div class="left-stack">
          <MyPerformancePanelKpiAchievement
            :loading="cardLoading"
            :title="$t('myPerformance.panels.kpiAchievement')"
            :achievement="data.kpiAchievement"
            :col-label="$t('myPerformance.kpiTable.col.label')"
            :col-target="$t('myPerformance.kpiTable.col.target')"
            :col-actual="$t('myPerformance.kpiTable.col.actual')"
            :col-rate="$t('myPerformance.kpiTable.col.rate')"
            :col-score="$t('myPerformance.kpiTable.col.score')"
          />
          <MyPerformancePanelRoiTrend
            :loading="cardLoading"
            :title="data.roiTrend.title"
            :points="data.roiTrend.points"
          />
          <MyPerformancePanelSpendProgress
            v-if="data.periodType === 'month'"
            :loading="cardLoading"
            :title="data.spendProgress.title"
            :list="data.spendProgress.list"
            :hint-text="spendAchievementHint"
          />
          <MyPerformancePanelPerformanceHistory
            :loading="cardLoading"
            :title="data.performanceHistory.title"
            :list="data.performanceHistory.list"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :lg="17" class="right-col">
        <div class="right-wrap">
          <MyPerformancePanelAppDimensionTable
            :loading="cardLoading"
            title="按应用绩效评估 | 近7天绩效评估"
            :list="data.appTable.list"
            :summary="data.appTable.summary"
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
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import MyPerformanceHeader from './components/my-performance-header.vue'
  import MyPerformanceTopCard from './components/my-performance-top-card.vue'
  import MyPerformancePanelKpiAchievement from './components/panel-kpi-achievement.vue'
  import MyPerformancePanelRoiTrend from './components/panel-roi-trend.vue'
  import MyPerformancePanelAppDimensionTable from './components/panel-app-dimension-table.vue'
  import MyPerformancePanelSpendProgress from './components/panel-spend-progress.vue'
  import MyPerformancePanelPerformanceHistory from './components/panel-performance-history.vue'
  import { useMyPerformancePage } from './composables/useMyPerformancePage'

  defineOptions({ name: 'MyPerformance' })

  const { t } = useI18n()

  const {
    data,
    loading,
    detailLoading,
    selectedPerson,
    onPersonChange,
    onPeriodTypeChange,
    onPeriodValueChange
  } = useMyPerformancePage()

  const cardLoading = computed(() => loading.value || detailLoading.value)
  const currentDateText = computed(() => formatYYYYMMDD(getAppNow()))
  const computeRangeText = computed(() => {
    const end = getAppNow()
    const start = cloneAppDate(end)
    start.setDate(start.getDate() - 3)
    return `${formatYYYYMMDD(start)} 至 ${formatYYYYMMDD(end)}`
  })
  const leftPrimaryText = computed(() => `当前日期：${currentDateText.value}`)
  const leftSecondaryText = computed(() => `计算日期：${computeRangeText.value}`)

  function parseSpendTotalPair(value: string): { spend: number; target: number } | null {
    const parts = String(value).split(/\s*\/\s*/)
    if (parts.length !== 2) return null
    const toNum = (s: string) => {
      const n = Number(String(s).replace(/[$,\s]/g, ''))
      return Number.isFinite(n) ? n : NaN
    }
    const spend = toNum(parts[0])
    const target = toNum(parts[1])
    if (!Number.isFinite(spend) || !Number.isFinite(target)) return null
    return { spend, target }
  }

  const spendAchievementHint = computed(() => {
    const rows = data.value.spendProgress?.list ?? []
    const totalRow = rows.find((x) => x.label.includes('总消耗')) ?? rows[0]
    if (!totalRow) return ''
    const pair = parseSpendTotalPair(totalRow.value)
    if (!pair) return ''
    const remaining = pair.target - pair.spend
    if (remaining <= 0) return t('myPerformance.spendAchievement.hintReached')
    const amount =
      '$' +
      remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return t('myPerformance.spendAchievement.hint', { amount })
  })
</script>

<style scoped lang="scss">
  .my-performance-page {
    position: relative;
    min-width: 0;
    padding: var(--space-4) var(--space-5) var(--space-6);
    overflow-x: visible;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 75% 55% at 8% 8%, rgb(16 185 129 / 16%) 0%, transparent 52%),
        radial-gradient(ellipse 65% 50% at 92% 88%, rgb(59 130 246 / 14%) 0%, transparent 52%),
        radial-gradient(ellipse 45% 40% at 48% 48%, rgb(168 85 247 / 9%) 0%, transparent 50%),
        radial-gradient(ellipse 55% 45% at 75% 15%, rgb(34 211 238 / 8%) 0%, transparent 45%);
      background-position:
        0% 0%,
        100% 100%,
        50% 50%,
        80% 20%;
      background-size:
        100% 100%,
        100% 100%,
        100% 100%,
        120% 120%;
      mask-image: linear-gradient(to bottom, black 0%, black 32%, transparent 58%);
      animation:
        aurora-drift 14s ease-in-out infinite alternate,
        mp-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 4%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 4%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 6%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 46%);
    }

    > *:not(.mp-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .mp-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 8%) 55deg,
      rgb(6 182 212 / 6%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 7%) 200deg,
      rgb(52 211 153 / 5%) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 6%) 330deg,
      rgb(249 115 22 / 4%) 350deg,
      transparent 360deg
    );
    opacity: 0.78;
    mask-image: linear-gradient(to bottom, black 0%, black 48%, transparent 82%);
    animation: mp-page-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes mp-page-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes mp-bg-flow {
    0% {
      background-position:
        0% 0%,
        100% 100%,
        50% 50%,
        80% 20%;
    }

    100% {
      background-position:
        6% 4%,
        94% 96%,
        52% 48%,
        65% 35%;
    }
  }

  @keyframes aurora-drift {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(18deg);
      opacity: 1;
      transform: scale(1.06) translate(1.2%, -1.2%);
    }

    100% {
      filter: hue-rotate(-12deg);
      opacity: 0.82;
      transform: scale(1) translate(-1.2%, 1.2%);
    }
  }

  .mp-entry-header {
    margin-bottom: var(--space-4);
    animation: slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.04s;
  }

  .top-row {
    margin-bottom: var(--space-4);
    animation: slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.12s;
  }

  .data-row {
    padding-bottom: var(--space-6);
    animation: slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.22s;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
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
    overflow: visible;
  }

  .table-hint {
    position: relative;
    padding: 14px 18px 14px 20px;
    margin-top: var(--space-3);
    overflow: hidden;
    color: var(--text-secondary);
    background-color: rgb(24 24 27 / 78%);
    background-image:
      radial-gradient(ellipse 85% 55% at 100% 0%, rgb(59 130 246 / 12%) 0%, transparent 48%),
      radial-gradient(ellipse 55% 45% at 0% 100%, rgb(16 185 129 / 9%) 0%, transparent 42%),
      linear-gradient(168deg, rgb(39 39 42 / 52%) 0%, rgb(24 24 27 / 82%) 100%);
    backdrop-filter: blur(14px) saturate(1.08);
    border: 1px solid rgb(72 72 80 / 40%);
    border-radius: 14px;
    box-shadow:
      0 10px 32px rgb(0 0 0 / 26%),
      inset 0 1px 0 rgb(244 244 245 / 7%),
      0 0 40px rgb(59 130 246 / 4%);

    &:hover {
      border-color: rgb(96 165 250 / 45%);
      box-shadow:
        0 18px 48px rgb(0 0 0 / 32%),
        inset 0 1px 0 rgb(244 244 245 / 10%),
        0 0 48px rgb(59 130 246 / 10%);
    }

    &:hover .table-hint__title {
      filter: drop-shadow(0 0 12px rgb(34 211 238 / 30%));
    }

    &:hover .table-hint__list li {
      color: rgb(244 244 245 / 88%);
    }

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      width: 3px;
      height: 100%;
      content: '';
      background: linear-gradient(
        180deg,
        rgb(34 211 238 / 80%),
        rgb(16 185 129 / 60%),
        rgb(59 130 246 / 50%)
      );
      border-radius: 3px 0 0 3px;
    }

    &::after {
      position: absolute;
      top: -50%;
      left: -50%;
      z-index: 0;
      width: 200%;
      height: 200%;
      pointer-events: none;
      content: '';
      background: conic-gradient(
        from 0deg at 50% 50%,
        transparent 0deg,
        rgb(16 185 129 / 5%) 60deg,
        transparent 120deg,
        rgb(59 130 246 / 5%) 200deg,
        transparent 300deg
      );
      opacity: 0.45;
    }
  }

  .table-hint__title {
    position: relative;
    z-index: 1;
    display: inline-block;
    margin-bottom: 6px;
    font-size: var(--font-size-aux);
    font-weight: 700;
    letter-spacing: 0.02em;
    background-color: transparent;
    background-image: linear-gradient(
      95deg,
      rgb(244 244 245 / 92%) 0%,
      rgb(186 230 253 / 78%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 100%;
    -webkit-text-fill-color: transparent;
  }

  .table-hint__list {
    position: relative;
    z-index: 1;
    padding-left: var(--space-4);
    margin: 0;
    font-size: var(--font-size-aux);
    line-height: 1.7;

    li + li {
      margin-top: 3px;
    }
  }

  .left-stack {
    display: grid;
    gap: var(--space-4);
    min-width: 0;

    > * {
      min-width: 0;
    }

    :deep(.panel),
    :deep(.spend-panel) {
      width: 100%;
      min-width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .my-performance-page::before {
      animation: none;
    }

    .mp-page-fx {
      animation: none;
    }

    .table-hint {
      transition: none;
    }

    .table-hint:hover {
      transform: none;
    }

    .table-hint::before {
      animation: none;
    }

    .table-hint::after {
      animation: none;
    }

    .table-hint__title {
      transition: none;
    }

    .mp-entry-header,
    .top-row,
    .data-row {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
</style>
