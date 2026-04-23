/**
 * 平台管理 · 用户管理（`/config-management/user-management`）按接口 Mock / 远程开关。
 *
 * - **`true`**：`fetch*` 走 `mock/system-user-api-mock.ts`
 * - **`false`**：走真实网关接口（`/api/config-management/user/*`）
 *
 * 与 `mock/backend-api/*.json` 一一对应。
 */

export enum SystemUserEndpoint {
  /** 00-user-stats：顶部统计卡片 */
  Stats = 'stats',
  /** 01-user-list：分页用户列表 */
  UserList = 'userList',
  /** 02-user-meta-options：角色/状态筛选项 */
  MetaOptions = 'metaOptions',
  /** 03-user-create：新建用户 */
  Create = 'create',
  /** 04-user-update：编辑用户 */
  Update = 'update',
  /** 05-user-permission-update：右侧详情保存 */
  PermissionUpdate = 'permissionUpdate',
  /** 06-user-disable：禁用用户 */
  Disable = 'disable',
  /** 07-user-app-permissions-options：应用权限弹窗选项 */
  AppPermissionsOptions = 'appPermissionsOptions',
  /** 08-user-app-permissions-save：应用权限弹窗保存 */
  AppPermissionsSave = 'appPermissionsSave'
}

const SystemUserApiMockDefaults: Record<SystemUserEndpoint, boolean> = {
  [SystemUserEndpoint.Stats]: false,
  [SystemUserEndpoint.UserList]: false,
  [SystemUserEndpoint.MetaOptions]: false,
  [SystemUserEndpoint.Create]: false,
  [SystemUserEndpoint.Update]: false,
  [SystemUserEndpoint.PermissionUpdate]: false,
  [SystemUserEndpoint.Disable]: false,
  [SystemUserEndpoint.AppPermissionsOptions]: false,
  [SystemUserEndpoint.AppPermissionsSave]: false
}

export function isSystemUserEndpointMock(endpoint: SystemUserEndpoint): boolean {
  return SystemUserApiMockDefaults[endpoint] === true
}
