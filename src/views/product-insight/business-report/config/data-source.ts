/**
 * 经营报告 - 数据源开关（与 `mock/backend-api` 契约 1:1）
 *
 * - `BusinessReportEndpoint`：每个接口一个枚举值，改 `BUSINESS_REPORT_USE_MOCK` 对应项即可。
 * - `true`  = 使用本地 Mock（`mockData.ts`）
 * - `false` = 走真实 HTTP（`src/api/business-report.ts`，根路径见同目录 `api-base.ts`）
 *
 * 默认全部为 `false`（对接后端）；本地可逐项改为 `true` 使用 `mockData.ts`。
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
  [BusinessReportEndpoint.Summary]: false,
  [BusinessReportEndpoint.AdPlatform]: false,
  [BusinessReportEndpoint.ByCountry]: false,
  [BusinessReportEndpoint.PlatformCountry]: false,
  [BusinessReportEndpoint.Campaigns]: false,
  [BusinessReportEndpoint.LarkConfigGet]: false,
  [BusinessReportEndpoint.LarkConfigSave]: false,
  [BusinessReportEndpoint.LarkPushNow]: false
}

export function isBusinessReportMock(endpoint: BusinessReportEndpoint): boolean {
  return BUSINESS_REPORT_USE_MOCK[endpoint] === true
}
