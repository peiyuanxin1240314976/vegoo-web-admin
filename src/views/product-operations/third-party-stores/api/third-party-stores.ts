/**
 * 三方商店管理 - API 服務層
 * 與 mock/backend-api 契約對齊，數據源開關見 config/data-source.ts
 */
import request from '@/utils/http'
import { ThirdPartyStoresEndpoint, isThirdPartyStoresEndpointMock } from '../config/data-source'
import * as thirdPartyStoresMock from '../mocks/third-party-stores-mock'
import type {
  ThirdPartyStoresFilterOptionsData,
  ThirdPartyStoresDashboardPayload,
  ThirdPartyStoresQueryParams,
  ThirdPartyStoresExportRequest,
  ThirdPartyStoresExportResponse,
  ThirdPartyStoresPlatformCreateRequest,
  ThirdPartyStoresPlatformCreateResponse,
  ThirdPartyStoresPlatformDetailRequest,
  ThirdPartyStoresPlatformDetailResponse,
  ThirdPartyStoresPlatformFixAuthRequest,
  ThirdPartyStoresPlatformFixAuthResponse
} from '../types'

const BASE_URL = '/api/product-operations/third-party-stores'

export type { ThirdPartyStoresDashboardPayload, ThirdPartyStoresQueryParams } from '../types'

export const thirdPartyStoresApi = {
  async getFilterOptions(): Promise<ThirdPartyStoresFilterOptionsData> {
    if (isThirdPartyStoresEndpointMock(ThirdPartyStoresEndpoint.FilterOptions)) {
      return thirdPartyStoresMock.mockFetchThirdPartyStoresFilterOptions()
    }
    return request.post<ThirdPartyStoresFilterOptionsData>({
      url: `${BASE_URL}/meta/filter-options`,
      data: {}
    })
  },

  async getOverviewDashboard(
    params: ThirdPartyStoresQueryParams
  ): Promise<ThirdPartyStoresDashboardPayload> {
    if (isThirdPartyStoresEndpointMock(ThirdPartyStoresEndpoint.OverviewDashboard)) {
      return thirdPartyStoresMock.mockFetchThirdPartyStoresDashboard(params)
    }
    return request.post<ThirdPartyStoresDashboardPayload>({
      url: `${BASE_URL}/overview/dashboard`,
      data: params
    })
  },

  async getPlatformDetail(
    params: ThirdPartyStoresPlatformDetailRequest
  ): Promise<ThirdPartyStoresPlatformDetailResponse> {
    if (isThirdPartyStoresEndpointMock(ThirdPartyStoresEndpoint.PlatformDetail)) {
      return thirdPartyStoresMock.mockFetchThirdPartyStoresPlatformDetail(params)
    }
    return request.post<ThirdPartyStoresPlatformDetailResponse>({
      url: `${BASE_URL}/platform/detail`,
      data: params
    })
  },

  async createPlatform(
    params: ThirdPartyStoresPlatformCreateRequest
  ): Promise<ThirdPartyStoresPlatformCreateResponse> {
    if (isThirdPartyStoresEndpointMock(ThirdPartyStoresEndpoint.PlatformCreate)) {
      return thirdPartyStoresMock.mockCreateThirdPartyStoresPlatform(params)
    }
    return request.post<ThirdPartyStoresPlatformCreateResponse>({
      url: `${BASE_URL}/platform/create`,
      data: params
    })
  },

  async fixPlatformAuth(
    params: ThirdPartyStoresPlatformFixAuthRequest
  ): Promise<ThirdPartyStoresPlatformFixAuthResponse> {
    if (isThirdPartyStoresEndpointMock(ThirdPartyStoresEndpoint.PlatformAuthFix)) {
      return thirdPartyStoresMock.mockFixThirdPartyStoresPlatformAuth(params)
    }
    return request.post<ThirdPartyStoresPlatformFixAuthResponse>({
      url: `${BASE_URL}/platform/auth-fix`,
      data: params
    })
  },

  async exportDashboard(
    params: ThirdPartyStoresExportRequest
  ): Promise<ThirdPartyStoresExportResponse> {
    if (isThirdPartyStoresEndpointMock(ThirdPartyStoresEndpoint.ExportDashboard)) {
      return thirdPartyStoresMock.mockExportThirdPartyStoresDashboard(params)
    }
    return request.post<ThirdPartyStoresExportResponse>({
      url: `${BASE_URL}/export/dashboard`,
      data: params
    })
  }
}
