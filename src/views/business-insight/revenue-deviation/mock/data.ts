/**
 * 预估收入偏差 — Mock 数据（与 mock/backend-api 各契约 sampleResponse 一致）
 * 联调远程接口前页面默认走此处。
 */
import type {
  RevenueDeviationAdvice,
  RevenueDeviationCountryTop10,
  RevenueDeviationHistoryRow,
  RevenueDeviationMatrixTable,
  RevenueDeviationOverviewKpis,
  RevenueDeviationOverviewTrend,
  RevenueDeviationPlatformTable,
  RevenueDeviationQuery,
  RevenueDeviationReasonSegment
} from '../types'

function noopFilter<T>(_q: RevenueDeviationQuery, data: T): T {
  return data
}

/** 01-overview-kpis */
export const MOCK_OVERVIEW_KPIS: RevenueDeviationOverviewKpis = {
  d_revenue_estimated: 2768.58,
  d_revenue_real: 1861.23,
  d_deviation_amount: 907.35,
  d_deviation_rate_pct: 8.5,
  n_roi_impact_pp: -8.5,
  d_deviation_rate_history_avg_pct: 6.2,
  s_deviation_badge: '预估偏高'
}

/** 02-overview-trend（30 日） */
export const MOCK_OVERVIEW_TREND: RevenueDeviationOverviewTrend = {
  t_day_labels: Array.from({ length: 30 }, (_, i) => String(i + 1).padStart(2, '0')),
  n_estimated_series: [
    2.1, 2.3, 2.5, 2.8, 3.0, 2.9, 3.2, 3.5, 3.3, 3.1, 2.8, 3.0, 3.4, 3.6, 4.0, 3.8, 3.5, 3.2, 3.0,
    2.8, 2.6, 2.9, 3.1, 3.3, 3.0, 2.7, 2.5, 2.8, 3.0, 3.2
  ],
  n_real_series: [
    1.8, 2.0, 2.1, 2.2, 2.4, 2.3, 2.5, 2.6, 2.5, 2.4, 2.2, 2.4, 2.7, 2.8, 3.2, 3.1, 2.9, 2.7, 2.5,
    2.3, 2.1, 2.4, 2.6, 2.7, 2.5, 2.2, 2.0, 2.3, 2.5, 2.7
  ]
}

/** 03-table-platform */
export const MOCK_TABLE_PLATFORM: RevenueDeviationPlatformTable = {
  rows: [
    {
      s_source_label: 'Admob',
      d_estimated_usd: 2768.58,
      d_real_usd: 1861.23,
      d_deviation_rate_pct: 8.5
    },
    {
      s_source_label: 'Facebook',
      d_estimated_usd: 1778.58,
      d_real_usd: 1861.23,
      d_deviation_rate_pct: 8.5
    },
    {
      s_source_label: 'Applovin',
      d_estimated_usd: 888.53,
      d_real_usd: 876.86,
      d_deviation_rate_pct: 5.2
    },
    {
      s_source_label: 'Vungle',
      d_estimated_usd: 338.8,
      d_real_usd: 297.22,
      d_deviation_rate_pct: -0.3
    },
    {
      s_source_label: 'Pangle',
      d_estimated_usd: 722.5,
      d_real_usd: 399.81,
      d_deviation_rate_pct: -0.9
    }
  ],
  total: {
    s_source_label: '合计',
    d_estimated_usd: 2798.58,
    d_real_usd: 1861.23,
    d_deviation_rate_pct: 8.5
  }
}

/** 04-overview-reason */
export const MOCK_OVERVIEW_REASON: RevenueDeviationReasonSegment[] = [
  { s_label: '预估收入', n_pct: 45, s_color: '#4ade80' },
  { s_label: '美国偏差', n_pct: 28, s_color: '#f59e0b' },
  { s_label: '中沪偏点贡献', n_pct: 18, s_color: '#60a5fa' },
  { s_label: '真实原因', n_pct: 9, s_color: '#f87171' }
]

/** 05-overview-advice */
export const MOCK_OVERVIEW_ADVICE: RevenueDeviationAdvice = {
  lines: ['当前偏差率 8.5%，高于历史平均', '美国偏差页贡献最大 44.2%', '建议重点梳理 Admob']
}

/** 06-overview-country-top10（ISO 码 + 展示名；国旗由前端 flag-icons 渲染） */
export const MOCK_COUNTRY_TOP10: RevenueDeviationCountryTop10 = {
  tab_amount: [
    { s_country_code: 'nl', label_display: '荷兰', n_value: 10 },
    { s_country_code: 'fr', label_display: '法国', n_value: 18 },
    { s_country_code: 'br', label_display: '巴西', n_value: 28 },
    { s_country_code: 'ca', label_display: '加拿大', n_value: 38 },
    { s_country_code: 'au', label_display: '澳大利亚', n_value: 50 },
    { s_country_code: 'jp', label_display: '日本', n_value: 62 },
    { s_country_code: 'kr', label_display: '韩国', n_value: 78 },
    { s_country_code: 'gb', label_display: '英国', n_value: 90 },
    { s_country_code: 'de', label_display: '德国', n_value: 108 },
    { s_country_code: 'us', label_display: '美国', n_value: 180 }
  ],
  tab_rate: [
    { s_country_code: 'nl', label_display: '荷兰', n_value: 2.1 },
    { s_country_code: 'fr', label_display: '法国', n_value: 3.4 },
    { s_country_code: 'br', label_display: '巴西', n_value: 4.2 },
    { s_country_code: 'ca', label_display: '加拿大', n_value: 5.1 },
    { s_country_code: 'au', label_display: '澳大利亚', n_value: 5.8 },
    { s_country_code: 'jp', label_display: '日本', n_value: 6.2 },
    { s_country_code: 'kr', label_display: '韩国', n_value: 7.0 },
    { s_country_code: 'gb', label_display: '英国', n_value: 7.8 },
    { s_country_code: 'de', label_display: '德国', n_value: 8.4 },
    { s_country_code: 'us', label_display: '美国', n_value: 12.4 }
  ]
}

