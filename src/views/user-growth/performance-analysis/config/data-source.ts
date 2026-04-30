/**
 * 人员绩效：按接口粒度切换 Mock / 远程。
 * - `true`：走 `../mock/performance-analysis-api-mock.ts`
 * - `false`：走 `src/api/user-growth/performance-analysis.ts` 内 `request.post`
 *
 * 读取方：`src/api/user-growth/performance-analysis.ts`
 */

export enum PerformanceAnalysisEndpoint {
  /** 列表页 /user-growth/performance-analysis */
  ListFilterOptions = 'listFilterOptions',
  PerformanceList = 'performanceList',
  OverviewMetrics = 'overviewMetrics',
  /** 对比页 /user-growth/performance-analysis/comparison */
  CompareCandidates = 'compareCandidates',
  ComparisonOverview = 'comparisonOverview',
  ComparisonCharts = 'comparisonCharts',
  ComparisonRankings = 'comparisonRankings',
  ComparisonScoreDetail = 'comparisonScoreDetail',
  ComparisonAlerts = 'comparisonAlerts'
}

export const PERFORMANCE_ANALYSIS_USE_MOCK: Record<PerformanceAnalysisEndpoint, boolean> = {
  [PerformanceAnalysisEndpoint.ListFilterOptions]: false,
  [PerformanceAnalysisEndpoint.PerformanceList]: false,
  [PerformanceAnalysisEndpoint.OverviewMetrics]: false,
  [PerformanceAnalysisEndpoint.CompareCandidates]: false,
  [PerformanceAnalysisEndpoint.ComparisonOverview]: false,
  [PerformanceAnalysisEndpoint.ComparisonCharts]: false,
  [PerformanceAnalysisEndpoint.ComparisonRankings]: false,
  [PerformanceAnalysisEndpoint.ComparisonScoreDetail]: false,
  [PerformanceAnalysisEndpoint.ComparisonAlerts]: false
}

export function isPerformanceAnalysisEndpointMock(endpoint: PerformanceAnalysisEndpoint): boolean {
  return PERFORMANCE_ANALYSIS_USE_MOCK[endpoint]
}
