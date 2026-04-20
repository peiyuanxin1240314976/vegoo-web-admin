/**
 * 利润分析（business-insight/profit-analysis）数据源开关（按接口粒度）。
 *
 * - true  表示走 Mock（实现见 `src/views/business-insight/profit-analysis/mock/profit-analysis-api-mock.ts`）
 * - false 表示走远程接口（实现见 `src/api/business-insight.ts` 的 fetchProfit*）
 */

export enum ProfitAnalysisEndpoint {
  MetaFilterOptions = 'MetaFilterOptions',
  OverviewKpi = 'OverviewKpi',
  TableAppProfit = 'TableAppProfit',
  OverviewCountryProfit = 'OverviewCountryProfit',
  OverviewTrend30d = 'OverviewTrend30d',
  OverviewSankey = 'OverviewSankey'
}

// 默认全部走 Mock，便于页面开发与性能验证
const PROFIT_ANALYSIS_MOCK: Record<ProfitAnalysisEndpoint, boolean> = {
  [ProfitAnalysisEndpoint.MetaFilterOptions]: true,
  [ProfitAnalysisEndpoint.OverviewKpi]: true,
  [ProfitAnalysisEndpoint.TableAppProfit]: true,
  [ProfitAnalysisEndpoint.OverviewCountryProfit]: true,
  [ProfitAnalysisEndpoint.OverviewTrend30d]: true,
  [ProfitAnalysisEndpoint.OverviewSankey]: true
}

export function isProfitAnalysisEndpointMock(endpoint: ProfitAnalysisEndpoint) {
  return !!PROFIT_ANALYSIS_MOCK[endpoint]
}
