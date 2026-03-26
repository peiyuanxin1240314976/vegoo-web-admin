/**
 * 经营报告（报告管理）— 与 `views/business-insight/business-report/mock/backend-api` 契约一致
 *
 * 报告数据：`BUSINESS_REPORT_DATA_BASE`（见模块 `config/api-base.ts`，含 `datacenter/analysis` 段）
 * 飞书：`/api/v1/lark`
 */
import request from '@/utils/http'
import { BUSINESS_REPORT_DATA_BASE } from '@/views/business-insight/business-report/config/api-base'
import type {
  ReportQueryParams,
  SummaryResponse,
  AdPlatformResponse,
  ByCountryResponse,
  PlatformCountryResponse,
  CampaignsResponse,
  LarkPushConfig
} from '@/views/business-insight/business-report/types'

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

function reportQueryParams(params: ReportQueryParams): Record<string, string> {
  const q: Record<string, string> = { period: params.period }
  if (params.appId) q.appId = params.appId
  if (params.date) q.date = params.date
  return q
}

async function reportGet<T>(path: string, params: ReportQueryParams): Promise<T> {
  const raw = await request.get<unknown>({
    url: `${BUSINESS_REPORT_DATA_BASE}${path}`,
    params: reportQueryParams(params)
  })
  return unwrapReportPayload<T>(raw)
}

/** GET …/datacenter/analysis/report/summary */
export function fetchBusinessReportSummary(params: ReportQueryParams) {
  return reportGet<SummaryResponse>('/summary', params)
}

/** GET …/datacenter/analysis/report/ad-platform */
export function fetchBusinessReportAdPlatform(params: ReportQueryParams) {
  return reportGet<AdPlatformResponse>('/ad-platform', params)
}

/** GET …/datacenter/analysis/report/by-country */
export function fetchBusinessReportByCountry(params: ReportQueryParams) {
  return reportGet<ByCountryResponse>('/by-country', params)
}

/** GET …/datacenter/analysis/report/platform-country */
export function fetchBusinessReportPlatformCountry(params: ReportQueryParams) {
  return reportGet<PlatformCountryResponse>('/platform-country', params)
}

/** GET …/datacenter/analysis/report/campaigns */
export function fetchBusinessReportCampaigns(params: ReportQueryParams) {
  return reportGet<CampaignsResponse>('/campaigns', params)
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
