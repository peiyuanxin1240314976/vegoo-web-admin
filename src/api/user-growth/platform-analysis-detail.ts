/**
 * 用户增长 - 广告平台分析详情（Mock / 远程由模块 `views/.../platform-analysis-detail/config/data-source` 切换）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type {
  AlertBarItem,
  ChartTrend,
  MatrixTableData,
  PlatformAnalysisDetailData,
  PlatformAnalysisDetailEcpmBlock,
  PlatformAnalysisDetailSummary
} from '@/views/user-growth/platform-analysis-detail/types'
import {
  mockFetchPlatformAnalysisDetailAlertBar,
  mockFetchPlatformAnalysisDetailCpiTrend,
  mockFetchPlatformAnalysisDetailEcpm,
  mockFetchPlatformAnalysisDetailMatrixTable,
  mockFetchPlatformAnalysisDetailSummary
} from '@/views/user-growth/platform-analysis-detail/mock/data'
import {
  PlatformAnalysisDetailEndpoint,
  isPlatformAnalysisDetailEndpointMock
} from '@/views/user-growth/platform-analysis-detail/config/data-source'

/** 挂在综合分析下：`.../analysis/user-growth/comprehensive-analysis/platform-analysis-detail` */
export const PLATFORM_ANALYSIS_DETAIL_BASE = `${ANALYSIS_API_BASE}/user-growth/comprehensive-analysis/platform-analysis-detail`

function unwrapDataDeep<T = unknown>(value: unknown, maxDepth = 3): T {
  let cur: any = value
  let depth = 0
  while (depth < maxDepth && cur && typeof cur === 'object' && 'data' in cur) {
    cur = (cur as any).data
    depth++
  }
  return cur as T
}

function asAlertBarPayload(value: unknown): AlertBarItem[] {
  const u = value as { alertBar?: AlertBarItem[] } | AlertBarItem[] | null
  if (Array.isArray(u)) return u
  if (u && typeof u === 'object' && Array.isArray((u as { alertBar?: AlertBarItem[] }).alertBar)) {
    return (u as { alertBar: AlertBarItem[] }).alertBar
  }
  return []
}

/** 契约 01-summary — POST */
export function fetchPlatformAnalysisDetailSummary(
  params: Api.UserGrowth.PlatformAnalysisDetailRequest
) {
  if (isPlatformAnalysisDetailEndpointMock(PlatformAnalysisDetailEndpoint.Summary)) {
    return Promise.resolve(mockFetchPlatformAnalysisDetailSummary(params))
  }
  return request
    .post<any>({
      url: `${PLATFORM_ANALYSIS_DETAIL_BASE}/summary`,
      data: params
    })
    .then((res) => unwrapDataDeep<PlatformAnalysisDetailSummary>(res))
}

/** 契约 02-cpi-trend — POST */
export function fetchPlatformAnalysisDetailCpiTrend(
  params: Api.UserGrowth.PlatformAnalysisDetailRequest
) {
  if (isPlatformAnalysisDetailEndpointMock(PlatformAnalysisDetailEndpoint.CpiTrend)) {
    return Promise.resolve(mockFetchPlatformAnalysisDetailCpiTrend(params))
  }
  return request
    .post<any>({
      url: `${PLATFORM_ANALYSIS_DETAIL_BASE}/cpi-trend`,
      data: params
    })
    .then((res) => unwrapDataDeep<ChartTrend>(res))
}

/** 契约 03-ecpm-trend — POST */
export function fetchPlatformAnalysisDetailEcpm(
  params: Api.UserGrowth.PlatformAnalysisDetailRequest
) {
  if (isPlatformAnalysisDetailEndpointMock(PlatformAnalysisDetailEndpoint.EcpmTrend)) {
    return Promise.resolve(mockFetchPlatformAnalysisDetailEcpm(params))
  }
  return request
    .post<any>({
      url: `${PLATFORM_ANALYSIS_DETAIL_BASE}/ecpm-trend`,
      data: params
    })
    .then((res) => unwrapDataDeep<PlatformAnalysisDetailEcpmBlock>(res))
}

/** 契约 04-matrix-table — POST */
export function fetchPlatformAnalysisDetailMatrixTable(
  params: Api.UserGrowth.PlatformAnalysisDetailRequest
) {
  if (isPlatformAnalysisDetailEndpointMock(PlatformAnalysisDetailEndpoint.MatrixTable)) {
    return Promise.resolve(mockFetchPlatformAnalysisDetailMatrixTable(params))
  }
  return request
    .post<any>({
      url: `${PLATFORM_ANALYSIS_DETAIL_BASE}/matrix-table`,
      data: params
    })
    .then((res) => unwrapDataDeep<MatrixTableData>(res))
}

/** 契约 05-alert-bar — POST */
export function fetchPlatformAnalysisDetailAlertBar(
  params: Api.UserGrowth.PlatformAnalysisDetailRequest
) {
  if (isPlatformAnalysisDetailEndpointMock(PlatformAnalysisDetailEndpoint.AlertBar)) {
    return Promise.resolve(mockFetchPlatformAnalysisDetailAlertBar(params))
  }
  return request
    .post<any>({
      url: `${PLATFORM_ANALYSIS_DETAIL_BASE}/alert-bar`,
      data: params
    })
    .then((res) => asAlertBarPayload(unwrapDataDeep<unknown>(res)))
}

/**
 * 首屏并行拉取各分片并组装（与单页 `PlatformAnalysisDetailData` 一致）
 */
export async function loadPlatformAnalysisDetailPage(
  params: Api.UserGrowth.PlatformAnalysisDetailRequest
): Promise<PlatformAnalysisDetailData> {
  const [summary, cpiTrend, ecpmBlock, matrixTable, alertBar] = await Promise.all([
    fetchPlatformAnalysisDetailSummary(params),
    fetchPlatformAnalysisDetailCpiTrend(params),
    fetchPlatformAnalysisDetailEcpm(params),
    fetchPlatformAnalysisDetailMatrixTable(params),
    fetchPlatformAnalysisDetailAlertBar(params)
  ])
  return {
    sourceName: summary.sourceName,
    kpis: summary.kpis,
    statCards: summary.statCards,
    cpiTrend,
    ecpmTrend: ecpmBlock.ecpmTrend,
    ecpmMetrics: ecpmBlock.ecpmMetrics,
    matrixTable,
    alertBar
  }
}
