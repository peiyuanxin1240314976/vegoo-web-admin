/**
 * 三方商店管理 - API 服務層
 * 與 mock/backend-api 契約對齊，數據源開關見 config/data-source.ts
 */
import request from '@/utils/http'
import { ThirdPartyStoresEndpoint, isThirdPartyStoresEndpointMock } from '../config/data-source'
import * as thirdPartyStoresMock from '../mocks/third-party-stores-mock'
import type { ThirdPartyStoresDashboardPayload, ThirdPartyStoresQueryParams } from '../types'

const BASE_URL = '/api/product-operations/third-party-stores'

export type { ThirdPartyStoresDashboardPayload, ThirdPartyStoresQueryParams } from '../types'

export const thirdPartyStoresApi = {
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
  }
}
