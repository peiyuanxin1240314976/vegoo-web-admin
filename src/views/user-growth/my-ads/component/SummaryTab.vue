<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { MOCK_MY_ADS_SUMMARY_TAB } from '../mock/data'

  defineOptions({ name: 'SummaryTab' })

  const summaryMock = MOCK_MY_ADS_SUMMARY_TAB
  const channelData = summaryMock.sourcePie.map((d) => ({
    value: d.value,
    name: d.name,
    itemStyle: { color: d.color }
  }))
  const progressList = summaryMock.progressList

  const lineChartEl = ref<HTMLElement | null>(null)
  const pieChartEl = ref<HTMLElement | null>(null)
  let lineChart: echarts.ECharts | null = null
  let pieChart: echarts.ECharts | null = null

  onMounted(() => {
    /* ── 折线图 ── */
    if (lineChartEl.value) {
      lineChart = echarts.init(lineChartEl.value, 'dark')
      lineChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1e2f45',
          borderColor: '#2a3f5a',
          textStyle: { color: '#e2e8f0', fontSize: 12 }
        },
        legend: {
          bottom: 0,
          textStyle: { color: '#94a3b8', fontSize: 11 },
          data: ['广告支出', '预估利润', '首日ROI'],
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8
        },
        grid: { left: 50, right: 60, top: 20, bottom: 50 },
        xAxis: {
          type: 'category',
          data: summaryMock.trend.days,
          axisLine: { lineStyle: { color: '#1e2f45' } },
          axisTick: { show: false },
          axisLabel: { color: '#64748b', fontSize: 11 }
        },
        yAxis: [
          {
            type: 'value',
            name: '',
            min: 0,
            max: 15000,
            interval: 5000,
            axisLabel: {
              color: '#64748b',
              fontSize: 11,
              formatter: (v: number) => (v === 0 ? '$0' : `$${v / 1000}k`)
            },
            splitLine: { lineStyle: { color: '#1a2a3a', type: 'dashed' } },
            axisLine: { show: false },
            axisTick: { show: false }
          },
          {
            type: 'value',
            min: 0,
            max: 60,
            interval: 20,
            axisLabel: { color: '#64748b', fontSize: 11, formatter: '{value}%' },
            splitLine: { show: false },
            axisLine: { show: false },
            axisTick: { show: false }
          }
        ],
        series: [
          {
            name: '广告支出',
            type: 'line',
            data: summaryMock.trend.spend,
            yAxisIndex: 0,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#00d4aa', width: 2 },
            itemStyle: { color: '#00d4aa' },
            label: { show: true, color: '#cbd5e1', fontSize: 11, position: 'top' }
          },
          {
            name: '预估利润',
            type: 'line',
            data: summaryMock.trend.profit,
            yAxisIndex: 0,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#10b981', width: 2 },
            itemStyle: { color: '#10b981' },
            label: { show: true, color: '#cbd5e1', fontSize: 11, position: 'bottom' }
          },
          {
            name: '首日ROI',
            type: 'line',
            data: summaryMock.trend.roiPct,
            yAxisIndex: 1,
            symbol: 'diamond',
            symbolSize: 7,
            lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
            itemStyle: { color: '#f59e0b' },
            label: {
              show: true,
              color: '#f59e0b',
              fontSize: 11,
              position: 'top',
              formatter: '{c}%'
            }
          }
        ]
      })
    }

    /* ── 甜甜圈图 ── */
    if (pieChartEl.value) {
      pieChart = echarts.init(pieChartEl.value, 'dark')
      pieChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#1e2f45',
          borderColor: '#2a3f5a',
          textStyle: { color: '#e2e8f0' },
          formatter: '{b}: ${c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          textStyle: { color: '#94a3b8', fontSize: 11 },
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          formatter: (name: string) => {
            const item = channelData.find((d) => d.name === name)
            return `${name} $${item ? item.value.toLocaleString() : ''}`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '42%'],
            data: channelData,
            label: {
              show: true,
              formatter: '{d}%',
              color: '#e2e8f0',
              fontSize: 11
            },
            labelLine: { lineStyle: { color: '#2a3f5a' } },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
            }
          }
        ],
        graphic: [
          {
            type: 'group',
            left: 'center',
            top: '30%',
            children: [
              {
                type: 'text',
                style: {
                  text: summaryMock.pieCenterTitle,
                  fill: '#94a3b8',
                  fontSize: 11,
                  textAlign: 'center'
                },
                left: 'center',
                top: -12
              },
              {
                type: 'text',
                style: {
                  text: summaryMock.pieCenterValue,
                  fill: '#e2e8f0',
                  fontSize: 15,
                  fontWeight: 'bold',
                  textAlign: 'center'
                },
                left: 'center',
                top: 6
              }
            ]
          }
        ]
      })
    }

    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    lineChart?.dispose()
    pieChart?.dispose()
    window.removeEventListener('resize', handleResize)
  })

  function handleResize() {
    lineChart?.resize()
    pieChart?.resize()
  }

  function progressColor(p: number, type: string) {
    if (type === 'warn') return '#f59e0b'
    if (type === 'inactive') return '#374151'
    if (p >= 90) return '#f59e0b'
    return '#10b981'
  }
