/**
 * 用户增长 - 广告平台分析大屏 API
 */
import request from '@/utils/http'
import {
  AdPlatformAnalysisEndpoint,
  isAdPlatformAnalysisMock
} from '@/views/user-growth/ad-platform-analysis/config/data-source'
import {
  mockFetchAdPlatformAnalysisCampaignTop10,
  mockFetchAdPlatformAnalysisFiltersMeta,
  mockFetchAdPlatformAnalysisKpiCards,
  mockFetchAdPlatformAnalysisMetricsTable,
  mockFetchAdPlatformAnalysisQualityHeatmap,
  mockFetchAdPlatformAnalysisRoiTrend
} from '@/views/user-growth/ad-platform-analysis/mock/ad-platform-analysis-api-mock'

/** 广告平台分析大屏 - 筛选下拉元数据 POST /api/v1/datacenter/analysis/ad-platform/filters/meta（请求体 `{}`） */
export function fetchAdPlatformAnalysisFiltersMeta() {
  if (isAdPlatformAnalysisMock(AdPlatformAnalysisEndpoint.FiltersMeta)) {
    return mockFetchAdPlatformAnalysisFiltersMeta()
  }
  return request.post<Api.UserGrowth.AdPlatformFiltersMetaDto>({
    url: '/api/v1/datacenter/analysis/ad-platform/filters/meta',
    data: {}
  })
}

/** 广告平台分析大屏 - 第一排 KPI 卡片 POST /api/v1/datacenter/analysis/ad-platform/kpi/cards */
export function fetchAdPlatformAnalysisKpiCards(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  if (isAdPlatformAnalysisMock(AdPlatformAnalysisEndpoint.KpiCards)) {
    return mockFetchAdPlatformAnalysisKpiCards(params)
  }
  return request.post<Api.UserGrowth.AdPlatformKpiCardDto[]>({
    url: '/api/v1/datacenter/analysis/ad-platform/kpi/cards',
    data: params
  })
}

/** 广告平台分析大屏 - ROI 趋势 POST /api/v1/datacenter/analysis/ad-platform/roi/trend */
export function fetchAdPlatformAnalysisRoiTrend(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  if (isAdPlatformAnalysisMock(AdPlatformAnalysisEndpoint.RoiTrend)) {
    return mockFetchAdPlatformAnalysisRoiTrend(params)
  }
  return request.post<Api.UserGrowth.AdPlatformRoiTrendDto>({
    url: '/api/v1/datacenter/analysis/ad-platform/roi/trend',
    data: params
  })
}

/** 广告平台分析大屏 - 用户质量热力图 POST /api/v1/datacenter/analysis/ad-platform/quality/heatmap */
export function fetchAdPlatformAnalysisQualityHeatmap(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  if (isAdPlatformAnalysisMock(AdPlatformAnalysisEndpoint.QualityHeatmap)) {
    return mockFetchAdPlatformAnalysisQualityHeatmap(params)
  }
  return request.post<Api.UserGrowth.AdPlatformQualityHeatmapRowDto[]>({
    url: '/api/v1/datacenter/analysis/ad-platform/quality/heatmap',
    data: params
  })
}

/** 广告平台分析大屏 - Top10 广告系列 POST /api/v1/datacenter/analysis/ad-platform/campaign/top10 */
export function fetchAdPlatformAnalysisCampaignTop10(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  if (isAdPlatformAnalysisMock(AdPlatformAnalysisEndpoint.CampaignTop10)) {
    return mockFetchAdPlatformAnalysisCampaignTop10(params)
  }
  return request.post<Api.UserGrowth.AdPlatformCampaignTop10RowDto[]>({
    url: '/api/v1/datacenter/analysis/ad-platform/campaign/top10',
    data: params
  })
}

/** 广告平台分析大屏 - 指标比较详情表（分页） POST /api/v1/datacenter/analysis/ad-platform/metrics/table */
export function fetchAdPlatformAnalysisMetricsTable(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  if (isAdPlatformAnalysisMock(AdPlatformAnalysisEndpoint.MetricsTable)) {
    return mockFetchAdPlatformAnalysisMetricsTable(params)
  }
  return request.post<Api.UserGrowth.AdPlatformMetricsTableDto>({
    url: '/api/v1/datacenter/analysis/ad-platform/metrics/table',
    data: params
  })
}
