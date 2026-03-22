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

/** UI 状态（含仅用于前端的 viewMode） */
export interface ComprehensiveAnalysisFilterState {
  dateRange: string
  s_app_id: string
  adPlatform: string
  s_country_code: string
  viewMode: 'data' | 'board' | 'chart' | 'report' // 仅前端，不传后端
}

/** 发送给后端的查询参数（不含 viewMode；与 mock/backend-api 契约一致） */
export interface ComprehensiveAnalysisApiParams {
  /** 日期区间开始 YYYY-MM-DD */
  date_start: string
  /** 日期区间结束 YYYY-MM-DD */
  date_end: string
  /**
   * 应用 ID；空字符串表示「全部」
   * (与筛选 UI 中 `all` 对应，由 build 函数统一转换)
   */
  s_app_id: string
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
  title: string
  subTitle: string
  primaryValue: string
  trendText: string
  trendUp: boolean
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

// ─── 应用维度区块（section-app，可选；与主 overview 数据结构不同）────────

export interface MatrixCell {
  value?: string
  changeRate?: string
  highlight?: 'warn' | 'good' | ''
}

export interface AppCpiRankRow {
  rank: number
  appName: string
  cpi: number
  change: number
  isHighlight?: boolean
}

export interface PlatformCountryMatrixRow {
  platform: string
  cells: Record<string, MatrixCell>
}

export interface PlatformCountryMatrix {
  countries: string[]
  rows: PlatformCountryMatrixRow[]
}

/** 应用维度布局专用数据（与主 ComprehensiveAnalysisData 独立） */
export interface SectionAppData {
  appCpiRank: AppCpiRankRow[]
  platformCountryMatrix: PlatformCountryMatrix
  appCpiTrend: PlatformCpiTrend
}
