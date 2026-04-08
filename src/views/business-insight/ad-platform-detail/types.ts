/** 与 `mock/backend-api` 契约对齐的联调类型（业务 JSON 驼峰 + 契约字段名） */

export type AdPlatformDetailQueryBody = {
  startDate: string
  endDate: string
  appId: string
  /** 国家代码（ISO 3166-1 alpha-2 小写）；空字符串表示全部 */
  countryCode: string
  source?: string
}

export type AdPlatformDetailKpiItem = {
  id: string
  label: string
  valueText: string
  changeText: string
  positive: boolean
  color: string
  chartData: number[]
}

export type AdPlatformDetailOverviewKpisResponse = {
  kpis: AdPlatformDetailKpiItem[]
}

export type AdPlatformDetailOverviewTrendResponse = {
  categories: string[]
  revenue: number[]
  d_ecpm: number[]
  d_fill_rate: number[]
}

export type AdPlatformDetailAppRow = {
  appId: string
  app: string
  revenue: number
  percent: number
  d_ecpm: number
  d_fill_rate: number
  n_impression: number
}

export type AdPlatformDetailTableAppsResponse = {
  records: AdPlatformDetailAppRow[]
}

export type AdPlatformDetailAiInsightItem = {
  title: string
  content: string
  highlights: string[]
}

export type AdPlatformDetailAiInsightsResponse = {
  insights: AdPlatformDetailAiInsightItem[]
}

export type WaterfallNetworkItem = {
  name: string
  icon: string
  color: string
  ecpm: string
  enabled: boolean
}

export type AppAdPlatformWaterfallResponse = {
  waterfallByTab: Record<string, WaterfallNetworkItem[]>
}

export type AppAdPlatformAdUnitRow = {
  network: string
  format: string
  formatType: 'banner' | 'interstitial' | 'rewarded' | string
  revenue: string
  ecpm: string
  fillRate: string
  impressions: string
  revenueHighlight: boolean
}

export type AppAdPlatformAdUnitsResponse = {
  records: AppAdPlatformAdUnitRow[]
}

export type AppAdPlatformAiInsightRow = {
  type: string
  text: string
}

export type AppAdPlatformAiInsightsResponse = {
  insights: AppAdPlatformAiInsightRow[]
}
