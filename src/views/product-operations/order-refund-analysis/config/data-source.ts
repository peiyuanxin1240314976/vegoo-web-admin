/**
 * 订单退款分析 - 数据源开关（小模块内 config，与 mock/backend-api 契约 1:1）
 *
 * - `OrderRefundEndpoint`：每个接口一个枚举值，改 `ORDER_REFUND_USE_MOCK` 对应项即可。
 * - `true` = 使用本地 Mock（`mock/order-refund-analysis-api-mock.ts`）
 * - `false` = 走真实 HTTP
 *
 * 默认全部为 `true`（联调前）；单接口改 `false` 可只接真接口。
 */
export enum OrderRefundEndpoint {
  /** 01-dashboard.json */
  Dashboard = 'dashboard'
}

export const ORDER_REFUND_USE_MOCK: Record<OrderRefundEndpoint, boolean> = {
  [OrderRefundEndpoint.Dashboard]: true
}

export function isOrderRefundEndpointMock(endpoint: OrderRefundEndpoint): boolean {
  return ORDER_REFUND_USE_MOCK[endpoint] === true
}
