/**
 * Config management - ad account management API.
 */
import FileSaver from 'file-saver'
import request, { requestBlob } from '@/utils/http'
import {
  AdAccountManagementEndpoint,
  isAdAccountManagementEndpointMock
} from '@/views/config-management/ad-account-management/config/data-source'
import * as adAccountMock from '@/views/config-management/ad-account-management/mock/ad-account-management-api-mock'
import type {
  AdAccount,
  AdAccountForm,
  AdAccountOverviewStats,
  AdAccountOverviewStatsQuery,
  AdAccountTableQuery,
  AdAccountUpdatePayload
} from '@/views/config-management/ad-account-management/types'

const BASE = '/api/config-management/ad-account-management/account'

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

export function fetchAdAccountTable(params: AdAccountTableQuery) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.Table)) {
    return adAccountMock.mockFetchAdAccountTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<AdAccount>>({
    url: `${BASE}/table`,
    data: params,
    showErrorMessage: false
  })
}

export function fetchAdAccountOverviewStats(params: AdAccountOverviewStatsQuery) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.OverviewStats)) {
    return adAccountMock.mockFetchAdAccountOverviewStats(params)
  }
  return request.post<AdAccountOverviewStats>({
    url: `${BASE}/overview-stats`,
    data: params,
    showErrorMessage: false
  })
}

export function createAdAccount(data: AdAccountForm) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.Create)) {
    return adAccountMock.mockCreateAdAccount(data)
  }
  return request.post<AdAccount>({
    url: `${BASE}/create`,
    data,
    showErrorMessage: false
  })
}

export function updateAdAccount(id: number, data: AdAccountUpdatePayload) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.Update)) {
    return adAccountMock.mockUpdateAdAccount(id, data)
  }
  return request.post<AdAccount>({
    url: `${BASE}/update`,
    data: { id, ...data },
    showErrorMessage: false
  })
}

export function enableAdAccount(id: number) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.Enable)) {
    return adAccountMock.mockEnableAdAccount(id)
  }
  return request.post<{ updated: boolean; status: AdAccount['status'] }>({
    url: `${BASE}/enable`,
    data: { id },
    showErrorMessage: false
  })
}

export function disableAdAccount(id: number) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.Disable)) {
    return adAccountMock.mockDisableAdAccount(id)
  }
  return request.post<{ updated: boolean; status: AdAccount['status'] }>({
    url: `${BASE}/disable`,
    data: { id },
    showErrorMessage: false
  })
}

export function deleteAdAccount(id: number) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.Delete)) {
    return adAccountMock.mockDeleteAdAccount(id)
  }
  return request.post<{ deleted: boolean }>({
    url: `${BASE}/delete`,
    data: { id },
    showErrorMessage: false
  })
}

export async function exportAdAccountList(params: Partial<AdAccountTableQuery>) {
  if (isAdAccountManagementEndpointMock(AdAccountManagementEndpoint.Export)) {
    const { blob, fileName } = await adAccountMock.mockExportAdAccountList(params)
    FileSaver.saveAs(blob, fileName)
    return
  }

  const response = await requestBlob({
    url: `${BASE}/export`,
    method: 'POST',
    data: params,
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*'
    }
  })

  const fileName =
    getFilenameFromContentDisposition(response.headers?.['content-disposition']) ??
    `ad-account-management-${Date.now()}.xlsx`

  FileSaver.saveAs(response.data, fileName)
}
