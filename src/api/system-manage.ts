import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

/**
 * 用户管理 - 分页列表
 * @param params 查询条件见 `Api.SystemManage.UserSearchParams`（含 current、size、userName、status、role 等）
 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
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