</script>

<template>
  <div class="summary-tab">
    <!-- ── 四个统计卡 ── -->
    <div class="stat-cards">
      <!-- 本期广告支出 -->
      <div class="stat-card" :style="{ borderColor: summaryMock.statCards.spend.borderColor }">
        <div class="stat-title">本期广告支出</div>
        <div class="stat-main" :style="{ color: summaryMock.statCards.spend.mainColor }">{{
          summaryMock.statCards.spend.main
        }}</div>
        <div class="stat-row">
          <span class="label-dim">预算</span>
          <span style="color: #f1f5f9">{{ summaryMock.statCards.spend.budget }}</span>
          <span class="sep">|</span>
          <span class="label-dim">差异</span>
          <span :style="{ color: summaryMock.statCards.spend.diffColor }">{{
            summaryMock.statCards.spend.diff
          }}</span>
        </div>
        <div class="stat-row mt4">
          <span class="label-dim">{{ summaryMock.statCards.spend.prevLine }}</span>
          <span class="sep">|</span>
          <span :style="{ color: summaryMock.statCards.spend.momColor }">{{
            summaryMock.statCards.spend.momLine
          }}</span>
        </div>
      </div>

      <!-- 代投消耗占比 -->
      <div
        class="stat-card"
        :style="{ borderColor: summaryMock.statCards.agencyRatio.borderColor }"
      >
        <div class="stat-title">代投消耗占比</div>
        <div class="stat-main" :style="{ color: summaryMock.statCards.agencyRatio.mainColor }">{{
          summaryMock.statCards.agencyRatio.main
        }}</div>
        <div class="stat-row">
          <span class="label-dim">代投</span>
          <span style="color: #f1f5f9">{{ summaryMock.statCards.agencyRatio.agency }}</span>
          <span class="sep">/</span>
          <span class="label-dim">直投</span>
          <span style="color: #f1f5f9">{{ summaryMock.statCards.agencyRatio.direct }}</span>
        </div>
        <div class="stat-row mt4">
          <span class="label-dim">{{ summaryMock.statCards.agencyRatio.prevLine }}</span>
          <span class="sep">|</span>
          <span :style="{ color: summaryMock.statCards.agencyRatio.momColor }">{{
            summaryMock.statCards.agencyRatio.momLine
          }}</span>
        </div>
      </div>

      <!-- 平均首日ROI -->
      <div class="stat-card" :style="{ borderColor: summaryMock.statCards.roi.borderColor }">
        <div class="stat-title">平均首日ROI</div>
        <div class="stat-main" :style="{ color: summaryMock.statCards.roi.mainColor }">{{
          summaryMock.statCards.roi.main
        }}</div>
        <div class="stat-row">
          <span class="label-dim">目标</span>
          <span style="color: #f1f5f9">{{ summaryMock.statCards.roi.target }}</span>
          <span class="sep">|</span>
          <span class="label-dim">超目标</span>
          <span style="color: #10b981">{{ summaryMock.statCards.roi.overTarget }}</span>
        </div>
        <div class="stat-row mt4">
          <span class="label-dim">{{ summaryMock.statCards.roi.prevLine }}</span>
          <span class="sep">|</span>
          <span :style="{ color: summaryMock.statCards.roi.momColor }">{{
            summaryMock.statCards.roi.momLine
          }}</span>
        </div>
      </div>

      <!-- 预估利润 -->
      <div class="stat-card" :style="{ borderColor: summaryMock.statCards.estProfit.borderColor }">
        <div class="stat-title">预估利润</div>
        <div class="stat-main" :style="{ color: summaryMock.statCards.estProfit.mainColor }">{{
          summaryMock.statCards.estProfit.main
        }}</div>
        <div class="stat-row">
          <span class="label-dim">最低利润</span>
          <span style="color: #f1f5f9">{{ summaryMock.statCards.estProfit.minProfit }}</span>
          <span class="sep">|</span>
          <span class="label-dim">利润率</span>
          <span style="color: #f1f5f9">{{ summaryMock.statCards.estProfit.margin }}</span>
        </div>
      </div>
    </div>

    <!-- ── 图表行 ── -->
    <div class="charts-row">
      <!-- 折线图 -->
      <div class="chart-card chart-line">
        <div class="chart-header">
          <span class="chart-title">广告支出与利润趋势（7天）</span>
          <button class="btn-sm">按日</button>
        </div>
        <div ref="lineChartEl" class="chart-body"></div>
      </div>

      <!-- 甜甜圈图 -->
      <div class="chart-card chart-pie">
        <div class="chart-header">
          <span class="chart-title">{{ summaryMock.chartPieTitle }}</span>
        </div>
        <div ref="pieChartEl" class="chart-body"></div>
      </div>
    </div>

    <!-- ── 下方行 ── -->
    <div class="bottom-row">
      <!-- 应用广告支出占比 -->
      <div class="chart-card bottom-bar">
        <div class="chart-header">
          <span class="chart-title">应用广告支出占比</span>
        </div>
        <div class="app-bars">
          <div v-for="row in summaryMock.appBars" :key="row.label" class="app-bar-item">
            <div class="app-bar-label">{{ row.label }}</div>
            <div class="app-bar-track">
              <div
                class="app-bar-fill"
                :style="{ width: row.widthPct + '%', background: row.barColor }"
              ></div>
            </div>
            <span class="app-bar-pct" :style="{ color: row.barColor }">{{ row.pct }}</span>
            <span class="app-bar-amt">{{ row.amt }}</span>
            <span class="app-bar-roi" :style="{ color: row.roiColor }">{{ row.roiText }}</span>
          </div>
          <div class="x-axis-labels">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>
      </div>

      <!-- 消耗进度监控 -->
      <div class="chart-card bottom-progress">
        <div class="chart-header">
          <span class="chart-title">消耗进度监控</span>
        </div>
        <table class="progress-table">
          <thead>
            <tr>
              <th>广告系列</th>
              <th>广告支出/预算</th>
              <th>进度</th>
              <th>首日ROI</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in progressList" :key="row.name">
              <td class="camp-name">{{ row.name }}</td>
              <td>
                <span style="color: #e2e8f0">{{ row.spend }}</span>
                <span class="budget-sep">/</span>
                <span class="text-dim">{{ row.budget }}</span>
              </td>
              <td>
                <div class="prog-wrap">
                  <div class="prog-track">
                    <div
                      class="prog-fill"
                      :style="{
                        width: row.progress + '%',
                        background: progressColor(row.progress, row.statusType)
                      }"
                    ></div>
                  </div>
                  <span class="prog-pct">{{ row.progress }}%</span>
                </div>
              </td>
              <td
                :style="{
                  color:
                    row.statusType === 'warn'
                      ? '#f97316'
                      : row.statusType === 'inactive'
                        ? '#64748b'
                        : '#f59e0b'
                }"
              >
                {{ row.roi }}
              </td>
              <td>
                <span :class="['status-dot', row.statusType]">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .summary-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── 统计卡 ── */
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-top: 2px solid;
    border-radius: 8px;
  }

  .stat-title {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .stat-main {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    font-size: 12px;
  }

  .mt4 {
    margin-top: 4px;
  }

  .label-dim {
    color: var(--text-secondary);
  }

  .sep {
    color: var(--text-dim);
  }

  /* ── 图表行 ── */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 12px;
  }

  .chart-card {
    padding: 14px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .chart-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .chart-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .btn-sm {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .chart-body {
    height: 220px;
  }

  /* ── 下方行 ── */
  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 12px;
  }

  /* ── 应用条形图 ── */
  .app-bars {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 4px;
  }

  .app-bar-item {
    display: grid;
    grid-template-columns: 64px 1fr 36px 60px auto;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .app-bar-label {
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .app-bar-track {
    height: 20px;
    overflow: hidden;
    background: var(--bg-card2);
    border-radius: 3px;
  }

  .app-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s;
  }

  .app-bar-pct {
    font-size: 12px;
    font-weight: 600;
    text-align: right;
  }

  .app-bar-amt {
    font-size: 12px;
    color: var(--text-primary);
  }

  .app-bar-roi {
    font-size: 11px;
    white-space: nowrap;
  }

  .x-axis-labels {
    display: flex;
    grid-column: 1 / -1;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 11px;
    color: var(--text-dim);
  }

  /* ── 进度表 ── */
  .progress-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .progress-table th {
    padding: 4px 6px 8px;
    font-weight: 500;
    color: var(--text-dim);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .progress-table td {
    padding: 7px 6px;
    vertical-align: middle;
    border-bottom: 1px solid rgb(30 47 69 / 50%);
  }

  .camp-name {
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .budget-sep {
    margin: 0 2px;
    color: var(--text-dim);
  }

  .text-dim {
    color: var(--text-dim);
  }

  .prog-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .prog-track {
    width: 80px;
    height: 6px;
    overflow: hidden;
    background: var(--bg-card2);
    border-radius: 3px;
  }

  .prog-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s;
  }

  .prog-pct {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .status-dot {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
  }

  .status-dot .dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-dot.ok {
    color: #10b981;
  }

  .status-dot.ok .dot {
    background: #10b981;
  }

  .status-dot.warn {
    color: #f59e0b;
  }

  .status-dot.warn .dot {
    background: #f59e0b;
  }

  .status-dot.inactive {
    color: #4b5563;
  }

  .status-dot.inactive .dot {
    background: #4b5563;
  }

  .badge-warn {
    padding: 2px 8px;
    font-size: 11px;
    color: #f97316;
    background: rgb(249 115 22 / 15%);
    border: 1px solid rgb(249 115 22 / 30%);
    border-radius: 4px;
  }
</style>
