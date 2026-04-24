/**
 * 配置管理 · 用户管理 — 类型定义
 * 与 `mock/backend-api/*.json` 契约一一对应。
 */

/** 顶部统计卡片 */
export interface UserStats {
  total: number
  active: number
  disabled: number
  pending: number
}

/** 用户列表项 */
export interface SystemUserItem {
  id: number
  avatar: string
  status: string
  userName: string
  nickName: string
  userGender: string
  userPhone: string
  userEmail: string
  userRoles: string[]
  accessibleApps?: string[]
  remark?: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

/** 分页用户列表查询参数 */
export interface SystemUserSearchParams {
  current: number
  size: number
  userName?: string
  status?: string
  /** 角色主键（来自 RoleListItem.roleId）；空值表示不过滤 */
  role?: number | ''
  userGender?: string
  userPhone?: string
  userEmail?: string
  id?: number
}

/** 分页用户列表响应 */
export interface SystemUserListResponse {
  records: SystemUserItem[]
  current: number
  size: number
  total: number
}

/** 角色选项项 */
export interface RoleOptionItem {
  label: string
  value: string
}

/** 状态选项项 */
export interface StatusOptionItem {
  label: string
  value: string
}

/** meta-options 响应 */
export interface SystemUserMetaOptionsResponse {
  roleOptions: RoleOptionItem[]
  statusOptions: StatusOptionItem[]
}

/** 新建用户请求体 */
export interface CreateUserPayload {
  userName: string
  userPhone: string
  userGender: string
  /** 角色主键数组（字段名 userRoles；元素为 RoleListItem.roleId） */
  userRoles: number[]
  userEmail?: string
  nickName?: string
  accessibleApps?: string[]
  remark?: string
}

/** 更新用户请求体 */
export interface UpdateUserPayload {
  id: number
  userName: string
  userPhone: string
  userGender: string
  /** 角色主键数组（字段名 userRoles；元素为 RoleListItem.roleId） */
  userRoles: number[]
  userEmail?: string
  nickName?: string
  accessibleApps?: string[]
  remark?: string
}

/** 右侧详情保存请求体 */
export interface PermissionUpdatePayload {
  id: number
  /** 单选角色主键（RoleListItem.roleId）；空值表示不修改 */
  roleId: number | ''
  /** 可访问应用列表，空数组表示回收全部应用权限 */
  accessibleApps: string[]
  remark?: string
}

/** 禁用用户请求体 */
export interface DisableUserPayload {
  id: number
  reason?: string
  operator: string
}

/** 禁用用户响应 */
export interface DisableUserResponse {
  success: boolean
  id: number
  status: string
  updateTime: string
}

/** 应用权限 · 单条应用（options 中 apps 元素） */
export interface UserAppPermissionAppItem {
  appId: string
  appName: string
  appUuid: string
  permitted: boolean
  platform: number
  status: number
}

/** GET app-permissions/options 解包后的 data */
export interface UserAppPermissionsOptionsData {
  apps: UserAppPermissionAppItem[]
  mode: string
  userId: number
}

/** POST app-permissions 请求体 */
export interface SaveUserAppPermissionsPayload {
  userId: number
  allowedAppUuids: string[]
}
