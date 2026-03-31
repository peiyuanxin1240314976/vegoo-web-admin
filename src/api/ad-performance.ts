/**
 * 用户增长 - 广告成效 API（Mock / 远程由 `views/user-growth/ad-performance/config/data-source` 切换）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE, ANALYSIS_API_MIDDLE_PREFIX } from '@/api/analysis-api-base'
import {
  AdPerformanceAdDetailEndpoint,
  AdPerformanceAdEditEndpoint,
  AdPerformanceCampaignDetailEndpoint,
  AdPerformanceEndpoint,
  isAdPerformanceAdDetailEndpointMock,
  isAdPerformanceAdEditEndpointMock,
  isAdPerformanceCampaignDetailEndpointMock,
  isAdPerformanceEndpointMock
} from '@/views/user-growth/ad-performance/config/data-source'
import * as adPerfMock from '@/views/user-growth/ad-performance/mock/ad-performance-api-mock'
import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
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
  CampaignDetailAdGroupActionBody,
  CampaignDetailAdGroupActionResponse,
  CampaignDetailAdListResponse,
  CampaignDetailAiInsightsResponse,
  CampaignDetailCampaignActionBody,
  CampaignDetailCampaignActionResponse,
  CampaignDetailCreativeTop5Response,
  CampaignDetailOverviewResponse
} from '@/views/user-growth/ad-performance/campaign-detail/types'
import type { AdDetailOverviewResponse } from '@/views/user-growth/ad-performance/campaign-detail/ad-detail/types'
import type {
  AdEditFormResponse,
  AdEditSaveDraftBody,
  AdEditSaveDraftResponse,
  AdEditSubmitLaunchBody,
  AdEditSubmitLaunchResponse
} from '@/views/user-growth/ad-performance/campaign-detail/ad-edit/types'

/** 中间段见 `ANALYSIS_API_MIDDLE_PREFIX` */
export const AD_PERFORMANCE_BASE = `${ANALYSIS_API_BASE}${ANALYSIS_API_MIDDLE_PREFIX}/ad-performance`

export const AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE = `${AD_PERFORMANCE_BASE}/campaign-detail`

type CompatibleDateRange = 'today' | 'yesterday' | 'last7d' | 'month'

function resolvePresetRange(key: CompatibleDateRange): { startDate: string; endDate: string } {
  const today = getAppNow()
  if (key === 'today') {
    const ymd = formatYYYYMMDD(today)
    return { startDate: ymd, endDate: ymd }
  }
  if (key === 'yesterday') {
    const d = cloneAppDate(today)
    d.setDate(d.getDate() - 1)
    const ymd = formatYYYYMMDD(d)
    return { startDate: ymd, endDate: ymd }
  }
  if (key === 'last7d') {
    const end = formatYYYYMMDD(today)
    const startD = cloneAppDate(today)
    startD.setDate(startD.getDate() - 6)
    const start = formatYYYYMMDD(startD)
    return { startDate: start, endDate: end }
  }
  const end = formatYYYYMMDD(today)
  const startD = cloneAppDate(today)
  startD.setDate(1)
  const start = formatYYYYMMDD(startD)
  return { startDate: start, endDate: end }
}

function inferCompatibleDateRange(
  startDate: string,
  endDate: string
): CompatibleDateRange | undefined {
  const s = String(startDate ?? '').trim()
  const e = String(endDate ?? '').trim()
  if (!s || !e) return
  const presets: CompatibleDateRange[] = ['today', 'yesterday', 'last7d', 'month']
  const hit = presets.find((k) => {
    const r = resolvePresetRange(k)
    return r.startDate === s && r.endDate === e
  })
  return hit
}

function filterBody(f: AdPerformanceFilter) {
  const compat = inferCompatibleDateRange(f.startDate, f.endDate)
  return {
    startDate: f.startDate,
    endDate: f.endDate,
    ...(compat ? { dateRange: compat } : {}),
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
  const compat =
    body.startDate && body.endDate
      ? inferCompatibleDateRange(body.startDate, body.endDate)
      : undefined
  return request.post<AdPerformanceCampaignDetail>({
    url: `${AD_PERFORMANCE_BASE}/campaign-detail`,
    data: {
      campaignId: body.campaignId,
      ...(body.startDate ? { startDate: body.startDate } : {}),
      ...(body.endDate ? { endDate: body.endDate } : {}),
      ...(compat ? { dateRange: compat } : {})
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

export function fetchCampaignDetailCampaignAction(body: CampaignDetailCampaignActionBody) {
  if (
    isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.CampaignAction)
  ) {
    return adPerfMock.mockFetchCampaignDetailCampaignAction(body)
  }
  return request.post<CampaignDetailCampaignActionResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/campaign-action`,
    data: body
  })
}

export function fetchCampaignDetailAdGroupAction(body: CampaignDetailAdGroupActionBody) {
  if (
    isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.AdGroupAction)
  ) {
    return adPerfMock.mockFetchCampaignDetailAdGroupAction(body)
  }
  return request.post<CampaignDetailAdGroupActionResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ad-group-action`,
    data: body
  })
}

/** 单广告详情页概览（路由：campaign-detail/ad-detail） */
export function fetchAdDetailOverview(body: { adId: string; campaignId: string }) {
  if (isAdPerformanceAdDetailEndpointMock(AdPerformanceAdDetailEndpoint.Overview)) {
    return adPerfMock.mockFetchAdDetailOverview(body)
  }
  return request.post<AdDetailOverviewResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ad-detail/overview`,
    data: body
  })
}

/** 编辑 Campaign 表单拉取 */
export function fetchAdEditForm(body: { campaignId: string; adId?: string }) {
  if (isAdPerformanceAdEditEndpointMock(AdPerformanceAdEditEndpoint.Form)) {
    return adPerfMock.mockFetchAdEditForm(body)
  }
  return request.post<AdEditFormResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ad-edit/form`,
    data: body
  })
}

export function fetchAdEditSaveDraft(body: AdEditSaveDraftBody) {
  if (isAdPerformanceAdEditEndpointMock(AdPerformanceAdEditEndpoint.SaveDraft)) {
    return adPerfMock.mockFetchAdEditSaveDraft(body)
  }
  return request.post<AdEditSaveDraftResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ad-edit/save-draft`,
    data: body
  })
}

export function fetchAdEditSubmitLaunch(body: AdEditSubmitLaunchBody) {
  if (isAdPerformanceAdEditEndpointMock(AdPerformanceAdEditEndpoint.SubmitLaunch)) {
    return adPerfMock.mockFetchAdEditSubmitLaunch(body)
  }
  return request.post<AdEditSubmitLaunchResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ad-edit/submit-launch`,
    data: body
  })
}
