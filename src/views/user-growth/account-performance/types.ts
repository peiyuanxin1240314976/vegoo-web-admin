/**
 * 账户成效页数据类型（Mock 阶段，后续对接真实 API 可复用）
 */

/** 行类型：应用 / 平台 / 账户 */
export type AccountDetailRowType = 'app' | 'platform' | 'account'

/** 应用×平台×账户明细行（树形） */
export interface AccountDetailRow {
  id: string
  type: AccountDetailRowType
  name: string
  spend: number
  budget: number
  usageRate: number
  cpi: number
  installs: number
  roi1: number
  roi3: number
  roi7: number
  status: 'normal' | 'warning' | 'roi_low'
  statusText?: string
  children?: AccountDetailRow[]
}

/** 顶部 KPI 卡片 */
export interface AccountPerformanceKpi {
  type: string
  label: string
  value: string
  sub?: string
  detail?: string
  compare?: string
  compareUp?: boolean
  /** 预警类卡片是否高亮（如预警账户） */
  alert?: boolean
}

/** 广告平台消耗分布 */
export interface ChannelSpendItem {
  name: string
  value: number
  percent?: number
}

/** 预算使用率分布区间 */
export interface BudgetUsageBucket {
  range: string
  count: number
}

/** 首日 ROI 趋势（按日） */
export interface Day1RoiTrendItem {
  date: string
  roi: number
}

/** 预警事项 */
export interface AccountAlertItem {
  id: string
  type: 'over_budget' | 'low_roi' | 'low_usage' | 'insufficient_balance' | 'roi_drop'
  title: string
  desc: string
  targetName?: string
}

/** 近七日消耗节奏（按天） */
export interface SpendPaceItem {
  date: string
  value: number
}

/** 账户成效页完整 Mock 数据结构 */
export interface AccountPerformanceMock {
  kpi: AccountPerformanceKpi[]
  tableTree: AccountDetailRow[]
  channelSpend: ChannelSpendItem[]
  budgetUsageBuckets: BudgetUsageBucket[]
  day1RoiTrend: Day1RoiTrendItem[]
  alerts: AccountAlertItem[]
  spendPace7Days: SpendPaceItem[]
  dateRange: [string, string]
  summaryText: string
}
