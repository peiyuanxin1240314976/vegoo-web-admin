/**
 * 用户增长 - 广告成效 API（Mock / 远程由 `views/user-growth/ad-performance/config/data-source` 切换）
 */
import request from '@/utils/http'
import {
  AD_PERFORMANCE_BASE,
  AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE
} from '@/views/user-growth/ad-performance/config/api-base'
import {
  AdPerformanceCampaignDetailEndpoint,
  AdPerformanceEndpoint,
  isAdPerformanceCampaignDetailEndpointMock,
  isAdPerformanceEndpointMock
} from '@/views/user-growth/ad-performance/config/data-source'
import * as adPerfMock from '@/views/user-growth/ad-performance/mock/ad-performance-api-mock'
import type {
  AdPerformanceAlertActionBody,
  AdPerformanceAlertActionResponse,
  AdPerformanceCampaignDetail,
  AdPerformanceCampaignDetailDrawerBody,
  AdPerformanceExportBody,
  AdPerformanceExportJsonResponse,
  AdPerformanceFilter,
  AdPerformanceMetaFilterResponse,
  AdPerformanceOverviewResponse,
  AdPerformanceTableAccountResponse,
  AdPerformanceTableCampaignResponse,
  AdPerformanceTableCountryResponse,
  AdPerformanceTableOwnerResponse,
  AdPerformanceTableQuery
} from '@/views/user-growth/ad-performance/types'
import type {
  CampaignDetailAdListResponse,
  CampaignDetailAiInsightsResponse,
  CampaignDetailCreativeTop5Response,
  CampaignDetailOverviewResponse
} from '@/views/user-growth/ad-performance/campaign-detail/types'

/** 再导出便于其它文件引用（实际定义见 `ad-performance/config/api-base`） */
export { AD_PERFORMANCE_BASE, AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE }

function filterBody(f: AdPerformanceFilter) {
  return {
    dateRange: f.dateRange,
    app: f.app ?? '',
    adPlatform: f.adPlatform ?? '',
    account: f.account ?? '',
    country: f.country ?? ''
  }
}

function tableBody(q: AdPerformanceTableQuery) {
  return {
    ...filterBody(q),
    keyword: q.keyword ?? '',
    current: q.current ?? 1,
    size: q.size ?? 10
  }
}

export function fetchAdPerformanceMetaFilterOptions() {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.MetaFilterOptions)) {
    return adPerfMock.mockFetchAdPerformanceMetaFilterOptions()
  }
  return request.post<AdPerformanceMetaFilterResponse>({
    url: `${AD_PERFORMANCE_BASE}/meta-filter-options`,
    data: {}
  })
}

export function fetchAdPerformanceOverview(filter: AdPerformanceFilter) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.Overview)) {
    return adPerfMock.mockFetchAdPerformanceOverview(filter)
  }
  return request.post<AdPerformanceOverviewResponse>({
    url: `${AD_PERFORMANCE_BASE}/overview`,
    data: filterBody(filter)
  })
}

export function fetchAdPerformanceTableCampaign(query: AdPerformanceTableQuery) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.TableCampaign)) {
    return adPerfMock.mockFetchAdPerformanceTableCampaign(query)
  }
  return request.post<AdPerformanceTableCampaignResponse>({
    url: `${AD_PERFORMANCE_BASE}/table/campaign`,
    data: tableBody(query)
  })
}

export function fetchAdPerformanceTableCountry(query: AdPerformanceTableQuery) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.TableCountry)) {
    return adPerfMock.mockFetchAdPerformanceTableCountry(query)
  }
  return request.post<AdPerformanceTableCountryResponse>({
    url: `${AD_PERFORMANCE_BASE}/table/country`,
    data: tableBody(query)
  })
}

export function fetchAdPerformanceTableOwner(query: AdPerformanceTableQuery) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.TableOwner)) {
    return adPerfMock.mockFetchAdPerformanceTableOwner(query)
  }
  return request.post<AdPerformanceTableOwnerResponse>({
    url: `${AD_PERFORMANCE_BASE}/table/owner`,
    data: tableBody(query)
  })
}

export function fetchAdPerformanceTableAccount(query: AdPerformanceTableQuery) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.TableAccount)) {
    return adPerfMock.mockFetchAdPerformanceTableAccount(query)
  }
  return request.post<AdPerformanceTableAccountResponse>({
    url: `${AD_PERFORMANCE_BASE}/table/account`,
    data: tableBody(query)
  })
}

export function fetchAdPerformanceCampaignDetailDrawer(
  body: AdPerformanceCampaignDetailDrawerBody
) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.CampaignDetailDrawer)) {
    return adPerfMock.mockFetchAdPerformanceCampaignDetailDrawer(body)
  }
  return request.post<AdPerformanceCampaignDetail>({
    url: `${AD_PERFORMANCE_BASE}/campaign-detail`,
    data: {
      campaignId: body.campaignId,
      ...(body.dateRange ? { dateRange: body.dateRange } : {})
    }
  })
}

export function fetchAdPerformanceExport(body: AdPerformanceExportBody) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.Export)) {
    return adPerfMock.mockFetchAdPerformanceExport(body)
  }
  return request.post<AdPerformanceExportJsonResponse>({
    url: `${AD_PERFORMANCE_BASE}/export`,
    data: {
      ...filterBody(body),
      ...(body.tab ? { tab: body.tab } : {}),
      format: body.format ?? 'xlsx'
    }
  })
}

export function fetchAdPerformanceAlertAction(body: AdPerformanceAlertActionBody) {
  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.AlertAction)) {
    return adPerfMock.mockFetchAdPerformanceAlertAction(body)
  }
  return request.post<AdPerformanceAlertActionResponse>({
    url: `${AD_PERFORMANCE_BASE}/alert-action`,
    data: body
  })
}

export function fetchCampaignDetailOverview(body: { campaignId: string }) {
  if (isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.Overview)) {
    return adPerfMock.mockFetchCampaignDetailOverview(body)
  }
  return request.post<CampaignDetailOverviewResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/overview`,
    data: body
  })
}

export function fetchCampaignDetailAdList(body: {
  campaignId: string
  status?: 'all' | 'active' | 'paused' | 'completed'
}) {
  if (isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.AdList)) {
    return adPerfMock.mockFetchCampaignDetailAdList(body)
  }
  return request.post<CampaignDetailAdListResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ad-list`,
    data: body
  })
}

export function fetchCampaignDetailCreativeTop5(body: { campaignId: string }) {
  if (isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.CreativeTop5)) {
    return adPerfMock.mockFetchCampaignDetailCreativeTop5(body)
  }
  return request.post<CampaignDetailCreativeTop5Response>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/creative-top5`,
    data: body
  })
}

export function fetchCampaignDetailAiInsights(body: { campaignId: string }) {
  if (isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.AiInsights)) {
    return adPerfMock.mockFetchCampaignDetailAiInsights(body)
  }
  return request.post<CampaignDetailAiInsightsResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ai-insights`,
    data: body
  })
}
