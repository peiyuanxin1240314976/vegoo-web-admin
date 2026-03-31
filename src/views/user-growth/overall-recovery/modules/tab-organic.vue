<template>
  <div
    class="or-tab-content or-tab-organic"
    v-loading="loading && !!tabData"
    element-loading-background="color-mix(in srgb, var(--default-box-color) 88%, transparent)"
  >
    <!-- 数据源提示 -->
    <div class="or-datasource-bar">
      <el-icon><InfoFilled /></el-icon>
      数据来源：BigQuery
      归因计算。该数据并不涉及到该用户人员的业务数据，通过规则计算用户量，国家级计划。最近更新：2026-03-11
      08:00
    </div>

    <!-- KPI 卡片行 -->
    <section v-if="loading && !tabData" class="or-kpi-grid or-kpi-grid--skeleton" aria-busy="true">
      <div v-for="n in 6" :key="n" class="or-kpi-skel">
        <ElSkeleton animated :rows="2" />
      </div>
    </section>
    <section v-else class="or-kpi-grid">
      <article
        v-for="card in tabData?.kpis ?? []"
        :key="card.id"
        class="or-kpi"
        :class="card.id === 'roiBoost' ? 'or-kpi--accent' : ''"
      >
        <div class="or-kpi__title">{{ card.title }}</div>
        <div class="or-kpi__value">{{ card.primaryValue }}</div>
        <div
          v-if="card.trendText"
          class="or-kpi__trend"
          :class="
            card.trendUp === undefined ? 'trend-neutral' : card.trendUp ? 'trend-up' : 'trend-down'
          "
        >
          <el-icon v-if="card.trendUp !== undefined">
            <Top v-if="card.trendUp" />
            <Bottom v-else />
          </el-icon>
          {{ card.trendText }}
        </div>
      </article>
    </section>

    <!-- 中部：4列图表 -->
    <section v-if="tabData" class="or-chart-grid">
      <!-- 自然量 vs 付费量趋势 -->
      <ElCard class="or-panel or-panel--trend" shadow="never">
        <template #header>
          <span class="or-panel-title">自然量 vs 付费量趋势（近30天）</span>
        </template>
        <div ref="trendChartRef" class="or-chart or-chart--trend"></div>
      </ElCard>

      <!-- 流量来源分析 -->
      <ElCard class="or-panel" shadow="never">
        <template #header><span class="or-panel-title">自然量/流量来源分析</span></template>
        <div ref="sourceChartRef" class="or-chart or-chart--donut"></div>
        <div class="source-legend">
          <div
            v-for="item in tabData?.trafficSources ?? []"
            :key="item.name"
            class="source-legend__item"
          >
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span>{{ item.name }}</span>
            <span class="legend-pct">{{ item.value }}%</span>
          </div>
        </div>
      </ElCard>

      <!-- 自然量 vs 付费用户对比（雷达） -->
      <ElCard class="or-panel" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>自然量 vs 付费用户量对比</span>
            <div class="radar-legend">
              <span class="radar-legend__item" style="color: #14b8a6">
                <span class="legend-dot" style="background: #14b8a6"></span>自然量
              </span>
              <span class="radar-legend__item" style="color: #4b8ef1">
                <span class="legend-dot" style="background: #4b8ef1"></span>付费
              </span>
            </div>
          </div>
        </template>
        <div ref="radarChartRef" class="or-chart or-chart--radar"></div>
      </ElCard>

      <!-- K-factor 趋势 -->
      <ElCard class="or-panel" shadow="never">
        <template #header><span class="or-panel-title">K-factor 趋势（30天）</span></template>
        <div ref="kfactorChartRef" class="or-chart or-chart--kfactor"></div>
      </ElCard>
    </section>

    <!-- 底部：K-factor渠道分析 + 国家分布 -->
    <section v-if="tabData" class="or-bottom-grid">
      <!-- K-factor 渠道分析 -->
      <ElCard class="or-panel" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>K-factor 渠道分析</span>
            <span class="panel-sort">排序: 自然量</span>
          </div>
        </template>
        <ElTable
          :data="tabData?.kfactorChannels ?? []"
          size="small"
          class="kfactor-table"
          style="width: 100%"
        >
          <ElTableColumn prop="source" label="广告平台" min-width="80">
            <template #default="{ row }">
              <span :class="row.source === '合计' ? 'row-total' : ''">{{ row.source }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="paidInstall" label="付费安装" min-width="75" />
          <ElTableColumn prop="organicDriven" label="自然带量" min-width="75" />
          <ElTableColumn prop="total" label="总量" min-width="65" />
          <ElTableColumn prop="kfactor" label="K-factor" min-width="75">
            <template #default="{ row }">
              <span :class="row.kfactor > 0.4 ? 'val-highlight' : ''">{{
                row.kfactor.toFixed(2)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="roiBoost" label="整体ROI增幅" min-width="95">
            <template #default="{ row }">
              <span class="val-up">+{{ row.roiBoost }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="K-factor趋势" min-width="95">
            <template #default="{ row }">
              <div class="sparkline-wrap">
                <MiniSparkline :data="row.trend" :color="row.kfactor > 0 ? '#14b8a6' : '#6B7280'" />
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>

      <!-- 国家自然量分布 Top 8 -->
      <ElCard class="or-panel" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>国家自然量分布 Top 8</span>
            <span class="panel-sort">排序: 自然量</span>
          </div>
        </template>
        <div class="country-grid">
          <div
            v-for="item in tabData?.countryTop8 ?? []"
            :key="item.countryCode"
            class="country-card"
          >
            <div class="country-card__header">
              <span class="country-flag">{{ countryFlag(item.countryCode) }}</span>
              <span class="country-name">{{ item.countryName }}</span>
            </div>
            <div class="country-card__stats">
              <div class="stat-row">
                <span class="stat-label">自然:</span>
                <span class="stat-val val-teal">{{ item.organicInstall.toLocaleString() }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">K-factor:</span>
                <span class="stat-val">{{ item.kfactor.toFixed(2) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">ROI增幅:</span>
                <span class="stat-val val-up">+{{ item.roiBoost }}%</span>
              </div>
            </div>
            <div class="country-bar-wrap">
              <div class="country-bar" :style="{ width: item.organicRatio + '%' }"></div>
            </div>
          </div>
        </div>
      </ElCard>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, nextTick, defineComponent, h } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { OverallRecoveryFilterState, OrganicTabData } from '../types'
  import { fetchOrganicTabData } from '@/api/user-growth'
  import { Top, Bottom, InfoFilled } from '@element-plus/icons-vue'

  defineOptions({ name: 'OrTabOrganic' })

  const props = defineProps<{ filter: OverallRecoveryFilterState }>()

  const tabData = ref<OrganicTabData | null>(null)
  const loading = ref(false)
  let loadSeq = 0

  // Mini sparkline component (inline SVG)
  const MiniSparkline = defineComponent({
    props: {
      data: { type: Array as () => number[], default: () => [] },
      color: { type: String, default: '#14b8a6' }
    },
    setup(p) {
      return () => {
        const d = p.data as number[]
        if (!d.length) return h('svg', { width: 80, height: 24 })
        const min = Math.min(...d)
        const max = Math.max(...d)
        const range = max - min || 1
        const w = 80
        const hh = 24
        const pts = d
          .map((v, i) => `${(i / (d.length - 1)) * w},${hh - ((v - min) / range) * (hh - 4) - 2}`)
          .join(' ')
        return h(
          'svg',
          { width: w, height: hh },
          h('polyline', {
            points: pts,
            fill: 'none',
            stroke: p.color,
            'stroke-width': 1.5,
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round'
          })
        )
      }
    }
  })

  function countryFlag(code: string): string {
    return code
      .toUpperCase()
      .split('')
      .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
      .join('')
  }

  const trendChart = useChart()
  const sourceChart = useChart()
  const radarChart = useChart()
  const kfactorChart = useChart()

  const trendChartRef = trendChart.chartRef
  const sourceChartRef = sourceChart.chartRef
  const radarChartRef = radarChart.chartRef
  const kfactorChartRef = kfactorChart.chartRef

  function buildTrendOption(): EChartsOption {
    const data = tabData.value?.trendData ?? []
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = trendChart
    return {
      tooltip: getTooltipStyle('axis'),
      legend: {
        data: ['付费', '自然', '自然占比'],
        bottom: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 }
      },
      grid: { top: 10, right: 40, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: { ...getAxisLabelStyle(), interval: 4 }
      },
      yAxis: [
        {
          type: 'value',
          splitLine: getSplitLineStyle(),
          axisLabel: getAxisLabelStyle()
        },
        {
          type: 'value',
          axisLabel: { ...getAxisLabelStyle(), formatter: '{value}%' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '付费',
          type: 'bar',
          stack: 'total',
          data: data.map((d) => d.paid),
          itemStyle: { color: '#4B8EF1' },
          barMaxWidth: 12
        },
        {
          name: '自然',
          type: 'bar',
          stack: 'total',
          data: data.map((d) => d.organic),
          itemStyle: { color: '#14B8A6' },
          barMaxWidth: 12
        },
        {
          name: '自然占比',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: data.map((d) => d.organicRatio),
          lineStyle: { color: '#F4923A', width: 2 },
          itemStyle: { color: '#F4923A' },
          symbol: 'none'
        }
      ]
    }
  }

  function buildSourceOption(): EChartsOption {
    const sources = tabData.value?.trafficSources ?? []
    const total = tabData.value?.kpis.find((k) => k.id === 'organicInstall')?.primaryValue ?? ''
    const { getTooltipStyle, isDark } = sourceChart
    return {
      tooltip: { ...getTooltipStyle('item'), formatter: '{b}: {c}%' },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: '自然量',
            fill: isDark.value ? '#aaa' : '#666',
            fontSize: 11
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '48%',
          style: {
            text: total,
            fill: isDark.value ? '#fff' : '#333',
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '58%',
          style: {
            text: '个',
            fill: isDark.value ? '#aaa' : '#666',
            fontSize: 11
          }
        }
      ],
      series: [
        {
          type: 'pie',
          radius: ['50%', '72%'],
          center: ['50%', '50%'],
          data: sources.map((s) => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color }
          })),
          label: { show: false },
          labelLine: { show: false }
        }
      ]
    } as unknown as EChartsOption
  }

  function buildRadarOption(): EChartsOption {
    const rd = tabData.value?.radarData
    if (!rd) return {}
    const { getTooltipStyle, isDark } = radarChart
    const indicatorMax = 100
    return {
      tooltip: getTooltipStyle('item'),
      radar: {
        indicator: rd.indicators.map((name) => ({ name, max: indicatorMax })),
        shape: 'polygon',
        splitNumber: 4,
        axisName: { color: isDark.value ? '#aaa' : '#666', fontSize: 11 },
        splitArea: { areaStyle: { color: ['transparent'] } },
        splitLine: { lineStyle: { color: isDark.value ? '#444' : '#ddd' } },
        axisLine: { lineStyle: { color: isDark.value ? '#444' : '#ddd' } }
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              name: '自然量',
              value: rd.organicValues,
              itemStyle: { color: '#14B8A6' },
              lineStyle: { color: '#14B8A6' },
              areaStyle: { color: 'rgba(20,184,166,0.15)' }
            },
            {
              name: '付费',
              value: rd.paidValues,
              itemStyle: { color: '#4B8EF1' },
              lineStyle: { color: '#4B8EF1' },
              areaStyle: { color: 'rgba(75,142,241,0.15)' }
            }
          ]
        }
      ]
    } as unknown as EChartsOption
  }

  function buildKfactorOption(): EChartsOption {
    const kd = tabData.value?.kfactorTrend
    if (!kd) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = kfactorChart
    return {
      tooltip: {
        ...getTooltipStyle('axis'),
        formatter: (params: any) =>
          `${params[0]?.axisValue}<br/>K-factor: <b>${params[0]?.value}</b>`
      },
      grid: { top: 10, right: 10, bottom: 20, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: kd.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: { ...getAxisLabelStyle(), interval: 6 }
      },
      yAxis: {
        type: 'value',
        min: 0.3,
        max: 0.6,
        splitLine: getSplitLineStyle(),
        axisLabel: getAxisLabelStyle()
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: kd.values,
          lineStyle: { color: '#14B8A6', width: 2 },
          itemStyle: { color: '#14B8A6' },
          areaStyle: { color: 'rgba(20,184,166,0.12)' },
          symbol: 'none'
        }
      ]
    }
  }

  async function loadData() {
    const seq = ++loadSeq
    loading.value = true
    try {
      const res = await fetchOrganicTabData({
        dateRange: props.filter.dateRange,
        s_app_id: props.filter.s_app_id,
        source: props.filter.source,
        s_country_code: props.filter.s_country_code
      })
      if (seq !== loadSeq) return
      tabData.value = res
      await nextTick()
      if (seq !== loadSeq) return
      trendChart.initChart(buildTrendOption())
      sourceChart.initChart(buildSourceOption())
      radarChart.initChart(buildRadarOption())
      kfactorChart.initChart(buildKfactorOption())
    } finally {
      if (seq === loadSeq) loading.value = false
    }
  }

  onMounted(loadData)
  watch(() => props.filter, loadData, { deep: true })
