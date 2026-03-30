/**
 * 预估收入偏差页 — 与 mock/backend-api 契约及 mock/data 对齐
 */

/** 列表查询（筛选） */
export type RevenueDeviationQuery = {
  t_start_date: string
  t_end_date: string
  /** 广告平台 slug，空为全部（与页面 `platform` 筛选项一致） */
  source?: string
  /** 应用，空为全部 */
  s_app_id?: string
  /**
   * 右上角「平台」筛选（广告平台编码，空为全部）
   * 当前产品要求：作为全局筛选参数，下方所有卡片接口均透传
   */
  matrix_source?: string
  /** 右上角维度切换：行维度（默认 app） */
  row_dim?: RevenueDeviationMatrixRowDim
  /** 右上角维度切换：列维度（默认 platform） */
  col_dim?: RevenueDeviationMatrixColDim
}

export type RevenueDeviationFilterOption = {
  value: string
  label: string
}

export type RevenueDeviationMetaFilterOptions = {
  apps: RevenueDeviationFilterOption[]
  sources: RevenueDeviationFilterOption[]
}

/** 08-table-matrix 请求额外参数 */
export type RevenueDeviationMatrixRowDim = 'app' | 'platform' | 'date'
export type RevenueDeviationMatrixColDim = 'platform' | 'date'

export type RevenueDeviationMatrixQuery = RevenueDeviationQuery

/** 01-overview-kpis */
export type RevenueDeviationOverviewKpis = {
  d_revenue_estimated: number
  d_revenue_real: number
  d_deviation_amount: number
  d_deviation_rate_pct: number
  /** ROI 影响，百分点，如 -8.5 表示 -8.5pp */
  n_roi_impact_pp: number
  d_deviation_rate_history_avg_pct: number
  /** 偏差标签：预估偏高 / 预估偏低 */
  s_deviation_badge: string
}

/** 02-overview-trend */
export type RevenueDeviationOverviewTrend = {
  t_day_labels: string[]
  n_estimated_series: number[]
  n_real_series: number[]
}

/** 03-table-platform */
export type RevenueDeviationPlatformRow = {
  s_source_label: string
  d_estimated_usd: number
  d_real_usd: number
  d_deviation_rate_pct: number
}

export type RevenueDeviationPlatformTable = {
  rows: RevenueDeviationPlatformRow[]
  total: RevenueDeviationPlatformRow
}

/** 04-overview-reason */
export type RevenueDeviationReasonSegment = {
  s_label: string
  n_pct: number
  s_color: string
}

/** 05-overview-advice */
export type RevenueDeviationAdvice = {
  lines: string[]
}

/** 06-overview-country-top10 */
export type RevenueDeviationCountryItem = {
  s_country_code: string
  label_display: string
  n_value: number
}

export type RevenueDeviationCountryTop10 = {
  tab_amount: RevenueDeviationCountryItem[]
  tab_rate: RevenueDeviationCountryItem[]
}

/** 07-table-history */
export type RevenueDeviationHistoryRow = {
  t_month: string
  d_estimated_usd: number
  d_real_usd: number
  d_deviation_rate_pct: number
}

/** 08-table-matrix */
export type MatrixPlatformKey = 'admob' | 'facebook' | 'applovin' | 'vungle'

export type RevenueDeviationMatrixCell = {
  estimated: string
  real: string
  deviation: string
}

export type RevenueDeviationMatrixRow = {
  s_app_name: string
  s_app_icon_emoji: string
  s_icon_color: string
  admob: RevenueDeviationMatrixCell
  facebook: RevenueDeviationMatrixCell
  applovin: RevenueDeviationMatrixCell
  vungle: RevenueDeviationMatrixCell
}

export type RevenueDeviationMatrixCol = {
  name: string
  key: MatrixPlatformKey
  total: RevenueDeviationMatrixCell
}

export type RevenueDeviationMatrixTable = {
  cols: RevenueDeviationMatrixCol[]
  rows: RevenueDeviationMatrixRow[]
}
