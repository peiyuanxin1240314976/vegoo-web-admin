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
  /** 终端平台；不限与统一筛选一致传 `""` */
  platform: string
  /** 应用 ID；不限传空数组或非具体 ID；请求体会由 API 层规范化 */
  sAppId: string | string[]
  /** 国家代码；不限传空字符串（与统一筛选「全部」一致） */
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

/** 应用利润表行「利润趋势」单点（按筛选日期范围逐日） */
export interface ProfitTrendPoint {
  date: string
  /** 当日利润数值（USD，可正可负） */
  profit: number
}

/**
 * 应用利润详情（树表）行：根节点为「全部应用、全部国家…」，子节点为国家维度行。
 * 说明：这里沿用“展示值字符串”策略，避免与后端格式化口径冲突。
 */
export interface ProfitAppProfitTreeNode {
  /** 稳定主键（根可固定为 root；国家行可用 countryCode 或拼接） */
  id: string
  /** 首列显示名称：根为「全部应用、全部国家」；子节点为国家名 */
  name: string
  /** 应用展示名（根行：全部应用；子行：具体应用名，用于表格「应用」列展示） */
  appName?: string
  /** 国家代码（子节点可选，ISO 3166-1 alpha-2 小写；根节点为空串或不传） */
  countryCode?: string
  /** 指标：广告收入展示值 */
  adRev: string
  /** 指标：付费收入展示值 */
  paidRev: string
  /** 指标：广告支出展示值 */
  adSpend: string
  /** 指标：预估利润展示值（可含 +/- 前缀） */
  profit: string
  /** 预估利润颜色 HEX（用于涨跌色） */
  profitColor: string
  /** 指标：首日 ROI（百分比展示值，如 86.52%） */
  roi1d: string
  /** 指标：平均 DAU（整数展示值） */
  avgDau: string
  /** 指标：新用户（整数展示值） */
  newUsers: string
  /** 指标：买量用户（整数展示值） */
  paidUsers: string
  /** 指标：自然量（整数展示值） */
  organicUsers: string
  /** 趋势：按筛选日期范围返回的利润序列（用于迷你趋势） */
  profitTrend: ProfitTrendPoint[]
  /** 子节点：国家行（仅根节点有） */
  children?: ProfitAppProfitTreeNode[]
}

/** （保留）旧版应用利润平铺行：历史字段，避免外部引用时报错 */
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
  profitTrend: ProfitTrendPoint[]
}

/** （保留）旧版应用利润合计行：历史字段 */
export interface ProfitAppTotal {
  adRev: string
  paidRev: string
  total: string
  adSpend: string
  profit: string
  rate: string
}

/** 应用利润详情表 table/app-profit 的 data 结构（树表） */
export interface ProfitAppProfitResponseDto {
  root: ProfitAppProfitTreeNode
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
  /** 後端若仍下發則忽略展示，國旗改由 s_country_code 或中文 name 前端解析 */
  flag?: string
  /** ISO 3166-1 alpha-2，有則優先用於 flag-icons */
  s_country_code?: string
}

/** 世界地图-地图层数据项（name 可为中文或英文国家/地区名，value 为利润数值；前端映射为 ECharts world 区域名） */
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
