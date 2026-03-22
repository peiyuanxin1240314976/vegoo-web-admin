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

/** 下拉项（应用 / 国家 / 终端平台） */
export interface ProfitSelectOption {
  label: string
  value: string
}

/** 日期快捷预设（与 ElDatePicker shortcuts 数据源一致） */
export interface ProfitDatePresetOption {
  label: string
  value: string
}

/** GET .../meta-filter-options */
export interface ProfitFilterOptions {
  appOptions?: ProfitSelectOption[]
  countryOptions?: ProfitSelectOption[]
  platformOptions?: ProfitSelectOption[]
  datePresets?: ProfitDatePresetOption[]
}

/**
 * 利润分析各 POST 接口统一请求体（扁平字段，与 backend-api 契约一致）
 */
export interface ProfitAnalysisQueryParams {
  currentPage: number
  pageSize: number
  /** 逗号分隔 YYYY-MM-DD，如 2026-03-01,2026-03-05 */
  dateRange: string
  platform: string
  sAppId: string
  sCountryCode: string
}

/** POST .../overview/kpi */
export interface ProfitKpiOverviewDto {
  kpis?: ProfitKpiCard[]
}

/** POST .../table/app-profit */
export interface ProfitAppProfitResponseDto {
  rows?: ProfitAppRow[]
  total?: ProfitAppTotal
}

/** POST .../overview/country-profit */
export interface ProfitCountryProfitResponseDto {
  mapData?: ProfitMapDataItem[]
  mapScatter?: ProfitMapScatterItem[]
  countryRows?: ProfitCountryRow[]
}

/** POST .../overview/sankey */
export interface ProfitSankeyDto {
  nodes?: ProfitSankeyNode[]
  links?: ProfitSankeyLink[]
}
