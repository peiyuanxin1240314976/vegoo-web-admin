/**
 * 广告平台分析大屏 - 数据源开关（与 `mock/backend-api/01-06*.json` 契约 1:1）
 *
 * - `true`  = 该接口使用本地 Mock（`../mock.ts` 作为源数据）
 * - `false` = 走真实 HTTP（`src/api/user-growth/ad-platform-analysis.ts` 内对应 `fetch*`）
 */
export enum AdPlatformAnalysisEndpoint {
  FiltersMeta = 'filters-meta',
  KpiCards = 'kpi-cards',
  RoiTrend = 'roi-trend',
  QualityHeatmap = 'quality-heatmap',
  CampaignTop10 = 'campaign-top10',
  MetricsTable = 'metrics-table'
}

export const AD_PLATFORM_ANALYSIS_USE_MOCK: Record<AdPlatformAnalysisEndpoint, boolean> = {
  [AdPlatformAnalysisEndpoint.FiltersMeta]: false,
  [AdPlatformAnalysisEndpoint.KpiCards]: false,
  [AdPlatformAnalysisEndpoint.RoiTrend]: false,
  [AdPlatformAnalysisEndpoint.QualityHeatmap]: false,
  [AdPlatformAnalysisEndpoint.CampaignTop10]: false,
  [AdPlatformAnalysisEndpoint.MetricsTable]: false
}

export function isAdPlatformAnalysisMock(endpoint: AdPlatformAnalysisEndpoint): boolean {
  return AD_PLATFORM_ANALYSIS_USE_MOCK[endpoint] !== false
}
