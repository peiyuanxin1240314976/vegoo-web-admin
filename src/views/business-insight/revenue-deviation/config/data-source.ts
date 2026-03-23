/**
 * 预估收入偏差 — 数据源开关（与 mock/backend-api 及 fetch* 一一对应）
 *
 * - `true` = Mock（`mock/data.ts`）
 * - `false` = 远程 HTTP
 */
export enum RevenueDeviationEndpoint {
  OverviewKpis = 'overviewKpis',
  OverviewTrend = 'overviewTrend',
  TablePlatform = 'tablePlatform',
  OverviewReason = 'overviewReason',
  OverviewAdvice = 'overviewAdvice',
  OverviewCountryTop10 = 'overviewCountryTop10',
  TableHistory = 'tableHistory',
  TableMatrix = 'tableMatrix'
}

export const REVENUE_DEVIATION_USE_MOCK: Record<RevenueDeviationEndpoint, boolean> = {
  [RevenueDeviationEndpoint.OverviewKpis]: true,
  [RevenueDeviationEndpoint.OverviewTrend]: true,
  [RevenueDeviationEndpoint.TablePlatform]: true,
  [RevenueDeviationEndpoint.OverviewReason]: true,
  [RevenueDeviationEndpoint.OverviewAdvice]: true,
  [RevenueDeviationEndpoint.OverviewCountryTop10]: true,
  [RevenueDeviationEndpoint.TableHistory]: true,
  [RevenueDeviationEndpoint.TableMatrix]: true
}

export function isRevenueDeviationEndpointMock(endpoint: RevenueDeviationEndpoint): boolean {
  return REVENUE_DEVIATION_USE_MOCK[endpoint] === true
}
