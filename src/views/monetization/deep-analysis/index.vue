<template>
  <div class="monetization-deep-analysis-page" v-loading="loading">
    <!-- 顶部筛选条（与其他变现页面保持一致） -->
    <div class="monetization-header">
      <MonetizationDateRangeFilters
        :model-value="dateRange"
        @update:model-value="onDateRangeChange"
        @filterChange="onFilterChange"
      />
    </div>

    <!-- 主体两列布局 -->
    <div class="deep-analysis-layout">
      <!-- 左侧列：SECTION 1 + 按广告网络分析 -->
      <div class="deep-analysis-col deep-analysis-col--left">
        <!-- SECTION 1 顶部 KPI 卡片 -->
        <section class="section section--kpi">
          <header class="section-header">
            <div class="section-title-wrap">
              <h2 class="section-title">SECTION 1</h2>
              <span class="section-subtitle">{{ appName }}</span>
            </div>
            <div class="section-meta">
              <span class="section-tag">变现深度分析</span>
            </div>
          </header>

          <div class="kpi-grid">
            <ElCard class="kpi-card kpi-card--revenue" shadow="never">
              <div class="kpi-card-header">
                <span class="kpi-label">总收入</span>
                <span class="kpi-trend" :class="trendClass(section1.totalRevenue.trend)">
                  {{ formatTrend(section1.totalRevenue.trend) }}
                </span>
              </div>
              <div class="kpi-value-wrap">
                <span class="kpi-value">{{ formatCurrency(section1.totalRevenue.value) }}</span>
              </div>
              <div class="kpi-mini-chart">
                <!-- 这里只做简单占位线条，后续可换成迷你图 -->
                <span class="kpi-mini-line" />
              </div>
            </ElCard>

            <ElCard class="kpi-card kpi-card--ecpm" shadow="never">
              <div class="kpi-card-header">
                <span class="kpi-label">平均 eCPM</span>
                <span class="kpi-trend" :class="trendClass(section1.avgEcpM.trend)">
                  {{ formatTrend(section1.avgEcpM.trend) }}
                </span>
              </div>
              <div class="kpi-value-wrap">
                <span class="kpi-value">{{ formatCurrency(section1.avgEcpM.value) }}</span>
              </div>
              <div class="kpi-target-line">
                <span class="kpi-target-label"
                  >目标：{{ formatCurrency(section1.avgEcpM.target) }}</span
                >
              </div>
            </ElCard>

            <ElCard class="kpi-card kpi-card--fill-rate" shadow="never">
              <div class="kpi-card-header">
                <span class="kpi-label">平均填充率</span>
                <span class="kpi-trend" :class="trendClass(section1.avgFillRate.trend)">
                  {{ formatTrend(section1.avgFillRate.trend) }}
                </span>
              </div>
              <div class="kpi-value-wrap">
                <span class="kpi-value">{{ section1.avgFillRate.value }}%</span>
              </div>
              <div class="kpi-progress-bar">
                <div class="kpi-progress-track">
                  <div
                    class="kpi-progress-fill"
                    :style="{ width: section1.avgFillRate.value + '%' }"
                  />
                </div>
              </div>
            </ElCard>

            <ElCard class="kpi-card kpi-card--impression" shadow="never">
              <div class="kpi-card-header">
                <span class="kpi-label">平均展示率</span>
                <span class="kpi-trend" :class="trendClass(section1.avgImpressionRate.trend)">
                  {{ formatTrend(section1.avgImpressionRate.trend) }}
                </span>
              </div>
              <div class="kpi-value-wrap">
                <span class="kpi-value kpi-value--small">
                  {{ section1.avgImpressionRate.value }}%
                </span>
                <span class="kpi-desc">平均展示率</span>
              </div>
              <div class="kpi-split-row">
                <span class="kpi-split-label">总展示次数</span>
                <span class="kpi-split-value">
                  {{ section1.totalImpressions.toLocaleString() }}
                </span>
              </div>
            </ElCard>
          </div>
        </section>

        <!-- 按广告网络分析 -->
        <section class="section section--network">
          <header class="section-header section-header--compact">
            <div class="section-title-wrap">
              <h3 class="section-title">按广告网络分析</h3>
            </div>
          </header>

          <div class="network-table">
            <div class="network-table-header">
              <span class="col col--network">广告网络</span>
              <span class="col">收入</span>
              <span class="col">展示次数</span>
              <span class="col">eCPM</span>
              <span class="col">填充率</span>
              <span class="col">点击率</span>
              <span class="col col--share">收入占比</span>
              <span class="col col--action">操作</span>
            </div>
            <div v-for="item in adNetworkList" :key="item.id" class="network-table-row">
              <div class="col col--network">
                <div class="network-info">
                  <div class="network-logo">
                    <span class="network-logo-text">{{ item.shortName }}</span>
                  </div>
                  <div class="network-meta">
                    <span class="network-name">{{ item.name }}</span>
                  </div>
                </div>
              </div>
              <span class="col">{{ formatCurrency(item.revenue) }}</span>
              <span class="col">{{ item.impressions.toLocaleString() }}</span>
              <span class="col">{{ formatCurrency(item.ecpm) }}</span>
              <span class="col">{{ item.fillRate }}%</span>
              <span class="col">{{ item.ctr }}%</span>
              <div class="col col--share">
                <div class="share-bar">
                  <div class="share-bar-track">
                    <div class="share-bar-fill" :style="{ width: item.revenueShare + '%' }" />
                  </div>
                  <span class="share-text">{{ item.revenueShare }}%</span>
                </div>
              </div>
              <div class="col col--action">
                <ElLink type="primary" :underline="false">查看详情</ElLink>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧列：饼图 + 近7天趋势 + 瀑布流/桑基图 -->
      <div class="deep-analysis-col deep-analysis-col--right">
        <!-- 按广告形式分析（饼图） -->
        <ElCard class="chart-panel" shadow="never">
          <template #header>
            <span>按广告形式分析</span>
          </template>
          <div ref="adFormatPieRef" class="chart-container" />
        </ElCard>

        <!-- 近7天趋势分析（折线图） -->
        <ElCard class="chart-panel" shadow="never">
          <template #header>
            <span>近 7 天趋势分析</span>
          </template>
          <div ref="trendRef" class="chart-container" />
        </ElCard>

        <!-- 广告源瀑布流分析（使用桑基图模拟瀑布流关系） -->
        <ElCard class="chart-panel" shadow="never">
          <template #header>
            <span>广告源瀑布流分析</span>
          </template>
          <div ref="waterfallRef" class="chart-container" />
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch, ref } from 'vue'
  import type { EChartsOption } from 'echarts'
  import { useChart } from '@/hooks/core/useChart'
  import MonetizationDateRangeFilters from '../monetization-analysis/modules/date-range-filters.vue'
  import type { MonetizationDateRange } from '../monetization-analysis/types'

  defineOptions({ name: 'MonetizationDeepAnalysis' })

  const loading = ref(false)

  const dateRange = ref<MonetizationDateRange>('week')
  const appName = ref('PhoneTracker2')

  function onDateRangeChange(value: MonetizationDateRange) {
    dateRange.value = value
  }
  function onFilterChange() {
    // 这里后续可接后端接口
  }

  type Trend = {
    value: number
    direction: 'up' | 'down' | 'flat'
  }

  interface Section1Data {
    totalRevenue: { value: number; trend: Trend }
    avgEcpM: { value: number; trend: Trend; target: number }
    avgFillRate: { value: number; trend: Trend }
    avgImpressionRate: { value: number; trend: Trend }
    totalImpressions: number
  }

  interface AdNetworkRow {
    id: string
    name: string
    shortName: string
    revenue: number
    impressions: number
    ecpm: number
    fillRate: number
    ctr: number
    revenueShare: number
  }

  const section1 = ref<Section1Data>({
    totalRevenue: { value: 45287, trend: { value: 8.5, direction: 'up' } },
    avgEcpM: { value: 12.35, trend: { value: 2.1, direction: 'up' }, target: 10 },
    avgFillRate: { value: 87.5, trend: { value: -1.2, direction: 'down' } },
    avgImpressionRate: { value: 45.2, trend: { value: 0.8, direction: 'up' } },
    totalImpressions: 3670000
  })

  const adNetworkList = ref<AdNetworkRow[]>([
    {
      id: 'admob',
      name: 'AdMob',
      shortName: 'A',
      revenue: 28456,
      impressions: 2311000,
      ecpm: 13.22,
      fillRate: 92.5,
      ctr: 1.8,
      revenueShare: 62.8
    },
    {
      id: 'meta',
      name: 'Meta Audience Network',
      shortName: 'M',
      revenue: 9845,
      impressions: 756000,
      ecpm: 13.02,
      fillRate: 85.2,
      ctr: 2.1,
      revenueShare: 21.7
    },
    {
      id: 'unity',
      name: 'Unity Ads',
      shortName: 'U',
      revenue: 5657,
      impressions: 421000,
      ecpm: 10.85,
      fillRate: 78.3,
      ctr: 1.9,
      revenueShare: 10.1
    },
    {
      id: 'applovin',
      name: 'AppLovin',
      shortName: 'L',
      revenue: 2419,
      impressions: 189000,
      ecpm: 12.8,
      fillRate: 81.7,
      ctr: 1.5,
      revenueShare: 5.4
    }
  ])

  function formatCurrency(n: number) {
    return (
      '$' +
      n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    )
  }

  function trendClass(trend: Trend) {
    if (trend.direction === 'up') return 'trend--up'
    if (trend.direction === 'down') return 'trend--down'
    return 'trend--flat'
  }

  function formatTrend(trend: Trend) {
    const prefix = trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''
    return `${prefix}${Math.abs(trend.value).toFixed(1)}% vs last week`
  }

  const adFormatPieData = computed(() => [
    { name: 'Banner', value: 26257 },
    { name: '插屏', value: 10542 },
    { name: '激励视频', value: 8456 },
    { name: '原生', value: 1032 }
  ])

  const trendData = computed(() => ({
    dates: ['01-21', '01-22', '01-23', '01-24', '01-25', '01-26', '01-27'],
    revenue: [5200, 6100, 5800, 6400, 7200, 6900, 7500],
    ecpm: [11.2, 11.8, 12.1, 12.4, 12.9, 12.7, 13.1],
    fillRate: [86, 87, 88, 89, 88, 87, 89]
  }))

  const waterfallData = computed(() => ({
    nodes: [
      { name: '所有流量' },
      { name: 'AdMob' },
      { name: 'Meta' },
      { name: 'Unity' },
      { name: 'AppLovin' },
      { name: '其他' }
    ],
    links: [
      { source: '所有流量', target: 'AdMob', value: 62.8 },
      { source: '所有流量', target: 'Meta', value: 21.7 },
      { source: '所有流量', target: 'Unity', value: 10.1 },
      { source: '所有流量', target: 'AppLovin', value: 5.4 },
      { source: '所有流量', target: '其他', value: 3.0 }
    ]
  }))

  const {
    chartRef: adFormatPieRef,
    initChart: initPieChart,
    updateChart: updatePieChart,
    getTooltipStyle,
    getLegendStyle,
    getGridWithLegend,
    useChartOps
  } = useChart()

  const {
    chartRef: trendRef,
    initChart: initTrendChart,
    updateChart: updateTrendChart
  } = useChart()

  const {
    chartRef: waterfallRef,
    initChart: initWaterfallChart,
    updateChart: updateWaterfallChart
  } = useChart()

  function buildPieOption(): EChartsOption {
    const { colors } = useChartOps()
    return {
      tooltip: getTooltipStyle('item'),
      legend: getLegendStyle('bottom', { type: 'scroll' }),
      color: colors,
      series: [
        {
          name: '广告形式',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#121212',
            borderWidth: 1
          },
          label: {
            formatter: '{b}\n{d}%',
            color: '#ccc'
          },
          data: adFormatPieData.value
        }
      ],
      grid: getGridWithLegend(true, 'bottom')
    }
  }

  function buildTrendOption(): EChartsOption {
    const d = trendData.value
    return {
      tooltip: getTooltipStyle('axis'),
      legend: getLegendStyle('bottom', {
        data: ['收入', 'eCPM', '填充率']
      }),
      grid: getGridWithLegend(true, 'bottom', { top: 32 }),
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: d.dates
      },
      yAxis: [
        {
          type: 'value',
          name: '收入 ($)',
          splitLine: { show: true }
        },
        {
          type: 'value',
          name: 'eCPM / 填充率',
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '收入',
          type: 'line',
          smooth: true,
          data: d.revenue
        },
        {
          name: 'eCPM',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: d.ecpm
        },
        {
          name: '填充率',
          type: 'bar',
          yAxisIndex: 1,
          data: d.fillRate
        }
      ]
    }
  }

  function buildWaterfallOption(): EChartsOption {
    const d = waterfallData.value
    return {
      tooltip: getTooltipStyle('item'),
      series: [
        {
          type: 'sankey',
          emphasis: { focus: 'adjacency' },
          nodeGap: 12,
          lineStyle: {
            color: 'source',
            curveness: 0.5
          },
          data: d.nodes,
          links: d.links,
          label: {
            color: '#ccc'
          }
        }
      ]
    }
  }

  onMounted(() => {
    initPieChart(buildPieOption())
    initTrendChart(buildTrendOption())
    initWaterfallChart(buildWaterfallOption())
  })

  watch(adFormatPieData, () => updatePieChart(buildPieOption()), { deep: true })
  watch(trendData, () => updateTrendChart(buildTrendOption()), { deep: true })
  watch(waterfallData, () => updateWaterfallChart(buildWaterfallOption()), { deep: true })