/** 07-table-history */
export const MOCK_TABLE_HISTORY: RevenueDeviationHistoryRow[] = [
  { t_month: '2024–05', d_estimated_usd: 2.01, d_real_usd: 1.32, d_deviation_rate_pct: 8.5 },
  { t_month: '2024–04', d_estimated_usd: 1.29, d_real_usd: 1.3, d_deviation_rate_pct: -6.2 },
  { t_month: '2024–03', d_estimated_usd: 2.51, d_real_usd: 1.32, d_deviation_rate_pct: 5.2 },
  { t_month: '2024–01', d_estimated_usd: 2.57, d_real_usd: 1.32, d_deviation_rate_pct: -5.2 },
  { t_month: '2023–00', d_estimated_usd: 3.19, d_real_usd: 2.48, d_deviation_rate_pct: -6.0 },
  { t_month: '2023–01', d_estimated_usd: 1.85, d_real_usd: 2.84, d_deviation_rate_pct: -0.0 },
  { t_month: '2023–12', d_estimated_usd: 6.16, d_real_usd: 3.54, d_deviation_rate_pct: -0.0 }
]

/** 08-table-matrix */
export const MOCK_TABLE_MATRIX: RevenueDeviationMatrixTable = {
  cols: [
    {
      name: 'Admob',
      key: 'admob',
      total: { estimated: '$9.88', real: '$3.77', deviation: '>15%' }
    },
    {
      name: 'Facebook',
      key: 'facebook',
      total: { estimated: '$6.28', real: '$0.00', deviation: '>15%' }
    },
    {
      name: 'Applovin',
      key: 'applovin',
      total: { estimated: '$3.75', real: '$3.99', deviation: '>15%' }
    },
    {
      name: 'Vungle',
      key: 'vungle',
      total: { estimated: '$0.23', real: '$9.78', deviation: '<8%' }
    }
  ],
  rows: [
    {
      s_app_name: 'WeatherRadar',
      s_app_icon_emoji: '🌤',
      s_icon_color: '#1e3a5f',
      admob: { estimated: '$9.33', real: '$2.79', deviation: '>15%' },
      facebook: { estimated: '$1.90', real: '$1.18', deviation: '>15%' },
      applovin: { estimated: '$3.96', real: '$2.98', deviation: '>15%' },
      vungle: { estimated: '$3.92', real: '$2.21', deviation: '>15%' }
    },
    {
      s_app_name: 'PhoneTracker',
      s_app_icon_emoji: '📍',
      s_icon_color: '#1a3a2a',
      admob: { estimated: '$2.33', real: '$2.89', deviation: '8–15%' },
      facebook: { estimated: '$1.78', real: '$1.67', deviation: '8–15%' },
      applovin: { estimated: '$2.99', real: '$3.80', deviation: '8–15%' },
      vungle: { estimated: '$2.38', real: '$0.65', deviation: '8–15%' }
    },
    {
      s_app_name: 'BloodSugar2',
      s_app_icon_emoji: '💉',
      s_icon_color: '#3a1a1a',
      admob: { estimated: '$3.42', real: '$1.99', deviation: '<8%' },
      facebook: { estimated: '$1.28', real: '$0.04', deviation: '<8%' },
      applovin: { estimated: '$9.16', real: '$4.06', deviation: '<8%' },
      vungle: { estimated: '$1.29', real: '$0.08', deviation: '<8%' }
    },
    {
      s_app_name: 'HealthTracker',
      s_app_icon_emoji: '❤️',
      s_icon_color: '#3a1a2a',
      admob: { estimated: '$1.67', real: '$2.42', deviation: '<8%' },
      facebook: { estimated: '$2.35', real: '$2.23', deviation: '<3%' },
      applovin: { estimated: '$3.73', real: '$4.23', deviation: '<8%' },
      vungle: { estimated: '$1.03', real: '$9.91', deviation: '<8%' }
    },
    {
      s_app_name: 'FaceMe',
      s_app_icon_emoji: '😊',
      s_icon_color: '#1a1a3a',
      admob: { estimated: '$1.77', real: '$2.38', deviation: '<8%' },
      facebook: { estimated: '$3.22', real: '$2.00', deviation: '<3%' },
      applovin: { estimated: '$191', real: '$2.04', deviation: '<5%' },
      vungle: { estimated: '$63', real: '$80', deviation: '<5%' }
    }
  ]
}

export function mockFetchRevenueDeviationOverviewKpis(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, { ...MOCK_OVERVIEW_KPIS }))
}

export function mockFetchRevenueDeviationOverviewTrend(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, { ...MOCK_OVERVIEW_TREND }))
}

export function mockFetchRevenueDeviationTablePlatform(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, structuredClone(MOCK_TABLE_PLATFORM)))
}

export function mockFetchRevenueDeviationOverviewReason(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, [...MOCK_OVERVIEW_REASON]))
}

export function mockFetchRevenueDeviationOverviewAdvice(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, { ...MOCK_OVERVIEW_ADVICE }))
}

export function mockFetchRevenueDeviationOverviewCountryTop10(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, structuredClone(MOCK_COUNTRY_TOP10)))
}

export function mockFetchRevenueDeviationTableHistory(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, [...MOCK_TABLE_HISTORY]))
}

export function mockFetchRevenueDeviationTableMatrix(q: RevenueDeviationQuery) {
  return Promise.resolve(noopFilter(q, structuredClone(MOCK_TABLE_MATRIX)))
}
