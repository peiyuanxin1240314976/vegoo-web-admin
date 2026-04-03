import type {
  RealtimeAppCardsTableBody,
  RealtimeAppDetailBody,
  RealtimeAppDetailRequestBody,
  RealtimeDataQueryParams,
  RealtimeHourlySpendComparison,
  RealtimeKpiSummary
} from '../types'
import {
  mockRealtimeAppCardRows,
  mockRealtimeAppDetailsById,
  mockRealtimeHourlySpendComparison,
  mockRealtimeKpiSummary
} from './data'

/** 01 — 顶部 KPI */
export function mockFetchRealtimeOverviewKpiSummary(_params?: RealtimeDataQueryParams) {
  void _params
  return Promise.resolve<RealtimeKpiSummary>({ ...mockRealtimeKpiSummary })
}

/** 02 — 应用卡片列表（无详情） */
export function mockFetchRealtimeTableAppCards(_params?: RealtimeDataQueryParams) {
  void _params
  const items = mockRealtimeAppCardRows.map((row) => ({ ...row, chartData: [...row.chartData] }))
  const body: RealtimeAppCardsTableBody = { items }
  return Promise.resolve(body)
}

/** 03 — 详情弹窗 */
export function mockFetchRealtimeAppDetail(params: RealtimeAppDetailRequestBody) {
  const raw = mockRealtimeAppDetailsById[params.s_app_id] ?? mockRealtimeAppDetailsById.weather5
  const detail = {
    ...raw,
    channels: raw.channels.map((c) => ({ ...c }))
  }
  const body: RealtimeAppDetailBody = { detail }
  return Promise.resolve(body)
}

/** 04 — 底部小时消耗对比 */
export function mockFetchRealtimeOverviewHourlySpendComparison(_params?: RealtimeDataQueryParams) {
  void _params
  const src = mockRealtimeHourlySpendComparison
  return Promise.resolve<RealtimeHourlySpendComparison>({
    hourLabels: [...src.hourLabels],
    roiPercentSeries: [...src.roiPercentSeries],
    series: src.series.map((s) => ({
      ...s,
      costSeries: [...s.costSeries]
    }))
  })
}
