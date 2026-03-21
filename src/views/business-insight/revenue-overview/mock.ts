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

export const MOCK_REVENUE_OVERVIEW_FILTERS: RevenueOverviewFilterState = {
  s_app_id: 'weather5',
  platform: 'all',
  s_country_code: 'all',
  app_version: 'all',
  t_date: '2026-03-05'
}

export const MOCK_REVENUE_OVERVIEW_KPIS: RevenueOverviewKpiCard[] = [
  {
    id: 'kpi_total',
    title: '总收入',
    primaryValue: '$2,855.05',
    subLeftLabel: '广告',
    subLeftValue: '$2,768.58',
    subRightLabel: '付费',
    subRightValue: '$86.47',
    trendUp: true,
    trendPercentText: '↑ 8.3% vs 昨日',
    spark: [2100, 2250, 1980, 2400, 2650, 2768, 2855],
    accent: 'blue'
  },
  {
    id: 'kpi_iaa',
    title: 'IAA 广告收入',
    primaryValue: '$2,768.58',
    subLeftLabel: '真实',
    subLeftValue: '$1,861.23',
    subRightLabel: '预估',
    subRightValue: '↑ 32.7%',
    trendUp: true,
    trendPercentText: '↑ 12.3% vs 昨日',
    spark: [1800, 1900, 1750, 2050, 2350, 2560, 2769],
    accent: 'teal'
  },
  {
    id: 'kpi_iap',
    title: 'IAP 付费收入',
    primaryValue: '$86.47',
    subLeftLabel: '订阅',
    subLeftValue: '$52.30',
    subRightLabel: '一次性',
    subRightValue: '$34.17',
    trendUp: false,
    trendPercentText: '↓ 3.2% vs 昨日',
    spark: [92, 88, 81, 79, 95, 90, 86],
    accent: 'purple'
  },
  {
    id: 'kpi_ecpm',
    title: 'ECPM',
    primaryValue: '3.32',
    subLeftLabel: '预估',
    subLeftValue: '3.06',
    subRightLabel: '偏差',
    subRightValue: '+8.5%',
    trendUp: true,
    trendPercentText: '↑ 5.2% vs 昨日',
    spark: [2.88, 2.92, 2.97, 2.95, 3.02, 3.12, 3.32],
    accent: 'amber'
  },
  {
    id: 'kpi_users',
    title: '广告用户',
    primaryValue: '117,483',
    subLeftLabel: '激活率',
    subLeftValue: '68.6%',
    subRightLabel: 'DAU',
    subRightValue: '171,334',
    trendUp: true,
    trendPercentText: '↑ 3.1% vs 昨日',
    spark: [101200, 104500, 108900, 112300, 114200, 116600, 117483],
    accent: 'green'
  },
  {
    id: 'kpi_arpdau',
    title: 'ARPDAU',
    primaryValue: '$0.01616',
    subLeftLabel: '人均',
    subLeftValue: '占展示 4.9%',
    subRightLabel: ' ',
    subRightValue: ' ',
    trendUp: true,
    trendPercentText: '↑ 2.8% vs 昨日',
    spark: [0.0142, 0.0146, 0.0151, 0.015, 0.0156, 0.0159, 0.01616],
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
    revenue: 2014,
    percent: 72.8,
    n_users: 61587,
    n_impression: 102551,
    d_avg_display: 1.7,
    d_avg_revenue: 0.033
  },
  {
    s_ad_type_name: '原生广告',
    revenue: 484,
    percent: 17.5,
    n_users: 88891,
    n_impression: 275249,
    d_avg_display: 3.1,
    d_avg_revenue: 0.005
  },
  {
    s_ad_type_name: '横幅广告',
    revenue: 191,
    percent: 6.9,
    n_users: 99582,
    n_impression: 405545,
    d_avg_display: 4.1,
    d_avg_revenue: 0.002
  },
  {
    s_ad_type_name: '开屏广告',
    revenue: 79,
    percent: 2.8,
    n_users: 38044,
    n_impression: 50262,
    d_avg_display: 1.3,
    d_avg_revenue: 0.002
  }
]

