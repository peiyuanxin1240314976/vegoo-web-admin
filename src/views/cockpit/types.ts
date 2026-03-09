/**
 * 驾驶舱数据类型定义
 * 与后端接口约定一致，便于后续对接真实 API 时直接复用
 */

/** 日期范围 */
export type CockpitDateRange = 'today' | 'yesterday' | 'week' | 'month'

/** 请求参数：按日期范围拉取驾驶舱数据 */
export interface CockpitOverviewParams {
  dateRange?: CockpitDateRange
}

/** KPI 卡片类型：总收入、付费收入、广告支出、有效订阅、DAU、预估利润 */
export type CockpitKpiCardType =
  | 'income' // 总收入
  | 'paidRevenue' // 付费收入
  | 'adSpend' // 广告支出
  | 'subscriptions' // 有效订阅
  | 'dau' // DAU
  | 'profit' // 预估利润

/** KPI 卡片单项 */
export interface CockpitKpiCard {
  type: CockpitKpiCardType
  label: string
  value: string
  detail?: string
  sub?: string
  compare?: string
  compareUp?: boolean
  progressPercent?: number
}

/** 顶部警示/机会/风险条 */
export interface CockpitAlertBanner {
  type: 'warning' | 'opportunity' | 'risk'
  text: string
  suggestion: string
}

/** 警示模块左侧摘要指标单项（带升降趋势） */
export interface CockpitAlertSummaryMetric {
  label: string
  value: string
  /** 变化数值，与 trend 同时存在时显示箭头与数字 */
  change?: number
  trend?: 'up' | 'down'
}

/** 收入与成本趋势图 */
export interface CockpitRevenueCostTrend {
  dates: string[]
  revenue: number[]
  cost: number[]
}

/** 用户质量仪表盘单项 */
export interface CockpitUserQualityItem {
  key: string
  label: string
  value: string
  status: string
  statusClass: 'good' | 'avg' | 'high'
  /** 仪表盘数值 0-100，用于图表 */
  gaugeValue: number
}

/** 消耗节奏监控单项 */
export interface CockpitSpendPaceItem {
  name: string
  current: number
  budget: number
  percent: number
  status: string
  tagType: 'success' | 'warning' | 'danger'
  /** 进度条颜色，可选，不传时可由 tagType 推导 */
  color?: string
  /** 平台标识，用于展示图标：google | facebook | tiktok | mintefral | kwai | newsbreak 等 */
  platform?: string
  /** 是否归入「代投」区块 */
  section?: 'default' | 'managed'
}

/** 业务分布地图：国家数据（nameEn 需与 GeoJSON 一致） */
export interface CockpitMapCountry {
  nameEn: string
  name: string
  revenue: number
  spend: number
  user: number
  trend: string
  color?: string
  /** 国家 ISO 3166-1 alpha-2 代码（可选，用于悬浮显示国旗） */
  code?: string
  /** 新增用户（可选，用于悬浮详情） */
  newUser?: number
  newUserTrend?: string
  /** eCPM（可选） */
  ecpm?: number
  ecpmTrend?: string
}

/** 地图图例项 */
export interface CockpitMapLegendItem {
  name: string
  value: string
  trend: string
  color: string
}

/** Top3 收入应用 */
export interface CockpitTopRevenueItem {
  name: string
  roas: string
}

/** Top3 消耗渠道 */
export interface CockpitTopSpendItem {
  name: string
  roi: string
}

/** Top3 用户增长 */
export interface CockpitTopUserItem {
  name: string
  dau: string
}

/** 智能预警单项 */
export interface CockpitSmartAlertItem {
  type: 'risk' | 'warning' | 'growth'
  msg: string
}

/** 收入 Top5 应用 */
export interface CockpitTop5AppItem {
  name: string
  revenue: string
  roas: string
}

/** Top10 Campaign 行 */
export interface CockpitTop10CampaignItem {
  campaign: string
  channel: string
  spend: string
  revenue: string
  roi: string
}

/** 驾驶舱全量数据（与后端 /api/cockpit/overview 返回结构对齐） */
export interface CockpitOverview {
  kpi: CockpitKpiCard[]
  /** 警示模块左侧：运营摘要指标（DNU、自然量、买带应用等） */
  alertSummaryMetrics?: CockpitAlertSummaryMetric[]
  alertBanners: CockpitAlertBanner[]
  revenueCostTrend: CockpitRevenueCostTrend
  userQuality: CockpitUserQualityItem[]
  spendPace: CockpitSpendPaceItem[]
  mapCountries: CockpitMapCountry[]
  mapLegend: CockpitMapLegendItem[]
  topRevenue: CockpitTopRevenueItem[]
  topSpend: CockpitTopSpendItem[]
  topUser: CockpitTopUserItem[]
  smartAlerts: CockpitSmartAlertItem[]
  top5Apps: CockpitTop5AppItem[]
  top10Campaigns: CockpitTop10CampaignItem[]
}
