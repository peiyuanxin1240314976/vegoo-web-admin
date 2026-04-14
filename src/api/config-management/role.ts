import { request } from '@/utils/http'
import { RoleEndpoint, isRoleEndpointMock } from '@/views/config-management/role/config/data-source'
import {
  MOCK_ROLE_LIST,
  MOCK_PERMISSION_MODULES,
  getMockRoleUsers,
  getMockPermissionSummary
} from '@/views/config-management/role/mock/data'

/**
 * 这里应该引用 types.ts 中的定义，当前为了演示 Mock 对接，
 * 直接使用假数据文件的推导类型或简单 any。
 */

/** 获取角色列表 */
export function fetchRoleList(data: { keyword?: string } = {}) {
  if (isRoleEndpointMock(RoleEndpoint.LIST)) {
    return Promise.resolve({
      code: 200,
      data: { items: MOCK_ROLE_LIST }
    })
  }
  return request.post('/api/config-management/role/list', data)
}

/** 获取角色功能权限 */
export function fetchRolePermissionFunc(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_FUNC)) {
    return Promise.resolve({
      code: 200,
      data: { modules: MOCK_PERMISSION_MODULES }
    })
  }
  return request.post('/api/config-management/role/permissions/func', data)
}

/** 获取角色数据权限 */
export function fetchRolePermissionData(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_DATA)) {
    // 复用一下假数据，实际中应该返回 DataPermissionModule 格式
    return Promise.resolve({
      code: 200,
      data: {
        modules: MOCK_PERMISSION_MODULES.map((m) => ({
          moduleId: m.key,
          moduleName: m.name,
          dataScope: 'all',
          dataScopeText: m.dataScopeText
        }))
      }
    })
  }
  return request.post('/api/config-management/role/permissions/data', data)
}

/** 获取角色右上角权限摘要统计 */
export function fetchRolePermissionSummary(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_SUMMARY)) {
    return Promise.resolve({
      code: 200,
      data: { summary: getMockPermissionSummary(data.roleId) }
    })
  }
  return request.post('/api/config-management/role/permissions/summary', data)
}

/** 获取角色关联用户列表 */
export function fetchRoleUsers(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.USERS)) {
    return Promise.resolve({
      code: 200,
      data: { items: getMockRoleUsers(data.roleId) }
    })
  }
  return request.post('/api/config-management/role/users', data)
}

/** 保存权限配置 */
export function fetchRolePermissionsUpdate(data: {
  roleId: number
  permissionIds: string[]
  moduleDataScopes: any[]
}) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSIONS_UPDATE)) {
    return Promise.resolve({
      code: 200,
      data: { success: true }
    })
  }
  return request.post('/api/config-management/role/permissions-update', data)
}
