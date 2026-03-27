/**
 * 用户管理（`/config-management/user-management`）按接口 Mock / 远程开关。
 *
 * - **`true`**：对应 `fetch*` 走 `mock/user-api-mock.ts`
 * - **`false`**：走 `src/api/config-management.ts` 中的真实 URL
 *
 * 读取方：仅 `config-management.ts` 用户段；页面通过 `@/api/config-management` 调用即可。
 * 含：`table` / `create` / `update` / `delete` / `status` / `resetPassword` / `resendActivation` / **`export`**。
 */

export enum UserEndpoint {
  Table = 'table',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Status = 'status',
  ResetPassword = 'resetPassword',
  ResendActivation = 'resendActivation',
  Export = 'export'
}

type UseMock = boolean

const UserApiMockDefaults: Record<UserEndpoint, UseMock> = {
  [UserEndpoint.Table]: true,
  [UserEndpoint.Create]: true,
  [UserEndpoint.Update]: true,
  [UserEndpoint.Delete]: true,
  [UserEndpoint.Status]: true,
  [UserEndpoint.ResetPassword]: true,
  [UserEndpoint.ResendActivation]: true,
  [UserEndpoint.Export]: true
}

export function isUserEndpointMock(endpoint: UserEndpoint): boolean {
  return UserApiMockDefaults[endpoint]
}
