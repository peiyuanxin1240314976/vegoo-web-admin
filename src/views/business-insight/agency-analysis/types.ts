export type AgencyStatus = 'normal' | 'low' | 'paused'

/** 顶部筛选下拉项（契约 09-meta-filter-options） */
export interface AgencyAnalysisFilterOption {
  label: string
  value: string
}

/** 顶部 tabs（可用代投来源，后端不返回“汇总”） */
export type AgencyAnalysisAvailableSourceItem = AgencyAnalysisFilterOption

export interface AgencyAnalysisFilterOptionsPayload {
  appOptions: AgencyAnalysisFilterOption[]
  agencyOptions: AgencyAnalysisFilterOption[]
  sourceOptions: AgencyAnalysisFilterOption[]
}

export interface KpiCardItem {
  label: string
  value: string
  changeText: string
  changeUp: boolean | null
  highlighted: boolean
  sparkPoints?: string
  sparkColor?: string
}

export interface AgencyRow {
  id: string
  name: string
  nameColor?: string
  hasWarning?: boolean
  appCount: number
  channelCount: number
  spend: number
  installs: number
  cpi: number
  cpa: number
  roi: number
  budgetRate: number
  status: AgencyStatus
}

export interface AccountDetail {
  app: string
  platform: string
  adPlatform: string
  accountId: string
  accountName: string
  spend: string
  roi: number
  cpa: string
  cpi: string
  installs: number
}

export interface CampaignDetail {
  /** 广告系列 ID（契约 AgencyExpandCampaign.id，跳转详情 query.id） */
  id?: string
  appId?: string
  appName?: string
  name?: string
  budget: number
  spend: string
  cpa: string
  cpi: string
  installs: number
  roi34: number | null
  roi33: number | null
  roi32: number | null
  isRed?: boolean
}

export interface AgencyExpandData {
  appCount: string
  channelCount: string
  totalSpend: number
  totalInstalls: number
  roi: number
  roiTarget: number
  weeklySpend: number
  weeklyRoi: number
  weeklyInstalls: number
  weeklyApps: number
  weeklyAccounts: number
  weeklyCampaigns: number
  weeklyCountries: number
  weeklyDays: number
  accounts: AccountDetail[]
  campaigns: CampaignDetail[]
}

export interface CampaignRow {
  id: string
  agency: string
  agencyColor?: string
  appId?: string
  appName?: string
  name?: string
  channel: string
  app: string
  spend: number
  installs: number
  cpi: number
  ctr: number
  cvr: number
  ipm: number
  budget: number
  execRate: number
  trend: 'up' | 'down' | 'flat'
}

export interface DailyRow {
  date: string
  agency: string
  agencyColor?: string
  spend: number
  installs: number
  cpi: number
  cpa: number
  spendChange: number | null
  installsChange: number | null
}

export interface AgencyAnalysisMockPayload {
  kpiCards: KpiCardItem[]
  agencies: AgencyRow[]
  agencyDetailMap: Record<string, AgencyExpandData>
  campaigns: CampaignRow[]
  dailyRows: DailyRow[]
  charts: AgencyAnalysisCharts
}

export interface DonutChartItem {
  name: string
  value: number
  color: string
}

export interface ChannelDistributionSeries {
  name: string
  values: number[]
  color: string
}

export interface CountryDistributionItem {
  s_country_name?: string
  s_country_code: string
  spend: number
  sharePct: number
}

export interface SpendTrendSeries {
  name: string
  color: string
  values: number[]
}

export interface AgencyAnalysisCharts {
  donut: DonutChartItem[]
  channelDistribution: {
    categories: string[]
    series: ChannelDistributionSeries[]
  }
  countryTop8: CountryDistributionItem[]
  spendTrend30d: {
    dates: string[]
    series: SpendTrendSeries[]
  }
}

/** 截图弹窗独立报告：由父页传入当前仪表盘数据 */
export interface AgencyAnalysisScreenshotPayload {
  dataDate: string
  pageLoading: boolean
  kpiCards: KpiCardItem[]
  agencies: AgencyRow[]
  agencyDetailMap: Record<string, AgencyExpandData>
  campaigns: CampaignRow[]
  dailyRows: DailyRow[]
  donut: DonutChartItem[]
  channelDistribution: AgencyAnalysisCharts['channelDistribution']
  countryTop8: CountryDistributionItem[]
  /** 当前展开的代投方 id，无则「当前代投方」模式下账户/ROI 等无明细 */
  focusedAgencyId: string | null
}

/** 子 Tab（非汇总）- KPI 行：近 7 天 / 单日 */
export interface AgencySubTabKpiMetricItem {
  key:
    | 'spend'
    | 'roi1'
    | 'cpi'
    | 'cpa'
    | 'installs'
    | 'appCount'
    | 'accountCount'
    | 'campaignCount'
    | 'adsetCount'
    | 'countryCount'
    | 'days'
  label: string
  value: string
}

export interface AgencySubTabKpiPayload {
  /** 展示期：例如「近7天」「2026-03-10」等 */
  periodLabel: string
  metrics: AgencySubTabKpiMetricItem[]
}

/** 子 Tab（非汇总）- 近期汇总表 */
export interface AgencySubTabRecentSummaryRow {
  app: string
  platform: string
  source: string
  accountId: string
  accountName: string
  spend: string
  budget: string
  cpa: string
  cpi: string
  installs: string
  /** 首日 ROI 趋势（展示用百分比文本，长度由后端决定） */
  roiTrend: string[]
}

export interface AgencySubTabRecentSummaryPayload {
  rows: AgencySubTabRecentSummaryRow[]
}

/** 子 Tab（非汇总）- 账户汇总表 */
export interface AgencySubTabAccountSummaryRow {
  app: string
  platform: string
  source: string
  accountId: string
  accountName: string
  spend: string
  roi1: string
  cpa: string
  cpi: string
  installs: string
}

export interface AgencySubTabAccountSummaryPayload {
  rows: AgencySubTabAccountSummaryRow[]
}
