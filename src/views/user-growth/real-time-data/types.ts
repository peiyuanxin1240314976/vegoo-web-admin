export interface ChannelData {
  name: string
  iconColor: string
  spend: number
  cpi: number
  roi: number
}

export interface AppDetailData {
  id: string
  name: string
  iconText: string
  iconBg: string
  spend: number
  installs: number
  cpi: number
  roi1d: number
  roi3d: number
  estimatedProfit: number
  activeSeries: number
  balance: number
  ctr: number
  cvr: number
  budgetProgress: number
  budgetDaysLeft: string
  channels: ChannelData[]
  hourlyData: number[]
  hourlyRoi: number[]
}

/** 看板应用卡片列表项（不含详情；详情见 app-detail 接口）。对应 mock/backend-api/03-table-app-cards.json */
export type RealtimeAppCardRow = Omit<AppCard, 'detail'>

/** 底部小时消耗对比（推荐接口形态）。对应 mock/backend-api/05-overview-hourly-spend-comparison.json */
export interface RealtimeHourlyBarSeriesItem {
  s_app_id: string
  name: string
  color: string
  /** 与 hourLabels 等长的今日各时段花费（与数据字典 cost 语义一致，单位 USD） */
  costSeries: number[]
}

export interface RealtimeHourlySpendComparison {
  hourLabels: string[]
  series: RealtimeHourlyBarSeriesItem[]
  /** 与 hourLabels 等长，ROI 百分比数值（如 94 表示 94%） */
  roiPercentSeries: number[]
}

/** 看板单应用卡片（含详情弹窗所需 detail） */
export interface AppCard {
  id: string
  name: string
  iconText: string
  iconBg: string
  isLive: boolean
  hasWarning: boolean
  warningBadge?: string
  launchLabel: string
  spend: number
  spendChange?: string
  spendUp?: boolean
  installs: number
  cpi: number
  cpiChange?: string
  cpiUp?: boolean
  activeSeries: number
  roi: number
  roiGood: boolean
  roiColor: string
  chartData: number[]
  chartColor: string
  actionTag?: string
  actionTagType?: 'cyan' | 'orange' | 'gray' | 'red'
  detail: AppDetailData
}

/** 顶部 KPI 汇总 */
export interface RealtimeKpiSummary {
  onlineApps: number
  totalApps: number
  todaySpend: number
  spendChange: string
  roiAvg: number
  roiTarget: number
  warningApps: number
}

/** 底部「实时小时消耗对比」柱状序列（含 ROI 折线） */
export interface RealtimeBottomSeries {
  weather5: number[]
  phonetracker: number[]
  bloodsugar2: number[]
  phonetracker2: number[]
  roi: number[]
}
