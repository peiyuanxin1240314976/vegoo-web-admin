/**
 * 文本管理 - 数据源开关（小模块内 config，与 mock/backend-api 契约 1:1）
 *
 * - `TextManagementEndpoint`：每个接口一个枚举值，改 `TEXT_MANAGEMENT_USE_MOCK` 对应项即可。
 * - `true` = 使用本地 Mock（`views/product-operations/text-management/mocks/text-management-api-mock.ts`）
 * - `false` = 走真实 HTTP
 *
 * 默认全部为 `true`（联调前）；单接口改 `false` 可只接真接口。
 */
export enum TextManagementEndpoint {
  /** 01-store-listing-draft.json */
  StoreListingDraft = 'storeListingDraft',
  /** 02-audit-word-lists.json */
  AuditWordLists = 'auditWordLists',
  /** 03-translate.json */
  Translate = 'translate'
}

/** 是否对该接口使用 Mock（逐项修改） */
export const TEXT_MANAGEMENT_USE_MOCK: Record<TextManagementEndpoint, boolean> = {
  [TextManagementEndpoint.StoreListingDraft]: false,
  [TextManagementEndpoint.AuditWordLists]: false,
  [TextManagementEndpoint.Translate]: false
}

export function isTextManagementEndpointMock(endpoint: TextManagementEndpoint): boolean {
  return TEXT_MANAGEMENT_USE_MOCK[endpoint] === true
}
