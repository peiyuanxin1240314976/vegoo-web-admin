/**
 * 变现分析页数据类型
 * 与原型「变现管理」- 变现分析一致，便于后续对接真实 API
 */

/** 日期范围（与驾驶舱一致） */
export type MonetizationDateRange = 'today' | 'yesterday' | 'week' | 'month'

/** 请求参数 */
export interface MonetizationAnalysisParams {
  dateRange?: MonetizationDateRange
  appId?: string
  country?: string
  platform?: string
}

/** KPI 卡片单项（总收入、广告收入、IAP收入、ARPU、DAU 等） */
export interface MonetizationKpiCard {
  type: 'income' | 'adRevenue' | 'iap' | 'arpu' | 'dau'
  label: string
  value: string
  compare?: string
  compareUp?: boolean
}

/** 渠道总数/主机卡片 */
export interface MonetizationChannelTotal {
  label: string
  value: string
}

/** 环图分类项（渠道或平台占比） */
export interface MonetizationPieItem {
  name: string
  value: number
  percent: number
}

/** 渠道/平台表格行 */
export interface MonetizationChannelPlatformRow {
  channel: string
  platform?: string
  spend?: string
  revenue?: string
  roi?: string
  [key: string]: string | undefined
}

/** 收入与 eCPM 趋势（柱状图 + 折线图，双 Y 轴） */
export interface MonetizationRevenueEcpMTrend {
  dates: string[]
  adRevenue: number[]
  avgEcpM: number[]
}

/** 填充率监控（堆叠面积图，多平台） */
export interface MonetizationFillRateTrend {
  dates: string[]
  series: { name: string; data: number[] }[]
  /** 可选警告：{ date, message } */
  warning?: { date: string; message: string }
}

/** Waterfall 配置层级 */
export interface MonetizationWaterfallLevel {
  name: string
  ecpm: string
  fillRate: string
  priority: number
}

/** IAP 收入分析（甜甜圈图） */
export interface MonetizationIapAnalysis {
  total: string
  items: { name: string; percent: number; amount: string }[]
}

/** eCPM 按广告类型趋势（多折线） */
export interface MonetizationEcpmByAdType {
  dates: string[]
  series: { name: string; value: number[] }[]
}

/** 广告平台表现表格行（展示、点击、收入、eCPM、填充率、趋势） */
export interface MonetizationAdPlatformRow {
  channel: string
  platform?: string
  impressions: string
  clicks: string
  revenue: string
  revenuePercent?: string
  ecpm: string
  fillRate: string
  fillRateStatus?: 'high' | 'low' | 'normal'
  trendData?: number[]
}

/** AI 洞察单项 */
export interface MonetizationAiInsight {
  title: string
  content: string
}

/** 变现分析全量数据 */
export interface MonetizationAnalysisOverview {
  kpi: MonetizationKpiCard[]
  channelTotal: MonetizationChannelTotal
  channelPie: MonetizationPieItem[]
  channelPlatformTable: MonetizationChannelPlatformRow[]
  /** 收入与 eCPM 趋势 */
  revenueEcpMTrend: MonetizationRevenueEcpMTrend
  /** 填充率监控 */
  fillRateTrend: MonetizationFillRateTrend
  /** Waterfall 配置 */
  waterfallLevels: MonetizationWaterfallLevel[]
  /** IAP 收入分析 */
  iapAnalysis: MonetizationIapAnalysis
  /** eCPM 按广告类型 */
  ecpmByAdType: MonetizationEcpmByAdType
  /** 广告平台表现 */
  adPlatformPerformance: MonetizationAdPlatformRow[]
  /** AI 洞察与建议 */
  aiInsights: MonetizationAiInsight[]
}
