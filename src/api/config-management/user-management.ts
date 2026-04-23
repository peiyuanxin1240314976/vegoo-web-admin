/**
 * 配置管理 · 用户管理 API（与 `views/config-management/user-management` 对齐）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type {
  UserStats,
  SystemUserSearchParams,
  SystemUserListResponse,
  SystemUserMetaOptionsResponse,
  CreateUserPayload,
  UpdateUserPayload,
  PermissionUpdatePayload,
  DisableUserPayload,
  DisableUserResponse,
  SystemUserItem,
  UserAppPermissionsOptionsData,
  SaveUserAppPermissionsPayload
} from '@/views/config-management/user-management/types'
import {
  SystemUserEndpoint,
  isSystemUserEndpointMock
} from '@/views/config-management/user-management/config/data-source'
import * as userManagementMock from '@/views/config-management/user-management/mock/system-user-api-mock'

const USER_MANAGEMENT_BASE = `${ANALYSIS_API_BASE}/config-management/user`

/** 顶部统计卡片 */
export function fetchStats() {
  if (isSystemUserEndpointMock(SystemUserEndpoint.Stats)) {
    return userManagementMock.mockFetchStats()
  }
  return request.post<UserStats>({
    url: `${USER_MANAGEMENT_BASE}/stats`,
    data: {},
    showErrorMessage: false
  })
}

/** 分页用户列表 */
export function fetchUserList(params: SystemUserSearchParams) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.UserList)) {
    return userManagementMock.mockFetchGetUserList(params)
  }
  return request.post<SystemUserListResponse>({
    url: `${USER_MANAGEMENT_BASE}/table`,
    data: params,
    showErrorMessage: false
  })
}

/** 角色/状态筛选项 */
export function fetchMetaOptions(params?: { scene?: string }) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.MetaOptions)) {
    return userManagementMock.mockFetchMetaOptions(params)
  }
  return request.post<SystemUserMetaOptionsResponse>({
    url: `${USER_MANAGEMENT_BASE}/meta-options`,
    data: params,
    showErrorMessage: false
  })
}

/** 新建用户 */
export function createUser(data: CreateUserPayload) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.Create)) {
    return userManagementMock.mockCreateUser(data)
  }
  return request.post<SystemUserItem>({
    url: `${USER_MANAGEMENT_BASE}/create`,
    data,
    showErrorMessage: false
  })
}

/** 编辑用户 */
export function updateUser(data: UpdateUserPayload) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.Update)) {
    return userManagementMock.mockUpdateUser(data)
  }
  return request.put<{ success: boolean; updatedUser: SystemUserItem }>({
    url: `${USER_MANAGEMENT_BASE}/${data.id}`,
    data,
    showErrorMessage: false
  })
}

/** 右侧详情保存 */
export function updatePermission(data: PermissionUpdatePayload) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.PermissionUpdate)) {
    return userManagementMock.mockPermissionUpdate(data)
  }
  return request.post<{ success: boolean; updatedUser: SystemUserItem }>({
    url: `${USER_MANAGEMENT_BASE}/permission-update`,
    data,
    showErrorMessage: false
  })
}

/** 禁用用户 */
export function disableUser(data: DisableUserPayload) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.Disable)) {
    return userManagementMock.mockDisableUser(data)
  }
  return request.post<DisableUserResponse>({
    url: `${USER_MANAGEMENT_BASE}/disable`,
    data,
    showErrorMessage: false
  })
}

/** 应用权限弹窗 · 选项（GET，query userId） */
export function fetchUserAppPermissionsOptions(userId: number) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.AppPermissionsOptions)) {
    return userManagementMock.mockFetchUserAppPermissionsOptions(userId)
  }
  return request.get<UserAppPermissionsOptionsData>({
    url: `${USER_MANAGEMENT_BASE}/app-permissions/options`,
    params: { userId },
    showErrorMessage: true
  })
}

/** 应用权限弹窗 · 保存 */
export function saveUserAppPermissions(data: SaveUserAppPermissionsPayload) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.AppPermissionsSave)) {
    return userManagementMock.mockSaveUserAppPermissions(data)
  }
  return request.post<{ success: boolean }>({
    url: `${USER_MANAGEMENT_BASE}/app-permissions`,
    data,
    showErrorMessage: true
  })
}