</script>

<style scoped lang="scss">
  @use '../../ad-performance/styles/ap-card-fx.scss' as *;

  .or-tab-organic {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 280px;
    padding-bottom: 16px;
  }

  .or-datasource-bar {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 12px 16px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-secondary);
    border-left: 3px solid #10b981;
    border-radius: 12px;
    box-shadow: 0 0 20px rgb(16 185 129 / 12%);

    @include ap-neon-bg;
  }

  /* KPI */
  .or-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  .or-kpi-grid--skeleton {
    margin-bottom: 0;
  }

  .or-kpi-skel {
    padding: 14px 16px;

    @include ap-neon-bg;

    border-radius: 14px;
  }

  .or-kpi {
    position: relative;
    padding: 14px 16px;

    @include ap-neon-bg;

    border-radius: 14px;

    &--accent {
      border-left: 3px solid #10b981;
      box-shadow:
        0 0 0 1px rgb(16 185 129 / 25%) inset,
        0 8px 28px rgb(16 185 129 / 12%);
    }

    &__title {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      margin-bottom: 4px;
      font-size: 22px;
      font-weight: 600;
      color: var(--art-gray-900);
      letter-spacing: -0.5px;
    }

    &__trend {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      font-size: 11px;

      &.trend-up {
        color: #14b8a6;
      }

      &.trend-down {
        color: #ef4444;
      }

      &.trend-neutral {
        color: var(--art-gray-500);
      }
    }
  }

  /* 中部4列 */
  .or-chart-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 12px;
  }

  /* 面板通用（卡片标题与广告成效 trend 卡对齐） */
  .or-panel {
    position: relative;
    overflow: hidden;
    border: none;

    @include ap-neon-bg;

    border-radius: 14px;

    :deep(.el-card__header) {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 12px 14px 8px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: 0.03em;
      background: transparent !important;
      border-bottom: 1px solid rgb(63 63 70 / 35%);
      transition: filter 0.32s var(--ease-out);
    }

    :deep(.panel-header-row) {
      color: var(--text-primary);
    }

    &:hover :deep(.el-card__header) {
      filter: drop-shadow(0 0 12px rgb(34 211 238 / 28%));
    }

    :deep(.el-card__header:not(:has(.panel-header-row))) {
      @include ap-title-gradient;

      font-size: 15px;
    }

    :deep(.panel-header-row > span:first-child) {
      @include ap-title-gradient;

      font-size: 15px;
      font-weight: 700;
    }

    :deep(.el-card__body) {
      padding: 12px 14px;
      padding-top: 8px;
      background: transparent;
    }
  }

  .or-panel-title {
    @include ap-title-gradient;

    font-size: 15px;
  }

  .panel-header-row {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .panel-sort {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-secondary);
    background: none;
    -webkit-text-fill-color: var(--text-secondary);
  }

  /* 图表 */
  .or-chart {
    width: 100%;

    &--trend {
      height: 260px;
    }

    &--donut {
      height: 180px;
    }

    &--radar {
      height: 240px;
    }

    &--kfactor {
      height: 260px;
    }
  }

  /* 流量来源图例 */
  .source-legend {
    margin-top: 8px;

    &__item {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 4px;
      font-size: 11px;
      color: var(--art-gray-600);
    }
  }

  .legend-pct {
    margin-left: auto;
    font-weight: 500;
    color: var(--art-gray-800);
  }

  .legend-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .radar-legend {
    display: flex;
    gap: 10px;

    &__item {
      display: flex;
      gap: 4px;
      align-items: center;
      font-size: 11px;
    }
  }

  /* 底部布局 — 固定较矮高度 */
  .or-bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    height: 260px;

    // 卡片高度跟随网格行高
    .or-panel {
      display: flex;
      flex-direction: column;
      height: 100%;

      :deep(.el-card__body) {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }
    }
  }

  /* K-factor 表 — 行高均分填满卡片 */
  .kfactor-table {
    flex: 1;

    :deep(.el-table__header th) {
      font-size: 12px;
      color: var(--art-gray-600);
      background: var(--default-bg-color);
    }

    :deep(.el-table__body td) {
      font-size: 12px;
    }

    // 让行高自动填满表格体
    :deep(.el-table__body tr.el-table__row td) {
      height: 36px;
    }
  }

  .row-total {
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .val-highlight {
    font-weight: 600;
    color: #14b8a6;
  }

  .val-up {
    color: #14b8a6;
  }

  .val-teal {
    font-weight: 600;
    color: #14b8a6;
  }

  .sparkline-wrap {
    display: flex;
    align-items: center;
  }

  /* 国家卡片网格 — 均分两行填满卡片体 */
  .country-grid {
    display: grid;
    flex: 1;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    min-height: 0;
  }

  .country-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 0;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--default-bg-color) 85%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 18%, var(--default-border));
    border-radius: 10px;

    &__header {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 6px;
    }

    &__stats {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: center;
    }
  }

  .country-flag {
    font-size: 18px;
    line-height: 1;
  }

  .country-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--art-gray-800);
  }

  .stat-row {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-bottom: 3px;
    font-size: 11px;

    .stat-label {
      color: var(--art-gray-500);
    }

    .stat-val {
      margin-left: auto;
      color: var(--art-gray-800);
    }
  }

  .country-bar-wrap {
    height: 3px;
    margin-top: 6px;
    overflow: hidden;
    background: var(--default-border);
    border-radius: 2px;
  }

  .country-bar {
    height: 100%;
    background: #14b8a6;
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  @media (width <= 1440px) {
    .or-chart-grid {
      grid-template-columns: 1fr 1fr;
    }

    .country-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 1280px) {
    .or-kpi-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .or-chart-grid {
      grid-template-columns: 1fr 1fr;
    }

    .or-bottom-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
