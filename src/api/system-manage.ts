import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'
import {
  SystemUserEndpoint,
  isSystemUserEndpointMock
} from '@/views/config-management/user-management/config/data-source'
import { mockFetchGetUserList } from '@/views/config-management/user-management/mock/system-user-api-mock'
import type { SystemUserSearchParams } from '@/views/config-management/user-management/types'

/**
 * 用户管理 - 分页列表
 * @param params 查询条件见 `Api.SystemManage.UserSearchParams`（含 current、size、userName、status、role 等）
 * Mock / 远程由 `views/config-management/user-management/config/data-source` 切换。
 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  if (isSystemUserEndpointMock(SystemUserEndpoint.UserList)) {
    const mockParams: SystemUserSearchParams = {
      current: params.current ?? 1,
      size: params.size ?? 10,
      userName: params.userName,
      status: params.status,
      role: params.role,
      userGender: params.userGender,
      userPhone: params.userPhone,
      userEmail: params.userEmail,
      id: params.id
    }
    return mockFetchGetUserList(mockParams)
  }
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus/simple'
  })
}
