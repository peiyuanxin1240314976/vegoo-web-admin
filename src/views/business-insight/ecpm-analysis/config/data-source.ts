/**
 * ECPM 分析 — 数据源开关（与 `mock/backend-api` 及后续 `fetch*` 一一对应）
 *
 * - `true` = Mock（`mock.ts`）
 * - `false` = 远程 HTTP
 *
 * 当前页面仅接入本地 Mock；联调时按需将单项改为 `false`。
 */
export enum EcpmAnalysisEndpoint {
  MetaFilterOptions = 'metaFilterOptions',
  OverviewKpis = 'overviewKpis',
  OverviewTrend = 'overviewTrend',
  TablePlatform = 'tablePlatform',
  OverviewMapCountry = 'overviewMapCountry',
  OverviewTop10Country = 'overviewTop10Country',
  OverviewAdSlotRanking = 'overviewAdSlotRanking',
  OverviewAppRanking = 'overviewAppRanking',
  OverviewInsightTip = 'overviewInsightTip'
}

export const ECPM_ANALYSIS_USE_MOCK: Record<EcpmAnalysisEndpoint, boolean> = {
  [EcpmAnalysisEndpoint.MetaFilterOptions]: false,
  [EcpmAnalysisEndpoint.OverviewKpis]: false,
  [EcpmAnalysisEndpoint.OverviewTrend]: false,
  [EcpmAnalysisEndpoint.TablePlatform]: false,
  [EcpmAnalysisEndpoint.OverviewMapCountry]: false,
  [EcpmAnalysisEndpoint.OverviewTop10Country]: false,
  [EcpmAnalysisEndpoint.OverviewAdSlotRanking]: false,
  [EcpmAnalysisEndpoint.OverviewAppRanking]: false,
  [EcpmAnalysisEndpoint.OverviewInsightTip]: false
}

export function isEcpmAnalysisEndpointMock(endpoint: EcpmAnalysisEndpoint): boolean {
  return ECPM_ANALYSIS_USE_MOCK[endpoint] === true
}
