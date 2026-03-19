<template>
  <div class="tab-summary">
    <!-- 第一行：4 张详细 KPI 卡 -->
    <div class="summary-kpi-row">
      <div
        v-for="(card, i) in summary.kpiCards"
        :key="i"
        class="summary-kpi-card"
        :class="card.valueType ? `summary-kpi-card--${card.valueType}` : ''"
      >
        <div class="card-title">{{ card.title }}</div>
        <div class="card-value">{{ card.value }}</div>
        <div v-if="card.line1" class="card-line1">{{ card.line1 }}</div>
        <div v-if="card.line2" class="card-line2">{{ card.line2 }}</div>
      </div>
    </div>

    <!-- 第二行：趋势图 + 广告平台分布饼图 -->
    <ElRow :gutter="16" class="summary-charts-row">
      <ElCol :xs="24" :lg="14">
        <div class="my-ads-panel">
          <div class="my-ads-panel__header">
            <span class="my-ads-panel__title">{{ $t('myAds.summary.adSpendTrend') }}</span>
            <ElButton size="small" text>{{ $t('myAds.summary.byDay') }}</ElButton>
          </div>
          <div class="my-ads-panel__body">
            <div ref="trendChartRef" class="chart-container chart-trend"></div>
          </div>
        </div>
      </ElCol>
      <ElCol :xs="24" :lg="10">
        <div class="my-ads-panel">
          <div class="my-ads-panel__header">
            <span class="my-ads-panel__title">{{ $t('myAds.summary.channelDistribution') }}</span>
          </div>
          <div class="my-ads-panel__body">
            <div ref="donutChartRef" class="chart-container chart-donut"></div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 第三行：应用支出条形图 + 消耗进度监控 -->
    <ElRow :gutter="16" class="summary-charts-row">
      <ElCol :xs="24" :lg="12">
        <div class="my-ads-panel">
          <div class="my-ads-panel__header">
            <span class="my-ads-panel__title">{{ $t('myAds.summary.appSpendShare') }}</span>
          </div>
          <div class="my-ads-panel__body">
            <div ref="barChartRef" class="chart-container chart-bar"></div>
          </div>
        </div>
      </ElCol>
      <ElCol :xs="24" :lg="12">
        <div class="my-ads-panel">
          <div class="my-ads-panel__header my-ads-panel__header--pace">
            <span class="my-ads-panel__title">{{ $t('myAds.summary.paceMonitor') }}</span>
            <template v-if="summary.paceRemainingDays != null">
              <span class="pace-header-divider">|</span>
              <span class="remaining-days">
                {{ $t('myAds.summary.remainingDays', { n: summary.paceRemainingDays }) }}
              </span>
            </template>
          </div>
          <div class="my-ads-panel__body">
            <div class="pace-table">
              <div class="pace-table__head">
                <div class="pace-table__cell pace-table__cell--campaign">
                  {{ $t('myAds.summary.paceColCampaign') }}
                </div>
                <div class="pace-table__cell pace-table__cell--spend">
                  {{ $t('myAds.summary.paceColSpendBudget') }}
                </div>
                <div class="pace-table__cell pace-table__cell--progress">
                  {{ $t('myAds.summary.paceColProgress') }}
                </div>
                <div class="pace-table__cell pace-table__cell--roi">
                  {{ $t('myAds.summary.paceColRoi') }}
                </div>
                <div class="pace-table__cell pace-table__cell--status">
                  {{ $t('myAds.summary.paceColStatus') }}
                </div>
              </div>
              <div v-for="(row, idx) in summary.paceMonitor" :key="idx" class="pace-table__row">
                <div class="pace-table__cell pace-table__cell--campaign">
                  <span class="pace-name">{{ row.name }}</span>
                </div>
                <div class="pace-table__cell pace-table__cell--spend">
                  ${{ formatNum(row.spend) }} / ${{ formatNum(row.budget) }}
                </div>
                <div class="pace-table__cell pace-table__cell--progress">
                  <div class="pace-progress-wrap">
                    <div class="my-ads-progress-track">
                      <div
                        class="my-ads-progress-fill"
                        :class="progressFillClass(row)"
                        :style="{ width: Math.min(100, row.progress) + '%' }"
                      />
                    </div>
                    <span class="pace-percent">{{ row.progress }}%</span>
                  </div>
                </div>
                <div class="pace-table__cell pace-table__cell--roi">
                  <span class="pace-roi" :class="roiClass(row)">
                    {{ row.firstDayRoi != null ? row.firstDayRoi + '%' : '--' }}
                  </span>
                </div>
                <div class="pace-table__cell pace-table__cell--status">
                  <span class="pace-status" :class="'pace-status--' + row.status">
                    <span
                      v-if="row.status === 'over_budget'"
                      class="pace-status-icon pace-status-icon--warning"
                    >
                      <ElIcon><WarningFilled /></ElIcon>
                    </span>
                    <span
                      v-else
                      class="pace-status-dot"
                      :class="{
                        'pace-status-dot--normal': row.status === 'normal',
                        'pace-status-dot--gray': row.status === 'not_started'
                      }"
                    />
                    <span class="pace-status-text">{{ paceStatusLabel(row.status) }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import { ElIcon } from 'element-plus'
  import { WarningFilled } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type {
    MyAdsTrendPoint,
    MyAdsChannelItem,
    MyAdsAppSpendItem,
    MyAdsPaceRow,
    MyAdsSummaryKpiCard
  } from '../types'

  defineOptions({ name: 'MyAdsTabSummary' })

  const props = defineProps<{
    kpiCards: MyAdsSummaryKpiCard[]
    trend: MyAdsTrendPoint[]
    channelDistribution: MyAdsChannelItem[]
    appSpend: MyAdsAppSpendItem[]
    paceMonitor: MyAdsPaceRow[]
    paceRemainingDays?: number
  }>()

  const summary = ref({
    kpiCards: props.kpiCards,
    trend: props.trend,
    channelDistribution: props.channelDistribution,
    appSpend: props.appSpend,
    paceMonitor: props.paceMonitor,
    paceRemainingDays: props.paceRemainingDays
  })

  watch(
    () => [
      props.kpiCards,
      props.trend,
      props.channelDistribution,
      props.appSpend,
      props.paceMonitor,
      props.paceRemainingDays
    ],
    () => {
      summary.value = {
        kpiCards: props.kpiCards,
        trend: props.trend,
        channelDistribution: props.channelDistribution,
        appSpend: props.appSpend,
        paceMonitor: props.paceMonitor,
        paceRemainingDays: props.paceRemainingDays
      }
    },
    { deep: true }
  )

  const trendChartRef = ref<HTMLElement | null>(null)
  const donutChartRef = ref<HTMLElement | null>(null)
  const barChartRef = ref<HTMLElement | null>(null)
  let trendChart: ReturnType<typeof echarts.init> | null = null
  let donutChart: ReturnType<typeof echarts.init> | null = null
  let barChart: ReturnType<typeof echarts.init> | null = null

  const { t } = useI18n()

  function formatNum(n: number) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function paceStatusLabel(status: 'normal' | 'over_budget' | 'not_started') {
    const key =
      status === 'normal'
        ? 'statusNormal'
        : status === 'over_budget'
          ? 'statusOverBudget'
          : 'statusNotStarted'
    return t('myAds.summary.' + key)
  }

  function progressFillClass(row: { status: string; progress: number }) {
    if (row.status === 'over_budget') return 'my-ads-progress-fill--danger'
    if (row.status === 'not_started' || row.progress === 0) return 'my-ads-progress-fill--gray'
    if (row.progress >= 90) return 'my-ads-progress-fill--warning'
    return 'my-ads-progress-fill--normal'
  }

  function roiClass(row: { firstDayRoi: number | null; status: string }) {
    if (row.firstDayRoi == null) return 'pace-roi--empty'
    if (row.status === 'over_budget') return 'pace-roi--danger'
    if (row.firstDayRoi >= 36) return 'pace-roi--success'
    if (row.firstDayRoi >= 30) return 'pace-roi--warning'
    return 'pace-roi--danger'
  }

  const COLORS = {
    green: '#67c23a',
    yellow: '#e6a23c',
    primary: '#38bdf8',
    gray: '#9ca3af'
  }

  function buildTrendOption(): EChartsOption {
    const dates = summary.value.trend.map((d) => d.date)
    const adSpend = summary.value.trend.map((d) => d.adSpend)
    const profit = summary.value.trend.map((d) => d.estimatedProfit)
    const roi = summary.value.trend.map((d) => d.firstDayRoi)
    return {
      grid: { top: 24, right: 40, bottom: 24, left: 50 },
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['广告支出', '预估利润', '首日ROI'],
        bottom: 0,
        textStyle: { color: '#9ca3af', fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.35)' } },
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: [
        {
          type: 'value',
          name: '金额',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
          axisLabel: { color: '#9ca3af' }
        },
        {
          type: 'value',
          name: '%',
          min: 0,
          max: 60,
          axisLine: { show: false },
          splitLine: { show: false },
          axisLabel: { color: '#9ca3af' }
        }
      ],
      series: [
        {
          name: '广告支出',
          type: 'line',
          data: adSpend,
          smooth: true,
          areaStyle: { color: 'rgba(56, 189, 248, 0.2)' },
          lineStyle: { color: COLORS.primary },
          itemStyle: { color: COLORS.primary }
        },
        {
          name: '预估利润',
          type: 'line',
          data: profit,
          smooth: true,
          yAxisIndex: 0,
          lineStyle: { color: COLORS.green },
          itemStyle: { color: COLORS.green }
        },
        {
          name: '首日ROI',
          type: 'line',
          data: roi,
          yAxisIndex: 1,
          smooth: true,
          lineStyle: { type: 'dashed', color: COLORS.yellow },
          itemStyle: { color: COLORS.yellow }
        }
      ]
    }
  }

  function buildDonutOption(): EChartsOption {
    const total = summary.value.channelDistribution.reduce((s, i) => s + i.value, 0)
    const data = summary.value.channelDistribution.map((i) => ({
      name: i.name + ' ' + i.percent + '%',
      value: i.value
    }))
    const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#9ca3af']
    return {
      tooltip: { trigger: 'item' },
      graphic: [
        {
          type: 'text',
          left: '50%',
          top: '42%',
          style: {
            text: `总支出\n$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            fill: '#e5e7eb',
            fontSize: 14
          },
          z: 10
        }
      ],
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: { color: '#9ca3af', fontSize: 12 },
        data: data.map((d) => d.name)
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          data,
          itemStyle: {
            color: (params: any) => colors[params.dataIndex % colors.length]
          },
          label: { color: '#e5e7eb', fontSize: 12 },
          labelLine: { lineStyle: { color: 'rgba(148,163,184,0.5)' } }
        }
      ]
    }
  }

  function buildBarOption(): EChartsOption {
    const items = summary.value.appSpend
    return {
      grid: { top: 16, right: 120, bottom: 24, left: 60 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'value',
        max: 100,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: {
        type: 'category',
        data: items.map((i) => i.appName),
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.35)' } },
        axisLabel: { color: '#9ca3af' }
      },
      series: [
        {
          type: 'bar',
          data: items.map((i) => i.percent),
          barWidth: '50%',
          itemStyle: {
            color: (params: any) => {
              const item = items[params.dataIndex]
              return item.roiTrend === 'down' ? '#f56c6c' : '#67c23a'
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const item = items[params.dataIndex]
              const roiStr =
                item.firstDayRoi +
                '%' +
                (item.roiTrend === 'up' ? ' ▲' : item.roiTrend === 'down' ? ' ▼' : '')
              return `${item.percent}%, $${formatNum(item.spend)}, 首日ROI ${roiStr}`
            },
            color: '#e5e7eb',
            fontSize: 11
          }
        }
      ]
    }
  }

  function initCharts() {
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption(buildTrendOption())
    }
    if (donutChartRef.value) {
      donutChart = echarts.init(donutChartRef.value)
      donutChart.setOption(buildDonutOption())
    }
    if (barChartRef.value) {
      barChart = echarts.init(barChartRef.value)
      barChart.setOption(buildBarOption())
    }
  }

  function resizeCharts() {
    trendChart?.resize()
    donutChart?.resize()
    barChart?.resize()
  }

  onMounted(() => {
    initCharts()
    window.addEventListener('resize', resizeCharts)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCharts)
    trendChart?.dispose()
    donutChart?.dispose()
    barChart?.dispose()
  })
</script>

<style lang="scss" scoped>
  @use '../styles/my-ads-common.scss' as *;

  .tab-summary {
    padding-bottom: 20px;
  }

  .summary-kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .summary-kpi-card {
    padding: 14px 16px;
    background: $my-ads-panel-bg;
    border: 1px solid $my-ads-panel-border;
    border-radius: $my-ads-panel-radius;
    box-shadow: 0 10px 30px rgb(15 23 42 / 40%);

    .card-title {
      margin-bottom: 6px;
      font-size: 12px;
      color: $my-ads-text-secondary;
    }

    .card-value {
      font-size: 22px;
      font-weight: 700;
      color: $my-ads-text-primary;
    }

    .card-line1,
    .card-line2 {
      margin-top: 4px;
      font-size: 12px;
      color: $my-ads-text-secondary;
    }

    &.summary-kpi-card--primary .card-value {
      color: $my-ads-primary;
    }

    &.summary-kpi-card--success .card-value {
      color: $my-ads-success;
    }

    &.summary-kpi-card--warning .card-value {
      color: $my-ads-warning;
    }
  }

  .summary-charts-row {
    margin-bottom: 16px;
  }

  .chart-container {
    width: 100%;
    height: 280px;
  }

  .chart-donut {
    height: 260px;
  }

  .my-ads-panel__header--pace {
    flex-wrap: wrap;
    gap: 4px;
  }

  .pace-header-divider {
    margin: 0 2px;
    color: $my-ads-text-secondary;
  }

  .remaining-days {
    font-size: 12px;
    color: $my-ads-warning;
  }

  .pace-table {
    font-size: 13px;
  }

  .pace-table__head,
  .pace-table__row {
    display: grid;
    grid-template-columns: 1fr 1fr 140px 72px 80px;
    gap: 12px;
    align-items: center;
  }

  .pace-table__head {
    padding-bottom: 10px;
    margin-bottom: 8px;
    font-size: 12px;
    color: $my-ads-text-secondary;
    border-bottom: 1px solid $my-ads-panel-border;
  }

  .pace-table__row {
    min-height: 36px;
    padding: 8px 0;

    &:not(:last-child) {
      border-bottom: 1px solid rgb(148 163 184 / 15%);
    }
  }

  .pace-table__cell--campaign .pace-name {
    color: $my-ads-text-primary;
  }

  .pace-table__cell--spend {
    color: $my-ads-text-secondary;
  }

  .pace-progress-wrap {
    display: flex;
    gap: 8px;
    align-items: center;

    .my-ads-progress-track {
      flex: 1;
      min-width: 0;
    }

    .pace-percent {
      flex-shrink: 0;
      font-size: 12px;
      color: $my-ads-text-secondary;
    }
  }

  .pace-roi {
    font-size: 13px;

    &.pace-roi--success {
      color: $my-ads-success;
    }

    &.pace-roi--warning {
      color: $my-ads-warning;
    }

    &.pace-roi--danger {
      color: $my-ads-danger;
    }

    &.pace-roi--empty {
      color: $my-ads-text-secondary;
    }
  }

  .pace-status {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;

    .pace-status-icon {
      display: inline-flex;
      font-size: 14px;
      color: $my-ads-warning;
    }

    .pace-status-dot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.pace-status-dot--normal {
        background: $my-ads-success;
      }

      &.pace-status-dot--gray {
        background: $my-ads-text-secondary;
      }
    }

    &.pace-status--normal .pace-status-text {
      color: $my-ads-success;
    }

    &.pace-status--over_budget .pace-status-text {
      color: $my-ads-warning;
    }

    &.pace-status--not_started .pace-status-text {
      color: $my-ads-text-secondary;
    }
  }

  @media (width <= 992px) {
    .summary-kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 576px) {
    .summary-kpi-row {
      grid-template-columns: 1fr;
    }
  }
</style>
