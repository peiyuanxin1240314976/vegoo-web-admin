/**
 * 实时数据（`/user-growth/real-time-data`）— 数据源开关，与 `mock/backend-api/*.json` 契约 1:1。
 *
 * - `true`：走本地 Mock（`views/user-growth/real-time-data/mock/real-time-data-api-mock.ts`）
 * - `false`：`src/api/user-growth/real-time-data.ts` 使用 `request.post` 访问数据中心分析网关
 *
 * 默认全部为 `true`（后端未就绪时本地可跑通）；联调将对应项改为 `false`。
 *
 * `src/api/user-growth/real-time-data.ts` 通过 `isRealtimeDataEndpointMock()` 读取本表。
 */

/** ---------- 单页：概览 + 表 + 详情弹窗 + 底部图 ---------- */
export enum RealtimeDataEndpoint {
  /** 01-meta-filter-options */
  MetaFilterOptions = 'metaFilterOptions',
  /** 02-overview-kpi-summary */
  OverviewKpiSummary = 'overviewKpiSummary',
  /** 03-table-app-cards */
  TableAppCards = 'tableAppCards',
  /** 04-app-detail */
  AppDetail = 'appDetail',
  /** 05-overview-hourly-spend-comparison */
  OverviewHourlySpendComparison = 'overviewHourlySpendComparison'
}

export const REALTIME_DATA_USE_MOCK: Record<RealtimeDataEndpoint, boolean> = {
  [RealtimeDataEndpoint.MetaFilterOptions]: true,
  [RealtimeDataEndpoint.OverviewKpiSummary]: true,
  [RealtimeDataEndpoint.TableAppCards]: true,
  [RealtimeDataEndpoint.AppDetail]: true,
  [RealtimeDataEndpoint.OverviewHourlySpendComparison]: true
}

export function isRealtimeDataEndpointMock(endpoint: RealtimeDataEndpoint): boolean {
  return REALTIME_DATA_USE_MOCK[endpoint]
}
