/**
 * 我的广告 - 类型定义
 */

/** 用户信息（顶部左侧卡片） */
export interface MyAdsUserInfo {
  name: string
  role: string
  avatarLetter: string
  apps: string[]
}

/** 顶部 KPI 单项 */
export interface MyAdsKpiItem {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down'
  trendText?: string
  type?: 'primary' | 'success' | 'warning' | 'default'
}

/** 汇总 Tab - 本期广告支出等 4 张详细 KPI 卡 */
export interface MyAdsSummaryKpiCard {
  title: string
  value: string
  valueType?: 'primary' | 'success' | 'warning'
  line1?: string
  line2?: string
}

/** 7 天趋势图数据点 */
export interface MyAdsTrendPoint {
  date: string
  adSpend: number
  estimatedProfit: number
  firstDayRoi: number
}

/** 广告平台分布（饼图） */
export interface MyAdsChannelItem {
  name: string
  value: number
  percent: number
}

/** 应用广告支出占比（条形图） */
export interface MyAdsAppSpendItem {
  appName: string
  appIcon?: string
  percent: number
  spend: number
  firstDayRoi: number
  roiTrend?: 'up' | 'down'
}

/** 消耗进度监控行 */
export interface MyAdsPaceRow {
  name: string
  spend: number
  budget: number
  progress: number
  firstDayRoi: number | null
  status: 'normal' | 'over_budget' | 'not_started'
  statusText: string
}

/** 应用+广告平台 - 单个平台卡片 */
export interface MyAdsPlatformCard {
  platformName: string
  platformIcon?: string
  country: string
  countryCode?: string
  status: 'active' | 'inactive' | 'over_budget'
  statusText: string
  warning?: string
  spend: number
  budget: number
  progress: number
  firstDayRoi: number | null
  roiTarget: number
  roiTrend?: 'up' | 'down'
  minConsumption: number
  cpi: number | null
  isWarning?: boolean
}

/** 应用分组（应用+广告平台 Tab） */
export interface MyAdsAppGroup {
  appName: string
  appIcon?: string
  totalSpend: number
  avgFirstDayRoi: number
  platformCount: number
  platforms: MyAdsPlatformCard[]
}

/** 底部汇总 */
export interface MyAdsFooterSummary {
  appCount: number
  campaignCount: number
  totalSpend: number
  overBudgetCount: number
  roiBelowCount: number
  notStartedCount: number
  avgFirstDayRoi: number
  estimatedTotalProfit: number
  minTotalProfit: number
}

/** 广告系列明细 - 表格行 */
export interface MyAdsCampaignRow {
  id: string
  appName: string
  appIcon?: string
  campaignName: string
  /** 广告平台，如 Google、TikTok（对应接口 source/n_source） */
  source: string
  /** 终端平台，如 Android、iOS（对应接口 platform） */
  platform: string
  country: string
  countryCode?: string
  status: 'active' | 'inactive' | 'over_budget'
  statusText: string
  spend: number
  budget: number
  progress: number
  calculatedConsumption: number
  commissionConsumption: number
  firstDayRoi: number | null
  minConsumption: number
  estimatedProfit: number
  minProfit: number
  cpi: number | null
  trend: number[]
}

/** 广告系列明细 - 底部汇总条 */
export interface MyAdsCampaignSummaryBar {
  adSpendSubtotal: number
  calculatedConsumption: number
  difference: number
  commissionSubtotal: number
  directConsumption: number
  commissionRatio: number
  estimatedProfitSubtotal: number
  minProfit: number
  nonProfitableCount: number
}

/** 页面级 Mock 数据聚合 */
export interface MyAdsPageData {
  user: MyAdsUserInfo
  kpi: MyAdsKpiItem[]
  dateRange: [string, string]
  summary: {
    kpiCards: MyAdsSummaryKpiCard[]
    trend: MyAdsTrendPoint[]
    channelDistribution: MyAdsChannelItem[]
    appSpend: MyAdsAppSpendItem[]
    paceMonitor: MyAdsPaceRow[]
    paceRemainingDays?: number
  }
  appPlatform: {
    groupBy: 'app' | 'platform'
    viewDesc: string
    appGroups: MyAdsAppGroup[]
    footer: MyAdsFooterSummary
  }
  campaignDetail: {
    filters: { app: string; platform: string; country: string; status: string; type: string }
    list: MyAdsCampaignRow[]
    total: number
    summaryBar: MyAdsCampaignSummaryBar
  }
}
