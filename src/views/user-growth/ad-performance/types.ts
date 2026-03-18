/**
 * 广告成效页数据类型（Mock 阶段，后续对接真实 API 可复用）
 */

/** 日期筛选选项 */
export type AdPerformanceDateRange = 'today' | 'yesterday' | 'last7d' | 'month'

/** 筛选参数 */
export interface AdPerformanceFilter {
  dateRange: AdPerformanceDateRange
  app?: string
  adPlatform?: string
  account?: string
  country?: string
}

/** 单条 KPI 卡片 */
export interface AdPerformanceKpi {
  type: string
  label: string
  value: string
  sub?: string
  compare?: string
  compareUp?: boolean
  /** 预警类卡片（如异常系列） */
  alert?: boolean
}

/** 花费趋势点 */
export interface SpendTrendItem {
  date: string
  value: number
}

/** 7日 ROI 趋势点 */
export interface Roi7dTrendItem {
  date: string
  roi: number
}

/** 广告平台分布项（环形图） */
export interface ChannelDistributionItem {
  name: string
  value: number
  percent: number
}

/** 应用分布项（柱状图） */
export interface AppDistributionItem {
  appName: string
  spend: number
  percent: number
  /** 预留字段：后续若需要按应用维度展示投放师占比 */
  ownerShare?: number
}

/** 投放师占比分布项（列表） */
export interface OwnerShareDistributionItem {
  ownerName: string
  percent: number
  spend: number
}

/** 广告系列/广告组行状态 */
export type CampaignRowStatus = 'active' | 'over_budget' | 'low_efficiency' | 'paused'

/** 广告系列明细树行（支持 children 为广告组） */
export interface AdPerformanceCampaignRow {
  id: string
  /** 应用名 */
  appName: string
  /** 广告系列名称或广告组名称 */
  name: string
  /** 广告平台：google | facebook | tiktok | mintegral | kwai | meta */
  channel: string
  /** 国家代码或名称 */
  country: string
  status: CampaignRowStatus
  spend: number
  budget: number
  /** 花费/预算百分比 */
  spendBudgetPercent: number
  cpi: number
  ctr: number
  cvr: number
  roi1: number
  roi7: number
  /** 预估利润，可正可负 */
  estimatedProfit: number
  children?: AdPerformanceCampaignRow[]
}

/** 按国家地区：单行（平铺） */
export interface AdPerformanceCountryRow {
  id: string
  /** 国家代码，如 US */
  country: string
  /** 广告支出 */
  spend: number
  /** 支出占比（0-100） */
  spendSharePercent: number
  cpi: number
  ctr: number
  cvr: number
  roi1: number
  roi3: number
  roi7: number
  /** 累计 ROI */
  roiTotal: number
  estimatedProfit: number
}

/** 优化师职级（截图里显示“初级/中级/高级投放师”等） */
export type OwnerLevel = 'junior' | 'mid' | 'senior'

/** 按投放优化师：子行（广告系列） */
export interface AdPerformanceOwnerCampaignRow {
  id: string
  /** 广告系列名称 */
  campaignName: string
  channel: string
  country: string
  status: CampaignRowStatus
  spend: number
  cpi: number
  ctr: number
  cvr: number
  roi1: number
  roi7: number
  estimatedProfit: number
}

/** 按投放优化师：父行（优化师汇总，可展开） */
export interface AdPerformanceOwnerRow {
  id: string
  ownerName: string
  level: OwnerLevel
  /** 负责应用数 */
  appCount: number
  /** 广告支出 */
  spend: number
  /** 活跃系列数 */
  activeCampaignCount: number
  avgCpi: number
  avgCtr: number
  avgCvr: number
  roi1: number
  roi7: number
  estimatedProfit: number
  children?: AdPerformanceOwnerCampaignRow[]
}

/** 按投放优化师：团队汇总条 */
export interface OwnerTeamSummary {
  totalSpend: number
  avgCpi: number
  avgRoi1: number
  avgCvr: number
  estimatedProfit: number
}

/** 广告账户状态（截图里有“充足/低余额/余额不足/超预算”等） */
export type AdAccountStatus = 'sufficient' | 'low_balance' | 'insufficient' | 'over_budget'

/** 按广告账户：子行（广告系列） */
export interface AdPerformanceAccountCampaignRow {
  id: string
  campaignName: string
  channel: string
  country: string
  status: CampaignRowStatus
  spend: number
  cpi: number
  ctr: number
  cvr: number
  roi1: number
  roi7: number
  estimatedProfit: number
}

/** 按广告账户：父行（账户汇总，可展开） */
export interface AdPerformanceAccountRow {
  id: string
  accountName: string
  platform: string
  balance: number
  status: AdAccountStatus
  spend: number
  /** 预算进度（0-100） */
  budgetProgressPercent: number
  activeCampaignCount: number
  avgCpi: number
  avgCtr: number
  avgCvr: number
  roi1: number
  roi7: number
  estimatedProfit: number
  children?: AdPerformanceAccountCampaignRow[]
}

