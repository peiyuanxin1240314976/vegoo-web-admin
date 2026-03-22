/**
 * 我的绩效 - 数据源开关（小模块内 config，与 `mock/backend-api` 契约 1:1）
 *
 * - `true` = 使用本地 Mock（`views/user-growth/my-performance/mock/my-performance-api-mock.ts`）
 * - `false` = 走真实 HTTP（`src/api/user-growth/my-performance.ts` 内 `MY_PERFORMANCE_BASE`）
 *
 * 默认全部为 `false`，统一走线上 HTTP；本地调试可将对应项改为 `true`。
 */
export enum MyPerformanceEndpoint {
  /** 01-meta-person-options */
  MetaPersonOptions = 'metaPersonOptions',
  /** 02-meta-period-options */
  MetaPeriodOptions = 'metaPeriodOptions',
  /** 03-overview-kpi */
  OverviewKpi = 'overviewKpi',
  /** 04-kpi-achievement */
  KpiAchievement = 'kpiAchievement',
  /** 05-roi-trend */
  RoiTrend = 'roiTrend',
  /** 06-spend-progress */
  SpendProgress = 'spendProgress',
  /** 07-app-dimension-table */
  AppDimensionTable = 'appDimensionTable',
  /** 08-performance-history */
  PerformanceHistory = 'performanceHistory'
}

export const MY_PERFORMANCE_USE_MOCK: Record<MyPerformanceEndpoint, boolean> = {
  [MyPerformanceEndpoint.MetaPersonOptions]: false,
  [MyPerformanceEndpoint.MetaPeriodOptions]: false,
  [MyPerformanceEndpoint.OverviewKpi]: false,
  [MyPerformanceEndpoint.KpiAchievement]: false,
  [MyPerformanceEndpoint.RoiTrend]: false,
  [MyPerformanceEndpoint.SpendProgress]: false,
  [MyPerformanceEndpoint.AppDimensionTable]: false,
  [MyPerformanceEndpoint.PerformanceHistory]: false
}

export function isMyPerformanceEndpointMock(endpoint: MyPerformanceEndpoint): boolean {
  return MY_PERFORMANCE_USE_MOCK[endpoint]
}
