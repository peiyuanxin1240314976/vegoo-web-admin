/**
 * 代投分析 - 数据源开关（与 `mock/backend-api` 契约 1:1）
 */
export enum AgencyAnalysisEndpoint {
  Overview = 'overview',
  AgencySummary = 'agencySummary',
  CampaignTable = 'campaignTable',
  DailyComparison = 'dailyComparison',
  DonutSpendShare = 'donutSpendShare',
  ChannelDistribution = 'channelDistribution',
  CountryTop8 = 'countryTop8',
  SpendTrend30d = 'spendTrend30d'
}

export const AGENCY_ANALYSIS_USE_MOCK: Record<AgencyAnalysisEndpoint, boolean> = {
  [AgencyAnalysisEndpoint.Overview]: true,
  [AgencyAnalysisEndpoint.AgencySummary]: true,
  [AgencyAnalysisEndpoint.CampaignTable]: true,
  [AgencyAnalysisEndpoint.DailyComparison]: true,
  [AgencyAnalysisEndpoint.DonutSpendShare]: true,
  [AgencyAnalysisEndpoint.ChannelDistribution]: true,
  [AgencyAnalysisEndpoint.CountryTop8]: true,
  [AgencyAnalysisEndpoint.SpendTrend30d]: true
}

export function isAgencyAnalysisMock(endpoint: AgencyAnalysisEndpoint): boolean {
  return AGENCY_ANALYSIS_USE_MOCK[endpoint] === true
}
