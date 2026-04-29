/**
 * 我的绩效 - 类型定义
 */

export type MyPerformancePeriodType = 'quarter' | 'month'

/** POST 业务接口统一请求体（与 mock/backend-api 契约一致） */
export interface MyPerformanceQueryBody {
  personId: string
  periodType: MyPerformancePeriodType
  periodValue: string
  startDate: string
  endDate: string
}

/** GET meta-person-options 响应 */
export interface MyPerformanceMetaPersonResponse {
  personOptions: MyPerformancePersonOption[]
  selectedPersonId: string
}

/** GET meta-period-options 响应 */
export interface MyPerformanceMetaPeriodResponse {
  periodOptions: {
    quarter: MyPerformancePeriodOption[]
    month: MyPerformancePeriodOption[]
  }
  selectedPeriod: {
    periodType: MyPerformancePeriodType
    periodValue: string
  }
}

/** POST overview-kpi 响应 */
export interface MyPerformanceOverviewKpiResponse {
  topKpis: MyPerformanceTopKpiItem[]
}

/** POST kpi-achievement 响应 */
export interface MyPerformanceKpiAchievementResponse {
  kpiAchievement: MyPerformanceKpiAchievement
}

/** POST roi-trend 响应 */
export interface MyPerformanceRoiTrendResponse {
  title: string
  points: MyPerformanceRoiTrendPoint[]
}

/** POST spend-progress 响应（网关 `data.spendProgress` 内层与之一致） */
export type MyPerformanceSpendProgressTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'primary'
  | 'default'

export interface MyPerformanceSpendProgressItem {
  label: string
  /** 后端已格式化的展示文案，如 `"$31,521.26 / $37,825.51"` 或单金额 */
  value: string
  /** 进度比例 0-100 */
  rate: number
  type?: MyPerformanceSpendProgressTone
}

export interface MyPerformanceSpendProgressResponse {
  title: string
  list: MyPerformanceSpendProgressItem[]
}

/** POST performance-history 响应 */
export interface MyPerformancePerformanceHistoryResponse {
  title: string
  list: MyPerformanceHistoryItem[]
}

/** POST app-dimension-table 响应 */
export interface MyPerformanceAppDimensionTableResponse {
  title: string
  list: MyPerformanceAppTreeRow[]
  summary: MyPerformanceAppTableSummary
  excelTables?: MyPerformanceExcelTables
}

export type MyPerformanceExcelDailyValue = string | number

export interface MyPerformanceExcelMetricRow {
  label: string
  values: MyPerformanceExcelDailyValue[]
}

export interface MyPerformanceExcelSourceRowsGroup {
  sourceName: string
  rows: MyPerformanceExcelMetricRow[]
}

export interface MyPerformanceExcelSummaryRow {
  label: string
  total: MyPerformanceExcelDailyValue
  days: MyPerformanceExcelDailyValue[]
}

export interface MyPerformanceExcelAppBlock {
  app: string
  platform: string
  allRows?: MyPerformanceExcelMetricRow[] | null
  sourceRows: MyPerformanceExcelSourceRowsGroup[]
  alt?: boolean
}

export interface MyPerformanceExcelTables {
  dateHeaders: string[]
  summaryRows: MyPerformanceExcelSummaryRow[]
  appBlocks: MyPerformanceExcelAppBlock[]
}

export interface MyPerformancePersonOption {
  id: string
  name: string
  role: string
  avatarLetter: string
  apps: string[]
}

export interface MyPerformancePeriodOption {
  /** 展示文案：如 当前季度 Q1 2026 / 当前月份 2026-03 */
  label: string
  /** 值：如 2026-Q1 / 2026-03 */
  value: string
}

export interface MyPerformanceTopKpiItem {
  label: string
  value: string
  type?: 'primary' | 'success' | 'warning' | 'default'
  sub?: string
  /** 总和/综合评分项，用于加大字号与高亮 */
  highlight?: boolean
}

export interface MyPerformanceKpiAchievement {
  /** 0-100 */
  score: number | null
  label: string
  /** 评分说明，如 “(28px)” */
  hint?: string
  breakdown: Array<{
    label: string
    target: string
    actual: string
    rate: string
    score: string
  }>
  /** 月度综合评分（与 score 可一致），用于右侧小字 */
  totalScoreLabel?: string
}

export interface MyPerformanceRoiTrendPoint {
  /** X 轴：YYYY-MM-DD 或后端已格式化的 MM/DD 等 */
  date: string
  /** 实际 ROI（%） */
  roi: number
  /** 目标 ROI（%）；存在时图表画第二条线 */
  targetRoi?: number
}

export interface MyPerformanceHistoryItem {
  /** 如 2026-03 / 2026-Q1 */
  period: string
  /** 0-100 */
  score: number
  /** 展示文案，如 优秀/良好/待提升 */
  levelText: string
}

export type MyPerformanceAppTreeRowType = 'app' | 'source'

export interface MyPerformanceAppTreeRow {
  id: string
  type: MyPerformanceAppTreeRowType
  /** 展示名称：app/platform/source */
  name: string
  /** 子节点（层级表格） */
  children?: MyPerformanceAppTreeRow[]

  /** 终端平台（source 行展示），如 Android/iOS */
  platform?: string

  /** 统计周期，如 3天 / 7天（一般在 source 层） */
  windowLabel?: string
  /** 达标要求（0-100） */
  reachRate?: number
  /** 最低要求（0-100） */
  minRate?: number
  /** 违度系数 */
  deviationCoef?: number
  /** 最低利润（$） */
  minProfit?: number
  /** 广告支出（$） */
  adSpend?: number
  /** 计算消耗（$） */
  calculatedSpend?: number
  /** ROI（0-100） */
  roi?: number
  /** 代投消耗（$） */
  commissionSpend?: number
  /** 预估利润（$，可负） */
  estimatedProfit?: number
  cpa?: number
  /** 分数 */
  score?: number
  status?: 'running' | 'paused' | 'warning'
  statusText?: string
}

export interface MyPerformanceAppTableSummary {
  adSpend: number | null
  calculatedSpend: number | null
  roi: number | null
  commissionSpend: number | null
  estimatedProfit: number | null
  cpa: number | null
  score: number | null
}

export interface MyPerformancePageData {
  personOptions: MyPerformancePersonOption[]
  selectedPersonId: string
  periodType: MyPerformancePeriodType
  periodOptions: {
    quarter: MyPerformancePeriodOption[]
    month: MyPerformancePeriodOption[]
  }
  selectedPeriodValue: string

  /** 顶部 KPI 行 */
  topKpis: MyPerformanceTopKpiItem[]

  /** 左侧 KPI 达成 */
  kpiAchievement: MyPerformanceKpiAchievement

  /** ROI 趋势（近 3 周） */
  roiTrend: {
    title: string
    points: MyPerformanceRoiTrendPoint[]
  }

  /** 消耗进度 */
  spendProgress: {
    title: string
    list: MyPerformanceSpendProgressItem[]
  }

  /** 绩效历史 */
  performanceHistory: {
    title: string
    list: MyPerformanceHistoryItem[]
  }

  /** 应用维度绩效评估表 */
  appDimensionTable: {
    title: string
    list: MyPerformanceAppTreeRow[]
    summary: MyPerformanceAppTableSummary
  }

  appDateRangeTable: {
    title: string
    list: MyPerformanceAppTreeRow[]
    summary: MyPerformanceAppTableSummary
    excelTables?: MyPerformanceExcelTables
  }
}
