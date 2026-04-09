/**
 * 经营报告（报告管理）— 与 `views/product-insight/business-report/mock/backend-api` 契约一致
 *
 * 报告数据：`BUSINESS_REPORT_DATA_BASE`（见模块 `config/api-base.ts`，含 `datacenter/analysis` 段）
 * 飞书：`/api/v1/lark`
 */
import request from '@/utils/http'
import { BUSINESS_REPORT_DATA_BASE } from '@/views/product-insight/business-report/config/api-base'
import type {
  ReportQueryParams,
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
} from '@/views/product-insight/business-report/types'

const LARK_BASE = '/api/v1/lark'

/** 兼容网关在业务 data 外再包一层或多层 `data`（axios 已解包 BaseResponse.data） */
function unwrapReportPayload<T>(raw: unknown, maxDepth = 4): T {
  let cur: unknown = raw
  let depth = 0
  while (
    depth < maxDepth &&
    cur !== null &&
    typeof cur === 'object' &&
    !Array.isArray(cur) &&
    'data' in (cur as object)
  ) {
    cur = (cur as { data: unknown }).data
    depth++
  }
  return cur as T
}

function reportBody(params: ReportQueryParams): Record<string, unknown> {
  return {
    startDate: params.startDate,
    endDate: params.endDate,
    appId: params.appId ?? '',
    platform: params.platform ?? '',
    source: params.source ?? '',
    countryCode: params.countryCode ?? '',
    account: params.account ?? ''
  }
}

async function reportPost<T>(path: string, params: ReportQueryParams): Promise<T> {
  const raw = await request.post<unknown>({
    url: `${BUSINESS_REPORT_DATA_BASE}${path}`,
    data: reportBody(params)
  })
  return unwrapReportPayload<T>(raw)
}

function reportPeriodPath(period: ReportQueryParams['period'], feature: string): string {
  return `/${period}/${feature}`
}

/** POST …/datacenter/analysis/report/{period}/overview */
export function fetchBusinessReportSummary(params: ReportQueryParams) {
  return reportPost<SummaryResponse>(reportPeriodPath(params.period, 'overview'), params)
}

/** POST …/datacenter/analysis/report/{period}/ad-platform */
export function fetchBusinessReportAdPlatform(params: ReportQueryParams) {
  return reportPost<AdPlatformResponse>(reportPeriodPath(params.period, 'ad-platform'), params)
}

/** POST …/datacenter/analysis/report/{period}/by-country */
export function fetchBusinessReportByCountry(params: ReportQueryParams) {
  return reportPost<ByCountryResponse>(reportPeriodPath(params.period, 'by-country'), params)
}

/** POST …/datacenter/analysis/report/{period}/platform-country */
export function fetchBusinessReportPlatformCountry(params: ReportQueryParams) {
  return reportPost<PlatformCountryResponse>(
    reportPeriodPath(params.period, 'platform-country'),
    params
  )
}

/** POST …/datacenter/analysis/report/{period}/campaigns */
export function fetchBusinessReportCampaigns(params: ReportQueryParams) {
  return reportPost<CampaignsResponse>(reportPeriodPath(params.period, 'campaigns'), params)
}

function compareBody(params: CompareQueryParams): Record<string, unknown> {
  return {
    ...reportBody(params),
    appIds: params.appIds,
    compareEnabled: params.compareEnabled,
    compareStartDate: params.compareStartDate,
    compareEndDate: params.compareEndDate
  }
}

async function comparePost<T>(feature: string, params: CompareQueryParams): Promise<T> {
  const raw = await request.post<unknown>({
    url: `${BUSINESS_REPORT_DATA_BASE}/${params.period}/${feature}`,
    data: compareBody(params)
  })
  return unwrapReportPayload<T>(raw)
}

export function fetchBusinessReportCompareOverview(params: CompareQueryParams) {
  return comparePost<CompareOverviewResponse>('compare-overview', params)
}

export function fetchBusinessReportCompareTrends(params: CompareQueryParams) {
  return comparePost<CompareTrendsResponse>('compare-trends', params)
}

export function fetchBusinessReportCompareMetrics(params: CompareQueryParams) {
  return comparePost<CompareMetricsResponse>('compare-metrics', params)
}

/** GET …/lark/push-config */
export async function fetchBusinessReportLarkConfig() {
  const raw = await request.get<unknown>({ url: `${LARK_BASE}/push-config` })
  return unwrapReportPayload<LarkPushConfig>(raw)
}

/** POST …/lark/push-config */
export function saveBusinessReportLarkConfig(config: LarkPushConfig) {
  return request.post<unknown>({
    url: `${LARK_BASE}/push-config`,
    data: config
  })
}

/** POST …/lark/push-now */
export function pushBusinessReportLarkNow(config: LarkPushConfig) {
  return request.post<unknown>({
    url: `${LARK_BASE}/push-now`,
    data: config
  })
}
