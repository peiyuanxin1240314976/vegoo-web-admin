// ─── 筛选 ──────────────────────────────────────────────────────

export interface SelectOption {
  label: string
  value: string
}

export interface ComprehensiveAnalysisFilterOptions {
  appOptions: SelectOption[]
  sourceOptions: SelectOption[]
  countryOptions: SelectOption[]
}

/** 页面筛选 UI 状态（与请求体无关的字段勿放入 ComprehensiveAnalysisApiParams） */
export interface ComprehensiveAnalysisFilterState {
  dateRange: string
  s_app_id: string
  adPlatform: string
  s_country_code: string
}

/** 发送给后端的查询参数（与 mock/backend-api 契约一致） */
export interface ComprehensiveAnalysisApiParams {
  /** 日期区间开始 YYYY-MM-DD */
  date_start: string
  /** 日期区间结束 YYYY-MM-DD */
  date_end: string
  /**
   * 应用 ID；空字符串表示「全部」
   * (与筛选 UI 中 `all` 对应，由 build 函数统一转换)
   */
  appIds: string[]
  /**
   * 广告平台（项目约定字段名 `source`）
   * 空字符串表示「全部」
   */
  source: string
  /**
   * 国家代码；空字符串表示「全部」
   */
  s_country_code: string
}

// ─── KPI 卡片 ──────────────────────────────────────────────────

export interface KpiCard {
  id: string
  /** KPI 标题 */
  title: string
  /** 副标题/口径说明（如安装成本、买量用户） */
  subTitle: string
  /** 主指标展示（预格式化字符串，如 $2.38、42,156） */
  primaryValue: string
  /**
   * 趋势幅度展示（不含箭头；百分比类建议保留两位小数，如 5.20%）
   */
  trendText: string
  trendUp: boolean
  /** 趋势对比说明（如 vs昨日）；可选 */
  trendCompareLabel?: string
}

// ─── 广告平台 CPI 对比（横向柱状图）──────────────────────────────

export type CpiStatus = 'good' | 'near' | 'over'

export interface PlatformCpiBarItem {
  name: string
  cpi: number
  color: string
  status: CpiStatus // 达标 / 接近 / 超标
}

export interface PlatformCpiBarData {
  target: number
  items: PlatformCpiBarItem[]
}

// ─── 应用 CPI 排行 ─────────────────────────────────────────────

export interface AppCpiRankItem {
  id: string
  name: string
  icon?: string // 应用图标 URL（可选）
  cpi: number
  trend: 'up' | 'down' | 'flat'
}

// ─── 国家 CPI 分布（地图泡泡图）──────────────────────────────────

export interface CountryCpiMapItem {
  country: string
  code: string
  cpi: number
  x: number // 地图上的 x 百分比坐标
  y: number // 地图上的 y 百分比坐标
}

// ─── CPI Top 8 国家 ────────────────────────────────────────────

export interface CountryCpiTopItem {
  country: string
  code: string
  cpi: number
}

// ─── 投放预警 ──────────────────────────────────────────────────

export type AlertLevel = 'danger' | 'warning' | 'info'

export interface AlertItem {
  id: string
  level: AlertLevel
  text: string
}

// ─── 广告平台 CPI 趋势（折线图）──────────────────────────────────

export interface TrendSeries {
  name: string
  color: string
  data: number[]
  dashed?: boolean
}

export interface PlatformCpiTrend {
  dates: string[]
  target: number
  series: TrendSeries[]
}

// ─── ECPM 分析（面积图）──────────────────────────────────────────

export interface EcpmAnalysis {
  dates: string[]
  estimated: number[] // 预估 ECPM（虚线）
  actual: number[] // 真实 ECPM（实线）
  metrics: {
    estimatedEcpm: string
    actualEcpm: string
    biasRate: string
    biasAmount: string
  }
}

// ─── 页面整合 ──────────────────────────────────────────────────

export interface ComprehensiveAnalysisData {
  kpis: KpiCard[]
  platformCpiBar: PlatformCpiBarData
  appCpiRank: AppCpiRankItem[]
  countryCpiMap: CountryCpiMapItem[]
  countryTop8: CountryCpiTopItem[]
  alerts: AlertItem[]
  platformCpiTrend: PlatformCpiTrend
  ecpmAnalysis: EcpmAnalysis
}
