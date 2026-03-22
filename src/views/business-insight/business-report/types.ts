// ============================================================
// Business Report – TypeScript Type Definitions
// ============================================================

export type ReportPeriod = 'daily' | 'weekly' | 'monthly'
export type ReportTab = 'summary' | 'adPlatform' | 'byCountry' | 'platformCountry' | 'campaigns'

// ── Sidebar ──────────────────────────────────────────────────
export interface AppListItem {
  id: string
  name: string
  category: string
  platforms: string[]
  iconEmoji: string
  iconColor: string
  iconBg: string
  revenue: number
  revenueChange: number
  profit: number
  mau?: number // monthly active users (万)
  dau?: number // daily active users (万)
  adSpend?: number
  adSpendChange?: number
  activeCampaigns?: number
  pausedCampaigns?: number
  countries?: number
  isOverall?: boolean
  sparkline?: number[]
  paidUsers?: number // 买量用户 (万)
  platformBreakdown?: Array<{ name: string; color: string; percent: number }>
  children?: AppListItem[]
}

// ── KPI Cards ─────────────────────────────────────────────────
export interface KpiMetric {
  key: string
  label: string
  value: string
  change: number // e.g. 9.7 for +9.7%
  changeLabel: string // e.g. "月环比 ↑ 9.7%"
  color: string // CSS accent color hex
  bg: string // CSS gradient background
  sparkline: number[]
  badge?: string // e.g. "MONTHLY ONLY"
}

// ── Tables ────────────────────────────────────────────────────
export interface UserMetricRow {
  name: string
  current: string
  previous: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export interface RoiRow {
  type: string
  current: string
  previous: string
  change: string
  /** 月环比样式；未填时模板按 neutral 处理 */
  changeType?: 'positive' | 'negative' | 'neutral'
  isHighlighted?: boolean // green highlight for 101%+ rows
}

export interface RetentionRow {
  day: string
  current: string
  previous: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export interface RevenueRow {
  name: string
  current: string
  previous: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export interface FeeItem {
  name: string
  amount: string
  isPositive: boolean
}

// ── Ad Platforms ──────────────────────────────────────────────
export interface AdPlatformCard {
  id: string
  name: string
  logo: string // text initials or icon char
  color: string // header color
  adSpend: string
  adSpendChange: number
  acquisitions: string
  cpi: string
  cpm?: string
  cpc?: string
  campaigns?: number
  roi1d: string
  roi7d: string
  roi14d?: string
  sharePercent: number
}

export interface AdPlatformTableRow extends AdPlatformCard {
  profit: string
  cpm: string
  cpc: string
}

// ── Country Data ──────────────────────────────────────────────
export interface CountryRow {
  flag: string
  name: string
  avgDau: string
  revenue: string
  paidRevenue: string
  profit: string
  calcProfit: string
  newUsers: string
  organic: string
  organicRate: string
  dauShare: number // percentage 0-100
  ecpm: string
  arpdau: string
  adSpend: string
  cpi: string
  cpm: string
  cpc: string
  acquisitions: string
  campaigns: number
  roi1d: string
  roi7d: string
}

// ── Campaigns ─────────────────────────────────────────────────
export interface CampaignRow {
  id: string
  app: string
  platform: string
  adPlatform: string
  adPlatformColor: string
  campaignName: string
  status: 'active' | 'paused'
  country: string
  countryFlag: string
  adSpend: string
  adSpendChange: number
  cpi?: string
  cpm?: string
  cpc?: string
  acquisitions: string
  roi1d: string
  roi3d: string
  roi7d: string
  roi14d: string
  roi30d: string
}

// ── Ad Platform × Country (Hierarchical) ─────────────────────
export interface PlatformCountryRow {
  id: string
  platform?: string
  platformColor?: string
  osPlatform?: string // 安卓 / iOS / 网站
  country?: string
  countryFlag?: string
  adSpend: string
  changeRate?: string
  acquisitions?: string
  campaigns?: number
  cpi: string
  cpm: string
  cpc: string
  roi1d: string
  roi3d: string
  roi7d: string
  roi14d: string
  roi30d: string
  profit: string
  level: 'os' | 'platform' | 'country' | 'subtotal'
  isExpanded?: boolean
  children?: PlatformCountryRow[]
}

// ── Compare Mode (Monthly) ────────────────────────────────────
export interface CompareAppData {
  id: string
  name: string
  color: string
  revenue: string
  revenueChange: number
  mau: string
  mauChange: number
  profit: string
  profitChange: number
  fee: string
  feeChange: number
  paid: string
  paidChange: number
  ad: string
  adChange: number
}

export interface CompareMetricRow {
  metric: string
  values: Record<string, string> // appId → value
  bestId: string
}

// ── Lark Push Modal ───────────────────────────────────────────
export interface LarkPushConfig {
  groups: string[]
  persons: string[]
  daily: { enabled: boolean; day: string; time: string; workdayOnly: boolean }
  weekly: { enabled: boolean; day: string; time: string; showChange: boolean }
  monthly: { enabled: boolean; day: string; time: string; showFee: boolean }
  content: {
    summary: boolean
    adPlatform: boolean
    byCountry: boolean
    platformCountry: boolean
    campaigns: boolean
  }
}
