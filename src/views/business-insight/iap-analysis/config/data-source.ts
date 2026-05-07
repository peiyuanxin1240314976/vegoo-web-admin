/**
 * IAP 分析 - 数据源开关（小模块内 config，与 `mock/backend-api` 契约 1:1）
 *
 * - `IapAnalysisEndpoint`：每个接口一个枚举值，改 `IAP_ANALYSIS_USE_MOCK` 对应项即可。
 * - `true` = 使用本地 Mock（`views/business-insight/mocks/business-insight-api-mock.ts`）
 * - `false` = 走真实 HTTP
 *
 * 默认全部为 `false`（联调线上）；单接口改 `true` 可只 Mock 该请求。
 */
export enum IapAnalysisEndpoint {
  /** 02-overview-kpi */
  OverviewKpi = 'overviewKpi',
  /** 03-overview-trend */
  OverviewTrend = 'overviewTrend',
  /** 04-overview-app-cards */
  OverviewAppCards = 'overviewAppCards',
  /** 05-overview-country-distribution */
  OverviewCountryDistribution = 'overviewCountryDistribution',
  /** 06-overview-product-type-donut */
  OverviewProductTypeDonut = 'overviewProductTypeDonut',
  /** 07-overview-platform-compare */
  OverviewPlatformCompare = 'overviewPlatformCompare',
  /** 09-detail-kpi */
  DetailKpi = 'detailKpi',
  /** 10-detail-product */
  DetailProduct = 'detailProduct',
  /** 11-detail-user */
  DetailUser = 'detailUser',
  /** 12-detail-trend */
  DetailTrend = 'detailTrend'
}

/** 是否对该接口使用 Mock（逐项修改） */
export const IAP_ANALYSIS_USE_MOCK: Record<IapAnalysisEndpoint, boolean> = {
  [IapAnalysisEndpoint.OverviewKpi]: false,
  [IapAnalysisEndpoint.OverviewTrend]: false,
  [IapAnalysisEndpoint.OverviewAppCards]: false,
  [IapAnalysisEndpoint.OverviewCountryDistribution]: false,
  [IapAnalysisEndpoint.OverviewProductTypeDonut]: false,
  [IapAnalysisEndpoint.OverviewPlatformCompare]: false,
  [IapAnalysisEndpoint.DetailKpi]: false,
  [IapAnalysisEndpoint.DetailProduct]: false,
  [IapAnalysisEndpoint.DetailUser]: false,
  [IapAnalysisEndpoint.DetailTrend]: false
}

export function isIapAnalysisEndpointMock(endpoint: IapAnalysisEndpoint): boolean {
  return IAP_ANALYSIS_USE_MOCK[endpoint] === true
}
