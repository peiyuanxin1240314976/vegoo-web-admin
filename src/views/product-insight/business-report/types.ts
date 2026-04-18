// ============================================================
// Business Report – TypeScript Type Definitions
// ============================================================
// 字段格式约定：
//   金额 / 指标显示值 → 预格式化字符串（'$152,300'、'78.3万'）
//   变化率            → number（8.4 代表 +8.4%）
//   百分点（pp）      → string（'+2pp'）保持与表格列格式一致
//   DAU 占比          → number 0~100（用于进度条，非 0~1）
//   API 层原始值      → 见文件底部 API Response 类型区
// ============================================================

export type ReportPeriod = 'daily' | 'weekly' | 'monthly'
export type ReportTab = 'summary' | 'adPlatform' | 'byCountry' | 'platformCountry' | 'campaigns'

// ── Lark 群组 / 人员 ──────────────────────────────────────────
export interface LarkTarget {
  id: string // 飞书 open_id 或群 chat_id
  name: string // 显示名称
}

// ── 侧栏应用列表 ──────────────────────────────────────────────
export interface AppListItem {
  id: string
  name: string
  category: string
  platforms: string[] // ['安卓', 'iOS', '网站']
  iconEmoji: string
  iconColor: string // CSS 十六进制色值
  iconBg: string // CSS rgba 背景
  revenue: number // 总收入（美元）
  revenueChange: number // 环比变化率（8.4 => +8.4%）
  profit: number // 预估利润（美元）
  mau?: number // 月活跃用户（万）
  dau?: number // 日活跃用户（万）
  adSpend?: number // 广告支出（美元）
  adSpendChange?: number // 广告支出环比变化率
  activeCampaigns?: number // 在投广告系列数
  pausedCampaigns?: number // 已暂停广告系列数
  campaignCount?: number // 广告系列数（new, from API field campaignCount）
  countries?: number // 投放国家数
  countryCount?: number // 投放国家数（new, from API field countryCount）
  isOverall?: boolean // 是否为整体汇总行
  sparkline?: number[] // 迷你图数据（8 个点）
  paidUsers?: number // 买量用户（万）(legacy)
  buyingUsers?: number // 买量用户（万）(new, from API field buyingUsers)
  platformBreakdown?: Array<{
    name: string
    color: string
    percent: number // 0~100
  }>
  children?: AppListItem[]
}

// ── KPI 卡片 ──────────────────────────────────────────────────
export interface KpiMetric {
  key: string
  label: string
  value: string // 预格式化显示值（'$152,300' / '78.3万'）
  change: number // 环比变化率（8.4 => +8.4%）
  changeLabel: string // 含前缀的展示文本（'环比昨日 ↑ 8.4%'）
  color: string
  bg: string // CSS gradient
  sparkline: number[]
  badge?: string // 徽标文字（'MONTHLY ONLY'）
}

// ── 汇总表格行 ────────────────────────────────────────────────
export interface UserMetricRow {
  name: string
  current: string
  previous: string
  change: string // '+8.4%' / '+1' / '0pp'
  changeType: 'positive' | 'negative' | 'neutral'
}

export interface RoiRow {
  type: string // '首日ROI' / '7日ROI' 等
  current: string
  previous: string
  change: string // '+2pp' / '0pp' / '-'
  changeType?: 'positive' | 'negative' | 'neutral'
  isHighlighted?: boolean // ROI >= 101% 时绿色高亮
}

export interface RetentionRow {
  day: string // '次留' / '三留' 等
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
  amount: string // 带符号预格式化（'+$6,737.28' / '-$2,400.00'）
  isPositive: boolean
}

// ── 广告平台卡片 ──────────────────────────────────────────────
export interface AdPlatformCard {
  id: string
  name: string
  logo: string // 文字缩写或 emoji（'G' / 'f' / '👻'）
  color: string
  adSpend: string // 预格式化（'$15,200'）
  adSpendChange: number // 环比变化率
  acquisitions: string // 买量用户（'9.5万'）
  cpi: string
  cpm: string
  cpc: string
  campaigns: number
  roi1d: string
  roi7d: string
  roi14d?: string
  profit: string // 预估利润（'$6,400'）
  sharePercent: number // 广告支出占比（0~100）
}

