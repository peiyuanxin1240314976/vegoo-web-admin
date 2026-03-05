/**
 * App 应用健康分析页数据类型
 * 与原型「App应用健康分析」一致
 */

/** KPI 卡片颜色主题（第一排 5 张不同色） */
export type AppHealthKpiCardTheme = 'blue' | 'green' | 'orange' | 'purple' | 'cyan'

/** 单 App KPI 卡片：健康得分、收入、DAU、D7 */
export interface AppHealthKpiCard {
  appId: string
  appName: string
  appIcon?: string
  /** 卡片主题色，用于第一排 5 张不同颜色 */
  theme?: AppHealthKpiCardTheme
  healthScore: number
  healthMax?: number
  revenue: string
  revenueCompare?: string
  revenueUp?: boolean
  dau: string
  dauCompare?: string
  dauUp?: boolean
  d7: string
}

/** 用户漏斗阶段 */
export interface AppHealthFunnelStage {
  name: string
  value: number
  percent?: string
  subPercent?: string
}

/** 留存热力图：行=周期 W1-W6，列=D1/D3/D7/D714/D30 留存，最后一列可为 LTV */
export interface AppHealthRetentionCell {
  value: number | string
  isPercent?: boolean
  isCurrency?: boolean
}

export interface AppHealthRetentionRow {
  week: string
  d1: number
  d3: number
  d7: number
  d714: number
  d30: number | string
}

/** 收入构成：按日期的堆叠面积图 */
export interface AppHealthRevenueSeries {
  name: string
  percent: number
  data: number[]
}

export interface AppHealthRevenueComposition {
  dates: string[]
  series: AppHealthRevenueSeries[]
}

/** 应用指标表格行 */
export interface AppHealthMetricsRow {
  appId: string
  appName: string
  appIcon?: string
  revenue: string
  revenueGrowth: string
  revenueGrowthUp?: boolean
  dau: string
  dauTrend?: number[]
  activationRate: string
  d1: string
  d7: string
  d7Trend?: number[]
  d30: string
  d30Change?: string
  d30Up?: boolean
  d30Trend?: number[]
  payRate: string
  payRateChange?: string
  payRateUp?: boolean
  payRateTrend?: number[]
  arpu: string
  ltv30: string
  healthScore: number
  healthStatus?: 'high' | 'medium' | 'low'
}

/** 全量数据 */
export interface AppHealthOverview {
  kpiCards: AppHealthKpiCard[]
  funnel: AppHealthFunnelStage[]
  retention: AppHealthRetentionRow[]
  revenueComposition: AppHealthRevenueComposition
  metricsTable: AppHealthMetricsRow[]
}
