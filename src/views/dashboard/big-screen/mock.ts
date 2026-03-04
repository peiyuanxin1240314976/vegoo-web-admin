/**
 * 大屏数据统计 - Mock 数据
 *
 * 后续可替换为 API：GET /api/stats/big-screen/overview
 */

import type { BigScreenOverview, RegionStats, KpiCardItem } from '@/types/bigScreen'

export const MOCK_REGIONS: RegionStats[] = [
  {
    regionCode: 'europe',
    regionName: '欧洲',
    metrics: {
      revenue: 3280,
      users: 125000,
      orders: 45600,
      growth: 0.12
    }
  },
  {
    regionCode: 'asia',
    regionName: '亚洲',
    metrics: {
      revenue: 2890,
      users: 198000,
      orders: 52100,
      growth: 0.18
    }
  },
  {
    regionCode: 'china',
    regionName: '中国',
    metrics: {
      revenue: 4120,
      users: 256000,
      orders: 68900,
      growth: 0.22
    }
  }
]

/** 投放分析 KPI 卡片 Mock */
export const MOCK_KPI_CARDS: KpiCardItem[] = [
  {
    type: 'spend',
    title: '今日已花费',
    status: 'normal',
    statusText: '正常',
    value: 125680,
    budgetPercent: 0.67,
    budgetText: '日预算已消耗',
    trendPercent: 12.3,
    trendVs: '昨日'
  },
  {
    type: 'roi',
    title: '今日预估ROI',
    status: 'met',
    statusText: '达标',
    value: 53,
    target: 1.2,
    targetText: '目标: 1.2',
    trendPercent: 12.3,
    trendVs: '昨日'
  },
  {
    type: 'profit',
    title: '今日预估利润',
    trendLabel: '+12.3%',
    value: -1245,
    trendPercent: -2,
    trendVs: '上周同期'
  },
  {
    type: 'abnormal',
    title: '异常广告系列',
    value: 3,
    trendPercent: 14.8,
    trendVs: '上周同期',
    viewButtonText: '查看'
  }
]

export const MOCK_OVERVIEW: BigScreenOverview = {
  summary: {
    totalRevenue: 10290,
    totalUsers: 579000,
    totalOrders: 166600,
    revenueGrowth: 0.17,
    usersGrowth: 0.19
  },
  regions: MOCK_REGIONS,
  dataTime: '2026-03-04 10:30',
  kpiCards: MOCK_KPI_CARDS
}

/** 大屏区域配色（欧洲/亚洲/中国） */
export const BIG_SCREEN_REGION_COLORS = [
  '#4ABEFF', // 欧洲 - 蓝
  '#FFAF20', // 亚洲 - 橙
  '#F56C6C' // 中国 - 红
]

/** 上期总结 */
export interface LastPeriodSummary {
  spend: number
  roi: number
  profit: number
  normalCampaigns: string // e.g. "9/12"
}

export const MOCK_LAST_PERIOD_SUMMARY: LastPeriodSummary = {
  spend: 8375,
  roi: 53,
  profit: 1275,
  normalCampaigns: '9/12'
}

/** 近7天 ROI 趋势（按天） */
export const MOCK_ROI_TREND_7_DAYS: number[] = [45, 52, 48, 58, 65, 78, 53]

/** 我负责的广告表现(上期) - 单行 */
export interface MyAdPerformanceRow {
  label: string
  value: number
  percent: number
}

export const MOCK_MY_AD_PERFORMANCE: MyAdPerformanceRow[] = [
  { label: 'USA_Android', value: 1938, percent: 102 },
  { label: 'USA_Android_T1_Purchase', value: 1938, percent: 97 },
  { label: 'USA_Android_T1_Purchase', value: 1938, percent: 90 },
  { label: 'USA_Android_T1_Purchase', value: 1938, percent: 87 },
  { label: 'USA_Android_T1_Purchase', value: 1938, percent: 62 }
]

/** 广告系列状态 */
export type CampaignStatusType = 'active' | 'lowRoi' | 'overBudget'

/** 我负责的广告系列 - 表格行 */
export interface CampaignRow {
  id: string
  appName: string
  campaignName: string
  region: string
  channel: string
  cost: number
  costHighlight?: boolean
  installs: number
  cpi: number
  roi: number
  roiUp: boolean
  status: string
  statusType: CampaignStatusType
}