// ── 分国家数据行 ──────────────────────────────────────────────
export interface CountryRow {
  flag: string // 国家旗帜 emoji（'🇺🇸'）或 '🌐'
  name: string
  subLabel?: string // 仅合并行使用（'12个国家'）
  avgDau: string
  revenue: string
  paidRevenue: string
  profit: string
  calcProfit: string
  newUsers: string
  organic: string
  organicRate: string
  dauShare: number // DAU 占比 0~100，用于进度条
  ecpm: string
  arpdau: string
  adSpend: string
  cpi: string
  cpm: string
  cpc: string
  acquisitions: string // 买量用户
  campaigns: number
  roi1d: string
  roi7d: string
}

// ── 在投广告系列行 ────────────────────────────────────────────
export interface CampaignRow {
  id: string
  app: string
  platform: string // '安卓' / 'iOS' / '安卓+iOS'
  adPlatform: string
  adPlatformColor: string
  campaignName: string
  status: 'active' | 'paused'
  country: string
  countryFlag: string
  adSpend: string
  adSpendChange: number // 暂停系列为 -100
  cpi: string // 暂停时为 '-'
  cpm: string
  cpc: string
  acquisitions: string // 暂停时为 '0'
  roi1d: string
  roi3d: string
  roi7d: string
  roi14d: string
  roi30d: string
}

