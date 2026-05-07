/**
 * 代投分析 — 与 `views/business-insight/agency-analysis/mock/backend-api` 契约一致
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import { buildAppSelectionRequestBody } from '@/utils/app-id-request'
import {
  AgencyAnalysisEndpoint,
  isAgencyAnalysisMock
} from '@/views/business-insight/agency-analysis/config/data-source'
import {
  mockFetchAgencyAnalysisAvailableSources,
  mockFetchAgencyAnalysisFilterOptions,
  mockFetchAgencyOverview,
  mockFetchAgencySubTabKpiLast7,
  mockFetchAgencySubTabKpiDay,
  mockFetchAgencySubTabRecentSummary,
  mockFetchAgencySubTabAccountSummary,
  mockFetchAgencyAgencySummary,
  mockFetchAgencyCampaignTable,
  mockFetchAgencyDailyComparison,
  mockFetchAgencyDonutSpendShare,
  mockFetchAgencyChannelDistribution,
  mockFetchAgencyCountryTop8,
  mockFetchAgencySpendTrend30d
} from '@/views/business-insight/agency-analysis/mock/mock-data'
import type {
  AgencyExpandData,
  AgencyRow,
  CampaignDetail,
  CampaignRow,
  DailyRow,
  KpiCardItem,
  AgencyAnalysisAvailableSourceItem,
  AgencyAnalysisFilterOptionsPayload,
  AgencySubTabKpiPayload,
  AgencySubTabRecentSummaryPayload,
  AgencySubTabAccountSummaryPayload,
  DonutChartItem,
  ChannelDistributionSeries,
  CountryDistributionItem
} from '@/views/business-insight/agency-analysis/types'

const AGENCY_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/business-insight/agency-analysis`

export type AgencyAnalysisFilterQuery = {
  startDate: string
  endDate: string
  s_app_id?: string | string[]
  agency_id?: string
  source?: string
}

function overviewBody(q: AgencyAnalysisFilterQuery) {
  const appSelection = buildAppSelectionRequestBody(q.s_app_id === 'all' ? '' : (q.s_app_id ?? ''))
  return {
    // TODO: 后端入参升级后删除 t_date
    t_date: q.endDate,
    startDate: q.startDate,
    endDate: q.endDate,
    ...appSelection,
    agency_id: q.agency_id ?? 'all',
    source: q.source ?? 'all'
  }
}

function rangeBody(q: AgencyAnalysisFilterQuery) {
  const appSelection = buildAppSelectionRequestBody(q.s_app_id === 'all' ? '' : (q.s_app_id ?? ''))
  return {
    // TODO: 后端入参升级后删除 t_start_date / t_end_date
    t_start_date: q.startDate,
    t_end_date: q.endDate,
    startDate: q.startDate,
    endDate: q.endDate,
    ...appSelection,
    agency_id: q.agency_id ?? 'all',
    source: q.source ?? 'all'
  }
}

function chartBody(q: AgencyAnalysisFilterQuery) {
  return overviewBody(q)
}

const OVERVIEW_KPI_LABEL_ALIASES: Record<string, string> = {
  应用数: '代投应用数',
  渠道数: '代投渠道数',
  代投方数: '代投方数量',
  安装量: '代投买量用户数',
  代投安装数: '代投买量用户数'
}

function normalizeOverviewKpiCards(data: { kpiCards?: KpiCardItem[] }): {
  kpiCards: KpiCardItem[]
} {
  const kpis = data.kpiCards ?? []
  return {
    kpiCards: kpis.map((c) => {
      const next = OVERVIEW_KPI_LABEL_ALIASES[c.label]
      return next ? { ...c, label: next } : c
    })
  }
}

/** 契约 09：真实对接无请求体 */
export function fetchAgencyAnalysisMetaFilterOptions() {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.MetaFilterOptions)) {
    return mockFetchAgencyAnalysisFilterOptions()
  }
  return request.post<AgencyAnalysisFilterOptionsPayload>({
    url: `${AGENCY_ANALYSIS_BASE}/meta/filter-options`,
    data: {}
  })
}

