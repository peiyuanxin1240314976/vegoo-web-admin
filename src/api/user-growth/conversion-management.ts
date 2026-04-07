/**
 * 用户增长 - 转化管理 API（POST + JSON）
 * 契约来源：views/user-growth/conversion-management/mock/backend-api
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type {
  ConversionDataFilterParams,
  ConversionDataRow,
  ConversionDataSidePanels,
  ConversionFilterParams,
  ConversionKpi,
  ConversionMappingForm,
  ConversionMappingItem,
  ConversionMetaConversionTypeOptionsBody,
  ConversionTypeDistributionItem,
  MappingStats,
  PlatformStats
} from '@/views/user-growth/conversion-management/types'

const CONVERSION_MANAGEMENT_BASE = `${ANALYSIS_API_BASE}/user-growth/conversion-management`

export interface ConversionMappingsStatsResponse {
  typeDistribution: ConversionTypeDistributionItem[]
  mappingStats: MappingStats
  platformStats: PlatformStats
}

export interface ConversionSimpleActionResponse {
  success: boolean
  message?: string
}

export interface ConversionBatchUpdateStatusResponse extends ConversionSimpleActionResponse {
  affectedCount: number
  skippedCount?: number
  skippedReason?: string
  skippedIds?: string[]
}

export interface ConversionExportResponse {
  downloadUrl?: string
  expireAt?: string
}

export interface ConversionMetaDialogOption {
  label: string
  value: string
}

export interface ConversionMetaDialogConversionOption {
  conversionName: string
  conversionId: string
  billingType?: string
  platformConversionType?: string
  extra?: Record<string, unknown>
}

export interface ConversionMetaDialogOptionsResponse {
  adPlatforms: ConversionMetaDialogOption[]
  mccAccounts?: ConversionMetaDialogOption[]
  apps?: ConversionMetaDialogOption[]
  conversions?: ConversionMetaDialogConversionOption[]
}

export interface ConversionMetaDisplayTypeOptionsResponse {
  options: ConversionMetaDialogOption[]
}

export interface ConversionMappingDetailResponse extends ConversionMappingItem {
  source?: string
  adPlatform?: string
  conversionDisplayType?: string
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export interface ConversionCreateResponse extends ConversionSimpleActionResponse {
  id: string
}

/** 01-mappings-list */
export function fetchConversionMappingList(data: ConversionFilterParams) {
  return request.post<Api.Common.PaginatedResponse<ConversionMappingItem>>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-list`,
    data
  })
}

/** 02-mappings-stats */
export function fetchConversionMappingStats(data: ConversionFilterParams) {
  return request.post<ConversionMappingsStatsResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-stats`,
    data
  })
}

/** 03-mappings-create */
export function fetchCreateConversionMapping(data: ConversionMappingForm) {
  return request.post<ConversionCreateResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-create`,
    data
  })
}

/** 04-mappings-update */
export function fetchUpdateConversionMapping(data: {
  id: string
  systemDisplayName: string
  conversionDisplayType?: string
  status?: string
  remarks?: string
}) {
  return request.post<ConversionSimpleActionResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-update`,
    data
  })
}

/** 05-mappings-delete */
export function fetchDeleteConversionMapping(data: { id: string }) {
  return request.post<ConversionSimpleActionResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-delete`,
    data
  })
}

/** 06-mappings-batch-update-status */
export function fetchBatchUpdateConversionMappingStatus(data: {
  mode: 'byFilter' | 'byIds'
  filters?: ConversionFilterParams
  ids?: string[]
  targetStatus: 'enabled' | 'unmapped'
}) {
  return request.post<ConversionBatchUpdateStatusResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-batch-update-status`,
    data
  })
}

/** 07-mappings-export */
export function fetchExportConversionMappings(
  data: ConversionFilterParams & { format?: 'xlsx' | 'csv' }
) {
  return request.post<ConversionExportResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-export`,
    data
  })
}

/** 08-meta-conversion-type-options（页面独有） */
export function fetchConversionMetaConversionTypeOptions() {
  return request.post<ConversionMetaConversionTypeOptionsBody>({
    url: `${CONVERSION_MANAGEMENT_BASE}/meta-conversion-type-options`,
    data: {}
  })
}

/** 09-meta-dialog-options */
export function fetchConversionMetaDialogOptions(data: {
  source?: string
  adPlatform?: string
  mccAccount?: string
  appId?: string
}) {
  return request.post<ConversionMetaDialogOptionsResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/meta-dialog-options`,
    data
  })
}

/** 11-data-export */
export function fetchExportConversionData(
  data: ConversionDataFilterParams & { format?: 'xlsx' | 'csv' }
) {
  return request.post<ConversionExportResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/data-export`,
    data
  })
}

/** 12-mappings-detail */
export function fetchConversionMappingDetail(data: { id: string }) {
  return request.post<ConversionMappingDetailResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/mappings-detail`,
    data
  })
}

/** 13-meta-conversion-display-type-options */
export function fetchConversionMetaDisplayTypeOptions() {
  return request.post<ConversionMetaDisplayTypeOptionsResponse>({
    url: `${CONVERSION_MANAGEMENT_BASE}/meta-conversion-display-type-options`,
    data: {}
  })
}

/** data-tab/01-overview-kpi */
export function fetchConversionDataTabOverviewKpi(data: ConversionDataFilterParams) {
  return request.post<{ kpi: ConversionKpi }>({
    url: `${CONVERSION_MANAGEMENT_BASE}/data-tab/overview-kpi`,
    data
  })
}

/** data-tab/02-table-rows */
export function fetchConversionDataTabTableRows(data: ConversionDataFilterParams) {
  return request.post<{ tableRows: ConversionDataRow[] }>({
    url: `${CONVERSION_MANAGEMENT_BASE}/data-tab/table-rows`,
    data
  })
}

/** data-tab/03-side-panels */
export function fetchConversionDataTabSidePanels(data: ConversionDataFilterParams) {
  return request.post<{ sidePanels: ConversionDataSidePanels }>({
    url: `${CONVERSION_MANAGEMENT_BASE}/data-tab/side-panels`,
    data
  })
}
