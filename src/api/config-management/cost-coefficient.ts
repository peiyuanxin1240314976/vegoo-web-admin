/**
 * 配置管理 · 成本系数 API（与 `views/config-management/cost-coefficient` 对齐）
 */
import request from '@/utils/http'
import type {
  CostCoefficientQuery,
  CostCoefficientFormModel,
  CostCoefficientItem
} from '@/views/config-management/cost-coefficient/types'
import {
  CostCoefficientEndpoint,
  isCostCoefficientEndpointMock
} from '@/views/config-management/cost-coefficient/config/data-source'
import * as costCoefficientMock from '@/views/config-management/cost-coefficient/mock/cost-coefficient-api-mock'

/** 成本系数列表 */
export function fetchCostCoefficientTable(params: CostCoefficientQuery) {
  if (isCostCoefficientEndpointMock(CostCoefficientEndpoint.CoefficientTable)) {
    return costCoefficientMock.mockFetchCostCoefficientTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<CostCoefficientItem>>({
    url: '/api/config-management/cost-coefficient/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增成本系数 */
export function createCostCoefficient(data: CostCoefficientFormModel) {
  if (isCostCoefficientEndpointMock(CostCoefficientEndpoint.CreateCoefficient)) {
    return costCoefficientMock.mockCreateCostCoefficient(data)
  }
  return request.post<unknown>({
    url: '/api/config-management/cost-coefficient',
    data,
    showErrorMessage: false
  })
}

/** 编辑成本系数 */
export function updateCostCoefficient(id: string, data: Partial<CostCoefficientFormModel>) {
  if (isCostCoefficientEndpointMock(CostCoefficientEndpoint.UpdateCoefficient)) {
    return costCoefficientMock.mockUpdateCostCoefficient(id, data)
  }
  return request.put<unknown>({
    url: `/api/config-management/cost-coefficient/${id}`,
    data,
    showErrorMessage: false
  })
}

/** 删除成本系数（逻辑删除） */
export function deleteCostCoefficient(id: string) {
  if (isCostCoefficientEndpointMock(CostCoefficientEndpoint.DeleteCoefficient)) {
    return costCoefficientMock.mockDeleteCostCoefficient(id)
  }
  return request.del<unknown>({
    url: `/api/config-management/cost-coefficient/${id}`,
    showErrorMessage: false
  })
}

/** 成本系数调整历史 */
export function fetchCostCoefficientHistory(id: string) {
  if (isCostCoefficientEndpointMock(CostCoefficientEndpoint.CoefficientHistory)) {
    return costCoefficientMock.mockFetchCostCoefficientHistory(id)
  }
  return request.post<unknown>({
    url: '/api/config-management/cost-coefficient/history',
    data: { id },
    showErrorMessage: false
  })
}
