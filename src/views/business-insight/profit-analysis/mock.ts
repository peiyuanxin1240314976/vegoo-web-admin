export type ProfitAnalysisFilterState = {
  /** 应用 */
  s_app_id: string
  /** 国家 */
  s_country_code: string
  /** 开始日期（YYYY-MM-DD） */
  t_date_start: string
  /** 结束日期（YYYY-MM-DD） */
  t_date_end: string
}

export type ProfitAnalysisKpiCard = {
  id: string
  title: string
  valueText: string
  subText: string
  accent: 'purple' | 'green' | 'amber' | 'blue' | 'cyan'
  /** 是否显示提示标识（原型中的小三角） */
  warning?: boolean
}

export type ProfitAnalysisAppProfitRow = {
  s_app_name: string
  /** 广告收入 */
  d_ad_revenue: number
  /** 付费收入 */
  d_iap_revenue: number
  /** 总收入 */
  d_total_revenue: number
  /** 广告支出 */
  d_ad_spend: number
  /** 预估利润 */
  d_est_profit: number
  /** 利润率（0~100） */
  d_profit_rate: number
  /** 趋势（近7点） */
  trend: number[]
}

export type ProfitAnalysisCountryProfitPoint = {
  /** GeoJSON 名称（英文，与 world.json 对齐） */
  s_country_name_en: string
  /** 国家中文名 */
  s_country_name_cn: string
  /** ISO 3166-1 alpha-2 */
  s_country_code: string
  /** 利润（正负都可能） */
  d_profit: number
  /** 展示用文本（如 +$18,200） */
  s_profit_text: string
  /** 经度 */
  d_lng: number
  /** 纬度 */
  d_lat: number
}

export type ProfitAnalysisCountryTopRow = {
  s_country_code: string
  s_country_name_cn: string
  d_ad_revenue: number
  d_iap_revenue: number
  d_ad_spend: number
  d_profit: number
  d_profit_rate: number
}

export type ProfitAnalysisTrend30dPoint = {
  /** 第N天（1~30） */
  n_day: number
  /** 总收入 */
  d_total_revenue: number
  /** 广告支出 */
  d_ad_spend: number
  /** 预估利润 */
  d_est_profit: number
}

export type ProfitAnalysisSankeyNode = {
  name: string
  valueDisplay?: string
  itemStyle?: { color?: string; borderRadius?: number }
}

export type ProfitAnalysisSankeyLink = {
  source: string
  target: string
  value: number
}

export const MOCK_PROFIT_ANALYSIS_FILTERS: ProfitAnalysisFilterState = {
  s_app_id: 'all',
  s_country_code: 'all',
  t_date_start: '2026-03-01',
  t_date_end: '2026-03-05'
}

export const MOCK_PROFIT_ANALYSIS_KPIS: ProfitAnalysisKpiCard[] = [
  {
    id: 'kpi_profit',
    title: '预估利润',
    valueText: '+$36,440',
    subText: '广告收入+付费 - 广告支出',
    accent: 'purple',
    warning: true
  },
  {
    id: 'kpi_total',
    title: '总收入',
    valueText: '$125,680',
    subText: '广告$98,240 + 付费$27,440',
    accent: 'green'
  },
  {
    id: 'kpi_spend',
    title: '广告支出',
    valueText: '$89,240',
    subText: '自投$88,934 + 代投$306',
    accent: 'amber'
  },
  {
    id: 'kpi_roi',
    title: '广告收益率',
    valueText: '40.8%',
    subText: '(广告收入 - 广告支出) / 广告支出',
    accent: 'blue'
  },
  {
    id: 'kpi_iap_ratio',
    title: '付费收入占比',
    valueText: '21.8%',
    subText: '付费$27,440 / 总$125,680',
    accent: 'cyan'
  }
]

export const MOCK_PROFIT_ANALYSIS_APP_PROFIT_ROWS: ProfitAnalysisAppProfitRow[] = [
  {
    s_app_name: 'Weather5',
    d_ad_revenue: 45200,
    d_iap_revenue: 12100,
    d_total_revenue: 57300,
    d_ad_spend: 38500,
    d_est_profit: 18800,
    d_profit_rate: 32.8,
    trend: [120, 260, 180, 310, 280, 360, 420]
  },
  {
    s_app_name: 'PhoneTracker',
    d_ad_revenue: 28600,
    d_iap_revenue: 8200,
    d_total_revenue: 36800,
    d_ad_spend: 22400,
    d_est_profit: 14400,
    d_profit_rate: 39.1,
    trend: [90, 140, 120, 210, 200, 260, 310]
  },
  {
    s_app_name: 'BloodSugar2',
    d_ad_revenue: 15300,
    d_iap_revenue: 4800,
    d_total_revenue: 20100,
    d_ad_spend: 18200,
    d_est_profit: 1900,
    d_profit_rate: 9.5,
    trend: [80, 110, 105, 98, 115, 122, 130]
  },
  {
    s_app_name: 'HealthTracker',
    d_ad_revenue: 9100,
    d_iap_revenue: 2340,
    d_total_revenue: 11440,
    d_ad_spend: 10140,
    d_est_profit: -700,
    d_profit_rate: -6.1,
    trend: [160, 150, 142, 138, 120, 108, 96]
  },
  {
    s_app_name: 'FaceMe',
    d_ad_revenue: 0,
    d_iap_revenue: 0,
    d_total_revenue: 0,
    d_ad_spend: 0,
    d_est_profit: 0,
    d_profit_rate: 0,
    trend: [0, 0, 0, 0, 0, 0, 0]
  }
]