// ── 广告平台分国家（平铺层级 – DailyPlatformCountry 等使用）─
export interface PlatformCountryRow {
  id: string
  platform?: string
  platformColor?: string
  osPlatform?: string // '安卓' / 'iOS' / '网站'
  country?: string
  countryFlag?: string
  adSpend: string
  change?: string // 环比字符串（'+8.1%'）
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

// ── 广告平台分国家（结构化 – AdPlatformByCountry 组件使用）──
/** 国家行 */
export interface ApcCountryEntry {
  id: string
  name: string
  flag: string
  spend: string
  change: string
  users: string
  campaigns: number
  cpi: string
  cpm: string
  cpc: string
  roi1d: string
  roi3d: string
  roi7d: string
  roi14d: string
  roi30d: string
  profit: string
}

/** 广告平台行（含国家列表及小计） */
export interface ApcPlatformEntry {
  id: string
  name: string
  logo: string
  color: string
  spend: string
  change: string
  users: string
  campaigns: number
  cpi: string
  cpm: string
  cpc: string
  roi1d: string
  roi3d: string
  roi7d: string
  roi14d: string
  roi30d: string
  profit: string
  subtotalSpend: string
  subtotalChange: string
  subtotalUsers: string
  subtotalCampaigns: number
  subtotalCpi: string
  subtotalCpm: string
  subtotalCpc: string
  subtotalRoi1d: string
  subtotalRoi3d: string
  subtotalRoi7d: string
  subtotalRoi14d: string
  subtotalRoi30d: string
  subtotalProfit: string
  countries: ApcCountryEntry[]
}

/** OS 平台行（安卓 / iOS / 网站） */
export interface ApcOsEntry {
  id: string
  name: string
  platforms: ApcPlatformEntry[]
}

// ── 飞书推送配置 ──────────────────────────────────────────────
export interface LarkPushConfig {
  groups: LarkTarget[] // 飞书群列表
  persons: LarkTarget[] // 指定人员列表
  /** 可选：后端返回的最近一次推送时间（ISO 字符串或展示文本） */
  lastPushAt?: string
  /** 可选：后端返回的最近一次推送目标（群名称） */
  lastPushTarget?: string
  daily: {
    enabled: boolean
    day: string // '每天' / '工作日'
    time: string // 'HH:MM'
    workdayOnly: boolean
  }
  weekly: {
    enabled: boolean
    day: string // '每周一' / '每周五'
    time: string
    showChange: boolean // 包含周环比
  }
  monthly: {
    enabled: boolean
    day: string // '每月 1 日' 等
    time: string
    showFee: boolean // 包含费用抄扣明细
  }
  content: {
    summary: boolean
    adPlatform: boolean
    byCountry: boolean
    platformCountry: boolean
    campaigns: boolean
  }
}

// ============================================================
// API 层类型（真实接口对接使用）
// ============================================================

/** 通用响应包装，后端统一返回格式 */
export interface ApiResponse<T> {
  code: number // 0 = 成功，非 0 = 错误
  message: string
  data: T
  timestamp: number // Unix 时间戳（ms）
}

/** 顶栏筛选：`appIds` 为应用 id 列表（页面单选时长度 0～1，`[]` 不限）；`platformList` 等空数组表示不限 */
export type ReportTopBarFilterArrays = {
  appIds: string[]
  platformList: string[]
  sourceList: string[]
  countryCodeList: string[]
}

/** 报告查询参数（所有模块通用） */
export interface ReportQueryParams extends ReportTopBarFilterArrays {
  period: ReportPeriod // 'daily' | 'weekly' | 'monthly'
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  /** 侧栏当前选中应用；整体为 \"\" */
  appId: string
  account?: string // 广告账户；不限传 ""
  currentPage?: number // 分页页码（从 0 开始，仅在需要分页的接口使用）
  pageSize?: number // 每页条数（仅在需要分页的接口使用）
  tab?: ReportTab
}

/** 侧栏应用列表（独立接口；`appId` 固定空串表示拉列表，与侧栏选中无关） */
export interface ReportAppListQueryParams extends ReportTopBarFilterArrays {
  period: ReportPeriod
  startDate: string
  endDate: string
  /** 与页面二级 Tab 一致，用于侧栏卡片次要指标口径 */
  tab: ReportTab
  account?: string
}

/** POST …/report/{period}/app-list 业务体 */
export interface ReportAppListResponse {
  items: AppListItem[]
}

// ── 各模块接口响应类型 ────────────────────────────────────────

/** POST /api/v1/datacenter/analysis/report/{period}/overview */
export interface SummaryResponse {
  kpis: KpiMetric[]
  userMetrics: UserMetricRow[]
  revenueMetrics: RevenueRow[]
  roiMetrics: RoiRow[]
  retentionMetrics: RetentionRow[]
  feeDeductions?: FeeItem[] // 仅月报（period='monthly'）时返回
}

/** POST /api/v1/datacenter/analysis/report/{period}/ad-platform */
export interface AdPlatformResponse {
  platforms: AdPlatformCard[]
}

/** POST /api/v1/datacenter/analysis/report/{period}/by-country */
export interface ByCountryResponse {
  rows: CountryRow[]
  othersRow: CountryRow // 合并的"其他 N 个国家"行
}

/** POST /api/v1/datacenter/analysis/report/{period}/platform-country */
export interface PlatformCountryResponse {
  osEntries: ApcOsEntry[] // AdPlatformByCountry 组件使用（结构化）
  flatRows: PlatformCountryRow[] // DailyPlatformCountry 等组件使用（平铺层级）
  totalPlatforms: number
  totalCountries: number
}

/** POST /api/v1/datacenter/analysis/report/{period}/campaigns */
export interface CampaignsResponse {
  currentPage: number
  pageSize: number
  total: number
  rows: CampaignRow[]
}

/** GET /api/v1/lark/push-config */
// 响应体直接为 LarkPushConfig

/** POST /api/v1/lark/push-config → 保存配置 */
// 请求体为 LarkPushConfig，响应体为 ApiResponse<null>

/** POST /api/v1/lark/push-now → 立即推送一次 */
// 请求体为 LarkPushConfig，响应体为 ApiResponse<null>

/** 对比模式请求参数（三周期通用） */
export interface CompareQueryParams extends ReportQueryParams {
  /** 对比勾选的应用 id（最多 5 个）；与顶栏范围 `appIds` 分列，避免请求体键名冲突 */
  compareAppIds: string[]
  compareEnabled: boolean
  compareStartDate: string // YYYY-MM-DD
  compareEndDate: string // YYYY-MM-DD
}

export interface CompareOverviewMetric {
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export interface CompareOverviewAppCard {
  id: string
  name: string
  color: string
  revenue: string
  revenueChange: number
  metrics: CompareOverviewMetric[]
}

export interface CompareTrendSeries {
  id: string
  name: string
  color: string
  values: number[]
}

export interface CompareMetricsRow {
  metric: string
  values: Record<string, string>
  bestId: string
}

export interface CompareOverviewResponse {
  apps: CompareOverviewAppCard[]
}

export interface CompareTrendsResponse {
  labels: string[]
  revenueSeries: CompareTrendSeries[]
  userSeries: CompareTrendSeries[]
}

export interface CompareMetricsResponse {
  rows: CompareMetricsRow[]
}
