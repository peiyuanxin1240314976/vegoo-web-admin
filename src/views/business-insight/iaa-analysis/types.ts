/**
 * IAA 分析 - 页面与接口类型
 * 与 mock/backend-api 契约、Api.BusinessInsight.IaaAnalysis 对齐
 */

/** 当前选中的 Tab */
export type IaaTabKey = 'adType' | 'adPlatform' | 'adPlacement' | 'adUnit' | 'country' | 'version'

/** 全局筛选状态 */
export interface IaaFilterState {
  s_app_id: string | string[]
  platform: string
  s_country_code: string
  t_date: string
}

/** 下拉选项项 */
export interface IaaSelectOption {
  label: string
  value: string
}

/** 筛选下拉选项（meta-filter-options 响应） */
export interface IaaFilterOptions {
  appOptions: IaaSelectOption[]
  platformOptions: IaaSelectOption[]
  countryOptions: IaaSelectOption[]
}

/** 顶部 KPI 卡片（各 Tab 接口内 `kpis` 单项；广告类型 Tab 为 `kpi` 对象） */
export interface IaaKpiCard {
  id: string
  title: string
  primaryValue: string
  subText?: string
  trendUp?: boolean
  accent?: 'teal' | 'blue' | 'amber' | 'green' | 'default'
}

/** 广告平台 Tab - 平台详细对比表行 */
export interface IaaPlatformTableRow {
  sourceName: string
  source: number
  revenue: number
  revenueShare: number
  impressions: number
  impressionShare: number
  adUsers: number
  userShare: number
  ecpmEst: number
  ecpmReal: number
  variance: number
  fillRate: number
  trend: 'up' | 'flat' | 'down'
}

/** 广告平台效果排行（柱状图单条） */
export interface IaaPlatformRankItem {
  sourceName: string
  revenue: number
  ecpm: number
}

/** 收入占比环形图单条 */
export interface IaaRevenueDonutItem {
  name: string
  value: number
  percent: number
}

/** 广告位 Tab - 详细数据表行 */
export interface IaaPlacementTableRow {
  placementName: string
  adTypeName: string
  sourceName: string
  revenue: number
  impressions: number
  ecpmEst: number
  ecpmReal: number
  impressionUsers: number
  fillRate: number
  status: 'normal' | 'low'
}

/** 广告位 Top10 排行项 */
export interface IaaPlacementTopItem {
  rank: number
  placementName: string
  revenue: number
  percent: number
}

/** 广告单元 Tab - 收入表行 */
export interface IaaAdUnitTableRow {
  s_ad_unit_id: string
  placementName: string
  adTypeName: string
  sourceName: string
  revenue: number
  ecpmEst: number
  ecpmReal: number
  impressions: number
  fillRate: number
  status: 'normal' | 'low'
}

/** 充填率分布区间 */
export interface IaaFillRateBucket {
  range: string
  count: number
}

/** 广告单元 ECPM 对比项 */
export interface IaaEcpmFillPoint {
  unitId: string
  ecpm: number
  adType: string
}

/** 国家 Tab - Top10 表行 */
export interface IaaCountryTableRow {
  rank: number
  s_country_code: string
  s_country_name: string
  revenue: number
  revenueShare: number
  ecpmEst: number
  ecpmReal: number
  impressions: number
  adUsers: number
  arpdau: number
  trend: 'up' | 'flat' | 'down'
  trendPercent?: number
}

/** 国家地图热力项（name 与 GeoJSON 一致） */
export interface IaaCountryMapItem {
  name: string // 英文名，与 world.json GeoJSON name 字段一致
  value: number // ECPM 值（用于热力着色）
  cnName?: string // 中文名（用于标签/tooltip）
  s_country_code?: string
}

/** 版本 Tab - 详细数据表行 */
export interface IaaVersionTableRow {
  app_version: string
  releaseDate: string
  userShare: number
  revenue: number
  ecpmEst: number
  ecpmReal: number
  impressions: number
  adPenetration: number
  crashRate: number
  versionRating: number
  isCurrent?: boolean
}

/** 版本收入对比（横向柱图） */
export interface IaaVersionRevenueItem {
  app_version: string
  revenue: number
  userShare: number
}

/** AI 版本洞察 */
export interface IaaVersionInsight {
  bullets: string[]
}

/** 广告位 Top10 项（带多维指标） */
export interface IaaPlacementTop10Item {
  name: string
  revenue: number
  impressions: number
  ecpm: number
  users: number
  percent: number
}

