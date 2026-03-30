import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
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

  /** 查询参数 `?id=`，对应广告系列 `s_campaign_id` */
  const detailId = computed(() => {
    const raw = route.query.id
    const s = Array.isArray(raw) ? raw[0] : raw
    return String(s ?? '').trim()
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
    return {
      s_campaign_id: detailId.value,
      date_range: filters.dateRange
    }
  }

  async function load() {
    const id = detailId.value
    if (!id) {
      state.value = 'error'
      data.value = null
      errorMsg.value = '缺少广告系列 ID'
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
