/**
 * 广告平台信息 - 数据源开关（与 `mock/backend-api` 契约 1:1，按模块拆分）
 *
 * - `true`  = 使用本地 Mock（`../mock/index.ts` 聚合数据）
 * - `false` = 走真实 HTTP（`src/api/user-growth/` 内与各 `fetch*` 一一对应）
 */

export enum AdPlatformInfoEndpoint {
  PlatformSummary = 'platform-summary',
  KpiCards = 'kpi-cards',
  RoiMapPoints = 'roi-map-points',
  CountryTop10 = 'country-top10',
  RetentionHeatmap = 'retention-heatmap',
  ConversionFunnel = 'conversion-funnel',
  TrendChart = 'trend-chart',
  CampaignTable = 'campaign-table'
}

export const AD_PLATFORM_INFO_USE_MOCK: Record<AdPlatformInfoEndpoint, boolean> = {
  [AdPlatformInfoEndpoint.PlatformSummary]: true,
  [AdPlatformInfoEndpoint.KpiCards]: true,
  [AdPlatformInfoEndpoint.RoiMapPoints]: true,
  [AdPlatformInfoEndpoint.CountryTop10]: true,
  [AdPlatformInfoEndpoint.RetentionHeatmap]: true,
  [AdPlatformInfoEndpoint.ConversionFunnel]: true,
  [AdPlatformInfoEndpoint.TrendChart]: true,
  [AdPlatformInfoEndpoint.CampaignTable]: true
}

export function isAdPlatformInfoMock(endpoint: AdPlatformInfoEndpoint): boolean {
  return AD_PLATFORM_INFO_USE_MOCK[endpoint] !== false
}
