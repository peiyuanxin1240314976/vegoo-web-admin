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
  DailyOverview = 'dailyOverview',
  DailyAdPlatform = 'dailyAdPlatform',
  DailyByCountry = 'dailyByCountry',
  DailyPlatformCountry = 'dailyPlatformCountry',
  DailyCampaigns = 'dailyCampaigns',
  DailyCompareOverview = 'dailyCompareOverview',
  DailyCompareTrends = 'dailyCompareTrends',
  DailyCompareMetrics = 'dailyCompareMetrics',
  WeeklyOverview = 'weeklyOverview',
  WeeklyAdPlatform = 'weeklyAdPlatform',
  WeeklyByCountry = 'weeklyByCountry',
  WeeklyPlatformCountry = 'weeklyPlatformCountry',
  WeeklyCampaigns = 'weeklyCampaigns',
  WeeklyCompareOverview = 'weeklyCompareOverview',
  WeeklyCompareTrends = 'weeklyCompareTrends',
  WeeklyCompareMetrics = 'weeklyCompareMetrics',
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
  [BusinessReportReadEndpoint.DailyOverview]: true,
  [BusinessReportReadEndpoint.DailyAdPlatform]: true,
  [BusinessReportReadEndpoint.DailyByCountry]: true,
  [BusinessReportReadEndpoint.DailyPlatformCountry]: true,
  [BusinessReportReadEndpoint.DailyCampaigns]: true,
  [BusinessReportReadEndpoint.DailyCompareOverview]: true,
  [BusinessReportReadEndpoint.DailyCompareTrends]: true,
  [BusinessReportReadEndpoint.DailyCompareMetrics]: true,
  [BusinessReportReadEndpoint.WeeklyOverview]: true,
  [BusinessReportReadEndpoint.WeeklyAdPlatform]: true,
  [BusinessReportReadEndpoint.WeeklyByCountry]: true,
  [BusinessReportReadEndpoint.WeeklyPlatformCountry]: true,
  [BusinessReportReadEndpoint.WeeklyCampaigns]: true,
  [BusinessReportReadEndpoint.WeeklyCompareOverview]: true,
  [BusinessReportReadEndpoint.WeeklyCompareTrends]: true,
  [BusinessReportReadEndpoint.WeeklyCompareMetrics]: true,
  [BusinessReportReadEndpoint.MonthlyOverview]: true,
  [BusinessReportReadEndpoint.MonthlyAdPlatform]: true,
  [BusinessReportReadEndpoint.MonthlyByCountry]: true,
  [BusinessReportReadEndpoint.MonthlyPlatformCountry]: true,
  [BusinessReportReadEndpoint.MonthlyCampaigns]: true,
  [BusinessReportReadEndpoint.MonthlyCompareOverview]: true,
  [BusinessReportReadEndpoint.MonthlyCompareTrends]: true,
  [BusinessReportReadEndpoint.MonthlyCompareMetrics]: true,
  [BusinessReportReadEndpoint.LarkConfigGet]: true,
  [BusinessReportReadEndpoint.LarkConfigSave]: true,
  [BusinessReportReadEndpoint.LarkPushNow]: true
}

export function isBusinessReportMock(endpoint: BusinessReportReadEndpoint): boolean {
  return BUSINESS_REPORT_USE_MOCK[endpoint] === true
}
