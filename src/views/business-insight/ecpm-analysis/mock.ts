import type {
  EcpmAppRankRow,
  EcpmMapCountryPoint,
  EcpmPlatformSubtotal,
  EcpmPlatformTableRow,
  EcpmTopCountryRow,
  EcpmTrendBundle
} from './types'

/** 与 mock/backend-api/02-overview-kpis.json sampleResponse 一致 */
export const MOCK_ECPM_KPIS = {
  d_ecpm_estimated: 3.32,
  d_ecpm_real: 3.06,
  estimated_change_pct_vs_prev_month: 12.3,
  real_change_pct_vs_prev_month: 8.1,
  top_country: {
    s_country_code: 'US',
    label_display: '美国',
    d_ecpm: 8.23,
    second: { s_country_code: 'KR', label_display: '韩国', d_ecpm: 7.44 }
  },
  top_ad_slot: {
    s_app_id: 'weather_radar',
    s_app_name: 'WeatherRadar',
    n_ad_type_label: '插屏广告',
    d_ecpm: 19.16
  }
}

/** 与 04-table-platform + 小计 */
export const MOCK_ECPM_PLATFORMS: EcpmPlatformTableRow[] = [
  {
    name: 'Admob',
    estimated: 3.32,
    real: 3.06,
    revenue: '$1,861',
    share: '58.9%',
    trend: 'up',
    sparkData: [2.8, 2.9, 3.1, 2.9, 3.0, 3.2, 3.06]
  },
  {
    name: 'Facebook',
    estimated: 2.85,
    real: 2.71,
    revenue: '$285',
    share: '9.0%',
    trend: 'up',
    sparkData: [2.4, 2.5, 2.6, 2.5, 2.7, 2.6, 2.71]
  },
  {
    name: 'Applovin',
    estimated: 4.12,
    real: 3.98,
    revenue: '$412',
    share: '13.0%',
    trend: 'up',
    sparkData: [3.6, 3.7, 3.8, 3.7, 3.9, 3.9, 3.98]
  },
  {
    name: 'Vungle',
    estimated: 3.45,
    real: 3.38,
    revenue: '$345',
    share: '10.9%',
    trend: 'down',
    sparkData: [3.6, 3.5, 3.5, 3.4, 3.4, 3.3, 3.38]
  },
  {
    name: 'Pangle',
    estimated: 2.98,
    real: 2.94,
    revenue: '$298',
    share: '9.4%',
    trend: 'flat',
    sparkData: [2.9, 3.0, 2.9, 2.8, 2.9, 2.95, 2.94]
  }
]

export const MOCK_ECPM_PLATFORM_SUBTOTAL: EcpmPlatformSubtotal = {
  d_ecpm_estimated: 3.32,
  d_ecpm_real: 3.06,
  revenue_display: '$3,201',
  share_display: '100%'
}

/** 与 03-overview-trend.json */
export const MOCK_ECPM_TREND: EcpmTrendBundle = {
  x_labels: Array.from({ length: 30 }, (_, i) => String(i + 1).padStart(2, '0')),
  series_estimated: [
    3.8, 4.1, 3.9, 3.7, 3.6, 3.8, 4.0, 4.2, 3.9, 3.8, 3.7, 3.5, 3.6, 3.8, 4.0, 4.1, 4.3, 4.0, 3.9,
    3.8, 4.0, 4.1, 4.2, 4.0, 3.9, 4.1, 4.3, 4.2, 4.1, 4.3
  ],
  series_real: [
    3.5, 3.7, 3.6, 3.4, 3.3, 3.5, 3.6, 3.8, 3.5, 3.4, 3.3, 3.2, 3.3, 3.4, 3.6, 3.7, 3.9, 3.6, 3.5,
    3.5, 3.6, 3.7, 3.8, 3.7, 3.5, 3.7, 3.9, 3.8, 3.7, 3.9
  ],
  series_revenue: [
    120, 125, 122, 118, 121, 124, 128, 130, 127, 126, 124, 119, 121, 123, 126, 128, 131, 128, 126,
    125, 127, 129, 130, 128, 126, 128, 132, 130, 129, 131
  ]
}

