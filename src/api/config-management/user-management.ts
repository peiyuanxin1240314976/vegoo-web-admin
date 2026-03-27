/**
 * 配置管理 · 用户管理 API（与 `views/config-management/user-management` 对齐）
 */
import request from '@/utils/http'
import type {
  UserItem,
  UserFormPayload,
  UserTableQuery
} from '@/views/config-management/user-management/types'
import {
  UserEndpoint,
  isUserEndpointMock
} from '@/views/config-management/user-management/config/data-source'
import * as userMock from '@/views/config-management/user-management/mock/user-api-mock'

/** 分页列表 */
export function fetchUserTable(params: UserTableQuery) {
  if (isUserEndpointMock(UserEndpoint.Table)) {
    return userMock.mockFetchUserTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<UserItem>>({
    url: '/api/config-management/user/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增用户 */
export function createUser(data: UserFormPayload) {
  if (isUserEndpointMock(UserEndpoint.Create)) {
    return userMock.mockCreateUser(data)
  }
  return request.post<UserItem>({
    url: '/api/config-management/user',
    data,
    showErrorMessage: false
  })
}

/** 更新用户 */
export function updateUser(data: UserFormPayload) {
  if (isUserEndpointMock(UserEndpoint.Update)) {
    return userMock.mockUpdateUser(data)
  }
  return request.put<UserItem>({
    url: `/api/config-management/user/${data.id}`,
    data,
    showErrorMessage: false
  })
}

/** 删除用户 */
export function deleteUser(id: string) {
  if (isUserEndpointMock(UserEndpoint.Delete)) {
    return userMock.mockDeleteUser(id)
  }
  return request.del<unknown>({
    url: `/api/config-management/user/${id}`,
    showErrorMessage: false
  })
}

/** 禁用/启用用户 */
export function updateUserStatus(id: string, status: string) {
  if (isUserEndpointMock(UserEndpoint.Status)) {
    return userMock.mockUpdateUserStatus(id, status)
  }
  return request.put<unknown>({
    url: `/api/config-management/user/${id}/status`,
    data: { status },
    showErrorMessage: false
  })
}

/** 重置密码 */
export function resetUserPassword(id: string) {
  if (isUserEndpointMock(UserEndpoint.ResetPassword)) {
    return userMock.mockResetUserPassword(id)
  }
  return request.post<unknown>({
    url: `/api/config-management/user/${id}/reset-password`,
    showErrorMessage: false
  })
}

/** 发送激活邮件 */
export function resendUserActivation(id: string) {
  if (isUserEndpointMock(UserEndpoint.ResendActivation)) {
    return userMock.mockResendUserActivation(id)
  }
  return request.post<unknown>({
    url: `/api/config-management/user/${id}/resend-activation`,
    showErrorMessage: false
  })
}

/** 导出用户（与列表筛选字段对齐；页面可无导出按钮，契约为预留能力） */
export function exportUserList(params: Partial<UserTableQuery>) {
  if (isUserEndpointMock(UserEndpoint.Export)) {
    return userMock.mockExportUserList(params)
  }
  return request.post<{ downloadUrl?: string; fileName?: string }>({
    url: '/api/config-management/user/export',
    data: params,
    showErrorMessage: false
  })
}
