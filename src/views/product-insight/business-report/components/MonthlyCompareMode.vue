<template>
  <div class="compare-wrap">
    <!-- Left: App Selection Panel -->
    <div class="compare-sidebar">
      <div class="sidebar-header">
        <div class="mode-label">
          对比模式
          <span class="selected-count">已选 {{ selectedApps.length }} 个</span>
        </div>
        <button class="clear-btn" @click="clearAll">清除选择</button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="t in ['全部', '安卓', 'iOS']"
          :key="t"
          :class="['tab-btn', { active: platformFilter === t }]"
          @click="platformFilter = t"
          >{{ t }}</button
        >
        <div class="search-box">
          <input v-model="searchQ" placeholder="搜索..." />
        </div>
      </div>

      <!-- App List -->
      <div class="app-list">
        <!-- Selected: expanded card -->
        <div
          v-for="app in filteredApps"
          :key="app.id"
          :class="[
            'app-item',
            isSelected(app.id) ? 'app-item--selected' : 'app-item--plain',
            { disabled: !isSelected(app.id) && selectedApps.length >= 5 }
          ]"
          :style="
            isSelected(app.id)
              ? { borderColor: app.iconColor + '55', background: app.iconColor + '0d' }
              : {}
          "
          @click="toggleApp(app)"
        >
          <!-- Checkbox -->
          <div class="app-check">
            <div
              :class="['checkbox', { checked: isSelected(app.id) }]"
              :style="
                isSelected(app.id) ? { background: app.iconColor, borderColor: app.iconColor } : {}
              "
            >
              <span v-if="isSelected(app.id)">✓</span>
            </div>
          </div>

          <!-- Content -->
          <div class="app-info">
            <!-- Name row -->
            <div class="app-name-row">
              <span class="app-name">{{ app.name }}</span>
              <span class="app-category">{{ app.category }}</span>
              <template v-if="!isSelected(app.id)">
                <span class="app-revenue plain-revenue">{{ compareRevenueText(app.id) }}</span>
                <span
                  :class="[
                    'app-change',
                    compareRevenueChange(app.id) >= 0 ? 'positive' : 'negative'
                  ]"
                >
                  {{ compareRevenueChange(app.id) >= 0 ? '+' : ''
                  }}{{ compareRevenueChange(app.id) }}%
                </span>
              </template>
            </div>

            <!-- Selected: revenue + sparkline -->
            <template v-if="isSelected(app.id)">
              <div class="app-revenue-row">
                <span class="app-revenue-big" :style="{ color: app.iconColor }">
                  {{ compareRevenueText(app.id) }}
                </span>
                <span
                  :class="[
                    'app-change',
                    compareRevenueChange(app.id) >= 0 ? 'positive' : 'negative'
                  ]"
                >
                  {{ compareRevenueChange(app.id) >= 0 ? '+' : ''
                  }}{{ compareRevenueChange(app.id) }}%
                </span>
                <SparklineChart
                  class="app-sparkline"
                  :data="app.sparklineData || []"
                  :color="app.iconColor"
                  :width="80"
                  :height="32"
                />
              </div>
              <div class="app-meta">
                <span class="meta-label">MAU</span>
                <span class="meta-val">{{ compareUserText(app.id) }}</span>
                <span class="meta-label">预估利润</span>
                <span class="meta-val">{{ formatRevenue(app.profit) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        已选 {{ selectedApps.length }} / 18 个 &nbsp;·&nbsp; 最多对比 5 个
      </div>
    </div>

    <!-- Right: Compare Content -->
    <div class="compare-content" v-if="selectedApps.length > 0">
      <!-- ── Content Header ── -->
      <div class="content-header">
        <span class="section-title">对比分析</span>
        <div class="selected-tags">
          <span
            v-for="app in selectedApps"
            :key="app.id"
            class="tag"
            :style="{
              background: app.iconColor + '22',
              borderColor: app.iconColor + '55',
              color: app.iconColor
            }"
          >
            {{ app.name }} <span class="tag-x" @click.stop="toggleApp(app)">×</span>
          </span>
        </div>
        <div class="period-controls">
          <ElDatePicker
            v-if="props.period === 'daily'"
            v-model="localStartDate"
            class="compare-date-picker compare-date-picker--single"
            size="small"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            :clearable="false"
          />
          <ElDatePicker
            v-else
            v-model="localDateRange"
            class="compare-date-picker"
            size="small"
            type="daterange"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :clearable="false"
          />
          <span class="compare-toggle-label">{{ localCompareLabel }}</span>
          <ElSwitch
            v-model="localCompareEnabled"
            size="small"
            inline-prompt
            active-text="ON"
            inactive-text="OFF"
          />
        </div>
      </div>

      <!-- ── Top Grid: cards + MAU chart ── -->
      <div class="top-grid">
        <!-- Compare Cards -->
        <div class="compare-cards-wrap">
          <div class="cards-grid" :style="{ '--card-count': selectedApps.length }">
            <div
              v-for="app in selectedApps"
              :key="app.id"
              class="compare-card"
              :style="{
                borderColor: app.iconColor + '40',
                background: `linear-gradient(180deg, ${app.iconColor}28 0%, ${app.iconColor}06 100%)`
              }"
            >
              <div class="card-app-name" :style="{ color: app.iconColor }">{{ app.name }}</div>
              <div class="card-col-headers">
                <span>总收尾</span>
                <span>月环比</span>
              </div>
              <!-- Main revenue row -->
              <div class="card-revenue-row">
                <span class="card-revenue-val" :style="{ color: app.iconColor }">
                  {{ compareRevenueText(app.id) }}
                </span>
                <span
                  :class="[
                    'card-change',
                    compareRevenueChange(app.id) >= 0 ? 'positive' : 'negative'
                  ]"
                >
                  {{ compareRevenueChange(app.id) >= 0 ? '+' : ''
                  }}{{ compareRevenueChange(app.id) }}%
                </span>
              </div>
              <!-- Sub metrics -->
              <div v-for="m in getSubMetrics(app)" :key="m.label" class="card-sub-metric">
                <span class="card-sub-label">{{ m.label }}</span>
                <div class="card-sub-row">
                  <span class="card-sub-val">{{ m.value }}</span>
                  <span :class="['card-change', m.changeType]">{{ m.change }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MAU Chart -->
        <div class="mau-chart-panel">
          <div class="chart-header">
            <span class="chart-title">{{ userChartTitle }}</span>
            <div class="chart-legend">
              <span v-for="app in selectedApps" :key="app.id" class="legend-item">
                <span class="legend-dot" :style="{ background: app.iconColor }" />
                {{ app.name }}
              </span>
            </div>
          </div>
          <div ref="mauChartRef" class="echart-box" />
        </div>
      </div>

      <!-- ── Bottom Grid: trend chart + metrics table ── -->
      <div class="bottom-grid">
        <!-- Trend Chart -->
        <div class="trend-section">
          <div class="trend-header">
            <span class="section-title">{{ trendTitle }}</span>
            <div class="trend-legend">
              <span v-for="app in selectedApps" :key="app.id" class="legend-item">
                <span class="legend-line" :style="{ background: app.iconColor }" />
                {{ app.name }}
              </span>
            </div>
          </div>
          <div ref="trendChartRef" class="echart-trend" />
        </div>

        <!-- Metrics Table -->
        <div class="metrics-table-section">
          <div class="section-title mb-10">指标对比详情</div>
          <table class="metrics-table">
            <thead>
              <tr>
                <th>指标</th>
                <th v-for="app in selectedApps" :key="app.id" :style="{ color: app.iconColor }">
                  {{ app.name }}
                </th>
                <th>最佳</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareMetricRows" :key="row.metric">
                <td class="metric-name-cell">{{ row.metric }}</td>
                <td v-for="(val, idx) in row.values" :key="idx">{{ val }}</td>
                <td class="best-cell">
                  <span
                    class="best-tag"
                    :style="{
                      background: getBestApp(row)?.iconColor + '22',
                      color: getBestApp(row)?.iconColor
                    }"
                  >
                    {{ getBestApp(row)?.name }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-text">请在左侧选择应用进行对比分析</div>
      <div class="empty-sub">最多同时对比 5 个应用</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick, inject } from 'vue'
  import * as echarts from 'echarts'
  import SparklineChart from './SparklineChart.vue'
  import { businessReportContextKey } from '../composables/business-report-context'
  import { getCompareMetrics, getCompareOverview, getCompareTrends } from '../reportService'
  import type {
    AppListItem,
    CompareMetricsResponse,
    CompareOverviewResponse,
    CompareQueryParams,
    CompareTrendsResponse,
    ReportPeriod
  } from '../types'

  const props = defineProps<{
    period: ReportPeriod
    startDate: string
    endDate: string
    compareStartDate: string
    compareEndDate: string
  }>()

  // ── State ─────────────────────────────────────────────────────
  const platformFilter = ref('全部')
  const searchQ = ref('')

  const ctx = inject(businessReportContextKey)

  const baseAppList = computed(() => ctx?.sidebarAppList.value ?? [])

  type EnrichedApp = AppListItem & { sparklineData: number[] }
  const enrichedApps = ref<EnrichedApp[]>([])
  const selectedApps = ref<EnrichedApp[]>([])
  const compareOverview = ref<CompareOverviewResponse | null>(null)
  const compareTrends = ref<CompareTrendsResponse | null>(null)
  const compareMetrics = ref<CompareMetricsResponse | null>(null)
  const localStartDate = ref(props.startDate)
  const localEndDate = ref(props.endDate)
  const localCompareEnabled = ref(true)

  watch(
    baseAppList,
    (list) => {
      enrichedApps.value = list.map((app) => ({
        ...app,
        sparklineData: Array.from({ length: 12 }, (_, i) =>
          Math.floor(app.revenue * (0.6 + i * 0.035 + Math.random() * 0.05))
        )
      }))
      selectedApps.value = enrichedApps.value.slice(
        0,
        Math.min(3, Math.max(enrichedApps.value.length, 0))
      )
    },
    { immediate: true }
  )

  const filteredApps = computed(() => {
    let list = enrichedApps.value
    if (platformFilter.value !== '全部') {
      list = list.filter((a) => a.platforms.includes(platformFilter.value))
    }
    if (searchQ.value) {
      list = list.filter((a) => a.name.includes(searchQ.value))
    }
    return list
  })

  onMounted(() => {
    nextTick(() => {
      initMauChart()
      initTrendChart()
    })
  })

  function isSelected(id: string) {
    return selectedApps.value.some((a) => a.id === id)
  }

  function toggleApp(app: EnrichedApp) {
    const idx = selectedApps.value.findIndex((a) => a.id === app.id)
    if (idx >= 0) {
      selectedApps.value.splice(idx, 1)
    } else if (selectedApps.value.length < 5) {
      selectedApps.value.push(app)
    }
  }

  function clearAll() {
    selectedApps.value = []
  }

  function formatRevenue(val: number) {
    if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M'
    if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'K'
    return '$' + val
  }

  function parseYmd(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map(Number)
    return new Date(y, m - 1, d, 12, 0, 0, 0)
  }
  function formatYmd(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  function addDays(ymd: string, n: number): string {
    const d = parseYmd(ymd)
    d.setDate(d.getDate() + n)
    return formatYmd(d)
  }
  function addMonths(ymd: string, n: number): string {
    const d = parseYmd(ymd)
    d.setMonth(d.getMonth() + n)
    return formatYmd(d)
  }
  const localDateRange = computed<string[]>({
    get: () => [localStartDate.value, localEndDate.value],
    set: (val: string[]) => {
      if (!Array.isArray(val) || val.length !== 2) return
      localStartDate.value = val[0]
      localEndDate.value = val[1]
    }
  })
  const localCompareLabel = computed(() => {
    if (props.period === 'monthly') return '对比上月'
    if (props.period === 'weekly') return '对比上周'
    return '对比昨日'
  })
  const userChartTitle = computed(() => (props.period === 'monthly' ? 'MAU 对比' : 'DAU 对比'))
  const trendTitle = computed(() => {
    if (props.period === 'monthly') return '总收尾走势对比（近 6 个月）'
    if (props.period === 'weekly') return '总收尾走势对比（近 8 周）'
    return '总收尾走势对比（近 7 天）'
  })
  const localCompareStartDate = computed(() => {
    if (!localCompareEnabled.value) return localStartDate.value
    if (props.period === 'daily') return addDays(localStartDate.value, -1)
    if (props.period === 'weekly') return addDays(localStartDate.value, -7)
    return addMonths(localStartDate.value, -1)
  })
  const localCompareEndDate = computed(() => {
    if (!localCompareEnabled.value) return localEndDate.value
    if (props.period === 'daily') return addDays(localEndDate.value, -1)
    if (props.period === 'weekly') return addDays(localEndDate.value, -7)
    return addMonths(localEndDate.value, -1)
  })

  function compareRevenueText(appId: string): string {
    return overviewMap.value.get(appId)?.revenue ?? '-'
  }

  function compareRevenueChange(appId: string): number {
    return overviewMap.value.get(appId)?.revenueChange ?? 0
  }

  function compareUserText(appId: string): string {
    const entry = overviewMap.value.get(appId)
    const user = entry?.metrics.find(
      (m) => m.label === (props.period === 'monthly' ? 'MAU' : 'DAU')
    )
    return user?.value ?? '-'
  }

  const overviewMap = computed(() => {
    const map = new Map<string, CompareOverviewResponse['apps'][number]>()
    for (const item of compareOverview.value?.apps ?? []) map.set(item.id, item)
    return map
  })

  function getSubMetrics(app: AppListItem) {
    return overviewMap.value.get(app.id)?.metrics ?? []
  }

  // ── Comparison Table ─────────────────────────────────────────
  const compareMetricRows = computed(() =>
    (compareMetrics.value?.rows ?? []).map((row) => ({
      metric: row.metric,
      values: selectedApps.value.map((app) => row.values[app.id] ?? '-'),
      bestId: row.bestId
    }))
  )

  function getBestApp(row: { bestId: string }) {
    return selectedApps.value.find((app) => app.id === row.bestId)
  }

  // ── Charts ────────────────────────────────────────────────────
  const mauChartRef = ref<HTMLElement | null>(null)
  const trendChartRef = ref<HTMLElement | null>(null)
  let mauChart: echarts.ECharts | null = null
  let trendChart: echarts.ECharts | null = null

  const months = computed(() => compareTrends.value?.labels ?? [])
  const palette = ['#00D4A1', '#8B5CF6', '#4A9EF5', '#FB923C', '#F472B6']

  function initMauChart() {
    if (!mauChartRef.value) return
    mauChart = echarts.init(mauChartRef.value, 'dark')
    updateMauChart()
  }

  function initTrendChart() {
    if (!trendChartRef.value) return
    trendChart = echarts.init(trendChartRef.value, 'dark')
    updateTrendChart()
  }

  function updateMauChart() {
    if (!mauChart) return
    const series = (compareTrends.value?.userSeries ?? []).map((item, i) => ({
      name: item.name,
      type: 'bar',
      barMaxWidth: 28,
      itemStyle: { color: item.color || palette[i] || '#666', borderRadius: [3, 3, 0, 0] },
      data: item.values
    }))
    mauChart.setOption({
      backgroundColor: 'transparent',
      grid: { left: 36, right: 10, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: months.value,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: 10,
          formatter: (v: number) => (v >= 10000 ? (v / 10000).toFixed(0) + '万' : v + '')
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0D1529',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#fff', fontSize: 11 }
      },
      legend: { show: false },
      series
    })
  }

  function updateTrendChart() {
    if (!trendChart) return
    const series = (compareTrends.value?.revenueSeries ?? []).map((item, i) => {
      return {
        name: item.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: item.color || palette[i], width: 2 },
        itemStyle: { color: item.color || palette[i] },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: (item.color || palette[i] || '#00D4A1') + '30' },
            { offset: 1, color: (item.color || palette[i] || '#00D4A1') + '00' }
          ])
        },
        data: item.values,
        endLabel: {
          show: true,
          color: item.color || palette[i],
          formatter: (p: any) => {
            const v = p.value
            return v >= 1000000 ? (v / 1000000).toFixed(2) + 'M' : (v / 1000).toFixed(0) + 'K'
          },
          fontSize: 10
        }
      }
    })
    trendChart.setOption({
      backgroundColor: 'transparent',
      grid: { left: 56, right: 64, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: months.value,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: 10,
          formatter: (v: number) =>
            v >= 1000000
              ? (v / 1000000).toFixed(1) + 'M'
              : v >= 1000
                ? (v / 1000).toFixed(0) + 'K'
                : String(v)
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0D1529',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#fff', fontSize: 11 }
      },
      legend: { show: false },
      series
    })
  }

  async function refreshCompareData() {
    if (!selectedApps.value.length) {
      compareOverview.value = { apps: [] }
      compareTrends.value = { labels: [], revenueSeries: [], userSeries: [] }
      compareMetrics.value = { rows: [] }
      return
    }
    const f = ctx?.topBarFilters.value ?? {
      filterAppIds: [],
      platformList: [],
      sourceList: [],
      countryCodeList: []
    }
    const params: CompareQueryParams = {
      period: props.period,
      startDate: localStartDate.value,
      endDate: localEndDate.value,
      compareStartDate: localCompareStartDate.value,
      compareEndDate: localCompareEndDate.value,
      compareEnabled: localCompareEnabled.value,
      appId: '',
      appIds: selectedApps.value.map((app) => app.id),
      account: '',
      ...f
    }
    const [overviewRes, trendsRes, metricsRes] = await Promise.all([
      getCompareOverview(params),
      getCompareTrends(params),
      getCompareMetrics(params)
    ])
    compareOverview.value = overviewRes
    compareTrends.value = trendsRes
    compareMetrics.value = metricsRes
    nextTick(() => {
      updateMauChart()
      updateTrendChart()
    })
  }

  watch(
    () => [
      props.period,
      localStartDate.value,
      localEndDate.value,
      localCompareEnabled.value,
      localCompareStartDate.value,
      localCompareEndDate.value,
      ...selectedApps.value.map((a) => a.id),
      JSON.stringify(ctx?.topBarFilters.value ?? {})
    ],
    () => {
      void refreshCompareData()
    },
    { deep: true, immediate: true }
  )

  watch(
    () => props.period,
    () => {
      localStartDate.value = props.startDate
      localEndDate.value = props.endDate
      localCompareEnabled.value = true
    }
  )

  watch(
    () => localStartDate.value,
    (val) => {
      if (props.period === 'daily') {
        localEndDate.value = val
        return
      }
      if (localEndDate.value < val) {
        localEndDate.value = val
      }
    }
  )

  watch(
    () => localEndDate.value,
    (val) => {
      if (props.period === 'daily') return
      if (val < localStartDate.value) {
        localStartDate.value = val
      }
    }
  )

  // Resize handler
  function handleResize() {
    mauChart?.resize()
    trendChart?.resize()
  }
  onMounted(() => window.addEventListener('resize', handleResize))
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    mauChart?.dispose()
    trendChart?.dispose()
  })