/** 按广告账户：账户汇总条 */
export interface AccountSummary {
  totalSpend: number
  avgCpi: number
  lowBalanceAccountCount: number
  overBudgetAccountCount: number
  estimatedProfit: number
}

/** 异常预警项 */
export interface AdPerformanceAlertItem {
  id: string
  /** 系列标识（如 PhoneTracker_CA_TikTok） */
  title: string
  /** 预警文案（如 超预算96%） */
  desc: string
  /** 操作类型：pause | view | optimize */
  actionType: 'pause' | 'view' | 'optimize'
}

/** 表格分页 */
export interface AdPerformancePagination {
  current: number
  size: number
  total: number
}

/** 广告成效页完整 Mock 数据结构 */
export interface AdPerformanceMock {
  /** 实时数据截止时间 HH:mm:ss */
  dataTime: string
  filter: AdPerformanceFilter
  kpi: AdPerformanceKpi[]
  spendTrend: SpendTrendItem[]
  roi7dTrend: Roi7dTrendItem[]
  channelDistribution: ChannelDistributionItem[]
  appDistribution: AppDistributionItem[]
  ownerShareDistribution: OwnerShareDistributionItem[]
  campaignTableRows: AdPerformanceCampaignRow[]
  countryTableRows: AdPerformanceCountryRow[]
  ownerTableRows: AdPerformanceOwnerRow[]
  ownerTeamSummary: OwnerTeamSummary
  accountTableRows: AdPerformanceAccountRow[]
  accountSummary: AccountSummary
  alerts: AdPerformanceAlertItem[]
  pagination: AdPerformancePagination
}

/** =========================
 *  详情抽屉（Campaign Detail）
 *  ========================= */

export type AdPerformanceDetailDimension = 'adGroup' | 'date' | 'country'

export interface AdPerformanceDetailHeader {
  title: string
  /** 激活/暂停/超预算等（展示用） */
  statusText: string
}

export interface AdPerformanceDetailTopKpi {
  totalSpend: number
  cpi: number
  roi1: number
  budgetProgressPercent: number
}

export interface AdPerformanceDetailRoiSummary {
  roi1: number
  roi3: number
  roi7: number
  roiTotal: number
  estimatedProfit: number
}

export interface AdPerformanceDetailAdGroupRow {
  id: string
  name: string
  statusText: string
  spend: number
  cpi: number
  ctr: number
  cvr: number
  roi1: number
  roiTotal: number
  actionText?: string
}

export interface AdPerformanceDetailSpendDistributionItem {
  name: string
  percent: number
}

export interface AdPerformanceDetailQuickMetricCard {
  title: string
  value: string
  sub?: string
  tone?: 'success' | 'warning' | 'danger' | 'info'
}

export interface AdPerformanceDetailAdGroupTabData {
  marketSummaryText: string
  sortHintText: string
  adGroups: AdPerformanceDetailAdGroupRow[]
  spendDistribution: AdPerformanceDetailSpendDistributionItem[]
  quickCards: AdPerformanceDetailQuickMetricCard[]
  insightTitle: string
  insightText: string
}

export type AdPerformanceDetailDateRange = 'last7d' | 'last14d' | 'month'

export interface AdPerformanceDetailTrendPoint {
  date: string
  /** 消耗（左轴） */
  spend?: number
  /** 首日ROI（右轴） */
  roi1?: number
  /** CPI */
  cpi?: number
}

export interface AdPerformanceDetailDailyRow {
  date: string
  spend: number
  cpi: number
  ctr: number
  cvr: number
  roi1: number
  wowPercent: number
  statusText: string
}

export interface AdPerformanceDetailDateTabData {
  range: AdPerformanceDetailDateRange
  spendRoiTrend: AdPerformanceDetailTrendPoint[]
  cpiTrend: AdPerformanceDetailTrendPoint[]
  dailyRows: AdPerformanceDetailDailyRow[]
  roiTarget: number
  cpiTarget: number
}

export interface AdPerformanceDetailCountrySpendRow {
  countryCode: string
  countryName: string
  spend: number
  percent: number
  cpi: number
}

export interface AdPerformanceDetailMarketRow {
  countryCode: string
  countryName: string
  spend: number
  cpi: number
  ctr: number
  cvr: number
  roi1: number
  roi3: number
  roi7: number
  roiTotal: number
  estimatedProfit: number
  trendDirection: 'up' | 'down' | 'flat'
  /** 市场趋势折线（用于列表内 sparkline）。为空时前端会按 trendDirection 生成占位线。 */
  trendPoints?: number[]
}

export interface AdPerformanceDetailCountryTabData {
  marketSummaryText: string
  sortHintText: string
  spendRows: AdPerformanceDetailCountrySpendRow[]
  marketRows: AdPerformanceDetailMarketRow[]
  insightTitle: string
  insightText: string
}

export interface AdPerformanceCampaignDetail {
  header: AdPerformanceDetailHeader
  topKpi: AdPerformanceDetailTopKpi
  roiSummary: AdPerformanceDetailRoiSummary
  tabs: {
    adGroup: AdPerformanceDetailAdGroupTabData
    date: AdPerformanceDetailDateTabData
    country: AdPerformanceDetailCountryTabData
  }
}
