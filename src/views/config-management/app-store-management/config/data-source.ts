/**
 * 应用商店凭据管理（`/config-management/app-store-management`）数据源开关。
 *
 * 契约目录：`../mock/backend-api/`。
 */

type UseMock = boolean

export enum AppStoreEndpoint {
  CredentialTable = 'credentialTable',
  OverviewStats = 'overviewStats',
  CredentialCreate = 'credentialCreate',
  CredentialUpdate = 'credentialUpdate',
  TestConnection = 'testConnection',
  BatchTestConnection = 'batchTestConnection',
  RetryConnection = 'retryConnection',
  CredentialDetail = 'credentialDetail',
  CredentialExport = 'credentialExport',
  ConnectionAnomalies = 'connectionAnomalies'
}

export const AppStoreApiSource: Record<AppStoreEndpoint, UseMock> = {
  [AppStoreEndpoint.CredentialTable]: false,
  [AppStoreEndpoint.OverviewStats]: false,
  [AppStoreEndpoint.CredentialCreate]: false,
  [AppStoreEndpoint.CredentialUpdate]: false,
  [AppStoreEndpoint.TestConnection]: false,
  [AppStoreEndpoint.BatchTestConnection]: false,
  [AppStoreEndpoint.RetryConnection]: false,
  [AppStoreEndpoint.CredentialDetail]: false,
  [AppStoreEndpoint.CredentialExport]: false,
  [AppStoreEndpoint.ConnectionAnomalies]: false
}

export function isAppStoreEndpointMock(endpoint: AppStoreEndpoint): boolean {
  return AppStoreApiSource[endpoint]
}