</script>

<style scoped lang="scss">
  .monetization-deep-analysis-page {
    padding-bottom: 20px;
  }

  .monetization-header {
    margin-bottom: 16px;
  }

  .deep-analysis-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (width >= 992px) {
      flex-direction: row;
      align-items: stretch;
    }
  }

  .deep-analysis-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .deep-analysis-col--left {
    flex: 3;
    min-width: 0;
  }

  .deep-analysis-col--right {
    flex: 2;
    min-width: 0;
  }

  .section {
    padding: 16px 18px;
    background: var(--el-bg-color-overlay);
    border-radius: 12px;
    box-shadow: 0 2px 6px rgb(15 25 35 / 12%);
  }

  .section--network {
    padding-top: 12px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-header--compact {
    margin-bottom: 10px;
  }

  .section-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .section-subtitle {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .section-meta {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .section-tag {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--el-color-primary);
    background: rgb(64 158 255 / 10%);
    border-radius: 999px;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    @media (width >= 1200px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .kpi-card {
    position: relative;

    :deep(.el-card__body) {
      padding: 12px 14px;
    }
  }

  .kpi-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .kpi-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .kpi-trend {
    font-size: 11px;
  }

  .trend--up {
    color: var(--el-color-success);
  }

  .trend--down {
    color: var(--el-color-danger);
  }

  .trend--flat {
    color: var(--el-text-color-secondary);
  }

  .kpi-value-wrap {
    display: flex;
    gap: 4px;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .kpi-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .kpi-value--small {
    font-size: 18px;
  }

  .kpi-desc {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .kpi-mini-chart {
    margin-top: 4px;
  }

  .kpi-mini-line {
    display: block;
    width: 100%;
    height: 18px;
    background: linear-gradient(90deg, #67c23a 0%, #409eff 50%, #e6a23c 100%);
    border-radius: 999px;
    opacity: 0.7;
  }

  .kpi-target-line {
    margin-top: 2px;
    font-size: 11px;
    color: var(--el-color-success);
  }

  .kpi-progress-bar {
    margin-top: 4px;
  }

  .kpi-progress-track {
    width: 100%;
    height: 6px;
    overflow: hidden;
    background: var(--el-fill-color-light);
    border-radius: 999px;
  }

  .kpi-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
    border-radius: inherit;
  }

  .kpi-split-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 12px;
  }

  .kpi-split-label {
    color: var(--el-text-color-secondary);
  }

  .kpi-split-value {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .network-table {
    margin-top: 4px;
  }

  .network-table-header {
    display: grid;
    grid-template-columns: 1.5fr repeat(5, 1fr) 1.4fr 0.9fr;
    padding: 8px 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .network-table-row {
    display: grid;
    grid-template-columns: 1.5fr repeat(5, 1fr) 1.4fr 0.9fr;
    align-items: center;
    padding: 8px 10px;
    font-size: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--el-fill-color-lighter);
    }
  }

  .col {
    display: flex;
    align-items: center;
  }

  .col--network {
    min-width: 0;
  }

  .col--share {
    justify-content: flex-start;
  }

  .col--action {
    justify-content: flex-end;
  }

  .network-info {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .network-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
    border-radius: 8px;
  }

  .network-logo-text {
    transform: translateY(0.5px);
  }

  .network-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .network-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .share-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  .share-bar-track {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: var(--el-fill-color-light);
    border-radius: 999px;
  }

  .share-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
    border-radius: inherit;
  }

  .share-text {
    font-size: 12px;
    color: var(--el-text-color-primary);
  }

  .chart-panel {
    :deep(.el-card__body) {
      padding: 10px 12px 12px;
    }
  }

  .chart-container {
    height: 260px;
  }
</style>
