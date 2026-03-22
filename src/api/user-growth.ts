/**
 * 用户增长 - 转化管理 & 整体回收 & 综合分析 & 广告平台分析详情 API
 * 综合分析 / 广告平台分析详情 / 预警管理：当前返回 `mock/data.ts` 本地数据；接入真实接口时在下方方法内改为 `request.post`
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- Mock 接口参数保留供后端联调使用 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type {
  OverallRecoveryFilterOptions,
  OverallTabData,
  OrganicTabData
} from '@/views/user-growth/overall-recovery/types'
import {
  MOCK_OVERALL_RECOVERY_FILTER_OPTIONS,
  MOCK_OVERALL_TAB_DATA,
  MOCK_ORGANIC_TAB_DATA
} from '@/views/user-growth/overall-recovery/mock/data'
import type { ComprehensiveAnalysisFilterState } from '@/views/user-growth/comprehensive-analysis/types'
import { buildComprehensiveAnalysisApiParams } from '@/views/user-growth/comprehensive-analysis/utils/buildApiParams'
import {
  buildMockComprehensiveAnalysisData,
  MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS
} from '@/views/user-growth/comprehensive-analysis/mock/data'
import { buildMockPlatformAnalysisDetailData } from '@/views/user-growth/platform-analysis-detail/mock/data'
import type {
  AlertManagementOverview,
  AlertManagementOverviewParams
} from '@/views/user-growth/alert-management/types'
import { buildMockAlertManagementOverview } from '@/views/user-growth/alert-management/mock/data'

const USER_GROWTH_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/user-growth`

// ─── 整体回收 ──────────────────────────────────────────────────

/** 整体回收 - 下拉筛选选项 */
export function fetchOverallRecoveryFilterOptions() {
  return Promise.resolve<OverallRecoveryFilterOptions>(MOCK_OVERALL_RECOVERY_FILTER_OPTIONS)
}

/** 整体回收 - Tab1 整体回收数据 */
export function fetchOverallTabData(_params: {
  dateRange: string
  s_app_id: string
  source: string
  s_country_code: string
}) {
  return Promise.resolve<OverallTabData>(MOCK_OVERALL_TAB_DATA)
}

/** 整体回收 - Tab2 自然量分析数据 */
export function fetchOrganicTabData(_params: {
  dateRange: string
  s_app_id: string
  source: string
  s_country_code: string
}) {
  return Promise.resolve<OrganicTabData>(MOCK_ORGANIC_TAB_DATA)
}

/** 获取转化映射列表（占位：可先使用 views 下 mock 的 fetchConversionMappingListMock） */
export function fetchConversionMappingList(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Api.UserGrowth.ConversionMappingList>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/list`,
    params
  })
}

/** 获取转化映射详情（占位） */
export function fetchConversionMappingDetail(id: string) {
  return request.get<Api.UserGrowth.ConversionMappingItem>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/${id}`
  })
}

/** 新增转化映射（占位） */
export function createConversionMapping(data: Record<string, unknown>) {
  return request.post<unknown>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping`,
    data
  })
}

/** 更新转化映射（占位） */
export function updateConversionMapping(id: string, data: Record<string, unknown>) {
  return request.put<unknown>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/${id}`,
    data
  })
}

/** 删除转化映射（占位） */
export function deleteConversionMapping(id: string) {
  return request.del<unknown>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/${id}`
  })
}

/** 获取转化管理右侧统计（占位） */
export function fetchConversionStats() {
  return request.get<{
    typeDistribution: Api.UserGrowth.ConversionTypeDistributionItem[]
    mappingStats: Api.UserGrowth.MappingStats
    platformStats: Api.UserGrowth.PlatformStats
  }>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/stats`
  })
}

