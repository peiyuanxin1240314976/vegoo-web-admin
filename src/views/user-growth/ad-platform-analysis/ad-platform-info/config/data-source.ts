/**
 * 广告平台信息 - 数据源开关（与 `mock/backend-api` 契约 1:1，按模块拆分）
 *
 * - `true`  = 该接口使用本地 Mock（`../mock/ad-platform-info-api-mock.ts`，与契约 `sampleResponse` 同形）
 * - `false` = 走真实 HTTP（`src/api/user-growth/ad-platform-info.ts` 内对应 `fetch*`）
 *
 * `src/api/user-growth/ad-platform-info.ts` 按枚举项调用 `isAdPlatformInfoMock(endpoint)` 分支。
 *
 * @see 路由 `/user-growth/ad-platform-analysis/ad-platform-info`
 */

/* ── 广告平台信息详情（单页多区块，每区块对应一接口）──────────────── */

export enum AdPlatformInfoEndpoint {
  /** 顶部摘要 + 数据更新时间 */
  PlatformSummary = 'platform-summary',
  /** KPI 卡片栅格 */
  KpiCards = 'kpi-cards',
  /** ROI 地图散点 */
  RoiMapPoints = 'roi-map-points',
  /** 国家 Top10 */
  CountryTop10 = 'country-top10',
  /** 留存热力图 */
  RetentionHeatmap = 'retention-heatmap',
  /** 转化漏斗 */
  ConversionFunnel = 'conversion-funnel',
  /** 核心指标趋势图 */
  TrendChart = 'trend-chart',
  /** 广告系列明细表 */
  CampaignTable = 'campaign-table'
}

export const AD_PLATFORM_INFO_USE_MOCK: Record<AdPlatformInfoEndpoint, boolean> = {
  [AdPlatformInfoEndpoint.PlatformSummary]: false,
  [AdPlatformInfoEndpoint.KpiCards]: false,
  [AdPlatformInfoEndpoint.RoiMapPoints]: false,
  [AdPlatformInfoEndpoint.CountryTop10]: false,
  [AdPlatformInfoEndpoint.RetentionHeatmap]: false,
  [AdPlatformInfoEndpoint.ConversionFunnel]: false,
  [AdPlatformInfoEndpoint.TrendChart]: false,
  [AdPlatformInfoEndpoint.CampaignTable]: false
}

export function isAdPlatformInfoMock(endpoint: AdPlatformInfoEndpoint): boolean {
  return AD_PLATFORM_INFO_USE_MOCK[endpoint] !== false
}
