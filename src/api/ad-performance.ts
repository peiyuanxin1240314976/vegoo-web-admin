/**
 * 用户增长 - 广告成效 API（Mock / 远程由 `views/user-growth/ad-performance/config/data-source` 切换）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE, ANALYSIS_API_MIDDLE_PREFIX } from '@/api/analysis-api-base'
import { buildAppSelectionRequestBody } from '@/utils/app-id-request'
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
type CampaignDetailDateFilter = { startDate?: string; endDate?: string }

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
    ...buildAppSelectionRequestBody(f.appId),
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
  /**
   * 兼容后端/历史字段命名差异：
   * - spendRoiTrend: {date,value} -> {date,spend}
   * - cpiTrend: {date,roi} -> {date,cpi}
   * 并补齐前端依赖的默认结构（dailyRows 等）。
   */
  function normalizeCampaignDetailDrawer(
    d: AdPerformanceCampaignDetail | null | undefined
  ): AdPerformanceCampaignDetail {
    const safe = (d ?? ({} as AdPerformanceCampaignDetail)) as AdPerformanceCampaignDetail
    const tabs: any = safe.tabs ?? {}
    const dateTab: any = tabs.date ?? {}
    const normalizeSpendRoiTrend = (arr: any[]) =>
      arr.map((it: any) => ({
        date: String(it?.date ?? ''),
        spend: it?.spend ?? it?.value ?? 0,
        roi1: it?.roi1 ?? it?.roi ?? 0
      }))
    const normalizeCpiTrend = (arr: any[]) =>
      arr.map((it: any) => ({
        date: String(it?.date ?? ''),
        cpi: it?.cpi ?? it?.value ?? it?.roi ?? 0
      }))

    const datasetsRaw: any = dateTab.datasets
    const datasets =
      datasetsRaw && typeof datasetsRaw === 'object'
        ? {
            last7d: datasetsRaw.last7d ?? {},
            last14d: datasetsRaw.last14d ?? {},
            month: datasetsRaw.month ?? {}
          }
        : null

    const spendRoiTrendRaw: any[] = Array.isArray(dateTab.spendRoiTrend)
      ? dateTab.spendRoiTrend
      : []
    const cpiTrendRaw: any[] = Array.isArray(dateTab.cpiTrend) ? dateTab.cpiTrend : []
    return {
      header: {
        title: safe.header?.title ?? '',
        statusText: safe.header?.statusText ?? ''
      },
      topKpi: {
        totalSpend: safe.topKpi?.totalSpend ?? 0,
        cpi: safe.topKpi?.cpi ?? 0,
        roi1: safe.topKpi?.roi1 ?? 0,
        budgetProgressPercent: safe.topKpi?.budgetProgressPercent ?? 0
      },
      roiSummary: {
        roi1: safe.roiSummary?.roi1 ?? 0,
        roi3: safe.roiSummary?.roi3 ?? 0,
        roi7: safe.roiSummary?.roi7 ?? 0,
        roiTotal: safe.roiSummary?.roiTotal ?? 0,
        estimatedProfit: safe.roiSummary?.estimatedProfit ?? 0
      },
      tabs: {
        adGroup: {
          marketSummaryText: tabs.adGroup?.marketSummaryText ?? '',
          sortHintText: tabs.adGroup?.sortHintText ?? '',
          adGroups: Array.isArray(tabs.adGroup?.adGroups) ? tabs.adGroup.adGroups : [],
          spendDistribution: Array.isArray(tabs.adGroup?.spendDistribution)
            ? tabs.adGroup.spendDistribution
            : [],
          quickCards: Array.isArray(tabs.adGroup?.quickCards) ? tabs.adGroup.quickCards : [],
          insightTitle: tabs.adGroup?.insightTitle ?? '',
          insightText: tabs.adGroup?.insightText ?? ''
        },
        date: {
          range: dateTab.range ?? 'last7d',
          roiTarget: dateTab.roiTarget ?? 80,
          cpiTarget: dateTab.cpiTarget ?? 2.5,
          datasets: {
            last7d: {
              spendRoiTrend: normalizeSpendRoiTrend(
                Array.isArray(datasets?.last7d?.spendRoiTrend)
                  ? datasets.last7d.spendRoiTrend
                  : spendRoiTrendRaw
              ),
              cpiTrend: normalizeCpiTrend(
                Array.isArray(datasets?.last7d?.cpiTrend) ? datasets.last7d.cpiTrend : cpiTrendRaw
              ),
              dailyRows: Array.isArray(datasets?.last7d?.dailyRows)
                ? datasets.last7d.dailyRows
                : Array.isArray(dateTab.dailyRows)
                  ? dateTab.dailyRows
                  : []
            },
            last14d: {
              spendRoiTrend: normalizeSpendRoiTrend(
                Array.isArray(datasets?.last14d?.spendRoiTrend)
                  ? datasets.last14d.spendRoiTrend
                  : []
              ),
              cpiTrend: normalizeCpiTrend(
                Array.isArray(datasets?.last14d?.cpiTrend) ? datasets.last14d.cpiTrend : []
              ),
              dailyRows: Array.isArray(datasets?.last14d?.dailyRows)
                ? datasets.last14d.dailyRows
                : []
            },
            month: {
              spendRoiTrend: normalizeSpendRoiTrend(
                Array.isArray(datasets?.month?.spendRoiTrend) ? datasets.month.spendRoiTrend : []
              ),
              cpiTrend: normalizeCpiTrend(
                Array.isArray(datasets?.month?.cpiTrend) ? datasets.month.cpiTrend : []
              ),
              dailyRows: Array.isArray(datasets?.month?.dailyRows) ? datasets.month.dailyRows : []
            }
          },

          // 兼容旧结构：组件会在 datasets 缺失时回退读取这些字段
          spendRoiTrend: normalizeSpendRoiTrend(spendRoiTrendRaw),
          cpiTrend: normalizeCpiTrend(cpiTrendRaw),
          dailyRows: Array.isArray(dateTab.dailyRows) ? dateTab.dailyRows : []
        },
        country: {
          marketSummaryText: tabs.country?.marketSummaryText ?? '',
          sortHintText: tabs.country?.sortHintText ?? '',
          spendRows: Array.isArray(tabs.country?.spendRows) ? tabs.country.spendRows : [],
          marketRows: Array.isArray(tabs.country?.marketRows) ? tabs.country.marketRows : [],
          insightTitle: tabs.country?.insightTitle ?? '',
          insightText: tabs.country?.insightText ?? ''
        }
      }
    }
  }

  if (isAdPerformanceEndpointMock(AdPerformanceEndpoint.CampaignDetailDrawer)) {
    return adPerfMock
      .mockFetchAdPerformanceCampaignDetailDrawer(body)
      .then((d) => normalizeCampaignDetailDrawer(d))
  }
  const compat =
    body.startDate && body.endDate
      ? inferCompatibleDateRange(body.startDate, body.endDate)
      : undefined
  return request
    .post<AdPerformanceCampaignDetail>({
      url: `${AD_PERFORMANCE_BASE}/campaign-detail`,
      data: {
        campaignId: body.campaignId,
        ...(body.startDate ? { startDate: body.startDate } : {}),
        ...(body.endDate ? { endDate: body.endDate } : {}),
        ...(compat ? { dateRange: compat } : {})
      }
    })
    .then((d) => normalizeCampaignDetailDrawer(d))
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

