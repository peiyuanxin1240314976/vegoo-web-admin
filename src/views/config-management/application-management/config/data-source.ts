/**
 * 应用管理（`/config-management/application-management`）按接口 Mock / 远程开关。
 *
 * - **`true`**：对应 `fetch*` 走 `mock/application-api-mock.ts`
 * - **`false`**：走 `src/api/config-management.ts` 中的真实 URL
 */

export enum ApplicationEndpoint {
  Table = 'table',
  OverviewStats = 'overview-stats',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Export = 'export'
}

type UseMock = boolean

const ApplicationApiMockDefaults: Record<ApplicationEndpoint, UseMock> = {
  [ApplicationEndpoint.Table]: true,
  [ApplicationEndpoint.OverviewStats]: true,
  [ApplicationEndpoint.Create]: true,
  [ApplicationEndpoint.Update]: true,
  [ApplicationEndpoint.Delete]: true,
  [ApplicationEndpoint.Export]: true
}

export function isApplicationEndpointMock(endpoint: ApplicationEndpoint): boolean {
  return ApplicationApiMockDefaults[endpoint]
}
