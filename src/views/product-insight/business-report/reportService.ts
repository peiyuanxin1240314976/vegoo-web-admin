// ============================================================
// Business Report – API Service Layer
// ============================================================
// 切换方式：修改 config/data-source.ts 中 BUSINESS_REPORT_USE_MOCK 对应项
//   true  → 使用本地 Mock（mockData.ts）
//   false → `@/api/business-report` + `@/utils/http`（带 Token、统一错误提示）
//
// 接口契约文档见 mock/backend-api/README.md
// ============================================================

import type {
  ReportQueryParams,
  ReportAppListQueryParams,
  ReportAppListResponse,
  SummaryResponse,
  AdPlatformResponse,
  ByCountryResponse,
  PlatformCountryResponse,
  CampaignsResponse,
  LarkPushConfig,
  CompareQueryParams,
  CompareOverviewResponse,
  CompareTrendsResponse,
  CompareMetricsResponse
} from './types'

import { BusinessReportReadEndpoint, isBusinessReportMock } from './config/data-source'

import {
  fetchBusinessReportAppList,
  fetchBusinessReportSummary,
  fetchBusinessReportAdPlatform,
  fetchBusinessReportByCountry,
  fetchBusinessReportPlatformCountry,
  fetchBusinessReportCampaigns,
  fetchBusinessReportCompareOverview,
  fetchBusinessReportCompareTrends,
  fetchBusinessReportCompareMetrics,
  fetchBusinessReportLarkConfig,
  saveBusinessReportLarkConfig,
  pushBusinessReportLarkNow
} from '@/api/business-report'

import {
  dailyKpis,
  weeklyKpis,
  monthlyKpis,
  dailyUserMetrics,
  weeklyUserMetrics,
  monthlyUserMetrics,
  dailyRevenueMetrics,
  weeklyRevenueMetrics,
  monthlyRevenueMetrics,
  roiMetrics,
  retentionMetrics,
  feeDeductions,
  appList as appListData,
  weeklyAppList,
  adPlatformCards,
  countryData as countryRows,
  countryOthersRow,
  adPlatformByCountryData,
  platformCountryData,
  campaignData as campaignRows,
  larkPushConfigMock,
  compareApps,
  compareMetrics
} from './mockData'

// ── 模拟延迟（mock 模式下，便于测试加载状态） ────────────────
function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function endpointByPeriod(
  period: ReportQueryParams['period'],
  tab: 'overview' | 'adPlatform' | 'byCountry' | 'platformCountry' | 'campaigns'
): BusinessReportReadEndpoint {
  const map = {
    daily: {
      overview: BusinessReportReadEndpoint.DailyOverview,
      adPlatform: BusinessReportReadEndpoint.DailyAdPlatform,
      byCountry: BusinessReportReadEndpoint.DailyByCountry,
      platformCountry: BusinessReportReadEndpoint.DailyPlatformCountry,
      campaigns: BusinessReportReadEndpoint.DailyCampaigns
    },
    weekly: {
      overview: BusinessReportReadEndpoint.WeeklyOverview,
      adPlatform: BusinessReportReadEndpoint.WeeklyAdPlatform,
      byCountry: BusinessReportReadEndpoint.WeeklyByCountry,
      platformCountry: BusinessReportReadEndpoint.WeeklyPlatformCountry,
      campaigns: BusinessReportReadEndpoint.WeeklyCampaigns
    },
    monthly: {
      overview: BusinessReportReadEndpoint.MonthlyOverview,
      adPlatform: BusinessReportReadEndpoint.MonthlyAdPlatform,
      byCountry: BusinessReportReadEndpoint.MonthlyByCountry,
      platformCountry: BusinessReportReadEndpoint.MonthlyPlatformCountry,
      campaigns: BusinessReportReadEndpoint.MonthlyCampaigns
    }
  } as const
  return map[period][tab]
}

function appListEndpointByPeriod(period: ReportQueryParams['period']): BusinessReportReadEndpoint {
  const map = {
    daily: BusinessReportReadEndpoint.DailyAppList,
    weekly: BusinessReportReadEndpoint.WeeklyAppList,
    monthly: BusinessReportReadEndpoint.MonthlyAppList
  } as const
  return map[period]
}

