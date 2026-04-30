<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { echarts } from '@/plugins/echarts'
  import ScreenshotModal from './ScreenshotModal.vue'
  import AgencySubTabPerformanceMock from './AgencySubTabPerformanceMock.vue'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import {
    fetchAgencyAnalysisAvailableSources,
    fetchAgencyAnalysisMetaFilterOptions,
    fetchAgencyAnalysisOverview,
    fetchAgencyAnalysisDonutSpendShare,
    fetchAgencyAnalysisChannelDistribution,
    fetchAgencyAnalysisCountryTop8,
    fetchAgencyAnalysisSpendTrend30d,
    fetchAgencySubTabKpiLast7,
    fetchAgencySubTabRecentSummary,
    fetchAgencySubTabAccountSummary
  } from '@/api/agency-analysis'
  import type {
    AgencyAnalysisAvailableSourceItem,
    AgencyAnalysisCharts,
    KpiCardItem
  } from '../types'

  defineOptions({ name: 'AdAgencyAnalysis' })

  type AgencyTabItem = {
    label: string
    key: string
    isSummary: boolean
  }

  const SUMMARY_TAB: AgencyTabItem = { label: '汇总', key: 'summary', isSummary: true }
  const FALLBACK_NON_SUMMARY_TABS: AgencyTabItem[] = [
    { label: 'GatherOne', key: 'gatherone', isSummary: false },
    { label: '快鸟', key: 'kuainiao', isSummary: false },
    { label: '出海者', key: 'chuhai', isSummary: false }
  ]

  // ─────────────────── KPI Cards ───────────────────
  const kpiCards = ref<KpiCardItem[]>([])
  /** 首屏 meta 成功后自动拉一次；之后仅点击「查询」再请求 */
  const pageLoading = ref(false)
  /** 是否已至少成功发起过一次汇总数据加载（用于首屏占位）；变更筛选项后仍保留为 true */
  const hasSummaryQueried = ref(false)
  const kpiSkeletonCount = 6

  const charts = ref<AgencyAnalysisCharts>({
    donut: [],
    channelDistribution: { categories: [], series: [] },
    countryTop8: [],
    spendTrend30d: { dates: [], series: [] }
  })

  // ─────────────────── Screenshot Modal ───────────────────
  const showScreenshot = ref(false)

  const openScreenshot = () => {
    showScreenshot.value = true
  }

  // ─────────────────── Charts ───────────────────
  const chartsHostRef = ref<HTMLElement | null>(null)
  const donutRef = ref<HTMLElement | null>(null)
  const barRef = ref<HTMLElement | null>(null)
  const countryRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  let chartInstances: Array<ReturnType<typeof echarts.init>> = []
  let chartsResizeObserver: ResizeObserver | null = null

  const disposeCharts = () => {
    chartInstances.forEach((c) => c.dispose())
    chartInstances = []
  }

  function resizeCharts() {
    chartInstances.forEach((c) => {
      try {
        c.resize()
      } catch {
        /* ignore */
      }
    })
  }

  function bindChartsResizeObserver() {
    chartsResizeObserver?.disconnect()
    chartsResizeObserver = null
    const el = chartsHostRef.value
    if (!el || typeof ResizeObserver === 'undefined') return
    chartsResizeObserver = new ResizeObserver(() => {
      resizeCharts()
    })
    chartsResizeObserver.observe(el)
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
            radius: ['30%', '52%'],
            center: ['50%', '44%'],
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
        grid: { top: '10%', right: '3%', bottom: '18%', left: 52, containLabel: false },
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
        grid: { top: '2%', right: 72, bottom: '2%', left: '4%', containLabel: false },
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
        grid: { top: '8%', right: '3%', bottom: '14%', left: '4%', containLabel: false },
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

    resizeCharts()
    requestAnimationFrame(() => resizeCharts())
  }

  const DEFAULT_START_DATE = '2026-04-18'
  const DEFAULT_END_DATE = '2026-04-24'
  /** 汇总专用：日期选择器绑定（点「查询」后才写入 applied 并请求） */
  const summaryDateDraft = ref<[string, string]>([DEFAULT_START_DATE, DEFAULT_END_DATE])
  /** 最近一次查询使用的日期区间 */
  const summaryDateApplied = ref<[string, string] | null>(null)
  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const tabsLoading = ref(true)
  const availableTabs = ref<AgencyTabItem[]>([SUMMARY_TAB, ...FALLBACK_NON_SUMMARY_TABS])
  const agencyTabIndex = ref(0)
  let tabsRequestToken = 0

  const activeTab = computed(() => availableTabs.value[agencyTabIndex.value] ?? SUMMARY_TAB)
  const activeAgencyTabKey = computed(() => activeTab.value.key)
  const isSummaryTabActive = computed(() => activeAgencyTabKey.value === SUMMARY_TAB.key)

  const subTabLoading = ref(false)
  const subTabError = ref(false)
  const subTabKpiLast7 = ref<
    import('@/views/business-insight/agency-analysis/types').AgencySubTabKpiPayload | null
  >(null)
  const subTabRecentSummary = ref<
    import('@/views/business-insight/agency-analysis/types').AgencySubTabRecentSummaryPayload | null
  >(null)
  const subTabAccountSummary = ref<
    | import('@/views/business-insight/agency-analysis/types').AgencySubTabAccountSummaryPayload
    | null
  >(null)

  function selectAgencyTab(index: number) {
    if (tabsLoading.value) return
    agencyTabIndex.value = index
  }

  function syncSummaryAppliedRangeFromDraft() {
    summaryDateApplied.value = [summaryDateDraft.value[0], summaryDateDraft.value[1]]
  }

  function handleSearch() {
    if (!metaReady.value || tabsLoading.value) return
    syncSummaryAppliedRangeFromDraft()
    void loadTabsThenActiveContent({ resetToSummary: true, loadSummaryAfterTabs: true })
  }

  /** meta 就绪后的默认/刷新拉数：与当前草稿日期、应用一致（渠道固定为全部） */
  async function loadDefaultSummaryData() {
    syncSummaryAppliedRangeFromDraft()
    hasSummaryQueried.value = true
    await loadTabsThenActiveContent({ resetToSummary: true, loadSummaryAfterTabs: true })
  }

  const screenshotDataDateLabel = computed(() => {
    const r = summaryDateApplied.value ?? summaryDateDraft.value
    return `${r[0]} ~ ${r[1]}`
  })

  const screenshotAgencyLabel = computed(() =>
    isSummaryTabActive.value ? '' : activeTab.value.label
  )

  function formatMonthDayLabel(ymd: string) {
    const m = Number(ymd.slice(5, 7))
    const d = Number(ymd.slice(8, 10))
    if (!Number.isFinite(m) || !Number.isFinite(d)) return ymd
    return `${m}月${d}日`
  }

  const queriedDateRangeCNLabel = computed(() => {
    const range = summaryDateApplied.value ?? summaryDateDraft.value
    return `${formatMonthDayLabel(range[0])}~${formatMonthDayLabel(range[1])}`
  })

  /** 筛选项拉取中（须优先于业务数据完成） */
  const metaLoading = ref(true)
  const metaLoadError = ref(false)
  /** meta 请求结束后为 true，避免 watch 在首屏抢跑业务请求 */
  const metaReady = ref(false)

  /** 汇总：meta 已就绪、从未拉取过数据且非加载中，提示点击查询 */
  const showSummaryAwaitQuery = computed(
    () =>
      !metaLoading.value && !metaLoadError.value && !hasSummaryQueried.value && !pageLoading.value
  )

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
      await fetchAgencyAnalysisMetaFilterOptions()
    } catch {
      metaLoadError.value = true
      agencyTabIndex.value = 0
    } finally {
      metaLoading.value = false
      metaReady.value = true
    }
  }

  function mapAvailableSourceToTab(
    source: AgencyAnalysisAvailableSourceItem
  ): AgencyTabItem | null {
    const rawValue = source.value?.trim()
    if (!rawValue || rawValue === 'all') return null
    const normalizedKey = rawValue.startsWith('agency_') ? rawValue.slice(7) : rawValue
    if (!normalizedKey || normalizedKey === SUMMARY_TAB.key) return null
    return {
      label: source.label?.trim() || normalizedKey,
      key: normalizedKey,
      isSummary: false
    }
  }

  function buildTabsFromAvailableSources(
    sources: AgencyAnalysisAvailableSourceItem[] | null | undefined
  ): AgencyTabItem[] {
    const mapped = (sources ?? [])
      .map((item) => mapAvailableSourceToTab(item))
      .filter((item): item is AgencyTabItem => item !== null)
    const unique = mapped.filter(
      (item, idx, list) => list.findIndex((x) => x.key === item.key) === idx
    )
    if (!unique.length) return [SUMMARY_TAB, ...FALLBACK_NON_SUMMARY_TABS]
    return [SUMMARY_TAB, ...unique]
  }

  async function loadAvailableTabs(resetToSummary: boolean) {
    if (!metaReady.value) return
    tabsLoading.value = true
    const currentToken = ++tabsRequestToken
    const q = filterQuery()
    if (resetToSummary) agencyTabIndex.value = 0
    try {
      const sources = await fetchAgencyAnalysisAvailableSources(q)
      if (currentToken !== tabsRequestToken) return
      availableTabs.value = buildTabsFromAvailableSources(sources)
    } catch {
      if (currentToken !== tabsRequestToken) return
      availableTabs.value = [SUMMARY_TAB, ...FALLBACK_NON_SUMMARY_TABS]
    } finally {
      if (currentToken === tabsRequestToken) {
        tabsLoading.value = false
        if (agencyTabIndex.value >= availableTabs.value.length) {
          agencyTabIndex.value = 0
        }
      }
    }
  }

  async function loadTabsThenActiveContent(options: {
    resetToSummary: boolean
    loadSummaryAfterTabs: boolean
  }) {
    await loadAvailableTabs(options.resetToSummary)
    if (!metaReady.value || tabsLoading.value) return
    if (options.loadSummaryAfterTabs || isSummaryTabActive.value) {
      hasSummaryQueried.value = true
      await loadPageData()
      return
    }
    await loadSubTabData()
  }

  async function retryMetaOptions() {
    metaReady.value = false
    await loadMetaOptions()
    if (!metaLoadError.value) await loadDefaultSummaryData()
  }

  const filterQuery = () => {
    const range = summaryDateApplied.value
    if (!range) {
      throw new Error('summaryDateApplied is unset before filterQuery')
    }
    return {
      startDate: range[0],
      endDate: range[1],
      agency_id: 'all',
      source: 'all'
    }
  }

  async function loadSubTabData() {
    if (!metaReady.value || tabsLoading.value) return
    if (isSummaryTabActive.value) return
    const range = summaryDateApplied.value ?? summaryDateDraft.value
    subTabLoading.value = true
    subTabError.value = false
    try {
      const qBase = {
        startDate: range[0],
        endDate: range[1],
        source: 'all',
        agencyTab: activeAgencyTabKey.value
      }
      const [k7, recent, acct] = await Promise.all([
        fetchAgencySubTabKpiLast7(qBase),
        fetchAgencySubTabRecentSummary(qBase),
        fetchAgencySubTabAccountSummary(qBase)
      ])
      subTabKpiLast7.value = k7
      subTabRecentSummary.value = recent
      subTabAccountSummary.value = acct
    } catch {
      subTabError.value = true
      subTabKpiLast7.value = null
      subTabRecentSummary.value = null
      subTabAccountSummary.value = null
    } finally {
      subTabLoading.value = false
    }
  }

  async function handleAccountSummarySearch(payload: { startDate: string; endDate: string }) {
    if (!metaReady.value || tabsLoading.value) return
    if (isSummaryTabActive.value) return
    subTabError.value = false
    try {
      const data = await fetchAgencySubTabAccountSummary({
        startDate: payload.startDate,
        endDate: payload.endDate,
        source: 'all',
        agencyTab: activeAgencyTabKey.value
      })
      subTabAccountSummary.value = data
    } catch {
      subTabError.value = true
      subTabAccountSummary.value = null
    }
  }

  function clearDashboardData() {
    kpiCards.value = []
    charts.value = {
      donut: [],
      channelDistribution: { categories: [], series: [] },
      countryTop8: [],
      spendTrend30d: { dates: [], series: [] }
    }
  }

  /**
   * 业务数据：须在筛选项 meta 成功返回之后再发起（由 onMounted / watch 顺序保证）。
   * 5 个接口并行异步请求，互不阻塞。
   */
  const loadPageData = async () => {
    disposeCharts()
    pageLoading.value = true
    try {
      const q = filterQuery()

      const [overview, donutRes, channelRes, countryRes, trendRes] = await Promise.all([
        fetchAgencyAnalysisOverview(q),
        fetchAgencyAnalysisDonutSpendShare(q),
        fetchAgencyAnalysisChannelDistribution(q),
        fetchAgencyAnalysisCountryTop8(q),
        fetchAgencyAnalysisSpendTrend30d(q)
      ])

      kpiCards.value = overview.kpiCards ?? []
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
      bindChartsResizeObserver()
      resizeCharts()
      requestAnimationFrame(() => resizeCharts())
    }
  }

  /** 离开「汇总」时图表 DOM 被卸载，须 dispose；回到「汇总」后等 DOM 挂载再 init，否则 ECharts 不渲染 */
  watch(
    agencyTabIndex,
    async () => {
      if (!isSummaryTabActive.value) {
        chartsResizeObserver?.disconnect()
        chartsResizeObserver = null
        disposeCharts()
        await loadSubTabData()
        return
      }
      await nextTick()
      initCharts()
      bindChartsResizeObserver()
      resizeCharts()
      requestAnimationFrame(() => resizeCharts())
    },
    { flush: 'post' }
  )

  onMounted(async () => {
    await Promise.all([cockpitMetaFilterStore.ensureLoaded(), loadMetaOptions()])
    if (metaLoadError.value) {
      disposeCharts()
      clearDashboardData()
      pageLoading.value = false
      return
    }
    await loadDefaultSummaryData()
  })

  onBeforeUnmount(() => {
    chartsResizeObserver?.disconnect()
    chartsResizeObserver = null
    disposeCharts()
  })
