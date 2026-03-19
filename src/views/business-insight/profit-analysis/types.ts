/**
 * 利润分析 - 页面数据类型
 * 与 mock/data.ts、backend-api 契约一致，字段语义遵循 backend-fields.mdc
 */

/** KPI 卡片（顶部 5 张） */
export interface ProfitKpiCard {
  label: string
  badge?: string
  badgeColor?: string
  value: string
  valueColor: string
  sub: string
  border: string
  bg: string
}

/** 应用利润详情表行 */
export interface ProfitAppRow {
  app: string
  adRev: string
  paidRev: string
  total: string
  adSpend: string
  profit: string
  profitColor: string
  rate: string
  rateColor: string
  trend: 'up' | 'down' | 'flat' | 'none'
}

/** 应用利润表合计行 */
export interface ProfitAppTotal {
  adRev: string
  paidRev: string
  total: string
  adSpend: string
  profit: string
  rate: string
}

/** 国家利润 Top10 表行 */
export interface ProfitCountryRow {
  flag: string
  name: string
  adRev: string
  paidRev: string
  adSpend: string
  profit: string
  profitColor: string
  rate: string
  rateColor: string
}

/** 世界地图-地图层数据项（name 为英文国家名，value 为利润数值） */
export interface ProfitMapDataItem {
  name: string
  value: number
}

/** 世界地图-散点层数据项 [lng, lat, value]，name 为展示文案 */
export interface ProfitMapScatterItem {
  name: string
  value: [number, number, number]
}

/** 利润趋势近 30 天 */
export interface ProfitTrend30d {
  days: string[]
  revenue: number[]
  adSpend: number[]
  profit: number[]
}

/** 桑基图节点 */
export interface ProfitSankeyNode {
  name: string
  itemStyle?: { color: string }
}

/** 桑基图连线 */
export interface ProfitSankeyLink {
  source: string
  target: string
  value: number
}

/** 筛选区展示用（日期范围、应用、国家当前值） */
export interface ProfitFilterMeta {
  dateRange: string
  appLabel: string
  countryLabel: string
}
