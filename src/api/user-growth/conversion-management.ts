/**
 * 用户增长 - 转化管理 API
 *
 * 筛选项（应用/广告平台等公用维度）：请使用 `fetchComprehensiveAnalysisFilterOptions`（`./comprehensive-analysis`），勿单独请求已废弃的 `conversion-management/meta-filter-options`。
 * 联调路径与 POST 契约以 `views/user-growth/conversion-management/mock/backend-api/README.md` 为准。
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  ConversionManagementEndpoint,
  isConversionManagementEndpointMock
} from '@/views/user-growth/conversion-management/config/data-source'
import {
  fetchConversionMappingListMock,
  MOCK_CONVERSION_LIST,
  MOCK_TYPE_DISTRIBUTION,
  MOCK_MAPPING_STATS,
  MOCK_PLATFORM_STATS,
  MOCK_AD_PLATFORM_OPTIONS,
  MOCK_MCC_BY_PLATFORM,
  MOCK_APP_OPTIONS_FOR_DIALOG,
  MOCK_CONVERSION_DISPLAY_TYPE_OPTIONS,
  MOCK_CONVERSION_TYPE_OPTIONS
} from '@/views/user-growth/conversion-management/mock/data'
import {
  fetchConversionDataMock,
  mockFetchConversionMetaConversionTypeOptions
} from '@/views/user-growth/conversion-management/mock/data-tab'
import type {
  ConversionDataFilterParams,
  ConversionDataRow,
  ConversionDataSidePanels,
  ConversionFilterParams,
  ConversionKpi,
  ConversionMappingForm,
  ConversionMappingItem
} from '@/views/user-growth/conversion-management/types'

export const CONVERSION_MANAGEMENT_BASE = `${ANALYSIS_API_BASE}/user-growth/conversion-management`

function unwrapDataDeep<T = unknown>(value: unknown, maxDepth = 3): T {
  let cur: unknown = value
  let depth = 0
  while (
    depth < maxDepth &&
    cur &&
    typeof cur === 'object' &&
    'data' in (cur as Record<string, unknown>)
  ) {
    cur = (cur as Record<string, unknown>).data
    depth++
  }
  return cur as T
}

/** 01-mappings-list — POST */
export function fetchConversionMappingsList(params: ConversionFilterParams) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsList)) {
    return fetchConversionMappingListMock(params)
  }
  return request
    .post<Api.Common.PaginatedResponse<ConversionMappingItem>>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-list`,
      data: params
    })
    .then((res) => unwrapDataDeep<Api.Common.PaginatedResponse<ConversionMappingItem>>(res))
}

/** 02-mappings-stats — POST */
export function fetchConversionMappingsStats(
  params: Omit<ConversionFilterParams, 'current' | 'size'>
) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsStats)) {
    return Promise.resolve({
      typeDistribution: MOCK_TYPE_DISTRIBUTION,
      mappingStats: MOCK_MAPPING_STATS,
      platformStats: MOCK_PLATFORM_STATS
    })
  }
  return request
    .post<{
      typeDistribution: ConversionDataSidePanels['typeDistribution']
      mappingStats: typeof MOCK_MAPPING_STATS
      platformStats: typeof MOCK_PLATFORM_STATS
    }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-stats`,
      data: params
    })
    .then((res) =>
      unwrapDataDeep<{
        typeDistribution: ConversionDataSidePanels['typeDistribution']
        mappingStats: typeof MOCK_MAPPING_STATS
        platformStats: typeof MOCK_PLATFORM_STATS
      }>(res)
    )
}

/** 08-meta-conversion-type-options — POST */
export function fetchConversionMetaConversionTypeOptions() {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MetaConversionTypeOptions)) {
    return mockFetchConversionMetaConversionTypeOptions()
  }
  return request
    .post<{ conversionTypeOptions: { label: string; value: string }[] }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/meta-conversion-type-options`,
      data: {}
    })
    .then((res) =>
      unwrapDataDeep<{ conversionTypeOptions: { label: string; value: string }[] }>(res)
    )
}

/** 09-meta-dialog-options — POST */
export function fetchConversionMetaDialogOptions(params: {
  source?: string
  adPlatform?: string
  mccAccount?: string
  appId?: string
}) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MetaDialogOptions)) {
    const src = params.source ?? params.adPlatform ?? ''
    const mccAccounts = src ? (MOCK_MCC_BY_PLATFORM[src] ?? []) : []
    return Promise.resolve({
      adPlatforms: MOCK_AD_PLATFORM_OPTIONS,
      mccAccounts,
      apps: MOCK_APP_OPTIONS_FOR_DIALOG,
      conversions: []
    })
  }
  return request
    .post<{
      adPlatforms: { label: string; value: string }[]
      mccAccounts: { label: string; value: string }[]
      apps: { label: string; value: string }[]
      conversions: unknown[]
    }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/meta-dialog-options`,
      data: params
    })
    .then((res) =>
      unwrapDataDeep<{
        adPlatforms: { label: string; value: string }[]
        mccAccounts: { label: string; value: string }[]
        apps: { label: string; value: string }[]
        conversions: unknown[]
      }>(res)
    )
}