</script>

<style scoped>
  .compare-wrap {
    display: flex;
    flex: 1; /* fill br-main--compare (flex column) */
    gap: 16px;
    min-height: 0;
    color: var(--rp-text);
  }

  /* ── Left Sidebar ─────────────────────────── */
  .compare-sidebar {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10px;
    width: 300px;
    min-height: 0; /* allow shrinking in flex */
    padding: 14px;
    overflow: hidden; /* header/footer fixed, app-list scrolls */
    background: var(--rp-surface);
    border: 1px solid var(--rp-border);
    border-radius: 10px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mode-label {
    font-size: 14px;
    font-weight: 600;
  }

  .selected-count {
    padding: 1px 6px;
    margin-left: 6px;
    font-size: 10px;
    color: #000;
    background: var(--rp-accent);
    border-radius: 3px;
  }

  .clear-btn {
    padding: 2px 6px;
    font-size: 12px;
    color: var(--rp-accent);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .clear-btn:hover {
    background: rgb(0 212 161 / 10%);
  }

  .filter-tabs {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .tab-btn {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--rp-muted);
    cursor: pointer;
    background: none;
    border: 1px solid var(--rp-border);
    border-radius: 5px;
    transition: all 0.2s;
  }

  .tab-btn.active {
    color: var(--rp-accent);
    background: rgb(0 212 161 / 12%);
    border-color: var(--rp-accent);
  }

  .search-box {
    flex: 1;
  }

  .search-box input {
    width: 100%;
    padding: 3px 8px;
    font-size: 11px;
    color: var(--rp-text);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--rp-border);
    border-radius: 5px;
    outline: none;
  }

  .app-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-height: 0; /* critical: allow flex child to scroll */
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 12%) transparent;
  }

  .app-list::-webkit-scrollbar {
    width: 3px;
  }

  .app-list::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 12%);
    border-radius: 2px;
  }

  .app-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 8px 10px;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .app-item:hover {
    background: rgb(255 255 255 / 4%);
  }

  .app-item.selected {
    background: rgb(0 212 161 / 6%);
    border-color: rgb(0 212 161 / 20%);
  }

  .app-item.disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  .app-check {
    padding-top: 2px;
  }

  .checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 10px;
    font-weight: 700;
    border: 1.5px solid var(--rp-muted);
    border-radius: 3px;
    transition: all 0.2s;
  }

  .checkbox.checked {
    color: #000;
    background: var(--rp-accent);
    border-color: var(--rp-accent);
  }

  .app-info {
    flex: 1;
    min-width: 0;
  }

  .app-name-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .app-name {
    font-size: 12px;
    font-weight: 600;
  }

  .app-category {
    font-size: 10px;
    color: var(--rp-muted);
  }

  /* ── App item variants ── */
  .app-item--selected {
    border: 1px solid;
    border-radius: 8px;
  }

  .app-item--plain {
    border: 1px solid transparent;
    border-radius: 6px;
  }

  /* Plain item: name + platform left, revenue + change right */
  .app-item--plain .app-name-row {
    flex-wrap: nowrap;
  }

  .plain-revenue {
    margin-left: auto;
    font-size: 12px;
    white-space: nowrap;
  }

  /* Selected item: revenue big row */
  .app-revenue-row {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin: 4px 0;
  }

  .app-revenue-big {
    font-size: 16px;
    font-weight: 700;
  }

  .app-sparkline {
    margin-left: auto;
  }

  .app-change {
    font-size: 11px;
  }

  /* Meta row (MAU + profit) */
  .app-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
    font-size: 10px;
  }

  .meta-label {
    color: var(--rp-muted);
  }

  .meta-val {
    font-weight: 500;
    color: var(--rp-text);
  }

  .app-revenue {
    margin-left: auto;
    font-size: 12px;
  }

  .sidebar-footer {
    padding-top: 8px;
    font-size: 11px;
    color: var(--rp-muted);
    text-align: center;
    border-top: 1px solid var(--rp-border);
  }

  /* ── Right Content ────────────────────────── */
  .compare-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    min-height: 0;
    padding: 16px;
    overflow-y: auto;
    background: var(--rp-surface);
    border: 1px solid var(--rp-border);
    border-radius: 12px;
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 12%) transparent;
  }

  .compare-content::-webkit-scrollbar {
    width: 3px;
  }

  .compare-content::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 12%);
    border-radius: 2px;
  }

  /* ── Content Header ── */
  .content-header {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    border: 1px solid;
    border-radius: 20px;
  }

  .tag-x {
    margin-left: 2px;
    cursor: pointer;
    opacity: 0.7;
  }

  .tag-x:hover {
    opacity: 1;
  }

  .period-controls {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-left: auto;
    font-size: 12px;
  }

  .compare-date-picker {
    width: 260px;
  }

  .compare-date-picker--single {
    width: 150px;
  }

  .compare-toggle-label {
    font-size: 11px;
    color: var(--rp-muted);
  }

  /* ── Top Grid ── */
  .top-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* Compare Cards */
  .compare-cards-wrap {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .cards-grid {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(var(--card-count, 3), 1fr);
    gap: 10px;
  }

  .compare-card {
    padding: 14px;
    border: 1px solid;
    border-radius: 10px;
  }

  .card-app-name {
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 700;
  }

  .card-col-headers {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 10px;
    color: var(--rp-muted);
  }

  .card-revenue-row {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding-bottom: 8px;
    margin-bottom: 6px;
    border-bottom: 1px solid rgb(255 255 255 / 6%);
  }

  .card-revenue-val {
    font-size: 18px;
    font-weight: 700;
  }

  .card-change {
    font-size: 11px;
    font-weight: 500;
  }

  .card-sub-metric {
    margin-bottom: 4px;
  }

  .card-sub-label {
    display: block;
    margin-bottom: 1px;
    font-size: 10px;
    color: var(--rp-muted);
  }

  .card-sub-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    font-size: 12px;
  }

  .card-sub-val {
    font-weight: 500;
  }

  /* MAU Chart */
  .mau-chart-panel {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 14px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid var(--rp-border);
    border-radius: 10px;
  }

  .chart-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .chart-title {
    font-size: 13px;
    font-weight: 600;
  }

  .chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .legend-item {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    color: var(--rp-muted);
  }

  .legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .legend-line {
    flex-shrink: 0;
    width: 14px;
    height: 2px;
    border-radius: 1px;
  }

  .echart-box {
    height: 200px;
  }

  /* ── Bottom Grid ── */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* Trend Section */
  .trend-section {
    display: flex;
    flex-direction: column;
    padding: 14px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid var(--rp-border);
    border-radius: 10px;
  }

  .trend-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .trend-legend {
    display: flex;
    gap: 12px;
  }

  .echart-trend {
    height: 220px;
  }

  /* Metrics Table */
  .metrics-table-section {
    padding: 14px;
    overflow-y: auto;
    background: rgb(255 255 255 / 2%);
    border: 1px solid var(--rp-border);
    border-radius: 10px;
  }

  .metrics-table-section::-webkit-scrollbar {
    width: 3px;
  }

  .metrics-table-section::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 10%);
  }

  .mb-10 {
    margin-bottom: 10px;
  }

  .metrics-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .metrics-table th {
    padding: 8px 10px;
    font-weight: 500;
    color: var(--rp-muted);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(--rp-border);
  }

  .metrics-table td {
    padding: 7px 10px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid rgb(255 255 255 / 3%);
  }

  .metric-name-cell {
    color: var(--rp-muted);
    text-align: left;
  }

  .best-cell {
    text-align: left;
  }

  .best-tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 10px;
    border-radius: 4px;
  }

  /* Empty */
  .empty-state {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: center;
    color: var(--rp-muted);
  }

  .empty-icon {
    font-size: 40px;
  }

  .empty-text {
    font-size: 14px;
  }

  .empty-sub {
    font-size: 12px;
  }

  /* Colors */
  .positive {
    color: #4ade80;
  }

  .negative {
    color: #f87171;
  }
</style>
