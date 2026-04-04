/**
 * 综合分析 - 数据源开关（小模块内 config，与 `mock/backend-api` 契约 **02～08** 对应）
 *
 * - `true` = 使用本地 Mock（`mock/comprehensive-analysis-api-mock.ts`）
 * - `false` = 走真实 HTTP（`src/api/user-growth/comprehensive-analysis.ts` 内 `request.post`）
 *
 * 筛选项 **不在此枚举**：公用 **`GET .../cockpit/meta-filter-options`** 由 `useCockpitMetaFilterStore` 拉取。
 *
 * 当前默认全部为 `true`（离线开发）；联调网关时将对应 endpoint 改为 `false`。
 */
export enum ComprehensiveAnalysisEndpoint {
  /** 02-kpi */
  Kpi = 'kpi',
  /** 03-platform-cpi-bar */
  PlatformCpiBar = 'platformCpiBar',
  /** 04-app-cpi-rank */
  AppCpiRank = 'appCpiRank',
  /** 05-country-distribution */
  CountryDistribution = 'countryDistribution',
  /** 06-alerts */
  Alerts = 'alerts',
  /** 07-platform-cpi-trend */
  PlatformCpiTrend = 'platformCpiTrend',
  /** 08-ecpm-analysis */
  EcpmAnalysis = 'ecpmAnalysis'
}

export const COMPREHENSIVE_ANALYSIS_USE_MOCK: Record<ComprehensiveAnalysisEndpoint, boolean> = {
  [ComprehensiveAnalysisEndpoint.Kpi]: false,
  [ComprehensiveAnalysisEndpoint.PlatformCpiBar]: false,
  [ComprehensiveAnalysisEndpoint.AppCpiRank]: false,
  [ComprehensiveAnalysisEndpoint.CountryDistribution]: false,
  [ComprehensiveAnalysisEndpoint.Alerts]: false,
  [ComprehensiveAnalysisEndpoint.PlatformCpiTrend]: false,
  [ComprehensiveAnalysisEndpoint.EcpmAnalysis]: false
}

export function isComprehensiveAnalysisEndpointMock(
  endpoint: ComprehensiveAnalysisEndpoint
): boolean {
  return COMPREHENSIVE_ANALYSIS_USE_MOCK[endpoint]
}
