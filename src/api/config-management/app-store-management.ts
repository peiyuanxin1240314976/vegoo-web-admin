import request, { requestBlob } from '@/utils/http'
import type {
  AppStoreBatchTestParams,
  AppStoreBatchTestResult,
  AppStoreConnectionAnomaliesData,
  AppStoreCreateCredentialResult,
  AppStoreCredentialConnectionTestResult,
  AppStoreCredentialDetailData,
  AppStoreCredentialOverviewStatsData,
  AppStoreCredentialOverviewStatsParams,
  AppStoreCredentialTableData,
  AppStoreCredentialTableParams,
  AppStoreCredentialUpsertPayload,
  AppStoreExportParams,
  AppStoreRetryConnectionResult,
  AppStoreUpdateCredentialResult
} from '@/views/config-management/app-store-management/types'
import {
  AppStoreEndpoint,
  isAppStoreEndpointMock
} from '@/views/config-management/app-store-management/config/data-source'
import * as appStoreMock from '@/views/config-management/app-store-management/mock/app-store-api-mock'

export function fetchAppStoreCredentialTable(params: AppStoreCredentialTableParams) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.CredentialTable)) {
    return appStoreMock.mockFetchAppStoreCredentialTable(params)
  }
  return request.post<AppStoreCredentialTableData>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/table',
    data: params
  })
}

export function fetchAppStoreOverviewStats(params: AppStoreCredentialOverviewStatsParams) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.OverviewStats)) {
    return appStoreMock.mockFetchAppStoreOverviewStats(params)
  }
  return request.post<AppStoreCredentialOverviewStatsData>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/overview-stats',
    data: params
  })
}

export function createAppStoreCredential(payload: AppStoreCredentialUpsertPayload) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.CredentialCreate)) {
    return appStoreMock.mockCreateAppStoreCredential(payload)
  }
  return request.post<AppStoreCreateCredentialResult>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/create',
    data: payload
  })
}

export function updateAppStoreCredential(payload: AppStoreCredentialUpsertPayload) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.CredentialUpdate)) {
    return appStoreMock.mockUpdateAppStoreCredential(payload)
  }
  return request.post<AppStoreUpdateCredentialResult>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/update',
    data: payload
  })
}

export function testAppStoreCredentialConnection(id: string) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.TestConnection)) {
    return appStoreMock.mockTestAppStoreCredentialConnection(id)
  }
  return request.post<AppStoreCredentialConnectionTestResult>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/test-connection',
    data: { id }
  })
}

export function batchTestAppStoreCredentialConnection(params: AppStoreBatchTestParams) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.BatchTestConnection)) {
    return appStoreMock.mockBatchTestAppStoreCredentialConnection(params)
  }
  return request.post<AppStoreBatchTestResult>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/test-connection-batch',
    data: params
  })
}

export function retryAppStoreCredentialConnection(id: string) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.RetryConnection)) {
    return appStoreMock.mockRetryAppStoreCredentialConnection(id)
  }
  return request.post<AppStoreRetryConnectionResult>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/retry-connection',
    data: { id }
  })
}

export function fetchAppStoreCredentialDetail(id: string) {
  if (isAppStoreEndpointMock(AppStoreEndpoint.CredentialDetail)) {
    return appStoreMock.mockFetchAppStoreCredentialDetail(id)
  }
  return request.post<AppStoreCredentialDetailData>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/detail',
    data: { id }
  })
}

export async function exportAppStoreCredentials(params: AppStoreExportParams): Promise<Blob> {
  if (isAppStoreEndpointMock(AppStoreEndpoint.CredentialExport)) {
    return appStoreMock.mockExportAppStoreCredentials(params)
  }
  const response = await requestBlob({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/export',
    method: 'POST',
    data: params,
    showErrorMessage: false
  })
  return response.data
}

export function fetchAppStoreConnectionAnomalies() {
  if (isAppStoreEndpointMock(AppStoreEndpoint.ConnectionAnomalies)) {
    return appStoreMock.mockFetchAppStoreConnectionAnomalies()
  }
  return request.post<AppStoreConnectionAnomaliesData>({
    url: '/api/v1/datacenter/analysis/config-management/app-store-management/credential/connection-anomalies',
    data: {},
    showErrorMessage: false
  })
}