export const MOCK_PROFIT_ANALYSIS_COUNTRY_POINTS: ProfitAnalysisCountryProfitPoint[] = [
  {
    s_country_name_en: 'United States of America',
    s_country_name_cn: '美国',
    s_country_code: 'US',
    d_profit: 18200,
    s_profit_text: '+$18,200',
    d_lng: -98.5,
    d_lat: 39.8
  },
  {
    s_country_name_en: 'Germany',
    s_country_name_cn: '德国',
    s_country_code: 'DE',
    d_profit: 3200,
    s_profit_text: '+$3,200',
    d_lng: 10.4,
    d_lat: 51.1
  },
  {
    s_country_name_en: 'South Africa',
    s_country_name_cn: '南非',
    s_country_code: 'ZA',
    d_profit: 2100,
    s_profit_text: '+$2,100',
    d_lng: 24.7,
    d_lat: -28.4
  },
  {
    s_country_name_en: 'Korea',
    s_country_name_cn: '韩国',
    s_country_code: 'KR',
    d_profit: 4800,
    s_profit_text: '+$4,800',
    d_lng: 127.8,
    d_lat: 36.6
  }
]

export const MOCK_PROFIT_ANALYSIS_COUNTRY_TOP10: ProfitAnalysisCountryTopRow[] = [
  {
    s_country_code: 'US',
    s_country_name_cn: '美国',
    d_ad_revenue: 52000,
    d_iap_revenue: 14200,
    d_ad_spend: 38500,
    d_profit: 27700,
    d_profit_rate: 53.3
  },
  {
    s_country_code: 'KR',
    s_country_name_cn: '韩国',
    d_ad_revenue: 11200,
    d_iap_revenue: 3100,
    d_ad_spend: 8400,
    d_profit: 5900,
    d_profit_rate: 52.7
  },
  {
    s_country_code: 'DE',
    s_country_name_cn: '德国',
    d_ad_revenue: 7800,
    d_iap_revenue: 2200,
    d_ad_spend: 6100,
    d_profit: 3900,
    d_profit_rate: 50.0
  },
  {
    s_country_code: 'ZA',
    s_country_name_cn: '南非',
    d_ad_revenue: 9600,
    d_iap_revenue: 1200,
    d_ad_spend: 8200,
    d_profit: 2600,
    d_profit_rate: 27.1
  }
]

export const MOCK_PROFIT_ANALYSIS_TREND_30D: ProfitAnalysisTrend30dPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const n_day = i + 1
    const base = 2400 + Math.sin(i / 2.2) * 450 + (i % 7 === 0 ? 600 : 0)
    const d_total_revenue = Math.max(0, Math.round(base + (i % 5) * 60))
    const d_ad_spend = Math.max(0, Math.round(d_total_revenue * (0.62 + Math.cos(i / 3.1) * 0.06)))
    const d_est_profit = Math.round(d_total_revenue - d_ad_spend - 240 + Math.sin(i / 4.7) * 80)
    return { n_day, d_total_revenue, d_ad_spend, d_est_profit }
  }
)

export const MOCK_PROFIT_ANALYSIS_SANKEY = {
  nodes: [
    { name: '广告收入(IAA)', valueDisplay: '$98,240', itemStyle: { color: '#22c55e' } },
    { name: '付费收入(IAP)', valueDisplay: '$27,440', itemStyle: { color: '#38bdf8' } },
    { name: '总收入', valueDisplay: '$125,680', itemStyle: { color: '#10b981' } },
    { name: '广告支出', valueDisplay: '$89,240', itemStyle: { color: '#f59e0b' } },
    { name: '预估利润', valueDisplay: '$36,440', itemStyle: { color: '#a78bfa' } }
  ] as ProfitAnalysisSankeyNode[],
  links: [
    { source: '广告收入(IAA)', target: '总收入', value: 98240 },
    { source: '付费收入(IAP)', target: '总收入', value: 27440 },
    { source: '总收入', target: '广告支出', value: 89240 },
    { source: '总收入', target: '预估利润', value: 36440 }
  ] as ProfitAnalysisSankeyLink[]
}
