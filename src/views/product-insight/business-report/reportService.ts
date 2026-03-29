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
  SummaryResponse,
  AdPlatformResponse,
  ByCountryResponse,
  PlatformCountryResponse,
  CampaignsResponse,
  LarkPushConfig
} from './types'

import { BusinessReportEndpoint, isBusinessReportMock } from './config/data-source'

import {
  fetchBusinessReportSummary,
  fetchBusinessReportAdPlatform,
  fetchBusinessReportByCountry,
  fetchBusinessReportPlatformCountry,
  fetchBusinessReportCampaigns,
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
  larkPushConfigMock
} from './mockData'

// ── 模拟延迟（mock 模式下，便于测试加载状态） ────────────────
function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

// ============================================================
// 1. 汇总表  GET /api/v1/datacenter/analysis/report/summary
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
  return fetchBusinessReportSummary(params)
}

// ============================================================
// 2. 广告平台  GET /api/v1/datacenter/analysis/report/ad-platform
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
  return fetchBusinessReportAdPlatform(params)
}

// ============================================================
// 3. 分国家汇总  GET /api/v1/datacenter/analysis/report/by-country
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
  return fetchBusinessReportByCountry(params)
}

// ============================================================
// 4. 广告平台分国家  GET /api/v1/datacenter/analysis/report/platform-country
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
  return fetchBusinessReportPlatformCountry(params)
}

// ============================================================
// 5. 在投广告系列  GET /api/v1/datacenter/analysis/report/campaigns
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
  return fetchBusinessReportCampaigns(params)
}

// ============================================================
// 6. 读取飞书推送配置  GET /api/v1/lark/push-config
// 契约：mock/backend-api/06-lark-config-get.json
// ============================================================
export async function getLarkConfig(): Promise<LarkPushConfig> {
  if (isBusinessReportMock(BusinessReportEndpoint.LarkConfigGet)) {
    return mockDelay<LarkPushConfig>(larkPushConfigMock)
  }
  return fetchBusinessReportLarkConfig()
}

// ============================================================
// 7. 保存飞书推送配置  POST /api/v1/lark/push-config
// 契约：mock/backend-api/07-lark-config-save.json
// ============================================================
export async function saveLarkConfig(config: LarkPushConfig): Promise<void> {
  if (isBusinessReportMock(BusinessReportEndpoint.LarkConfigSave)) {
    return mockDelay<void>(undefined)
  }
  await saveBusinessReportLarkConfig(config)
}

// ============================================================
// 8. 立即推送一次  POST /api/v1/lark/push-now
// 契约：mock/backend-api/08-lark-push-now.json
// ============================================================
export async function pushReportNow(config: LarkPushConfig): Promise<void> {
  if (isBusinessReportMock(BusinessReportEndpoint.LarkPushNow)) {
    return mockDelay<void>(undefined, 800)
  }
  await pushBusinessReportLarkNow(config)
}
