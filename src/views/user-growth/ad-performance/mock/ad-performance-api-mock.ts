/**
 * 广告成效 - 与 `fetchAdPerformance*` 对齐的本地 Mock
 */
import type {
  CampaignDetailAdListResponse,
  CampaignDetailAiInsightsResponse,
  CampaignDetailCreativeTop5Response,
  CampaignDetailOverviewResponse
} from '../campaign-detail/types'
import type {
  AdPerformanceAccountRow,
  AdPerformanceCampaignDetail,
  AdPerformanceCampaignRow,
  AdPerformanceCountryRow,
  AdPerformanceMetaFilterResponse,
  AdPerformanceOwnerRow,
  AdPerformanceOverviewResponse,
  AdPerformanceTableAccountResponse,
  AdPerformanceTableCampaignResponse,
  AdPerformanceTableCountryResponse,
  AdPerformanceTableOwnerResponse,
  AdPerformanceTableQuery,
  AdPerformanceAlertActionBody,
  AdPerformanceAlertActionResponse,
  AdPerformanceCampaignDetailDrawerBody,
  AdPerformanceExportBody,
  AdPerformanceExportJsonResponse
} from '../types'
import { MOCK_AD_PERFORMANCE, getMockCampaignDetail } from './data'
import { MOCK_CAMPAIGN_DETAIL } from '../campaign-detail/mock/data'

const META_STATIC: AdPerformanceMetaFilterResponse = {
  dateRangeOptions: [
    { label: '今日', value: 'today' },
    { label: '昨日', value: 'yesterday' },
    { label: '近7天', value: 'last7d' },
    { label: '本月', value: 'month' }
  ],
  appOptions: [
    { label: '全部(53)', value: '' },
    { label: 'Weather5', value: 'Weather5' },
    { label: 'BloodSugar2', value: 'BloodSugar2' },
    { label: 'PhoneTracker', value: 'PhoneTracker' },
    { label: 'FaceMe', value: 'FaceMe' },
    { label: 'HealthTracker', value: 'HealthTracker' }
  ],
  adPlatformOptions: [
    { label: '全部', value: '' },
    { label: 'Google', value: 'google' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'TikTok', value: 'tiktok' },
    { label: 'Meta', value: 'meta' },
    { label: 'Kwai', value: 'kwai' },
    { label: 'Mintegral', value: 'mintegral' }
  ],
  accountOptions: [{ label: '全部', value: '' }],
  countryOptions: [
    { label: '全部', value: '' },
    { label: 'US', value: 'US' },
    { label: 'UK', value: 'UK' },
    { label: 'CA', value: 'CA' },
    { label: 'JP', value: 'JP' },
    { label: 'BR', value: 'BR' }
  ]
}

function normQuery(q: AdPerformanceTableQuery) {
  return {
    keyword: (q.keyword ?? '').trim().toLowerCase(),
    current: q.current ?? 1,
    size: q.size ?? 10
  }
}

function campaignRowMatches(row: AdPerformanceCampaignRow, kw: string): boolean {
  if (!kw) return true
  const blob = [row.name, row.appName, row.channel, row.country].join(' ').toLowerCase()
  if (blob.includes(kw)) return true
  return row.children?.some((c) => campaignRowMatches(c, kw)) ?? false
}

function filterCampaignRows(rows: AdPerformanceCampaignRow[], kw: string) {
  if (!kw) return rows
  return rows.filter((r) => campaignRowMatches(r, kw))
}

function countryRowMatches(row: AdPerformanceCountryRow, kw: string) {
  if (!kw) return true
  return row.country.toLowerCase().includes(kw)
}

function ownerRowMatches(row: AdPerformanceOwnerRow, kw: string) {
  if (!kw) return true
  const blob = [
    row.ownerName,
    ...(row.children?.map((c) => [c.campaignName, c.channel, c.country].join(' ')) ?? [])
  ]
    .join(' ')
    .toLowerCase()
  return blob.includes(kw)
}

function accountRowMatches(row: AdPerformanceAccountRow, kw: string) {
  if (!kw) return true
  const blob = [
    row.accountName,
    row.platform,
    ...(row.children?.map((c) => [c.campaignName, c.channel, c.country].join(' ')) ?? [])
  ]
    .join(' ')
    .toLowerCase()
  return blob.includes(kw)
}

function slicePage<T>(rows: T[], current: number, size: number) {
  const total = rows.length
  const start = (current - 1) * size
  return {
    pageRows: rows.slice(start, start + size),
    pagination: { current, size, total }
  }
}

export function mockFetchAdPerformanceMetaFilterOptions(): Promise<AdPerformanceMetaFilterResponse> {
  return Promise.resolve({ ...META_STATIC })
}