export const MOCK_CAMPAIGN_LIST: CampaignRow[] = [
  {
    id: '1',
    appName: 'Weather8',
    campaignName: 'Weather5_US_Google_CRE001',
    region: 'US',
    channel: 'Google Ads',
    cost: 12150,
    installs: 5234,
    cpi: 2.38,
    roi: 1.58,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '2',
    appName: 'BloodSugar2',
    campaignName: 'Weather5_UK_Facebook_CRE002',
    region: 'UK',
    channel: 'Facebook',
    cost: 12450,
    costHighlight: true,
    installs: 5100,
    cpi: 2.44,
    roi: 1.42,
    roiUp: false,
    status: '低ROI',
    statusType: 'lowRoi'
  },
  {
    id: '3',
    appName: 'PhoneTracker2',
    campaignName: 'Weather5_CA_Google_CRE003',
    region: 'CA',
    channel: 'Google Ads',
    cost: 11800,
    installs: 4890,
    cpi: 2.41,
    roi: 1.35,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '4',
    appName: 'PhoneTracker3',
    campaignName: 'Weather5_US_TikTok_CRE004',
    region: 'US',
    channel: 'TikTok',
    cost: 12450,
    costHighlight: true,
    installs: 4520,
    cpi: 2.75,
    roi: 1.28,
    roiUp: true,
    status: '超预算',
    statusType: 'overBudget'
  },
  {
    id: '5',
    appName: 'Weather8',
    campaignName: 'Weather5_UK_Google_CRE005',
    region: 'UK',
    channel: 'Google Ads',
    cost: 12100,
    installs: 5010,
    cpi: 2.41,
    roi: 1.52,
    roiUp: false,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '6',
    appName: 'BloodSugar2',
    campaignName: 'Weather5_US_Facebook_CRE006',
    region: 'US',
    channel: 'Facebook',
    cost: 11900,
    installs: 4780,
    cpi: 2.49,
    roi: 1.45,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '7',
    appName: 'PhoneTracker2',
    campaignName: 'Weather5_CA_Facebook_CRE007',
    region: 'CA',
    channel: 'Facebook',
    cost: 12450,
    costHighlight: true,
    installs: 4650,
    cpi: 2.68,
    roi: 1.22,
    roiUp: false,
    status: '低ROI',
    statusType: 'lowRoi'
  },
  {
    id: '8',
    appName: 'PhoneTracker3',
    campaignName: 'Weather5_US_Google_CRE008',
    region: 'US',
    channel: 'Google Ads',
    cost: 12200,
    installs: 5120,
    cpi: 2.38,
    roi: 1.55,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '9',
    appName: 'Weather8',
    campaignName: 'Weather5_UK_TikTok_CRE009',
    region: 'UK',
    channel: 'TikTok',
    cost: 12000,
    installs: 4920,
    cpi: 2.44,
    roi: 1.38,
    roiUp: false,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '10',
    appName: 'BloodSugar2',
    campaignName: 'Weather5_CA_Google_CRE010',
    region: 'CA',
    channel: 'Google Ads',
    cost: 12300,
    installs: 4980,
    cpi: 2.47,
    roi: 1.32,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '11',
    appName: 'Weather8',
    campaignName: 'Weather5_US_Facebook_CRE011',
    region: 'US',
    channel: 'Facebook',
    cost: 12050,
    installs: 4950,
    cpi: 2.43,
    roi: 1.48,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '12',
    appName: 'PhoneTracker2',
    campaignName: 'Weather5_UK_Google_CRE012',
    region: 'UK',
    channel: 'Google Ads',
    cost: 12200,
    installs: 5050,
    cpi: 2.42,
    roi: 1.41,
    roiUp: false,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '13',
    appName: 'PhoneTracker3',
    campaignName: 'Weather5_CA_TikTok_CRE013',
    region: 'CA',
    channel: 'TikTok',
    cost: 12450,
    costHighlight: true,
    installs: 4580,
    cpi: 2.72,
    roi: 1.18,
    roiUp: false,
    status: '低ROI',
    statusType: 'lowRoi'
  },
  {
    id: '14',
    appName: 'BloodSugar2',
    campaignName: 'Weather5_US_Google_CRE014',
    region: 'US',
    channel: 'Google Ads',
    cost: 12180,
    installs: 5180,
    cpi: 2.35,
    roi: 1.62,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '15',
    appName: 'Weather8',
    campaignName: 'Weather5_UK_Facebook_CRE015',
    region: 'UK',
    channel: 'Facebook',
    cost: 11950,
    installs: 4850,
    cpi: 2.46,
    roi: 1.39,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '16',
    appName: 'PhoneTracker2',
    campaignName: 'Weather5_US_TikTok_CRE016',
    region: 'US',
    channel: 'TikTok',
    cost: 12300,
    installs: 4720,
    cpi: 2.61,
    roi: 1.25,
    roiUp: false,
    status: '超预算',
    statusType: 'overBudget'
  },
  {
    id: '17',
    appName: 'PhoneTracker3',
    campaignName: 'Weather5_CA_Google_CRE017',
    region: 'CA',
    channel: 'Google Ads',
    cost: 12080,
    installs: 5020,
    cpi: 2.41,
    roi: 1.44,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '18',
    appName: 'BloodSugar2',
    campaignName: 'Weather5_UK_Google_CRE018',
    region: 'UK',
    channel: 'Google Ads',
    cost: 12250,
    installs: 5080,
    cpi: 2.41,
    roi: 1.38,
    roiUp: false,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '19',
    appName: 'Weather8',
    campaignName: 'Weather5_US_Google_CRE019',
    region: 'US',
    channel: 'Google Ads',
    cost: 12120,
    installs: 5150,
    cpi: 2.35,
    roi: 1.55,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  },
  {
    id: '20',
    appName: 'PhoneTracker2',
    campaignName: 'Weather5_CA_Facebook_CRE020',
    region: 'CA',
    channel: 'Facebook',
    cost: 12380,
    installs: 4920,
    cpi: 2.52,
    roi: 1.28,
    roiUp: true,
    status: '激活',
    statusType: 'active'
  }
]
