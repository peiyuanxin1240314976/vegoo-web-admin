/**
 * 配置管理 · 优化师管理 API（与 `views/config-management/optimizer-management` 对齐）
 */
import request from '@/utils/http'
import {
  OptimizerEndpoint,
  isOptimizerEndpointMock
} from '@/views/config-management/optimizer-management/config/data-source'
import * as optimizerMock from '@/views/config-management/optimizer-management/mock/optimizer-api-mock'

/** 分页列表（筛选与分页由服务端处理） */
export function fetchOptimizerTable(params: Api.ConfigManagement.Optimizer.TableQuery) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Table)) {
    return optimizerMock.mockFetchOptimizerTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<Api.ConfigManagement.Optimizer.ListItem>>({
    url: '/api/config-management/optimizer/table',
    data: params,
    showErrorMessage: false
  })
}

/** 页头 KPI 卡片 */
export function fetchOptimizerOverview() {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Overview)) {
    return optimizerMock.mockFetchOptimizerOverview()
  }
  return request.post<Api.ConfigManagement.Optimizer.OverviewResponse>({
    url: '/api/config-management/optimizer/overview',
    data: {},
    showErrorMessage: false
  })
}

/** 新建弹窗：可选系统用户列表 */
export function fetchOptimizerMetaSystemUsers() {
  if (isOptimizerEndpointMock(OptimizerEndpoint.MetaSystemUsers)) {
    return optimizerMock.mockFetchOptimizerMetaSystemUsers()
  }
  return request.post<Api.ConfigManagement.Optimizer.MetaSystemUserItem[]>({
    url: '/api/config-management/optimizer/meta-system-users',
    data: {},
    showErrorMessage: false
  })
}

/** 新增优化师 */
export function createOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Create)) {
    return optimizerMock.mockCreateOptimizer(data)
  }
  return request.post<Api.ConfigManagement.Optimizer.ListItem>({
    url: '/api/config-management/optimizer',
    data,
    showErrorMessage: false
  })
}

/** 更新优化师（POST + body 含 id，与契约一致） */
export function updateOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload & { id: string }) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Update)) {
    return optimizerMock.mockUpdateOptimizer(data)
  }
  return request.post<Api.ConfigManagement.Optimizer.ListItem>({
    url: '/api/config-management/optimizer/update',
    data,
    showErrorMessage: false
  })
}

/** 导出（联调时若返回文件流需在 http 层单独处理 responseType） */
export function exportOptimizerList(params: Partial<Api.ConfigManagement.Optimizer.TableQuery>) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Export)) {
    return optimizerMock.mockExportOptimizerList(params)
  }
  return request.post<Api.ConfigManagement.Optimizer.ExportResponse>({
    url: '/api/config-management/optimizer/export',
    data: params,
    showErrorMessage: false
  })
}
