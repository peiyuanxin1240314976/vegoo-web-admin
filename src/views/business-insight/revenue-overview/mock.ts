import { getAppTodayYYYYMMDD } from '@/utils/app-now'

export type RevenueOverviewFilterState = {
  /** 应用 */
  s_app_id: string
  /** 平台 */
  platform: 'all' | 'android' | 'ios'
  /** 国家 */
  s_country_code: string
  /** 版本 */
  app_version: string
  /** 日期 */
  t_date: string
}

export type RevenueOverviewKpiCard = {
  id: string
  title: string
  primaryValue: string
  subLeftLabel: string
  subLeftValue: string
  subRightLabel: string
  subRightValue: string
  trendUp: boolean
  trendPercentText: string
  spark: number[]
  accent: 'blue' | 'teal' | 'purple' | 'amber' | 'green' | 'indigo'
}

export type RevenueOverviewIaaBreakdownRow = {
  s_ad_type_name: string
  revenue: number
  percent: number
  n_users: number
  n_impression: number
  /** 平均展示 */
  d_avg_display: number
  /** 平均收入（USD） */
  d_avg_revenue: number
}

/** IAA 构成：广告平台维度 */
export type RevenueOverviewIaaPlatformRow = {
  s_platform_name: string
  revenue: number
  percent: number
  n_impression: number
  d_ecpm: number
  n_users: number
}

/** IAA 构成：广告位维度 */
export type RevenueOverviewIaaAdUnitRow = {
  s_ad_unit_name: string
  revenue: number
  percent: number
  n_impression: number
  d_ecpm: number
  d_fill_rate: number
  n_users: number
}

/** IAA 构成：国家维度 */
export type RevenueOverviewIaaCountryRow = {
  s_country_code: string
  s_country_name: string
  revenue: number
  percent: number
  n_impression: number
  d_ecpm: number
  n_users: number
  /** 环比（%），正为增长 */
  d_mom_pct: number
}

/** IAA 构成：版本维度 */
export type RevenueOverviewIaaVersionRow = {
  s_app_version: string
  revenue: number
  percent: number
  n_impression: number
  d_ecpm: number
  n_dau: number
  d_crash_rate: number
  is_current: boolean
}

export type RevenueOverviewIapBreakdownRow = {
  s_product: string
  s_type: '订阅' | '一次性'
  revenue: number
  percent: number
  n_buy_times: number
  n_users: number
  d_arppu: number
  d_purchase_rate: number
}

/** IAP 渠道分析表格行 */
export type RevenueOverviewIapChannelRow = {
  s_channel_name: string
  revenue: number
  percent: number
  n_orders: number
  d_arppu: number
  d_conversion_rate: number
  d_refund_rate: number
}

/** IAP 渠道占比条（堆叠图例） */
export type RevenueOverviewIapChannelSegment = {
  key: string
  label: string
  percent: number
  color: string
}

/** IAP 趋势 Tab 底部 KPI 卡片 */
export type RevenueOverviewIapTrendKpiCard = {
  title: string
  valueText: string
  subText?: string
  trendText?: string
  trendUp?: boolean
}

export type RevenueOverviewPieSlice = {
  name: string
  value: number
  percentText: string
  color: string
  moneyText: string
}

export type RevenueOverviewTopCountryRow = {
  s_country_name: string
  s_country_code: string
  iaa: number
  iap: number
  total: number
  percent: number
}

export type RevenueOverviewAiInsight = {
  title: string
  bullets: string[]
}

export type RevenueOverviewQualityMetric = {
  title: string
  valueText: string
  subText: string
  trendText: string
  trendUp: boolean
  accent: 'green' | 'blue' | 'amber'
}

/** IAP 商品 Tab 顶部：订阅 / 一次性摘要（与 KPI 一致） */
export const MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_HEADER = {
  subscriptionValueText: '$74.80',
  subscriptionPctText: '59.1%',
  oneTimeValueText: '$51.72',
  oneTimePctText: '40.9%'
} as const

