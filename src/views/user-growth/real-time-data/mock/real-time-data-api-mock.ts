import type {
  RealtimeAppCardsTableBody,
  RealtimeAppDetailBody,
  RealtimeAppDetailRequestBody,
  RealtimeDataQueryParams,
  RealtimeHourlySpendComparison,
  RealtimeKpiSummary,
  RealtimeMetaFilterOptionsBody
} from '../types'
import {
  mockRealtimeAppCardRows,
  mockRealtimeAppDetailsById,
  mockRealtimeHourlySpendComparison,
  mockRealtimeKpiSummary
} from './data'

const MOCK_SOURCE_OPTIONS: RealtimeMetaFilterOptionsBody['sourceOptions'] = [
  { value: 'all', label: '全部广告平台' },
  { value: '1', label: 'Google', n_source: 1 },
  { value: '2', label: 'Meta', n_source: 2 },
  { value: '7', label: 'Pangle', n_source: 7 }
]

function buildAppOptions(): RealtimeMetaFilterOptionsBody['appOptions'] {
  return [
    { value: 'all', label: '全部应用' },
    ...mockRealtimeAppCardRows.map((row) => ({
      value: row.id,
      label: row.name,
      s_app_id: row.id
    }))
  ]
}

/** 01 — 筛选元数据 */
export function mockFetchRealtimeMetaFilterOptions(_params?: RealtimeDataQueryParams) {
  void _params
  const body: RealtimeMetaFilterOptionsBody = {
    appOptions: buildAppOptions(),
    sourceOptions: MOCK_SOURCE_OPTIONS.map((o) => ({ ...o }))
  }
  return Promise.resolve(body)
}

/** 02 — 顶部 KPI */
export function mockFetchRealtimeOverviewKpiSummary(_params?: RealtimeDataQueryParams) {
  void _params
  return Promise.resolve<RealtimeKpiSummary>({ ...mockRealtimeKpiSummary })
}

/** 03 — 应用卡片列表（无详情） */
export function mockFetchRealtimeTableAppCards(_params?: RealtimeDataQueryParams) {
  void _params
  const items = mockRealtimeAppCardRows.map((row) => ({ ...row, chartData: [...row.chartData] }))
  const body: RealtimeAppCardsTableBody = { items }
  return Promise.resolve(body)
}

/** 04 — 详情弹窗 */
export function mockFetchRealtimeAppDetail(params: RealtimeAppDetailRequestBody) {
  const raw = mockRealtimeAppDetailsById[params.s_app_id] ?? mockRealtimeAppDetailsById.weather5
  const detail = {
    ...raw,
    channels: raw.channels.map((c) => ({ ...c }))
  }
  const body: RealtimeAppDetailBody = { detail }
  return Promise.resolve(body)
}

/** 05 — 底部小时消耗对比 */
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
