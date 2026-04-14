import request from '@/utils/http'
import { RoleEndpoint, isRoleEndpointMock } from '@/views/config-management/role/config/data-source'
import {
  MOCK_PERMISSION_MODULES,
  MOCK_ROLE_LIST,
  getMockPermissionSummary,
  getMockRoleUsers
} from '@/views/config-management/role/mock/data'

export interface RoleListQuery {
  keyword?: string
}

export interface RoleListResponse {
  items: Api.SystemManage.RoleListItem[]
}

export interface RolePermissionItem {
  permissionId: string
  permissionName: string
  type: 'view' | 'operation'
  checked: boolean
  statusText: string
}

export interface RoleFuncPermissionModule {
  moduleId: string
  moduleName: string
  enabled: boolean
  permissions: RolePermissionItem[]
}

export interface RoleFuncPermissionResponse {
  modules: RoleFuncPermissionModule[]
}

export interface RoleDataPermissionModule {
  moduleId: string
  moduleName: string
  dataScope: string
  dataScopeText: string
}

export interface RoleDataPermissionResponse {
  modules: RoleDataPermissionModule[]
}

export interface RolePermissionSummary {
  funcEnabled: number
  funcTotal: number
  dataScope: string
  percent: number
  rolePercentList: Array<{
    roleId: number
    roleName: string
    percent: number
    isCurrent?: boolean
  }>
}

export interface RolePermissionSummaryResponse {
  summary: RolePermissionSummary
}

export interface RoleUsersResponse {
  items: ReturnType<typeof getMockRoleUsers>
}

export interface RolePermissionUpdatePayload {
  roleId: number
  permissionIds: string[]
  moduleDataScopes: Array<{
    moduleId: string
    dataScope: string
  }>
}

export interface RolePermissionUpdateResponse {
  success: boolean
}

function buildMockRoleList(params: RoleListQuery = {}): RoleListResponse {
  const keyword = params.keyword?.trim()
  if (!keyword) {
    return { items: MOCK_ROLE_LIST as Api.SystemManage.RoleListItem[] }
  }

  return {
    items: MOCK_ROLE_LIST.filter(
      (item) => item.roleName.includes(keyword) || item.roleCode.includes(keyword)
    ) as Api.SystemManage.RoleListItem[]
  }
}

function buildMockFuncPermissions(): RoleFuncPermissionResponse {
  return {
    modules: MOCK_PERMISSION_MODULES.map((module) => ({
      moduleId: module.key,
      moduleName: module.name,
      enabled: module.enabled,
      permissions: module.permissions.flatMap((permission) => {
        const result: RolePermissionItem[] = []

        if (permission.view && permission.view !== '—') {
          result.push({
            permissionId: `${module.key}:${permission.key}:view`,
            permissionName: permission.name,
            type: 'view',
            checked: permission.view !== '×禁止',
            statusText: permission.view
          })
        }

        if (permission.operation && permission.operation !== '—') {
          result.push({
            permissionId: `${module.key}:${permission.key}:operation`,
            permissionName: permission.name,
            type: 'operation',
            checked: permission.operation !== '×禁止',
            statusText: permission.operation
          })
        }

        return result
      })
    }))
  }
}

function buildMockDataPermissions(): RoleDataPermissionResponse {
  return {
    modules: MOCK_PERMISSION_MODULES.map((module) => ({
      moduleId: module.key,
      moduleName: module.name,
      dataScope: module.enabled ? 'all' : 'none',
      dataScopeText: module.dataScopeText
    }))
  }
}

/** 获取角色列表 */
export function fetchRoleList(params: RoleListQuery = {}) {
  if (isRoleEndpointMock(RoleEndpoint.LIST)) {
    return Promise.resolve(buildMockRoleList(params))
  }

  return request.post<RoleListResponse>({
    url: '/api/config-management/role/list',
    data: params,
    showErrorMessage: false
  })
}

/** 获取角色功能权限 */
export function fetchRolePermissionFunc(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_FUNC)) {
    return Promise.resolve(buildMockFuncPermissions())
  }

  return request.post<RoleFuncPermissionResponse>({
    url: '/api/config-management/role/permissions/func',
    data,
    showErrorMessage: false
  })
}

/** 获取角色数据权限 */
export function fetchRolePermissionData(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_DATA)) {
    return Promise.resolve(buildMockDataPermissions())
  }

  return request.post<RoleDataPermissionResponse>({
    url: '/api/config-management/role/permissions/data',
    data,
    showErrorMessage: false
  })
}

/** 获取角色右上角权限摘要统计 */
export function fetchRolePermissionSummary(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_SUMMARY)) {
    return Promise.resolve({
      summary: getMockPermissionSummary(data.roleId)
    })
  }

  return request.post<RolePermissionSummaryResponse>({
    url: '/api/config-management/role/permissions/summary',
    data,
    showErrorMessage: false
  })
}

/** 获取角色关联用户列表 */
export function fetchRoleUsers(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.USERS)) {
    return Promise.resolve({
      items: getMockRoleUsers(data.roleId)
    })
  }

  return request.post<RoleUsersResponse>({
    url: '/api/config-management/role/users',
    data,
    showErrorMessage: false
  })
}

/** 保存权限配置 */
export function fetchRolePermissionsUpdate(data: RolePermissionUpdatePayload) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSIONS_UPDATE)) {
    return Promise.resolve({
      success: true
    })
  }

  return request.post<RolePermissionUpdateResponse>({
    url: '/api/config-management/role/permissions-update',
    data,
    showErrorMessage: false
  })
}
