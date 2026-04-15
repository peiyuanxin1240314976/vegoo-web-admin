/**
 * 驾驶舱数据 Composable
 * - 只调用一次 POST /api/v1/datacenter/analysis/cockpit/overall，第一排 KPI 卡片与警示与提示均使用该次返回的 data
 * - 其余模块：Mock 或各子组件独立接口，结构清晰便于后续按模块接独立接口与骨架屏
 */
import { ref, onMounted } from 'vue'
import { getAppNow, formatYYYYMMDD, cloneAppDate } from '@/utils/app-now'
import {
  fetchCockpitOverview,
  fetchCockpitOverall,
  mapOverallToKpiCards,
  mapOverallDataToKpiCards,
  mapOverallDataToAlertSummaryMetrics,
  fetchConsumptionRhythmMonitoring,
  mapConsumptionRhythmToSpendPace,
  fetchCockpitTop3,
  mapTop3ResponseToOverview,
  fetchChannelRoiInstall,
  mapChannelRoiInstallToItems,
  fetchCockpitBusinessMap,
  mapBusinessMapToMapCountries,
  mapCountriesToLegend,
  fetchIncomeStructure,
  mapIncomeStructureToFlow,
  fetchCockpitTodaySummaryCards,
  fetchCockpitYesterdaySummaryPanel
} from '../api/cockpit'
import type {
  CockpitOverview,
  CockpitOverviewParams,
  CockpitDateRange,
  CockpitOverallParams,
  CockpitOverallResponse,
  CockpitOverallData
} from '../types'

/** 根据日期范围换算 overall 接口所需的 startTime / endTime */
export function dateRangeToOverallParams(dateRange: CockpitDateRange): CockpitOverallParams {
  const now = getAppNow()
  const today = formatYYYYMMDD(now)
  let startTime = today
  let endTime = today
  switch (dateRange) {
    case 'today':
      startTime = endTime = today
      break
    case 'yesterday': {
      const d = cloneAppDate(now)
      d.setDate(d.getDate() - 1)
      startTime = endTime = formatYYYYMMDD(d)
      break
    }
    case 'week': {
      const d = cloneAppDate(now)
      d.setDate(d.getDate() - 6)
      startTime = formatYYYYMMDD(d)
      endTime = today
      break
    }
    case 'month': {
      const d = cloneAppDate(now)
      d.setDate(d.getDate() - 29)
      startTime = formatYYYYMMDD(d)
      endTime = today
      break
    }
  }
  return { startTime, endTime }
}

function dateRangeToDate(dateRange: CockpitDateRange): string {
  const now = getAppNow()
  if (dateRange === 'today') return formatYYYYMMDD(now)
  if (dateRange === 'yesterday') {
    const d = cloneAppDate(now)
    d.setDate(d.getDate() - 1)
    return formatYYYYMMDD(d)
  }
  // week/month 暂按 today 兜底（后续若要支持范围，可改为后端支持 start/end）
  return formatYYYYMMDD(now)
}

