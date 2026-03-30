/**
 * 广告平台分析大屏 - 类型定义（页面内使用）
 */

/** 广告平台 KPI 卡片 */
export interface ChannelKpiCard {
  id: string
  name: string
  /** 广告平台 / App 图标 URL；为空则前端显示圆角占位块 */
  logo?: string
  roi: number
  roiChange: number
  roiChangeUp: boolean
  cost: string
  revenue: string
  cpi: string
  trendData: number[]
}

/** 广告平台 ROI 趋势（最近 30 天） */
export interface ChannelRoiTrend {
  dates: string[]
  series: { name: string; data: number[] }[]
}

/** 用户质量热力图：行=广告平台，列=D1/D7/D30留存、付费率、ARPU */
export interface UserQualityHeatmapRow {
  channel: string
  d1Retention: number
  d7Retention: number
  d30Retention: number
  payRate: number
  arpu: number
}

/** 广告平台指标比较详情表 */
export type ChannelStatus = 'excellent' | 'average' | 'poor'

export interface ChannelMetricRow {
  channel: string
  /** 广告平台编码（与筛选 `source` 一致）；用于跳转详情页 */
  sourceKey?: string
  cost: string
  revenue: string
  roi: number
  roiTrendUp: boolean
  roas: number
  cpi: number
  cpiTrendUp: boolean
  /** 迷你柱图高度（0–1），5 个点；缺省由前端按 channel 生成 */
  roiSparkline?: number[]
  cpiSparkline?: number[]
  installs: string
  userQualityD7: number
  userQualityD7TrendUp: boolean
  userQualityPay: number
  userQualityPayTrendUp: boolean
  ltv7: number
  ltv30: number
  status: ChannelStatus
}

/** Top10 广告系列（大屏第二排右侧） */
export interface TopCampaignRow {
  /** 广告系列 ID（接口 campaignId，可选） */
  campaignId?: string
  /** 广告系列名称（展示，对应业务概念 campaign） */
  campaign: string
  /** 广告平台展示名（用于筛选联动，与热力图等平台名一致） */
  channel: string
  /** 广告平台标识（用于角标样式）：google / facebook / tiktok / unity / kwai / bigo 等 */
  sourceKey: string
  /** 应用 ID（接口 appId，跳转系列详情 query） */
  appId?: string
  /** 应用名称（接口 appName） */
  appName?: string
  /** 花费（美元） */
  cost: number
  cpi: number
  roi: number
}