/** IAA 构成分析：调色板（堆叠条 / 环形图 / 图例复用） */
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
    revenue: 1985,
    percent: 71.7,
    n_impression: 308742,
    d_ecpm: 6.43,
    n_users: 45210
  },
  {
    s_platform_name: 'AppLovin',
    revenue: 257,
    percent: 9.3,
    n_impression: 102400,
    d_ecpm: 2.51,
    n_users: 18420
  },
  {
    s_platform_name: 'Facebook',
    revenue: 166,
    percent: 6.0,
    n_impression: 88500,
    d_ecpm: 1.88,
    n_users: 12200
  },
  {
    s_platform_name: 'Aumob',
    revenue: 102,
    percent: 3.7,
    n_impression: 41200,
    d_ecpm: 2.48,
    n_users: 9100
  },
  {
    s_platform_name: 'Vungle',
    revenue: 102,
    percent: 3.7,
    n_impression: 39800,
    d_ecpm: 2.56,
    n_users: 8800
  },
  {
    s_platform_name: 'Pangle',
    revenue: 86,
    percent: 3.1,
    n_impression: 35600,
    d_ecpm: 2.42,
    n_users: 7600
  },
  {
    s_platform_name: 'Other',
    revenue: 70,
    percent: 2.5,
    n_impression: 24365,
    d_ecpm: 2.87,
    n_users: 6153
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_AD_UNIT_ROWS: RevenueOverviewIaaAdUnitRow[] = [
  {
    s_ad_unit_name: '插屏广告',
    revenue: 2014,
    percent: 72.8,
    n_impression: 102551,
    d_ecpm: 19.64,
    d_fill_rate: 94.2,
    n_users: 61587
  },
  {
    s_ad_unit_name: '原生广告',
    revenue: 484,
    percent: 17.5,
    n_impression: 275249,
    d_ecpm: 1.76,
    d_fill_rate: 96.8,
    n_users: 8891
  },
  {
    s_ad_unit_name: '横幅广告',
    revenue: 191,
    percent: 6.9,
    n_impression: 405545,
    d_ecpm: 0.47,
    d_fill_rate: 98.7,
    n_users: 9582
  },
  {
    s_ad_unit_name: '开屏广告',
    revenue: 79,
    percent: 2.8,
    n_impression: 50262,
    d_ecpm: 1.57,
    d_fill_rate: 91.3,
    n_users: 38044
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_COUNTRY_ROWS: RevenueOverviewIaaCountryRow[] = [
  {
    s_country_code: 'US',
    s_country_name: '美国',
    revenue: 1026,
    percent: 37.1,
    n_impression: 308742,
    d_ecpm: 3.32,
    n_users: 43521,
    d_mom_pct: 5.2
  },
  {
    s_country_code: 'KR',
    s_country_name: '韩国',
    revenue: 412,
    percent: 14.9,
    n_impression: 124500,
    d_ecpm: 3.31,
    n_users: 18200,
    d_mom_pct: 2.1
  },
  {
    s_country_code: 'DE',
    s_country_name: '德国',
    revenue: 318,
    percent: 11.5,
    n_impression: 96500,
    d_ecpm: 3.29,
    n_users: 14100,
    d_mom_pct: -0.8
  },
  {
    s_country_code: 'TW',
    s_country_name: '台湾',
    revenue: 265,
    percent: 9.6,
    n_impression: 80200,
    d_ecpm: 3.3,
    n_users: 11800,
    d_mom_pct: 1.4
  },
  {
    s_country_code: 'JP',
    s_country_name: '日本',
    revenue: 241,
    percent: 8.7,
    n_impression: 73100,
    d_ecpm: 3.3,
    n_users: 10600,
    d_mom_pct: -1.3
  },
  {
    s_country_code: 'GB',
    s_country_name: '英国',
    revenue: 198,
    percent: 7.2,
    n_impression: 59800,
    d_ecpm: 3.31,
    n_users: 8900,
    d_mom_pct: 0.6
  },
  {
    s_country_code: 'AU',
    s_country_name: '澳大利亚',
    revenue: 173,
    percent: 6.2,
    n_impression: 52100,
    d_ecpm: 3.32,
    n_users: 7600,
    d_mom_pct: 3.0
  },
  {
    s_country_code: 'ZZ',
    s_country_name: 'Other',
    revenue: 135,
    percent: 4.8,
    n_impression: 40665,
    d_ecpm: 3.32,
    n_users: 6162,
    d_mom_pct: 0.4
  }
]

export const MOCK_REVENUE_OVERVIEW_IAA_VERSION_ROWS: RevenueOverviewIaaVersionRow[] = [
  {
    s_app_version: 'v4.2.1',
    revenue: 1842,
    percent: 66.5,
    n_impression: 554551,
    d_ecpm: 3.32,
    n_dau: 78142,
    d_crash_rate: 0.12,
    is_current: true
  },
  {
    s_app_version: 'v4.2.0',
    revenue: 654,
    percent: 23.6,
    n_impression: 196931,
    d_ecpm: 3.32,
    n_dau: 27782,
    d_crash_rate: 0.18,
    is_current: false
  },
  {
    s_app_version: 'v4.1.9',
    revenue: 187,
    percent: 6.8,
    n_impression: 56285,
    d_ecpm: 3.32,
    n_dau: 7954,
    d_crash_rate: 0.31,
    is_current: false
  },
  {
    s_app_version: 'v4.1.8',
    revenue: 65,
    percent: 2.3,
    n_impression: 19573,
    d_ecpm: 3.32,
    n_dau: 2767,
    d_crash_rate: 0.45,
    is_current: false
  },
  {
    s_app_version: 'v4.1.7',
    revenue: 20,
    percent: 0.8,
    n_impression: 6267,
    d_ecpm: 3.32,
    n_dau: 838,
    d_crash_rate: 0.67,
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
    revenue: 18.02,
    percent: 21.8,
    n_buy_times: 1842,
    n_users: 684,
    d_arppu: 9.99,
    d_purchase_rate: 78.4
  },
  {
    s_product: '年度订阅',
    s_type: '订阅',
    revenue: 25.55,
    percent: 29.4,
    n_buy_times: 284,
    n_users: 52,
    d_arppu: 89.99,
    d_purchase_rate: 68.4
  },
  {
    s_product: '一次性高级',
    s_type: '一次性',
    revenue: 12.25,
    percent: 14.1,
    n_buy_times: 2456,
    n_users: 386,
    d_arppu: 4.99,
    d_purchase_rate: 72.1
  },
  {
    s_product: 'VIP会员',
    s_type: '一次性',
    revenue: 9.12,
    percent: 10.6,
    n_buy_times: 456,
    n_users: 164,
    d_arppu: 19.99,
    d_purchase_rate: 24.4
  },
  {
    s_product: '道具包',
    s_type: '一次性',
    revenue: 3.72,
    percent: 4.3,
    n_buy_times: 1245,
    n_users: 196,
    d_arppu: 2.99,
    d_purchase_rate: 10.0
  }
]

export const MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_SEGMENTS: RevenueOverviewIapChannelSegment[] = [
  { key: 'fb', label: 'Facebook Ads', percent: 35.2, color: '#20d6b5' },
  { key: 'gg', label: 'Google Ads', percent: 28.0, color: '#38bdf8' },
  { key: 'tt', label: 'TikTok Ads', percent: 18.5, color: '#a78bfa' },
  { key: 'og', label: 'Organic', percent: 12.3, color: '#f59e0b' },
  { key: 'ot', label: 'Other', percent: 6.0, color: '#94a3b8' }
]

export const MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_ROWS: RevenueOverviewIapChannelRow[] = [
  {
    s_channel_name: 'Facebook Ads',
    revenue: 30.42,
    percent: 35.2,
    n_orders: 3120,
    d_arppu: 13.76,
    d_conversion_rate: 2.4,
    d_refund_rate: 1.2
  },
  {
    s_channel_name: 'Google Ads',
    revenue: 24.19,
    percent: 28.0,
    n_orders: 2480,
    d_arppu: 12.15,
    d_conversion_rate: 2.1,
    d_refund_rate: 1.5
  },
  {
    s_channel_name: 'TikTok Ads',
    revenue: 15.98,
    percent: 18.5,
    n_orders: 1650,
    d_arppu: 11.2,
    d_conversion_rate: 1.9,
    d_refund_rate: 2.1
  },
  {
    s_channel_name: 'Organic',
    revenue: 10.64,
    percent: 12.3,
    n_orders: 980,
    d_arppu: 14.5,
    d_conversion_rate: 1.6,
    d_refund_rate: 0.8
  },
  {
    s_channel_name: 'Other',
    revenue: 5.17,
    percent: 6.0,
    n_orders: 420,
    d_arppu: 9.8,
    d_conversion_rate: 1.1,
    d_refund_rate: 3.2
  }
]

export const MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_LEFT_METRICS = [
  { title: '广告平台转化率', valueText: '2.1%', accent: 'purple' as const },
  { title: '平均 ARPPU', valueText: '$13.76', accent: 'green' as const },
  { title: '退款率', valueText: '1.8%', accent: 'amber' as const }
]

export const MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES = {
  revenue: [62, 68, 55, 72, 80, 88, 86],
  orders: [4200, 4510, 3800, 4900, 5100, 5231, 4980]
} as const

export const MOCK_REVENUE_OVERVIEW_IAP_TREND_KPIS: RevenueOverviewIapTrendKpiCard[] = [
  {
    title: '订阅收入',
    valueText: '$52.30',
    subText: '占比 60.5%',
    trendText: '+5.2%↑',
    trendUp: true
  },
  {
    title: '一次性购买',
    valueText: '$34.17',
    subText: '占比 39.5%',
    trendText: '-2.1%↓',
    trendUp: false
  },
  {
    title: 'ARPPU',
    valueText: '$13.76',
    trendText: '+1.8%↑',
    trendUp: true
  },
  {
    title: '日均订单',
    valueText: '898单',
    trendText: '+3.2%↑',
    trendUp: true
  },
  {
    title: '付费转化率',
    valueText: '2.1%',
    trendText: '-0.3%↓',
    trendUp: false
  },
  {
    title: '订阅续费率',
    valueText: '78.4%',
    trendText: '+1.2%↑',
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
  iaa: [1820, 2100, 1950, 2300, 2500, 2768, 2855],
  iap: [72, 85, 68, 92, 78, 95, 86]
} as const

export const MOCK_REVENUE_OVERVIEW_ECPM_7D = {
  predicted: [2.98, 2.92, 2.95, 2.93, 2.99, 3.01, 3.06],
  actual: [2.9, 2.88, 2.91, 2.94, 2.97, 3.02, 3.32]
} as const

export const MOCK_REVENUE_OVERVIEW_PLATFORM_PIE: RevenueOverviewPieSlice[] = [
  {
    name: 'Admob',
    value: 71.7,
    percentText: '71.7%',
    color: '#22c55e',
    moneyText: '$1,985'
  },
  { name: 'Facebook', value: 9.3, percentText: '9.3%', color: '#38bdf8', moneyText: '$257' },
  { name: 'Applovin', value: 6.0, percentText: '6.0%', color: '#a78bfa', moneyText: '$166' },
  { name: 'Vungle', value: 3.7, percentText: '3.7%', color: '#f59e0b', moneyText: '$102' },
  { name: 'Pangle', value: 3.1, percentText: '3.1%', color: '#fb7185', moneyText: '$86' },
  { name: 'Aumob', value: 3.7, percentText: '3.7%', color: '#60a5fa', moneyText: '$102' },
  { name: 'Other', value: 2.6, percentText: '2.6%', color: '#94a3b8', moneyText: '$72' }
]

export const MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES: RevenueOverviewTopCountryRow[] = [
  {
    s_country_name: '美国',
    s_country_code: 'US',
    iaa: 1026,
    iap: 28.5,
    total: 1054,
    percent: 36.9
  },
  { s_country_name: '英国', s_country_code: 'GB', iaa: 216, iap: 12.3, total: 228, percent: 8.0 },
  { s_country_name: '德国', s_country_code: 'DE', iaa: 185, iap: 8.2, total: 193, percent: 6.8 },
  { s_country_name: '台湾', s_country_code: 'TW', iaa: 137, iap: 6.1, total: 143, percent: 5.0 },
  { s_country_name: '日本', s_country_code: 'JP', iaa: 124, iap: 9.8, total: 134, percent: 4.7 }
]

export const MOCK_REVENUE_OVERVIEW_AI_INSIGHT: RevenueOverviewAiInsight = {
  title: 'AI 洞察建议',
  bullets: [
    'IAA：插屏广告占比 72.8%，Admob 占比 71.7%，建议优先优化 Admob 插屏的填充与竞价策略。',
    'IAP：年度订阅贡献最高，建议增加年度订阅的展示曝光与价格锚点（$89.99）。',
    'ECPM 偏差 +8.5%，建议对「预估 eCPM」模型按国家/版本做分桶校准。'
  ]
}

export const MOCK_REVENUE_OVERVIEW_QUALITY_METRICS: RevenueOverviewQualityMetric[] = [
  {
    title: '广告充率',
    valueText: '94.2%',
    subText: '广告填充率',
    trendText: '稳定',
    trendUp: true,
    accent: 'green'
  },
  {
    title: '广告请求成功率',
    valueText: '98.7%',
    subText: '广告请求成功率',
    trendText: '优秀',
    trendUp: true,
    accent: 'blue'
  },
  {
    title: 'ECPM 偏差率',
    valueText: '+8.5%',
    subText: 'ECPM 偏差率',
    trendText: '偏高',
    trendUp: true,
    accent: 'amber'
  },
  {
    title: 'IAP 转化率',
    valueText: '2.1%',
    subText: 'IAP 转化率',
    trendText: '一般',
    trendUp: false,
    accent: 'amber'
  }
]
