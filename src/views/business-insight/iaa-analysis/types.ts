/**
 * IAA 分析 - 页面与接口类型
 * 与 mock/backend-api 契约、Api.BusinessInsight.IaaAnalysis 对齐
 */

/** 当前选中的 Tab */
export type IaaTabKey = 'adType' | 'adPlatform' | 'adPlacement' | 'adUnit' | 'country' | 'version'

/** 全局筛选状态 */
export interface IaaFilterState {
  s_app_id: string
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

/** 顶部 KPI 卡片（overview-kpi 单项） */
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

/** 近 7 天趋势点 */
export interface IaaTrend7dPoint {
  date: string
  [key: string]: number | string
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

/** ECPM vs 充填率散点项 */
export interface IaaEcpmFillPoint {
  unitId: string
  ecpm: number
  fillRate: number
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

/** 国家地图热力项（name 与 GeoJSON 一致或国家代码） */
export interface IaaCountryMapItem {
  name: string
  value: number
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

/** 版本升级进度（按日堆叠） */
export interface IaaVersionUpgradePoint {
  date: string
  versions: { version: string; percent: number }[]
}

/** AI 版本洞察 */
export interface IaaVersionInsight {
  bullets: string[]
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
