<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import * as echarts from 'echarts'
  import ScreenshotModal from './ScreenshotModal.vue'
  import { formatYYYYMMDD, getAppTodayYYYYMMDD } from '@/utils/app-now'
  import {
    fetchAgencyAnalysisMetaFilterOptions,
    fetchAgencyAnalysisOverview,
    fetchAgencyAnalysisAgencySummary,
    fetchAgencyAnalysisCampaignTable,
    fetchAgencyAnalysisDailyComparison,
    fetchAgencyAnalysisDonutSpendShare,
    fetchAgencyAnalysisChannelDistribution,
    fetchAgencyAnalysisCountryTop8,
    fetchAgencyAnalysisSpendTrend30d
  } from '@/api/agency-analysis'
  import type {
    AgencyAnalysisCharts,
    AgencyAnalysisFilterOption,
    AgencyExpandData,
    AgencyRow,
    CampaignDetail,
    CampaignRow,
    DailyRow,
    KpiCardItem,
    AgencyStatus
  } from '../types'

  defineOptions({ name: 'AdAgencyAnalysis' })

  function ymdToLocalDate(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10))
    return new Date(y, m - 1, d)
  }

  function addDaysYmd(ymd: string, delta: number): string {
    const d = ymdToLocalDate(ymd)
    d.setDate(d.getDate() + delta)
    return formatYYYYMMDD(d)
  }

  function last7Range(endYmd: string) {
    return { t_start_date: addDaysYmd(endYmd, -6), t_end_date: endYmd }
  }

  function last30Range(endYmd: string) {
    return { t_start_date: addDaysYmd(endYmd, -29), t_end_date: endYmd }
  }

  // ─────────────────── KPI Cards ───────────────────
  const kpiCards = ref<KpiCardItem[]>([])
  const pageLoading = ref(true)
  const agencySkeletonRows = 5
  const campaignSkeletonRows = 6
  const dailySkeletonRows = 8
  const kpiSkeletonCount = 6

  // ─────────────────── Agency Table Data ───────────────────
  const agencies = ref<AgencyRow[]>([])

  // ─────────────────── Expand Detail Data ───────────────────
  const agencyDetailMap = ref<Record<string, AgencyExpandData>>({})

  // ─────────────────── Campaign Detail Table ───────────────────
  const campaigns = ref<CampaignRow[]>([])

  // ─────────────────── Daily Comparison ───────────────────
  const dailyRows = ref<DailyRow[]>([])
  const charts = ref<AgencyAnalysisCharts>({
    donut: [],
    channelDistribution: { categories: [], series: [] },
    countryTop8: [],
    spendTrend30d: { dates: [], series: [] }
  })

  // ─────────────────── Expand State ───────────────────
  const expandedSet = ref<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    if (expandedSet.value.has(id)) {
      expandedSet.value.delete(id)
    } else {
      expandedSet.value.add(id)
    }
    expandedSet.value = new Set(expandedSet.value) // trigger reactivity
  }

  const isExpanded = (id: string) => expandedSet.value.has(id)

  // ─────────────────── Screenshot Modal ───────────────────
  const showScreenshot = ref(false)
  const screenshotAgency = ref('GatherOne')
  const router = useRouter()

  const openScreenshot = (agencyName?: string) => {
    screenshotAgency.value = agencyName || 'GatherOne'
    showScreenshot.value = true
  }

  /** 契约 02/03：跳转携带广告系列 id + appId + appName（详情页 API 使用 query.id 作为 campaignId） */
  function goCampaignDetail(payload: {
    id: string
    appId?: string
    appName?: string
    name?: string
  }) {
    const seriesId = String(payload.id ?? '').trim()
    if (!seriesId) {
      ElMessage.warning('缺少广告系列 ID，无法打开详情')
      return
    }
    const appId = String(payload.appId ?? '').trim()
    const appName = String(payload.appName ?? payload.name ?? '').trim()
    if (!appId || !appName) {
      ElMessage.warning('缺少应用 ID 或应用名称，无法打开详情')
      return
    }
    router.push({
      path: '/user-growth/ad-performance/campaign-detail',
      query: {
        id: seriesId,
        appId,
        appName
      }
    })
  }

  function goCampaignDetailFromRow(row: CampaignRow) {
    goCampaignDetail({
      id: row.id,
      appId: row.appId,
      appName: row.appName ?? row.name
    })
  }

  function goCampaignDetailFromExpand(cp: CampaignDetail) {
    goCampaignDetail({
      id: String(cp.id ?? '').trim(),
      appId: cp.appId,
      appName: cp.appName ?? cp.name
    })
  }

  // ─────────────────── Charts ───────────────────
  const donutRef = ref<HTMLElement | null>(null)
  const barRef = ref<HTMLElement | null>(null)
  const countryRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  let chartInstances: echarts.ECharts[] = []

  const disposeCharts = () => {
    chartInstances.forEach((c) => c.dispose())
    chartInstances = []
  }

  const initCharts = () => {
    disposeCharts()
    const bg = 'transparent'
    const donutRows = charts.value.donut
    const donutTotal = donutRows.reduce((sum, item) => sum + item.value, 0)

    // Donut chart
    if (donutRef.value) {
      const c = echarts.init(donutRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'item',
          formatter: (p: { name: string; value: number; percent: number }) =>
            `${p.name}: $${p.value.toLocaleString()} (${p.percent.toFixed(1)}%)`,
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 10 },
          data: donutRows.map((item) => item.name)
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: '36%',
          silent: true,
          style: {
            text: `$${donutTotal.toLocaleString()}`,
            fill: '#e2e8f0',
            fontSize: 18,
            fontWeight: 700
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['28%', '42%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: '#0d1829', borderWidth: 2 },
            label: {
              show: true,
              position: 'outside',
              formatter: (p: { name: string; value: number; percent: number }) =>
                `${p.name}\n$${p.value.toLocaleString()} (${p.percent.toFixed(1)}%)`,
              color: '#e2e8f0',
              fontSize: 10,
              lineHeight: 14
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 8,
              lineStyle: { color: '#94a3b8', width: 1 }
            },
            data: donutRows.map((item) => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: item.color }
            }))
          }
        ]
      })
      chartInstances.push(c)
    }

    // Grouped bar
    if (barRef.value) {
      const c = echarts.init(barRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          top: 4,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 9 },
          data: charts.value.channelDistribution.series.map((item) => item.name)
        },
        grid: { top: 30, right: 8, bottom: 24, left: 48 },
        xAxis: {
          type: 'category',
          data: charts.value.channelDistribution.categories,
          axisLabel: { color: '#64748b', fontSize: 9 },
          axisLine: { lineStyle: { color: '#1e3a5f' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b', fontSize: 9, formatter: (v: number) => `$${v / 1000}k` },
          splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
        },
        series: charts.value.channelDistribution.series.map((item) => ({
          name: item.name,
          type: 'bar',
          data: item.values,
          itemStyle: { color: item.color, borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 14
        }))
      })
      chartInstances.push(c)
    }

    // Country horizontal bar
    if (countryRef.value) {
      const countries = charts.value.countryTop8.map((item) => item.s_country_code)
      const values = charts.value.countryTop8.map((item) => item.spend)
      const percents = charts.value.countryTop8.map((item) => `${item.sharePct}%`)
      const c = echarts.init(countryRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        grid: { top: 4, right: 80, bottom: 4, left: 28 },
        xAxis: { type: 'value', show: false },
        yAxis: {
          type: 'category',
          data: countries,
          axisLabel: { color: '#94a3b8', fontSize: 10 },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            type: 'bar',
            data: values,
            barMaxWidth: 14,
            itemStyle: { color: '#00d4b4', borderRadius: [0, 3, 3, 0] },
            label: {
              show: true,
              position: 'right',
              color: '#94a3b8',
              fontSize: 9,
              formatter: (p: any) => `$${(p.value / 1000).toFixed(0)}k (${percents[p.dataIndex]})`
            }
          }
        ]
      })
      chartInstances.push(c)
    }

    // Trend area chart
    if (trendRef.value) {
      const dates = charts.value.spendTrend30d.dates
      const c = echarts.init(trendRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          bottom: 2,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 9 }
        },
        grid: { top: 12, right: 12, bottom: 36, left: 46 },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { color: '#64748b', fontSize: 9 },
          axisLine: { lineStyle: { color: '#1e3a5f' } },
          axisTick: { show: false },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b', fontSize: 9, formatter: (v: number) => `$${v / 1000}k` },
          splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
        },
        series: charts.value.spendTrend30d.series.map((item) => ({
          name: item.name,
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: item.values,
          lineStyle: { color: item.color, width: 2 },
          itemStyle: { color: item.color },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${item.color}55` },
                { offset: 1, color: `${item.color}08` }
              ]
            }
          }
        }))
      })
      chartInstances.push(c)
    }
  }

  const filterDate = ref(getAppTodayYYYYMMDD())
  const filterAppId = ref('all')
  const filterAgencyId = ref('all')
  const filterSource = ref('all')

  const appOptions = ref<AgencyAnalysisFilterOption[]>([])
  const agencyOptions = ref<AgencyAnalysisFilterOption[]>([])
  const sourceOptions = ref<AgencyAnalysisFilterOption[]>([])

  /** 筛选项拉取中（须优先于业务数据完成） */
  const metaLoading = ref(true)
  const metaLoadError = ref(false)
  /** meta 请求结束后为 true，避免 watch 在首屏抢跑业务请求 */
  const metaReady = ref(false)

  const hasDonutChartData = computed(() => charts.value.donut.length > 0)
  const hasBarChartData = computed(
    () =>
      charts.value.channelDistribution.categories.length > 0 &&
      charts.value.channelDistribution.series.length > 0
  )
  const hasCountryChartData = computed(() => charts.value.countryTop8.length > 0)
  const hasTrendChartData = computed(
    () =>
      charts.value.spendTrend30d.dates.length > 0 && charts.value.spendTrend30d.series.length > 0
  )

  async function loadMetaOptions() {
    metaLoading.value = true
    metaLoadError.value = false
    try {
      const opts = await fetchAgencyAnalysisMetaFilterOptions()
      appOptions.value = opts.appOptions ?? []
      agencyOptions.value = opts.agencyOptions ?? []
      sourceOptions.value = opts.sourceOptions ?? []
    } catch {
      metaLoadError.value = true
      appOptions.value = []
      agencyOptions.value = []
      sourceOptions.value = []
    } finally {
      metaLoading.value = false
      metaReady.value = true
    }
  }

  async function retryMetaOptions() {
    metaReady.value = false
    await loadMetaOptions()
    if (!metaLoadError.value) await loadPageData()
  }

  const filterQuery = () => ({
    t_date: filterDate.value,
    s_app_id: filterAppId.value,
    agency_id: filterAgencyId.value,
    source: filterSource.value
  })

  const agencyTotals = computed(() => {
    const rows = agencies.value
    if (!rows.length) {
      return {
        appCount: 0,
        channelCount: 0,
        spend: 0,
        installs: 0,
        cpi: 0,
        cpa: 0,
        roi: 0,
        budgetRate: 0
      }
    }
    const spend = rows.reduce((s, r) => s + r.spend, 0)
    const installs = rows.reduce((s, r) => s + r.installs, 0)
    const appCount = rows.reduce((s, r) => s + r.appCount, 0)
    const channelCount = rows.reduce((s, r) => s + r.channelCount, 0)
    const cpi = installs > 0 ? spend / installs : 0
    const cpa = installs > 0 ? rows.reduce((s, r) => s + r.cpa * r.installs, 0) / installs : 0
    const roi = rows.reduce((s, r) => s + r.roi, 0) / rows.length
    const budgetRate = rows.reduce((s, r) => s + r.budgetRate, 0) / rows.length
    return { appCount, channelCount, spend, installs, cpi, cpa, roi, budgetRate }
  })

  function clearDashboardData() {
    kpiCards.value = []
    agencies.value = []
    agencyDetailMap.value = {}
    campaigns.value = []
    dailyRows.value = []
    charts.value = {
      donut: [],
      channelDistribution: { categories: [], series: [] },
      countryTop8: [],
      spendTrend30d: { dates: [], series: [] }
    }
    expandedSet.value = new Set()
  }

  /**
   * 业务数据：须在筛选项 meta 成功返回之后再发起（由 onMounted / watch 顺序保证）。
   * 8 个接口并行异步请求，互不阻塞。
   */
  const loadPageData = async () => {
    disposeCharts()
    pageLoading.value = true
    try {
      const q = filterQuery()
      const d7 = last7Range(q.t_date)
      const d30 = last30Range(q.t_date)

      const [
        overview,
        agencySummary,
        campaignRes,
        dailyRes,
        donutRes,
        channelRes,
        countryRes,
        trendRes
      ] = await Promise.all([
        fetchAgencyAnalysisOverview(q),
        fetchAgencyAnalysisAgencySummary(q),
        fetchAgencyAnalysisCampaignTable(q),
        fetchAgencyAnalysisDailyComparison({ ...q, ...d7 }),
        fetchAgencyAnalysisDonutSpendShare({ t_date: q.t_date }),
        fetchAgencyAnalysisChannelDistribution({ t_date: q.t_date }),
        fetchAgencyAnalysisCountryTop8({ t_date: q.t_date }),
        fetchAgencyAnalysisSpendTrend30d(d30)
      ])

      kpiCards.value = overview.kpiCards ?? []
      agencies.value = agencySummary.agencies ?? []
      agencyDetailMap.value = agencySummary.agencyDetailMap ?? {}
      campaigns.value = campaignRes.campaigns ?? []
      dailyRows.value = dailyRes.dailyRows ?? []
      charts.value = {
        donut: donutRes.donut ?? [],
        channelDistribution: {
          categories: channelRes.categories ?? [],
          series: channelRes.series ?? []
        },
        countryTop8: countryRes.countryTop8 ?? [],
        spendTrend30d: trendRes ?? { dates: [], series: [] }
      }
    } catch {
      clearDashboardData()
    } finally {
      pageLoading.value = false
      await nextTick()
      initCharts()
    }
  }

  watch(
    [filterDate, filterAppId, filterAgencyId, filterSource],
    () => {
      if (!metaReady.value) return
      void loadPageData()
    },
    { flush: 'post' }
  )

  onMounted(async () => {
    await loadMetaOptions()
    if (metaLoadError.value) {
      disposeCharts()
      clearDashboardData()
      pageLoading.value = false
      return
    }
    await loadPageData()
  })
  onBeforeUnmount(disposeCharts)

  // ─────────────────── Helpers ───────────────────
  const fmtM = (v: number) => `$${v.toLocaleString()}`

  const statusInfo = (s: AgencyStatus) => {
    if (s === 'normal') return { label: '正常', dot: '#10b981', text: '#10b981' }
    if (s === 'low') return { label: '偏低', dot: '#f59e0b', text: '#f59e0b' }
    return { label: '暂停', dot: '#ef4444', text: '#ef4444' }
  }

  const roiClass = (v: number) => {
    if (v >= 100) return 'teal'
    if (v >= 90) return 'yellow'
    return 'red'
  }

  const roiBadgeClass = (v: number | null) => {
    if (v === null) return ''
    if (v >= 110) return 'roi-green'
    if (v >= 95) return 'roi-teal'
    if (v >= 85) return 'roi-yellow'
    return 'roi-red'
  }

  const changeClass = (v: number | null) => (v === null ? '' : v >= 0 ? 'change-up' : 'change-down')
  const changeTxt = (v: number | null) =>
    v === null ? '--' : `${v >= 0 ? '↑' : '↓'}${Math.abs(v)}%`

  const trendPath = (t: string) => {
    if (t === 'up') return 'M2,12 L6,8 L10,9 L14,5'
    if (t === 'down') return 'M2,5 L6,8 L10,7 L14,12'
    return 'M2,8 L6,8 L10,8 L14,8'
  }
  const trendColor = (t: string) => (t === 'up' ? '#00d4b4' : t === 'down' ? '#ef4444' : '#64748b')
</script>

<template>
  <div class="page-wrap">
    <!-- ── Top bar ── -->
    <div class="top-bar">
      <div class="top-filters">
        <template v-if="metaLoading">
          <div class="filter-skel filter-skel--date" />
          <div class="filter-skel filter-skel--select" />
          <div class="filter-skel filter-skel--select" />
          <div class="filter-skel filter-skel--select-wide" />
        </template>
        <template v-else-if="metaLoadError">
          <ElEmpty description="筛选项加载失败" :image-size="52" class="top-meta-empty" />
          <ElButton
            round
            size="small"
            type="primary"
            class="btn-retry-meta"
            @click="retryMetaOptions"
          >
            重试
          </ElButton>
        </template>
        <template v-else>
          <el-date-picker
            v-model="filterDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            size="small"
            class="filter-date"
            prefix-icon=""
          >
            <template #prefix>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 2px">
                <rect
                  x="1"
                  y="2"
                  width="12"
                  height="11"
                  rx="2"
                  stroke="#64748b"
                  stroke-width="1.2"
                />
                <path
                  d="M1 5h12M4 1v2M10 1v2"
                  stroke="#64748b"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
              </svg>
            </template>
          </el-date-picker>

          <el-select v-model="filterAppId" size="small" class="filter-select" style="width: 140px">
            <el-option
              v-for="opt in appOptions"
              :key="`app-${opt.value}`"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <el-select
            v-model="filterAgencyId"
            size="small"
            class="filter-select"
            style="width: 140px"
          >
            <el-option
              v-for="opt in agencyOptions"
              :key="`agency-${opt.value}`"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <el-select v-model="filterSource" size="small" class="filter-select" style="width: 160px">
            <el-option
              v-for="opt in sourceOptions"
              :key="`src-${opt.value}`"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>

        <button class="btn-screenshot" @click="openScreenshot()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 6px">
            <rect
              x="1"
              y="2"
              width="12"
              height="10"
              rx="2"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.2" />
          </svg>
          一键截图复制
        </button>
      </div>
    </div>

    <!-- ── KPI Cards ── -->
    <div class="kpi-row">
      <template v-if="pageLoading">
        <div
          v-for="i in kpiSkeletonCount"
          :key="`kpi-sk-${i}`"
          class="kpi-card kpi-card--skeleton"
          :style="{ '--kpi-sk-stagger': `${(i - 1) * 55}ms` }"
        >
          <div class="kpi-sk-line kpi-sk-line--label" />
          <div class="kpi-sk-line kpi-sk-line--value" />
          <div class="kpi-sk-line kpi-sk-line--meta" />
        </div>
      </template>
      <template v-else-if="!kpiCards.length">
        <div class="kpi-full-empty">
          <ElEmpty description="暂无数据" :image-size="72" class="block-empty" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="(card, i) in kpiCards"
          :key="i"
          class="kpi-card"
          :class="{ highlighted: card.highlighted }"
        >
          <div class="kpi-label">{{ card.label }}</div>
          <div class="kpi-value">{{ card.value }}</div>
          <div v-if="card.changeText" class="kpi-change" :class="card.changeUp ? 'up' : 'down'">
            {{ card.changeText }}
          </div>
          <svg
            v-if="card.sparkPoints"
            class="kpi-spark"
            viewBox="0 0 96 36"
            fill="none"
            preserveAspectRatio="none"
          >
            <polyline
              :points="card.sparkPoints"
              :stroke="card.sparkColor"
              stroke-width="1.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div v-if="card.highlighted" class="kpi-idx">{{ i + 1 }}</div>
        </div>
      </template>
    </div>

    <!-- ── Main layout ── -->
    <div class="main-layout">
      <!-- Left content -->
      <div class="main-left">
        <!-- ① Agency Summary Table -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">1</span>
              代投方汇总
              <span class="section-subtitle">14px</span>
            </div>
            <div class="section-actions">
              <span class="data-date">数据日期: {{ filterDate }}</span>
              <button class="btn-small-outline">导出</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th class="th-expand"></th>
                <th>代投方</th>
                <th class="text-right">应用数</th>
                <th class="text-right">广告平台数</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CPA($)</th>
                <th class="text-right">首日ROI</th>
                <th>预算执行率</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pageLoading">
                <tr
                  v-for="idx in agencySkeletonRows"
                  :key="`agency-skeleton-${idx}`"
                  class="skeleton-data-tr"
                  :style="{ '--sk-stagger': `${(idx - 1) * 48}ms` }"
                >
                  <td class="td-expand skeleton-td">
                    <span class="sk-brick sk-brick--sq" />
                  </td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--name" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"
                    ><span class="sk-brick sk-brick--num-wide"
                  /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--bar" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--sm" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--action" /></td>
                </tr>
              </template>
              <template v-else-if="!agencies.length">
                <tr>
                  <td colspan="12" class="table-empty-cell">
                    <ElEmpty description="暂无数据" :image-size="64" class="block-empty" />
                  </td>
                </tr>
              </template>
              <template v-else>
                <template v-for="ag in agencies" :key="ag.id">
                  <!-- Main row -->
                  <tr class="agency-row" :class="{ expanded: isExpanded(ag.id) }">
                    <td class="td-expand">
                      <button
                        class="expand-arrow"
                        :class="{ open: isExpanded(ag.id) }"
                        @click="toggleExpand(ag.id)"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 3.5L5 6.5L8 3.5"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                      </button>
                    </td>
                    <td>
                      <div class="agency-name-cell">
                        <span :style="{ color: ag.nameColor || '#e2e8f0' }">{{ ag.name }}</span>
                        <span v-if="ag.hasWarning" class="warn-icon">⚠</span>
                      </div>
                    </td>
                    <td class="text-right">{{ ag.appCount }}</td>
                    <td class="text-right">{{ ag.channelCount }}</td>
                    <td class="text-right fw-600">{{ fmtM(ag.spend) }}</td>
                    <td class="text-right">{{ ag.installs.toLocaleString() }}</td>
                    <td class="text-right">${{ ag.cpi.toFixed(2) }}</td>
                    <td class="text-right">${{ ag.cpa.toFixed(2) }}</td>
                    <td class="text-right" :class="roiClass(ag.roi)">
                      <span :class="[`roi-text-${roiClass(ag.roi)}`]">{{ ag.roi }}%</span>
                    </td>
                    <td>
                      <div class="budget-bar-wrap">
                        <div class="budget-bar-track">
                          <div
                            class="budget-bar-fill"
                            :style="{
                              width: `${ag.budgetRate}%`,
                              background:
                                ag.budgetRate >= 90
                                  ? '#00d4b4'
                                  : ag.budgetRate >= 80
                                    ? '#3b82f6'
                                    : '#f59e0b'
                            }"
                          />
                        </div>
                        <span class="budget-pct">{{ ag.budgetRate }}%</span>
                      </div>
                    </td>
                    <td>
                      <div class="status-cell">
                        <span
                          class="status-dot"
                          :style="{ background: statusInfo(ag.status).dot }"
                        />
                        <span :style="{ color: statusInfo(ag.status).text }">{{
                          statusInfo(ag.status).label
                        }}</span>
                      </div>
                    </td>
                    <td>
                      <button class="btn-expand-text" @click="toggleExpand(ag.id)">
                        {{ isExpanded(ag.id) ? '收起 ∧' : '展开 ∨' }}
                      </button>
                    </td>
                  </tr>

                  <!-- Expanded row -->
                  <tr v-if="isExpanded(ag.id)" class="expand-row">
                    <td colspan="12" class="expand-td">
                      <div class="expand-panel">
                        <!-- Expand header -->
                        <div class="exp-hd">
                          <div class="exp-hd-left">
                            <span class="exp-device-icon">📱</span>
                            <span class="exp-name" :style="{ color: ag.nameColor || '#e2e8f0' }">{{
                              ag.name
                            }}</span>
                            <span class="exp-badge active">ACTIVE</span>
                            <span class="exp-meta">广告投放代理商</span>
                            <span class="exp-meta">数据日期: {{ filterDate }}</span>
                          </div>
                          <div class="exp-hd-right">
                            <!-- <button class="btn-sm-teal">展开全部</button>
                          <button class="btn-sm-ghost">自定义列</button> -->
                            <button class="btn-sm-ghost">↓ 导出</button>
                            <button class="btn-sm-ghost" @click="toggleExpand(ag.id)"
                              >收起 ∧</button
                            >
                          </div>
                        </div>

                        <!-- Summary metrics -->
                        <div class="exp-metrics">
                          <div class="exp-metric">
                            <div class="exp-metric-label">应用数</div>
                            <div class="exp-metric-value">{{
                              agencyDetailMap[ag.id].appCount
                            }}</div>
                          </div>
                          <div class="exp-metric">
                            <div class="exp-metric-label">广告平台</div>
                            <div class="exp-metric-value">{{
                              agencyDetailMap[ag.id].channelCount
                            }}</div>
                          </div>
                          <div class="exp-metric">
                            <div class="exp-metric-label">总消耗</div>
                            <div class="exp-metric-value teal">{{
                              fmtM(agencyDetailMap[ag.id].totalSpend)
                            }}</div>
                          </div>
                          <div class="exp-metric">
                            <div class="exp-metric-label">总安装</div>
                            <div class="exp-metric-value">{{
                              agencyDetailMap[ag.id].totalInstalls.toLocaleString()
                            }}</div>
                          </div>
                          <div class="exp-metric">
                            <div class="exp-metric-label">平均首日ROI</div>
                            <div class="exp-metric-value-roi">
                              <span :class="`roi-text-${roiClass(agencyDetailMap[ag.id].roi)}`">
                                {{ agencyDetailMap[ag.id].roi }}%
                              </span>
                              <span
                                class="roi-tag"
                                :class="
                                  agencyDetailMap[ag.id].roi >= agencyDetailMap[ag.id].roiTarget
                                    ? 'roi-tag-meet'
                                    : 'roi-tag-miss'
                                "
                              >
                                {{
                                  agencyDetailMap[ag.id].roi >= agencyDetailMap[ag.id].roiTarget
                                    ? '达标'
                                    : '未达'
                                }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Weekly summary -->
                        <div class="exp-weekly">
                          <span class="weekly-lbl">近7天汇总</span>
                          <span class="weekly-item"
                            >广告支出:
                            <strong
                              >${{ agencyDetailMap[ag.id].weeklySpend.toLocaleString() }}</strong
                            ></span
                          >
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item"
                            >首日ROI:
                            <strong class="teal"
                              >{{ agencyDetailMap[ag.id].weeklyRoi }}%</strong
                            ></span
                          >
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item">CPA: <strong>--</strong></span>
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item"
                            >安装数:
                            <strong>{{
                              agencyDetailMap[ag.id].weeklyInstalls.toLocaleString()
                            }}</strong></span
                          >
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item"
                            >在投应用:
                            <strong>{{ agencyDetailMap[ag.id].weeklyApps }}</strong></span
                          >
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item"
                            >广告账户:
                            <strong>{{ agencyDetailMap[ag.id].weeklyAccounts }}</strong></span
                          >
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item"
                            >广告系列:
                            <strong>{{ agencyDetailMap[ag.id].weeklyCampaigns }}</strong></span
                          >
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item"
                            >投放国家:
                            <strong>{{ agencyDetailMap[ag.id].weeklyCountries }}</strong></span
                          >
                          <span class="weekly-sep">|</span>
                          <span class="weekly-item"
                            >投放天数:
                            <strong>{{ agencyDetailMap[ag.id].weeklyDays }}</strong></span
                          >
                        </div>

                        <!-- Account summary sub-table -->
                        <div class="exp-sub-section">
                          <div class="exp-sub-title">账户汇总</div>
                          <table class="sub-table">
                            <thead>
                              <tr>
                                <th>应用</th>
                                <th>平台</th>
                                <th>广告平台</th>
                                <th>账户ID</th>
                                <th>账户名称</th>
                                <th>广告支出</th>
                                <th>首日ROI</th>
                                <th>CPA</th>
                                <th>CPI</th>
                                <th>安装数</th>
                                <th>操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(acc, ai) in agencyDetailMap[ag.id].accounts" :key="ai">
                                <td>{{ acc.app }}</td>
                                <td>{{ acc.platform }}</td>
                                <td>{{ acc.adPlatform }}</td>
                                <td class="account-id">{{ acc.accountId }}</td>
                                <td>{{ acc.accountName }}</td>
                                <td>{{ acc.spend }}</td>
                                <td :class="`roi-text-${roiClass(acc.roi)}`">{{ acc.roi }}%</td>
                                <td>{{ acc.cpa }}</td>
                                <td>{{ acc.cpi }}</td>
                                <td>{{ acc.installs.toLocaleString() }}</td>
                                <td><span class="link-action">详情</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <!-- Campaign detail sub-table -->
                        <div class="exp-sub-section">
                          <div class="exp-sub-title">近期明细</div>
                          <table class="sub-table">
                            <thead>
                              <tr>
                                <th>广告系列名称</th>
                                <th>预算</th>
                                <th>广告支出</th>
                                <th>CPA</th>
                                <th>CPI</th>
                                <th>安装数</th>
                                <th class="roi-date-head">3/4</th>
                                <th class="roi-date-head">3/3</th>
                                <th class="roi-date-head">3/2</th>
                                <th>明细</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(cp, ci) in agencyDetailMap[ag.id].campaigns"
                                :key="ci"
                                :class="{ 'row-red-tint': cp.isRed }"
                              >
                                <td :class="{ 'text-danger': cp.isRed }">
                                  {{ cp.appName || cp.name || '--' }}
                                </td>
                                <td>${{ cp.budget }}</td>
                                <td>{{ cp.spend }}</td>
                                <td>{{ cp.cpa }}</td>
                                <td>{{ cp.cpi }}</td>
                                <td>{{ cp.installs }}</td>
                                <td>
                                  <span
                                    v-if="cp.roi34 !== null"
                                    class="roi-badge"
                                    :class="roiBadgeClass(cp.roi34)"
                                    >{{ cp.roi34 }}%</span
                                  >
                                  <span v-else class="dim">--</span>
                                </td>
                                <td>
                                  <span
                                    v-if="cp.roi33 !== null"
                                    class="roi-badge"
                                    :class="roiBadgeClass(cp.roi33)"
                                    >{{ cp.roi33 }}%</span
                                  >
                                  <span v-else class="dim">--</span>
                                </td>
                                <td>
                                  <span
                                    v-if="cp.roi32 !== null"
                                    class="roi-badge"
                                    :class="roiBadgeClass(cp.roi32)"
                                    >{{ cp.roi32 }}%</span
                                  >
                                  <span v-else class="dim">--</span>
                                </td>
                                <td>
                                  <span class="link-action" @click="goCampaignDetailFromExpand(cp)">
                                    查看
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div class="sub-footnote"
                            >注: 时区 PST(UTC-8), 货币 USD; ROI计算包含广告收入及付费收入。</div
                          >
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>

              <!-- Total row -->
              <tr v-if="!pageLoading && agencies.length" class="total-row">
                <td></td>
                <td>小计</td>
                <td class="text-right">{{ agencyTotals.appCount }}</td>
                <td class="text-right">{{ agencyTotals.channelCount }}</td>
                <td class="text-right fw-600">${{ agencyTotals.spend.toLocaleString('en-US') }}</td>
                <td class="text-right">{{ agencyTotals.installs.toLocaleString('en-US') }}</td>
                <td class="text-right">${{ agencyTotals.cpi.toFixed(2) }}</td>
                <td class="text-right">${{ agencyTotals.cpa.toFixed(2) }}</td>
                <td class="text-right">{{ Math.round(agencyTotals.roi) }}%</td>
                <td>
                  <div class="budget-bar-wrap">
                    <div class="budget-bar-track">
                      <div
                        class="budget-bar-fill"
                        :style="{
                          width: `${Math.min(100, Math.round(agencyTotals.budgetRate))}%`,
                          background: '#94a3b8'
                        }"
                      />
                    </div>
                    <span class="budget-pct">{{ Math.round(agencyTotals.budgetRate) }}%</span>
                  </div>
                </td>
                <td>--</td>
                <td>--</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ② Campaign Detail Table -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">2</span>
              代投广告系列明细
            </div>
            <div class="section-actions">
              <button class="btn-small-outline">自定义列</button>
              <button class="btn-small-outline">导出</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>代投方</th>
                <th>广告系列名称</th>
                <th>广告平台</th>
                <th>应用</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CTR(%)</th>
                <th class="text-right">CVR(%)</th>
                <th class="text-right">IPM</th>
                <th class="text-right">预算($)</th>
                <th class="text-right">执行率</th>
                <th>7日趋势</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pageLoading">
                <tr
                  v-for="idx in campaignSkeletonRows"
                  :key="`campaign-skeleton-${idx}`"
                  class="skeleton-data-tr"
                  :style="{ '--sk-stagger': `${(idx - 1) * 48}ms` }"
                >
                  <td class="skeleton-td"><span class="sk-brick sk-brick--sm-name" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--name-lg" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--sm" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--sm" /></td>
                  <td class="skeleton-td text-right"
                    ><span class="sk-brick sk-brick--num-wide"
                  /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"
                    ><span class="sk-brick sk-brick--num-tiny"
                  /></td>
                  <td class="skeleton-td text-right"
                    ><span class="sk-brick sk-brick--num-tiny"
                  /></td>
                  <td class="skeleton-td text-right"
                    ><span class="sk-brick sk-brick--num-tiny"
                  /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"
                    ><span class="sk-brick sk-brick--num-tiny"
                  /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--trend" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--action" /></td>
                </tr>
              </template>
              <template v-else-if="!campaigns.length">
                <tr>
                  <td colspan="14" class="table-empty-cell">
                    <ElEmpty description="暂无数据" :image-size="64" class="block-empty" />
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="(cp, i) in campaigns" :key="i" class="data-row">
                  <td :style="{ color: cp.agencyColor || '#e2e8f0' }">{{ cp.agency }}</td>
                  <td class="name-cell">{{ cp.appName || cp.name || '--' }}</td>
                  <td>{{ cp.channel }}</td>
                  <td>{{ cp.app }}</td>
                  <td class="text-right">${{ cp.spend.toLocaleString() }}</td>
                  <td class="text-right">{{ cp.installs.toLocaleString() }}</td>
                  <td class="text-right">${{ cp.cpi.toFixed(2) }}</td>
                  <td class="text-right">{{ cp.ctr }}%</td>
                  <td class="text-right">{{ cp.cvr }}%</td>
                  <td class="text-right">{{ cp.ipm }}</td>
                  <td class="text-right">${{ cp.budget.toLocaleString() }}</td>
                  <td class="text-right">{{ cp.execRate }}%</td>
                  <td>
                    <div class="trend-cell-inner">
                      <svg
                        class="trend-spark-svg"
                        width="40"
                        height="18"
                        viewBox="0 0 16 14"
                        fill="none"
                      >
                        <path
                          :d="trendPath(cp.trend)"
                          :stroke="trendColor(cp.trend)"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          fill="none"
                        />
                        <path
                          :d="trendPath(cp.trend) + ' V14 H2 Z'"
                          :fill="trendColor(cp.trend)"
                          fill-opacity="0.15"
                        />
                      </svg>
                      <span class="trend-arrow" :style="{ color: trendColor(cp.trend) }">
                        {{ cp.trend === 'up' ? '↑' : cp.trend === 'down' ? '↓' : '→' }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="link-action" @click="goCampaignDetailFromRow(cp)">详情 ›</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- ③ Daily Comparison -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">3</span>
              逐日对比分析（近7天）
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>代投方</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CPA($)</th>
                <th class="text-right">消耗环比</th>
                <th class="text-right">安装环比</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pageLoading">
                <tr
                  v-for="idx in dailySkeletonRows"
                  :key="`daily-skeleton-${idx}`"
                  class="skeleton-data-tr"
                  :style="{ '--sk-stagger': `${(idx - 1) * 48}ms` }"
                >
                  <td class="skeleton-td"><span class="sk-brick sk-brick--date" /></td>
                  <td class="skeleton-td"><span class="sk-brick sk-brick--sm-name" /></td>
                  <td class="skeleton-td text-right"
                    ><span class="sk-brick sk-brick--num-wide"
                  /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--num" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--pct" /></td>
                  <td class="skeleton-td text-right"><span class="sk-brick sk-brick--pct" /></td>
                </tr>
              </template>
              <template v-else-if="!dailyRows.length">
                <tr>
                  <td colspan="8" class="table-empty-cell">
                    <ElEmpty description="暂无数据" :image-size="64" class="block-empty" />
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="(row, i) in dailyRows" :key="i" class="data-row">
                  <td>{{ row.date }}</td>
                  <td :style="{ color: row.agencyColor || '#e2e8f0' }">{{ row.agency }}</td>
                  <td class="text-right">${{ row.spend.toLocaleString() }}</td>
                  <td class="text-right">{{ row.installs.toLocaleString() }}</td>
                  <td class="text-right">${{ row.cpi.toFixed(2) }}</td>
                  <td class="text-right">${{ row.cpa.toFixed(2) }}</td>
                  <td class="text-right" :class="changeClass(row.spendChange)">
                    {{ changeTxt(row.spendChange) }}
                  </td>
                  <td class="text-right" :class="changeClass(row.installsChange)">
                    {{ changeTxt(row.installsChange) }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="sidebar-right">
        <!-- Donut chart -->
        <div class="chart-block donut-chart-block">
          <div class="chart-title">代投方消耗占比</div>
          <div v-if="pageLoading" class="chart-skeleton chart-skeleton--donut" />
          <div v-else-if="!hasDonutChartData" class="chart-empty-wrap">
            <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
          </div>
          <div v-else ref="donutRef" class="chart-area" style="height: 220px" />
        </div>

        <!-- Bar chart -->
        <div class="chart-block">
          <div class="chart-title">广告平台分布分析</div>
          <div v-if="pageLoading" class="chart-skeleton chart-skeleton--bars">
            <span v-for="b in 6" :key="`bar-sk-${b}`" class="chart-skeleton-bar" />
          </div>
          <div v-else-if="!hasBarChartData" class="chart-empty-wrap chart-empty-wrap--short">
            <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
          </div>
          <div v-else ref="barRef" class="chart-area" style="height: 160px" />
        </div>

        <!-- Country horizontal bar -->
        <div class="chart-block">
          <div class="chart-title">国家消耗分布 Top 8</div>
          <div v-if="pageLoading" class="chart-skeleton chart-skeleton--country">
            <span v-for="r in 8" :key="`ct-sk-${r}`" class="chart-skeleton-hrow" />
          </div>
          <div v-else-if="!hasCountryChartData" class="chart-empty-wrap chart-empty-wrap--country">
            <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
          </div>
          <div v-else ref="countryRef" class="chart-area" style="height: 210px" />
        </div>

        <!-- Trend area -->
        <div class="chart-block">
          <div class="chart-title">代投消耗趋势（近30天）</div>
          <div v-if="pageLoading" class="chart-skeleton chart-skeleton--trend" />
          <div v-else-if="!hasTrendChartData" class="chart-empty-wrap chart-empty-wrap--trend">
            <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
          </div>
          <div v-else ref="trendRef" class="chart-area" style="height: 180px" />
        </div>
      </div>
    </div>

    <!-- Screenshot Modal -->
    <ScreenshotModal
      v-model="showScreenshot"
      :agency-name="screenshotAgency"
      @download="() => {}"
      @copy="() => {}"
    />
  </div>
</template>

<style scoped lang="scss">
  // ─── Variables ───
  $bg-page: #08111e;
  $bg-card: #0d1829;
  $bg-row-hover: #111f35;
  $bg-header: #0a1422;
  $border: #1e3a5f;
  $text-primary: #e2e8f0;
  $text-secondary: #94a3b8;
  $text-muted: #64748b;
  $teal: #00d4b4;
  $blue: #3b82f6;
  $amber: #f59e0b;
  $red: #ef4444;
  $green: #10b981;

  // ─── Page ───
  .page-wrap {
    min-height: 100vh;
    padding: 0;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: $text-primary;
    background: $bg-page;
  }

  // ─── Topbar ───
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: $bg-card;
    border-bottom: 1px solid $border;
  }

  .top-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .filter-skel {
    background: linear-gradient(90deg, #102135 22%, #1a3555 45%, #102135 68%);
    background-size: 220% 100%;
    border-radius: 6px;
    animation: row-loading 1.25s ease-in-out infinite;
  }

  .filter-skel--date {
    width: 130px;
    height: 30px;
  }

  .filter-skel--select {
    width: 140px;
    height: 30px;
  }

  .filter-skel--select-wide {
    width: 160px;
    height: 30px;
  }

  .top-meta-empty {
    flex: 1;
    min-width: 200px;
    padding: 4px 0;
  }

  .btn-retry-meta {
    flex-shrink: 0;
  }

  .kpi-full-empty {
    display: flex;
    flex: 1 1 100%;
    align-items: center;
    justify-content: center;
    min-height: 110px;
  }

  .table-empty-cell {
    padding: 28px 16px !important;
    text-align: center;
    vertical-align: middle;
    border-bottom: 1px solid #0f1c2e;
  }

  .chart-empty-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    background: #0a1422;
    border: 1px solid rgb(30 58 95 / 35%);
    border-radius: 6px;
  }

  .chart-empty-wrap--short {
    min-height: 160px;
  }

  .chart-empty-wrap--country {
    min-height: 210px;
  }

  .chart-empty-wrap--trend {
    min-height: 180px;
  }

  .block-empty :deep(.el-empty__description) {
    margin-top: 8px;
    font-size: 12px;
    color: $text-muted;
  }

  .block-empty :deep(.el-empty__image) {
    opacity: 0.85;
  }

  .filter-date {
    width: 130px !important;

    :deep(.el-input__wrapper) {
      height: 30px;
      background: #111f35 !important;
      border-color: $border !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }
  }

  .filter-select {
    width: 110px !important;

    :deep(.el-input__wrapper) {
      height: 30px;
      background: #111f35 !important;
      border-color: $border !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }

    :deep(.el-select__suffix) {
      color: $text-muted !important;
    }
  }

  .btn-screenshot {
    display: flex;
    align-items: center;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #0a1628;
    white-space: nowrap;
    cursor: pointer;
    background: $teal;
    border: none;
    border-radius: 6px;
    transition: background 0.2s;

    &:hover {
      background: #00bfa3;
    }
  }

  // ─── KPI Cards ───
  .kpi-row {
    display: flex;
    gap: 0;
    gap: 12px;
    padding: 16px 20px;
  }

  .kpi-card {
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #2d5070;
    }

    &.highlighted {
      background: linear-gradient(135deg, rgb(0 212 180 / 6%) 0%, $bg-card 60%);
      border-color: $teal;
    }
  }

  .kpi-idx {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    color: #0a1628;
    background: $teal;
    border-radius: 50%;
  }

  .kpi-label {
    margin-bottom: 6px;
    margin-left: 22px;
    font-size: 11px;
    color: $text-muted;
  }

  .kpi-value {
    margin-bottom: 4px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: $text-primary;
  }

  .kpi-change {
    font-size: 11px;

    &.up {
      color: $teal;
    }

    &.down {
      color: $red;
    }
  }

  .kpi-spark {
    position: absolute;
    right: 10px;
    bottom: 8px;
    width: 80px;
    height: 28px;
    opacity: 0.8;
  }

  // ─── Main layout ───
  .main-layout {
    display: flex;
    gap: 12px;
    padding: 0 20px 20px;
  }

  .main-left {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .sidebar-right {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10px;
    width: 260px;
  }

  // ─── Section blocks ───
  .section-block {
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: $bg-header;
    border-bottom: 1px solid $border;
  }

  .section-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
  }

  .section-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    color: $text-secondary;
    background: #1e3a5f;
    border-radius: 4px;
  }

  .section-subtitle {
    font-size: 11px;
    font-weight: 400;
    color: $text-muted;
  }

  .section-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .data-date {
    font-size: 11px;
    color: $text-muted;
  }

  .btn-small-outline {
    padding: 3px 10px;
    font-size: 11px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      border-color: #3d5570;
    }
  }

  // ─── Data Table ───
  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    thead tr {
      background: $bg-header;
    }

    th {
      padding: 8px 10px;
      font-weight: 500;
      color: $text-muted;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 9px 10px;
      color: $text-secondary;
      white-space: nowrap;
      border-bottom: 1px solid #0f1c2e;
    }

    .text-right {
      text-align: right;
    }

    .text-left {
      text-align: left;
    }

    .fw-600 {
      font-weight: 600;
      color: $text-primary;
    }

    .data-row:hover td {
      background: $bg-row-hover;
    }
  }

  // ─── 表格：按列分块的行骨架（一行多格）───
  $sk-base: linear-gradient(90deg, #102135 22%, #1a3555 45%, #102135 68%);
  $sk-bg-size: 220% 100%;

  .skeleton-data-tr {
    td {
      border-bottom: 1px solid #0f1c2e;
    }
  }

  .skeleton-td {
    vertical-align: middle;
  }

  .sk-brick {
    display: block;
    height: 13px;
    background: $sk-base;
    background-size: $sk-bg-size;
    border-radius: 4px;
    animation: row-loading 1.25s ease-in-out infinite;
    animation-delay: var(--sk-stagger, 0ms);
  }

  .skeleton-td.text-right .sk-brick {
    margin-left: auto;
  }

  .td-expand .sk-brick {
    margin-right: auto;
    margin-left: auto;
  }

  .sk-brick--sq {
    width: 16px;
    height: 16px;
  }

  .sk-brick--name {
    width: min(92%, 112px);
  }

  .sk-brick--name-lg {
    width: min(96%, 200px);
  }

  .sk-brick--sm-name {
    width: min(90%, 100px);
  }

  .sk-brick--num {
    width: 44px;
  }

  .sk-brick--num-wide {
    width: 56px;
  }

  .sk-brick--num-tiny {
    width: 32px;
  }

  .sk-brick--date {
    width: 88px;
  }

  .sk-brick--pct {
    width: 48px;
  }

  .sk-brick--sm {
    width: 56px;
  }

  .sk-brick--bar {
    width: min(88%, 96px);
    height: 10px;
  }

  .sk-brick--trend {
    width: 40px;
    height: 16px;
  }

  .sk-brick--action {
    width: 36px;
  }

  @keyframes row-loading {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  // ─── KPI 卡片骨架（逐块占位）───
  .kpi-card--skeleton {
    pointer-events: none;

    .kpi-sk-line {
      height: 12px;
      margin-bottom: 8px;
      background: $sk-base;
      background-size: $sk-bg-size;
      border-radius: 4px;
      animation: row-loading 1.25s ease-in-out infinite;
      animation-delay: var(--kpi-sk-stagger, 0ms);
    }

    .kpi-sk-line--label {
      width: 58%;
      margin-bottom: 10px;
      margin-left: 22px;
    }

    .kpi-sk-line--value {
      width: 72%;
      height: 22px;
      margin-bottom: 6px;
    }

    .kpi-sk-line--meta {
      width: 42%;
      height: 10px;
      margin-bottom: 0;
      opacity: 0.85;
    }
  }

  // ─── 图表区骨架 ───
  .chart-skeleton {
    box-sizing: border-box;
    width: 100%;
    background-color: #0a1422;
    background-image: $sk-base;
    background-size: $sk-bg-size;
    border: 1px solid rgb(30 58 95 / 35%);
    border-radius: 6px;
    animation: row-loading 1.25s ease-in-out infinite;
  }

  .chart-skeleton--donut {
    height: 220px;
  }

  .chart-skeleton--bars {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    justify-content: center;
    height: 160px;
    padding: 12px 10px 10px;
    background-color: #0a1422;
    background-image: none;
    animation: none;
  }

  .chart-skeleton-bar {
    flex: 1;
    max-width: 22px;
    background: $sk-base;
    background-size: $sk-bg-size;
    border-radius: 3px 3px 2px 2px;
    animation: row-loading 1.25s ease-in-out infinite;

    @for $i from 1 through 6 {
      &:nth-child(#{$i}) {
        height: #{28 + $i * 9}px;
        animation-delay: #{($i - 1) * 55}ms;
      }
    }
  }

  .chart-skeleton--country {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    height: 210px;
    padding: 10px 12px;
    background-color: #0a1422;
    background-image: none;
    animation: none;
  }

  .chart-skeleton-hrow {
    display: block;
    height: 12px;
    background: $sk-base;
    background-size: $sk-bg-size;
    border-radius: 3px;
    animation: row-loading 1.25s ease-in-out infinite;

    @for $i from 1 through 8 {
      &:nth-child(#{$i}) {
        width: #{42 + $i * 5}#{'%'};
        animation-delay: #{($i - 1) * 45}ms;
      }
    }
  }

  .chart-skeleton--trend {
    height: 180px;
  }

  // ─── Agency row ───
  .th-expand {
    width: 28px;
  }

  .td-expand {
    width: 28px;
    text-align: center;
  }

  .expand-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: $text-muted;
    cursor: pointer;
    background: #1a2d44;
    border: none;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      background: #243d57;
    }

    svg {
      transition: transform 0.2s;
    }

    &.open svg {
      transform: rotate(180deg);
    }
  }

  .agency-row {
    transition: background 0.15s;

    &:hover td {
      background: $bg-row-hover;
    }

    &.expanded td {
      background: rgb(0 212 180 / 4%);
      border-bottom-color: $teal;
    }
  }

  .agency-name-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .warn-icon {
    font-size: 12px;
    color: $amber;
  }

  .roi-text-teal {
    color: $teal;
  }

  .roi-text-yellow {
    color: $amber;
  }

  .roi-text-red {
    color: $red;
  }

  .budget-bar-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 100px;
  }

  .budget-bar-track {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: #1a2d44;
    border-radius: 3px;
  }

  .budget-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }

  .budget-pct {
    min-width: 32px;
    font-size: 11px;
    color: $text-secondary;
  }

  .status-cell {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
  }

  .status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .btn-expand-text {
    padding: 3px 8px;
    font-size: 11px;
    color: $teal;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;

    &:hover {
      background: rgb(0 212 180 / 8%);
    }
  }

  // ─── Expand panel ───
  .expand-row td {
    padding: 0 !important;
  }

  .expand-td {
    padding: 0 !important;
  }

  .expand-panel {
    margin: 0 2px 4px;
    overflow: hidden;
    background: #091523;
    border: 1px solid rgb(0 212 180 / 30%);
    border-radius: 0 0 6px 6px;
  }

  .exp-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #0d1e30;
    border-bottom: 1px solid $border;

    &-left {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    &-right {
      display: flex;
      gap: 6px;
      align-items: center;
    }
  }

  .exp-device-icon {
    font-size: 14px;
  }

  .exp-name {
    font-size: 13px;
    font-weight: 700;
  }

  .exp-badge {
    padding: 2px 7px;
    font-size: 10px;
    border-radius: 4px;

    &.active {
      color: $teal;
      background: rgb(0 212 180 / 15%);
      border: 1px solid rgb(0 212 180 / 30%);
    }
  }

  .exp-meta {
    font-size: 11px;
    color: $text-muted;
  }

  .btn-sm-teal {
    padding: 4px 10px;
    font-size: 11px;
    color: $teal;
    cursor: pointer;
    background: transparent;
    border: 1px solid $teal;
    border-radius: 4px;

    &:hover {
      background: rgb(0 212 180 / 10%);
    }
  }

  .btn-sm-ghost {
    padding: 4px 10px;
    font-size: 11px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;

    &:hover {
      border-color: #3d5570;
    }
  }

  // ─── Exp metrics ───
  .exp-metrics {
    display: flex;
    gap: 1px;
    background: $border;
    border-bottom: 1px solid $border;
  }

  .exp-metric {
    flex: 1;
    padding: 12px 14px;
    background: #091523;

    &-label {
      margin-bottom: 4px;
      font-size: 11px;
      color: $text-muted;
    }

    &-value {
      font-size: 20px;
      font-weight: 700;
      color: $text-primary;

      &.teal {
        color: $teal;
      }
    }

    &-value-roi {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
    }
  }

  .roi-tag {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &-meet {
      color: $teal;
      background: rgb(0 212 180 / 15%);
    }

    &-miss {
      color: $red;
      background: rgb(239 68 68 / 15%);
    }
  }

  // ─── Weekly summary ───
  .exp-weekly {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 8px 14px;
    font-size: 11px;
    background: #060e1a;
    border-bottom: 1px solid $border;

    .weekly-lbl {
      font-weight: 500;
      color: $text-secondary;
    }

    .weekly-item {
      color: $text-muted;

      strong {
        color: $text-primary;
      }
    }

    .weekly-sep {
      color: #2d3f54;
    }

    .teal {
      color: $teal;
    }
  }

  // ─── Sub tables ───
  .exp-sub-section {
    padding: 10px 14px;
    border-bottom: 1px solid $border;

    &:last-child {
      border-bottom: none;
    }
  }

  .exp-sub-title {
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .sub-table {
    width: 100%;
    font-size: 11px;
    border-collapse: collapse;

    th {
      padding: 5px 8px;
      font-weight: 500;
      color: $text-muted;
      text-align: left;
      white-space: nowrap;
      background: #060e1a;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 6px 8px;
      color: $text-secondary;
      white-space: nowrap;
      border-bottom: 1px solid #0a1422;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: #0d1829;
    }

    .roi-date-head {
      color: $teal;
      text-align: center;
      background: rgb(0 212 180 / 8%);
    }
  }

  .account-id {
    font-size: 10px;
    color: $text-muted;
  }

  .roi-badge {
    display: inline-block;
    min-width: 40px;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    border-radius: 4px;

    &.roi-green {
      color: #10b981;
      background: rgb(16 185 129 / 15%);
    }

    &.roi-teal {
      color: $teal;
      background: rgb(0 212 180 / 15%);
    }

    &.roi-yellow {
      color: $amber;
      background: rgb(245 158 11 / 15%);
    }

    &.roi-red {
      color: $red;
      background: rgb(239 68 68 / 15%);
    }
  }

  .row-red-tint td {
    background: rgb(239 68 68 / 4%);
  }

  .text-danger {
    color: $red !important;
  }

  .dim {
    color: $text-muted;
  }

  .link-action {
    font-size: 11px;
    color: $teal;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .sub-footnote {
    padding-top: 6px;
    margin-top: 8px;
    font-size: 10px;
    color: #475569;
    border-top: 1px solid $border;
  }

  // ─── Campaign table ───
  .name-cell {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trend-cell-inner {
    display: inline-flex;
    gap: 0;
    align-items: center;
    line-height: 1;
  }

  .trend-spark-svg {
    display: block;
    flex-shrink: 0;
  }

  .trend-arrow {
    font-size: 16px;
    line-height: 1;
  }

  // ─── Daily change ───
  .change-up {
    color: $teal;
  }

  .change-down {
    color: $red;
  }

  // ─── Total row ───
  .total-row {
    td {
      font-weight: 600;
      color: $text-primary;
      background: $bg-header;
      border-top: 1px solid $border;
    }
  }

  // ─── Sidebar charts ───
  .chart-block {
    padding: 10px 12px 8px;
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
  }

  .chart-title {
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
  }

  .chart-area {
    width: 100%;
  }

  .donut-chart-block {
    overflow: visible;
  }
</style>
