/**
 * 驾驶舱数据 Composable
 * - 第一排 KPI：真实接口 POST /api/v1/datacenter/analysis/cockpit/overall（startTime/endTime）
 * - 其余模块：Mock 或各子组件独立接口，结构清晰便于后续按模块接独立接口与骨架屏
 */
import { ref, onMounted } from 'vue'
import {
  fetchCockpitOverview,
  fetchCockpitOverall,
  mapOverallToKpiCards,
  fetchConsumptionRhythmMonitoring,
  mapConsumptionRhythmToSpendPace,
  fetchCockpitTop3,
  mapTop3ResponseToOverview,
  fetchChannelRoiInstall,
  mapChannelRoiInstallToItems,
  fetchCockpitBusinessMap,
  mapBusinessMapToMapCountries,
  mapCountriesToLegend
} from '../api/cockpit'
import type {
  CockpitOverview,
  CockpitOverviewParams,
  CockpitDateRange,
  CockpitOverallParams
} from '../types'

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 根据日期范围换算 overall 接口所需的 startTime / endTime */
export function dateRangeToOverallParams(dateRange: CockpitDateRange): CockpitOverallParams {
  const now = new Date()
  const today = toYYYYMMDD(now)
  let startTime = today
  let endTime = today
  switch (dateRange) {
    case 'today':
      startTime = endTime = today
      break
    case 'yesterday': {
      const d = new Date(now)
      d.setDate(d.getDate() - 1)
      startTime = endTime = toYYYYMMDD(d)
      break
    }
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 6)
      startTime = toYYYYMMDD(d)
      endTime = today
      break
    }
    case 'month': {
      const d = new Date(now)
      d.setDate(d.getDate() - 29)
      startTime = toYYYYMMDD(d)
      endTime = today
      break
    }
  }
  return { startTime, endTime }
}

export function useCockpitData(initialDateRange: CockpitDateRange = 'today') {
  const overview = ref<CockpitOverview | null>(null)
  const loading = ref(true)
  const dateRange = ref<CockpitDateRange>(initialDateRange)

  async function load(params?: CockpitOverviewParams) {
    loading.value = true
    const range = params?.dateRange ?? dateRange.value
    try {
      const [overallRes, rhythmRes, top3Res, channelRoiRes, businessMapRes, restOverview] =
        await Promise.all([
          fetchCockpitOverall().catch(() => null),
          fetchConsumptionRhythmMonitoring().catch(() => null),
          fetchCockpitTop3().catch(() => null),
          fetchChannelRoiInstall().catch(() => null),
          fetchCockpitBusinessMap().catch(() => null),
          fetchCockpitOverview({ dateRange: range })
        ])
      const kpi = overallRes
        ? mapOverallToKpiCards(overallRes.last, overallRes.now)
        : restOverview.kpi
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
      overview.value = {
        ...restOverview,
        kpi,
        spendPace,
        topRevenue: top3.topRevenue,
        topBadReview: top3.topBadReview,
        topUser: top3.topUser,
        channelRoiInstall,
        mapCountries,
        mapLegend
      }

      console.log('mapCountries', mapCountries)
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    await load({ dateRange: dateRange.value })
  }

  onMounted(() => {
    load({ dateRange: dateRange.value })
  })

  return {
    overview,
    loading,
    dateRange,
    load,
    refresh
  }
}