export function fetchAgencyAnalysisAvailableSources(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.MetaAvailableSources)) {
    return mockFetchAgencyAnalysisAvailableSources()
  }
  return request.post<AgencyAnalysisAvailableSourceItem[]>({
    url: `${AGENCY_ANALYSIS_BASE}/meta/available-sources`,
    data: overviewBody(params)
  })
}

export function fetchAgencyAnalysisOverview(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.Overview)) {
    return mockFetchAgencyOverview().then(normalizeOverviewKpiCards)
  }
  return request
    .post<{ kpiCards: KpiCardItem[] }>({
      url: `${AGENCY_ANALYSIS_BASE}/overview`,
      data: overviewBody(params)
    })
    .then(normalizeOverviewKpiCards)
}

function normalizeExpandCampaign(cp: CampaignDetail | Record<string, unknown>): CampaignDetail {
  if (typeof (cp as CampaignDetail).cpa === 'string') {
    return cp as CampaignDetail
  }
  const o = cp as {
    id?: string
    appId?: string
    appName?: string
    channel?: string
    spend?: number
  }
  const spendNum = typeof o.spend === 'number' ? o.spend : 0
  return {
    id: o.id,
    appId: o.appId,
    appName: o.appName ?? '--',
    name: o.appName,
    budget: 0,
    spend: `$${spendNum.toLocaleString('en-US')}`,
    cpa: '--',
    cpi: '--',
    installs: 0,
    roi34: null,
    roi33: null,
    roi32: null
  }
}

function normalizeAgencyExpandData(raw: AgencyExpandData): AgencyExpandData {
  return {
    ...raw,
    accounts: raw.accounts ?? [],
    campaigns: (raw.campaigns ?? []).map((c) => normalizeExpandCampaign(c as CampaignDetail))
  }
}

function normalizeAgencySummaryPayload(data: {
  agencies: AgencyRow[]
  agencyDetailMap: Record<string, AgencyExpandData>
}) {
  const agencyDetailMap: Record<string, AgencyExpandData> = {}
  for (const k of Object.keys(data.agencyDetailMap)) {
    agencyDetailMap[k] = normalizeAgencyExpandData(data.agencyDetailMap[k])
  }
  return { agencies: data.agencies, agencyDetailMap }
}

export type AgencyAnalysisSubTabFilterQuery = {
  startDate: string
  endDate: string
  /** 单日查询时使用；默认建议取 endDate */
  date?: string
  appId?: string | string[]
  source?: string
  /** 后三个 Tab 的入参维度（后端动态返回） */
  agencyTab: string
}

export type AgencyAnalysisSubTabLast7Query = {
  /** 近 7 天窗口起始日 YYYY-MM-DD（含首尾共 7 天：与 endDate 相差 6 天） */
  startDate: string
  /** 近 7 天窗口结束日 YYYY-MM-DD；前端通常取应用当前业务日 `getAppTodayYYYYMMDD()` */
  endDate: string
  appId?: string | string[]
  source?: string
  /** 后三个 Tab 的入参维度（后端动态返回） */
  agencyTab: string
}

function subTabBody(q: AgencyAnalysisSubTabFilterQuery) {
  const appSelection = buildAppSelectionRequestBody(q.appId === 'all' ? '' : (q.appId ?? ''))
  return {
    startDate: q.startDate,
    endDate: q.endDate,
    date: q.date,
    ...appSelection,
    source: q.source ?? 'all',
    agencyTab: q.agencyTab
  }
}

export function fetchAgencySubTabKpiLast7(params: AgencyAnalysisSubTabLast7Query) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.SubTabKpiLast7)) {
    return mockFetchAgencySubTabKpiLast7(params)
  }
  const appSelection = buildAppSelectionRequestBody(
    params.appId === 'all' ? '' : (params.appId ?? '')
  )
  return request.post<AgencySubTabKpiPayload>({
    url: `${AGENCY_ANALYSIS_BASE}/subtab/kpi/last7`,
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ...appSelection,
      source: params.source ?? 'all',
      agencyTab: params.agencyTab
    }
  })
}

