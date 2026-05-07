/**
 * 三方商店管理 - 數據源開關（小模塊內 config，與 mock/backend-api 契約 1:1）
 *
 * - `true` = 使用本地 Mock（`mocks/third-party-stores-mock.ts`）
 * - `false` = 走真實 HTTP
 */
export enum ThirdPartyStoresEndpoint {
  /** 01-overview-dashboard.json */
  OverviewDashboard = 'overview-dashboard',
  /** 06-filter-options.json */
  FilterOptions = 'filter-options',
  /** 02-platform-detail.json */
  PlatformDetail = 'platform-detail',
  /** 03-platform-create.json */
  PlatformCreate = 'platform-create',
  /** 04-platform-auth-fix.json */
  PlatformAuthFix = 'platform-auth-fix',
  /** 05-export-dashboard.json */
  ExportDashboard = 'export-dashboard'
}

export const THIRD_PARTY_STORES_USE_MOCK: Record<ThirdPartyStoresEndpoint, boolean> = {
  [ThirdPartyStoresEndpoint.OverviewDashboard]: false,
  [ThirdPartyStoresEndpoint.FilterOptions]: false,
  [ThirdPartyStoresEndpoint.PlatformDetail]: false,
  [ThirdPartyStoresEndpoint.PlatformCreate]: false,
  [ThirdPartyStoresEndpoint.PlatformAuthFix]: false,
  [ThirdPartyStoresEndpoint.ExportDashboard]: false
}

export function isThirdPartyStoresEndpointMock(endpoint: ThirdPartyStoresEndpoint): boolean {
  return THIRD_PARTY_STORES_USE_MOCK[endpoint] === true
}
