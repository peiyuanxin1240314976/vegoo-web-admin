/** ECPM 分析页 — 与 mock/backend-api 契约及 mock.ts 对齐 */

export type EcpmTrendDirection = 'up' | 'down' | 'flat'

/** 契约/API 层 — 广告平台对比行 */
export interface EcpmPlatformRow {
  /** 广告平台展示名 */
  name: string
  d_ecpm_estimated: number
  d_ecpm_real: number
  /** 预格式化广告收入文案，如 `$1,861` */
  revenue_display: string
  /** 占比文案，如 `58.9%` */
  share_display: string
  trend: EcpmTrendDirection
  /** 迷你趋势 7 点 */
  spark_series: number[]
}

/** 页面表格绑定（与 EcpmDashboard 模板字段一致） */
export interface EcpmPlatformTableRow {
  name: string
  estimated: number
  real: number
  revenue: string
  share: string
  trend: EcpmTrendDirection
  sparkData: number[]
}

export interface EcpmPlatformSubtotal {
  d_ecpm_estimated: number
  d_ecpm_real: number
  revenue_display: string
  share_display: string
}

export interface EcpmAdSlotRow {
  s_ad_unit_label: string
  d_ecpm: number
  bar_color: string
}

export interface EcpmAppRankRow {
  s_app_name: string
  icon_text: string
  d_ecpm_estimated: number
  d_ecpm_real: number
  revenue_display: string
  /** 环比变化百分比，可负 */
  mom_change_pct: number
}

/** 页面应用排行表绑定 */
export interface EcpmAppTableRow {
  name: string
  icon: string
  ecpm: number
  revenue: string
  change: number
}

export interface EcpmMapCountryPoint {
  /** ISO 3166-1 alpha-2 */
  s_country_code: string
  /** ECharts geo 名称，与 `/geo/world.json` 一致 */
  geo_name: string
  d_ecpm_estimated: number
  d_ecpm_real: number
}

export interface EcpmTopCountryRow {
  s_country_code: string
  label_zh: string
  d_ecpm: number
  bar_color: string
}

export interface EcpmTrendBundle {
  /** 横轴日序号或标签，长度与序列一致 */
  x_labels: string[]
  series_estimated: number[]
  series_real: number[]
  series_revenue: number[]
}