export function fetchCampaignDetailOverview(
  body: { campaignId: string } & CampaignDetailDateFilter
) {
  if (isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.Overview)) {
    return adPerfMock.mockFetchCampaignDetailOverview(body)
  }
  return request.post<CampaignDetailOverviewResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/overview`,
    data: body
  })
}

export function fetchCampaignDetailAdList(
  body: {
    campaignId: string
    status?: 'all' | 'active' | 'paused' | 'completed'
  } & CampaignDetailDateFilter
) {
  if (isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.AdList)) {
    return adPerfMock.mockFetchCampaignDetailAdList(body)
  }
  return request.post<CampaignDetailAdListResponse>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/ad-list`,
    data: body
  })
}

export function fetchCampaignDetailCreativeTop5(
  body: { campaignId: string } & CampaignDetailDateFilter
) {
  if (isAdPerformanceCampaignDetailEndpointMock(AdPerformanceCampaignDetailEndpoint.CreativeTop5)) {
    return adPerfMock.mockFetchCampaignDetailCreativeTop5(body)
  }
  return request.post<CampaignDetailCreativeTop5Response>({
    url: `${AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE}/creative-top5`,
    data: body
  })
}

export function fetchCampaignDetailAiInsights(
  body: { campaignId: string } & CampaignDetailDateFilter
) {
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
export function fetchAdDetailOverview(
  body: { adId: string; campaignId: string } & CampaignDetailDateFilter
) {
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