function compareEndpointByPeriod(
  period: ReportQueryParams['period'],
  tab: 'overview' | 'trends' | 'metrics'
): BusinessReportReadEndpoint {
  const map = {
    daily: {
      overview: BusinessReportReadEndpoint.DailyCompareOverview,
      trends: BusinessReportReadEndpoint.DailyCompareTrends,
      metrics: BusinessReportReadEndpoint.DailyCompareMetrics
    },
    weekly: {
      overview: BusinessReportReadEndpoint.WeeklyCompareOverview,
      trends: BusinessReportReadEndpoint.WeeklyCompareTrends,
      metrics: BusinessReportReadEndpoint.WeeklyCompareMetrics
    },
    monthly: {
      overview: BusinessReportReadEndpoint.MonthlyCompareOverview,
      trends: BusinessReportReadEndpoint.MonthlyCompareTrends,
      metrics: BusinessReportReadEndpoint.MonthlyCompareMetrics
    }
  } as const
  return map[period][tab]
}

// ============================================================
// 0. 侧栏应用列表  POST /api/v1/datacenter/analysis/report/{period}/app-list
// 契约：mock/backend-api/daily|weekly|monthly-00-app-list.json
// ============================================================
export async function getReportAppList(
  params: ReportAppListQueryParams
): Promise<ReportAppListResponse> {
  if (isBusinessReportMock(appListEndpointByPeriod(params.period))) {
    const items = params.period === 'weekly' ? weeklyAppList : appListData
    return mockDelay<ReportAppListResponse>({ items })
  }
  return fetchBusinessReportAppList(params)
}

// ============================================================
// 1. 汇总表  POST /api/v1/datacenter/analysis/report/{period}/overview
// 契约：mock/backend-api/daily|weekly|monthly-01-overview.json
// ============================================================
export async function getSummary(params: ReportQueryParams): Promise<SummaryResponse> {
  if (isBusinessReportMock(endpointByPeriod(params.period, 'overview'))) {
    const { period } = params
    return mockDelay<SummaryResponse>({
      kpis: period === 'daily' ? dailyKpis : period === 'weekly' ? weeklyKpis : monthlyKpis,
      userMetrics:
        period === 'daily'
          ? dailyUserMetrics
          : period === 'weekly'
            ? weeklyUserMetrics
            : monthlyUserMetrics,
      revenueMetrics:
        period === 'daily'
          ? dailyRevenueMetrics
          : period === 'weekly'
            ? weeklyRevenueMetrics
            : monthlyRevenueMetrics,
      roiMetrics,
      retentionMetrics,
      feeDeductions: period === 'monthly' ? feeDeductions : undefined
    })
  }
  return fetchBusinessReportSummary(params)
}

// ============================================================
// 2. 广告平台  POST /api/v1/datacenter/analysis/report/{period}/ad-platform
// 契约：mock/backend-api/daily|weekly|monthly-02-ad-platform.json
// ============================================================
export async function getAdPlatform(params: ReportQueryParams): Promise<AdPlatformResponse> {
  if (isBusinessReportMock(endpointByPeriod(params.period, 'adPlatform'))) {
    // 广告平台结构三个周期一致，数值由后端按 period 聚合；mock 共用同一份数据
    return mockDelay<AdPlatformResponse>({
      platforms: adPlatformCards
    })
  }
  return fetchBusinessReportAdPlatform(params)
}

// ============================================================
// 3. 分国家汇总  POST /api/v1/datacenter/analysis/report/{period}/by-country
// 契约：mock/backend-api/daily|weekly|monthly-03-by-country.json
// ============================================================
export async function getByCountry(params: ReportQueryParams): Promise<ByCountryResponse> {
  if (isBusinessReportMock(endpointByPeriod(params.period, 'byCountry'))) {
    // 分国家结构三个周期一致，数值由后端按 period 聚合；mock 共用同一份数据
    return mockDelay<ByCountryResponse>({
      rows: countryRows,
      othersRow: countryOthersRow
    })
  }
  return fetchBusinessReportByCountry(params)
}