/** 导出映射表（占位） */
export function exportMappingTable(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Blob>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/export`,
    params,
    responseType: 'blob'
  })
}

// ─── 综合分析 ──────────────────────────────────────────────────

/** 综合分析 - 下拉筛选选项（当前：mock；后端：`POST /api/user-growth/comprehensive-analysis/meta-filter-options`） */
export function fetchComprehensiveAnalysisFilterOptions() {
  return Promise.resolve(MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS)
}

/** 综合分析 - 页面 KPI/图表聚合（不含仅前端的 viewMode）（当前：mock；后端：`POST .../overview`） */
export function fetchComprehensiveAnalysisData(
  filters: Pick<
    ComprehensiveAnalysisFilterState,
    'dateRange' | 's_app_id' | 'adPlatform' | 's_country_code'
  >
) {
  return Promise.resolve(
    buildMockComprehensiveAnalysisData(buildComprehensiveAnalysisApiParams(filters))
  )
}

/** 广告平台分析详情页（从综合分析 drill-down 进入）（当前：mock；后端：`POST /api/user-growth/platform-analysis-detail/overview`） */
export function fetchPlatformAnalysisDetailData(params: { name: string; from: string }) {
  return Promise.resolve(buildMockPlatformAnalysisDetailData(params))
}

// ─── 预警管理 ──────────────────────────────────────────────────

/** 预警管理 - 整页聚合（当前：mock；后端：`POST /api/user-growth/alert-management/overview`） */
export function fetchAlertManagementOverview(
  params: AlertManagementOverviewParams
): Promise<AlertManagementOverview> {
  return Promise.resolve(buildMockAlertManagementOverview(params))
  // return request.post<AlertManagementOverview>('/api/user-growth/alert-management/overview', params)
}

/** 广告平台分析大屏 - 筛选下拉元数据 POST /api/v1/datacenter/analysis/ad-platform/filters/meta（请求体 `{}`） */
export function fetchAdPlatformAnalysisFiltersMeta() {
  return request.post<Api.UserGrowth.AdPlatformFiltersMetaDto>({
    url: `${ANALYSIS_API_BASE}/ad-platform/filters/meta`,
    data: {}
  })
}

/** 广告平台分析大屏 - 第一排 KPI 卡片 POST /api/v1/datacenter/analysis/ad-platform/kpi/cards */
export function fetchAdPlatformAnalysisKpiCards(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformKpiCardDto[]>({
    url: `${ANALYSIS_API_BASE}/ad-platform/kpi/cards`,
    data: params
  })
}

/** 广告平台分析大屏 - ROI 趋势 POST /api/v1/datacenter/analysis/ad-platform/roi/trend */
export function fetchAdPlatformAnalysisRoiTrend(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformRoiTrendDto>({
    url: `${ANALYSIS_API_BASE}/ad-platform/roi/trend`,
    data: params
  })
}

/** 广告平台分析大屏 - 用户质量热力图 POST /api/v1/datacenter/analysis/ad-platform/quality/heatmap */
export function fetchAdPlatformAnalysisQualityHeatmap(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformQualityHeatmapRowDto[]>({
    url: `${ANALYSIS_API_BASE}/ad-platform/quality/heatmap`,
    data: params
  })
}

/** 广告平台分析大屏 - Top10 广告系列 POST /api/v1/datacenter/analysis/ad-platform/campaign/top10 */
export function fetchAdPlatformAnalysisCampaignTop10(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformCampaignTop10RowDto[]>({
    url: `${ANALYSIS_API_BASE}/ad-platform/campaign/top10`,
    data: params
  })
}

/** 广告平台分析大屏 - 指标比较详情表（分页） POST /api/v1/datacenter/analysis/ad-platform/metrics/table */
export function fetchAdPlatformAnalysisMetricsTable(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformMetricsTableDto>({
    url: `${ANALYSIS_API_BASE}/ad-platform/metrics/table`,
    data: params
  })
}

// ─── 我的广告 ──────────────────────────────────────────────────

/** 我的广告 - 人员下拉选项 POST /api/v1/datacenter/analysis/my-ads/meta-staff-options（无请求体） */
export function fetchMyAdsStaffOptions() {
  return request.post<{ id: string; name: string }[]>({
    url: '/api/v1/datacenter/analysis/my-ads/meta-staff-options',
    data: {}
  })
}

/** 我的广告 - 頁頭用戶信息與指標 POST /api/v1/datacenter/analysis/my-ads/overview/page-header */
export function fetchMyAdsPageHeader(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsPageHeaderResponseDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/page-header',
    data: params
  })
}

/** 我的广告 - 汇总 Tab POST /api/v1/datacenter/analysis/my-ads/overview/summary */
export function fetchMyAdsSummary(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsSummaryResponseDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/summary',
    data: params
  })
}

/** 我的广告 - 应用+广告平台 Tab POST /api/v1/datacenter/analysis/my-ads/overview/platform */
export function fetchMyAdsPlatform(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsPlatformResponseDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/platform',
    data: params
  })
}

/** 我的广告 - 广告系列明细 Tab POST /api/v1/datacenter/analysis/my-ads/overview/campaign */
export function fetchMyAdsCampaign(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsCampaignTableDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/campaign',
    data: params
  })
}
