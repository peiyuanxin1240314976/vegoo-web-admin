/**
 * 用户增长 - 转化管理 API
 *
 * 筛选项（应用/广告平台等公用维度）：请使用 `fetchComprehensiveAnalysisFilterOptions`（`./comprehensive-analysis`），勿单独请求已废弃的 `conversion-management/meta-filter-options`。
 * 联调路径与 POST 契约以 `views/user-growth/conversion-management/mock/backend-api/README.md` 为准。
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import { buildAppSelectionRequestBody } from '@/utils/app-id-request'
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
  ConversionMappingItem,
  ConversionSideStats,
  ConversionTypeDistributionItem,
  MappingStats,
  PlatformStats
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

/**
 * 连续解包 `data`，仅当下一层为非 null 的 object 时才继续。
 * 避免业务体上误带 `data: null` 时像 `unwrapDataDeep` 一样整段变成 `null`。
 */
function unwrapNestedDataObjects(value: unknown, maxDepth = 3): unknown {
  let cur: unknown = value
  let depth = 0
  while (
    depth < maxDepth &&
    cur &&
    typeof cur === 'object' &&
    'data' in (cur as Record<string, unknown>)
  ) {
    const next = (cur as Record<string, unknown>).data
    if (next == null || typeof next !== 'object') break
    cur = next
    depth++
  }
  return cur
}

function numOrZero(v: unknown): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0
}

function withRequestAppIds<T extends { appId?: string }>(params: T) {
  const { appId, ...rest } = params
  return {
    ...rest,
    ...buildAppSelectionRequestBody(appId)
  }
}

/**
 * 将 mappings-stats 业务体规范为页面契约：
 * - 兼容契约字段（mapped / duplicate / unmapped、android / ios、name + value + count）
 * - 兼容后端现网：`enabledCount`/`duplicateCount`/`unmappedCount`、`androidCount`/`iosCount`、
 *   分布项 `{ type, count }`（无占比时按各 count 占总数换算百分比）
 */
function normalizeMappingsStatsResponse(raw: unknown): ConversionSideStats {
  const unwrapped = unwrapNestedDataObjects(raw)
  const r = unwrapped && typeof unwrapped === 'object' ? (unwrapped as Record<string, unknown>) : {}

  const tdRaw = r.typeDistribution ?? r.type_distribution
  const typeRows: { name: string; count: number; valuePct: number | null }[] = Array.isArray(tdRaw)
    ? tdRaw.map((item) => {
        if (!item || typeof item !== 'object') return { name: '', count: 0, valuePct: null }
        const it = item as Record<string, unknown>
        const label =
          typeof it.name === 'string'
            ? it.name
            : typeof it.type === 'string'
              ? it.type
              : String(it.name ?? it.type ?? '')
        const count = numOrZero(it.count)
        const pctRaw = it.value
        const hasExplicitPct = typeof pctRaw === 'number' && !Number.isNaN(pctRaw)
        return {
          name: label.trim() || '—',
          count,
          valuePct: hasExplicitPct ? numOrZero(pctRaw) : null
        }
      })
    : []

  const sumCount = typeRows.reduce((s, row) => s + row.count, 0)
  const typeDistribution: ConversionTypeDistributionItem[] = typeRows.map((row) => {
    let value: number
    if (row.valuePct != null) {
      value = row.valuePct
    } else if (sumCount > 0) {
      value = Math.round((row.count / sumCount) * 10000) / 100
    } else {
      value = 0
    }
    return { name: row.name, value, count: row.count }
  })

  const msRaw = r.mappingStats ?? r.mapping_stats
  const mappingStats: MappingStats = (() => {
    if (!msRaw || typeof msRaw !== 'object') {
      return { mapped: 0, duplicate: 0, unmapped: 0 }
    }
    const m = msRaw as Record<string, unknown>
    const pick = (primary: string, ...fallbacks: string[]): number => {
      const keys = [primary, ...fallbacks]
      for (const k of keys) {
        const v = m[k]
        if (typeof v === 'number' && !Number.isNaN(v)) return v
      }
      return 0
    }
    return {
      mapped: pick('mapped', 'enabledCount', 'enabled'),
      duplicate: pick('duplicate', 'duplicateCount'),
      unmapped: pick('unmapped', 'unmappedCount')
    }
  })()

  const psRaw = r.platformStats ?? r.platform_stats
  const platformStats: PlatformStats = (() => {
    if (!psRaw || typeof psRaw !== 'object') {
      return { android: 0, ios: 0 }
    }
    const p = psRaw as Record<string, unknown>
    const pick = (primary: string, alt: string) => {
      const a = p[primary]
      const b = p[alt]
      if (typeof a === 'number' && !Number.isNaN(a)) return a
      if (typeof b === 'number' && !Number.isNaN(b)) return b
      return 0
    }
    return {
      android: pick('android', 'androidCount'),
      ios: pick('ios', 'iosCount')
    }
  })()

  return { typeDistribution, mappingStats, platformStats }
}

/** 01-mappings-list — POST */
export function fetchConversionMappingsList(params: ConversionFilterParams) {
  if (isConversionManagementEndpointMock(ConversionManagementEndpoint.MappingsList)) {
    return fetchConversionMappingListMock(params)
  }
  return request
    .post<Api.Common.PaginatedResponse<ConversionMappingItem>>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-list`,
      data: withRequestAppIds(params)
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
    .post<unknown>({
      url: `${CONVERSION_MANAGEMENT_BASE}/mappings-stats`,
      data: withRequestAppIds(params)
    })
    .then((res) => normalizeMappingsStatsResponse(res))
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
  /** 终端平台，与 meta-filter `platform` 一致 */
  platform?: string
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
      data: withRequestAppIds(data)
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
      data: withRequestAppIds(params)
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
      data: withRequestAppIds(params)
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
      data: withRequestAppIds(params)
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
      data: withRequestAppIds(data)
    })
    .then((res) => unwrapDataDeep<{ downloadUrl?: string; fileId?: string; message?: string }>(res))
}
