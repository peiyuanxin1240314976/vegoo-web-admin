/**
 * 评论与评分监控 - 数据源开关（小模块内 config，与 mock/backend-api 契约 1:1）
 *
 * - `ReviewMonitorEndpoint`：每个接口一个枚举值，改 `REVIEW_MONITOR_USE_MOCK` 对应项即可。
 * - `true` = 使用本地 Mock（`views/product-operations/reviews-ratings-monitor/mocks/review-monitor-api-mock.ts`）
 * - `false` = 走真实 HTTP
 *
 * 默认全部为 `true`（联调前）；单接口改 `false` 可只接真接口。
 */
export enum ReviewMonitorEndpoint {
  /** 01-overview-summary.json */
  OverviewSummary = 'overviewSummary',
  /** 02-table-list.json */
  TableList = 'tableList',
  /** 03-reply-action.json */
  ReplyAction = 'replyAction',
  /** 04-auto-reply.json */
  AutoReply = 'autoReply',
  /** 05-templates.json */
  Templates = 'templates'
}

/** 是否对该接口使用 Mock（逐项修改） */
export const REVIEW_MONITOR_USE_MOCK: Record<ReviewMonitorEndpoint, boolean> = {
  [ReviewMonitorEndpoint.OverviewSummary]: true,
  [ReviewMonitorEndpoint.TableList]: true,
  [ReviewMonitorEndpoint.ReplyAction]: true,
  [ReviewMonitorEndpoint.AutoReply]: true,
  [ReviewMonitorEndpoint.Templates]: true
}

export function isReviewMonitorEndpointMock(endpoint: ReviewMonitorEndpoint): boolean {
  return REVIEW_MONITOR_USE_MOCK[endpoint] === true
}
