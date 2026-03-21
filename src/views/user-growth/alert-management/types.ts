/** 严重性（筛选与展示） */
export type AlertSeverity = 'high' | 'medium' | 'low'

/** 分类 */
export type AlertCategory = 'roi' | 'cost' | 'traffic' | 'revenue' | 'retention' | 'other'

/** 处理状态 */
export type AlertHandleStatus = 'pending' | 'processing' | 'closed'

export interface AlertMetricLine {
  label: string
  value: string
  /** danger / warning / success / primary */
  tone?: 'danger' | 'warning' | 'success' | 'primary'
}

export interface AlertFeedItem {
  id: string
  title: string
  summary: string
  severity: AlertSeverity
  category: AlertCategory
  status: AlertHandleStatus
  timeLabel: string
  metrics: AlertMetricLine[]
  /** 主操作：查看详情始终；其余按场景 */
  actions: Array<'detail' | 'markDone' | 'ignore' | 'reopen'>
}

export interface TrendSeriesLine {
  name: string
  color: string
  data: number[]
}

export interface AlertTrendBlock {
  title: string
  dates: string[]
  series: TrendSeriesLine[]
}

export interface ClassificationSlice {
  name: string
  value: number
  color: string
}

/** 顶部四宫格摘要（与原型一致） */
export type SummaryAccent = 'danger' | 'warning' | 'success' | 'primary'

export interface AlertSummaryCard {
  id: string
  title: string
  value: string
  accent: SummaryAccent
  /** 角标文案：如 +3、+5，或 启用中 */
  badge?: string
  /** 装饰图标类型 */
  icon: 'bell' | 'clock' | 'check' | 'setting'
}

export interface AlertRuleRow {
  name: string
  desc: string
  priority: string
  notify: string
}

export interface AlertRuleGroup {
  name: string
  rules: AlertRuleRow[]
}

/** 工具栏 / 请求体中的严重性（含「全部」） */
export type AlertFilterSeverity = 'all' | AlertSeverity

/** 工具栏 / 请求体中的分类（含「全部」） */
export type AlertFilterCategory = 'all' | AlertCategory

/** 工具栏 / 请求体中的状态（含「全部」） */
export type AlertFilterStatus = 'all' | AlertHandleStatus

/**
 * POST /api/user-growth/alert-management/overview 请求体
 * 与页面筛选一致；接入后端时原样 JSON 提交。
 */
export interface AlertManagementOverviewParams {
  severity: AlertFilterSeverity
  category: AlertFilterCategory
  status: AlertFilterStatus
  /** 统计日 YYYY-MM-DD；清空日期选择器时为 null */
  date: string | null
}

/** 预警管理页聚合数据 */
export interface AlertManagementOverview {
  summaryCards: AlertSummaryCard[]
  /** 右侧单列：预警趋势（高/中/低 三线） */
  trendPrimary: AlertTrendBlock
  classification: ClassificationSlice[]
  /** 环形图中心文案 */
  classificationCenterTitle: string
  classificationCenterValue: string
  ruleGroups: AlertRuleGroup[]
  alerts: AlertFeedItem[]
}
