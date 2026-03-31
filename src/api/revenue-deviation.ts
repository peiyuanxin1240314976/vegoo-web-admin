/**
 * 商业洞察 — 预估收入偏差（与 views/.../revenue-deviation/mock/backend-api 契约对齐）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  RevenueDeviationEndpoint,
  isRevenueDeviationEndpointMock
} from '@/views/business-insight/revenue-deviation/config/data-source'
import {
  mockFetchRevenueDeviationOverviewAdvice,
  mockFetchRevenueDeviationOverviewCountryTop10,
  mockFetchRevenueDeviationOverviewKpis,
  mockFetchRevenueDeviationOverviewReason,
  mockFetchRevenueDeviationOverviewTrend,
  mockFetchRevenueDeviationTableHistory,
  mockFetchRevenueDeviationTableMatrix,
  mockFetchRevenueDeviationTablePlatform
} from '@/views/business-insight/revenue-deviation/mock/data'
import type {
  RevenueDeviationAdvice,
  RevenueDeviationCountryTop10,
  RevenueDeviationMetaFilterOptions,
  RevenueDeviationHistoryRow,
  RevenueDeviationMatrixQuery,
  RevenueDeviationMatrixTable,
  RevenueDeviationOverviewKpis,
  RevenueDeviationOverviewTrend,
  RevenueDeviationPlatformTable,
  RevenueDeviationQuery,
  RevenueDeviationReasonSegment
} from '@/views/business-insight/revenue-deviation/types'

const RD_BASE = `${ANALYSIS_API_BASE}/business-insight/revenue-deviation`
const ECPM_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/business-insight/ecpm-analysis`

function normalizeQuery(q: RevenueDeviationQuery) {
  return {
    t_start_date: q.t_start_date,
    t_end_date: q.t_end_date,
    source: q.source ?? '',
    s_app_id: q.s_app_id ?? '',
    row_dim: q.row_dim ?? 'app',
    col_dim: q.col_dim ?? 'platform'
  }
}

function normalizeMatrixQuery(q: RevenueDeviationMatrixQuery) {
  // 矩阵接口也使用同名 source 参数（仅影响 table/matrix）
  return normalizeQuery(q)
}

export function fetchRevenueDeviationMetaFilterOptions() {
  return request.get<RevenueDeviationMetaFilterOptions>({
    url: `${ECPM_ANALYSIS_BASE}/meta-filter-options`
  })
}

/** 01-overview-kpis.json */
export function fetchRevenueDeviationOverviewKpis(params: RevenueDeviationQuery) {
  const body = normalizeQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.OverviewKpis)) {
    return mockFetchRevenueDeviationOverviewKpis(body)
  }
  return request.post<RevenueDeviationOverviewKpis>({
    url: `${RD_BASE}/overview/kpis`,
    data: body
  })
}

/** 02-overview-trend.json */
export function fetchRevenueDeviationOverviewTrend(params: RevenueDeviationQuery) {
  const body = normalizeQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.OverviewTrend)) {
    return mockFetchRevenueDeviationOverviewTrend(body)
  }
  return request.post<RevenueDeviationOverviewTrend>({
    url: `${RD_BASE}/overview/trend`,
    data: body
  })
}

/** 03-table-platform.json */
export function fetchRevenueDeviationTablePlatform(params: RevenueDeviationQuery) {
  const body = normalizeQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.TablePlatform)) {
    return mockFetchRevenueDeviationTablePlatform(body)
  }
  return request.post<RevenueDeviationPlatformTable>({
    url: `${RD_BASE}/table/platform`,
    data: body
  })
}

/** 04-overview-reason.json */
export function fetchRevenueDeviationOverviewReason(params: RevenueDeviationQuery) {
  const body = normalizeQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.OverviewReason)) {
    return mockFetchRevenueDeviationOverviewReason(body)
  }
  return request.post<RevenueDeviationReasonSegment[]>({
    url: `${RD_BASE}/overview/reason`,
    data: body
  })
}

/** 05-overview-advice.json */
export function fetchRevenueDeviationOverviewAdvice(params: RevenueDeviationQuery) {
  const body = normalizeQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.OverviewAdvice)) {
    return mockFetchRevenueDeviationOverviewAdvice(body)
  }
  return request.post<RevenueDeviationAdvice>({
    url: `${RD_BASE}/overview/advice`,
    data: body
  })
}

/** 06-overview-country-top10.json */
export function fetchRevenueDeviationOverviewCountryTop10(params: RevenueDeviationQuery) {
  const body = normalizeQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.OverviewCountryTop10)) {
    return mockFetchRevenueDeviationOverviewCountryTop10(body)
  }
  return request.post<RevenueDeviationCountryTop10>({
    url: `${RD_BASE}/overview/country-top10`,
    data: body
  })
}

/** 07-table-history.json */
export function fetchRevenueDeviationTableHistory(params: RevenueDeviationQuery) {
  const body = normalizeQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.TableHistory)) {
    return mockFetchRevenueDeviationTableHistory(body)
  }
  return request.post<RevenueDeviationHistoryRow[]>({
    url: `${RD_BASE}/table/history`,
    data: body
  })
}

/** 08-table-matrix.json */
export function fetchRevenueDeviationTableMatrix(params: RevenueDeviationMatrixQuery) {
  const body = normalizeMatrixQuery(params)
  if (isRevenueDeviationEndpointMock(RevenueDeviationEndpoint.TableMatrix)) {
    return mockFetchRevenueDeviationTableMatrix(body)
  }
  return request.post<RevenueDeviationMatrixTable>({
    url: `${RD_BASE}/table/matrix`,
    data: body
  })
}
