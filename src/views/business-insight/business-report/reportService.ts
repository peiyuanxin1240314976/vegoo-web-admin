// ============================================================
// Business Report – API Service Layer
// ============================================================
// 切换方式：修改 config/data-source.ts 中 BUSINESS_REPORT_USE_MOCK 对应项
//   true  → 使用本地 Mock（mockData.ts）
//   false → 调用真实后端接口
//
// 接口契约文档见 mock/backend-api/README.md
// ============================================================

import type {
  ReportQueryParams,
  SummaryResponse,
  AdPlatformResponse,
  ByCountryResponse,
  PlatformCountryResponse,
  CampaignsResponse,
  LarkPushConfig,
  ApiResponse
} from './types'

import { BusinessReportEndpoint, isBusinessReportMock } from './config/data-source'

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
  larkPushConfigMock
} from './mockData'

// ── 基础 URL（真实接口时使用） ──────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

// ── 通用请求工具 ─────────────────────────────────────────────
async function request<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const body: ApiResponse<T> = await res.json()
  if (body.code !== 0) throw new Error(body.message || '接口返回错误')
  return body.data
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const body: ApiResponse<T> = await res.json()
  if (body.code !== 0) throw new Error(body.message || '接口返回错误')
  return body.data
}

// ── 模拟延迟（mock 模式下，便于测试加载状态） ────────────────
function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

// ── 通用查询参数构造 ─────────────────────────────────────────
function buildQueryParams(params: ReportQueryParams): Record<string, string> {
  return {
    period: params.period,
    ...(params.appId ? { appId: params.appId } : {}),
    ...(params.date ? { date: params.date } : {})
  }
}

// ============================================================
// 1. 汇总表  GET /api/v1/report/summary
// 契约：mock/backend-api/01-summary.json
// ============================================================
export async function getSummary(params: ReportQueryParams): Promise<SummaryResponse> {
  if (isBusinessReportMock(BusinessReportEndpoint.Summary)) {
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
      feeDeductions: period === 'monthly' ? feeDeductions : undefined,
      appList: period === 'weekly' ? weeklyAppList : appListData
    })
  }
  return request<SummaryResponse>('/report/summary', buildQueryParams(params))
}

// ============================================================
// 2. 广告平台  GET /api/v1/report/ad-platform
// 契约：mock/backend-api/02-ad-platform.json
// ============================================================
export async function getAdPlatform(params: ReportQueryParams): Promise<AdPlatformResponse> {
  if (isBusinessReportMock(BusinessReportEndpoint.AdPlatform)) {
    // 广告平台结构三个周期一致，数值由后端按 period 聚合；mock 共用同一份数据
    return mockDelay<AdPlatformResponse>({
      platforms: adPlatformCards,
      appList: params.period === 'weekly' ? weeklyAppList : appListData
    })
  }
  return request<AdPlatformResponse>('/report/ad-platform', buildQueryParams(params))
}

// ============================================================
// 3. 分国家汇总  GET /api/v1/report/by-country
// 契约：mock/backend-api/03-by-country.json
// ============================================================
export async function getByCountry(params: ReportQueryParams): Promise<ByCountryResponse> {
  if (isBusinessReportMock(BusinessReportEndpoint.ByCountry)) {
    // 分国家结构三个周期一致，数值由后端按 period 聚合；mock 共用同一份数据
    return mockDelay<ByCountryResponse>({
      rows: countryRows,
      othersRow: countryOthersRow,
      appList: params.period === 'weekly' ? weeklyAppList : appListData
    })
  }
  return request<ByCountryResponse>('/report/by-country', buildQueryParams(params))
}

// ============================================================
// 4. 广告平台分国家  GET /api/v1/report/platform-country
// 契约：mock/backend-api/04-platform-country.json
// ============================================================
export async function getPlatformCountry(
  params: ReportQueryParams
): Promise<PlatformCountryResponse> {
  if (isBusinessReportMock(BusinessReportEndpoint.PlatformCountry)) {
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
  return request<PlatformCountryResponse>('/report/platform-country', buildQueryParams(params))
}

// ============================================================
// 5. 在投广告系列  GET /api/v1/report/campaigns
// 契约：mock/backend-api/05-campaigns.json
// ============================================================
export async function getCampaigns(params: ReportQueryParams): Promise<CampaignsResponse> {
  if (isBusinessReportMock(BusinessReportEndpoint.Campaigns)) {
    // 广告系列结构三个周期一致；mock 共用同一份数据
    return mockDelay<CampaignsResponse>({
      rows: campaignRows,
      appList: params.period === 'weekly' ? weeklyAppList : appListData
    })
  }
  return request<CampaignsResponse>('/report/campaigns', buildQueryParams(params))
}

// ============================================================
// 6. 读取飞书推送配置  GET /api/v1/lark/push-config
// 契约：mock/backend-api/06-lark-config-get.json
// ============================================================
export async function getLarkConfig(): Promise<LarkPushConfig> {
  if (isBusinessReportMock(BusinessReportEndpoint.LarkConfigGet)) {
    return mockDelay<LarkPushConfig>(larkPushConfigMock)
  }
  return request<LarkPushConfig>('/lark/push-config')
}

// ============================================================
// 7. 保存飞书推送配置  POST /api/v1/lark/push-config
// 契约：mock/backend-api/07-lark-config-save.json
// ============================================================
export async function saveLarkConfig(config: LarkPushConfig): Promise<void> {
  if (isBusinessReportMock(BusinessReportEndpoint.LarkConfigSave)) {
    return mockDelay<void>(undefined)
  }
  await post<null>('/lark/push-config', config)
}

// ============================================================
// 8. 立即推送一次  POST /api/v1/lark/push-now
// 契约：mock/backend-api/08-lark-push-now.json
// ============================================================
export async function pushReportNow(config: LarkPushConfig): Promise<void> {
  if (isBusinessReportMock(BusinessReportEndpoint.LarkPushNow)) {
    return mockDelay<void>(undefined, 800)
  }
  await post<null>('/lark/push-now', config)
}
