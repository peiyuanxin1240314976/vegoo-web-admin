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
  mapIncomeStructureToFlow
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
  const dateRange = ref<CockpitDateRange>(initialDateRange)
  /** 全局唯一筛选字段：后端要求 { date: 'YYYY-MM-DD' } */
  const date = ref<string>(dateRangeToDate(initialDateRange))

  async function load(params?: CockpitOverviewParams) {
    loading.value = true
    const range = params?.dateRange ?? dateRange.value
    // 统一 date：优先显式传 date，其次根据 range 计算；并回写到 state，保证两处筛选同步
    const nextDate = params?.date ?? dateRangeToDate(range)
    date.value = nextDate
    try {
      const [
        overallRes,
        rhythmRes,
        top3Res,
        channelRoiRes,
        businessMapRes,
        incomeStructureRes,
        restOverview
      ] = await Promise.all([
        fetchCockpitOverall({ date: nextDate }).catch(() => null),
        fetchConsumptionRhythmMonitoring({ date: nextDate }).catch(() => null),
        fetchCockpitTop3({ date: nextDate }).catch(() => null),
        fetchChannelRoiInstall({ date: nextDate }).catch(() => null),
        fetchCockpitBusinessMap({ date: nextDate }).catch(() => null),
        fetchIncomeStructure({ date: nextDate }).catch(() => []),
        fetchCockpitOverview({ dateRange: range, date: nextDate })
      ])
      // 仅此一次 overall 请求，第一排数据 + 警示与提示 共用 data（注意：http 层成功时返回的是 res.data.data，即接口的 data 字段，故 overallRes 本身就是 data）
      const data: CockpitOverallData | undefined =
        overallRes && typeof overallRes === 'object' && 'now' in overallRes && 'last' in overallRes
          ? (overallRes as unknown as CockpitOverallData)
          : (overallRes as { data?: CockpitOverallData })?.data
      const isOldOverall = (r: unknown): r is CockpitOverallResponse =>
        r != null && typeof r === 'object' && 'last' in r && 'now' in r
      const kpi = data
        ? mapOverallDataToKpiCards(data)
        : isOldOverall(overallRes)
          ? mapOverallToKpiCards(overallRes.last, overallRes.now)
          : restOverview.kpi
      // 警示摘要：DNU/自然量/买量应用/广告系列/广告账户 均从 overall 的 now + *Change 取值
      const alertSummaryMetrics = data
        ? mapOverallDataToAlertSummaryMetrics(data)
        : (restOverview.alertSummaryMetrics ?? [])
      const alertBanners = data?.alertBanners ?? restOverview.alertBanners
      const spendPace = rhythmRes
        ? mapConsumptionRhythmToSpendPace(rhythmRes)
        : restOverview.spendPace
      const top3 = mapTop3ResponseToOverview(top3Res ?? null)
      const channelRoiInstall =
        channelRoiRes != null
          ? mapChannelRoiInstallToItems(channelRoiRes)
          : (restOverview.channelRoiInstall ?? [])
      const mapCountries =
        businessMapRes != null
          ? mapBusinessMapToMapCountries(businessMapRes)
          : restOverview.mapCountries
      const mapLegend =
        businessMapRes != null ? mapCountriesToLegend(mapCountries) : (restOverview.mapLegend ?? [])
      // 收入结构仅用真实接口：有数据则转换，无数据或失败则展示空（暂无数据）
      const revenueStructureFlow =
        Array.isArray(incomeStructureRes) && incomeStructureRes.length > 0
          ? mapIncomeStructureToFlow(incomeStructureRes)
          : mapIncomeStructureToFlow([])
      overview.value = {
        ...restOverview,
        kpi,
        alertSummaryMetrics,
        alertBanners,
        spendPace,
        topRevenue: top3.topRevenue,
        topBadReview: top3.topBadReview,
        topUser: top3.topUser,
        channelRoiInstall,
        mapCountries,
        mapLegend,
        revenueStructureFlow
      }

      console.log('mapCountries', mapCountries)
    } finally {
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
    dateRange,
    date,
    load,
    refresh
  }
}
