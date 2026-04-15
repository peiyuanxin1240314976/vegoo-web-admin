/**
 * 配置管理 · 汇率管理 API（与 `views/config-management/exchange-rate-management` 对齐）
 */
import FileSaver from 'file-saver'
import { getAppNow } from '@/utils/app-now'
import request, { requestBlob } from '@/utils/http'
import type {
  ExchangeRateItem,
  ExchangeRateOverviewKpi,
  ExchangeRateQuery,
  ExchangeRateTrendPoint,
  ManualRateFormModel,
  SyncConfig
} from '@/views/config-management/exchange-rate-management/types'
import {
  ExchangeRateEndpoint,
  isExchangeRateEndpointMock
} from '@/views/config-management/exchange-rate-management/config/data-source'
import * as exchangeRateMock from '@/views/config-management/exchange-rate-management/mock/exchange-rate-api-mock'

function getFilenameFromContentDisposition(value?: string): string | undefined {
  if (!value) return
  const mStar = String(value).match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (mStar?.[1]) {
    try {
      return decodeURIComponent(mStar[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return mStar[1].trim().replace(/^"|"$/g, '')
    }
  }
  const m = String(value).match(/filename\s*=\s*("?)([^";]+)\1/i)
  return m?.[2]?.trim()
}

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

/** 汇率页面 KPI 概览 */
export function fetchExchangeRateOverviewKpi(
  params: Partial<ExchangeRateQuery> & { alertThreshold?: number }
) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.OverviewKpi)) {
    return exchangeRateMock.mockFetchExchangeRateOverviewKpi(params)
  }
  return request.post<ExchangeRateOverviewKpi>({
    url: '/api/config-management/exchange-rate/overview/kpi',
    data: params,
    showErrorMessage: false
  })
}

/** 汇率走势（30天） */
export function fetchExchangeRateTrend(params: { pair: string; date?: string }) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.TrendSeries)) {
    return exchangeRateMock.mockFetchExchangeRateTrend(params)
  }
  return request.post<ExchangeRateTrendPoint[]>({
    url: '/api/config-management/exchange-rate/trend',
    data: params,
    showErrorMessage: false
  })
}

/** 读取同步设置 */
export function fetchExchangeRateSyncConfig() {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.SyncConfigDetail)) {
    return exchangeRateMock.mockFetchExchangeRateSyncConfig()
  }
  return request.post<SyncConfig>({
    url: '/api/config-management/exchange-rate/sync-config/detail',
    data: {},
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
export async function exportExchangeRates(params: Partial<ExchangeRateQuery>) {
  if (isExchangeRateEndpointMock(ExchangeRateEndpoint.ExportRates)) {
    const { blob, fileName } = await exchangeRateMock.mockExportExchangeRates(params)
    FileSaver.saveAs(blob, fileName)
    return
  }

  const response = await requestBlob({
    url: '/api/config-management/exchange-rate/export',
    method: 'POST',
    data: params,
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*'
    }
  })

  const fileName =
    getFilenameFromContentDisposition(response.headers?.['content-disposition']) ??
    `exchange_rates_${getAppNow().getTime()}.csv`

  FileSaver.saveAs(response.data, fileName)
}
