/**
 * 收入总览 - 数据源开关（小模块内 config，与 `mock/backend-api` 及 `src/api/business-insight` 1:1）
 *
 * - `RevenueOverviewEndpoint`：每个 `fetchRevenueOverview*` 一个枚举值。
 * - `true` = Mock；`false` = 走 HTTP
 */
export enum RevenueOverviewEndpoint {
  /** 01-meta-filter-options */
  MetaFilterOptions = 'metaFilterOptions',
  /** 02-overview-kpis */
  OverviewKpis = 'overviewKpis',
  /** 03-overview-iaa-ad-type */
  OverviewIaaAdType = 'overviewIaaAdType',
  /** 04-overview-iaa-platform */
  OverviewIaaPlatform = 'overviewIaaPlatform',
  /** 05-overview-iaa-ad-unit */
  OverviewIaaAdUnit = 'overviewIaaAdUnit',
  /** 06-overview-iaa-country */
  OverviewIaaCountry = 'overviewIaaCountry',
  /** 07-overview-iaa-version */
  OverviewIaaVersion = 'overviewIaaVersion',
  /** 08-overview-iap-product */
  OverviewIapProduct = 'overviewIapProduct',
  /** 09-overview-iap-channel */
  OverviewIapChannel = 'overviewIapChannel',
  /** 10-overview-iap-trend */
  OverviewIapTrend = 'overviewIapTrend',
  /** 11-overview-trend-7d-iaa-iap */
  OverviewTrend7dIaaIap = 'overviewTrend7dIaaIap',
  /** 12-overview-trend-7d-ecpm */
  OverviewTrend7dEcpm = 'overviewTrend7dEcpm',
  /** 13-overview-platform-pie */
  OverviewPlatformPie = 'overviewPlatformPie',
  /** 14-overview-top-countries */
  OverviewTopCountries = 'overviewTopCountries',
  /** 15-overview-ai-insight */
  OverviewAiInsight = 'overviewAiInsight',
  /** 16-overview-quality-metrics */
  OverviewQualityMetrics = 'overviewQualityMetrics'
}

export const REVENUE_OVERVIEW_USE_MOCK: Record<RevenueOverviewEndpoint, boolean> = {
  [RevenueOverviewEndpoint.MetaFilterOptions]: false,
  [RevenueOverviewEndpoint.OverviewKpis]: false,
  [RevenueOverviewEndpoint.OverviewIaaAdType]: false,
  [RevenueOverviewEndpoint.OverviewIaaPlatform]: false,
  [RevenueOverviewEndpoint.OverviewIaaAdUnit]: false,
  [RevenueOverviewEndpoint.OverviewIaaCountry]: false,
  [RevenueOverviewEndpoint.OverviewIaaVersion]: false,
  [RevenueOverviewEndpoint.OverviewIapProduct]: false,
  [RevenueOverviewEndpoint.OverviewIapChannel]: false,
  [RevenueOverviewEndpoint.OverviewIapTrend]: false,
  [RevenueOverviewEndpoint.OverviewTrend7dIaaIap]: false,
  [RevenueOverviewEndpoint.OverviewTrend7dEcpm]: false,
  [RevenueOverviewEndpoint.OverviewPlatformPie]: false,
  [RevenueOverviewEndpoint.OverviewTopCountries]: false,
  [RevenueOverviewEndpoint.OverviewAiInsight]: false,
  [RevenueOverviewEndpoint.OverviewQualityMetrics]: false
}

export function isRevenueOverviewEndpointMock(endpoint: RevenueOverviewEndpoint): boolean {
  return REVENUE_OVERVIEW_USE_MOCK[endpoint] === true
}
