/**
 * 商品运营 - 订单退款分析
 * 与 views/.../mock/backend-api 契约 1:1；数据源开关见页面 config/data-source.ts
 */
import request from '@/utils/http'
import {
  OrderRefundEndpoint,
  isOrderRefundEndpointMock
} from '@/views/product-operations/order-refund-analysis/config/data-source'
import * as orderRefundMock from '@/views/product-operations/order-refund-analysis/mock/order-refund-analysis-api-mock'
import type {
  DashboardPayload,
  OrderRefundDashboardParams
} from '@/views/product-operations/order-refund-analysis/types'

const BASE_URL = '/api/v1/datacenter/analysis/product-operations/order-refund-analysis'

export type {
  DashboardPayload,
  OrderRefundDashboardParams,
  OrderRecord,
  TrendPoint,
  CountryRate,
  OrderRefundKpiBlock
} from '@/views/product-operations/order-refund-analysis/types'

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
