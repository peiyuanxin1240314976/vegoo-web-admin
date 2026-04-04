/**
 * 整体回收 - 页面与接口类型
 */

/** 当前选中的 Tab */
export type OverallRecoveryTabKey = 'overall' | 'organic'

/** 全局筛选状态 */
export interface OverallRecoveryFilterState {
  dateRange: string
  s_app_id: string
  source: string
  s_country_code: string
}

// ─── Tab1: 整体回收 ───────────────────────────────────────────

/** 顶部 KPI 卡片 */
export interface OverallKpiCard {
  id: string
  title: string
  primaryValue: string
  subLabel?: string
  subValue?: string
  trendText?: string
  trendUp?: boolean
}

/** 回收曲线系列数据 */
export interface RecoveryCurveSeries {
  name: string
  color: string
  data: number[]
  dashed?: boolean
}

/** 回收曲线图数据 */
export interface RecoveryCurveData {
  days: string[]
  series: RecoveryCurveSeries[]
}

/** 日均量构成（柱状图）数据点 */
export interface DailyVolumeItem {
  date: string
  paid: number
  organic: number
}

/** ROI 对比表行 */
export interface RoiCompareRow {
  label: string
  day1: string
  day14: string
  day30: string
  day60: string
  day90: string
  isHighlight?: boolean
}

/** 明细数据表行 */
export interface RecoveryDetailRow {
  /** 与卡片内应用子筛选项 value 对齐（如 weather5）；接口未拆维度时可省略，省略则不受应用子筛选影响 */
  detailApp?: string
  /** 与卡片内广告平台子筛选项 value 对齐（如 google、facebook）；接口未拆维度时可省略 */
  detailChannel?: string
  date: string
  adSpend: number
  cpi: number
  paidUsers: number
  totalUsers: number
  organicUsers: number
  roiDay0: number // 首日
  roiDay1: number // 1日
  roiDay2: number // 2日
  roiDay3: number // 3日
  roiDay5: number // 5日
  roiDay7: number // 7日
  rush: number
  threeStar: number
  sevenStar: number
  retDay1: number
  retDay3: number
  retDay7: number
}

/** Tab1 整体回收 - 完整页面数据 */
export interface OverallTabData {
  kpis: OverallKpiCard[]
  recoveryCurve: RecoveryCurveData
  dailyVolume: DailyVolumeItem[]
  roiCompare: RoiCompareRow[]
  detailRows: RecoveryDetailRow[]
}

// ─── Tab2: 自然量分析 ──────────────────────────────────────────

/** 自然量 KPI 卡片 */
export interface OrganicKpiCard {
  id: string
  title: string
  primaryValue: string
  trendText?: string
  trendUp?: boolean
}

/** 自然量 vs 付费量趋势数据点 */
export interface OrganicVsPaidTrendItem {
  date: string
  organic: number
  paid: number
  organicRatio: number
}

/** 流量来源分析饼图项 */
export interface TrafficSourceItem {
  name: string
  value: number
  color: string
}

/** K-factor 渠道分析表行 */
export interface KfactorChannelRow {
  source: string
  paidInstall: number
  organicDriven: number
  total: number
  kfactor: number
  roiBoost: number
  trend: number[]
}

/** 国家自然量分布 Top8 项 */
export interface CountryOrganicItem {
  countryCode: string
  countryName: string
  organicInstall: number
  paidInstall: number
  kfactor: number
  roiBoost: number
  organicRatio: number
}

/** Tab2 自然量分析 - 完整页面数据 */
export interface OrganicTabData {
  kpis: OrganicKpiCard[]
  trendData: OrganicVsPaidTrendItem[]
  trafficSources: TrafficSourceItem[]
  radarData: {
    indicators: string[]
    organicValues: number[]
    paidValues: number[]
  }
  kfactorTrend: { dates: string[]; values: number[] }
  kfactorChannels: KfactorChannelRow[]
  countryTop8: CountryOrganicItem[]
}