</script>

<template>
  <div class="agency-analysis-page page-wrap page-wrap--ap-fx flex flex-col min-h-0">
    <div class="aa-page-fx" aria-hidden="true"></div>
    <!-- 顶栏：meta 状态 / Tab + 筛选 + 截图（原独立筛选区已合并） -->
    <div
      class="agency-analysis-page__section agency-analysis-page__section--agency-tabs aa-entry-1"
    >
      <template v-if="metaLoading">
        <div class="aa-meta-strip aa-meta-strip--loading" aria-busy="true">
          <div class="filter-skel filter-skel--select" />
          <div class="filter-skel filter-skel--select-wide" />
        </div>
      </template>
      <template v-else-if="metaLoadError">
        <div class="aa-meta-strip aa-meta-strip--error">
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
        </div>
      </template>
      <template v-else>
        <div class="aa-tab-bar-row">
          <div class="aa-agency-tabs" role="tablist" aria-label="代投范围">
            <template v-if="tabsLoading">
              <span
                v-for="i in 4"
                :key="`tab-sk-${i}`"
                class="aa-agency-tab aa-agency-tab--skeleton"
                aria-hidden="true"
              />
            </template>
            <template v-else>
              <button
                v-for="(tab, i) in availableTabs"
                :key="tab.key"
                type="button"
                class="aa-agency-tab"
                role="tab"
                :class="{ 'aa-agency-tab--active': agencyTabIndex === i }"
                :aria-selected="agencyTabIndex === i"
                :disabled="tabsLoading"
                @click="selectAgencyTab(i)"
              >
                {{ tab.label }}
              </button>
            </template>
          </div>
          <div class="aa-tab-bar-filters" aria-label="筛选与查询">
            <div class="filter-date-wrap filter-date-wrap--tab-inline">
              <AppDatePicker
                v-model="summaryDateDraft"
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
            <div class="aa-tab-bar-filters__actions">
              <ElButton
                type="primary"
                plain
                round
                :loading="tabsLoading"
                :disabled="tabsLoading"
                @click="handleSearch"
                v-ripple
              >
                查询
              </ElButton>
              <ElButton
                v-if="!isSummaryTabActive"
                type="primary"
                plain
                round
                :disabled="tabsLoading"
                @click="openScreenshot()"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style="margin-right: 6px"
                >
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
              </ElButton>
            </div>
          </div>
        </div>
      </template>
    </div>

    <template v-if="isSummaryTabActive">
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
        <template v-else-if="showSummaryAwaitQuery">
          <div class="kpi-full-empty">
            <ElEmpty
              description="请选择时间范围后，点击顶部「查询」加载数据"
              :image-size="72"
              class="block-empty"
            />
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

      <!-- ── Main layout：KPI 下仅图表区 ── -->
      <div class="main-layout aa-entry-3">
        <div ref="chartsHostRef" class="sidebar-right sidebar-right--solo">
          <!-- Bar chart（左） / Donut（右） -->
          <div class="chart-block">
            <div class="chart-title">渠道分布分析</div>
            <div v-if="pageLoading" class="chart-skeleton chart-skeleton--bars">
              <span v-for="b in 6" :key="`bar-sk-${b}`" class="chart-skeleton-bar" />
            </div>
            <div v-else-if="showSummaryAwaitQuery" class="chart-empty-wrap chart-empty-wrap--short">
              <ElEmpty
                description="点击顶部「查询」加载图表"
                :image-size="56"
                class="block-empty"
              />
            </div>
            <div v-else-if="!hasBarChartData" class="chart-empty-wrap chart-empty-wrap--short">
              <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
            </div>
            <div v-else ref="barRef" class="chart-area chart-area--fill" />
          </div>

          <div class="chart-block donut-chart-block">
            <div class="chart-title">代投方消耗占比</div>
            <div v-if="pageLoading" class="chart-skeleton chart-skeleton--donut" />
            <div v-else-if="showSummaryAwaitQuery" class="chart-empty-wrap">
              <ElEmpty
                description="点击顶部「查询」加载图表"
                :image-size="56"
                class="block-empty"
              />
            </div>
            <div v-else-if="!hasDonutChartData" class="chart-empty-wrap">
              <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
            </div>
            <div v-else ref="donutRef" class="chart-area chart-area--fill" />
          </div>

          <!-- Country horizontal bar -->
          <div class="chart-block">
            <div class="chart-title">国家消耗分布 Top 8</div>
            <div v-if="pageLoading" class="chart-skeleton chart-skeleton--country">
              <span v-for="r in 8" :key="`ct-sk-${r}`" class="chart-skeleton-hrow" />
            </div>
            <div
              v-else-if="showSummaryAwaitQuery"
              class="chart-empty-wrap chart-empty-wrap--country"
            >
              <ElEmpty
                description="点击顶部「查询」加载图表"
                :image-size="56"
                class="block-empty"
              />
            </div>
            <div
              v-else-if="!hasCountryChartData"
              class="chart-empty-wrap chart-empty-wrap--country"
            >
              <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
            </div>
            <div v-else ref="countryRef" class="chart-area chart-area--fill" />
          </div>

          <!-- Trend area -->
          <div class="chart-block">
            <div class="chart-title">代投消耗趋势（近30天）</div>
            <div v-if="pageLoading" class="chart-skeleton chart-skeleton--trend" />
            <div v-else-if="showSummaryAwaitQuery" class="chart-empty-wrap chart-empty-wrap--trend">
              <ElEmpty
                description="点击顶部「查询」加载图表"
                :image-size="56"
                class="block-empty"
              />
            </div>
            <div v-else-if="!hasTrendChartData" class="chart-empty-wrap chart-empty-wrap--trend">
              <ElEmpty description="暂无数据" :image-size="56" class="block-empty" />
            </div>
            <div v-else ref="trendRef" class="chart-area chart-area--fill" />
          </div>
        </div>
      </div>
    </template>

    <div
      v-else
      class="agency-analysis-page__section agency-analysis-page__section--agency-sub-mock aa-entry-sub"
    >
      <AgencySubTabPerformanceMock
        :loading="subTabLoading"
        :error="subTabError"
        :current-day-label="queriedDateRangeCNLabel"
        :agency-tab="activeAgencyTabKey"
        :default-account-range="summaryDateDraft"
        :kpi-last7="subTabKpiLast7"
        :recent-summary="subTabRecentSummary"
        :account-summary="subTabAccountSummary"
        @account-summary-search="handleAccountSummarySearch"
      />
    </div>

    <!-- Screenshot Modal -->
    <ScreenshotModal
      v-model="showScreenshot"
      report-title="代投分析"
      :agency-label="screenshotAgencyLabel"
      :data-date="screenshotDataDateLabel"
      :page-loading="subTabLoading"
      :kpi-last7="subTabKpiLast7"
      :recent-summary="subTabRecentSummary"
      :account-summary="subTabAccountSummary"
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
    flex: 1 1 auto;
    min-height: 0;
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

  .agency-analysis-page__section--agency-tabs {
    margin-bottom: 14px;
  }

  .aa-meta-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
    padding: 14px 18px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
  }

  .aa-meta-strip--error {
    justify-content: space-between;
  }

  .aa-tab-bar-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-width: 0;
  }

  .aa-tab-bar-filters {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
  }

  .aa-tab-bar-filters__actions {
    display: inline-flex;
    flex-shrink: 0;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
  }

  .aa-tab-bar-filters .btn-screenshot--tab {
    box-sizing: border-box;
    flex-shrink: 0;
    height: 36px;
    min-height: 36px;
    padding: 0 14px;
    margin-left: 0;
    line-height: 1;
  }

  .filter-date-wrap--tab-inline {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    width: 250px;
    max-width: min(250px, 100%);
  }

  .aa-tab-bar-filters .filter-date :deep(.el-input__wrapper) {
    box-sizing: border-box;
    height: 36px;
    min-height: 36px !important;
  }

  .aa-tab-bar-filters .filter-select :deep(.el-select__wrapper) {
    box-sizing: border-box;
    height: 36px;
    min-height: 36px !important;
  }

  .btn-search--tab {
    flex-shrink: 0;
    align-self: center;
  }

  .agency-analysis-page__section--agency-sub-mock {
    min-width: 0;
    padding: 18px 20px 24px;
    margin-bottom: 16px;
    background: rgb(10 10 14 / 72%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 35%),
      inset 0 1px 0 rgb(186 230 253 / 6%);
  }

  .aa-filter-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    min-width: 0;
  }

  .aa-agency-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .aa-agency-tab {
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 500;
    color: $text-secondary;
    cursor: pointer;
    background: rgb(10 10 14 / 72%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 9999px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      color: $text-primary;
      border-color: rgb(96 165 250 / 42%);
    }

    &:focus-visible {
      outline: 2px solid rgb(52 211 153 / 65%);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  .aa-agency-tab--active {
    color: #e2e8f0;
    background: rgb(0 212 180 / 10%);
    border-color: rgb(0 212 180 / 45%);
    box-shadow:
      0 0 0 1px rgb(0 212 180 / 12%),
      0 4px 18px rgb(0 0 0 / 35%);
  }

  .aa-agency-tab--skeleton {
    width: 94px;
    height: 34px;
    pointer-events: none;
    cursor: default;
    background: linear-gradient(
      90deg,
      rgb(148 163 184 / 14%) 0%,
      rgb(148 163 184 / 26%) 50%,
      rgb(148 163 184 / 14%) 100%
    );
    border-color: rgb(148 163 184 / 16%);
    animation: aa-tab-skeleton-pulse 1.2s ease-in-out infinite;
  }

  @keyframes aa-tab-skeleton-pulse {
    0%,
    100% {
      opacity: 0.72;
    }

    50% {
      opacity: 1;
    }
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

  .aa-entry-sub {
    animation: aa-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.14s;
  }

  .aa-entry-3 {
    animation: aa-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.26s;
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
    --el-button-size: 36px;
    --el-button-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    );
    --el-button-text-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-hover-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 8%,
      transparent
    );
    --el-button-hover-text-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-hover-border-color: var(--theme-color, var(--art-primary, #3b82f6));

    flex-shrink: 0;
    height: 36px;
    padding: 0 16px;
    font-size: 13px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: 0 0 18px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 20%, transparent);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease,
      background 0.22s ease;

    &:hover {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 8%,
        transparent
      );
      box-shadow: 0 0 28px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 28%, transparent);
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
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    background: #0a1422;
    border: 1px solid rgb(30 58 95 / 35%);
    border-radius: 6px;
  }

  .chart-empty-wrap--short,
  .chart-empty-wrap--country,
  .chart-empty-wrap--trend {
    min-height: 160px;
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

  :deep(.filter-date.el-date-editor),
  :deep(.filter-date.el-date-editor--daterange) {
    flex: none !important;
    width: 250px !important;

    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-input-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-date-editor-width: 250px;
    --el-date-editor-daterange-width: 250px;

    min-height: 36px;
    padding: 0 12px;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.filter-date.el-date-editor--daterange) {
    width: 250px !important;
    min-width: 250px !important;
    max-width: 250px !important;
  }

  .filter-date {
    :deep(.el-date-editor),
    :deep(.el-range-editor),
    :deep(.el-date-editor.el-input__wrapper),
    :deep(.el-range-editor.el-input__wrapper),
    :deep(.el-input__wrapper) {
      min-height: 36px;
      padding: 0 12px;
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      ) !important;
      border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
      border-radius: var(--el-border-radius-base, 4px) !important;
      box-shadow: none !important;
      transition:
        border-color 0.22s ease,
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    :deep(.el-date-editor:hover),
    :deep(.el-range-editor:hover),
    :deep(.el-input__wrapper:hover) {
      border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
    }

    :deep(.el-date-editor.is-active),
    :deep(.el-range-editor.is-active),
    :deep(.el-date-editor.el-input__wrapper.is-focus),
    :deep(.el-input__wrapper.is-focus) {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      ) !important;
      border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
    }

    :deep(.el-range-input),
    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    :deep(.el-input__prefix-inner),
    :deep(.el-range__icon),
    :deep(.el-range__close-icon) {
      color: var(--theme-color, var(--art-primary, #3b82f6));
    }
  }

  :deep(.filter-date.el-date-editor:hover),
  :deep(.filter-date.el-date-editor--daterange:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.filter-date.el-date-editor.is-active),
  :deep(.filter-date.el-date-editor--daterange.is-active) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  .filter-select {
    width: 130px !important;

    :deep(.el-select__wrapper),
    :deep(.el-input__wrapper) {
      min-height: 36px;
      padding: 0 12px;
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      ) !important;
      border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
      border-radius: var(--el-border-radius-base, 4px) !important;
      box-shadow: none !important;
      transition:
        border-color 0.22s ease,
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    :deep(.el-select__wrapper:hover),
    :deep(.el-input__wrapper:hover) {
      border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
    }

    :deep(.el-select__wrapper.is-focused),
    :deep(.el-input__wrapper.is-focus) {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      ) !important;
      border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }

    :deep(.el-select__suffix),
    :deep(.el-select__caret) {
      color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    }
  }

  .btn-screenshot {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    white-space: nowrap;
    cursor: pointer;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: 0 0 18px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 20%, transparent);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease,
      background 0.22s ease;

    &:hover {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 8%,
        transparent
      );
      box-shadow: 0 0 28px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 28%, transparent);
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
    padding: 16px 18px 18px;
    overflow: hidden;
    border-radius: 14px;

    &:not(.kpi-card--skeleton) {
      --kpi-accent: var(--art-primary);

      background-color: color-mix(in srgb, rgb(15 23 42) 58%, rgb(8 12 22 / 92%));
      background-image: linear-gradient(
        165deg,
        rgb(255 255 255 / 5%) 0%,
        transparent 44%,
        transparent 100%
      );
      isolation: isolate;
      backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--kpi-accent) 22%, rgb(255 255 255 / 8%));
      box-shadow:
        0 6px 28px rgb(0 0 0 / 42%),
        inset 0 1px 0 rgb(255 255 255 / 7%);
      transition:
        border-color 0.28s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
        transform 0.28s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

      &::before {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        content: '';
        background: radial-gradient(
          ellipse 78% 52% at 4% 96%,
          color-mix(in srgb, var(--kpi-accent) 32%, transparent) 0%,
          transparent 62%
        );
        border-radius: inherit;
        opacity: 0.95;
      }

      &:hover {
        border-color: color-mix(in srgb, var(--kpi-accent) 38%, rgb(255 255 255 / 12%));
        box-shadow:
          0 10px 36px rgb(0 0 0 / 48%),
          inset 0 1px 0 rgb(255 255 255 / 9%),
          0 0 36px color-mix(in srgb, var(--kpi-accent) 14%, transparent);
        transform: translateY(-1px);
      }

      &:active {
        transition-duration: 0.12s;
        transform: translateY(0);
      }
    }
  }

  .kpi-row > .kpi-card:not(.kpi-card--skeleton).highlighted {
    --kpi-accent: var(--art-success);

    border-color: color-mix(in srgb, var(--art-success) 36%, rgb(255 255 255 / 10%));
    box-shadow:
      0 6px 28px rgb(0 0 0 / 42%),
      inset 0 1px 0 color-mix(in srgb, var(--art-success) 14%, rgb(255 255 255 / 6%)),
      0 0 44px color-mix(in srgb, var(--art-success) 16%, transparent);

    &::before {
      background: radial-gradient(
        ellipse 82% 56% at 2% 98%,
        color-mix(in srgb, var(--art-success) 34%, transparent) 0%,
        transparent 64%
      );
    }

    &:hover {
      border-color: color-mix(in srgb, var(--art-success) 48%, rgb(255 255 255 / 12%));
      box-shadow:
        0 10px 36px rgb(0 0 0 / 48%),
        inset 0 1px 0 color-mix(in srgb, var(--art-success) 18%, rgb(255 255 255 / 8%)),
        0 0 52px color-mix(in srgb, var(--art-success) 22%, transparent);
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
    margin-bottom: 8px;
  }

  .kpi-label {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.25;
    color: $text-secondary;
    letter-spacing: 0.02em;
  }

  .kpi-value {
    position: relative;
    z-index: 1;
    margin-bottom: 4px;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.05;
    color: $text-primary;
    letter-spacing: -0.03em;
  }

  .kpi-change {
    flex-shrink: 0;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.35;
    border-radius: 9999px;

    &.up {
      color: color-mix(in srgb, var(--art-success) 92%, white);
      background: color-mix(in srgb, rgb(0 0 0 / 52%) 70%, var(--art-success) 30%);
      border: 1px solid color-mix(in srgb, var(--art-success) 42%, transparent);
      box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
    }

    &.down {
      color: color-mix(in srgb, var(--art-danger) 88%, white);
      background: color-mix(in srgb, rgb(0 0 0 / 55%) 72%, var(--art-danger) 28%);
      border: 1px solid color-mix(in srgb, var(--art-danger) 48%, transparent);
      box-shadow: inset 0 1px 0 rgb(255 255 255 / 6%);
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
    flex: 1 1 auto;
    gap: 12px;
    min-height: 0;
    padding: 0 0 20px;
  }

  .sidebar-right {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10px;
    width: 360px;
  }

  .sidebar-right--solo {
    flex: 1 1 auto;
    flex-flow: row wrap;
    gap: 12px;
    align-content: stretch;
    width: 100%;
    max-width: none;
    min-height: 0;
  }

  .sidebar-right--solo .chart-block {
    flex: 1 1 calc(50% - 6px);
    min-width: min(360px, 100%);
    min-height: clamp(260px, 36vh, 480px);
  }

  @media (width <= 1366px) {
    .sidebar-right:not(.sidebar-right--solo) {
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
    border-radius: 14px;
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
    flex: 1 1 auto;
    height: auto;
    min-height: 200px;
  }

  .chart-skeleton--bars {
    display: flex;
    flex: 1 1 auto;
    gap: 8px;
    align-items: flex-end;
    justify-content: center;
    height: auto;
    min-height: 160px;
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
    flex: 1 1 auto;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    height: auto;
    min-height: 200px;
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
    flex: 1 1 auto;
    height: auto;
    min-height: 180px;
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
    display: flex;
    flex-direction: column;
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
    flex-shrink: 0;
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: $text-secondary;
  }

  .chart-area {
    width: 100%;
  }

  .chart-area--fill {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 160px;
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
    .aa-entry-sub,
    .aa-entry-3 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .kpi-card--skeleton-fx::before {
      animation: none;
    }

    .kpi-card:not(.kpi-card--skeleton) {
      transition:
        border-color 0.16s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow 0.16s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));
      transform: none !important;
    }
  }
</style>

<style lang="scss">
  /* 挂载在 body，须非 scoped；与广告成效筛选下拉视觉对齐 */
  .aa-agency-filter-popper.el-popper {
    // background: rgb(10 10 14 / 96%) !important;
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