// ============================================================
// 4. 广告平台分国家  POST /api/v1/datacenter/analysis/report/{period}/platform-country
// 契约：mock/backend-api/daily|weekly|monthly-04-platform-country.json
// ============================================================
export async function getPlatformCountry(
  params: ReportQueryParams
): Promise<PlatformCountryResponse> {
  if (isBusinessReportMock(endpointByPeriod(params.period, 'platformCountry'))) {
    return mockDelay<PlatformCountryResponse>({
      osEntries: adPlatformByCountryData,
      flatRows: platformCountryData,
      totalPlatforms: adPlatformByCountryData.reduce((acc, os) => acc + os.platforms.length, 0),
      totalCountries: adPlatformByCountryData.reduce(
        (acc, os) => acc + os.platforms.reduce((pacc, p) => pacc + p.countries.length, 0),
        0
      )
    })
  }
  return fetchBusinessReportPlatformCountry(params)
}

// ============================================================
// 5. 在投广告系列  POST /api/v1/datacenter/analysis/report/{period}/campaigns
// 契约：mock/backend-api/daily|weekly|monthly-05-campaigns.json
// ============================================================
export async function getCampaigns(params: ReportQueryParams): Promise<CampaignsResponse> {
  if (isBusinessReportMock(endpointByPeriod(params.period, 'campaigns'))) {
    // 广告系列结构三个周期一致；mock 共用同一份数据（按分页参数切片）
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20
    const reqCurrentPage = params.currentPage && params.currentPage > 0 ? params.currentPage : 1
    const start = (reqCurrentPage - 1) * pageSize
    const rows = campaignRows.slice(start, start + pageSize)
    return mockDelay<CampaignsResponse>({
      currentPage: reqCurrentPage,
      pageSize,
      total: campaignRows.length,
      rows
    })
  }
  return fetchBusinessReportCampaigns(params)
}

// ============================================================
// 6. 读取飞书推送配置  GET /api/v1/lark/push-config
// 契约：mock/backend-api/06-lark-config-get.json
// ============================================================
export async function getLarkConfig(): Promise<LarkPushConfig> {
  if (isBusinessReportMock(BusinessReportReadEndpoint.LarkConfigGet)) {
    return mockDelay<LarkPushConfig>(larkPushConfigMock)
  }
  return fetchBusinessReportLarkConfig()
}

// ============================================================
// 7. 保存飞书推送配置  POST /api/v1/lark/push-config
// 契约：mock/backend-api/07-lark-config-save.json
// ============================================================
export async function saveLarkConfig(config: LarkPushConfig): Promise<void> {
  if (isBusinessReportMock(BusinessReportReadEndpoint.LarkConfigSave)) {
    return mockDelay<void>(undefined)
  }
  await saveBusinessReportLarkConfig(config)
}

// ============================================================
// 8. 立即推送一次  POST /api/v1/lark/push-now
// 契约：mock/backend-api/08-lark-push-now.json
// ============================================================
export async function pushReportNow(config: LarkPushConfig): Promise<void> {
  if (isBusinessReportMock(BusinessReportReadEndpoint.LarkPushNow)) {
    return mockDelay<void>(undefined, 800)
  }
  await pushBusinessReportLarkNow(config)
}

function mockCompareOverview(params: CompareQueryParams): CompareOverviewResponse {
  const compareOn = params.compareEnabled
  const apps: CompareOverviewResponse['apps'] = compareApps
    .filter((item) => params.appIds.includes(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      revenue: item.revenue,
      revenueChange: compareOn ? item.revenueChange : 0,
      metrics: [
        {
          label: params.period === 'monthly' ? 'MAU' : 'DAU',
          value: item.mau,
          change: compareOn ? `${item.mauChange >= 0 ? '+' : ''}${item.mauChange}%` : '--',
          changeType: compareOn ? (item.mauChange >= 0 ? 'positive' : 'negative') : 'neutral'
        },
        {
          label: '预估利润',
          value: item.profit,
          change: compareOn ? `${item.profitChange >= 0 ? '+' : ''}${item.profitChange}%` : '--',
          changeType: compareOn ? (item.profitChange >= 0 ? 'positive' : 'negative') : 'neutral'
        },
        {
          label: '付费收入',
          value: item.paid,
          change: compareOn ? `${item.paidChange >= 0 ? '+' : ''}${item.paidChange}%` : '--',
          changeType: compareOn ? (item.paidChange >= 0 ? 'positive' : 'negative') : 'neutral'
        },
        {
          label: '费用抄扣',
          value: item.fee,
          change: compareOn ? `${item.feeChange >= 0 ? '+' : ''}${item.feeChange}%` : '--',
          changeType: compareOn ? (item.feeChange >= 0 ? 'negative' : 'positive') : 'neutral'
        }
      ]
    }))
  return { apps }
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function fmtMd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}

