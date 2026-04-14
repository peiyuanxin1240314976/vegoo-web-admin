/**
 * 角色管理 (Role) - 数据源开关配置
 *
 * 遵循 .cursor/rules/module-api-mock-config.mdc 规范：
 * 每个契约接口 / 每个 `fetch*` 对应一项开关，便于单独切 Mock 或远程。
 * 如果有多个模块需要拆分成多个 JSON 接口，则每个接口必须配备单独的 mock 开关。
 * 注意：在具有多个子模块或 Tab 切换的页面中，需要特别注意子模块下面的切换逻辑不要漏掉对应的 mock 开关控制。
 */

export enum RoleEndpoint {
  /** 获取角色列表 */
  LIST = 'list',
  /** 获取指定角色功能权限 (对应 02-permission-func.json) */
  PERMISSION_FUNC = 'permissionFunc',
  /** 获取指定角色数据权限 (对应 03-permission-data.json) */
  PERMISSION_DATA = 'permissionData',
  /** 获取指定角色右上角权限摘要统计 (对应 04-permission-summary.json) */
  PERMISSION_SUMMARY = 'permissionSummary',
  /** 获取指定角色的用户列表 (对应 05-role-users.json) */
  USERS = 'users',
  /** 保存指定角色权限配置 (对应 06-role-permissions-update.json) */
  PERMISSIONS_UPDATE = 'permissionsUpdate'
}

/**
 * 角色管理各接口的 mock 开关字典
 * 值为 true 表示走本地 mock 数据，false 表示走远程真实接口
 */
export const RoleMockConfig: Record<RoleEndpoint, boolean> = {
  [RoleEndpoint.LIST]: true,
  [RoleEndpoint.PERMISSION_FUNC]: true,
  [RoleEndpoint.PERMISSION_DATA]: true,
  [RoleEndpoint.PERMISSION_SUMMARY]: true,
  [RoleEndpoint.USERS]: true,
  [RoleEndpoint.PERMISSIONS_UPDATE]: true
}

/**
 * 获取当前接口是否开启 Mock 的辅助函数
 * 若需支持开发机临时覆盖 (localStorage)，可在此处扩展读取逻辑
 */
export function isRoleEndpointMock(endpoint: RoleEndpoint): boolean {
  // 预留扩展：可读取 localStorage 覆盖默认值
  // const localOverride = localStorage.getItem(`mock_override_role_${endpoint}`)
  // if (localOverride !== null) return localOverride === 'true'

  return RoleMockConfig[endpoint]
}
