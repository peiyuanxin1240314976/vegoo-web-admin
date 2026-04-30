import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
import {
  fetchAdPlatformInfoCampaignTable,
  fetchAdPlatformInfoConversionFunnel,
  fetchAdPlatformInfoCountryTop10,
  fetchAdPlatformInfoKpiCards,
  fetchAdPlatformInfoPlatformSummary,
  fetchAdPlatformInfoRoiMapPoints,
  fetchAdPlatformInfoTrendChart
} from '@/api/user-growth/ad-platform-info'
import type {
  AdPlatformInfoFilterState,
  AdPlatformInfoHeatmapData,
  AdPlatformInfoKpiCard,
  AdPlatformInfoDateRangePreset,
  AdPlatformInfoPageData
} from '../types'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'
const EMPTY_HEATMAP: AdPlatformInfoHeatmapData = {
  xLabels: [],
  yLabels: [],
  points: [],
  legendMin: 0,
  legendMax: 0
}

export function useAdPlatformInfo() {
  const route = useRoute()
  const AD_PLATFORM_INFO_PATH = '/user-growth/ad-platform-analysis/ad-platform-info'
  const isAdPlatformInfoRoute = computed(() => route.path === AD_PLATFORM_INFO_PATH)

  /** 查询参数 `?id=`：来自列表行 `sourceCode`（广告平台编码 n_source） */
  const detailId = computed(() => {
    const raw = route.query.id
    const s = Array.isArray(raw) ? raw[0] : raw
    return String(s ?? '').trim()
  })

  const nSource = computed(() => {
    const n = Number.parseInt(detailId.value, 10)
    return Number.isFinite(n) ? n : 0
  })

  const filtersDraft = reactive<AdPlatformInfoFilterState>({
    dateRange: '30d'
  })
  const filters = reactive<AdPlatformInfoFilterState>({ ...filtersDraft })

  const state = ref<LoadState>('idle')
  const data = ref<AdPlatformInfoPageData | null>(null)
  const errorMsg = ref<string>('')
  const requestSeq = ref(0)

  const isLoading = computed(() => state.value === 'loading')

  function applyDraftFilters() {
    Object.assign(filters, filtersDraft)
  }

  function buildRequestBody(): Api.UserGrowth.AdPlatformInfoRequestBody {
    if (Array.isArray(filters.dateRange)) {
      const [t_start_date, t_end_date] = filters.dateRange
      return {
        n_source: nSource.value,
        t_start_date,
        t_end_date
      }
    }

    const preset: AdPlatformInfoDateRangePreset = filters.dateRange
    const end = getAppNow()
    const start = cloneAppDate(end)
    const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30
    start.setDate(end.getDate() - (days - 1))
    return {
      n_source: nSource.value,
      t_start_date: formatYYYYMMDD(start),
      t_end_date: formatYYYYMMDD(end)
    }
  }

  async function load() {
    if (!isAdPlatformInfoRoute.value) return

    if (!detailId.value) {
      state.value = 'error'
      data.value = null
      errorMsg.value = '缺少广告平台编码'
      return
    }

    const seq = ++requestSeq.value
    state.value = 'loading'
    errorMsg.value = ''
    try {
      const body = buildRequestBody()
      const [
        platformSummary,
        kpiCards,
        roiMap,
        countryTop10,
        conversionFunnel,
        trendChart,
        campaignTable
      ] = await Promise.all([
        fetchAdPlatformInfoPlatformSummary(body),
        fetchAdPlatformInfoKpiCards(body),
        fetchAdPlatformInfoRoiMapPoints(body),
        fetchAdPlatformInfoCountryTop10(body),
        fetchAdPlatformInfoConversionFunnel(body),
        fetchAdPlatformInfoTrendChart(body),
        fetchAdPlatformInfoCampaignTable(body)
      ])

      if (seq !== requestSeq.value) return
      if (!isAdPlatformInfoRoute.value) return

      data.value = {
        summary: platformSummary.summary,
        updatedAtText: String(platformSummary.updatedAtText ?? ''),
        kpis: kpiCards.kpis as AdPlatformInfoKpiCard[],
        mapPoints: roiMap.mapPoints,
        top10: countryTop10.top10,
        heatmap: EMPTY_HEATMAP,
        funnel: conversionFunnel.funnel,
        trend: trendChart.trend,
        campaigns: campaignTable.campaigns as AdPlatformInfoPageData['campaigns']
      }
      state.value = 'ready'
    } catch (e: unknown) {
      if (seq !== requestSeq.value) return
      const err = e as { message?: string }
      errorMsg.value = err?.message || '加载失败'
      state.value = 'error'
      data.value = null
    }
  }

  watch(
    [detailId, isAdPlatformInfoRoute],
    () => {
      if (!isAdPlatformInfoRoute.value) {
        requestSeq.value++
        return
      }
      void load()
    },
    { immediate: true }
  )

  return {
    detailId,
    filtersDraft,
    filters,
    applyDraftFilters,
    state,
    isLoading,
    data,
    errorMsg,
    load
  }
}
