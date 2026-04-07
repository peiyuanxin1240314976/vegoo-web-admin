/**
 * 广告平台详情（父页）数据源开关（与 mock/backend-api 契约 1:1）
 *
 * - true: 使用本地 Mock 数据
 * - false: 走真实 HTTP 接口
 *
 * 说明：当前页面仍在静态 mock 阶段，默认全部开启 mock。
 */
export enum AdPlatformDetailEndpoint {
  /** 01-overview-kpis.json */
  OverviewKpis = 'overviewKpis',
  /** 02-overview-trend.json */
  OverviewTrend = 'overviewTrend',
  /** 03-table-apps.json */
  TableApps = 'tableApps',
  /** 04-ai-insights.json */
  AiInsights = 'aiInsights'
}

export const AD_PLATFORM_DETAIL_USE_MOCK: Record<AdPlatformDetailEndpoint, boolean> = {
  [AdPlatformDetailEndpoint.OverviewKpis]: false,
  [AdPlatformDetailEndpoint.OverviewTrend]: false,
  [AdPlatformDetailEndpoint.TableApps]: false,
  [AdPlatformDetailEndpoint.AiInsights]: false
}

export function isAdPlatformDetailEndpointMock(endpoint: AdPlatformDetailEndpoint): boolean {
  return AD_PLATFORM_DETAIL_USE_MOCK[endpoint] === true
}
