/**
 * 渠道 ROI / 用户质量分析大屏 - Mock 数据
 */

/** 渠道 KPI 卡片 */
export interface ChannelKpiCard {
  id: string
  name: string
  logo?: string
  roi: number
  roiChange: number
  roiChangeUp: boolean
  cost: string
  revenue: string
  cpi: string
  trendData: number[]
}

export const MOCK_CHANNEL_KPI_CARDS: ChannelKpiCard[] = [
  {
    id: 'google',
    name: 'Google Ads',
    roi: 1.52,
    roiChange: 8.5,
    roiChangeUp: true,
    cost: '$850K',
    revenue: '$1.29M',
    cpi: '$2.15',
    trendData: [1.2, 1.35, 1.28, 1.42, 1.48, 1.52]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    roi: 1.38,
    roiChange: 12.3,
    roiChangeUp: true,
    cost: '$850K',
    revenue: '$1.29M',
    cpi: '$2.15',
    trendData: [1.1, 1.22, 1.3, 1.25, 1.35, 1.38]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    roi: 1.28,
    roiChange: -3.2,
    roiChangeUp: false,
    cost: '$850K',
    revenue: '$1.29M',
    cpi: '$2.15',
    trendData: [1.35, 1.32, 1.28, 1.25, 1.26, 1.28]
  },
  {
    id: 'unity',
    name: 'Unity',
    roi: 1.15,
    roiChange: 5.2,
    roiChangeUp: true,
    cost: '$850K',
    revenue: '$1.29M',
    cpi: '$2.15',
    trendData: [1.0, 1.08, 1.12, 1.1, 1.12, 1.15]
  },
  {
    id: 'kwai',
    name: 'Kwai',
    roi: 1.12,
    roiChange: 2.3,
    roiChangeUp: true,
    cost: '$850K',
    revenue: '$1.29M',
    cpi: '$2.15',
    trendData: [1.05, 1.08, 1.1, 1.09, 1.11, 1.12]
  }
]

/** 渠道 ROI 趋势（最近 30 天） */
export interface ChannelRoiTrend {
  dates: string[]
  series: { name: string; data: number[] }[]
}

export const MOCK_CHANNEL_ROI_TREND: ChannelRoiTrend = {
  dates: ['1月1日', '1月6日', '1月11日', '1月16日', '1月20日', '1月25日', '2月1日', '2月4日'],
  series: [
    { name: 'Google', data: [1.2, 1.35, 1.4, 1.38, 1.52, 1.48, 1.5, 1.52] },
    { name: 'Facebook', data: [1.1, 1.2, 1.25, 1.28, 1.38, 1.35, 1.36, 1.38] },
    { name: 'TikTok', data: [1.35, 1.3, 1.28, 1.25, 1.28, 1.26, 1.27, 1.28] },
    { name: 'Unity', data: [1.0, 1.05, 1.1, 1.12, 1.15, 1.14, 1.13, 1.15] },
    { name: 'Kwai', data: [1.05, 1.08, 1.1, 1.11, 1.12, 1.1, 1.11, 1.12] }
  ]
}

/** 用户质量热力图：行=渠道，列=D1/D7/D30留存、付费率、ARPU */
export interface UserQualityHeatmapRow {
  channel: string
  d1Retention: number
  d7Retention: number
  d30Retention: number
  payRate: number
  arpu: number
}

export const MOCK_USER_QUALITY_HEATMAP: UserQualityHeatmapRow[] = [
  {
    channel: 'Google',
    d1Retention: 58,
    d7Retention: 42,
    d30Retention: 18,
    payRate: 5.2,
    arpu: 3.28
  },
  {
    channel: 'Facebook',
    d1Retention: 52,
    d7Retention: 38,
    d30Retention: 16,
    payRate: 4.8,
    arpu: 2.95
  },
  {
    channel: 'TikTok',
    d1Retention: 48,
    d7Retention: 35,
    d30Retention: 15,
    payRate: 4.2,
    arpu: 2.68
  },
  {
    channel: 'Unity',
    d1Retention: 45,
    d7Retention: 32,
    d30Retention: 14,
    payRate: 3.8,
    arpu: 2.45
  },
  { channel: 'Kwai', d1Retention: 32, d7Retention: 25, d30Retention: 18, payRate: 2.1, arpu: 1.95 },
  { channel: 'Bigo', d1Retention: 38, d7Retention: 28, d30Retention: 12, payRate: 2.8, arpu: 2.12 }
]

/** 渠道质量雷达图维度 */
export const MOCK_RADAR_INDICATORS = [
  { name: '成本效益', max: 100 },
  { name: '用户留存', max: 100 },
  { name: '变现', max: 100 },
  { name: '潜力规模', max: 100 },
  { name: '稳定性', max: 100 }
]

/** 渠道质量雷达图系列 */
export interface ChannelRadarSeries {
  name: string
  value: number[]
}