export function mockFetchAdPerformanceOverview(
  _filter: import('../types').AdPerformanceFilter
): Promise<AdPerformanceOverviewResponse> {
  void _filter
  const m = MOCK_AD_PERFORMANCE
  return Promise.resolve({
    dataTime: m.dataTime,
    kpi: m.kpi,
    spendTrend: m.spendTrend,
    roi7dTrend: m.roi7dTrend,
    channelDistribution: m.channelDistribution,
    appDistribution: m.appDistribution,
    ownerShareDistribution: m.ownerShareDistribution,
    alerts: m.alerts
  })
}

export function mockFetchAdPerformanceTableCampaign(
  q: AdPerformanceTableQuery
): Promise<AdPerformanceTableCampaignResponse> {
  const { keyword, current, size } = normQuery(q)
  const filtered = filterCampaignRows(MOCK_AD_PERFORMANCE.campaignTableRows, keyword)
  const { pageRows, pagination } = slicePage(filtered, current, size)
  return Promise.resolve({ rows: pageRows, pagination })
}

export function mockFetchAdPerformanceTableCountry(
  q: AdPerformanceTableQuery
): Promise<AdPerformanceTableCountryResponse> {
  const { keyword, current, size } = normQuery(q)
  const filtered = MOCK_AD_PERFORMANCE.countryTableRows.filter((r) => countryRowMatches(r, keyword))
  const { pageRows, pagination } = slicePage(filtered, current, size)
  return Promise.resolve({ rows: pageRows, pagination })
}

export function mockFetchAdPerformanceTableOwner(
  q: AdPerformanceTableQuery
): Promise<AdPerformanceTableOwnerResponse> {
  const { keyword, current, size } = normQuery(q)
  const filtered = MOCK_AD_PERFORMANCE.ownerTableRows.filter((r) => ownerRowMatches(r, keyword))
  const { pageRows, pagination } = slicePage(filtered, current, size)
  return Promise.resolve({
    rows: pageRows,
    summary: MOCK_AD_PERFORMANCE.ownerTeamSummary,
    pagination
  })
}

export function mockFetchAdPerformanceTableAccount(
  q: AdPerformanceTableQuery
): Promise<AdPerformanceTableAccountResponse> {
  const { keyword, current, size } = normQuery(q)
  const filtered = MOCK_AD_PERFORMANCE.accountTableRows.filter((r) => accountRowMatches(r, keyword))
  const { pageRows, pagination } = slicePage(filtered, current, size)
  return Promise.resolve({
    rows: pageRows,
    summary: MOCK_AD_PERFORMANCE.accountSummary,
    pagination
  })
}

export function mockFetchAdPerformanceCampaignDetailDrawer(
  body: AdPerformanceCampaignDetailDrawerBody
): Promise<AdPerformanceCampaignDetail> {
  const detail = getMockCampaignDetail(body.campaignId)
  if (!detail) {
    return Promise.reject(new Error('未找到系列详情'))
  }
  return Promise.resolve(detail)
}

export function mockFetchAdPerformanceExport(
  _body: AdPerformanceExportBody
): Promise<AdPerformanceExportJsonResponse> {
  void _body
  return Promise.resolve({})
}

export function mockFetchAdPerformanceAlertAction(
  _body: AdPerformanceAlertActionBody
): Promise<AdPerformanceAlertActionResponse> {
  void _body
  return Promise.resolve({ success: true, message: '操作成功（Mock）' })
}

export function mockFetchCampaignDetailOverview(_body: {
  campaignId: string
}): Promise<CampaignDetailOverviewResponse> {
  void _body
  const d = MOCK_CAMPAIGN_DETAIL
  return Promise.resolve({
    campaignName: d.campaignName,
    status: d.status,
    basicInfo: d.basicInfo,
    budgetInfo: d.budgetInfo,
    targetInfo: d.targetInfo,
    trendData: d.trendData
  })
}

export function mockFetchCampaignDetailAdList(body: {
  campaignId: string
  status?: string
}): Promise<CampaignDetailAdListResponse> {
  void body
  return Promise.resolve({ rows: MOCK_CAMPAIGN_DETAIL.adRows })
}

export function mockFetchCampaignDetailCreativeTop5(_body: {
  campaignId: string
}): Promise<CampaignDetailCreativeTop5Response> {
  void _body
  return Promise.resolve({ items: MOCK_CAMPAIGN_DETAIL.creativeTop5 })
}

export function mockFetchCampaignDetailAiInsights(_body: {
  campaignId: string
}): Promise<CampaignDetailAiInsightsResponse> {
  void _body
  return Promise.resolve({ insights: MOCK_CAMPAIGN_DETAIL.aiInsights })
}
