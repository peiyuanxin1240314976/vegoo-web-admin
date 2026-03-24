/**
 * 订单退款分析 - API 服务层
 * 与 mock/backend-api 契约 1:1，数据源开关见 config/data-source.ts
 */
import request from '@/utils/http'
import { OrderRefundEndpoint, isOrderRefundEndpointMock } from '../config/data-source'
import * as orderRefundMock from '../mocks/order-refund-analysis-mock'
import type { DashboardPayload, OrderRefundDashboardParams } from '../types'

const BASE_URL = '/api/product-operations/order-refund-analysis'

export type {
  DashboardPayload,
  OrderRefundDashboardParams,
  OrderRecord,
  TrendPoint,
  CountryRate,
  OrderRefundKpiBlock
} from '../types'

export const orderRefundAnalysisApi = {
  async getDashboard(params: OrderRefundDashboardParams): Promise<DashboardPayload> {
    if (isOrderRefundEndpointMock(OrderRefundEndpoint.Dashboard)) {
      return orderRefundMock.mockFetchDashboard(params)
    }
    return request.post<DashboardPayload>({
      url: `${BASE_URL}/overview/dashboard`,
      data: params
    })
  }
}
