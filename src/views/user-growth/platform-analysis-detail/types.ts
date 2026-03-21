// ─── KPI 卡片（复用） ──────────────────────────────────────────

export interface KpiCard {
  id: string
  title: string
  subTitle: string
  primaryValue: string
  trendText: string
  trendUp: boolean
}

// ─── 平台/系统 统计卡片 ────────────────────────────────────────

export interface PlatformStatCard {
  label: string       // "PhoneTracker 安卓" / "iOS" / "合计"
  platform?: string   // "android" | "ios" | "total"
  adSpend: string
  roi: string
  installs: string
  profit: string
  activePlatforms: string
}

// ─── 广告平台 × 国家 明细表（树形）───────────────────────────────

export interface CountryRow {
  id: string
  isCountry: true
  platform: string    // parent platform
  country: string
  flag: string
  adSpend: string
  cpi: string
  cpiLevel: 'good' | 'near' | 'over'
  cpm: string
  cpc: string
  roiD1: string
  roiD1Level: 'good' | 'warn' | 'danger'
  roiD3: string
  roiD7: string
  profit: string
  profitNeg?: boolean
  sparkline: number[]
}

export interface PlatformRow {
  id: string
  isCountry: false
  platform: string
  countryCount: string
  adSpend: string
  cpi: string
  cpiLevel: 'good' | 'near' | 'over'
  cpm: string
  cpc: string
  roiD1: string
  roiD1Level: 'good' | 'warn' | 'danger'
  roiD3: string
  roiD7: string
  profit: string
  profitNeg?: boolean
  sparkline: number[]
  children: CountryRow[]
}

export interface MatrixTableData {
  rows: PlatformRow[]
  total: {
    adSpend: string
    installs: string
    cpi: string
    cpm: string
    roiD1: string
    roiD3: string
    roiD7: string
    profit: string
  }
}

// ─── 趋势图 ────────────────────────────────────────────────────

export interface TrendSeries {
  name: string
  color: string
  data: number[]
  dashed?: boolean
}

export interface ChartTrend {
  dates: string[]
  target?: number
  series: TrendSeries[]
}

export interface EcpmTrendMetrics {
  estimatedEcpm: string
  actualEcpm: string
  biasRate: string
  biasAmount: string
}

// ─── 底部预警栏 ────────────────────────────────────────────────

export type AlertLevel = 'danger' | 'warning' | 'info' | 'good'

export interface AlertBarItem {
  id: string
  level: AlertLevel
  text: string
}

// ─── 整合 ──────────────────────────────────────────────────────

export interface PlatformAnalysisDetailData {
  sourceName: string
  kpis: KpiCard[]
  statCards: PlatformStatCard[]
  matrixTable: MatrixTableData
  cpiTrend: ChartTrend
  ecpmTrend: ChartTrend
  ecpmMetrics: EcpmTrendMetrics
  alertBar: AlertBarItem[]
}
