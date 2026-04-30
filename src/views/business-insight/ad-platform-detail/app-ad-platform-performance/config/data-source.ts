/**
 * 应用内广告平台表现（子页）数据源开关（与 mock/backend-api 契约 1:1）
 *
 * - true: 使用本地 Mock 数据
 * - false: 走真实 HTTP 接口
 *
 * 说明：当前页面仍在静态 mock 阶段，默认全部开启 mock。
 */
export enum AppAdPlatformPerformanceEndpoint {
  /** 01-overview-kpis.json */
  OverviewKpis = 'overviewKpis',
  /** 02-overview-trend.json */
  OverviewTrend = 'overviewTrend',
  /** 03-waterfall.json */
  Waterfall = 'waterfall',
  /** 04-table-ad-units.json */
  TableAdUnits = 'tableAdUnits',
  /** 05-ai-insights.json */
  AiInsights = 'aiInsights'
}

export const APP_AD_PLATFORM_PERFORMANCE_USE_MOCK: Record<
  AppAdPlatformPerformanceEndpoint,
  boolean
> = {
  [AppAdPlatformPerformanceEndpoint.OverviewKpis]: false,
  [AppAdPlatformPerformanceEndpoint.OverviewTrend]: false,
  [AppAdPlatformPerformanceEndpoint.Waterfall]: false,
  [AppAdPlatformPerformanceEndpoint.TableAdUnits]: false,
  [AppAdPlatformPerformanceEndpoint.AiInsights]: false
}

export function isAppAdPlatformPerformanceEndpointMock(
  endpoint: AppAdPlatformPerformanceEndpoint
): boolean {
  return APP_AD_PLATFORM_PERFORMANCE_USE_MOCK[endpoint] === true
}