export function useCockpitData(initialDateRange: CockpitDateRange = 'today') {
  const overview = ref<CockpitOverview | null>(null)
  const loading = ref(true)
  const moduleLoading = ref({
    kpiAlert: true,
    todayCards: true,
    yesterdayPanel: true,
    spendPace: true,
    map: true,
    top3: true,
    channelRoi: true,
    revenueFlow: true,
    smartAlerts: true
  })
  const dateRange = ref<CockpitDateRange>(initialDateRange)
  /** 全局唯一筛选字段：后端要求 { date: 'YYYY-MM-DD' } */
  const date = ref<string>(dateRangeToDate(initialDateRange))

  function mergeOverview(partial: Partial<CockpitOverview>) {
    overview.value = {
      ...(overview.value ?? ({} as CockpitOverview)),
      ...partial
    }
  }

  let requestSeq = 0

  async function load(params?: CockpitOverviewParams) {
    const seq = ++requestSeq
    loading.value = true
    moduleLoading.value = {
      kpiAlert: true,
      todayCards: true,
      yesterdayPanel: true,
      spendPace: true,
      map: true,
      top3: true,
      channelRoi: true,
      revenueFlow: true,
      smartAlerts: true
    }
    const range = params?.dateRange ?? dateRange.value
    // 统一 date：优先显式传 date，其次根据 range 计算；并回写到 state，保证两处筛选同步
    const nextDate = params?.date ?? dateRangeToDate(range)
    date.value = nextDate
    /** 首屏优先：仅 overall + overview，避免 7 路请求同时打满主线程与连接 */
    const wave1: Promise<unknown>[] = []

    wave1.push(
      fetchCockpitOverview({ dateRange: range, date: nextDate })
        .then((restOverview) => {
          if (seq !== requestSeq) return
          mergeOverview({
            smartAlerts: restOverview.smartAlerts ?? [],
            // 作为兜底基础数据，若后续独立接口返回会再覆盖
            channelRoiInstall: restOverview.channelRoiInstall ?? [],
            mapCountries: restOverview.mapCountries ?? [],
            mapLegend: restOverview.mapLegend ?? [],
            spendPace: restOverview.spendPace ?? [],
            revenueStructureFlow: restOverview.revenueStructureFlow,
            topRevenue: restOverview.topRevenue ?? [],
            topBadReview: restOverview.topBadReview ?? [],
            topUser: restOverview.topUser ?? []
          })
        })
        .catch(() => null)
        .finally(() => {
          if (seq === requestSeq) moduleLoading.value.smartAlerts = false
        })
    )

    wave1.push(
      fetchCockpitOverall({ date: nextDate })
        .then((overallRes) => {
          if (seq !== requestSeq) return
          const data: CockpitOverallData | undefined =
            overallRes &&
            typeof overallRes === 'object' &&
            'now' in overallRes &&
            'last' in overallRes
              ? (overallRes as unknown as CockpitOverallData)
              : (overallRes as { data?: CockpitOverallData })?.data
          const isOldOverall = (r: unknown): r is CockpitOverallResponse =>
            r != null && typeof r === 'object' && 'last' in r && 'now' in r
          const kpi = data
            ? mapOverallDataToKpiCards(data)
            : isOldOverall(overallRes)
              ? mapOverallToKpiCards(overallRes.last, overallRes.now)
              : []
          const alertSummaryMetrics = data ? mapOverallDataToAlertSummaryMetrics(data) : []
          const alertBanners = data?.alertBanners ?? []
          mergeOverview({ kpi, alertSummaryMetrics, alertBanners })
        })
        .catch(() => null)
        .finally(() => {
          if (seq === requestSeq) moduleLoading.value.kpiAlert = false
        })
    )

    await Promise.allSettled(wave1)
    if (seq !== requestSeq) return

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
    if (seq !== requestSeq) return

    const tasks: Promise<unknown>[] = []

    // 今日专属四卡片：仅今日加载；非今日直接清空，避免残留
    if (range === 'today') {
      tasks.push(
        fetchCockpitTodaySummaryCards({ date: nextDate })
          .then((cards) => {
            if (seq !== requestSeq) return
            mergeOverview({ todaySummaryCards: Array.isArray(cards) ? cards : [] })
          })
          .catch(() => null)
          .finally(() => {
            if (seq === requestSeq) moduleLoading.value.todayCards = false
          })
      )
    } else {
      mergeOverview({ todaySummaryCards: [] })
      moduleLoading.value.todayCards = false
    }

    // 昨日专属汇总面板：仅昨日加载；非昨日清空
    if (range === 'yesterday') {
      tasks.push(
        fetchCockpitYesterdaySummaryPanel({ date: nextDate })
          .then((sections) => {
            if (seq !== requestSeq) return
            mergeOverview({ yesterdaySummarySections: Array.isArray(sections) ? sections : [] })
          })
          .catch(() => null)
          .finally(() => {
            if (seq === requestSeq) moduleLoading.value.yesterdayPanel = false
          })
      )
    } else {
      mergeOverview({ yesterdaySummarySections: [] })
      moduleLoading.value.yesterdayPanel = false
    }

    tasks.push(
      fetchConsumptionRhythmMonitoring({ date: nextDate })
        .then((rhythmRes) => {
          if (seq !== requestSeq || !rhythmRes) return
          mergeOverview({ spendPace: mapConsumptionRhythmToSpendPace(rhythmRes) })
        })
        .catch(() => null)
        .finally(() => {
          if (seq === requestSeq) moduleLoading.value.spendPace = false
        })
    )

    tasks.push(
      fetchCockpitTop3({ date: nextDate })
        .then((top3Res) => {
          if (seq !== requestSeq) return
          const top3 = mapTop3ResponseToOverview(top3Res ?? null)
          mergeOverview({
            topRevenue: top3.topRevenue,
            topBadReview: top3.topBadReview,
            topUser: top3.topUser
          })
        })
        .catch(() => null)
        .finally(() => {
          if (seq === requestSeq) moduleLoading.value.top3 = false
        })
    )

    tasks.push(
      fetchChannelRoiInstall({ date: nextDate })
        .then((channelRoiRes) => {
          if (seq !== requestSeq || channelRoiRes == null) return
          mergeOverview({ channelRoiInstall: mapChannelRoiInstallToItems(channelRoiRes) })
        })
        .catch(() => null)
        .finally(() => {
          if (seq === requestSeq) moduleLoading.value.channelRoi = false
        })
    )

    tasks.push(
      fetchCockpitBusinessMap({ date: nextDate })
        .then((businessMapRes) => {
          if (seq !== requestSeq || businessMapRes == null) return
          const mapCountries = mapBusinessMapToMapCountries(businessMapRes)
          mergeOverview({
            mapCountries,
            mapLegend: mapCountriesToLegend(mapCountries)
          })
        })
        .catch(() => null)
        .finally(() => {
          if (seq === requestSeq) moduleLoading.value.map = false
        })
    )

    tasks.push(
      fetchIncomeStructure({ date: nextDate })
        .then((incomeStructureRes) => {
          if (seq !== requestSeq) return
          const revenueStructureFlow =
            Array.isArray(incomeStructureRes) && incomeStructureRes.length > 0
              ? mapIncomeStructureToFlow(incomeStructureRes)
              : mapIncomeStructureToFlow([])
          mergeOverview({ revenueStructureFlow })
        })
        .catch(() => {
          if (seq !== requestSeq) return
          mergeOverview({ revenueStructureFlow: mapIncomeStructureToFlow([]) })
        })
        .finally(() => {
          if (seq === requestSeq) moduleLoading.value.revenueFlow = false
        })
    )

    await Promise.allSettled(tasks)
    if (seq === requestSeq) {
      loading.value = false
    }
  }

  async function refresh() {
    await load({ dateRange: dateRange.value, date: date.value })
  }

  onMounted(() => {
    load({ dateRange: dateRange.value, date: date.value })
  })

  return {
    overview,
    loading,
    moduleLoading,
    dateRange,
    date,
    load,
    refresh
  }
}
