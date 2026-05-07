/**
 * 转化管理（`/user-growth/conversion-management`）— 数据源开关（mock / remote），与 backend-api 契约 1:1。
 *
 * - `true`：走本地 Mock（`views/user-growth/conversion-management/mock/*`）
 * - `false`：`src/api/user-growth/conversion-management.ts` 使用 `request.post` 访问数据中心分析网关
 *
 * 不修改契约 JSON 的前提下，页面通过 `isConversionManagementEndpointMock()` 决定数据源。
 */

export enum ConversionManagementEndpoint {
  /** 01-mappings-list */
  MappingsList = 'mappingsList',
  /** 02-mappings-stats */
  MappingsStats = 'mappingsStats',
  /** 08-meta-conversion-type-options */
  MetaConversionTypeOptions = 'metaConversionTypeOptions',
  /** 09-meta-dialog-options */
  MetaDialogOptions = 'metaDialogOptions',
  /** 12-mappings-detail */
  MappingsDetail = 'mappingsDetail',

  /** 03-mappings-create */
  MappingsCreate = 'mappingsCreate',
  /** 04-mappings-update */
  MappingsUpdate = 'mappingsUpdate',
  /** 05-mappings-delete */
  MappingsDelete = 'mappingsDelete',
  /** 06-mappings-batch-update-status */
  MappingsBatchUpdateStatus = 'mappingsBatchUpdateStatus',
  /** 07-mappings-export */
  MappingsExport = 'mappingsExport',

  /** data-tab/01-overview-kpi */
  DataTabOverviewKpi = 'dataTabOverviewKpi',
  /** data-tab/02-table-rows */
  DataTabTableRows = 'dataTabTableRows',
  /** data-tab/03-side-panels */
  DataTabSidePanels = 'dataTabSidePanels',

  /** 11-data-export */
  DataExport = 'dataExport',
  /** 13-meta-conversion-display-type-options */
  MetaConversionDisplayTypeOptions = 'metaConversionDisplayTypeOptions'
}

export const CONVERSION_MANAGEMENT_USE_MOCK: Record<ConversionManagementEndpoint, boolean> = {
  [ConversionManagementEndpoint.MappingsList]: false,
  [ConversionManagementEndpoint.MappingsStats]: false,
  [ConversionManagementEndpoint.MetaConversionTypeOptions]: false,
  [ConversionManagementEndpoint.MetaDialogOptions]: false,
  [ConversionManagementEndpoint.MappingsDetail]: false,

  [ConversionManagementEndpoint.MappingsCreate]: false,
  [ConversionManagementEndpoint.MappingsUpdate]: false,
  [ConversionManagementEndpoint.MappingsDelete]: false,
  [ConversionManagementEndpoint.MappingsBatchUpdateStatus]: false,
  [ConversionManagementEndpoint.MappingsExport]: false,

  [ConversionManagementEndpoint.DataTabOverviewKpi]: false,
  [ConversionManagementEndpoint.DataTabTableRows]: false,
  [ConversionManagementEndpoint.DataTabSidePanels]: false,

  [ConversionManagementEndpoint.DataExport]: false,
  [ConversionManagementEndpoint.MetaConversionDisplayTypeOptions]: false
}

export function isConversionManagementEndpointMock(
  endpoint: ConversionManagementEndpoint
): boolean {
  return CONVERSION_MANAGEMENT_USE_MOCK[endpoint]
}
