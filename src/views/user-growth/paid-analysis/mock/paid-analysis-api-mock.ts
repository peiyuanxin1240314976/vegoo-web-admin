import type {
  PaidAnalysisChannelTabChartsData,
  PaidAnalysisChannelTabOverviewData,
  PaidAnalysisChannelTabTablesData,
  PaidAnalysisOrderListData,
  PaidAnalysisOrderTabSummaryData,
  PaidAnalysisProductTabChartsData,
  PaidAnalysisProductTabOverviewData,
  PaidAnalysisProductTabRankingData
} from '../types'

import channelOverviewContract from './backend-api/02-tab-channel-overview.json'
import channelTablesContract from './backend-api/02-tab-channel-tables.json'
import channelChartsContract from './backend-api/02-tab-channel-charts.json'
import productOverviewContract from './backend-api/03-tab-product-overview.json'
import productRankingContract from './backend-api/03-tab-product-ranking.json'
import productChartsContract from './backend-api/03-tab-product-charts.json'
import orderSummaryContract from './backend-api/04-tab-order-summary.json'
import orderListContract from './backend-api/05-table-order-list.json'
import orderDetailContract from './backend-api/06-order-detail.json'

export function mockPaidAnalysisTabChannelOverview(): Promise<PaidAnalysisChannelTabOverviewData> {
  return Promise.resolve(
    channelOverviewContract.sampleResponse as PaidAnalysisChannelTabOverviewData
  )
}

export function mockPaidAnalysisTabChannelTables(): Promise<PaidAnalysisChannelTabTablesData> {
  return Promise.resolve(channelTablesContract.sampleResponse as PaidAnalysisChannelTabTablesData)
}

export function mockPaidAnalysisTabChannelCharts(): Promise<PaidAnalysisChannelTabChartsData> {
  return Promise.resolve(channelChartsContract.sampleResponse as PaidAnalysisChannelTabChartsData)
}

export function mockPaidAnalysisTabProductOverview(): Promise<PaidAnalysisProductTabOverviewData> {
  return Promise.resolve(
    productOverviewContract.sampleResponse as PaidAnalysisProductTabOverviewData
  )
}

export function mockPaidAnalysisTabProductRanking(): Promise<PaidAnalysisProductTabRankingData> {
  return Promise.resolve(productRankingContract.sampleResponse as PaidAnalysisProductTabRankingData)
}

export function mockPaidAnalysisTabProductCharts(): Promise<PaidAnalysisProductTabChartsData> {
  return Promise.resolve(productChartsContract.sampleResponse as PaidAnalysisProductTabChartsData)
}

export function mockPaidAnalysisTabOrderSummary(): Promise<PaidAnalysisOrderTabSummaryData> {
  return Promise.resolve(orderSummaryContract.sampleResponse as PaidAnalysisOrderTabSummaryData)
}

export function mockPaidAnalysisOrderList(): Promise<PaidAnalysisOrderListData> {
  return Promise.resolve(orderListContract.sampleResponse as PaidAnalysisOrderListData)
}

export function mockPaidAnalysisOrderDetail(): Promise<{ detail: unknown }> {
  return Promise.resolve(orderDetailContract.sampleResponse as { detail: unknown })
}
