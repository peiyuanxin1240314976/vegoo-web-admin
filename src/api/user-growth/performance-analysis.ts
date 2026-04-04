import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  isPerformanceAnalysisEndpointMock,
  PerformanceAnalysisEndpoint
} from '@/views/user-growth/performance-analysis/config/data-source'
import {
  mockFetchPerformanceCompareCandidates,
  mockFetchPerformanceComparisonAlerts,
  mockFetchPerformanceComparisonCharts,
  mockFetchPerformanceComparisonOverview,
  mockFetchPerformanceComparisonRankings,
  mockFetchPerformanceComparisonScoreDetail,
  mockFetchPerformanceList,
  mockFetchPerformanceListFilterOptions,
  mockFetchPerformanceOverviewMetrics,
  type ComparisonStaffRequest,
  type PerformanceListRequest,
  type PerformanceListRow,
  type PerformanceListTotals,
  type PerformanceOverviewRequest
} from '@/views/user-growth/performance-analysis/mock/performance-analysis-api-mock'

export interface PerformanceCompareCandidatesRequest {
  startDate: string
  endDate: string
  personFilter?: string
  appFilter?: string
  statusFilter?: string
  keyword?: string
  excludeIds: string[]
  current?: number
  size?: number
}

export interface PerformanceCompareCandidatesItem {
  id: string
  name: string
  level: string
  status: string
  statusClass: string
  score: number
}

export interface PerformanceCompareCandidatesResponse {
  list: PerformanceCompareCandidatesItem[]
  total: number
}

export type {
  ComparisonStaffRequest,
  PerformanceListRequest,
  PerformanceListRow,
  PerformanceListTotals,
  PerformanceOverviewRequest
}

export interface PerformanceListFilterOptionsResponse {
  personOptions: { label: string; value: string }[]
  appCategoryOptions: { label: string; value: string }[]
  statusOptions: { label: string; value: string }[]
}

export interface PerformanceListResponse {
  list: PerformanceListRow[]
  total: number
  totals: PerformanceListTotals
}

export interface PerformanceOverviewMetricsResponse {
  adSpend: number
  adSpendWeekOverWeekText?: string
  avgRoi1: number
  roiStatusLabel: string
  estProfit: number
  estProfitWeekOverWeekText?: string
  failCount: number
  failNames: string[]
}

export interface PerformanceComparisonOverviewResponse {
  totalAd: number
  totalAdWeekOverWeekText?: string
  avgRoi: number
  roiPassLabel?: string
  totalProfit: number
  totalProfitWeekOverWeekText?: string
  failCount: number
  failName: string
}

export interface PerformanceComparisonLineSeries {
  id: string
  name: string
  values: number[]
}

export interface PerformanceComparisonRadarIndicator {
  name: string
  max: number
}

export interface PerformanceComparisonProfitBar {
  id: string
  name: string
  value: number
}

export interface PerformanceComparisonRoiRefLine {
  name: string
  value: number
}

export interface PerformanceComparisonChartsResponse {
  dates: string[]
  roiTrend: PerformanceComparisonLineSeries[]
  adSpendTrend: PerformanceComparisonLineSeries[]
  radarIndicators: PerformanceComparisonRadarIndicator[]
  radarSeries: PerformanceComparisonLineSeries[]
  profitBars: PerformanceComparisonProfitBar[]
  roiRefLines?: PerformanceComparisonRoiRefLine[]
}

export interface PerformanceComparisonRankingRow {
  metric: string
  r1: string
  r2: string
  r3: string
}

export interface PerformanceComparisonRankingsResponse {
  rows: PerformanceComparisonRankingRow[]
}

export interface PerformanceComparisonScoreDetailItem {
  id: string
  name: string
  color: string
  spend: number
  roi: number
  cpi: number
  profit: number
  total: number
  status: string
  statusClass: string
}

export interface PerformanceComparisonScoreDetailResponse {
  list: PerformanceComparisonScoreDetailItem[]
}

export interface PerformanceComparisonAlertItem {
  id: string
  level: 'warn' | 'error'
  text: string
}

export interface PerformanceComparisonAlertsResponse {
  list: PerformanceComparisonAlertItem[]
}

export const PERFORMANCE_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/user-growth/performance-analysis`

export function fetchPerformanceListFilterOptions(body: { startDate: string; endDate: string }) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.ListFilterOptions)) {
    return mockFetchPerformanceListFilterOptions(body)
  }
  return request.post<PerformanceListFilterOptionsResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/list-filter-options`,
    data: body
  })
}

export function fetchPerformanceList(body: PerformanceListRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.PerformanceList)) {
    return mockFetchPerformanceList(body)
  }
  return request.post<PerformanceListResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/performance-list`,
    data: body
  })
}

export function fetchPerformanceOverviewMetrics(body: PerformanceOverviewRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.OverviewMetrics)) {
    return mockFetchPerformanceOverviewMetrics(body)
  }
  return request.post<PerformanceOverviewMetricsResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/overview-metrics`,
    data: body
  })
}

export function fetchPerformanceCompareCandidates(body: PerformanceCompareCandidatesRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.CompareCandidates)) {
    return mockFetchPerformanceCompareCandidates(body)
  }
  return request.post<PerformanceCompareCandidatesResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/compare-candidates`,
    data: body
  })
}

export function fetchPerformanceComparisonOverview(body: ComparisonStaffRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.ComparisonOverview)) {
    return mockFetchPerformanceComparisonOverview(body)
  }
  return request.post<PerformanceComparisonOverviewResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/comparison-overview`,
    data: body
  })
}

export function fetchPerformanceComparisonCharts(body: ComparisonStaffRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.ComparisonCharts)) {
    return mockFetchPerformanceComparisonCharts(body)
  }
  return request.post<PerformanceComparisonChartsResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/comparison-charts`,
    data: body
  })
}

export function fetchPerformanceComparisonRankings(body: ComparisonStaffRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.ComparisonRankings)) {
    return mockFetchPerformanceComparisonRankings(body)
  }
  return request.post<PerformanceComparisonRankingsResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/comparison-rankings`,
    data: body
  })
}

export function fetchPerformanceComparisonScoreDetail(body: ComparisonStaffRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.ComparisonScoreDetail)) {
    return mockFetchPerformanceComparisonScoreDetail(body)
  }
  return request.post<PerformanceComparisonScoreDetailResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/comparison-score-detail`,
    data: body
  })
}

export function fetchPerformanceComparisonAlerts(body: ComparisonStaffRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.ComparisonAlerts)) {
    return mockFetchPerformanceComparisonAlerts(body)
  }
  return request.post<PerformanceComparisonAlertsResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/comparison-alerts`,
    data: body
  })
}
