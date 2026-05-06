/**
 * IAP 分析 - 接口层（与页面 mock/backend-api 契约 1:1 分片）
 * 网关路径前缀与 business-insight 其它接口一致
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import { buildAppSelectionRequestBody } from '@/utils/app-id-request'
import {
  IapAnalysisEndpoint,
  isIapAnalysisEndpointMock
} from '@/views/business-insight/iap-analysis/config/data-source'
import * as insightMock from '@/views/business-insight/mocks/business-insight-api-mock'
import type {
  IapKpiCard,
  IapOverviewTrend,
  IapAppCard,
  IapCountryRow,
  IapProductTypeDonutItem,
  IapPlatformCompare,
  IapDetailProduct,
  IapDetailUser,
  IapDetailTrend
} from '@/views/business-insight/iap-analysis/types'

const IAP_BASE = `${ANALYSIS_API_BASE}/business-insight/iap-analysis`

function emptyIfAll(v: string | string[] | undefined, all = 'all') {
  if (Array.isArray(v)) return v.filter((item) => String(item ?? '').trim() !== all)
  if (v === undefined || v === '' || v === all) return ''
  return v
}

function normalizeIapOverviewBody(params: {
  startDate: string
  endDate: string
  s_app_id?: string | string[]
  s_country_code?: string
  platform?: string
}) {
  return {
    startDate: params.startDate,
    endDate: params.endDate,
    ...buildAppSelectionRequestBody(emptyIfAll(params.s_app_id)),
    s_country_code: emptyIfAll(params.s_country_code),
    platform: emptyIfAll(params.platform)
  }
}

function normalizeIapDetailBody(params: {
  s_app_id: string | string[]
  startDate: string
  endDate: string
  s_country_code?: string
  platform?: string
}) {
  return {
    startDate: params.startDate,
    endDate: params.endDate,
    ...buildAppSelectionRequestBody(emptyIfAll(params.s_app_id)),
    s_country_code: emptyIfAll(params.s_country_code),
    platform: emptyIfAll(params.platform)
  }
}

export type IapOverviewTableQuery = {
  startDate: string
  endDate: string
  s_app_id?: string | string[]
  s_country_code?: string
  platform?: string
}

function toMockSingleAppId(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0]
  return v
}

/** 契约 02-overview-kpi.json — POST overview/kpi */
export function fetchIapOverviewKpi(params: IapOverviewTableQuery) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.OverviewKpi)) {
    return insightMock.mockFetchIapOverviewKpi({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id)
    })
  }
  return request.post<{ kpis: IapKpiCard[] }>({
    url: `${IAP_BASE}/overview/kpi`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 03-overview-trend.json — POST overview/trend */
export function fetchIapOverviewTrend(params: IapOverviewTableQuery) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.OverviewTrend)) {
    return insightMock.mockFetchIapOverviewTrend({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id)
    })
  }
  return request.post<IapOverviewTrend>({
    url: `${IAP_BASE}/overview/trend`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 04-overview-app-cards.json — POST overview/app-cards */
export function fetchIapOverviewAppCards(params: IapOverviewTableQuery) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.OverviewAppCards)) {
    return insightMock.mockFetchIapOverviewAppCards({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id)
    })
  }
  return request.post<{ list: IapAppCard[] }>({
    url: `${IAP_BASE}/overview/app-cards`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 05-overview-country-distribution.json — POST overview/country-distribution */
export function fetchIapOverviewCountryDistribution(params: IapOverviewTableQuery) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.OverviewCountryDistribution)) {
    return insightMock.mockFetchIapOverviewCountryDistribution({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id)
    })
  }
  return request.post<{ list: IapCountryRow[] }>({
    url: `${IAP_BASE}/overview/country-distribution`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 06-overview-product-type-donut.json — POST overview/product-type-donut（入参与 KPI/趋势一致，含 productType、platform） */
export function fetchIapOverviewProductTypeDonut(params: IapOverviewTableQuery) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.OverviewProductTypeDonut)) {
    return insightMock.mockFetchIapOverviewProductTypeDonut({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id)
    })
  }
  return request.post<{ list: IapProductTypeDonutItem[] }>({
    url: `${IAP_BASE}/overview/product-type-donut`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 07-overview-platform-compare.json — POST overview/platform-compare（入参与 KPI/趋势一致；选单端 platform 时由后端决定展示逻辑） */
export function fetchIapOverviewPlatformCompare(params: IapOverviewTableQuery) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.OverviewPlatformCompare)) {
    return insightMock.mockFetchIapOverviewPlatformCompare({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id)
    })
  }
  return request.post<IapPlatformCompare>({
    url: `${IAP_BASE}/overview/platform-compare`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 09-detail-kpi.json — POST detail/kpi */
export function fetchIapDetailKpi(params: {
  s_app_id: string | string[]
  startDate: string
  endDate: string
  s_country_code?: string
  platform?: string
}) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.DetailKpi)) {
    return insightMock.mockFetchIapDetailKpi({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id) ?? ''
    })
  }
  return request.post<{ kpis: IapKpiCard[] }>({
    url: `${IAP_BASE}/detail/kpi`,
    data: normalizeIapDetailBody(params)
  })
}

/** 契约 10-detail-product.json — POST detail/product */
export function fetchIapDetailProduct(params: {
  s_app_id: string | string[]
  startDate: string
  endDate: string
  s_country_code?: string
  platform?: string
}) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.DetailProduct)) {
    return insightMock.mockFetchIapDetailProduct({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id) ?? ''
    })
  }
  return request.post<IapDetailProduct>({
    url: `${IAP_BASE}/detail/product`,
    data: normalizeIapDetailBody(params)
  })
}

/** 契约 11-detail-user.json — POST detail/user */
export function fetchIapDetailUser(params: {
  s_app_id: string | string[]
  startDate: string
  endDate: string
  s_country_code?: string
  platform?: string
}) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.DetailUser)) {
    return insightMock.mockFetchIapDetailUser({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id) ?? ''
    })
  }
  return request.post<IapDetailUser>({
    url: `${IAP_BASE}/detail/user`,
    data: normalizeIapDetailBody(params)
  })
}

/** 契约 12-detail-trend.json — POST detail/trend */
export function fetchIapDetailTrend(params: {
  s_app_id: string | string[]
  startDate: string
  endDate: string
  s_country_code?: string
  platform?: string
}) {
  if (isIapAnalysisEndpointMock(IapAnalysisEndpoint.DetailTrend)) {
    return insightMock.mockFetchIapDetailTrend({
      ...params,
      s_app_id: toMockSingleAppId(params.s_app_id) ?? ''
    })
  }
  return request.post<IapDetailTrend>({
    url: `${IAP_BASE}/detail/trend`,
    data: normalizeIapDetailBody(params)
  })
}