export const MOCK_CHANNEL_RADAR: ChannelRadarSeries[] = [
  { name: 'Google', value: [92, 88, 90, 85, 94] },
  { name: 'Facebook', value: [85, 82, 86, 88, 90] },
  { name: 'TikTok', value: [78, 80, 82, 92, 75] },
  { name: 'Unity', value: [72, 75, 78, 70, 82] },
  { name: 'Kwai', value: [68, 65, 62, 78, 70] },
  { name: '其他', value: [60, 58, 55, 65, 62] }
]

/** 渠道指标比较详情表 */
export type ChannelStatus = 'excellent' | 'average' | 'poor'

export interface ChannelMetricRow {
  channel: string
  cost: string
  revenue: string
  roi: number
  roiTrendUp: boolean
  roas: number
  cpi: number
  cpiTrendUp: boolean
  installs: string
  userQualityD7: number
  userQualityD7TrendUp: boolean
  userQualityPay: number
  userQualityPayTrendUp: boolean
  ltv7: number
  ltv30: number
  status: ChannelStatus
}

export const MOCK_CHANNEL_METRICS: ChannelMetricRow[] = [
  {
    channel: 'Google Ads',
    cost: '$850K',
    revenue: '$1.29M',
    roi: 1.52,
    roiTrendUp: true,
    roas: 1.52,
    cpi: 2.15,
    cpiTrendUp: false,
    installs: '395K',
    userQualityD7: 42,
    userQualityD7TrendUp: true,
    userQualityPay: 5.2,
    userQualityPayTrendUp: true,
    ltv7: 2.38,
    ltv30: 2.38,
    status: 'excellent'
  },
  {
    channel: 'Facebook',
    cost: '$820K',
    revenue: '$1.13M',
    roi: 1.38,
    roiTrendUp: true,
    roas: 1.38,
    cpi: 2.08,
    cpiTrendUp: false,
    installs: '394K',
    userQualityD7: 38,
    userQualityD7TrendUp: true,
    userQualityPay: 4.8,
    userQualityPayTrendUp: true,
    ltv7: 2.28,
    ltv30: 2.35,
    status: 'excellent'
  },
  {
    channel: 'TikTok',
    cost: '$780K',
    revenue: '$998K',
    roi: 1.28,
    roiTrendUp: false,
    roas: 1.28,
    cpi: 2.22,
    cpiTrendUp: true,
    installs: '351K',
    userQualityD7: 35,
    userQualityD7TrendUp: false,
    userQualityPay: 4.2,
    userQualityPayTrendUp: false,
    ltv7: 2.15,
    ltv30: 2.28,
    status: 'average'
  },
  {
    channel: 'Unity',
    cost: '$650K',
    revenue: '$748K',
    roi: 1.15,
    roiTrendUp: true,
    roas: 1.15,
    cpi: 2.35,
    cpiTrendUp: false,
    installs: '277K',
    userQualityD7: 32,
    userQualityD7TrendUp: true,
    userQualityPay: 3.8,
    userQualityPayTrendUp: true,
    ltv7: 2.05,
    ltv30: 2.18,
    status: 'average'
  },
  {
    channel: 'Kwai',
    cost: '$520K',
    revenue: '$582K',
    roi: 1.12,
    roiTrendUp: true,
    roas: 1.12,
    cpi: 2.48,
    cpiTrendUp: true,
    installs: '210K',
    userQualityD7: 25,
    userQualityD7TrendUp: false,
    userQualityPay: 2.1,
    userQualityPayTrendUp: false,
    ltv7: 1.95,
    ltv30: 2.02,
    status: 'poor'
  },
  {
    channel: 'Bigo',
    cost: '$380K',
    revenue: '$418K',
    roi: 1.1,
    roiTrendUp: false,
    roas: 1.1,
    cpi: 2.52,
    cpiTrendUp: true,
    installs: '151K',
    userQualityD7: 28,
    userQualityD7TrendUp: true,
    userQualityPay: 2.8,
    userQualityPayTrendUp: true,
    ltv7: 2.0,
    ltv30: 2.08,
    status: 'average'
  },
  {
    channel: 'AppLovin',
    cost: '$450K',
    revenue: '$495K',
    roi: 1.1,
    roiTrendUp: true,
    roas: 1.1,
    cpi: 2.45,
    cpiTrendUp: false,
    installs: '184K',
    userQualityD7: 30,
    userQualityD7TrendUp: true,
    userQualityPay: 3.2,
    userQualityPayTrendUp: true,
    ltv7: 2.02,
    ltv30: 2.12,
    status: 'average'
  },
  {
    channel: 'Mintegral',
    cost: '$320K',
    revenue: '$352K',
    roi: 1.1,
    roiTrendUp: false,
    roas: 1.1,
    cpi: 2.55,
    cpiTrendUp: true,
    installs: '125K',
    userQualityD7: 26,
    userQualityD7TrendUp: false,
    userQualityPay: 2.5,
    userQualityPayTrendUp: false,
    ltv7: 1.88,
    ltv30: 1.95,
    status: 'poor'
  }
]
