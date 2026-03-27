/**
 * 配置管理 · 汇率管理 API（与 `views/config-management/exchange-rate-management` 对齐）
 */
import request from '@/utils/http'
import type {
  ExchangeRateItem,
  ExchangeRateQuery,
  ManualRateFormModel,
  SyncConfig
} from '@/views/config-management/exchange-rate-management/types'
import {
  ExchangeRateEndpoint,
  isExchangeRateEndpointMock
} from '@/views/config-management/exchange-rate-management/config/data-source'
import * as exchangeRateMock from '@/views/config-management/exchange-rate-management/mock/exchange-rate-api-mock'

/** 汇率列表 */
export function fetchExchangeRateTable(params: ExchangeRateQuery) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.RateTable)) {
    return exchangeRateMock.mockFetchExchangeRateTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<ExchangeRateItem>>({
    url: '/api/config-management/exchange-rate/table',
    data: params,
    showErrorMessage: false
  })
}

/** 手动新增汇率 */
export function createExchangeRate(data: ManualRateFormModel) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.ManualCreate)) {
    return exchangeRateMock.mockCreateExchangeRate(data)
  }
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate',
    data,
    showErrorMessage: false
  })
}

/** 触发汇率同步 */
export function syncExchangeRates(pairs: string[], source: string) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.SyncRates)) {
    return exchangeRateMock.mockSyncExchangeRates(pairs, source)
  }
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/sync',
    data: { pairs, source },
    showErrorMessage: false
  })
}

/** 保存同步设置 */
export function saveSyncConfig(data: SyncConfig) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.SaveSyncConfig)) {
    return exchangeRateMock.mockSaveSyncConfig(data)
  }
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/sync-config',
    data,
    showErrorMessage: false
  })
}

/** 更新覆盖自动同步状态 */
export function updateExchangeRateOverride(id: string, overrideAuto: boolean) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.RateOverride)) {
    return exchangeRateMock.mockUpdateExchangeRateOverride(id, overrideAuto)
  }
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/override',
    data: { id, overrideAuto },
    showErrorMessage: false
  })
}

/** 导出汇率列表 */
export function exportExchangeRates(params: Partial<ExchangeRateQuery>) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.ExportRates)) {
    return exchangeRateMock.mockExportExchangeRates(params)
  }
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/export',
    data: params,
    showErrorMessage: false
  })
}
