/**
 * 经营报告 - 数据源开关（与 `mock/backend-api` 契约 1:1）
 *
 * - `BusinessReportReadEndpoint`：每个接口一个枚举值，改 `BUSINESS_REPORT_USE_MOCK` 对应项即可。
 * - `true`  = 使用本地 Mock（`mockData.ts`）
 * - `false` = 走真实 HTTP（`src/api/business-report.ts`，根路径见同目录 `api-base.ts`）
 *
 * 当前默认全部为 `true`（前端自测阶段统一走 Mock）。
 * 需要联调真实接口时，再按接口粒度改为 `false`。
 */

export enum BusinessReportReadEndpoint {
  DailyAppList = 'dailyAppList',
  DailyOverview = 'dailyOverview',
  DailyAdPlatform = 'dailyAdPlatform',
  DailyByCountry = 'dailyByCountry',
  DailyPlatformCountry = 'dailyPlatformCountry',
  DailyCampaigns = 'dailyCampaigns',
  DailyCompareOverview = 'dailyCompareOverview',
  DailyCompareTrends = 'dailyCompareTrends',
  DailyCompareMetrics = 'dailyCompareMetrics',
  WeeklyAppList = 'weeklyAppList',
  WeeklyOverview = 'weeklyOverview',
  WeeklyAdPlatform = 'weeklyAdPlatform',
  WeeklyByCountry = 'weeklyByCountry',
  WeeklyPlatformCountry = 'weeklyPlatformCountry',
  WeeklyCampaigns = 'weeklyCampaigns',
  WeeklyCompareOverview = 'weeklyCompareOverview',
  WeeklyCompareTrends = 'weeklyCompareTrends',
  WeeklyCompareMetrics = 'weeklyCompareMetrics',
  MonthlyAppList = 'monthlyAppList',
  MonthlyOverview = 'monthlyOverview',
  MonthlyAdPlatform = 'monthlyAdPlatform',
  MonthlyByCountry = 'monthlyByCountry',
  MonthlyPlatformCountry = 'monthlyPlatformCountry',
  MonthlyCampaigns = 'monthlyCampaigns',
  MonthlyCompareOverview = 'monthlyCompareOverview',
  MonthlyCompareTrends = 'monthlyCompareTrends',
  MonthlyCompareMetrics = 'monthlyCompareMetrics',
  LarkConfigGet = 'larkConfigGet',
  LarkConfigSave = 'larkConfigSave',
  LarkPushNow = 'larkPushNow'
}

/** 是否对该接口使用 Mock（逐项修改） */
export const BUSINESS_REPORT_USE_MOCK: Record<BusinessReportReadEndpoint, boolean> = {
  [BusinessReportReadEndpoint.DailyAppList]: false,
  [BusinessReportReadEndpoint.DailyOverview]: false,
  [BusinessReportReadEndpoint.DailyAdPlatform]: false,
  [BusinessReportReadEndpoint.DailyByCountry]: false,
  [BusinessReportReadEndpoint.DailyPlatformCountry]: false,
  [BusinessReportReadEndpoint.DailyCampaigns]: false,
  [BusinessReportReadEndpoint.DailyCompareOverview]: false,
  [BusinessReportReadEndpoint.DailyCompareTrends]: false,
  [BusinessReportReadEndpoint.DailyCompareMetrics]: false,
  [BusinessReportReadEndpoint.WeeklyAppList]: false,
  [BusinessReportReadEndpoint.WeeklyOverview]: false,
  [BusinessReportReadEndpoint.WeeklyAdPlatform]: false,
  [BusinessReportReadEndpoint.WeeklyByCountry]: false,
  [BusinessReportReadEndpoint.WeeklyPlatformCountry]: false,
  [BusinessReportReadEndpoint.WeeklyCampaigns]: false,
  [BusinessReportReadEndpoint.WeeklyCompareOverview]: false,
  [BusinessReportReadEndpoint.WeeklyCompareTrends]: false,
  [BusinessReportReadEndpoint.WeeklyCompareMetrics]: false,
  [BusinessReportReadEndpoint.MonthlyAppList]: false,
  [BusinessReportReadEndpoint.MonthlyOverview]: false,
  [BusinessReportReadEndpoint.MonthlyAdPlatform]: false,
  [BusinessReportReadEndpoint.MonthlyByCountry]: false,
  [BusinessReportReadEndpoint.MonthlyPlatformCountry]: false,
  [BusinessReportReadEndpoint.MonthlyCampaigns]: false,
  [BusinessReportReadEndpoint.MonthlyCompareOverview]: false,
  [BusinessReportReadEndpoint.MonthlyCompareTrends]: false,
  [BusinessReportReadEndpoint.MonthlyCompareMetrics]: false,
  [BusinessReportReadEndpoint.LarkConfigGet]: false,
  [BusinessReportReadEndpoint.LarkConfigSave]: false,
  [BusinessReportReadEndpoint.LarkPushNow]: false
}

export function isBusinessReportMock(endpoint: BusinessReportReadEndpoint): boolean {
  return BUSINESS_REPORT_USE_MOCK[endpoint] === true
}