/** 与 05-overview-map-country.json — 地图 series.data */
export const MOCK_ECPM_MAP_COUNTRIES: EcpmMapCountryPoint[] = [
  { s_country_code: 'US', geo_name: 'United States', d_ecpm_estimated: 8.23, d_ecpm_real: 7.95 },
  { s_country_code: 'KR', geo_name: 'South Korea', d_ecpm_estimated: 7.44, d_ecpm_real: 7.2 },
  { s_country_code: 'DE', geo_name: 'Germany', d_ecpm_estimated: 4.51, d_ecpm_real: 4.4 },
  { s_country_code: 'GB', geo_name: 'United Kingdom', d_ecpm_estimated: 3.89, d_ecpm_real: 3.75 },
  { s_country_code: 'JP', geo_name: 'Japan', d_ecpm_estimated: 3.72, d_ecpm_real: 3.6 },
  { s_country_code: 'FR', geo_name: 'France', d_ecpm_estimated: 3.45, d_ecpm_real: 3.33 },
  { s_country_code: 'CA', geo_name: 'Canada', d_ecpm_estimated: 3.21, d_ecpm_real: 3.1 },
  { s_country_code: 'AU', geo_name: 'Australia', d_ecpm_estimated: 2.95, d_ecpm_real: 2.88 },
  { s_country_code: 'BR', geo_name: 'Brazil', d_ecpm_estimated: 2.43, d_ecpm_real: 2.35 },
  { s_country_code: 'ZA', geo_name: 'South Africa', d_ecpm_estimated: 2.18, d_ecpm_real: 2.1 },
  { s_country_code: 'KZ', geo_name: 'Kazakhstan', d_ecpm_estimated: 0.63, d_ecpm_real: 0.6 }
]

/** 与 06-overview-top10-country.json */
export const MOCK_ECPM_TOP_COUNTRIES: EcpmTopCountryRow[] = [
  { s_country_code: 'ZA', label_zh: '南非', d_ecpm: 2.18, bar_color: '#52c41a' },
  { s_country_code: 'BR', label_zh: '巴西', d_ecpm: 2.43, bar_color: '#52c41a' },
  { s_country_code: 'AU', label_zh: '澳大利亚', d_ecpm: 2.95, bar_color: '#52c41a' },
  { s_country_code: 'CA', label_zh: '加拿大', d_ecpm: 3.21, bar_color: '#52c41a' },
  { s_country_code: 'FR', label_zh: '法国', d_ecpm: 3.45, bar_color: '#52c41a' },
  { s_country_code: 'JP', label_zh: '日本', d_ecpm: 3.72, bar_color: '#4db6e8' },
  { s_country_code: 'GB', label_zh: '英国', d_ecpm: 3.89, bar_color: '#4db6e8' },
  { s_country_code: 'DE', label_zh: '德国', d_ecpm: 4.51, bar_color: '#4db6e8' },
  { s_country_code: 'KR', label_zh: '韩国', d_ecpm: 7.44, bar_color: '#00cfb0' },
  { s_country_code: 'US', label_zh: '美国', d_ecpm: 8.23, bar_color: '#00d4aa' }
]

/** 与 07-overview-ad-slot-ranking.json（页面绑定字段 name/value/color） */
export const MOCK_ECPM_AD_SLOTS: { name: string; value: number; color: string }[] = [
  { name: 'WeatherRadar', value: 19.16, color: '#00d4aa' },
  { name: 'HomeResume', value: 14.35, color: '#00d4aa' },
  { name: 'Splash', value: 13.63, color: '#00d4aa' },
  { name: 'HourlyForecast', value: 14.03, color: '#00cfaa' },
  { name: 'Reovu', value: 12.35, color: '#4db6e8' },
  { name: 'DailyDetail', value: 12.32, color: '#4db6e8' },
  { name: 'Monost', value: 9.83, color: '#52c41a' },
  { name: 'Amesus', value: 8.04, color: '#fadb14' },
  { name: 'South', value: 5.68, color: '#ff6b6b' }
]

/** 与 08-overview-app-ranking.json */
export const MOCK_ECPM_APP_RANK: EcpmAppRankRow[] = [
  {
    s_app_name: 'PhoneTracker2',
    icon_text: '📱',
    d_ecpm_estimated: 4.82,
    d_ecpm_real: 4.71,
    revenue_display: '$1,240',
    mom_change_pct: 6.2
  },
  {
    s_app_name: 'WeatherRadar',
    icon_text: '🌤',
    d_ecpm_estimated: 4.51,
    d_ecpm_real: 4.4,
    revenue_display: '$890',
    mom_change_pct: 3.1
  },
  {
    s_app_name: 'SpyApp',
    icon_text: '🔍',
    d_ecpm_estimated: 3.95,
    d_ecpm_real: 3.88,
    revenue_display: '$654',
    mom_change_pct: 1.8
  },
  {
    s_app_name: 'DramaVue',
    icon_text: '🎬',
    d_ecpm_estimated: 3.12,
    d_ecpm_real: 3.05,
    revenue_display: '$432',
    mom_change_pct: -0.5
  },
  {
    s_app_name: 'HealthTracker',
    icon_text: '❤️',
    d_ecpm_estimated: 2.87,
    d_ecpm_real: 2.8,
    revenue_display: '$321',
    mom_change_pct: 2.4
  }
]

/** 与 09-overview-insight-tip.json */
export const MOCK_ECPM_INSIGHT_TIP = '插屏式广告位普遍ECPM较高，建议优先保障展示频次'
