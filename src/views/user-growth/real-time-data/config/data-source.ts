/**
 * 实时数据（`/user-growth/real-time-data`）— 数据源开关，与 `mock/backend-api/*.json` 契约 1:1。
 *
 * - `true`：走本地 Mock（`views/user-growth/real-time-data/mock/real-time-data-api-mock.ts`）
 * - `false`：`src/api/user-growth/real-time-data.ts` 使用 `request.post` 访问数据中心分析网关
 *
 * 默认全部为 `true`（后端未就绪时本地可跑通）；联调将对应项改为 `false`。
 *
 * `src/api/user-growth/real-time-data.ts` 通过 `isRealtimeDataEndpointMock()` 读取本表。
 *
 * 筛选项（meta-filter-options）不在此枚举：请使用 `comprehensive-analysis` 模块的 `fetchComprehensiveAnalysisFilterOptions`
 * 与 `views/user-growth/comprehensive-analysis/config/data-source.ts`。
 */

/** ---------- 单页：概览 + 表 + 详情弹窗 + 底部图（共 4 个数据接口） ---------- */
export enum RealtimeDataEndpoint {
  /** 01-overview-kpi-summary */
  OverviewKpiSummary = 'overviewKpiSummary',
  /** 02-table-app-cards */
  TableAppCards = 'tableAppCards',
  /** 03-app-detail */
  AppDetail = 'appDetail',
  /** 04-overview-hourly-spend-comparison */
  OverviewHourlySpendComparison = 'overviewHourlySpendComparison'
}

export const REALTIME_DATA_USE_MOCK: Record<RealtimeDataEndpoint, boolean> = {
  [RealtimeDataEndpoint.OverviewKpiSummary]: true,
  [RealtimeDataEndpoint.TableAppCards]: true,
  [RealtimeDataEndpoint.AppDetail]: true,
  [RealtimeDataEndpoint.OverviewHourlySpendComparison]: true
}

export function isRealtimeDataEndpointMock(endpoint: RealtimeDataEndpoint): boolean {
  return REALTIME_DATA_USE_MOCK[endpoint]
}
