/**
 * 配置管理 · 应用管理 API（与 `views/config-management/application-management` 对齐）
 */
import request from '@/utils/http'
import type {
  ApplicationAppItem,
  ApplicationFormPayload,
  ApplicationOverviewStats,
  ApplicationOverviewStatsQuery,
  ApplicationTableQuery
} from '@/views/config-management/application-management/types'
import {
  ApplicationEndpoint,
  isApplicationEndpointMock
} from '@/views/config-management/application-management/config/data-source'
import * as applicationMock from '@/views/config-management/application-management/mock/application-api-mock'

/** 分页列表 */
export function fetchApplicationTable(params: ApplicationTableQuery) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Table)) {
    return applicationMock.mockFetchApplicationTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<ApplicationAppItem>>({
    url: '/api/config-management/application/table',
    data: params,
    showErrorMessage: false
  })
}

/** 顶部统计卡片（与列表契约分离） */
export function fetchApplicationOverviewStats(params: ApplicationOverviewStatsQuery) {
  if (isApplicationEndpointMock(ApplicationEndpoint.OverviewStats)) {
    return applicationMock.mockFetchApplicationOverviewStats(params)
  }
  return request.post<ApplicationOverviewStats>({
    url: '/api/config-management/application/overview-stats',
    data: params,
    showErrorMessage: false
  })
}

/** 新增应用 */
export function createApplication(data: ApplicationFormPayload) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Create)) {
    return applicationMock.mockCreateApplication(data)
  }
  return request.post<ApplicationAppItem>({
    url: '/api/config-management/application',
    data,
    showErrorMessage: false
  })
}

/** 更新应用 */
export function updateApplication(data: ApplicationFormPayload) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Update)) {
    return applicationMock.mockUpdateApplication(data)
  }
  return request.put<ApplicationAppItem>({
    url: `/api/config-management/application/${data.id}`,
    data,
    showErrorMessage: false
  })
}

/** 删除应用 */
export function deleteApplication(id: string) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Delete)) {
    return applicationMock.mockDeleteApplication(id)
  }
  return request.del<unknown>({
    url: `/api/config-management/application/${id}`,
    showErrorMessage: false
  })
}

/** 导出（联调时若返回文件流需在 http 层单独处理 responseType） */
export function exportApplicationList(params: Partial<ApplicationTableQuery>) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Export)) {
    return applicationMock.mockExportApplicationList(params)
  }
  return request.post<unknown>({
    url: '/api/config-management/application/export',
    data: params,
    showErrorMessage: false
  })
}
