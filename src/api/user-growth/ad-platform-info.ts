/**
 * 用户增长 - 广告平台信息详情（`/user-growth/ad-platform-analysis/ad-platform-info`）
 * 与 `views/.../ad-platform-info/mock/backend-api/*.json` 及 `config/data-source.ts` 一一对应。
 */
import request from '@/utils/http'
import {
  AdPlatformInfoEndpoint,
  isAdPlatformInfoMock
} from '@/views/user-growth/ad-platform-analysis/ad-platform-info/config/data-source'
import {
  mockAdPlatformInfoCampaignTable,
  mockAdPlatformInfoConversionFunnel,
  mockAdPlatformInfoCountryTop10,
  mockAdPlatformInfoKpiCards,
  mockAdPlatformInfoPlatformSummary,
  mockAdPlatformInfoRetentionHeatmap,
  mockAdPlatformInfoRoiMapPoints,
  mockAdPlatformInfoTrendChart
} from '@/views/user-growth/ad-platform-analysis/ad-platform-info/mock/ad-platform-info-api-mock'

const AD_PLATFORM_INFO_BASE =
  '/api/v1/datacenter/analysis/user-growth/ad-platform-analysis/ad-platform-info'

/** POST .../platform-summary */
export function fetchAdPlatformInfoPlatformSummary(body: Api.UserGrowth.AdPlatformInfoRequestBody) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.PlatformSummary)) {
    return mockAdPlatformInfoPlatformSummary(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoPlatformSummaryResponse>({
    url: `${AD_PLATFORM_INFO_BASE}/platform-summary`,
    data: body
  })
}

/** POST .../kpi-cards */
export function fetchAdPlatformInfoKpiCards(body: Api.UserGrowth.AdPlatformInfoRequestBody) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.KpiCards)) {
    return mockAdPlatformInfoKpiCards(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoKpiCardsResponse>({
    url: `${AD_PLATFORM_INFO_BASE}/kpi-cards`,
    data: body
  })
}

/** POST .../roi-map-points */
export function fetchAdPlatformInfoRoiMapPoints(body: Api.UserGrowth.AdPlatformInfoRequestBody) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.RoiMapPoints)) {
    return mockAdPlatformInfoRoiMapPoints(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoRoiMapPointsResponse>({
    url: `${AD_PLATFORM_INFO_BASE}/roi-map-points`,
    data: body
  })
}

/** POST .../country-top10 */
export function fetchAdPlatformInfoCountryTop10(body: Api.UserGrowth.AdPlatformInfoRequestBody) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.CountryTop10)) {
    return mockAdPlatformInfoCountryTop10(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoCountryTop10Response>({
    url: `${AD_PLATFORM_INFO_BASE}/country-top10`,
    data: body
  })
}

/** POST .../retention-heatmap */
export function fetchAdPlatformInfoRetentionHeatmap(
  body: Api.UserGrowth.AdPlatformInfoRequestBody
) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.RetentionHeatmap)) {
    return mockAdPlatformInfoRetentionHeatmap(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoRetentionHeatmapResponse>({
    url: `${AD_PLATFORM_INFO_BASE}/retention-heatmap`,
    data: body
  })
}

/** POST .../conversion-funnel */
export function fetchAdPlatformInfoConversionFunnel(
  body: Api.UserGrowth.AdPlatformInfoRequestBody
) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.ConversionFunnel)) {
    return mockAdPlatformInfoConversionFunnel(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoConversionFunnelResponse>({
    url: `${AD_PLATFORM_INFO_BASE}/conversion-funnel`,
    data: body
  })
}

/** POST .../trend-chart */
export function fetchAdPlatformInfoTrendChart(body: Api.UserGrowth.AdPlatformInfoRequestBody) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.TrendChart)) {
    return mockAdPlatformInfoTrendChart(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoTrendChartResponse>({
    url: `${AD_PLATFORM_INFO_BASE}/trend-chart`,
    data: body
  })
}

/** POST .../campaign-table */
export function fetchAdPlatformInfoCampaignTable(body: Api.UserGrowth.AdPlatformInfoRequestBody) {
  if (isAdPlatformInfoMock(AdPlatformInfoEndpoint.CampaignTable)) {
    return mockAdPlatformInfoCampaignTable(body)
  }
  return request.post<Api.UserGrowth.AdPlatformInfoCampaignTableResponse>({
    url: `${AD_PLATFORM_INFO_BASE}/campaign-table`,
    data: body
  })
}
