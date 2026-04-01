export type AdPlatformInfoMetricKey =
  | 'spend'
  | 'revenue'
  | 'profit'
  | 'roi'
  | 'cpi'
  | 'installs'
  | 'd7_ltv'
  | 'retention'
  | 'pay_rate'
  | 'clicks'
  | 'impressions'
  | 'ctr'
  | 'cvr'

/** 详情页筛选项：仅时间维度（与路由 param `id` 配合请求详情） */
export type AdPlatformInfoDateRangePreset = '7d' | '30d' | '90d'

/** 详情页筛选项：默认 preset（7d/30d/90d），也支持用户自选起止日期（YYYY-MM-DD） */
export type AdPlatformInfoDateRange = AdPlatformInfoDateRangePreset | [start: string, end: string]

export type AdPlatformInfoFilterState = {
  dateRange: AdPlatformInfoDateRange
}

export type AdPlatformInfoPlatformSummary = {
  name: string
  subtitle: string
  score: number
  scoreText: string
}

export type AdPlatformInfoKpiCard = {
  id: string
  title: string
  metricKey: AdPlatformInfoMetricKey
  valueText: string
  deltaPct: number
  accent: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal'
  spark: number[]
  icon?: string
  noteText?: string
  variant?: 'top' | 'stat' | 'retention'
  retentionSegments?: Array<{
    label: string
    valueText: string
    spark: number[]
  }>
}

export type AdPlatformInfoMapPoint = {
  name: string
  cnName?: string
  value: number
}

export type AdPlatformInfoTopRow = {
  rank: number
  s_country_code: string
  countryName: string
  revenue: number
  roi: number
  profit: number
}

export type AdPlatformInfoHeatmapData = {
  xLabels: string[]
  yLabels: string[]
  points: Array<[xIndex: number, yIndex: number, value: number]>
  legendMin: number
  legendMax: number
}

export type AdPlatformInfoFunnelStage = {
  name: string
  value: number
}

export type AdPlatformInfoTrendSeries = {
  name: string
  type: 'line' | 'bar'
  yAxisIndex?: number
  data: number[]
  color: string
}

export type AdPlatformInfoTrendData = {
  dates: string[]
  series: AdPlatformInfoTrendSeries[]
}

export type AdPlatformInfoCampaignRow = {
  clicks: number
  conversionRate: number
  id: string
  campaign: string
  spend: number
  revenue: number
  profit: number
  roi: number
  cpi: number
  installs: number
  status: 'active' | 'paused'
}

export type AdPlatformInfoPageData = {
  summary: AdPlatformInfoPlatformSummary
  kpis: AdPlatformInfoKpiCard[]
  mapPoints: AdPlatformInfoMapPoint[]
  top10: AdPlatformInfoTopRow[]
  heatmap: AdPlatformInfoHeatmapData
  funnel: AdPlatformInfoFunnelStage[]
  trend: AdPlatformInfoTrendData
  campaigns: AdPlatformInfoCampaignRow[]
  updatedAtText: string
}
