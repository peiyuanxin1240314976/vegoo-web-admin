/**
 * 用户增长 - 付费分析（`/user-growth/paid-analysis`）
 * 契约：`mock/backend-api/` 根目录扁平 JSON（`02-tab-channel-*`、`03-tab-product-*`、`04`～`07`），见该目录 `README.md`
 * 顶栏筛选项：`@/api/cockpit-meta-filter` → `fetchCockpitMetaFilterOptions`
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import { buildAppSelectionRequestBody } from '@/utils/app-id-request'
import {
  isPaidAnalysisExportEndpointMock,
  isPaidAnalysisOrderEndpointMock,
  isPaidAnalysisTabEndpointMock,
  PaidAnalysisExportEndpoints,
  PaidAnalysisOrderEndpoints,
  PaidAnalysisTabEndpoints
} from '@/views/user-growth/paid-analysis/config/data-source'
import type {
  PaidAnalysisChannelTabChartsData,
  PaidAnalysisChannelTabOverviewData,
  PaidAnalysisChannelTabTablesData,
  PaidAnalysisFilterBody,
  PaidAnalysisOrderDetailData,
  PaidAnalysisOrderListData,
  PaidAnalysisOrderListParams,
  PaidAnalysisOrderTabSummaryData,
  PaidAnalysisProductTabChartsData,
  PaidAnalysisProductTabOverviewData,
  PaidAnalysisProductTabRankingData
} from '@/views/user-growth/paid-analysis/types'
import {
  mockPaidAnalysisOrderDetail,
  mockPaidAnalysisOrderList,
  mockPaidAnalysisTabChannelCharts,
  mockPaidAnalysisTabChannelOverview,
  mockPaidAnalysisTabChannelTables,
  mockPaidAnalysisTabOrderSummary,
  mockPaidAnalysisTabProductCharts,
  mockPaidAnalysisTabProductOverview,
  mockPaidAnalysisTabProductRanking
} from '@/views/user-growth/paid-analysis/mock/paid-analysis-api-mock'

const PAID_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/user-growth/paid-analysis`
const TAB_CHANNEL_BASE = `${PAID_ANALYSIS_BASE}/tab-channel`
const TAB_PRODUCT_BASE = `${PAID_ANALYSIS_BASE}/tab-product`

function normalizePaidAnalysisFilterBody(data: PaidAnalysisFilterBody): PaidAnalysisFilterBody & {
  countryCode: string
  source: string
  appIds: string[]
} {
  const anyData = data as unknown as { s_country_code?: string; n_source?: string }
  return {
    ...data,
    ...buildAppSelectionRequestBody(data.appId),
    platform: data.platform ?? '',
    countryCode: data.countryCode ?? anyData.s_country_code ?? '',
    source: data.source ?? anyData.n_source ?? ''
  }
}

export function fetchPaidAnalysisTabChannelOverview(data: PaidAnalysisFilterBody) {
  if (isPaidAnalysisTabEndpointMock(PaidAnalysisTabEndpoints.TabChannelOverview)) {
    return mockPaidAnalysisTabChannelOverview()
  }
  return request.post<PaidAnalysisChannelTabOverviewData>({
    url: `${TAB_CHANNEL_BASE}/overview`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}

export function fetchPaidAnalysisTabChannelTables(data: PaidAnalysisFilterBody) {
  if (isPaidAnalysisTabEndpointMock(PaidAnalysisTabEndpoints.TabChannelTables)) {
    return mockPaidAnalysisTabChannelTables()
  }
  return request.post<PaidAnalysisChannelTabTablesData>({
    url: `${TAB_CHANNEL_BASE}/tables`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}

export function fetchPaidAnalysisTabChannelCharts(data: PaidAnalysisFilterBody) {
  if (isPaidAnalysisTabEndpointMock(PaidAnalysisTabEndpoints.TabChannelCharts)) {
    return mockPaidAnalysisTabChannelCharts()
  }
  return request.post<PaidAnalysisChannelTabChartsData>({
    url: `${TAB_CHANNEL_BASE}/charts`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}

export function fetchPaidAnalysisTabProductOverview(data: PaidAnalysisFilterBody) {
  if (isPaidAnalysisTabEndpointMock(PaidAnalysisTabEndpoints.TabProductOverview)) {
    return mockPaidAnalysisTabProductOverview()
  }
  return request.post<PaidAnalysisProductTabOverviewData>({
    url: `${TAB_PRODUCT_BASE}/overview`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}

export function fetchPaidAnalysisTabProductRanking(data: PaidAnalysisFilterBody) {
  if (isPaidAnalysisTabEndpointMock(PaidAnalysisTabEndpoints.TabProductRanking)) {
    return mockPaidAnalysisTabProductRanking()
  }
  return request.post<PaidAnalysisProductTabRankingData>({
    url: `${TAB_PRODUCT_BASE}/ranking`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}

export function fetchPaidAnalysisTabProductCharts(data: PaidAnalysisFilterBody) {
  if (isPaidAnalysisTabEndpointMock(PaidAnalysisTabEndpoints.TabProductCharts)) {
    return mockPaidAnalysisTabProductCharts()
  }
  return request.post<PaidAnalysisProductTabChartsData>({
    url: `${TAB_PRODUCT_BASE}/charts`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}

export function fetchPaidAnalysisTabOrderSummary(data: PaidAnalysisFilterBody) {
  if (isPaidAnalysisTabEndpointMock(PaidAnalysisTabEndpoints.TabOrderSummary)) {
    return mockPaidAnalysisTabOrderSummary()
  }
  return request.post<PaidAnalysisOrderTabSummaryData>({
    url: `${PAID_ANALYSIS_BASE}/tab-order-summary`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}

export function fetchPaidAnalysisOrderList(data: PaidAnalysisOrderListParams) {
  if (isPaidAnalysisOrderEndpointMock(PaidAnalysisOrderEndpoints.OrderList)) {
    return mockPaidAnalysisOrderList()
  }
  return request.post<PaidAnalysisOrderListData>({
    url: `${PAID_ANALYSIS_BASE}/table/order-list`,
    data: normalizePaidAnalysisFilterBody(data) as PaidAnalysisOrderListParams
  })
}

export function fetchPaidAnalysisOrderDetail(data: { s_order_id: string }) {
  if (isPaidAnalysisOrderEndpointMock(PaidAnalysisOrderEndpoints.OrderDetail)) {
    return mockPaidAnalysisOrderDetail() as Promise<{ detail: PaidAnalysisOrderDetailData }>
  }
  return request.post<{ detail: PaidAnalysisOrderDetailData }>({
    url: `${PAID_ANALYSIS_BASE}/order-detail`,
    data
  })
}

export function fetchPaidAnalysisExportOrders(
  data: PaidAnalysisFilterBody & { keyword?: string; format?: 'xlsx' | 'csv' }
) {
  if (isPaidAnalysisExportEndpointMock(PaidAnalysisExportEndpoints.ExportOrders)) {
    return Promise.resolve({ downloadUrl: '', fileId: '' })
  }
  return request.post<{ downloadUrl: string; fileId?: string }>({
    url: `${PAID_ANALYSIS_BASE}/export/orders`,
    data: normalizePaidAnalysisFilterBody(data)
  })
}
