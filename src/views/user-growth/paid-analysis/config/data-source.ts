/**
 * 付费分析 `/user-growth/paid-analysis` 数据源开关。
 *
 * - `true`：走本地 Mock（需在 `src/api/user-growth/paid-analysis.ts` 内实现对应分支）。
 * - `false`：`request.post` 真实网关。
 *
 * 契约：`../mock/backend-api/` **根目录** `*.json`（扁平，无子文件夹；命名见该目录 `README.md`）。**公用顶栏**见 README 附录 A + `@/api/cockpit-meta-filter`。
 */

/** 按 Tab 拆分的查询接口（channel Tab 再按 UI 块拆 overview / tables / charts） */
export enum PaidAnalysisTabEndpoints {
  TabChannelOverview = 'tab-channel-overview',
  TabChannelTables = 'tab-channel-tables',
  TabChannelCharts = 'tab-channel-charts',
  TabProductOverview = 'tab-product-overview',
  TabProductRanking = 'tab-product-ranking',
  TabProductCharts = 'tab-product-charts',
  TabOrderSummary = 'tab-order-summary'
}

/** 订单明细：列表与详情 */
export enum PaidAnalysisOrderEndpoints {
  OrderList = 'table-order-list',
  OrderDetail = 'order-detail'
}

/** 导出等写类能力 */
export enum PaidAnalysisExportEndpoints {
  ExportOrders = 'export-orders'
}

export const paidAnalysisTabMock: Record<PaidAnalysisTabEndpoints, boolean> = {
  [PaidAnalysisTabEndpoints.TabChannelOverview]: false,
  [PaidAnalysisTabEndpoints.TabChannelTables]: false,
  [PaidAnalysisTabEndpoints.TabChannelCharts]: false,
  [PaidAnalysisTabEndpoints.TabProductOverview]: false,
  [PaidAnalysisTabEndpoints.TabProductRanking]: false,
  [PaidAnalysisTabEndpoints.TabProductCharts]: false,
  [PaidAnalysisTabEndpoints.TabOrderSummary]: false
}

export const paidAnalysisOrderMock: Record<PaidAnalysisOrderEndpoints, boolean> = {
  [PaidAnalysisOrderEndpoints.OrderList]: false,
  [PaidAnalysisOrderEndpoints.OrderDetail]: false
}

export const paidAnalysisExportMock: Record<PaidAnalysisExportEndpoints, boolean> = {
  [PaidAnalysisExportEndpoints.ExportOrders]: false
}

export function isPaidAnalysisTabEndpointMock(key: PaidAnalysisTabEndpoints): boolean {
  return paidAnalysisTabMock[key]
}

export function isPaidAnalysisOrderEndpointMock(key: PaidAnalysisOrderEndpoints): boolean {
  return paidAnalysisOrderMock[key]
}

export function isPaidAnalysisExportEndpointMock(key: PaidAnalysisExportEndpoints): boolean {
  return paidAnalysisExportMock[key]
}
