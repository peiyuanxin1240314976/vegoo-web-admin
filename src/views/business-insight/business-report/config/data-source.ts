/**
 * 经营报告 - 数据源开关（与 `mock/backend-api` 契约 1:1）
 *
 * - `BusinessReportEndpoint`：每个接口一个枚举值，改 `BUSINESS_REPORT_USE_MOCK` 对应项即可。
 * - `true`  = 使用本地 Mock（`mockData.ts`）
 * - `false` = 走真实 HTTP（`reportService.ts` 中的 `request` / `post`）
 *
 * 默认全部为 `true`（开发阶段 Mock）；后端接口就绪后逐项改为 `false`。
 */

export enum BusinessReportEndpoint {
  /** 01-summary — 汇总表（KPI 卡片 / 用户指标 / ROI / 留存 / 费用抄扣） */
  Summary = 'summary',
  /** 02-ad-platform — 广告平台卡片列表 */
  AdPlatform = 'adPlatform',
  /** 03-by-country — 分国家汇总表 */
  ByCountry = 'byCountry',
  /** 04-platform-country — 广告平台分国家（树形 + 平铺双格式） */
  PlatformCountry = 'platformCountry',
  /** 05-campaigns — 在投广告系列表 */
  Campaigns = 'campaigns',
  /** 06-lark-config-get — 读取飞书推送配置 */
  LarkConfigGet = 'larkConfigGet',
  /** 07-lark-config-save — 保存飞书推送配置 */
  LarkConfigSave = 'larkConfigSave',
  /** 08-lark-push-now — 立即推送一次 */
  LarkPushNow = 'larkPushNow'
}

/** 是否对该接口使用 Mock（逐项修改） */
export const BUSINESS_REPORT_USE_MOCK: Record<BusinessReportEndpoint, boolean> = {
  [BusinessReportEndpoint.Summary]: true,
  [BusinessReportEndpoint.AdPlatform]: true,
  [BusinessReportEndpoint.ByCountry]: true,
  [BusinessReportEndpoint.PlatformCountry]: true,
  [BusinessReportEndpoint.Campaigns]: true,
  [BusinessReportEndpoint.LarkConfigGet]: true,
  [BusinessReportEndpoint.LarkConfigSave]: true,
  [BusinessReportEndpoint.LarkPushNow]: true
}

export function isBusinessReportMock(endpoint: BusinessReportEndpoint): boolean {
  return BUSINESS_REPORT_USE_MOCK[endpoint] === true
}