/** 广告平台 Tab - 整页数据 */
export interface IaaPlatformTabData {
  kpis: IaaKpiCard[]
  platformRanking: IaaPlatformRankItem[]
  platformInsight: string
  tableRows: IaaPlatformTableRow[]
  donut: IaaRevenueDonutItem[]
  ecpmComparison: { name: string; ecpmEst: number; ecpmReal: number }[]
  trend7d: { dates: string[]; series: IaaAdTypeTrend7dSeries[] }
}

/** 广告位 Tab - 整页数据 */
export interface IaaPlacementTabData {
  kpis: IaaKpiCard[]
  top10: IaaPlacementTop10Item[]
  tableRows: IaaPlacementTableRow[]
  donut: IaaRevenueDonutItem[]
  ecpmRanking: { name: string; ecpm: number }[]
  placementInsight: string
  scatterData: { name: string; impressions: number; revenue: number }[]
}

/** 广告单元 Tab - 整页数据 */
export interface IaaAdUnitTabData {
  kpis: IaaKpiCard[]
  tableRows: IaaAdUnitTableRow[]
  fillRateBuckets: IaaFillRateBucket[]
  fillRateInsight: string
  scatterData: IaaEcpmFillPoint[]
  trend7d: { dates: string[]; series: IaaAdTypeTrend7dSeries[] }
}

/** 国家 Tab - 整页数据 */
export interface IaaCountryTabData {
  kpis: IaaKpiCard[]
  mapData: IaaCountryMapItem[]
  tableRows: IaaCountryTableRow[]
  ecpmComparison: { name: string; ecpm: number }[]
  trend7d: { dates: string[]; series: IaaAdTypeTrend7dSeries[] }
  penetrationData: { name: string; penetration: number }[]
}

/** 版本 Tab - 整页数据 */
export interface IaaVersionTabData {
  kpis: IaaKpiCard[]
  tableRows: IaaVersionTableRow[]
  revenueComparison: IaaVersionRevenueItem[]
  versionInsight: string
  ecpmTrend: { versions: string[]; est: number[]; real: number[] }
  upgradeProgress: { dates: string[]; series: { version: string; color: string; data: number[] }[] }
  penetrationCrash: { versions: string[]; penetration: number[]; crash: number[] }
  aiInsight: IaaVersionInsight
}

/** 广告类型 Tab - 类型对比表行 */
export interface IaaAdTypeCompareRow {
  adTypeName: string
  revenue: number
  revenueShare: number
  users: number
  ecpm: number
  impressions: number
}

/** 用户拆分（安装天数）项 */
export interface IaaUserBreakdownItem {
  installDays: string
  revenue: number
  activeUsers: number
}

/** 广告类型 Tab - 雷达图各维度数值（与 compareRows 行顺序一致） */
export interface IaaAdTypeRadarValues {
  revenue: number[]
  users: number[]
  impressions: number[]
  avgRevenue: number[]
}

/** 广告类型 Tab - 近 7 天趋势（按广告类型拆线） */
export interface IaaAdTypeTrend7dSeries {
  name: string
  color: string
  data: number[]
}

/** 广告类型 Tab - 聚合数据（单接口或合并 Mock，供 tab-ad-type 全页使用） */
export interface IaaAdTypeTabData {
  kpi: {
    /** 广告总收入（预估/上报，USD） */
    revenueTotal: number
    /** Firebase/真实收入（USD） */
    revenueReal: number
    /** 广告用户渗透率 0–100 */
    penetrationPct: number
    adUsers: number
    dau: number
    impressions: number
    /** 人均展示次数 */
    impressionsPerUser: number
    ecpmEst: number
    ecpmReal: number
    /** ECPM 偏差百分比（预估相对真实，正数表示预估偏高） */
    ecpmVariancePct: number
  }
  compareRows: IaaAdTypeCompareRow[]
  radar: {
    /** 雷达轴名称，与 compareRows 顺序一致 */
    indicatorNames: string[]
    /** 当前选中的雷达维度（收入/用户/展示/平均收入）对应的坐标轴最大值 */
    maxByMetric: {
      revenue: number
      users: number
      impressions: number
      avgRevenue: number
    }
    values: IaaAdTypeRadarValues
  }
  platformRanking: IaaPlatformRankItem[]
  /** 广告平台效果排行下方洞察文案 */
  platformInsight: string
  placementTop10: IaaPlacementTopItem[]
  trend7d: {
    dates: string[]
    series: IaaAdTypeTrend7dSeries[]
  }
  userBreakdown: {
    buckets: IaaUserBreakdownItem[]
    /** 底部洞察条 */
    insight: string
    /** 360+ 天等末项在 tooltip 中展示的「占广告收入比」提示（0–100） */
    highlightRevenueSharePct?: number
  }
}