export function fetchAgencySubTabKpiDay(params: AgencyAnalysisSubTabFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.SubTabKpiDay)) {
    return mockFetchAgencySubTabKpiDay(params)
  }
  const body = subTabBody({ ...params, date: params.date ?? params.endDate })
  return request.post<AgencySubTabKpiPayload>({
    url: `${AGENCY_ANALYSIS_BASE}/subtab/kpi/day`,
    data: body
  })
}

export function fetchAgencySubTabRecentSummary(params: AgencyAnalysisSubTabFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.SubTabRecentSummary)) {
    return mockFetchAgencySubTabRecentSummary(params)
  }
  return request.post<AgencySubTabRecentSummaryPayload>({
    url: `${AGENCY_ANALYSIS_BASE}/subtab/table/recent-summary`,
    data: subTabBody(params)
  })
}

export function fetchAgencySubTabAccountSummary(params: AgencyAnalysisSubTabFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.SubTabAccountSummary)) {
    return mockFetchAgencySubTabAccountSummary(params)
  }
  return request.post<AgencySubTabAccountSummaryPayload>({
    url: `${AGENCY_ANALYSIS_BASE}/subtab/table/account-summary`,
    data: subTabBody(params)
  })
}

export function fetchAgencyAnalysisAgencySummary(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.AgencySummary)) {
    return mockFetchAgencyAgencySummary()
  }
  return request
    .post<{ agencies: AgencyRow[]; agencyDetailMap: Record<string, AgencyExpandData> }>({
      url: `${AGENCY_ANALYSIS_BASE}/table/agency-summary`,
      data: overviewBody(params)
    })
    .then(normalizeAgencySummaryPayload)
}

export function fetchAgencyAnalysisCampaignTable(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.CampaignTable)) {
    return mockFetchAgencyCampaignTable()
  }
  return request.post<{ campaigns: CampaignRow[] }>({
    url: `${AGENCY_ANALYSIS_BASE}/table/campaign`,
    data: overviewBody(params)
  })
}

export function fetchAgencyAnalysisDailyComparison(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.DailyComparison)) {
    return mockFetchAgencyDailyComparison()
  }
  return request.post<{ dailyRows: DailyRow[] }>({
    url: `${AGENCY_ANALYSIS_BASE}/table/daily-comparison`,
    data: rangeBody(params)
  })
}

export function fetchAgencyAnalysisDonutSpendShare(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.DonutSpendShare)) {
    return mockFetchAgencyDonutSpendShare()
  }
  return request.post<{ donut: DonutChartItem[] }>({
    url: `${AGENCY_ANALYSIS_BASE}/chart/donut-spend-share`,
    data: chartBody(params)
  })
}

export function fetchAgencyAnalysisChannelDistribution(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.ChannelDistribution)) {
    return mockFetchAgencyChannelDistribution()
  }
  return request.post<{
    categories: string[]
    series: ChannelDistributionSeries[]
  }>({
    url: `${AGENCY_ANALYSIS_BASE}/chart/channel-distribution`,
    data: chartBody(params)
  })
}

export function fetchAgencyAnalysisCountryTop8(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.CountryTop8)) {
    return mockFetchAgencyCountryTop8()
  }
  return request.post<{ countryTop8: CountryDistributionItem[] }>({
    url: `${AGENCY_ANALYSIS_BASE}/chart/country-top8`,
    data: chartBody(params)
  })
}

export function fetchAgencyAnalysisSpendTrend30d(params: AgencyAnalysisFilterQuery) {
  if (isAgencyAnalysisMock(AgencyAnalysisEndpoint.SpendTrend30d)) {
    return mockFetchAgencySpendTrend30d()
  }
  return request.post<{
    dates: string[]
    series: { name: string; color: string; values: number[] }[]
  }>({
    url: `${AGENCY_ANALYSIS_BASE}/chart/spend-trend30d`,
    data: rangeBody(params)
  })
}
