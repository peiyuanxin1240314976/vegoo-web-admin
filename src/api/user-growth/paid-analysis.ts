/**
 * 用户增长 - 付费分析（`/user-growth/paid-analysis`）
 * 契约：`mock/backend-api/` 根目录扁平 JSON（`02-tab-channel-*`、`03-tab-product-*`、`04`～`07`），见该目录 `README.md`
 * 顶栏筛选项：`@/api/cockpit-meta-filter` → `fetchCockpitMetaFilterOptions`
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
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

const PAID_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/user-growth/paid-analysis`
const TAB_CHANNEL_BASE = `${PAID_ANALYSIS_BASE}/tab-channel`
const TAB_PRODUCT_BASE = `${PAID_ANALYSIS_BASE}/tab-product`

export function fetchPaidAnalysisTabChannelOverview(data: PaidAnalysisFilterBody) {
  return request.post<PaidAnalysisChannelTabOverviewData>({
    url: `${TAB_CHANNEL_BASE}/overview`,
    data
  })
}

export function fetchPaidAnalysisTabChannelTables(data: PaidAnalysisFilterBody) {
  return request.post<PaidAnalysisChannelTabTablesData>({
    url: `${TAB_CHANNEL_BASE}/tables`,
    data
  })
}

export function fetchPaidAnalysisTabChannelCharts(data: PaidAnalysisFilterBody) {
  return request.post<PaidAnalysisChannelTabChartsData>({
    url: `${TAB_CHANNEL_BASE}/charts`,
    data
  })
}

export function fetchPaidAnalysisTabProductOverview(data: PaidAnalysisFilterBody) {
  return request.post<PaidAnalysisProductTabOverviewData>({
    url: `${TAB_PRODUCT_BASE}/overview`,
    data
  })
}

export function fetchPaidAnalysisTabProductRanking(data: PaidAnalysisFilterBody) {
  return request.post<PaidAnalysisProductTabRankingData>({
    url: `${TAB_PRODUCT_BASE}/ranking`,
    data
  })
}

export function fetchPaidAnalysisTabProductCharts(data: PaidAnalysisFilterBody) {
  return request.post<PaidAnalysisProductTabChartsData>({
    url: `${TAB_PRODUCT_BASE}/charts`,
    data
  })
}

export function fetchPaidAnalysisTabOrderSummary(data: PaidAnalysisFilterBody) {
  return request.post<PaidAnalysisOrderTabSummaryData>({
    url: `${PAID_ANALYSIS_BASE}/tab-order-summary`,
    data
  })
}

export function fetchPaidAnalysisOrderList(data: PaidAnalysisOrderListParams) {
  return request.post<PaidAnalysisOrderListData>({
    url: `${PAID_ANALYSIS_BASE}/table/order-list`,
    data
  })
}

export function fetchPaidAnalysisOrderDetail(data: { s_order_id: string }) {
  return request.post<{ detail: PaidAnalysisOrderDetailData }>({
    url: `${PAID_ANALYSIS_BASE}/order-detail`,
    data
  })
}

export function fetchPaidAnalysisExportOrders(
  data: PaidAnalysisFilterBody & { keyword?: string; format?: 'xlsx' | 'csv' }
) {
  return request.post<{ downloadUrl: string; fileId?: string }>({
    url: `${PAID_ANALYSIS_BASE}/export/orders`,
    data
  })
}
