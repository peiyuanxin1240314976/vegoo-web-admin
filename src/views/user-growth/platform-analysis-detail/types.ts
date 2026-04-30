// ─── KPI 卡片：与综合分析页同构（钻取详情与父页字段一致）──────────────

import type { KpiCard } from '../comprehensive-analysis/types'

export type { KpiCard }

// ─── 平台/系统 统计卡片 ────────────────────────────────────────

export interface PlatformStatCard {
  label: string // "PhoneTracker 安卓" / "iOS" / "合计"
  platform?: string // "android" | "ios" | "total"
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
  platform: string // parent platform
  country: string
  /** ISO 3166-1 alpha-2，用于 flag-icons；非法或空时前端不渲染国旗 */
  s_country_code: string
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
    cpi: string
    cpm: string
    cpc: string
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

// ─── 分片响应（与 backend-api 各 JSON 对齐）──────────────────────

/** 01-summary：顶栏 KPI + 左列三卡 + sourceName */
export interface PlatformAnalysisDetailSummary {
  sourceName: string
  kpis: KpiCard[]
  statCards: PlatformStatCard[]
}

/** 03-ecpm-trend：ECPM 折线 + 底部四指标 */
export interface PlatformAnalysisDetailEcpmBlock {
  ecpmTrend: ChartTrend
  ecpmMetrics: EcpmTrendMetrics
}

// ─── 整合（页面 state）─────────────────────────────────────────

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
