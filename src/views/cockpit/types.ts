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

/** 渠道 ROI&安装量表格行：近7日为折线图数据 */
export interface CockpitChannelRoiInstallItem {
  channel: string
  spend: number
  installs: number
  cpi: number
  /** 近7日趋势，用于最后一列迷你折线图 */
  trend: number[]
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
  /** 收入金额展示，如 '$580K' */
  revenue?: string
  /** 收入趋势百分比，如 '+8%'、'+5%' */
  trendPercent?: string
  /** 兼容旧字段 */
  roas?: string
}

/** Top3 消耗渠道（保留兼容） */
export interface CockpitTopSpendItem {
  name: string
  roi: string
}

/** Top3 差评产品 */
export interface CockpitTopBadReviewItem {
  name: string
  /** 差评原因标签，如 '变现下降18%'、'安装成本过高'、'用户流失' */
  reasonTag: string
  /** 指标文案，如 'DAU ↓ 12%'、'CPI ↑ 23%'、'留存 ↓ 15%' */
  metric: string
  /** 指标趋势：上升/下降，用于箭头颜色 */
  trend: 'up' | 'down'
}

/** Top3 用户增长 */
export interface CockpitTopUserItem {
  name: string
  /** 增长数值展示，如 '+8,200'、'+6,200' */
  growth?: string
  /** 增长趋势百分比，如 '+8%'、'+5%' */
  trendPercent?: string
  /** 兼容旧字段 */
  dau?: string
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

/** 近7日收入结构流向 - 桑基图节点 */
export interface CockpitRevenueStructureNode {
  name: string
  depth?: number
  value?: number
  /** 节点内显示的金额文案，如 '$41,353'、'$1.03M' */
  valueDisplay?: string
  /** 节点内显示的占比，如 '89.5%' */
  percent?: string
  /** 图标：Unicode 字符（如 emoji、图标字体）或简单符号 */
  icon?: string
  /** 节点内图标/图片 URL，显示在文字上方或左侧 */
  iconImage?: string
  label?: { formatter?: string }
  itemStyle?: { color?: string; borderRadius?: number }
}

/** 近7日收入结构流向 - 桑基图连线 */
export interface CockpitRevenueStructureLink {
  source: string
  target: string
  value: number
}

/** 近7日收入结构流向 - 底部洞察项 */
export interface CockpitRevenueStructureInsight {
  color: string
  text: string
}

/** 近7日收入结构流向（桑基图 + 洞察） */
export interface CockpitRevenueStructureFlow {
  nodes: CockpitRevenueStructureNode[]
  links: CockpitRevenueStructureLink[]
  insights: CockpitRevenueStructureInsight[]
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
  /** 渠道 ROI&安装量表格数据 */
  channelRoiInstall?: CockpitChannelRoiInstallItem[]
  userQuality: CockpitUserQualityItem[]
  spendPace: CockpitSpendPaceItem[]
  mapCountries: CockpitMapCountry[]
  mapLegend: CockpitMapLegendItem[]
  topRevenue: CockpitTopRevenueItem[]
  topSpend: CockpitTopSpendItem[]
  /** Top3 差评产品（差评原因 + 指标趋势） */
  topBadReview?: CockpitTopBadReviewItem[]
  topUser: CockpitTopUserItem[]
  smartAlerts: CockpitSmartAlertItem[]
  top5Apps: CockpitTop5AppItem[]
  /** 近7日收入结构流向（桑基图） */
  revenueStructureFlow?: CockpitRevenueStructureFlow
  top10Campaigns: CockpitTop10CampaignItem[]
}
