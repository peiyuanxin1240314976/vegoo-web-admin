/**
 * 利润分析 - 页面数据类型
 * 与 mock/data.ts、backend-api 契约一致，字段语义遵循 backend-fields.mdc
 */

/**
 * 全页接口统一 POST 请求体（扁平 JSON，与数据中心 camelCase 一致）
 */
export interface ProfitAnalysisQueryParams {
  currentPage: number
  pageSize: number
  /** 逗号分隔 YYYY-MM-DD，如 2026-03-01,2026-03-05 */
  dateRange: string
  platform: string
  /** 应用 ID，全部传 all */
  sAppId: string
  /** 国家代码，全部传 all */
  sCountryCode: string
}

/** KPI 概览接口 data 包裹层 */
export interface ProfitKpiOverviewDto {
  kpis?: ProfitKpiCard[]
}

export interface ProfitSelectOption {
  label: string
  value: string
}

export interface ProfitDatePreset {
  label: string
  /** 近 N 天数字字符串，供 shortcuts 解析 */
  value: string
}

/**
 * 顶栏 GET meta-filter-options 的 data（对齐后端 ProfitFilterOptionsDto）
 * 每项为 label + value，与 FilterOptionDto 一致
 */
export interface ProfitFilterOptions {
  appOptions: ProfitSelectOption[]
  platformOptions: ProfitSelectOption[]
  countryOptions: ProfitSelectOption[]
  datePresets?: ProfitDatePreset[]
}

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

/** 应用利润详情表行（对齐 ProfitAppRowDto） */
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
  /** 趋势：常见 up / down / flat / none，其它值按无迷你图处理 */
  trend: string
}

/** 应用利润表合计行（对齐 ProfitAppTotalDto） */
export interface ProfitAppTotal {
  adRev: string
  paidRev: string
  total: string
  adSpend: string
  profit: string
  rate: string
}

/** 应用利润详情表 table/app-profit 的 data 结构 */
export interface ProfitAppProfitResponseDto {
  rows?: ProfitAppRow[]
  total?: ProfitAppTotal
}

/** 国家利润 Top10 表行（对齐 ProfitCountryRowDto） */
export interface ProfitCountryRow {
  name: string
  adRev: string
  paidRev: string
  adSpend: string
  profit: string
  profitColor: string
  rate: string
  rateColor: string
  /** 后端可返回国旗图 URL；非 URL 时按纯文本展示 */
  flag?: string
  /** 若后端补充 ISO 3166-1 alpha-2，可用 flag-icons */
  s_country_code?: string
}

/** 世界地图-地图层数据项（name 为英文国家名，value 为利润数值） */
export interface ProfitMapDataItem {
  name: string
  value: number
}

/** 世界地图-散点层（对齐 ProfitMapScatterItemDto）；value 为 [经度, 纬度, 数值]，无效或空数组由前端过滤 */
export interface ProfitMapScatterItem {
  name: string
  value: number[]
}

/** 国家利润分布 overview/country-profit 的 data 结构 */
export interface ProfitCountryProfitResponseDto {
  countryRows?: ProfitCountryRow[]
  mapData?: ProfitMapDataItem[]
  mapScatter?: ProfitMapScatterItem[]
}

/** 利润趋势近 30 天（overview/trend30d 的 data 内结构） */
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

/** 桑基图 overview/sankey 的 data（对齐 ProfitSankeyDto） */
export interface ProfitSankeyDto {
  nodes?: ProfitSankeyNode[]
  links?: ProfitSankeyLink[]
}

/** 筛选区展示用（日期范围、应用、国家当前值） */
export interface ProfitFilterMeta {
  dateRange: string
  appLabel: string
  countryLabel: string
}
