/**
 * 平台管理 · 用户管理（`/config-management/user-management`）按接口 Mock / 远程开关。
 *
 * - **`true`**：`fetchGetUserList` 走 `mock/system-user-api-mock.ts`
 * - **`false`**：走 `GET /api/user/list`（`src/api/system-manage.ts`）
 *
 * 与 `mock/backend-api/01-user-list.json` 一一对应。
 */

export enum SystemUserEndpoint {
  /** 01-user-list：分页列表 */
  UserList = 'userList'
}

const SystemUserApiMockDefaults: Record<SystemUserEndpoint, boolean> = {
  [SystemUserEndpoint.UserList]: true
}

export function isSystemUserEndpointMock(endpoint: SystemUserEndpoint): boolean {
  return SystemUserApiMockDefaults[endpoint] === true
}
