<template>
  <div class="revenue-deviation">
    <!-- ========== Header ========== -->
    <div class="rd-header">
      <div class="rd-breadcrumb">
        <span class="rd-breadcrumb__parent">商业洞察</span>
        <el-icon class="rd-breadcrumb__sep"><ArrowRight /></el-icon>
        <span class="rd-breadcrumb__current">预估收入偏差</span>
      </div>
      <div class="rd-header__actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          class="rd-date-picker"
          :teleported="false"
        />
        <el-select v-model="platform" class="rd-select" placeholder="全部平台">
          <el-option label="全部平台" value="" />
          <el-option label="Admob" value="admob" />
          <el-option label="Facebook" value="facebook" />
          <el-option label="Applovin" value="applovin" />
          <el-option label="Vungle" value="vungle" />
          <el-option label="Pangle" value="pangle" />
        </el-select>
        <el-select v-model="appFilter" class="rd-select" placeholder="全部应用">
          <el-option label="全部应用" value="" />
          <el-option label="WeatherRadar" value="weather" />
          <el-option label="PhoneTracker" value="phone" />
          <el-option label="BloodSugar2" value="blood" />
          <el-option label="HealthTracker" value="health" />
          <el-option label="FaceMe" value="face" />
        </el-select>
        <el-button class="rd-filter-btn" :icon="Filter" circle />
      </div>
    </div>

    <!-- ========== KPI Cards ========== -->
    <div class="rd-kpi-grid">
      <div class="rd-kpi-card rd-kpi-card--green">
        <div class="rd-kpi-card__label">广告收入（预估）</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--green">$2,768.58</div>
        <div class="rd-kpi-card__sub">广告平台上报 / 客户端埋点展示事件计算</div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--gold">
        <div class="rd-kpi-card__label">广告收入（真实）</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--gold">$1,861.23</div>
        <div class="rd-kpi-card__sub">实际入账金额 / 平台对账数据</div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--red">
        <div class="rd-kpi-card__header-row">
          <div class="rd-kpi-card__label">偏差金额</div>
          <span class="rd-badge rd-badge--red">预估偏高</span>
        </div>
        <div class="rd-kpi-card__value rd-kpi-card__value--red">+$907.35</div>
        <div class="rd-kpi-card__sub">待对账确认</div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--red">
        <div class="rd-kpi-card__label">偏差率</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--red">+8.5%</div>
        <div class="rd-kpi-card__sub">预估偏高，待对账 / 历史平均 6.2%</div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--blue">
        <div class="rd-kpi-card__label">影响ROI估算</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--blue">-8.5pp</div>
        <div class="rd-kpi-card__sub">实际ROI将低于预估 / 需校正ROI计算</div>
      </div>
    </div>

    <!-- ========== Middle Row ========== -->
    <div class="rd-middle-grid">
      <!-- 趋势图 -->
      <div class="rd-card rd-trend-card">
        <div class="rd-card__title">收入偏差趋势（30天）</div>
        <div ref="trendChartRef" class="rd-trend-chart"></div>
        <div class="rd-trend-legend">
          <span class="rd-legend-item rd-legend-item--dashed rd-legend-item--green">预估收入</span>
          <span class="rd-legend-item rd-legend-item--solid rd-legend-item--teal">真实收入</span>
          <span class="rd-legend-item rd-legend-item--area rd-legend-item--orange">偏差区域</span>
        </div>
      </div>

      <!-- 平台偏差对比 -->
      <div class="rd-card rd-platform-card">
        <div class="rd-card__title">平台偏差对比</div>
        <table class="rd-table">
          <thead>
            <tr>
              <th>广告平台</th>
              <th>预估($)</th>
              <th>真实($)</th>
              <th>偏差率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in platformData" :key="row.name">
              <td>{{ row.name }}</td>
              <td>{{ row.estimated }}</td>
              <td>{{ row.real }}</td>
              <td :class="getDeviationClass(row.deviation)">{{ row.deviation }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="rd-table__total">
              <td>合计</td>
              <td>$2,798.58</td>
              <td>$1,861.23</td>
              <td class="rd-text--red">+8.5%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 右侧：原因分析 + 对账建议 -->
      <div class="rd-right-col">
        <div class="rd-card rd-reason-card">
          <div class="rd-card__title">偏差原因分析</div>
          <div class="rd-reason-body">
            <div ref="reasonChartRef" class="rd-reason-chart"></div>
            <div class="rd-reason-legend">
              <div v-for="item in reasonData" :key="item.name" class="rd-reason-legend__item">
                <span class="rd-reason-legend__dot" :style="{ background: item.color }"></span>
                <span class="rd-reason-legend__name">{{ item.name }}</span>
                <span class="rd-reason-legend__val">{{ item.value }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="rd-card rd-advice-card">
          <div class="rd-card__title rd-card__title--gold">对账建议</div>
          <ul class="rd-advice-list">
            <li>当前偏差率 8.5%，高于历史平均</li>
            <li>美国偏差页贡献最大 44.2%</li>
            <li>建议重点梳理 Admob</li>
          </ul>
          <div class="rd-advice-actions">
            <el-button class="rd-btn-outline">查看对账记录</el-button>
            <el-button class="rd-btn-primary">设置预警阈值</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== Bottom Row ========== -->
    <div class="rd-bottom-grid">
      <!-- 国家偏差分布 Top 10 -->
      <div class="rd-card rd-country-card">
        <div class="rd-card__header-row">
          <div class="rd-card__title">国家偏差分布 Top 10</div>
          <el-icon class="rd-icon-link"><TopRight /></el-icon>
        </div>
        <div class="rd-tab-group">
          <button
            v-for="tab in countryTabs"
            :key="tab.value"
            class="rd-tab-btn"
            :class="{ 'rd-tab-btn--active': activeCountryTab === tab.value }"
            @click="activeCountryTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <div ref="countryChartRef" class="rd-country-chart"></div>
      </div>

      <!-- 偏差历史记录 -->
      <div class="rd-card rd-history-card">
        <div class="rd-card__title">偏差历史记录</div>
        <table class="rd-table">
          <thead>
            <tr>
              <th>月份</th>
              <th>预估收入</th>
              <th>真实收入</th>
              <th>偏差率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in historyData" :key="row.month">
              <td>{{ row.month }}</td>
              <td>{{ row.estimated }}</td>
              <td>{{ row.real }}</td>
              <td :class="getDeviationClass(row.deviation)">{{ row.deviation }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 四维度偏差明细分析表 -->
      <div class="rd-card rd-matrix-card">
        <div class="rd-card__header-row">
          <div>
            <div class="rd-card__title">四维度偏差明细分析表</div>
            <div class="rd-card__subtitle">应用 × 平台 × 日期 交叉分析，用于校正ROI计算</div>
          </div>
          <el-select
            v-model="matrixPlatform"
            class="rd-select rd-select--sm"
            placeholder="平台: 全部"
          >
            <el-option label="全部" value="" />
            <el-option label="Admob" value="admob" />
          </el-select>
        </div>
        <div class="rd-dim-row">
          <span class="rd-dim-label">行维度：</span>
          <span
            v-for="d in rowDims"
            :key="d.value"
            class="rd-dim-chip"
            :class="{ 'rd-dim-chip--active': d.active }"
            >{{ d.label }}</span
          >
          <span class="rd-dim-label" style="margin-left: 16px">列维度：</span>
          <span
            v-for="d in colDims"
            :key="d.value"
            class="rd-dim-chip"
            :class="{ 'rd-dim-chip--active': d.active }"
            >{{ d.label }}</span
          >
        </div>
        <div class="rd-matrix-scroll">
          <table class="rd-table rd-matrix-table">
            <thead>
              <tr>
                <th>应用</th>
                <th v-for="col in matrixCols" :key="col.name" colspan="1">
                  <div class="rd-matrix-col-head">
                    <span>{{ col.name }}</span>
                    <span class="rd-matrix-col-sub">预估/真实/偏差率</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in matrixData" :key="row.app">
                <td class="rd-matrix-app">
                  <span class="rd-app-icon" :style="{ background: row.iconColor }">{{
                    row.icon
                  }}</span>
                  {{ row.app }}
                </td>
                <td
                  v-for="col in matrixCols"
                  :key="col.name"
                  class="rd-matrix-cell"
                  :class="getMatrixClass(matrixCell(row, col.key)?.deviation ?? '')"
                >
                  <template v-if="matrixCell(row, col.key)">
                    <span class="rd-matrix-est">{{ matrixCell(row, col.key)?.estimated }}</span>
                    <span class="rd-matrix-real">/{{ matrixCell(row, col.key)?.real }}</span>
                    <span
                      class="rd-matrix-dev"
                      :class="getDeviationClass(matrixCell(row, col.key)?.deviation ?? '')"
                    >
                      /{{ matrixCell(row, col.key)?.deviation }}
                    </span>
                  </template>
                </td>
              </tr>
              <!-- 合计行 -->
              <tr class="rd-table__total">
                <td>合计</td>
                <td v-for="col in matrixCols" :key="col.name" class="rd-matrix-cell">
                  <span class="rd-matrix-est">{{ col.total.estimated }}</span>
                  <span class="rd-matrix-real">/{{ col.total.real }}</span>
                  <span class="rd-matrix-dev rd-text--red">/{{ col.total.deviation }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rd-matrix-note">
          说明：预估收入通过客户端埋点展示广告事件计算，真实收入来源于广告平台对账数据，偏差率可用于校正各维度ROI计算。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { ArrowRight, Filter, TopRight } from '@element-plus/icons-vue'
  import * as echarts from 'echarts'

  type MatrixPlatformKey = 'admob' | 'facebook' | 'applovin' | 'vungle'

  interface MatrixCell {
    estimated: string
    real: string
    deviation: string
  }

  type MatrixRow = {
    app: string
    icon: string
    iconColor: string
  } & Record<MatrixPlatformKey, MatrixCell>

  interface MatrixColDef {
    name: string
    key: MatrixPlatformKey
    total: MatrixCell
  }

  function matrixCell(row: MatrixRow, key: MatrixPlatformKey): MatrixCell | undefined {
    return row[key]
  }

  // ── State ────────────────────────────────────────────────────────────────────
  const dateRange = ref(['2024-05-01', '2024-05-31'])
  const platform = ref('')
  const appFilter = ref('')
  const activeCountryTab = ref('amount')
  const matrixPlatform = ref('')

  // ── Static Data ───────────────────────────────────────────────────────────────
  const platformData = [
    { name: 'Admob', estimated: '$2,768.58', real: '$1,861.23', deviation: '+8.5%' },
    { name: 'Facebook', estimated: '$1,778.58', real: '$1,861.23', deviation: '+8.5%' },
    { name: 'Applovin', estimated: '$888.53', real: '$876.86', deviation: '+5.2%' },
    { name: 'Vungle', estimated: '$338.80', real: '$297.22', deviation: '-0.3%' },
    { name: 'Pangle', estimated: '$722.50', real: '$399.81', deviation: '-0.9%' }
  ]

  const reasonData = [
    { name: '预估收入', value: 45, color: '#4ade80' },
    { name: '美国偏差', value: 28, color: '#f59e0b' },
    { name: '中沪偏点贡献', value: 18, color: '#60a5fa' },
    { name: '真实原因', value: 9, color: '#f87171' }
  ]

  const historyData = [
    { month: '2024–05', estimated: '$2.01', real: '$1.32', deviation: '+8.5%' },
    { month: '2024–04', estimated: '$1.29', real: '$1.30', deviation: '-6.2%' },
    { month: '2024–03', estimated: '$2.51', real: '$1.32', deviation: '+5.2%' },
    { month: '2024–01', estimated: '$2.57', real: '$1.32', deviation: '-5.2%' },
    { month: '2023–00', estimated: '$3.19', real: '$2.48', deviation: '-6.0%' },
    { month: '2023–01', estimated: '$1.85', real: '$2.84', deviation: '-0.0%' },
    { month: '2023–12', estimated: '$6.16', real: '$3.54', deviation: '-0.0%' }
  ]

  const countryTabs = [
    { label: '偏差金额', value: 'amount' },
    { label: '偏差率', value: 'rate' }
  ]

  const rowDims = [
    { label: '应用', value: 'app', active: true },
    { label: '平台', value: 'platform', active: false },
    { label: '日期', value: 'date', active: false }
  ]
  const colDims = [
    { label: '平台', value: 'platform', active: true },
    { label: '日期', value: 'date', active: false }
  ]

  const matrixCols: MatrixColDef[] = [
    {
      name: 'Admob',
      key: 'admob',
      total: { estimated: '$9.88', real: '$3.77', deviation: '>15%' }
    },
    {
      name: 'Facebook',
      key: 'facebook',
      total: { estimated: '$6.28', real: '$0.00', deviation: '>15%' }
    },
    {
      name: 'Applovin',
      key: 'applovin',
      total: { estimated: '$3.75', real: '$3.99', deviation: '>15%' }
    },
    {
      name: 'Vungle',
      key: 'vungle',
      total: { estimated: '$0.23', real: '$9.78', deviation: '<8%' }
    }
  ]

  const matrixData: MatrixRow[] = [
    {
      app: 'WeatherRadar',
      icon: '🌤',
      iconColor: '#1e3a5f',
      admob: { estimated: '$9.33', real: '$2.79', deviation: '>15%' },
      facebook: { estimated: '$1.90', real: '$1.18', deviation: '>15%' },
      applovin: { estimated: '$3.96', real: '$2.98', deviation: '>15%' },
      vungle: { estimated: '$3.92', real: '$2.21', deviation: '>15%' }
    },
    {
      app: 'PhoneTracker',
      icon: '📍',
      iconColor: '#1a3a2a',
      admob: { estimated: '$2.33', real: '$2.89', deviation: '8–15%' },
      facebook: { estimated: '$1.78', real: '$1.67', deviation: '8–15%' },
      applovin: { estimated: '$2.99', real: '$3.80', deviation: '8–15%' },
      vungle: { estimated: '$2.38', real: '$0.65', deviation: '8–15%' }
    },
    {
      app: 'BloodSugar2',
      icon: '💉',
      iconColor: '#3a1a1a',
      admob: { estimated: '$3.42', real: '$1.99', deviation: '<8%' },
      facebook: { estimated: '$1.28', real: '$0.04', deviation: '<8%' },
      applovin: { estimated: '$9.16', real: '$4.06', deviation: '<8%' },
      vungle: { estimated: '$1.29', real: '$0.08', deviation: '<8%' }
    },
    {
      app: 'HealthTracker',
      icon: '❤️',
      iconColor: '#3a1a2a',
      admob: { estimated: '$1.67', real: '$2.42', deviation: '<8%' },
      facebook: { estimated: '$2.35', real: '$2.23', deviation: '<3%' },
      applovin: { estimated: '$3.73', real: '$4.23', deviation: '<8%' },
      vungle: { estimated: '$1.03', real: '$9.91', deviation: '<8%' }
    },
    {
      app: 'FaceMe',
      icon: '😊',
      iconColor: '#1a1a3a',
      admob: { estimated: '$1.77', real: '$2.38', deviation: '<8%' },
      facebook: { estimated: '$3.22', real: '$2.00', deviation: '<3%' },
      applovin: { estimated: '$191', real: '$2.04', deviation: '<5%' },
      vungle: { estimated: '$63', real: '$80', deviation: '<5%' }
    }
  ]

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function getDeviationClass(val: string) {
    if (!val) return ''
    if (val.startsWith('+')) return 'rd-text--red'
    if (val.startsWith('-')) return 'rd-text--green'
    if (val.includes('>15')) return 'rd-text--red'
    if (val.includes('8–15')) return 'rd-text--orange'
    return 'rd-text--muted'
  }

  function getMatrixClass(deviation: string) {
    if (!deviation) return ''
    if (deviation.includes('>15')) return 'rd-matrix-cell--red'
    if (deviation.includes('8–15')) return 'rd-matrix-cell--orange'
    return ''
  }

  // ── Charts ────────────────────────────────────────────────────────────────────
  const trendChartRef = ref<HTMLElement | null>(null)
  const reasonChartRef = ref<HTMLElement | null>(null)
  const countryChartRef = ref<HTMLElement | null>(null)

  let trendChart: echarts.ECharts | null = null
  let reasonChart: echarts.ECharts | null = null
  let countryChart: echarts.ECharts | null = null

  function initTrendChart() {
    if (!trendChartRef.value) return
    trendChart = echarts.init(trendChartRef.value, 'dark')

    const days = Array.from({ length: 30 }, (_, i) => String(i + 1).padStart(2, '0'))
    const estimated = [
      2.1, 2.3, 2.5, 2.8, 3.0, 2.9, 3.2, 3.5, 3.3, 3.1, 2.8, 3.0, 3.4, 3.6, 4.0, 3.8, 3.5, 3.2, 3.0,
      2.8, 2.6, 2.9, 3.1, 3.3, 3.0, 2.7, 2.5, 2.8, 3.0, 3.2
    ]
    const real = [
      1.8, 2.0, 2.1, 2.2, 2.4, 2.3, 2.5, 2.6, 2.5, 2.4, 2.2, 2.4, 2.7, 2.8, 3.2, 3.1, 2.9, 2.7, 2.5,
      2.3, 2.1, 2.4, 2.6, 2.7, 2.5, 2.2, 2.0, 2.3, 2.5, 2.7
    ]

    trendChart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 30, right: 10, bottom: 50, left: 50 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e2533',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: [
        {
          name: '预估收入',
          type: 'line',
          data: estimated,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#4ade80', width: 2, type: 'dashed' },
          itemStyle: { color: '#4ade80' }
        },
        {
          name: '真实收入',
          type: 'line',
          data: real,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#2dd4bf', width: 2 },
          itemStyle: { color: '#2dd4bf' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(45,212,191,0.15)' },
              { offset: 1, color: 'rgba(45,212,191,0.02)' }
            ])
          }
        },
        {
          name: '偏差区域',
          type: 'line',
          data: estimated.map((e, i) => e - real[i]),
          smooth: true,
          symbol: 'none',
          lineStyle: { opacity: 0 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(251,146,60,0.35)' },
              { offset: 1, color: 'rgba(251,146,60,0.05)' }
            ])
          }
        }
      ]
    })
  }

  function initReasonChart() {
    if (!reasonChartRef.value) return
    reasonChart = echarts.init(reasonChartRef.value, 'dark')
    reasonChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2533',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      series: [
        {
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '50%'],
          data: reasonData.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color }
          })),
          label: { show: false },
          emphasis: { scale: true, scaleSize: 5 }
        }
      ]
    })
  }

  function initCountryChart() {
    if (!countryChartRef.value) return
    countryChart = echarts.init(countryChartRef.value, 'dark')
    const countries = [
      '荷兰',
      '法国',
      '巴西',
      '加拿大',
      '澳大利亚',
      '日本',
      '韩国',
      '英国',
      '德国',
      '美国'
    ]
    const amounts = [10, 18, 28, 38, 50, 62, 78, 90, 108, 180]
    countryChart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 5, right: 20, bottom: 5, left: 60 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        backgroundColor: '#1e2533',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      xAxis: {
        type: 'value',
        axisLabel: { show: false },
        splitLine: { show: false },
        axisLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: countries,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 12 }
      },
      series: [
        {
          type: 'bar',
          data: amounts,
          barMaxWidth: 14,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#f97316' },
              { offset: 1, color: '#fb923c44' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        }
      ]
    })
  }

  const resizeHandler = () => {
    trendChart?.resize()
    reasonChart?.resize()
    countryChart?.resize()
  }

  onMounted(() => {
    initTrendChart()
    initReasonChart()
    initCountryChart()
    window.addEventListener('resize', resizeHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    trendChart?.dispose()
    reasonChart?.dispose()
    countryChart?.dispose()
  })

  watch(activeCountryTab, () => {
    // 切换国家维度时可重新渲染
    countryChart?.dispose()
    initCountryChart()
  })
</script>

<style scoped>
  /* ── CSS Variables ─────────────────────────────────────────────────── */
  .revenue-deviation {
    --rd-bg: #0f1117;
    --rd-card-bg: #151b27;
    --rd-card-border: #1e293b;
    --rd-text-primary: #e2e8f0;
    --rd-text-secondary: #94a3b8;
    --rd-text-muted: #475569;
    --rd-green: #4ade80;
    --rd-gold: #f59e0b;
    --rd-red: #f87171;
    --rd-blue: #60a5fa;
    --rd-orange: #fb923c;
    --rd-teal: #2dd4bf;

    min-height: 100vh;
    padding: 20px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--rd-text-primary);
    background: var(--rd-bg);
  }

  /* ── Header ────────────────────────────────────────────────────────── */
  .rd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .rd-breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .rd-breadcrumb__parent {
    font-size: 16px;
    color: var(--rd-text-secondary);
  }

  .rd-breadcrumb__sep {
    font-size: 14px;
    color: var(--rd-text-muted);
  }

  .rd-breadcrumb__current {
    font-size: 18px;
    font-weight: 700;
    color: var(--rd-text-primary);
  }

  .rd-header__actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .rd-date-picker {
    --el-fill-color-blank: #1e293b;
    --el-border-color: #334155;
    --el-text-color-regular: #e2e8f0;

    width: 240px;
  }

  .rd-select {
    --el-fill-color-blank: #1e293b;
    --el-border-color: #334155;
    --el-text-color-regular: #e2e8f0;

    width: 130px;
  }

  .rd-select--sm {
    width: 110px;
  }

  .rd-filter-btn {
    color: var(--rd-text-secondary) !important;
    background: #1e293b !important;
    border-color: #334155 !important;
  }

  /* ── KPI Grid ──────────────────────────────────────────────────────── */
  .rd-kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 16px;
  }

  .rd-kpi-card {
    position: relative;
    padding: 18px 20px;
    overflow: hidden;
    background: var(--rd-card-bg);
    border: 1px solid var(--rd-card-border);
    border-radius: 10px;
  }

  .rd-kpi-card::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 3px;
    content: '';
    border-radius: 10px 10px 0 0;
  }

  .rd-kpi-card--green::before {
    background: var(--rd-green);
  }

  .rd-kpi-card--gold::before {
    background: var(--rd-gold);
  }

  .rd-kpi-card--red::before {
    background: var(--rd-red);
  }

  .rd-kpi-card--blue::before {
    background: var(--rd-blue);
  }

  .rd-kpi-card__header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .rd-kpi-card__label {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--rd-text-secondary);
  }

  .rd-kpi-card__value {
    margin-bottom: 6px;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .rd-kpi-card__value--green {
    color: var(--rd-green);
  }

  .rd-kpi-card__value--gold {
    color: var(--rd-gold);
  }

  .rd-kpi-card__value--red {
    color: var(--rd-red);
  }

  .rd-kpi-card__value--blue {
    color: var(--rd-blue);
  }

  .rd-kpi-card__sub {
    font-size: 11px;
    line-height: 1.4;
    color: var(--rd-text-muted);
  }

  /* ── Badge ─────────────────────────────────────────────────────────── */
  .rd-badge {
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
  }

  .rd-badge--red {
    color: var(--rd-red);
    background: rgb(248 113 113 / 15%);
    border: 1px solid rgb(248 113 113 / 30%);
  }

  /* ── Middle Grid ───────────────────────────────────────────────────── */
  .rd-middle-grid {
    display: grid;
    grid-template-columns: 1fr 320px 280px;
    gap: 14px;
    align-items: start;
    margin-bottom: 16px;
  }

  .rd-right-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Card Base ─────────────────────────────────────────────────────── */
  .rd-card {
    padding: 16px 18px;
    background: var(--rd-card-bg);
    border: 1px solid var(--rd-card-border);
    border-radius: 10px;
  }

  .rd-card__title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--rd-text-primary);
  }

  .rd-card__title--gold {
    color: var(--rd-gold);
  }

  .rd-card__subtitle {
    margin-top: 2px;
    font-size: 11px;
    color: var(--rd-text-muted);
  }

  .rd-card__header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .rd-icon-link {
    font-size: 14px;
    color: var(--rd-text-muted);
    cursor: pointer;
  }

  /* ── Trend Chart ───────────────────────────────────────────────────── */
  .rd-trend-chart {
    height: 200px;
  }

  .rd-trend-legend {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 8px;
  }

  .rd-legend-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--rd-text-secondary);
  }

  .rd-legend-item::before {
    display: inline-block;
    width: 20px;
    height: 2px;
    content: '';
    border-radius: 1px;
  }

  .rd-legend-item--green::before {
    height: 0;
    background: var(--rd-green);
    border-top: 2px dashed var(--rd-green);
  }

  .rd-legend-item--teal::before {
    background: var(--rd-teal);
  }

  .rd-legend-item--orange::before {
    height: 8px;
    background: var(--rd-orange);
    border-radius: 2px;
    opacity: 0.6;
  }

  /* ── Table ─────────────────────────────────────────────────────────── */
  .rd-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .rd-table th {
    padding: 6px 8px;
    font-weight: 500;
    color: var(--rd-text-muted);
    text-align: left;
    border-bottom: 1px solid var(--rd-card-border);
  }

  .rd-table td {
    padding: 8px;
    color: var(--rd-text-secondary);
    border-bottom: 1px solid rgb(30 41 59 / 50%);
  }

  .rd-table tr:last-child td {
    border-bottom: none;
  }

  .rd-table tr:hover td {
    background: rgb(255 255 255 / 2%);
  }

  .rd-table__total td {
    font-weight: 600;
    color: var(--rd-text-primary) !important;
    border-top: 1px solid var(--rd-card-border);
    border-bottom: none;
  }

  /* ── Text Colors ───────────────────────────────────────────────────── */
  .rd-text--red {
    color: var(--rd-red) !important;
  }

  .rd-text--green {
    color: var(--rd-green) !important;
  }

  .rd-text--orange {
    color: var(--rd-orange) !important;
  }

  .rd-text--muted {
    color: var(--rd-text-muted) !important;
  }

  /* ── Reason Chart ──────────────────────────────────────────────────── */
  .rd-reason-body {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .rd-reason-chart {
    flex-shrink: 0;
    width: 110px;
    height: 110px;
  }

  .rd-reason-legend {
    flex: 1;
  }

  .rd-reason-legend__item {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 7px;
    font-size: 11px;
    color: var(--rd-text-secondary);
  }

  .rd-reason-legend__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .rd-reason-legend__name {
    flex: 1;
  }

  .rd-reason-legend__val {
    font-weight: 600;
    color: var(--rd-text-primary);
  }

  /* ── Advice Card ───────────────────────────────────────────────────── */
  .rd-advice-list {
    padding: 0;
    margin: 0 0 14px;
    list-style: none;
  }

  .rd-advice-list li {
    position: relative;
    padding: 4px 0 4px 14px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--rd-text-secondary);
  }

  .rd-advice-list li::before {
    position: absolute;
    left: 0;
    color: var(--rd-gold);
    content: '•';
  }

  .rd-advice-actions {
    display: flex;
    gap: 8px;
  }

  .rd-btn-outline {
    flex: 1;
    height: 32px !important;
    font-size: 12px !important;
    color: var(--rd-text-secondary) !important;
    background: transparent !important;
    border: 1px solid #334155 !important;
  }

  .rd-btn-primary {
    flex: 1;
    height: 32px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #0f1117 !important;
    background: var(--rd-gold) !important;
    border-color: var(--rd-gold) !important;
  }

  /* ── Bottom Grid ───────────────────────────────────────────────────── */
  .rd-bottom-grid {
    display: grid;
    grid-template-columns: 240px 260px 1fr;
    gap: 14px;
    align-items: start;
  }

  /* ── Country Chart ─────────────────────────────────────────────────── */
  .rd-tab-group {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
  }

  .rd-tab-btn {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--rd-text-muted);
    cursor: pointer;
    background: transparent;
    border: 1px solid #334155;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .rd-tab-btn--active {
    color: var(--rd-green);
    background: rgb(74 222 128 / 15%);
    border-color: var(--rd-green);
  }

  .rd-country-chart {
    height: 240px;
  }

  /* ── Matrix Table ──────────────────────────────────────────────────── */
  .rd-dim-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
  }

  .rd-dim-label {
    font-size: 11px;
    color: var(--rd-text-muted);
  }

  .rd-dim-chip {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--rd-text-muted);
    cursor: pointer;
    border: 1px solid #334155;
    border-radius: 4px;
  }

  .rd-dim-chip--active {
    color: var(--rd-blue);
    background: rgb(96 165 250 / 15%);
    border-color: var(--rd-blue);
  }

  .rd-matrix-scroll {
    overflow-x: auto;
  }

  .rd-matrix-table {
    min-width: 600px;
  }

  .rd-matrix-col-head {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rd-matrix-col-sub {
    font-size: 10px;
    font-weight: 400;
    color: var(--rd-text-muted);
  }

  .rd-matrix-app {
    display: flex;
    gap: 6px;
    align-items: center;
    white-space: nowrap;
  }

  .rd-app-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 12px;
    border-radius: 4px;
  }

  .rd-matrix-cell {
    font-size: 11px;
    white-space: nowrap;
  }

  .rd-matrix-est {
    color: var(--rd-text-primary);
  }

  .rd-matrix-real {
    color: var(--rd-text-secondary);
  }

  .rd-matrix-dev {
    font-size: 11px;
  }

  .rd-matrix-cell--red {
    background: rgb(248 113 113 / 8%);
  }

  .rd-matrix-cell--orange {
    background: rgb(251 146 60 / 8%);
  }

  .rd-matrix-note {
    padding-top: 8px;
    margin-top: 10px;
    font-size: 11px;
    line-height: 1.6;
    color: var(--rd-text-muted);
    border-top: 1px solid var(--rd-card-border);
  }
</style>