/** IAP 商品 Tab 底部 mini KPI */
export const MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_FOOT = {
  conversionRateText: '2.4%',
  arppuText: '$10.42',
  renewalRateText: '76.8%'
} as const

export const MOCK_REVENUE_OVERVIEW_FILTERS: RevenueOverviewFilterState = {
  s_app_id: 'weather5',
  platform: 'all',
  s_country_code: 'all',
  app_version: 'all',
  t_date: getAppTodayYYYYMMDD()
}

export const MOCK_REVENUE_OVERVIEW_KPIS: RevenueOverviewKpiCard[] = [
  {
    id: 'kpi_total',
    title: '总收入',
    primaryValue: '$3,068.92',
    subLeftLabel: '广告',
    subLeftValue: '$2,942.40',
    subRightLabel: '付费',
    subRightValue: '$126.52',
    trendUp: true,
    trendPercentText: '↑ 6.4% vs 昨日',
    spark: [2680, 2720, 2650, 2810, 2890, 2920, 3069],
    accent: 'blue'
  },
  {
    id: 'kpi_iaa',
    title: 'IAA 广告收入',
    primaryValue: '$2,942.40',
    subLeftLabel: '真实',
    subLeftValue: '$1,988.20',
    subRightLabel: '预估',
    subRightValue: '↑ 31.9%',
    trendUp: true,
    trendPercentText: '↑ 11.2% vs 昨日',
    spark: [2480, 2550, 2510, 2680, 2780, 2850, 2942],
    accent: 'teal'
  },
  {
    id: 'kpi_iap',
    title: 'IAP 付费收入',
    primaryValue: '$126.52',
    subLeftLabel: '订阅',
    subLeftValue: '$74.80',
    subRightLabel: '一次性',
    subRightValue: '$51.72',
    trendUp: false,
    trendPercentText: '↓ 2.1% vs 昨日',
    spark: [118, 122, 115, 128, 124, 130, 127],
    accent: 'purple'
  },
  {
    id: 'kpi_ecpm',
    title: 'ECPM',
    primaryValue: '3.28',
    subLeftLabel: '预估',
    subLeftValue: '3.05',
    subRightLabel: '偏差',
    subRightValue: '+7.5%',
    trendUp: true,
    trendPercentText: '↑ 4.8% vs 昨日',
    spark: [2.95, 2.98, 3.01, 3.04, 3.06, 3.12, 3.28],
    accent: 'amber'
  },
  {
    id: 'kpi_users',
    title: '广告用户',
    primaryValue: '120,450',
    subLeftLabel: '激活率',
    subLeftValue: '69.2%',
    subRightLabel: 'DAU',
    subRightValue: '174,120',
    trendUp: true,
    trendPercentText: '↑ 2.6% vs 昨日',
    spark: [112300, 114800, 116200, 117800, 118900, 119600, 120450],
    accent: 'green'
  },
  {
    id: 'kpi_arpdau',
    title: 'ARPDAU',
    primaryValue: '$0.01688',
    subLeftLabel: '人均',
    subLeftValue: '占展示 5.1%',
    subRightLabel: ' ',
    subRightValue: ' ',
    trendUp: true,
    trendPercentText: '↑ 2.2% vs 昨日',
    spark: [0.0149, 0.0152, 0.0155, 0.0154, 0.0161, 0.0164, 0.01688],
    accent: 'indigo'
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_TABS = [
  { key: 'ad_type', label: '广告类型' },
  { key: 'platform', label: '广告平台' },
  { key: 'ad_unit', label: '广告位' },
  { key: 'country', label: '国家' },
  { key: 'version', label: '版本' }
] as const

export const MOCK_REVENUE_OVERVIEW_IAA_ROWS: RevenueOverviewIaaBreakdownRow[] = [
  {
    s_ad_type_name: '插屏式广告',
    revenue: 2156,
    percent: 73.3,
    n_users: 62840,
    n_impression: 105820,
    d_avg_display: 1.68,
    d_avg_revenue: 0.034
  },
  {
    s_ad_type_name: '原生广告',
    revenue: 498,
    percent: 16.9,
    n_users: 90120,
    n_impression: 282400,
    d_avg_display: 3.05,
    d_avg_revenue: 0.006
  },
  {
    s_ad_type_name: '横幅广告',
    revenue: 198,
    percent: 6.7,
    n_users: 100200,
    n_impression: 412000,
    d_avg_display: 4.12,
    d_avg_revenue: 0.002
  },
  {
    s_ad_type_name: '开屏广告',
    revenue: 90,
    percent: 3.1,
    n_users: 39200,
    n_impression: 51800,
    d_avg_display: 1.32,
    d_avg_revenue: 0.002
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_COLORS = [
  '#20d6b5',
  '#38bdf8',
  '#8b5cf6',
  '#f59e0b',
  '#22c55e',
  '#ec4899',
  '#94a3b8'
] as const

export const MOCK_REVENUE_OVERVIEW_IAA_PLATFORM_ROWS: RevenueOverviewIaaPlatformRow[] = [
  {
    s_platform_name: 'AdMob',
    revenue: 2088,
    percent: 71.0,
    n_impression: 318200,
    d_ecpm: 6.56,
    n_users: 46100
  },
  {
    s_platform_name: 'AppLovin',
    revenue: 285,
    percent: 9.7,
    n_impression: 104800,
    d_ecpm: 2.72,
    n_users: 18800
  },
  {
    s_platform_name: 'Facebook',
    revenue: 176,
    percent: 6.0,
    n_impression: 90200,
    d_ecpm: 1.95,
    n_users: 12500
  },
  {
    s_platform_name: 'Aumob',
    revenue: 108,
    percent: 3.7,
    n_impression: 42800,
    d_ecpm: 2.52,
    n_users: 9200
  },
  {
    s_platform_name: 'Vungle',
    revenue: 108,
    percent: 3.7,
    n_impression: 40500,
    d_ecpm: 2.67,
    n_users: 8900
  },
  {
    s_platform_name: 'Pangle',
    revenue: 91,
    percent: 3.1,
    n_impression: 36200,
    d_ecpm: 2.51,
    n_users: 7700
  },
  {
    s_platform_name: 'Other',
    revenue: 86,
    percent: 2.8,
    n_impression: 25100,
    d_ecpm: 3.43,
    n_users: 6250
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_AD_UNIT_ROWS: RevenueOverviewIaaAdUnitRow[] = [
  {
    s_ad_unit_name: '插屏广告',
    revenue: 2156,
    percent: 73.3,
    n_impression: 105820,
    d_ecpm: 20.36,
    d_fill_rate: 96.1,
    n_users: 62840
  },
  {
    s_ad_unit_name: '原生广告',
    revenue: 498,
    percent: 16.9,
    n_impression: 282400,
    d_ecpm: 1.76,
    d_fill_rate: 97.4,
    n_users: 90200
  },
  {
    s_ad_unit_name: '横幅广告',
    revenue: 198,
    percent: 6.7,
    n_impression: 412000,
    d_ecpm: 0.48,
    d_fill_rate: 98.9,
    n_users: 100200
  },
  {
    s_ad_unit_name: '开屏广告',
    revenue: 90,
    percent: 3.1,
    n_impression: 51800,
    d_ecpm: 1.74,
    d_fill_rate: 92.5,
    n_users: 39200
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_COUNTRY_ROWS: RevenueOverviewIaaCountryRow[] = [
  {
    s_country_code: 'US',
    s_country_name: '美国',
    revenue: 1088,
    percent: 37.0,
    n_impression: 318200,
    d_ecpm: 3.42,
    n_users: 44500,
    d_mom_pct: 4.8
  },
  {
    s_country_code: 'KR',
    s_country_name: '韩国',
    revenue: 438,
    percent: 14.9,
    n_impression: 126200,
    d_ecpm: 3.47,
    n_users: 18450,
    d_mom_pct: 1.9
  },
  {
    s_country_code: 'DE',
    s_country_name: '德国',
    revenue: 336,
    percent: 11.4,
    n_impression: 97800,
    d_ecpm: 3.44,
    n_users: 14200,
    d_mom_pct: -0.6
  },
  {
    s_country_code: 'TW',
    s_country_name: '台湾',
    revenue: 282,
    percent: 9.6,
    n_impression: 81200,
    d_ecpm: 3.47,
    n_users: 11900,
    d_mom_pct: 1.2
  },
  {
    s_country_code: 'JP',
    s_country_name: '日本',
    revenue: 256,
    percent: 8.7,
    n_impression: 74200,
    d_ecpm: 3.45,
    n_users: 10700,
    d_mom_pct: -1.1
  },
  {
    s_country_code: 'GB',
    s_country_name: '英国',
    revenue: 210,
    percent: 7.1,
    n_impression: 60400,
    d_ecpm: 3.48,
    n_users: 9000,
    d_mom_pct: 0.6
  },
  {
    s_country_code: 'AU',
    s_country_name: '澳大利亚',
    revenue: 184,
    percent: 6.3,
    n_impression: 52800,
    d_ecpm: 3.49,
    n_users: 7700,
    d_mom_pct: 2.8
  },
  {
    s_country_code: 'ZZ',
    s_country_name: 'Other',
    revenue: 150,
    percent: 5.0,
    n_impression: 41400,
    d_ecpm: 3.62,
    n_users: 6300,
    d_mom_pct: 0.3
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_VERSION_ROWS: RevenueOverviewIaaVersionRow[] = [
  {
    s_app_version: 'v4.3.2',
    revenue: 1878,
    percent: 63.8,
    n_impression: 562400,
    d_ecpm: 3.34,
    n_dau: 79200,
    d_crash_rate: 0.11,
    is_current: true
  },
  {
    s_app_version: 'v4.3.1',
    revenue: 668,
    percent: 22.7,
    n_impression: 199800,
    d_ecpm: 3.34,
    n_dau: 28180,
    d_crash_rate: 0.17,
    is_current: false
  },
  {
    s_app_version: 'v4.3.0',
    revenue: 196,
    percent: 6.7,
    n_impression: 57100,
    d_ecpm: 3.29,
    n_dau: 8080,
    d_crash_rate: 0.29,
    is_current: false
  },
  {
    s_app_version: 'v4.2.9',
    revenue: 68,
    percent: 2.3,
    n_impression: 19800,
    d_ecpm: 3.29,
    n_dau: 2800,
    d_crash_rate: 0.44,
    is_current: false
  },
  {
    s_app_version: 'v4.2.8',
    revenue: 22,
    percent: 0.8,
    n_impression: 6400,
    d_ecpm: 3.29,
    n_dau: 850,
    d_crash_rate: 0.62,
    is_current: false
  }
]

export const MOCK_REVENUE_OVERVIEW_IAP_TABS = [
  { key: 'product', label: '商品构成' },
  { key: 'channel', label: '广告平台分析' },
  { key: 'trend', label: '趋势' }
] as const

export const MOCK_REVENUE_OVERVIEW_IAP_ROWS: RevenueOverviewIapBreakdownRow[] = [
  {
    s_product: '月度订阅',
    s_type: '订阅',
    revenue: 30.2,
    percent: 23.9,
    n_buy_times: 1920,
    n_users: 702,
    d_arppu: 9.99,
    d_purchase_rate: 77.2
  },
  {
    s_product: '年度订阅',
    s_type: '订阅',
    revenue: 44.6,
    percent: 35.2,
    n_buy_times: 298,
    n_users: 54,
    d_arppu: 89.99,
    d_purchase_rate: 69.8
  },
  {
    s_product: '一次性高级',
    s_type: '一次性',
    revenue: 24.5,
    percent: 19.4,
    n_buy_times: 2520,
    n_users: 402,
    d_arppu: 4.99,
    d_purchase_rate: 72.5
  },
  {
    s_product: 'VIP会员',
    s_type: '一次性',
    revenue: 18.0,
    percent: 14.2,
    n_buy_times: 468,
    n_users: 172,
    d_arppu: 19.99,
    d_purchase_rate: 25.6
  },
  {
    s_product: '道具包',
    s_type: '一次性',
    revenue: 9.22,
    percent: 7.3,
    n_buy_times: 1288,
    n_users: 204,
    d_arppu: 2.99,
    d_purchase_rate: 10.0
  }
]

export const MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_SEGMENTS: RevenueOverviewIapChannelSegment[] = [
  { key: 'fb', label: 'Facebook Ads', percent: 34.2, color: '#20d6b5' },
  { key: 'gg', label: 'Google Ads', percent: 28.5, color: '#38bdf8' },
  { key: 'tt', label: 'TikTok Ads', percent: 18.0, color: '#a78bfa' },
  { key: 'og', label: 'Organic', percent: 12.8, color: '#f59e0b' },
  { key: 'ot', label: 'Other', percent: 6.5, color: '#94a3b8' }
]

export const MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_ROWS: RevenueOverviewIapChannelRow[] = [
  {
    s_channel_name: 'Facebook Ads',
    revenue: 43.28,
    percent: 34.2,
    n_orders: 3180,
    d_arppu: 14.12,
    d_conversion_rate: 2.5,
    d_refund_rate: 1.1
  },
  {
    s_channel_name: 'Google Ads',
    revenue: 36.04,
    percent: 28.5,
    n_orders: 2560,
    d_arppu: 12.48,
    d_conversion_rate: 2.2,
    d_refund_rate: 1.4
  },
  {
    s_channel_name: 'TikTok Ads',
    revenue: 22.74,
    percent: 18.0,
    n_orders: 1688,
    d_arppu: 11.05,
    d_conversion_rate: 2.0,
    d_refund_rate: 2.0
  },
  {
    s_channel_name: 'Organic',
    revenue: 16.18,
    percent: 12.8,
    n_orders: 1002,
    d_arppu: 14.88,
    d_conversion_rate: 1.7,
    d_refund_rate: 0.7
  },
  {
    s_channel_name: 'Other',
    revenue: 8.28,
    percent: 6.5,
    n_orders: 428,
    d_arppu: 9.95,
    d_conversion_rate: 1.2,
    d_refund_rate: 3.0
  }
]

export const MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_LEFT_METRICS = [
  { title: '广告平台转化率', valueText: '2.4%', accent: 'purple' as const },
  { title: '平均 ARPPU', valueText: '$12.10', accent: 'green' as const },
  { title: '退款率', valueText: '1.6%', accent: 'amber' as const }
]

export const MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES = {
  revenue: [58, 64, 52, 70, 78, 84, 82],
  orders: [4100, 4380, 3920, 4680, 4920, 5108, 4988]
} as const

export const MOCK_REVENUE_OVERVIEW_IAP_TREND_KPIS: RevenueOverviewIapTrendKpiCard[] = [
  {
    title: '订阅收入',
    valueText: '$74.80',
    subText: '占比 59.1%',
    trendText: '+4.8%↑',
    trendUp: true
  },
  {
    title: '一次性购买',
    valueText: '$51.72',
    subText: '占比 40.9%',
    trendText: '-1.8%↓',
    trendUp: false
  },
  {
    title: 'ARPPU',
    valueText: '$12.10',
    trendText: '+2.1%↑',
    trendUp: true
  },
  {
    title: '日均订单',
    valueText: '916单',
    trendText: '+2.9%↑',
    trendUp: true
  },
  {
    title: '付费转化率',
    valueText: '2.4%',
    trendText: '-0.2%↓',
    trendUp: false
  },
  {
    title: '订阅续费率',
    valueText: '76.8%',
    trendText: '+0.9%↑',
    trendUp: true
  }
]

export const MOCK_REVENUE_OVERVIEW_7D_DATES = [
  'Feb27',
  'Feb28',
  'Mar1',
  'Mar2',
  'Mar3',
  'Mar4',
  'Mar5'
]

export const MOCK_REVENUE_OVERVIEW_7D_TREND = {
  iaa: [2650, 2720, 2580, 2820, 2880, 2910, 2942],
  iap: [118, 122, 108, 128, 124, 130, 127]
} as const

export const MOCK_REVENUE_OVERVIEW_ECPM_7D = {
  predicted: [3.02, 2.98, 3.04, 3.01, 3.08, 3.11, 3.18],
  actual: [2.9, 2.95, 3.0, 3.02, 3.12, 3.2, 3.34]
} as const

export const MOCK_REVENUE_OVERVIEW_PLATFORM_PIE: RevenueOverviewPieSlice[] = [
  {
    name: 'AdMob',
    value: 71.0,
    percentText: '71.0%',
    color: '#22c55e',
    moneyText: '$2,088'
  },
  { name: 'AppLovin', value: 9.7, percentText: '9.7%', color: '#38bdf8', moneyText: '$285' },
  { name: 'Facebook', value: 6.0, percentText: '6.0%', color: '#a78bfa', moneyText: '$176' },
  { name: 'Vungle', value: 3.7, percentText: '3.7%', color: '#f59e0b', moneyText: '$108' },
  { name: 'Pangle', value: 3.1, percentText: '3.1%', color: '#fb7185', moneyText: '$91' },
  { name: 'Aumob', value: 3.7, percentText: '3.7%', color: '#60a5fa', moneyText: '$108' },
  { name: 'Other', value: 2.8, percentText: '2.8%', color: '#94a3b8', moneyText: '$86' }
]

export const MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES: RevenueOverviewTopCountryRow[] = [
  {
    s_country_name: '美国',
    s_country_code: 'US',
    iaa: 1088,
    iap: 32.4,
    total: 1120,
    percent: 36.5
  },
  {
    s_country_name: '英国',
    s_country_code: 'GB',
    iaa: 228,
    iap: 14.2,
    total: 242,
    percent: 7.9
  },
  {
    s_country_name: '德国',
    s_country_code: 'DE',
    iaa: 196,
    iap: 9.8,
    total: 206,
    percent: 6.7
  },
  {
    s_country_name: '台湾',
    s_country_code: 'TW',
    iaa: 146,
    iap: 7.2,
    total: 153,
    percent: 5.0
  },
  {
    s_country_name: '日本',
    s_country_code: 'JP',
    iaa: 132,
    iap: 10.8,
    total: 143,
    percent: 4.7
  }
]

export const MOCK_REVENUE_OVERVIEW_AI_INSIGHT: RevenueOverviewAiInsight = {
  title: 'AI 洞察建议',
  bullets: [
    'IAA：插屏广告占比 73.3%，AdMob 在广告平台维度占 71.0%，建议优先优化 AdMob 插屏的填充与竞价策略。',
    'IAP：年度订阅贡献最高（约 33.7%），建议强化年度订阅曝光与价格锚点（$89.99）。',
    'eCPM 偏差约 +7.5%，建议对「预估 eCPM」模型按国家与版本做分桶校准。'
  ]
}

export const MOCK_REVENUE_OVERVIEW_QUALITY_METRICS: RevenueOverviewQualityMetric[] = [
  {
    title: '广告充率',
    valueText: '96.1%',
    subText: '广告填充率',
    trendText: '稳定',
    trendUp: true,
    accent: 'green'
  },
  {
    title: '广告请求成功率',
    valueText: '99.2%',
    subText: '广告请求成功率',
    trendText: '优秀',
    trendUp: true,
    accent: 'blue'
  },
  {
    title: 'ECPM 偏差率',
    valueText: '+7.5%',
    subText: 'ECPM 偏差率',
    trendText: '偏高',
    trendUp: true,
    accent: 'amber'
  },
  {
    title: 'IAP 转化率',
    valueText: '2.4%',
    subText: 'IAP 转化率',
    trendText: '一般',
    trendUp: false,
    accent: 'amber'
  }
]
