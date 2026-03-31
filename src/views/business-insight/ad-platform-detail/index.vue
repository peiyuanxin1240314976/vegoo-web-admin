<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import * as echarts from 'echarts'

  const router = useRouter()

  function goToAppAdPlatformPerformance(row: AppRow) {
    router.push({
      name: 'AppAdPlatformPerformance',
      query: { app: row.app }
    })
  }

  // ─── Types ──────────────────────────────────────────────────────────────────
  interface KpiCard {
    label: string
    value: string
    change: string
    positive: boolean
    color: string
    sparkData: number[]
  }

  interface AppRow {
    app: string
    revenue: string
    revenueShare: string
    ecpm: string
    fillRate: string
    impressions: string
  }

  interface AiInsight {
    title: string
    content: string
    highlights: string[]
  }

  // ─── State ───────────────────────────────────────────────────────────────────
  const dateRange = ref('最近30天')
  const appFilter = ref('全部')
  const countryFilter = ref('全部国家')
  const activeMetric = ref<'revenue' | 'ecpm' | 'fillRate'>('revenue')
  const pendingQuery = ref(false)

  const appliedFilters = ref({
    dateRange: dateRange.value,
    appFilter: appFilter.value,
    countryFilter: countryFilter.value
  })

  const isQueryDirty = computed(() => {
    return (
      appliedFilters.value.dateRange !== dateRange.value ||
      appliedFilters.value.appFilter !== appFilter.value ||
      appliedFilters.value.countryFilter !== countryFilter.value
    )
  })

  const dateOptions = ['最近7天', '最近30天', '最近90天', '自定义']
  const appOptions = ['全部', 'Weather8', 'PhoneTracker2', 'BatteryMax']
  const countryOptions = ['全部国家', '中国', '美国', '德国', '日本', '东南亚']

  // ─── KPI Cards ───────────────────────────────────────────────────────────────
  const kpiCards: KpiCard[] = [
    {
      label: '总收入',
      value: '$1.25M',
      change: '+12.3%',
      positive: true,
      color: '#38bdf8',
      sparkData: [18, 22, 19, 25, 28, 24, 30, 27, 33, 31, 36, 38]
    },
    {
      label: '平均eCPM',
      value: '$3.45',
      change: '+12.3%',
      positive: true,
      color: '#a78bfa',
      sparkData: [2.8, 3.0, 2.9, 3.1, 3.2, 3.0, 3.3, 3.2, 3.4, 3.3, 3.5, 3.45]
    },
    {
      label: '平均填充率',
      value: '92.8%',
      change: '-3.2%',
      positive: false,
      color: '#34d399',
      sparkData: [96, 95, 97, 94, 93, 96, 95, 93, 94, 92, 93, 92.8]
    },
    {
      label: '总展示次数',
      value: '362M',
      change: '+5.2%',
      positive: true,
      color: '#fb923c',
      sparkData: [280, 290, 295, 300, 305, 310, 318, 325, 340, 348, 355, 362]
    }
  ]

  // ─── AI Insights ─────────────────────────────────────────────────────────────
  const aiInsights: AiInsight[] = [
    {
      title: '应用表现差异',
      content:
        'Veather8贡献了AdMob收入的75%，但其eCPM($3.10) 低于 PhoneTracker2($3.85)。建议分析 PhoneTracker2的高eCPM广告位，并将成功经验复制到Weather8。',
      highlights: ['75%', 'PhoneTracker2', 'PhoneTracker2']
    },
    {
      title: 'J地区增长机会',
      content: 'AdMob在德国的收入增长了25%，eCPM稳定在$4.50以上，建议为该地区分配更多流量。',
      highlights: ['25%', '$4.50']
    },
    {
      title: '瀑布流优化建议',
      content:
        '在Weather8的默认瀑布流中，AdMob位于第3位。数据显示其填充率高达98%，建议将其上调至第2位以提升收入。',
      highlights: ['98%', '第2位']
    }
  ]

  // ─── Table Data ───────────────────────────────────────────────────────────────
  const tableData: AppRow[] = [
    {
      app: 'Weather8',
      revenue: '$850K',
      revenueShare: '75%',
      ecpm: '$3.10',
      fillRate: '98%',
      impressions: '302M'
    },
    {
      app: 'PhoneTracker2',
      revenue: '$620K',
      revenueShare: '68%',
      ecpm: '$3.85',
      fillRate: '96%',
      impressions: '81M'
    },
    {
      app: 'BatteryMax',
      revenue: '$380K',
      revenueShare: '52%',
      ecpm: '$2.90',
      fillRate: '94%',
      impressions: '302M'
    },
    {
      app: 'CleanMaster',
      revenue: '$180K',
      revenueShare: '38%',
      ecpm: '$2.60',
      fillRate: '91%',
      impressions: '81M'
    },
    {
      app: 'SpeedBooster',
      revenue: '$125K',
      revenueShare: '29%',
      ecpm: '$2.40',
      fillRate: '89%',
      impressions: '302M'
    },
    {
      app: 'VPN Shield',
      revenue: '$850K',
      revenueShare: '75%',
      ecpm: '$4.20',
      fillRate: '97%',
      impressions: '81M'
    },
    {
      app: 'File Manager',
      revenue: '$620K',
      revenueShare: '61%',
      ecpm: '$3.10',
      fillRate: '95%',
      impressions: '81M'
    }
  ]

  // ─── Chart ───────────────────────────────────────────────────────────────────
  const chartRef = ref<HTMLElement>()
  let chartInstance: echarts.ECharts | null = null

  const xDates = [
    '10月1日',
    '10月4日',
    '10月7日',
    '10月10日',
    '10月13日',
    '10月15日',
    '10月18日',
    '10月21日',
    '10月24日',
    '10月28日'
  ]

  const revenueData = [17000, 19500, 22000, 28000, 35000, 42500, 38000, 36000, 37500, 39000]
  const ecpmData = [3.1, 3.2, 3.0, 3.35, 3.45, 3.5, 3.3, 3.25, 3.35, 3.4]
  const fillData = [96.5, 95, 95.5, 96, 97, 93, 94, 93.5, 95, 97.5]

  async function runQuery() {
    if (pendingQuery.value) return
    pendingQuery.value = true
    try {
      // TODO: 接真实接口时，把请求放到这里。
      // 当前页面为静态 mock 展示，先只记录「已应用筛选」用于控制查询触发时机。
      appliedFilters.value = {
        dateRange: dateRange.value,
        appFilter: appFilter.value,
        countryFilter: countryFilter.value
      }
    } finally {
      pendingQuery.value = false
    }
  }

  function buildChartOption() {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.3)', width: 1 } },
        backgroundColor: '#1e2638',
        borderColor: '#2e3a50',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: '#e2e8f0', fontSize: 13 },
        formatter(params: any[]) {
          const date = params[0].axisValue
          const rev = params.find((p: any) => p.seriesName === '收入')
          const ecpm = params.find((p: any) => p.seriesName === 'eCPM')
          const fill = params.find((p: any) => p.seriesName === '填充率')
          return `
          <div style="font-weight:600;margin-bottom:8px;color:#94a3b8">${date}</div>
          ${rev ? `<div style="margin:4px 0"><span style="color:#38bdf8">●</span> 收入: <b style="color:#fff">$${rev.value.toLocaleString()}</b></div>` : ''}
          ${ecpm ? `<div style="margin:4px 0"><span style="color:#a78bfa">●</span> eCPM: <b style="color:#fff">$${ecpm.value}</b></div>` : ''}
          ${fill ? `<div style="margin:4px 0"><span style="color:#34d399">●</span> 填充率: <b style="color:#fff">${fill.value}%</b></div>` : ''}
        `
        }
      },
      legend: { show: false },
      grid: { top: 20, right: 70, bottom: 30, left: 80, containLabel: false },
      xAxis: {
        type: 'category',
        data: xDates,
        axisLine: { lineStyle: { color: '#2e3a50' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 12 },
        splitLine: { show: true, lineStyle: { color: '#1e2a3a', type: 'dashed' } }
      },
      yAxis: [
        {
          type: 'value',
          name: '收入 ($USD)',
          nameTextStyle: { color: '#64748b', fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#64748b',
            fontSize: 11,
            formatter: (v: number) => `$${(v / 1000).toFixed(0)}k`
          },
          splitLine: { lineStyle: { color: '#1e2a3a', type: 'dashed' } },
          min: 0,
          max: 50000
        },
        {
          type: 'value',
          name: 'eCPM/填充',
          nameTextStyle: { color: '#64748b', fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#64748b', fontSize: 11 },
          splitLine: { show: false },
          min: 88,
          max: 100
        }
      ],
      series: [
        {
          name: '收入',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            showSymbol: true,
            itemStyle: { color: '#38bdf8', borderColor: '#fff', borderWidth: 2 }
          },
          lineStyle: { color: '#38bdf8', width: 2.5 },
          itemStyle: { color: '#38bdf8' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56,189,248,0.25)' },
              { offset: 1, color: 'rgba(56,189,248,0.02)' }
            ])
          },
          data: revenueData,
          yAxisIndex: 0,
          z: 3
        },
        {
          name: 'eCPM',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            showSymbol: true,
            itemStyle: { color: '#a78bfa', borderColor: '#fff', borderWidth: 2 }
          },
          lineStyle: { color: '#a78bfa', width: 2.5 },
          itemStyle: { color: '#a78bfa' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(167,139,250,0.20)' },
              { offset: 1, color: 'rgba(167,139,250,0.02)' }
            ])
          },
          data: ecpmData.map((v) => v * 10000), // 映射到左轴显示
          yAxisIndex: 0,
          z: 2
        },
        {
          name: '填充率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            showSymbol: true,
            itemStyle: { color: '#34d399', borderColor: '#fff', borderWidth: 2 }
          },
          lineStyle: { color: '#34d399', width: 2.5 },
          itemStyle: { color: '#34d399' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(52,211,153,0.15)' },
              { offset: 1, color: 'rgba(52,211,153,0.02)' }
            ])
          },
          data: fillData.map((v) => v * 450), // 映射到左轴
          yAxisIndex: 0,
          z: 4
        }
      ]
    }
  }

  function initChart() {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
    chartInstance.setOption(buildChartOption())
  }

  function handleResize() {
    chartInstance?.resize()
  }

  onMounted(async () => {
    await nextTick()
    initChart()
    window.addEventListener('resize', handleResize)
    await runQuery()
  })

  onUnmounted(() => {
    chartInstance?.dispose()
    window.removeEventListener('resize', handleResize)
  })

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function highlightText(text: string, highlights: string[]): string {
    let result = text
    const colors = ['#38bdf8', '#a78bfa', '#34d399', '#fb923c']
    highlights.forEach((kw, i) => {
      const color = colors[i % colors.length]
      result = result.replace(
        new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<span style="color:${color};font-weight:600">${kw}</span>`
      )
    })
    return result
  }

  // const emit = defineEmits<{ (e: 'back'): void }>()
</script>

<template>
  <div class="admob-dashboard">
    <div class="admob-page-fx" aria-hidden="true"></div>
    <!-- ── Page body ──────────────────────────────────────────────── -->
    <div class="page-body">
      <!-- Page header -->
      <div class="page-header">
        <div class="filters filters-panel">
          <div class="filter-field">
            <span class="filter-label">日期范围</span>
            <el-select v-model="dateRange" size="default" class="filter-select">
              <el-option v-for="o in dateOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>
          <div class="filter-field">
            <span class="filter-label">App选择</span>
            <el-select v-model="appFilter" size="default" class="filter-select">
              <el-option v-for="o in appOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>
          <div class="filter-field">
            <span class="filter-label">国家</span>
            <el-select v-model="countryFilter" size="default" class="filter-select">
              <el-option v-for="o in countryOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>

          <el-button
            type="primary"
            round
            plain
            :loading="pendingQuery"
            :disabled="pendingQuery || !isQueryDirty"
            @click="runQuery"
          >
            查询
          </el-button>
        </div>
      </div>

      <!-- ── Main content grid ───────────────────────────────────── -->
      <div class="main-grid">
        <!-- Left column -->
        <div class="left-col">
          <!-- KPI cards -->
          <div class="kpi-row">
            <div
              v-for="card in kpiCards"
              :key="card.label"
              class="kpi-card"
              :style="{ '--accent': card.color }"
            >
              <div class="kpi-top">
                <span class="kpi-label">{{ card.label }}</span>
                <div class="kpi-spark">
                  <svg viewBox="0 0 80 28" preserveAspectRatio="none">
                    <defs>
                      <linearGradient :id="`g-${card.label}`" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" :stop-color="card.color" stop-opacity="0.6" />
                        <stop offset="100%" :stop-color="card.color" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      :points="
                        card.sparkData
                          .map((v, i) => {
                            const min = Math.min(...card.sparkData)
                            const max = Math.max(...card.sparkData)
                            const x = (i / (card.sparkData.length - 1)) * 80
                            const y = 26 - ((v - min) / (max - min || 1)) * 24
                            return `${x},${y}`
                          })
                          .join(' ')
                      "
                      fill="none"
                      :stroke="card.color"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div class="kpi-value" :style="{ color: card.color }">{{ card.value }}</div>
              <div class="kpi-change" :class="card.positive ? 'pos' : 'neg'">
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path v-if="card.positive" d="M6 2l4 6H2l4-6z" fill="currentColor" />
                  <path v-else d="M6 10L2 4h8L6 10z" fill="currentColor" />
                </svg>
                {{ card.change }}
              </div>
            </div>
          </div>

          <!-- Chart card -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="section-title">核心指标趋势</span>
              <div class="metric-btns">
                <button
                  :class="['metric-btn', activeMetric === 'revenue' && 'active-revenue']"
                  @click="activeMetric = 'revenue'"
                  >收入</button
                >
                <button
                  :class="['metric-btn', activeMetric === 'ecpm' && 'active-ecpm']"
                  @click="activeMetric = 'ecpm'"
                  >eCPM</button
                >
                <button
                  :class="['metric-btn', activeMetric === 'fillRate' && 'active-fill']"
                  @click="activeMetric = 'fillRate'"
                  >填充率</button
                >
              </div>
            </div>
            <div ref="chartRef" class="chart-canvas" />
          </div>
        </div>

        <!-- Right column: AI Insights -->
        <div class="ai-panel">
          <div class="ai-header">
            <span class="section-title">AI洞察与建议</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="ai-icon">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M8 12s1-3 4-3 4 3 4 3-1 3-4 3-4-3-4-3z"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path
                d="M12 2v2M12 20v2M2 12h2M20 12h2"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="ai-insights">
            <div v-for="(ins, i) in aiInsights" :key="i" class="insight-item">
              <div class="insight-title">{{ ins.title }}</div>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="insight-body" v-html="highlightText(ins.content, ins.highlights)" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Table ───────────────────────────────────────────────── -->
      <div class="table-card">
        <div class="table-head">
          <div class="section-title section-title--glow">按应用表现细分</div>
        </div>
        <div class="table-scroll">
          <el-table :data="tableData" style="width: 100%" :row-class-name="() => 'admob-row'">
            <el-table-column prop="app" label="应用" sortable min-width="160" align="left" />
            <el-table-column prop="revenue" label="总收入" sortable min-width="110" align="left" />
            <el-table-column
              prop="revenueShare"
              label="收入占比"
              sortable
              min-width="110"
              align="left"
            />
            <el-table-column prop="ecpm" label="eCPM" sortable min-width="110" align="left" />
            <el-table-column prop="fillRate" label="填充率" sortable min-width="110" align="left" />
            <el-table-column
              prop="impressions"
              label="展示次数"
              sortable
              min-width="120"
              align="left"
            />
            <el-table-column label="操作" min-width="120" align="center">
              <template #default="{ row }">
                <el-button
                  size="small"
                  class="detail-btn"
                  round
                  @click="goToAppAdPlatformPerformance(row)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  // ─── CSS Variables ────────────────────────────────────────────────────────────
  .admob-dashboard {
    --bg-base: var(--default-bg-color);
    --bg-card: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    --bg-card2: color-mix(in srgb, var(--default-box-color) 86%, transparent);
    --bg-hover: color-mix(in srgb, var(--default-box-color) 78%, transparent);
    --border: color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    --text-1: var(--text-primary);
    --text-2: var(--text-secondary);
    --text-3: var(--text-tertiary);
    --blue: var(--art-primary);
    --purple: color-mix(in srgb, var(--art-primary) 45%, var(--art-success));
    --green: var(--art-success);
    --orange: var(--art-warning);
    --red: var(--art-danger);
    --pos: var(--art-success);
    --neg: var(--art-danger);

    position: relative;
    min-height: 100vh;
    overflow-x: clip;
    font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
    color: var(--text-1);
    background: var(--bg-base);
    isolation: isolate;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          color-mix(in srgb, var(--art-success) 34%, transparent) 0%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          color-mix(in srgb, var(--art-primary) 34%, transparent) 0%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 40% 35% at 48% 16%,
          color-mix(in srgb, var(--art-warning) 14%, transparent) 0%,
          transparent 55%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 32%, transparent 62%);
      animation: admob-aurora-drift 14s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(
          color-mix(in srgb, var(--art-primary) 6%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--art-primary) 6%, transparent) 1px,
          transparent 1px
        );
      background-size: 40px 40px;
      mask-image: linear-gradient(to bottom, black 0%, black 22%, transparent 48%);
    }

    > *:not(.admob-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .admob-page-fx {
    position: absolute;
    inset: -12% -12% 52%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      color-mix(in srgb, var(--art-primary) 12%, transparent) 55deg,
      color-mix(in srgb, var(--art-success) 9%, transparent) 200deg,
      transparent 285deg,
      color-mix(in srgb, var(--art-warning) 7%, transparent) 330deg,
      transparent 360deg
    );
    opacity: 0.8;
    mask-image: linear-gradient(to bottom, black 0%, black 46%, transparent 82%);
    animation: admob-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes admob-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translate(1%, -0.8%);
    }
  }

  @keyframes admob-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  // ─── Top bar ─────────────────────────────────────────────────────────────────
  .top-bar {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 12px 28px;
    background: #0d1220;
    border-bottom: 1px solid var(--border);
  }

  .back-btn {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 14px;
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    transition:
      color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      background-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      transform 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

    &:hover {
      color: var(--text-1);
      background: var(--bg-hover);
      border-color: color-mix(in srgb, var(--art-primary) 28%, var(--default-border));
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--art-primary) 18%, transparent),
        0 0 18px color-mix(in srgb, var(--art-primary) 14%, transparent);
    }
  }

  .breadcrumb {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-2);

    .sep {
      margin: 0 6px;
      color: var(--text-3);
    }
  }

  // ─── Page body ───────────────────────────────────────────────────────────────
  .page-body {
    padding: 24px 28px;
  }

  .page-header {
    margin-bottom: 22px;
  }

  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-1);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .filters-panel {
    padding: 10px 14px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 20% 10%,
        color-mix(in srgb, var(--art-primary) 16%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        circle at 82% 16%,
        color-mix(in srgb, var(--art-success) 10%, transparent) 0%,
        transparent 52%
      ),
      linear-gradient(180deg, rgb(0 0 0 / 22%) 0%, rgb(0 0 0 / 10%) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: 16px;
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 10%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      box-shadow 0.35s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.3s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: color-mix(in srgb, var(--art-primary) 32%, var(--default-border));
      box-shadow:
        0 12px 40px rgb(0 0 0 / 44%),
        0 0 0 1px color-mix(in srgb, var(--art-primary) 18%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--art-primary) 12%, transparent),
        0 0 48px color-mix(in srgb, var(--art-primary) 14%, transparent);
    }

    > * {
      position: relative;
      z-index: 1;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(
          color-mix(in srgb, var(--art-primary) 5%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--art-primary) 5%, transparent) 1px,
          transparent 1px
        );
      background-size: 20px 20px;
      opacity: 0.55;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 36%, black 0%, transparent 72%);
    }
  }

  .filter-field {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 32px;
  }

  .filter-label {
    font-size: 13px;
    color: var(--text-2);
    white-space: nowrap;
  }

  .filter-select {
    width: 150px;

    :deep(.el-select__wrapper) {
      color: var(--text-1);
      background: rgb(0 0 0 / 22%) !important;
      border-color: color-mix(in srgb, var(--art-primary) 22%, transparent) !important;
      border-radius: 10px;
      box-shadow: none !important;
      transition:
        border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

      &:hover {
        border-color: color-mix(in srgb, var(--art-primary) 44%, transparent) !important;
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--art-primary) 12%, transparent) inset,
          0 0 20px color-mix(in srgb, var(--art-primary) 12%, transparent);
      }
    }

    :deep(.el-select__selected-item) {
      color: var(--text-1);
    }

    :deep(.el-select__caret) {
      color: var(--text-2);
    }
  }

  .filter-query-btn {
    min-height: 34px;
    padding: 0 16px;
    margin-left: 4px;
    font-weight: 600;
    letter-spacing: 0.2px;
    border: 1px solid color-mix(in srgb, var(--art-primary) 38%, transparent);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--art-primary) 10%, transparent) inset,
      0 10px 28px color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      transform 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover:not(.is-disabled) {
      border-color: color-mix(in srgb, var(--art-primary) 56%, transparent);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent) inset,
        0 0 22px color-mix(in srgb, var(--art-primary) 18%, transparent),
        0 12px 38px color-mix(in srgb, var(--art-primary) 12%, transparent);
      transform: translateY(-1px);
    }

    &:active:not(.is-disabled) {
      transition-duration: 0.14s;
      transform: translateY(0);
    }

    &:focus-visible {
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--art-primary) 38%, transparent),
        0 0 0 4px color-mix(in srgb, var(--art-primary) 16%, transparent);
    }
  }

  // ─── Main grid ───────────────────────────────────────────────────────────────
  .main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
    gap: clamp(14px, 2vw, 18px);
    margin-bottom: 18px;

    @media (width <= 1180px) {
      grid-template-columns: 1fr;
    }
  }

  .left-col {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  // ─── KPI Cards ───────────────────────────────────────────────────────────────
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: clamp(12px, 1.8vw, 14px);
  }

  .kpi-card {
    position: relative;
    padding: 18px 20px 16px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 18% 12%,
        color-mix(in srgb, var(--accent) 18%, transparent) 0%,
        transparent 62%
      ),
      radial-gradient(
        circle at 86% 16%,
        color-mix(in srgb, var(--art-primary) 12%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%);
    border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--default-border));
    border-radius: 12px;
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      0 0 0 1px color-mix(in srgb, var(--accent) 10%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--accent) 10%, transparent);
    transition:
      transform 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      filter 0.25s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(color-mix(in srgb, var(--accent) 6%, transparent) 1px, transparent 1px),
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--accent) 6%, transparent) 1px,
          transparent 1px
        );
      background-size: 22px 22px;
      opacity: 0.4;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 0%, transparent 74%);
    }

    &:hover {
      filter: brightness(1.05);
      border-color: color-mix(in srgb, var(--accent) 44%, var(--default-border));
      box-shadow:
        0 20px 52px -14px rgb(0 0 0 / 62%),
        0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--accent) 14%, transparent),
        0 0 40px color-mix(in srgb, var(--accent) 18%, transparent);
      transform: translateY(-5px);
    }

    &:active {
      transition-duration: 0.14s;
      transform: translateY(-2px);
    }
  }

  .kpi-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-2);
  }

  .kpi-spark {
    width: 80px;
    height: 28px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .kpi-value {
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.5px;
  }

  .kpi-change {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;

    &.pos {
      color: var(--pos);
    }

    &.neg {
      color: var(--neg);
    }
  }

  // ─── Chart ───────────────────────────────────────────────────────────────────
  .chart-card {
    padding: 20px 20px 16px;
    background:
      radial-gradient(
        circle at 14% 10%,
        color-mix(in srgb, var(--art-primary) 14%, transparent) 0%,
        transparent 60%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: 12px;
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      transform 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: color-mix(in srgb, var(--art-primary) 32%, var(--default-border));
      box-shadow:
        0 20px 52px -14px rgb(0 0 0 / 62%),
        0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--art-primary) 12%, transparent),
        0 0 44px color-mix(in srgb, var(--art-primary) 14%, transparent);
      transform: translateY(-4px);
    }
  }

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .chart-canvas {
    width: 100%;
    height: clamp(220px, 28vw, 300px);
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-1);
  }

  .metric-btns {
    display: flex;
    gap: 6px;
  }

  .metric-btn {
    padding: 5px 14px;
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    transition:
      color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      background-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      transform 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

    &:hover {
      background: var(--bg-hover);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admob-dashboard::before {
      animation: none;
    }

    .admob-page-fx {
      animation: none;
    }

    .back-btn,
    .metric-btn,
    .filters-panel,
    .kpi-card,
    .chart-card,
    .ai-panel,
    .table-card,
    .detail-btn {
      transition: none !important;
    }

    .kpi-card:hover,
    .kpi-card:active,
    .chart-card:hover,
    .ai-panel:hover {
      filter: none;
      transform: none;
    }

    .table-card:hover,
    .detail-btn:hover {
      box-shadow: none !important;
      transform: none !important;
    }
  }

  .active-revenue {
    color: var(--art-primary) !important;
    background: color-mix(in srgb, var(--art-primary) 16%, transparent) !important;
    border-color: color-mix(in srgb, var(--art-primary) 44%, transparent) !important;
  }

  .active-ecpm {
    color: color-mix(in srgb, var(--art-primary) 54%, var(--art-success)) !important;
    background: color-mix(in srgb, var(--art-primary) 12%, transparent) !important;
    border-color: color-mix(in srgb, var(--art-primary) 34%, transparent) !important;
  }

  .active-fill {
    color: var(--art-success) !important;
    background: color-mix(in srgb, var(--art-success) 14%, transparent) !important;
    border-color: color-mix(in srgb, var(--art-success) 40%, transparent) !important;
  }

  // ─── AI Panel ────────────────────────────────────────────────────────────────
  .ai-panel {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 20px 18px;
    background:
      radial-gradient(
        circle at 16% 10%,
        color-mix(in srgb, var(--art-primary) 16%, transparent) 0%,
        transparent 60%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: 12px;
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      transform 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: color-mix(in srgb, var(--art-primary) 32%, var(--default-border));
      box-shadow:
        0 20px 52px -14px rgb(0 0 0 / 62%),
        0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--art-primary) 12%, transparent),
        0 0 44px color-mix(in srgb, var(--art-primary) 14%, transparent);
      transform: translateY(-4px);
    }
  }

  .ai-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .ai-icon {
    color: var(--blue);
    opacity: 0.85;
  }

  .ai-insights {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .insight-item {
    padding: 14px 0;
    border-bottom: 1px solid var(--border);

    &:last-child {
      border-bottom: none;
    }
  }

  .insight-title {
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--blue);
  }

  .insight-body {
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--text-2);
  }

  // ─── Table ───────────────────────────────────────────────────────────────────
  .table-card {
    padding: 20px 20px 16px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 14% 10%,
        color-mix(in srgb, var(--art-primary) 14%, transparent) 0%,
        transparent 60%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: 12px;
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      transform 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: color-mix(in srgb, var(--art-primary) 32%, var(--default-border));
      box-shadow:
        0 20px 52px -14px rgb(0 0 0 / 62%),
        0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--art-primary) 12%, transparent),
        0 0 44px color-mix(in srgb, var(--art-primary) 14%, transparent);
      transform: translateY(-4px);
    }
  }

  .table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 18%, transparent);
  }

  .section-title--glow {
    background-image: linear-gradient(
      90deg,
      color-mix(in srgb, var(--text-primary) 92%, transparent) 0%,
      color-mix(in srgb, var(--art-primary) 70%, transparent) 55%,
      color-mix(in srgb, var(--art-success) 50%, transparent) 100%
    );
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .table-scroll {
    overflow: auto hidden;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      height: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--art-primary) 18%, transparent);
      border-radius: 9999px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    :deep(.el-table) {
      color: var(--text-1);
      background: transparent;

      --el-table-border-color: var(--border);
      --el-table-header-bg-color: transparent;
      --el-table-row-hover-bg-color: var(--bg-hover);
      --el-table-bg-color: transparent;
      --el-table-tr-bg-color: transparent;
      --el-table-header-text-color: var(--text-2);
      --el-table-text-color: var(--text-1);
      --el-table-border: 1px solid var(--border);
    }

    :deep(.el-table__header) {
      th {
        padding: 10px 0;
        font-size: 13px;
        font-weight: 600;
        background: rgb(0 0 0 / 18%) !important;
      }
      // Gradient header left-to-right on first column
      th:first-child {
        color: var(--text-1) !important;
        background: linear-gradient(
          90deg,
          color-mix(in srgb, var(--art-primary) 24%, transparent) 0%,
          color-mix(in srgb, var(--art-success) 14%, transparent) 100%
        ) !important;
      }
    }

    :deep(.admob-row) {
      td {
        padding: 10px 0;
        font-size: 13px;
      }
    }

    :deep(.el-table__row:hover) td {
      background: var(--bg-hover) !important;
    }

    :deep(.el-table__row) td {
      position: relative;
      transition:
        background-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));
    }

    :deep(.el-table__row:hover) td:first-child::before {
      position: absolute;
      top: 20%;
      bottom: 20%;
      left: 0;
      width: 3px;
      content: '';
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--art-primary) 70%, transparent),
        color-mix(in srgb, var(--art-success) 55%, transparent)
      );
      border-radius: 9999px;
      opacity: 0.9;
    }

    :deep(.cell) {
      padding: 0 16px;
    }
  }

  .detail-btn {
    font-size: 12px !important;
    color: var(--blue) !important;
    background: color-mix(in srgb, var(--art-primary) 12%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--art-primary) 32%, transparent) !important;
    border-radius: 6px !important;
    transition:
      transform 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      background: color-mix(in srgb, var(--art-primary) 18%, transparent) !important;
      border-color: var(--blue) !important;
      box-shadow: 0 0 18px color-mix(in srgb, var(--art-primary) 18%, transparent);
      transform: translateY(-1px);
    }
  }
</style>