/** 13-meta-conversion-display-type-options — POST（目前页面写死，仍提供接口便于切换） */
export function fetchConversionMetaConversionDisplayTypeOptions() {
  if (
    isConversionManagementEndpointMock(
      ConversionManagementEndpoint.MetaConversionDisplayTypeOptions
    )
  ) {
    return Promise.resolve({ options: MOCK_CONVERSION_DISPLAY_TYPE_OPTIONS })
  }
  return request
    .post<{ options: { label: string; value: string }[] }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/meta-conversion-display-type-options`,
      data: {}
    })
    .then((res) => unwrapDataDeep<{ options: { label: string; value: string }[] }>(res))
}

/**
 * 兼容旧导出名：部分页面仍在 import `fetchConversionMetaDisplayTypeOptions`
 * 实际能力为「转化展示分类」下拉选项（paid/activation/behavior/revenue）。
 */
export function fetchConversionMetaDisplayTypeOptions() {
  return fetchConversionMetaConversionDisplayTypeOptions()
}

/** 兼容：有的页面仍需要静态展示「平台转化类型」下拉（若改走接口 08，可替换为 fetchConversionMetaConversionTypeOptions） */
export function getConversionPlatformConversionTypeOptionsForUi() {
  return MOCK_CONVERSION_TYPE_OPTIONS
}

/** 03-mappings-create — POST */
export function fetchConversionMappingsCreate(data: ConversionMappingForm) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsCreate)) {
    return Promise.resolve({ success: true, id: String(Date.now()), message: 'mock' })
  }
  return request
    .post<{ success: boolean; id: string; message?: string }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-create`,
      data
    })
    .then((res) => unwrapDataDeep<{ success: boolean; id: string; message?: string }>(res))
}

/** 04-mappings-update — POST */
export function fetchConversionMappingsUpdate(
  data: { id: string } & Partial<ConversionMappingForm>
) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsUpdate)) {
    return Promise.resolve({ success: true, message: 'mock' })
  }
  return request
    .post<{ success: boolean; message?: string }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-update`,
      data
    })
    .then((res) => unwrapDataDeep<{ success: boolean; message?: string }>(res))
}

/** 05-mappings-delete — POST */
export function fetchConversionMappingsDelete(data: { id: string }) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsDelete)) {
    return Promise.resolve({ success: true, message: 'mock' })
  }
  return request
    .post<{ success: boolean; message?: string }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-delete`,
      data
    })
    .then((res) => unwrapDataDeep<{ success: boolean; message?: string }>(res))
}

/** 06-mappings-batch-update-status — POST */
export function fetchConversionMappingsBatchUpdateStatus(data: Record<string, unknown>) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsBatchUpdateStatus)) {
    return Promise.resolve({ success: true, affectedCount: 0, message: 'mock' })
  }
  return request
    .post<{ success: boolean; affectedCount: number; message?: string }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-batch-update-status`,
      data
    })
    .then((res) =>
      unwrapDataDeep<{ success: boolean; affectedCount: number; message?: string }>(res)
    )
}

/** 07-mappings-export — POST */
export function fetchConversionMappingsExport(
  data: Omit<ConversionFilterParams, 'current' | 'size'> & {
    format?: 'xlsx' | 'csv'
  }
) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsExport)) {
    return Promise.resolve({ downloadUrl: '', message: 'mock' })
  }
  return request
    .post<{ downloadUrl?: string; fileId?: string; message?: string }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-export`,
      data
    })
    .then((res) => unwrapDataDeep<{ downloadUrl?: string; fileId?: string; message?: string }>(res))
}

/** 12-mappings-detail — POST */
export function fetchConversionMappingsDetail(data: { id: string }) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsDetail)) {
    const found = MOCK_CONVERSION_LIST.find((x) => x.id === data.id) ?? null
    return Promise.resolve(found)
  }
  return request
    .post<ConversionMappingItem>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-detail`,
      data
    })
    .then((res) => unwrapDataDeep<ConversionMappingItem>(res))
}

/** data-tab/01-overview-kpi — POST */
export function fetchConversionDataTabOverviewKpi(params: ConversionDataFilterParams) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.DataTabOverviewKpi)) {
    return fetchConversionDataMock(params).then((r) => ({ kpi: r.kpi }))
  }
  return request
    .post<{ kpi: ConversionKpi }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/data-tab/overview-kpi`,
      data: params
    })
    .then((res) => unwrapDataDeep<{ kpi: ConversionKpi }>(res))
}

/** data-tab/02-table-rows — POST */
export function fetchConversionDataTabTableRows(params: ConversionDataFilterParams) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.DataTabTableRows)) {
    return fetchConversionDataMock(params).then((r) => ({ tableRows: r.tableRows }))
  }
  return request
    .post<{ tableRows: ConversionDataRow[] }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/data-tab/table-rows`,
      data: params
    })
    .then((res) => unwrapDataDeep<{ tableRows: ConversionDataRow[] }>(res))
}

/** data-tab/03-side-panels — POST */
export function fetchConversionDataTabSidePanels(params: ConversionDataFilterParams) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.DataTabSidePanels)) {
    return fetchConversionDataMock(params).then((r) => ({ sidePanels: r.sidePanels }))
  }
  return request
    .post<{ sidePanels: ConversionDataSidePanels }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/data-tab/side-panels`,
      data: params
    })
    .then((res) => unwrapDataDeep<{ sidePanels: ConversionDataSidePanels }>(res))
}

/** 11-data-export — POST */
export function fetchConversionDataExport(
  data: ConversionDataFilterParams & { format?: 'xlsx' | 'csv' }
) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.DataExport)) {
    return Promise.resolve({ downloadUrl: '', message: 'mock' })
  }
  return request
    .post<{ downloadUrl?: string; fileId?: string; message?: string }>({
      url: `${CONVERSION_MANAGEMENT_BASE}/data-export`,
      data
    })
    .then((res) => unwrapDataDeep<{ downloadUrl?: string; fileId?: string; message?: string }>(res))
}