function fmtYm(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function mockTrendLabels(params: CompareQueryParams): string[] {
  const end = parseYmd(params.endDate)
  if (params.period === 'daily') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(end)
      d.setDate(end.getDate() - (6 - i))
      return fmtMd(d)
    })
  }

  if (params.period === 'weekly') {
    return Array.from({ length: 8 }, (_, i) => {
      const wEnd = new Date(end)
      wEnd.setDate(end.getDate() - (7 - i) * 7)
      const wStart = new Date(wEnd)
      wStart.setDate(wEnd.getDate() - 6)
      return `${fmtMd(wStart)}~${fmtMd(wEnd)}`
    })
  }

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(end)
    d.setMonth(end.getMonth() - (5 - i))
    return fmtYm(d)
  })
}

function mockCompareTrends(params: CompareQueryParams): CompareTrendsResponse {
  const dateSeed =
    params.startDate.split('-').reduce((acc, x) => acc + Number(x), 0) +
    params.endDate.split('-').reduce((acc, x) => acc + Number(x), 0)
  const factor = 0.92 + (dateSeed % 13) * 0.01
  const compareFactor = params.compareEnabled ? 1 : 0.96
  const selected = compareApps.filter((item) => params.appIds.includes(item.id))
  const labels = mockTrendLabels(params)
  const revenueSeries = selected.map((item) => ({
    id: item.id,
    name: item.name,
    color: item.color,
    values: labels.map((_, idx) => {
      const base = (Number(item.revenue.replace(/[$,]/g, '')) / 8) * (0.7 + idx * 0.06)
      return Math.round(base * factor * compareFactor)
    })
  }))
  const userSeries = selected.map((item) => ({
    id: item.id,
    name: item.name,
    color: item.color,
    values: labels.map((_, idx) => {
      const base = (Number(item.mau.replace(/[万,]/g, '')) / 8) * (0.72 + idx * 0.05)
      return Math.round(base * factor)
    })
  }))
  return { labels, revenueSeries, userSeries }
}

function mockCompareMetrics(params: CompareQueryParams): CompareMetricsResponse {
  const allowed = new Set(params.appIds)
  const rows = compareMetrics.map((row) => {
    const values: Record<string, string> = {}
    for (const [k, v] of Object.entries(row.values)) {
      if (allowed.has(k)) values[k] = v
    }
    return { metric: row.metric, values, bestId: row.bestId }
  })
  return { rows }
}

export async function getCompareOverview(
  params: CompareQueryParams
): Promise<CompareOverviewResponse> {
  if (isBusinessReportMock(compareEndpointByPeriod(params.period, 'overview'))) {
    return mockDelay<CompareOverviewResponse>(mockCompareOverview(params))
  }
  return fetchBusinessReportCompareOverview(params)
}

export async function getCompareTrends(params: CompareQueryParams): Promise<CompareTrendsResponse> {
  if (isBusinessReportMock(compareEndpointByPeriod(params.period, 'trends'))) {
    return mockDelay<CompareTrendsResponse>(mockCompareTrends(params))
  }
  return fetchBusinessReportCompareTrends(params)
}

export async function getCompareMetrics(
  params: CompareQueryParams
): Promise<CompareMetricsResponse> {
  if (isBusinessReportMock(compareEndpointByPeriod(params.period, 'metrics'))) {
    return mockDelay<CompareMetricsResponse>(mockCompareMetrics(params))
  }
  return fetchBusinessReportCompareMetrics(params)
}
