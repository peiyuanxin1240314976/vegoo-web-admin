<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import * as echarts from 'echarts'
  import ScreenshotModal from './ScreenshotModal.vue'
  import { formatYYYYMMDD, getAppTodayYYYYMMDD } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
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

  function expandFirstAgency() {
    const firstId = String(agencies.value?.[0]?.id ?? '').trim()
    expandedSet.value = firstId ? new Set([firstId]) : new Set()
  }

  // ─────────────────── Screenshot Modal ───────────────────
  const showScreenshot = ref(false)
  const router = useRouter()

  /** 截图报告：优先取当前展开的代投方，否则「当前代投方」模式无账户/ROI 明细 */
  const focusedAgencyIdForScreenshot = computed(() => {
    for (const id of expandedSet.value) return id
    return null
  })

  const screenshotTitleName = computed(() => {
    const id = focusedAgencyIdForScreenshot.value
    if (id) {
      const row = agencies.value.find((a) => a.id === id)
      return row?.name ?? '代投方'
    }
    return '全部代投方'
  })

  const openScreenshot = () => {
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
      path: '/campaign-detail',
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

  const _today = getAppTodayYYYYMMDD()
  const filterDateRange = ref<[string, string]>([addDaysYmd(_today, -6), _today])
  const filterAppId = ref('all')
  const filterAgencyId = ref('all')
  const filterSource = ref('all')

  function handleSearch() {
    if (!metaReady.value) return
    void loadPageData()
  }

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
    startDate: filterDateRange.value[0],
    endDate: filterDateRange.value[1],
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
        fetchAgencyAnalysisDailyComparison(q),
        fetchAgencyAnalysisDonutSpendShare(q),
        fetchAgencyAnalysisChannelDistribution(q),
        fetchAgencyAnalysisCountryTop8(q),
        fetchAgencyAnalysisSpendTrend30d(q)
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

      // 代投方汇总：默认展开第一条
      expandFirstAgency()
    } catch {
      clearDashboardData()
    } finally {
      pageLoading.value = false
      await nextTick()
      initCharts()
    }
  }

  watch(
    [filterDateRange, filterAppId, filterAgencyId, filterSource],
    () => {
      if (!metaReady.value) return
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
  <div class="agency-analysis-page page-wrap page-wrap--ap-fx flex flex-col min-h-0">
    <div class="aa-page-fx" aria-hidden="true"></div>
    <!-- 与广告成效一致：筛选区随页面滚动，非 sticky 顶栏 -->
    <div class="agency-analysis-page__section agency-analysis-page__section--filters aa-entry-1">
      <div class="aa-filter-panel">
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
          <div class="filter-date-wrap">
            <el-date-picker
              v-model="filterDateRange"
              :shortcuts="dateRangeShortcuts"
              type="daterange"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="default"
              class="filter-date"
              popper-class="aa-agency-filter-popper"
              unlink-panels
            />
          </div>

          <el-select
            v-model="filterAppId"
            size="default"
            class="filter-select"
            popper-class="aa-agency-filter-popper"
            style="width: 140px"
          >
            <el-option
              v-for="opt in appOptions"
              :key="`app-${opt.value}`"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <el-select
            v-model="filterSource"
            size="default"
            class="filter-select"
            popper-class="aa-agency-filter-popper"
            style="width: 160px"
          >
            <el-option
              v-for="opt in sourceOptions"
              :key="`src-${opt.value}`"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <ElButton type="primary" plain round @click="handleSearch" v-ripple> 查询 </ElButton>
        </template>

        <button type="button" class="btn-screenshot" @click="openScreenshot()">
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
    <div class="kpi-row aa-entry-2">
      <template v-if="pageLoading">
        <div
          v-for="i in kpiSkeletonCount"
          :key="`kpi-sk-${i}`"
          class="kpi-card kpi-card--skeleton kpi-card--skeleton-fx"
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
          <div class="kpi-head">
            <div class="kpi-label">{{ card.label }}</div>
            <div v-if="card.changeText" class="kpi-change" :class="card.changeUp ? 'up' : 'down'">
              {{ card.changeText }}
            </div>
          </div>
          <div class="kpi-value">{{ card.value }}</div>
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
    <div class="main-layout aa-entry-3">
      <!-- Left content -->
      <div class="main-left">
        <!-- ① Agency Summary Table -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">1</span>
              代投方汇总
            </div>
            <div class="section-actions">
              <span class="data-date">{{ filterDateRange[0] }} ~ {{ filterDateRange[1] }}</span>
              <button class="btn-small-outline">导出</button>
            </div>
          </div>

          <div class="table-scroll">
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
                              <span
                                class="exp-name"
                                :style="{ color: ag.nameColor || '#e2e8f0' }"
                                >{{ ag.name }}</span
                              >
                              <span class="exp-badge active">ACTIVE</span>
                              <span class="exp-meta">广告投放代理商</span>
                              <span class="exp-meta"
                                >{{ filterDateRange[0] }} ~ {{ filterDateRange[1] }}</span
                              >
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
                                    <span
                                      class="link-action"
                                      @click="goCampaignDetailFromExpand(cp)"
                                    >
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
                  <td class="text-right fw-600"
                    >${{ agencyTotals.spend.toLocaleString('en-US') }}</td
                  >
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

          <div class="table-scroll">
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
        </div>

        <!-- ③ Daily Comparison -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">3</span>
              逐日对比分析（近7天）
            </div>
          </div>

          <div class="table-scroll">
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
      :agency-name="screenshotTitleName"
      :data-date="filterDateRange[0] + ' ~ ' + filterDateRange[1]"
      :page-loading="pageLoading"
      :kpi-cards="kpiCards"
      :agencies="agencies"
      :agency-detail-map="agencyDetailMap"
      :campaigns="campaigns"
      :daily-rows="dailyRows"
      :donut="charts.donut"
      :channel-distribution="charts.channelDistribution"
      :country-top8="charts.countryTop8"
      :focused-agency-id="focusedAgencyIdForScreenshot"
      @download="() => {}"
      @copy="() => {}"
    />
  </div>
</template>

<style scoped lang="scss">
  @use '../../../user-growth/ad-performance/styles/ap-card-fx.scss' as *;

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

  // ─── Page（对齐广告成效：整页 padding + 筛选区非固定） ───
  .agency-analysis-page.page-wrap {
    box-sizing: border-box;
    padding: 20px 24px 28px;
  }

  .page-wrap {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow-x: clip;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: $text-primary;
    background: $bg-page;
  }

  .agency-analysis-page__section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .agency-analysis-page__section--filters {
    margin-bottom: 20px;
  }

  @media (width <= 768px) {
    .agency-analysis-page.page-wrap {
      padding: 16px;
    }
  }

  .page-wrap--ap-fx {
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          rgb(16 185 129 / 42%) 0%,
          rgb(6 182 212 / 20%) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          rgb(59 130 246 / 38%) 0%,
          rgb(139 92 246 / 18%) 38%,
          transparent 58%
        ),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 18%) 0%, transparent 55%),
        radial-gradient(
          ellipse 55% 42% at 76% 4%,
          rgb(34 211 238 / 22%) 0%,
          rgb(59 130 246 / 10%) 40%,
          transparent 58%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation:
        aa-aurora-drift 14s ease-in-out infinite alternate,
        aa-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 8%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > *:not(.aa-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .aa-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 14%) 55deg,
      rgb(6 182 212 / 10%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 12%) 200deg,
      rgb(52 211 153 / 8%) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 10%) 330deg,
      rgb(249 115 22 / 6%) 350deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: aa-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes aa-aurora-drift {
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

  @keyframes aa-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.08) skewX(1deg);
    }
  }

  @keyframes aa-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes aa-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes aa-skel-orbit {
    to {
      transform: rotate(360deg);
    }
  }

  .aa-entry-1 {
    animation: aa-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.05s;
  }

  .aa-entry-2 {
    animation: aa-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.16s;
  }

  .aa-entry-3 {
    animation: aa-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.26s;
  }

  .aa-filter-panel {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
    padding: 18px 20px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
    transition:
      box-shadow 0.35s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      border-color 0.3s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: rgb(96 165 250 / 48%);
      box-shadow:
        0 12px 40px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(96 165 250 / 22%),
        inset 0 1px 0 rgb(186 230 253 / 16%),
        0 0 48px rgb(59 130 246 / 14%);
    }
  }

  .filter-skel {
    background: linear-gradient(
      90deg,
      rgb(16 185 129 / 12%) 0%,
      rgb(59 130 246 / 22%) 45%,
      rgb(16 185 129 / 12%) 100%
    );
    background-size: 220% 100%;
    border: 1px solid rgb(96 165 250 / 18%);
    border-radius: 9999px;
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

  .btn-search {
    --el-button-size: 40px;

    flex-shrink: 0;
    height: 40px;
    padding: 0 16px;
    font-size: 13px;
    background: linear-gradient(135deg, #059669 0%, #10b981 48%, #34d399 100%);
    border: 1px solid rgb(16 185 129 / 45%);
    border-radius: 9999px;
    box-shadow:
      0 0 18px rgb(16 185 129 / 30%),
      inset 0 1px 0 rgb(255 255 255 / 12%);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease,
      filter 0.22s ease;

    &:hover {
      filter: brightness(1.06);
      box-shadow:
        0 0 28px rgb(16 185 129 / 42%),
        inset 0 1px 0 rgb(255 255 255 / 16%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
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

    :deep(.el-empty__description) {
      font-size: 13px;
    }
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

  .filter-date-wrap {
    flex: none;
    width: 250px;

    :deep(.el-date-editor) {
      width: 100% !important;
      min-width: 0 !important;
    }
  }

  .filter-date {
    flex: none !important;
    width: 150px !important;

    :deep(.el-input__wrapper) {
      min-height: 40px;
      padding: 0 12px;
      background: rgb(16 185 129 / 6%) !important;
      border: 1px solid rgb(16 185 129 / 28%) !important;
      border-radius: 9999px !important;
      box-shadow: none !important;
      transition:
        border-color 0.22s ease,
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    :deep(.el-input__wrapper:hover) {
      border-color: rgb(16 185 129 / 55%) !important;
      box-shadow: 0 0 12px rgb(16 185 129 / 18%) !important;
    }

    :deep(.el-input__wrapper.is-focus) {
      background: rgb(16 185 129 / 10%) !important;
      border-color: #10b981 !important;
      box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }

    :deep(.el-input__prefix-inner) {
      color: #10b981;
    }
  }

  .filter-select {
    width: 130px !important;

    :deep(.el-input__wrapper) {
      min-height: 40px;
      padding: 0 12px;
      background: rgb(16 185 129 / 6%) !important;
      border: 1px solid rgb(16 185 129 / 28%) !important;
      border-radius: 9999px !important;
      box-shadow: none !important;
      transition:
        border-color 0.22s ease,
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    :deep(.el-input__wrapper:hover) {
      border-color: rgb(16 185 129 / 55%) !important;
      box-shadow: 0 0 12px rgb(16 185 129 / 18%) !important;
    }

    :deep(.el-input__wrapper.is-focus) {
      background: rgb(16 185 129 / 10%) !important;
      border-color: #10b981 !important;
      box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }

    :deep(.el-select__suffix),
    :deep(.el-select__caret) {
      color: #10b981 !important;
    }
  }

  .btn-screenshot {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    color: #ecfdf5;
    white-space: nowrap;
    cursor: pointer;
    background: linear-gradient(135deg, #059669 0%, #10b981 48%, #34d399 100%);
    border: 1px solid rgb(16 185 129 / 45%);
    border-radius: 9999px;
    box-shadow:
      0 0 18px rgb(16 185 129 / 35%),
      inset 0 1px 0 rgb(255 255 255 / 12%);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease,
      filter 0.22s ease;

    &:hover {
      filter: brightness(1.06);
      box-shadow:
        0 0 28px rgb(16 185 129 / 45%),
        inset 0 1px 0 rgb(255 255 255 / 16%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // ─── KPI Cards ───
  .kpi-row {
    display: flex;
    gap: 16px;
    padding: 0;
    margin-bottom: 12px;
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton):nth-child(1) {
    --kpi-accent: var(--art-primary);
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton):nth-child(2) {
    --kpi-accent: var(--art-success);
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton):nth-child(3) {
    --kpi-accent: var(--art-warning);
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton):nth-child(4) {
    --kpi-accent: var(--art-danger);
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton):nth-child(5) {
    --kpi-accent: color-mix(in srgb, var(--art-primary) 48%, var(--art-success));
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton):nth-child(6) {
    --kpi-accent: color-mix(in srgb, var(--art-success) 42%, var(--art-warning));
  }

  .kpi-card {
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 22px;
    overflow: hidden;
    border-radius: 12px;

    &:not(.kpi-card--skeleton) {
      --kpi-accent: var(--art-primary);

      @include ap-neon-bg;
      @include ap-card-mesh;
      @include ap-panel-hover;

      isolation: isolate;
      border-color: color-mix(in srgb, var(--kpi-accent) 46%, transparent);
      border-radius: 12px;
      box-shadow:
        0 12px 48px rgb(0 0 0 / 48%),
        0 0 0 1px color-mix(in srgb, var(--kpi-accent) 22%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--kpi-accent) 16%, transparent),
        inset 0 -12px 32px rgb(0 0 0 / 30%),
        0 0 52px color-mix(in srgb, var(--kpi-accent) 22%, transparent);

      &::before {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        content: '';
        background:
          radial-gradient(
            ellipse 118% 78% at 104% -18%,
            color-mix(in srgb, var(--kpi-accent) 44%, transparent) 0%,
            transparent 58%
          ),
          radial-gradient(
            ellipse 82% 62% at -12% 108%,
            color-mix(in srgb, var(--kpi-accent) 30%, transparent) 0%,
            transparent 58%
          );
        border-radius: inherit;
      }

      &:hover {
        border-color: color-mix(in srgb, var(--kpi-accent) 58%, transparent);
        box-shadow:
          0 24px 72px rgb(0 0 0 / 52%),
          0 0 0 1px color-mix(in srgb, var(--kpi-accent) 32%, transparent),
          inset 0 1px 0 color-mix(in srgb, var(--kpi-accent) 22%, transparent),
          inset 0 -12px 32px rgb(0 0 0 / 32%),
          0 0 72px color-mix(in srgb, var(--kpi-accent) 32%, transparent),
          0 0 120px color-mix(in srgb, var(--kpi-accent) 14%, transparent);
      }
    }
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton).highlighted {
    --kpi-accent: var(--art-success);

    border-color: color-mix(in srgb, var(--art-success) 58%, transparent);
    box-shadow:
      0 12px 48px rgb(0 0 0 / 48%),
      0 0 0 1px color-mix(in srgb, var(--art-success) 32%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-success) 22%, transparent),
      inset 0 -12px 32px rgb(0 0 0 / 30%),
      0 0 56px color-mix(in srgb, var(--art-success) 28%, transparent);

    &:hover {
      border-color: color-mix(in srgb, var(--art-success) 68%, transparent);
      box-shadow:
        0 24px 72px rgb(0 0 0 / 52%),
        0 0 0 1px color-mix(in srgb, var(--art-success) 40%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--art-success) 26%, transparent),
        inset 0 -12px 32px rgb(0 0 0 / 32%),
        0 0 80px color-mix(in srgb, var(--art-success) 38%, transparent),
        0 0 120px color-mix(in srgb, var(--art-success) 16%, transparent);
    }
  }

  .kpi-idx {
    position: absolute;
    top: 8px;
    right: 10px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    color: #0a1628;
    background: $teal;
    border-radius: 50%;
  }

  .kpi-head {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .kpi-label {
    font-size: 13px;
    font-weight: 600;
    color: $text-muted;
  }

  .kpi-value {
    position: relative;
    z-index: 1;
    margin-bottom: 6px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
    color: $text-primary;
  }

  .kpi-change {
    flex-shrink: 0;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    background: rgb(148 163 184 / 10%);
    border-radius: 9999px;

    &.up {
      color: $teal;
      background: rgb(0 212 180 / 10%);
      border: 1px solid rgb(0 212 180 / 22%);
    }

    &.down {
      color: $red;
      background: rgb(239 68 68 / 10%);
      border: 1px solid rgb(239 68 68 / 22%);
    }
  }

  .kpi-spark {
    position: absolute;
    right: 14px;
    bottom: 12px;
    z-index: 1;
    width: 96px;
    height: 34px;
    opacity: 0.85;
  }

  // ─── Main layout ───
  .main-layout {
    display: flex;
    gap: 12px;
    padding: 0 0 20px;
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
    width: 360px;
  }

  @media (width <= 1366px) {
    .sidebar-right {
      width: 300px;
    }
  }

  // ─── Responsive（中/小尺寸兼容） ───
  @media (width <= 1200px) {
    .main-layout {
      flex-direction: column;
      gap: 14px;
    }

    .sidebar-right {
      flex-flow: row wrap;
      gap: 12px;
      width: 100%;
    }

    .sidebar-right .chart-block {
      flex: 1 1 calc(50% - 6px);
      min-width: 320px;
    }

    .kpi-row {
      flex-wrap: wrap;
    }

    .kpi-row > .kpi-card {
      flex: 1 1 calc(33.333% - 11px);
      min-width: 260px;
    }
  }

  @media (width <= 900px) {
    .sidebar-right {
      flex-direction: column;
    }

    .sidebar-right .chart-block {
      flex: 1 1 100%;
      min-width: 0;
    }

    .kpi-row > .kpi-card {
      flex: 1 1 calc(50% - 8px);
      min-width: 0;
    }
  }

  @media (width <= 560px) {
    .kpi-row > .kpi-card {
      flex: 1 1 100%;
    }
  }

  // ─── Section blocks ───
  .section-block {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    border-radius: 12px;
    transition:
      border-color 0.32s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow 0.42s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

    @include ap-neon-bg;
    @include ap-card-mesh;

    &:hover {
      border-color: rgb(96 165 250 / 52%);
      box-shadow:
        0 16px 56px rgb(0 0 0 / 50%),
        0 0 0 1px rgb(96 165 250 / 22%),
        inset 0 1px 0 rgb(186 230 253 / 16%),
        0 0 56px rgb(59 130 246 / 14%);
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: $bg-header;
    border-bottom: 1px solid $border;
  }

  .section-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
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

  .table-scroll {
    width: 100%;
    overflow: auto hidden;
    -webkit-overflow-scrolling: touch;
  }

  .table-scroll .data-table {
    min-width: 980px;
  }

  .data-date {
    font-size: 12px;
    color: $text-muted;
  }

  .btn-small-outline {
    padding: 3px 10px;
    font-size: 12px;
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
    font-size: 13px;
    border-collapse: collapse;

    thead tr {
      background: $bg-header;
    }

    th {
      padding: 9px 11px;
      font-weight: 500;
      color: $text-muted;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 10px 11px;
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

  .kpi-card--skeleton-fx {
    overflow: visible;
    background: rgb(10 10 14 / 90%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 12px;
    box-shadow:
      0 0 24px rgb(59 130 246 / 12%),
      inset 0 0 0 1px rgb(186 230 253 / 8%);

    &::before {
      position: absolute;
      inset: -2px;
      z-index: 0;
      padding: 2px;
      pointer-events: none;
      content: '';
      background: conic-gradient(
        from 0deg,
        rgb(59 130 246 / 55%),
        rgb(6 182 212 / 45%),
        rgb(16 185 129 / 50%),
        rgb(59 130 246 / 55%)
      );
      border-radius: 14px;
      opacity: 0.35;
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: aa-skel-orbit 2.8s linear infinite;
    }

    .kpi-sk-line {
      position: relative;
      z-index: 1;
    }
  }

  // ─── 图表区骨架 ───
  .chart-skeleton {
    box-sizing: border-box;
    width: 100%;
    background-color: rgb(10 10 14 / 88%);
    background-image: $sk-base;
    background-size: $sk-bg-size;
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 12px;
    box-shadow:
      0 0 20px rgb(59 130 246 / 10%),
      inset 0 1px 0 rgb(186 230 253 / 8%);
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
    font-size: 13px;
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
    font-size: 12px;
    color: $text-secondary;
  }

  .status-cell {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 13px;
  }

  .status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .btn-expand-text {
    padding: 3px 8px;
    font-size: 12px;
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
    font-size: 14px;
    font-weight: 700;
  }

  .exp-badge {
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &.active {
      color: $teal;
      background: rgb(0 212 180 / 15%);
      border: 1px solid rgb(0 212 180 / 30%);
    }
  }

  .exp-meta {
    font-size: 12px;
    color: $text-muted;
  }

  .btn-sm-teal {
    padding: 4px 10px;
    font-size: 12px;
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
    font-size: 12px;
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
      font-size: 12px;
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
    font-size: 12px;
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
    font-size: 12px;
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
    font-size: 12px;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .sub-table {
    width: 100%;
    font-size: 12px;
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
    font-size: 11px;
    color: $text-muted;
  }

  .roi-badge {
    display: inline-block;
    min-width: 40px;
    padding: 1px 6px;
    font-size: 11px;
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
    font-size: 13px;
    color: $teal;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .sub-footnote {
    padding-top: 6px;
    margin-top: 8px;
    font-size: 11px;
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
    font-size: 17px;
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
    position: relative;
    padding: 14px 14px 12px;
    overflow: hidden;
    isolation: isolate;
    border-radius: 12px;
    transition:
      border-color 0.32s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow 0.42s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

    @include ap-neon-bg;
    @include ap-card-mesh;

    &:hover {
      border-color: rgb(96 165 250 / 48%);
      box-shadow:
        0 14px 48px rgb(0 0 0 / 48%),
        0 0 0 1px rgb(96 165 250 / 18%),
        inset 0 1px 0 rgb(186 230 253 / 14%),
        0 0 40px rgb(59 130 246 / 12%);
    }
  }

  .chart-title {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: $text-secondary;
  }

  .chart-area {
    width: 100%;
  }

  .donut-chart-block {
    overflow: visible;
  }

  @media (prefers-reduced-motion: reduce) {
    .page-wrap--ap-fx::before,
    .page-wrap--ap-fx::after,
    .aa-page-fx {
      animation: none;
    }

    .aa-entry-1,
    .aa-entry-2,
    .aa-entry-3 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .kpi-card--skeleton-fx::before {
      animation: none;
    }
  }
</style>

<style lang="scss">
  /* 挂载在 body，须非 scoped；与广告成效筛选下拉视觉对齐 */
  .aa-agency-filter-popper.el-popper {
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid rgb(96 165 250 / 28%) !important;
    border-radius: 12px !important;
    box-shadow:
      0 16px 48px rgb(0 0 0 / 55%),
      0 0 0 1px rgb(16 185 129 / 12%),
      0 0 32px rgb(59 130 246 / 15%) !important;
  }

  .aa-agency-filter-popper .el-popper__arrow::before {
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid rgb(96 165 250 / 25%) !important;
  }

  .aa-agency-filter-popper .el-select-dropdown__item {
    font-size: 13px;
  }

  .aa-agency-filter-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: #34d399 !important;
    background: rgb(16 185 129 / 12%) !important;
  }

  .aa-agency-filter-popper .el-select-dropdown__item.is-hovering {
    background: rgb(59 130 246 / 12%) !important;
  }

  .aa-agency-filter-popper.el-picker__popper.el-popper,
  .aa-agency-filter-popper .el-picker-panel {
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid rgb(96 165 250 / 28%) !important;

    --el-datepicker-border-color: rgb(96 165 250 / 35%);
    --el-datepicker-text-color: #e2e8f0;
    --el-datepicker-off-text-color: #64748b;
    --el-datepicker-header-text-color: #f1f5f9;
  }
</style>
