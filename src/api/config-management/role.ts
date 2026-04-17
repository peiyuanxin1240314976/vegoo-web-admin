import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import { RoleEndpoint, isRoleEndpointMock } from '@/views/config-management/role/config/data-source'
import {
  MOCK_ROLE_LIST,
  getMockCheckedRouteNames,
  getMockDatePageOptions,
  getMockDefaultDateScope,
  getMockPageDateScopes,
  getMockPermissionSummary,
  getMockRoleRouteTree,
  getMockRoleUsers,
  type RoleDatePageOption,
  type RoleDateScopeConfig,
  type RolePageDateScope,
  type RolePermissionTreeNode
} from '@/views/config-management/role/mock/data'

const ROLE_BASE = `${ANALYSIS_API_BASE}/config-management/role`

export interface RoleListQuery {
  keyword?: string
}

export interface RoleListResponse {
  items: Api.SystemManage.RoleListItem[]
}

export interface RoleDetailSavePayload {
  roleId?: number
  roleName: string
  roleCode: string
  description: string
  enabled: boolean
}

export interface RoleDetailSaveResponse {
  success: boolean
  roleId: number
  message?: string
}

export interface RolePagePermissionResponse {
  routeTree: RolePermissionTreeNode[]
  checkedRouteNames: string[]
  reservedButtonPermissionCodes: string[]
}

export interface RoleDatePermissionResponse {
  defaultDateScope: RoleDateScopeConfig
  pageDateScopes: RolePageDateScope[]
  pageOptions: RoleDatePageOption[]
}

export interface RolePermissionSummary {
  routeGrantedCount: number
  routeTotalCount: number
  defaultDateScopeText: string
  overridePageCount: number
  allowCustomRange: boolean
  lastUpdatedAt: string
  lastUpdatedBy: string
  highlightedRoutes: string[]
}

export interface RolePermissionSummaryResponse {
  summary: RolePermissionSummary
}

export interface RoleUsersResponse {
  items: ReturnType<typeof getMockRoleUsers>
}

export interface RolePermissionUpdatePayload {
  roleId: number
  routePermissions: {
    routeNames: string[]
  }
  datePermissions: {
    defaultDateScope: RoleDateScopeConfig
    pageDateScopes: RolePageDateScope[]
  }
  buttonPermissions: {
    codes: string[]
  }
}

export interface RolePermissionUpdateResponse {
  success: boolean
  message?: string
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

export function fetchRoleList(params: RoleListQuery = {}) {
  if (isRoleEndpointMock(RoleEndpoint.LIST)) {
    return Promise.resolve(buildMockRoleList(params))
  }

  return request.post<RoleListResponse>({
    url: `${ROLE_BASE}/list`,
    data: params,
    showErrorMessage: false
  })
}

export function fetchRoleDetailSave(data: RoleDetailSavePayload) {
  if (isRoleEndpointMock(RoleEndpoint.DETAIL_SAVE)) {
    return Promise.resolve<RoleDetailSaveResponse>({
      success: true,
      roleId: data.roleId ?? 999,
      message: 'mock save success'
    })
  }

  return request.post<RoleDetailSaveResponse>({
    url: `${ROLE_BASE}/detail/save`,
    data,
    showErrorMessage: false
  })
}

export function fetchRolePermissionPages(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_PAGES)) {
    return Promise.resolve<RolePagePermissionResponse>({
      routeTree: getMockRoleRouteTree(),
      checkedRouteNames: getMockCheckedRouteNames(data.roleId),
      reservedButtonPermissionCodes: []
    })
  }

  return request.post<RolePagePermissionResponse>({
    url: `${ROLE_BASE}/permissions/pages`,
    data,
    showErrorMessage: false
  })
}

export function fetchRolePermissionDate(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_DATE)) {
    return Promise.resolve<RoleDatePermissionResponse>({
      defaultDateScope: getMockDefaultDateScope(data.roleId),
      pageDateScopes: getMockPageDateScopes(data.roleId),
      pageOptions: getMockDatePageOptions()
    })
  }

  return request.post<RoleDatePermissionResponse>({
    url: `${ROLE_BASE}/permissions/date`,
    data,
    showErrorMessage: false
  })
}

export function fetchRolePermissionSummary(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSION_SUMMARY)) {
    return Promise.resolve<RolePermissionSummaryResponse>({
      summary: getMockPermissionSummary(data.roleId)
    })
  }

  return request.post<RolePermissionSummaryResponse>({
    url: `${ROLE_BASE}/permissions/summary`,
    data,
    showErrorMessage: false
  })
}

export function fetchRoleUsers(data: { roleId: number }) {
  if (isRoleEndpointMock(RoleEndpoint.USERS)) {
    return Promise.resolve<RoleUsersResponse>({
      items: getMockRoleUsers(data.roleId)
    })
  }

  return request.post<RoleUsersResponse>({
    url: `${ROLE_BASE}/users`,
    data,
    showErrorMessage: false
  })
}

export function fetchRolePermissionsUpdate(data: RolePermissionUpdatePayload) {
  if (isRoleEndpointMock(RoleEndpoint.PERMISSIONS_UPDATE)) {
    return Promise.resolve<RolePermissionUpdateResponse>({
      success: true,
      message: 'mock save success'
    })
  }

  return request.post<RolePermissionUpdateResponse>({
    url: `${ROLE_BASE}/permissions/update`,
    data,
    showErrorMessage: false
  })
}
