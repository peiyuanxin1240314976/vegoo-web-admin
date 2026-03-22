/**
 * IAP 分析 - 接口层（与页面 mock/backend-api 契约 1:1 分片）
 * 网关路径前缀与 business-insight 其它接口一致
 */
import request from '@/utils/http'
import { isBusinessInsightIaaIapUsingMock } from '@/views/business-insight/config/data-source'
import * as insightMock from '@/views/business-insight/mocks/business-insight-api-mock'
import type {
  IapFilterOptions,
  IapKpiCard,
  IapOverviewTrend,
  IapAppCard,
  IapCountryRow,
  IapProductTypeDonutItem,
  IapPlatformCompare,
  IapOverviewRow,
  IapOverviewSummary,
  IapDetailProduct,
  IapDetailUser,
  IapDetailTrend
} from '@/views/business-insight/iap-analysis/types'

const IAP_BASE = '/api/v1/datacenter/analysis/business-insight/iap-analysis'

function emptyIfAll(v: string | undefined, all = 'all') {
  if (v === undefined || v === '' || v === all) return ''
  return v
}

function normalizeIapOverviewBody(params: {
  timeRange: string
  s_app_id?: string
  productType?: string
  s_country_code?: string
  platform?: string
}) {
  return {
    timeRange: params.timeRange,
    s_app_id: emptyIfAll(params.s_app_id),
    productType: emptyIfAll(params.productType),
    s_country_code: emptyIfAll(params.s_country_code),
    platform: emptyIfAll(params.platform)
  }
}

function normalizeIapDetailBody(params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  return {
    s_app_id: params.s_app_id,
    timeRange: params.timeRange,
    s_country_code: emptyIfAll(params.s_country_code),
    platform: emptyIfAll(params.platform)
  }
}

export type IapOverviewTableQuery = {
  timeRange: string
  s_app_id?: string
  productType?: string
  s_country_code?: string
  platform?: string
}

/** 契约 01-meta-filter-options.json — GET meta-filter-options */
export function fetchIapMetaFilterOptions() {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapMetaFilterOptions()
  return request.get<IapFilterOptions>({ url: `${IAP_BASE}/meta-filter-options` })
}

/** 契约 02-overview-kpi.json — POST overview/kpi */
export function fetchIapOverviewKpi(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapOverviewKpi(params)
  return request.post<{ kpis: IapKpiCard[] }>({
    url: `${IAP_BASE}/overview/kpi`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 03-overview-trend.json — POST overview/trend */
export function fetchIapOverviewTrend(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapOverviewTrend(params)
  return request.post<IapOverviewTrend>({
    url: `${IAP_BASE}/overview/trend`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 04-overview-app-cards.json — POST overview/app-cards */
export function fetchIapOverviewAppCards(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapOverviewAppCards(params)
  return request.post<{ list: IapAppCard[] }>({
    url: `${IAP_BASE}/overview/app-cards`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 05-overview-country-distribution.json — POST overview/country-distribution */
export function fetchIapOverviewCountryDistribution(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) {
    return insightMock.mockFetchIapOverviewCountryDistribution(params)
  }
  return request.post<{ list: IapCountryRow[] }>({
    url: `${IAP_BASE}/overview/country-distribution`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 06-overview-product-type-donut.json — POST overview/product-type-donut（入参与 KPI/趋势一致，含 productType、platform） */
export function fetchIapOverviewProductTypeDonut(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) {
    return insightMock.mockFetchIapOverviewProductTypeDonut(params)
  }
  return request.post<{ list: IapProductTypeDonutItem[] }>({
    url: `${IAP_BASE}/overview/product-type-donut`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 07-overview-platform-compare.json — POST overview/platform-compare（入参与 KPI/趋势一致；选单端 platform 时由后端决定展示逻辑） */
export function fetchIapOverviewPlatformCompare(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) {
    return insightMock.mockFetchIapOverviewPlatformCompare(params)
  }
  return request.post<IapPlatformCompare>({
    url: `${IAP_BASE}/overview/platform-compare`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 08-overview-table.json — POST overview/table（与 table/overview 并存时选其一联调） */
export function fetchIapOverviewTable(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapOverviewTable(params)
  return request.post<{ list: IapOverviewRow[]; summary: IapOverviewSummary }>({
    url: `${IAP_BASE}/overview/table`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 08-table-overview.json — POST table/overview（README 清单中的 Overview 树表） */
export function fetchIapTableOverview(params: IapOverviewTableQuery) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapOverviewTable(params)
  return request.post<{ list: IapOverviewRow[]; summary: IapOverviewSummary }>({
    url: `${IAP_BASE}/table/overview`,
    data: normalizeIapOverviewBody(params)
  })
}

/** 契约 09-detail-kpi.json — POST detail/kpi */
export function fetchIapDetailKpi(params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapDetailKpi(params)
  return request.post<{ kpis: IapKpiCard[] }>({
    url: `${IAP_BASE}/detail/kpi`,
    data: normalizeIapDetailBody(params)
  })
}

/** 契约 10-detail-product.json — POST detail/product */
export function fetchIapDetailProduct(params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapDetailProduct(params)
  return request.post<IapDetailProduct>({
    url: `${IAP_BASE}/detail/product`,
    data: normalizeIapDetailBody(params)
  })
}

/** 契约 11-detail-user.json — POST detail/user */
export function fetchIapDetailUser(params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapDetailUser(params)
  return request.post<IapDetailUser>({
    url: `${IAP_BASE}/detail/user`,
    data: normalizeIapDetailBody(params)
  })
}

/** 契约 12-detail-trend.json — POST detail/trend */
export function fetchIapDetailTrend(params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIapDetailTrend(params)
  return request.post<IapDetailTrend>({
    url: `${IAP_BASE}/detail/trend`,
    data: normalizeIapDetailBody(params)
  })
}
