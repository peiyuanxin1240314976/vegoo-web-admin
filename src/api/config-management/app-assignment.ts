/**
 * 配置管理 · 应用分配 API（与 `views/config-management/app-assignment` 对齐）
 */
import request from '@/utils/http'
import type {
  AppAssignmentExportResponse,
  AppAssignmentItem,
  AppAssignmentMetaAssignableAppsResponse,
  AppAssignmentMetaFilterResponse,
  AppAssignmentMetaVersionsResponse,
  AppAssignmentOverviewResponse,
  AssignmentCreatePayload,
  AssignmentTableQuery,
  AssignmentUpdatePayload
} from '@/views/config-management/app-assignment/types'
import {
  AppAssignmentEndpoint,
  isAppAssignmentEndpointMock
} from '@/views/config-management/app-assignment/config/data-source'
import * as appAssignmentMock from '@/views/config-management/app-assignment/mock/app-assignment-api-mock'

/** 页头 KPI */
export function fetchAppAssignmentOverview() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Overview)) {
    return appAssignmentMock.mockFetchAppAssignmentOverview()
  }
  return request.post<AppAssignmentOverviewResponse>({
    url: '/api/config-management/app-assignment/overview',
    data: {},
    showErrorMessage: false
  })
}

/** 筛选栏下拉 */
export function fetchAppAssignmentMetaFilterOptions() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaFilterOptions)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaFilterOptions()
  }
  return request.post<AppAssignmentMetaFilterResponse>({
    url: '/api/config-management/app-assignment/meta-filter-options',
    data: {},
    showErrorMessage: false
  })
}

/** 新建可选应用 */
export function fetchAppAssignmentMetaAssignableApps() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaAssignableApps)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaAssignableApps()
  }
  return request.post<AppAssignmentMetaAssignableAppsResponse>({
    url: '/api/config-management/app-assignment/meta-assignable-apps',
    data: {},
    showErrorMessage: false
  })
}

/** 按应用拉取绩效版本 */
export function fetchAppAssignmentMetaPerformanceVersions(body: { appId: string }) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaPerformanceVersions)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaPerformanceVersions(body)
  }
  return request.post<AppAssignmentMetaVersionsResponse>({
    url: '/api/config-management/app-assignment/meta-performance-versions',
    data: body,
    showErrorMessage: false
  })
}

/** 分页列表 */
export function fetchAppAssignmentTable(params: AssignmentTableQuery) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Table)) {
    return appAssignmentMock.mockFetchAppAssignmentTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<AppAssignmentItem>>({
    url: '/api/config-management/app-assignment/table',
    data: params,
    showErrorMessage: false
  })
}

/** 单条详情 */
export function fetchAppAssignmentDetail(body: { id: string }) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Detail)) {
    return appAssignmentMock.mockFetchAppAssignmentDetail(body)
  }
  return request.post<AppAssignmentItem | null>({
    url: '/api/config-management/app-assignment/detail',
    data: body,
    showErrorMessage: false
  })
}

/** 新建分配 */
export function createAppAssignment(data: AssignmentCreatePayload) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Create)) {
    return appAssignmentMock.mockCreateAppAssignment(data)
  }
  return request.post<AppAssignmentItem>({
    url: '/api/config-management/app-assignment',
    data,
    showErrorMessage: false
  })
}

/** 更新分配 */
export function updateAppAssignment(data: AssignmentUpdatePayload) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Update)) {
    return appAssignmentMock.mockUpdateAppAssignment(data)
  }
  return request.post<AppAssignmentItem>({
    url: '/api/config-management/app-assignment/update',
    data,
    showErrorMessage: false
  })
}

/** 导出 */
export function exportAppAssignmentList(params: Partial<AssignmentTableQuery>) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Export)) {
    return appAssignmentMock.mockExportAppAssignmentList(params)
  }
  return request.post<AppAssignmentExportResponse>({
    url: '/api/config-management/app-assignment/export',
    data: params,
    showErrorMessage: false
  })
}
