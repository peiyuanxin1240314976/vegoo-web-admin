/**
 * 用户增长 - 实时数据 API（Mock / 远程由 `views/user-growth/real-time-data/config/data-source` 切换）
 *
 * 筛选项下拉请使用 `useCockpitMetaFilterStore`（`@/store/modules/cockpit-meta-filter`），本文件不包含 meta-filter-options。
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type {
  RealtimeAppCardsTableBody,
  RealtimeAppDetailBody,
  RealtimeAppDetailRequestBody,
  RealtimeDataQueryParams,
  RealtimeHourlySpendComparison,
  RealtimeKpiSummary
} from '@/views/user-growth/real-time-data/types'
import {
  RealtimeDataEndpoint,
  isRealtimeDataEndpointMock
} from '@/views/user-growth/real-time-data/config/data-source'
import * as realtimeDataMock from '@/views/user-growth/real-time-data/mock/real-time-data-api-mock'

/** 与 `COMPREHENSIVE_ANALYSIS_BASE` 同级：`.../analysis/user-growth/real-time-data` */
export const REALTIME_DATA_BASE = `${ANALYSIS_API_BASE}/user-growth/real-time-data`

const EMPTY_REALTIME_QUERY: RealtimeDataQueryParams = { appId: '', n_source: '' }

function unwrapDataDeep<T = unknown>(value: unknown, maxDepth = 3): T {
  let cur: unknown = value
  let depth = 0
  while (
    depth < maxDepth &&
    cur &&
    typeof cur === 'object' &&
    'data' in (cur as Record<string, unknown>)
  ) {
    cur = (cur as Record<string, unknown>).data
    depth++
  }
  return cur as T
}

/** 契约 01-overview-kpi-summary — POST */
export function fetchRealtimeOverviewKpiSummary(params?: RealtimeDataQueryParams) {
  if (isRealtimeDataEndpointMock(RealtimeDataEndpoint.OverviewKpiSummary)) {
    return realtimeDataMock.mockFetchRealtimeOverviewKpiSummary(params)
  }
  return request
    .post<RealtimeKpiSummary>({
      url: `${REALTIME_DATA_BASE}/overview-kpi-summary`,
      data: params ?? EMPTY_REALTIME_QUERY
    })
    .then((res) => unwrapDataDeep<RealtimeKpiSummary>(res))
}

/** 契约 02-table-app-cards — POST */
export function fetchRealtimeTableAppCards(params?: RealtimeDataQueryParams) {
  if (isRealtimeDataEndpointMock(RealtimeDataEndpoint.TableAppCards)) {
    return realtimeDataMock.mockFetchRealtimeTableAppCards(params)
  }
  return request
    .post<RealtimeAppCardsTableBody>({
      url: `${REALTIME_DATA_BASE}/table/app-cards`,
      data: params ?? EMPTY_REALTIME_QUERY
    })
    .then((res) => unwrapDataDeep<RealtimeAppCardsTableBody>(res))
}

/** 契约 03-app-detail — POST */
export function fetchRealtimeAppDetail(params: RealtimeAppDetailRequestBody) {
  if (isRealtimeDataEndpointMock(RealtimeDataEndpoint.AppDetail)) {
    return realtimeDataMock.mockFetchRealtimeAppDetail(params)
  }
  return request
    .post<RealtimeAppDetailBody>({
      url: `${REALTIME_DATA_BASE}/app-detail`,
      data: params
    })
    .then((res) => unwrapDataDeep<RealtimeAppDetailBody>(res))
}

/** 契约 04-overview-hourly-spend-comparison — POST */
export function fetchRealtimeOverviewHourlySpendComparison(params?: RealtimeDataQueryParams) {
  if (isRealtimeDataEndpointMock(RealtimeDataEndpoint.OverviewHourlySpendComparison)) {
    return realtimeDataMock.mockFetchRealtimeOverviewHourlySpendComparison(params)
  }
  return request
    .post<RealtimeHourlySpendComparison>({
      url: `${REALTIME_DATA_BASE}/overview-hourly-spend-comparison`,
      data: params ?? EMPTY_REALTIME_QUERY
    })
    .then((res) => unwrapDataDeep<RealtimeHourlySpendComparison>(res))
}
