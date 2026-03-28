/**
 * 代投分析 - 数据源开关（与 `mock/backend-api` 契约 1:1）
 */
export enum AgencyAnalysisEndpoint {
  MetaFilterOptions = 'metaFilterOptions',
  Overview = 'overview',
  AgencySummary = 'agencySummary',
  CampaignTable = 'campaignTable',
  DailyComparison = 'dailyComparison',
  DonutSpendShare = 'donutSpendShare',
  ChannelDistribution = 'channelDistribution',
  CountryTop8 = 'countryTop8',
  SpendTrend30d = 'spendTrend30d'
}

/** 默认走真实接口；单接口调试可改为 true */
export const AGENCY_ANALYSIS_USE_MOCK: Record<AgencyAnalysisEndpoint, boolean> = {
  [AgencyAnalysisEndpoint.MetaFilterOptions]: false,
  [AgencyAnalysisEndpoint.Overview]: false,
  [AgencyAnalysisEndpoint.AgencySummary]: false,
  [AgencyAnalysisEndpoint.CampaignTable]: false,
  [AgencyAnalysisEndpoint.DailyComparison]: false,
  [AgencyAnalysisEndpoint.DonutSpendShare]: false,
  [AgencyAnalysisEndpoint.ChannelDistribution]: false,
  [AgencyAnalysisEndpoint.CountryTop8]: false,
  [AgencyAnalysisEndpoint.SpendTrend30d]: false
}

export function isAgencyAnalysisMock(endpoint: AgencyAnalysisEndpoint): boolean {
  return AGENCY_ANALYSIS_USE_MOCK[endpoint] === true
}
