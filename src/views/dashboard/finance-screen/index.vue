<template>
  <div ref="rootRef" class="finance-screen-root art-full-height">
    <div
      class="finance-screen-wrap"
      :style="{
        width: `${designWidth}px`,
        height: `${designHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }"
    >
      <!-- 顶栏：日期 + 筛选 + 导出 -->
      <header class="finance-header">
        <div class="header-left">{{ currentTime }}</div>
        <div class="header-filters">
          <span class="filter-item">全部Apps</span>
          <span class="filter-divider">|</span>
          <span class="filter-item">IOS & Android</span>
          <span class="filter-divider">|</span>
          <span class="filter-item">全部渠道</span>
        </div>
        <div class="header-right">
          <button type="button" class="btn-export">导出报表</button>
        </div>
      </header>

      <!-- 第一排：渠道 KPI 卡片 -->
      <section class="row row-1">
        <div v-for="card in channelKpiCards" :key="card.id" class="kpi-card">
          <div class="kpi-card-head">
            <span class="kpi-card-name">{{ card.name }}</span>
          </div>
          <div class="kpi-card-roi">
            <span class="roi-value">{{ card.roi }}</span>
            <span class="roi-change" :class="card.roiChangeUp ? 'up' : 'down'">
              {{ card.roiChangeUp ? '+' : '' }}{{ card.roiChange }}%
            </span>
          </div>
          <div class="kpi-card-metrics">
            <span>花费 {{ card.cost }}</span>
            <span>收入 {{ card.revenue }}</span>
            <span>CPI {{ card.cpi }}</span>
          </div>
          <div class="kpi-card-quality">
            质量评分 {{ card.qualityScore }}/{{ card.qualityMax }} 星
          </div>
          <div :ref="(el) => setCardChartRef(card.id, el)" class="kpi-card-mini-chart"></div>
        </div>
      </section>

      <!-- 第二排：ROI 趋势 | 用户质量热力图 | 渠道质量雷达 -->
      <section class="row row-2">
        <div class="panel panel-trend">
          <div class="panel-title">渠道ROI趋势分析 (最近30天)</div>
          <div ref="roiTrendRef" class="chart-dom"></div>
        </div>
        <div class="panel panel-heatmap">
          <div class="panel-title">用户质量热力图</div>
          <div class="heatmap-wrap">
            <table class="heatmap-table">
              <thead>
                <tr>
                  <th>渠道</th>
                  <th>D1留存</th>
                  <th>D7留存</th>
                  <th>D30留存</th>
                  <th>支付比例</th>
                  <th>ARPU</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in userQualityHeatmap" :key="row.channel">
                  <td class="cell-channel">{{ row.channel }}</td>
                  <td :class="heatmapCellClass(row.d1Retention, 50)">{{ row.d1Retention }}%</td>
                  <td :class="heatmapCellClass(row.d7Retention, 35)">{{ row.d7Retention }}%</td>
                  <td :class="heatmapCellClass(row.d30Retention, 16)">{{ row.d30Retention }}%</td>
                  <td :class="heatmapCellClass(row.payRate, 4)">{{ row.payRate }}%</td>
                  <td :class="heatmapCellClass(row.arpu * 20, 50)">${{ row.arpu.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="panel panel-radar">
          <div class="panel-title">渠道质量得分</div>
          <div ref="radarRef" class="chart-dom"></div>
        </div>
      </section>

      <!-- 第三排：渠道指标比较详情表格 -->
      <section class="row row-3">
        <div class="panel panel-table">
          <div class="panel-title">渠道指标比较详情</div>
          <div class="table-wrap">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>渠道名称</th>
                  <th>花费</th>
                  <th>收入</th>
                  <th>ROI</th>
                  <th>ROAS</th>
                  <th>CPI</th>
                  <th>安装量</th>
                  <th>User Quality (D7)</th>
                  <th>User Quality(Pay%)</th>
                  <th>LTV_7</th>
                  <th>LTV_30</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in paginatedMetrics" :key="row.channel">
                  <td>{{ row.channel }}</td>
                  <td>{{ row.cost }}</td>
                  <td>{{ row.revenue }}</td>
                  <td>
                    <span>{{ row.roi }}</span>
                    <span class="mini-bar" :class="row.roiTrendUp ? 'up' : 'down'"></span>
                  </td>
                  <td>{{ row.roas }}</td>
                  <td>
                    <span>${{ row.cpi }}</span>
                    <span class="mini-bar" :class="row.cpiTrendUp ? 'down' : 'up'"></span>
                  </td>
                  <td>{{ row.installs }}</td>
                  <td>
                    <span>{{ row.userQualityD7 }}%</span>
                    <span class="arrow" :class="row.userQualityD7TrendUp ? 'up' : 'down'">{{
                      row.userQualityD7TrendUp ? '↑' : '↓'
                    }}</span>
                    <span class="mini-bar" :class="row.userQualityD7TrendUp ? 'up' : 'down'"></span>
                  </td>
                  <td>
                    <span>{{ row.userQualityPay }}%</span>
                    <span class="arrow" :class="row.userQualityPayTrendUp ? 'up' : 'down'">{{
                      row.userQualityPayTrendUp ? '↑' : '↓'
                    }}</span>
                    <span
                      class="mini-bar"
                      :class="row.userQualityPayTrendUp ? 'up' : 'down'"
                    ></span>
                  </td>
                  <td>${{ row.ltv7.toFixed(2) }}</td>
                  <td>${{ row.ltv30.toFixed(2) }}</td>
                  <td>
                    <span class="status-dot" :class="row.status"></span>
                    {{ statusText(row.status) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-wrap">
            <button
              type="button"
              class="page-btn"
              :disabled="currentPage <= 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              &lt;
            </button>
            <button
              v-for="p in pageNumbers"
              :key="p"
              type="button"
              class="page-btn"
              :class="{ active: p === currentPage }"
              @click="currentPage = p"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="page-btn"
              :disabled="currentPage >= totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              &gt;
            </button>
            <span class="page-size">10条/页</span>
            <span class="page-jump"
              >跳至
              <input
                v-model.number="pageJump"
                type="number"
                min="1"
                :max="totalPages"
                @change="onPageJump"
              />
              页</span
            >
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import { getAppNow } from '@/utils/app-now'
  import {
    MOCK_CHANNEL_KPI_CARDS,
    MOCK_CHANNEL_ROI_TREND,
    MOCK_USER_QUALITY_HEATMAP,
    MOCK_RADAR_INDICATORS,
    MOCK_CHANNEL_RADAR,
    MOCK_CHANNEL_METRICS,
    type ChannelKpiCard,
    type ChannelMetricRow,
    type ChannelStatus
  } from './mock'

  defineOptions({ name: 'FinanceScreen' })

  const designWidth = 1920
  const designHeight = 1080
  const pageSize = 10

  const rootRef = ref<HTMLElement>()
  const scale = ref(1)
  const updateScale = () => {
    const el = rootRef.value
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    scale.value = w / designWidth
  }

  const currentTime = ref('')
  const updateTime = () => {
    const now = getAppNow()
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
    currentTime.value = `今天${week}, ${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`
  }
  let timeTimer: ReturnType<typeof setInterval> | null = null

  const channelKpiCards = ref<ChannelKpiCard[]>(MOCK_CHANNEL_KPI_CARDS)
  const userQualityHeatmap = ref(MOCK_USER_QUALITY_HEATMAP)
  const channelMetrics = ref<ChannelMetricRow[]>(MOCK_CHANNEL_METRICS)

  const currentPage = ref(1)
  const pageJump = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(channelMetrics.value.length / pageSize)))
  const pageNumbers = computed(() => {
    const total = totalPages.value
    const p = currentPage.value
    const pages: number[] = []
    for (let i = Math.max(1, p - 2); i <= Math.min(total, p + 2); i++) {
      pages.push(i)
    }
    return pages
  })
  const paginatedMetrics = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return channelMetrics.value.slice(start, start + pageSize)
  })

  function onPageJump() {
    const v = Math.max(1, Math.min(totalPages.value, Number(pageJump.value) || 1))
    currentPage.value = v
    pageJump.value = v
  }

  function statusText(s: ChannelStatus) {
    const map: Record<ChannelStatus, string> = { excellent: '优秀', average: '一般', poor: '较差' }
    return map[s] ?? s
  }

  /** 热力图单元格：高于阈值绿色，低于阈值红色 */
  function heatmapCellClass(value: number, threshold: number) {
    return value >= threshold ? 'cell-high' : 'cell-low'
  }

  const cardChartRefs = ref<Record<string, HTMLElement>>({})
  function setCardChartRef(id: string, el: unknown) {
    if (el instanceof HTMLElement) {
      cardChartRefs.value[id] = el
    } else if (el === null) {
      delete cardChartRefs.value[id]
    }
  }

  const roiTrendRef = ref<HTMLElement>()
  const radarRef = ref<HTMLElement>()

  const chartRoiTrend = useChart()
  const chartRadar = useChart()
  const theme = {
    color1: '#4ABEFF',
    color2: '#14DEBA',
    color3: '#9a60b4',
    color4: '#e6c547',
    color5: '#5b8ff9',
    axis: '#8b9dc3',
    label: '#b8c5d9'
  }

  const colors = [theme.color1, theme.color2, theme.color3, theme.color4, theme.color5]

  function buildMiniTrendOption(data: number[]): EChartsOption {
    return {
      grid: { left: 2, right: 2, top: 2, bottom: 2 },
      xAxis: { type: 'category', data: data.map((_, i) => i), show: false },
      yAxis: {
        type: 'value',
        show: false,
        scale: true,
        min: (v: { min: number }) => v.min * 0.9,
        max: (v: { max: number }) => v.max * 1.1
      },
      series: [
        {
          type: 'line',
          data,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: theme.color1, width: 1.5 },
          areaStyle: { color: theme.color1, opacity: 0.3 }
        }
      ]
    }
  }

  function buildRoiTrendOption(): EChartsOption {
    const d = MOCK_CHANNEL_ROI_TREND
    return {
      tooltip: { trigger: 'axis' },
      legend: {
        data: d.series.map((s) => s.name),
        bottom: 0,
        textStyle: { color: theme.label, fontSize: 11 }
      },
      grid: { left: 50, right: 24, top: 24, bottom: 36 },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: theme.axis, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 2,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisLabel: { color: theme.axis, fontSize: 11 }
      },
      series: d.series.map((s, i) => ({
        type: 'line',
        name: s.name,
        data: s.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: colors[i % colors.length], width: 2 },
        itemStyle: { color: colors[i % colors.length] }
      }))
    }
  }

  function buildRadarOption(): EChartsOption {
    return {
      tooltip: { trigger: 'item' },
      legend: {
        data: MOCK_CHANNEL_RADAR.map((s) => s.name),
        bottom: 0,
        textStyle: { color: theme.label, fontSize: 11 }
      },
      radar: {
        indicator: MOCK_RADAR_INDICATORS,
        center: ['50%', '52%'],
        radius: '58%',
        axisName: { color: theme.axis, fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitArea: {
          show: true,
          areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] }
        }
      },
      series: [
        {
          type: 'radar',
          data: MOCK_CHANNEL_RADAR.map((item, i) => ({
            name: item.name,
            value: item.value,
            symbolSize: 4,
            lineStyle: { width: 1.5, color: colors[i % colors.length] },
            itemStyle: { color: colors[i % colors.length] },
            areaStyle: { opacity: 0.2, color: colors[i % colors.length] }
          }))
        }
      ]
    }
  }

  let resizeObserver: ResizeObserver | null = null
  const cardCharts = ref<{ destroyChart?: () => void }[]>([])

  onMounted(() => {
    updateScale()
    updateTime()
    timeTimer = setInterval(updateTime, 1000)
    if (rootRef.value) {
      resizeObserver = new ResizeObserver(() => updateScale())
      resizeObserver.observe(rootRef.value)
    }
    window.addEventListener('resize', updateScale)

    nextTick(() => {
      // 每个 KPI 卡片的迷你趋势图
      channelKpiCards.value.forEach((card) => {
        const el = cardChartRefs.value[card.id]
        if (el) {
          const chart = useChart()
          cardCharts.value.push(chart)
          chart.chartRef!.value = el
          chart.initChart(buildMiniTrendOption(card.trendData))
        }
      })
      if (roiTrendRef.value) {
        chartRoiTrend.chartRef!.value = roiTrendRef.value
        chartRoiTrend.initChart(buildRoiTrendOption())
      }
      if (radarRef.value) {
        chartRadar.chartRef!.value = radarRef.value
        chartRadar.initChart(buildRadarOption())
      }
    })
  })

  onUnmounted(() => {
    if (timeTimer) clearInterval(timeTimer)
    if (resizeObserver && rootRef.value) {
      resizeObserver.unobserve(rootRef.value)
      resizeObserver = null
    }
    window.removeEventListener('resize', updateScale)
    cardCharts.value.forEach((c) => c.destroyChart?.())
    chartRoiTrend.destroyChart?.()
    chartRadar.destroyChart?.()
  })
</script>

<style lang="scss" scoped>
  .finance-screen-root {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: var(--art-full-height, calc(100vh - 120px));
    overflow: auto;
    background: #0a0e1a;
  }

  .finance-screen-wrap {
    position: absolute;
    top: 0;
    left: 0;
    padding: 16px 24px;
    background: linear-gradient(180deg, #0d1220 0%, #0a0e1a 100%);
  }

  .finance-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    margin-bottom: 16px;
    background: rgb(74 190 255 / 4%);
    border: 1px solid rgb(74 190 255 / 20%);
    border-radius: 8px;
  }

  .header-left {
    font-size: 14px;
    color: #b8c5d9;
  }

  .header-filters {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: #8b9dc3;

    .filter-divider {
      color: rgb(255 255 255 / 30%);
    }
  }

  .header-right .btn-export {
    padding: 6px 14px;
    font-size: 13px;
    color: #4abeff;
    cursor: pointer;
    background: rgb(74 190 255 / 12%);
    border: 1px solid rgb(74 190 255 / 40%);
    border-radius: 6px;

    &:hover {
      background: rgb(74 190 255 / 20%);
    }
  }

  .row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  .row-1 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }

  .kpi-card {
    position: relative;
    min-height: 200px;
    padding: 14px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;

    .kpi-card-head {
      margin-bottom: 8px;
    }

    .kpi-card-name {
      font-size: 14px;
      font-weight: 600;
      color: #b8c5d9;
    }

    .kpi-card-roi {
      margin-bottom: 10px;

      .roi-value {
        margin-right: 8px;
        font-size: 26px;
        font-weight: 700;
        color: #e8edf5;
      }

      .roi-change {
        font-size: 13px;

        &.up {
          color: #14deba;
        }

        &.down {
          color: #f56c6c;
        }
      }
    }

    .kpi-card-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #8b9dc3;
    }

    .kpi-card-quality {
      margin-bottom: 8px;
      font-size: 12px;
      color: #8b9dc3;
    }

    .kpi-card-mini-chart {
      position: absolute;
      right: 14px;
      bottom: 14px;
      left: 14px;
      height: 42px;
    }
  }

  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    min-height: 320px;
  }

  .panel {
    padding: 14px;
    overflow: hidden;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;

    .panel-title {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #b8c5d9;
    }

    .chart-dom {
      height: 260px;
      min-height: 200px;
    }
  }

  .panel-heatmap .heatmap-wrap {
    max-height: 260px;
    overflow: auto;
  }

  .heatmap-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th,
    td {
      padding: 6px 10px;
      text-align: center;
      border: 1px solid rgb(255 255 255 / 6%);
    }

    th {
      font-weight: 500;
      color: #8b9dc3;
      background: rgb(0 0 0 / 20%);
    }

    .cell-channel {
      color: #b8c5d9;
      text-align: left;
    }

    .cell-high {
      color: #14deba;
      background: rgb(20 222 186 / 25%);
    }

    .cell-low {
      color: #f56c6c;
      background: rgb(245 108 108 / 25%);
    }
  }

  .row-3 {
    display: block;
  }

  .panel-table {
    .table-wrap {
      max-height: 320px;
      overflow: auto;
    }
  }

  .detail-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th,
    td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid rgb(255 255 255 / 6%);
    }

    th {
      font-weight: 500;
      color: #8b9dc3;
      white-space: nowrap;
    }

    td {
      color: #b8c5d9;
    }

    .mini-bar {
      display: inline-block;
      width: 24px;
      height: 6px;
      margin-left: 4px;
      vertical-align: middle;
      border-radius: 2px;

      &.up {
        background: #14deba;
      }

      &.down {
        background: #f56c6c;
      }
    }

    .arrow {
      margin-left: 2px;

      &.up {
        color: #14deba;
      }

      &.down {
        color: #f56c6c;
      }
    }

    .status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 4px;
      vertical-align: middle;
      border-radius: 50%;

      &.excellent {
        background: #14deba;
      }

      &.average {
        background: #e6a23c;
      }

      &.poor {
        background: #f56c6c;
      }
    }
  }

  .pagination-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-top: 12px;
    margin-top: 12px;
    font-size: 12px;
    color: #8b9dc3;
    border-top: 1px solid rgb(255 255 255 / 6%);

    .page-btn {
      min-width: 28px;
      height: 28px;
      padding: 0 6px;
      font-size: 12px;
      color: #b8c5d9;
      cursor: pointer;
      background: rgb(255 255 255 / 6%);
      border: 1px solid rgb(255 255 255 / 10%);
      border-radius: 4px;

      &:hover:not(:disabled) {
        background: rgb(74 190 255 / 15%);
        border-color: rgb(74 190 255 / 30%);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }

      &.active {
        color: #e8edf5;
        background: rgb(74 190 255 / 25%);
        border-color: #4abeff;
      }
    }

    .page-size {
      margin-left: 12px;
    }

    .page-jump {
      margin-left: auto;

      input {
        width: 40px;
        padding: 2px 6px;
        margin: 0 4px;
        font-size: 12px;
        color: #b8c5d9;
        text-align: center;
        background: rgb(255 255 255 / 6%);
        border: 1px solid rgb(255 255 255 / 10%);
        border-radius: 4px;
      }
    }
  }
</style>
