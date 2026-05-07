/**
 * 广告平台分析详情 — 数据源开关（与 `mock/backend-api` 契约 1:1）
 *
 * - `true` = 本地 Mock（`mock/data.ts` 对应 `mockFetch*`）
 * - `false` = `request.post`（`src/api/user-growth/platform-analysis-detail.ts`）
 *
 * 页面首屏通过 `loadPlatformAnalysisDetailPage` **并行**请求下列接口后组装为 `PlatformAnalysisDetailData`。
 */
export enum PlatformAnalysisDetailEndpoint {
  /** 01-summary.json */
  Summary = 'summary',
  /** 02-cpi-trend.json */
  CpiTrend = 'cpiTrend',
  /** 03-ecpm-trend.json */
  EcpmTrend = 'ecpmTrend',
  /** 04-matrix-table.json */
  MatrixTable = 'matrixTable',
  /** 05-alert-bar.json */
  AlertBar = 'alertBar'
}

export const PLATFORM_ANALYSIS_DETAIL_USE_MOCK: Record<PlatformAnalysisDetailEndpoint, boolean> = {
  [PlatformAnalysisDetailEndpoint.Summary]: false,
  [PlatformAnalysisDetailEndpoint.CpiTrend]: false,
  [PlatformAnalysisDetailEndpoint.EcpmTrend]: false,
  [PlatformAnalysisDetailEndpoint.MatrixTable]: false,
  [PlatformAnalysisDetailEndpoint.AlertBar]: false
}

export function isPlatformAnalysisDetailEndpointMock(
  endpoint: PlatformAnalysisDetailEndpoint
): boolean {
  return PLATFORM_ANALYSIS_DETAIL_USE_MOCK[endpoint]
}
