import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
import {
  fetchAdPlatformInfoCampaignTable,
  fetchAdPlatformInfoConversionFunnel,
  fetchAdPlatformInfoCountryTop10,
  fetchAdPlatformInfoKpiCards,
  fetchAdPlatformInfoPlatformSummary,
  fetchAdPlatformInfoRetentionHeatmap,
  fetchAdPlatformInfoRoiMapPoints,
  fetchAdPlatformInfoTrendChart
} from '@/api/user-growth/ad-platform-info'
import type {
  AdPlatformInfoFilterState,
  AdPlatformInfoKpiCard,
  AdPlatformInfoPageData
} from '../types'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function useAdPlatformInfo() {
  const route = useRoute()

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

  const isLoading = computed(() => state.value === 'loading')

  function applyDraftFilters() {
    Object.assign(filters, filtersDraft)
  }

  function buildRequestBody(): Api.UserGrowth.AdPlatformInfoRequestBody {
    const end = getAppNow()
    const start = cloneAppDate(end)
    const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '90d' ? 90 : 30
    start.setDate(end.getDate() - (days - 1))
    return {
      n_source: nSource.value,
      t_start_date: formatYYYYMMDD(start),
      t_end_date: formatYYYYMMDD(end)
    }
  }

  async function load() {
    if (!detailId.value) {
      state.value = 'error'
      data.value = null
      errorMsg.value = '缺少广告平台编码'
      return
    }

    state.value = 'loading'
    errorMsg.value = ''
    try {
      const body = buildRequestBody()
      const [
        platformSummary,
        kpiCards,
        roiMap,
        countryTop10,
        retentionHeatmap,
        conversionFunnel,
        trendChart,
        campaignTable
      ] = await Promise.all([
        fetchAdPlatformInfoPlatformSummary(body),
        fetchAdPlatformInfoKpiCards(body),
        fetchAdPlatformInfoRoiMapPoints(body),
        fetchAdPlatformInfoCountryTop10(body),
        fetchAdPlatformInfoRetentionHeatmap(body),
        fetchAdPlatformInfoConversionFunnel(body),
        fetchAdPlatformInfoTrendChart(body),
        fetchAdPlatformInfoCampaignTable(body)
      ])

      data.value = {
        summary: platformSummary.summary,
        updatedAtText: platformSummary.updatedAtText,
        kpis: kpiCards.kpis as AdPlatformInfoKpiCard[],
        mapPoints: roiMap.mapPoints,
        top10: countryTop10.top10,
        heatmap: retentionHeatmap.heatmap,
        funnel: conversionFunnel.funnel,
        trend: trendChart.trend,
        campaigns: campaignTable.campaigns as AdPlatformInfoPageData['campaigns']
      }
      state.value = 'ready'
    } catch (e: unknown) {
      const err = e as { message?: string }
      errorMsg.value = err?.message || '加载失败'
      state.value = 'error'
      data.value = null
    }
  }

  watch(
    detailId,
    () => {
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
