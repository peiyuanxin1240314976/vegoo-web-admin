/**
 * 应用商店凭据管理（`/config-management/app-store-management`）数据源开关。
 *
 * 契约目录：`../mock/backend-api/`。
 */

type UseMock = boolean

export enum AppStoreEndpoint {
  ConnectionAnomalies = 'connectionAnomalies'
}

export const AppStoreApiSource: Record<AppStoreEndpoint, UseMock> = {
  [AppStoreEndpoint.ConnectionAnomalies]: true
}

export function isAppStoreEndpointMock(endpoint: AppStoreEndpoint): boolean {
  return AppStoreApiSource[endpoint]
}
