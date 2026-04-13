/**
 * 配置管理 · 应用商店凭据管理 API（与 `views/config-management/app-store-management` 对齐）
 */
import request from '@/utils/http'
import type { AppStoreConnectionAnomaliesData } from '@/views/config-management/app-store-management/types'
import {
  AppStoreEndpoint,
  isAppStoreEndpointMock
} from '@/views/config-management/app-store-management/config/data-source'
import * as appStoreMock from '@/views/config-management/app-store-management/mock/app-store-api-mock'

/** 当前连接异常摘要列表（底部告警、弹窗下拉） */
export function fetchAppStoreConnectionAnomalies() {
  if (isAppStoreEndpointMock(AppStoreEndpoint.ConnectionAnomalies)) {
    return appStoreMock.mockFetchAppStoreConnectionAnomalies()
  }
  return request.post<AppStoreConnectionAnomaliesData>({
    url: '/api/config-management/app-store-management/credential/connection-anomalies',
    data: {},
    showErrorMessage: false
  })
}
