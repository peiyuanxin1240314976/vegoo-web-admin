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
  d_ecpm: number
  d_arpdau: number
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
    s_ad_type_name: '插屏广告',
    revenue: 2014,
    percent: 72.8,
    n_users: 61587,
    n_impression: 102551,
    d_ecpm: 1.7,
    d_arpdau: 0.033
  },
  {
    s_ad_type_name: '原生广告',
    revenue: 484,
    percent: 17.5,
    n_users: 8891,
    n_impression: 275249,
    d_ecpm: 3.1,
    d_arpdau: 0.005
  },
  {
    s_ad_type_name: '横幅广告',
    revenue: 191,
    percent: 6.9,
    n_users: 9582,
    n_impression: 405545,
    d_ecpm: 4.1,
    d_arpdau: 0.002
  },
  {
    s_ad_type_name: '开屏广告',
    revenue: 79,
    percent: 2.9,
    n_users: 38044,
    n_impression: 50262,
    d_ecpm: 1.3,
    d_arpdau: 0.002
  }
]

export const MOCK_REVENUE_OVERVIEW_IAP_TABS = [
  { key: 'product', label: '商品构成' },
  { key: 'channel', label: '渠道分析' },
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
