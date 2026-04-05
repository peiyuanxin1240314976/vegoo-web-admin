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

function filterRowsByParams(params?: RealtimeDataQueryParams) {
  let rows = mockRealtimeAppCardRows.map((row) => ({ ...row, chartData: [...row.chartData] }))
  if (params?.s_app_id) {
    rows = rows.filter((r) => r.id === params.s_app_id)
  }
  if (params?.n_source) {
    rows = rows.filter((r) => rowHasSourcePlatform(r.id, params.n_source as string))
  }
  return rows
}

/** 详情里 channels 与 `n_source` 对齐时用于本地 Mock 筛选（契约字段 `n_source` 为 string） */
function rowHasSourcePlatform(sAppId: string, nSource: string): boolean {
  const detail = mockRealtimeAppDetailsById[sAppId]
  if (!detail?.channels?.length) return true
  return detail.channels.some((c) => c.n_source === nSource)
}

/** 01 — 顶部 KPI */
export function mockFetchRealtimeOverviewKpiSummary(params?: RealtimeDataQueryParams) {
  const rows = filterRowsByParams(params)
  if (!rows.length) {
    return Promise.resolve<RealtimeKpiSummary>({
      onlineApps: 0,
      totalApps: 0,
      todaySpend: 0,
      spendChange: '—',
      roiAvg: 0,
      roiTarget: mockRealtimeKpiSummary.roiTarget,
      warningApps: 0
    })
  }
  if (!params?.s_app_id && !params?.n_source) {
    return Promise.resolve<RealtimeKpiSummary>({ ...mockRealtimeKpiSummary })
  }
  const todaySpend = rows.reduce((s, r) => s + r.spend, 0)
  const warningApps = rows.filter((r) => r.hasWarning).length
  const roiAvg = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.roi, 0) / rows.length) : 0
  return Promise.resolve<RealtimeKpiSummary>({
    onlineApps: rows.filter((r) => r.isLive).length,
    totalApps: rows.length,
    todaySpend,
    spendChange: mockRealtimeKpiSummary.spendChange,
    roiAvg,
    roiTarget: mockRealtimeKpiSummary.roiTarget,
    warningApps
  })
}

/** 02 — 应用卡片列表（无详情） */
export function mockFetchRealtimeTableAppCards(params?: RealtimeDataQueryParams) {
  const items = filterRowsByParams(params)
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
export function mockFetchRealtimeOverviewHourlySpendComparison(params?: RealtimeDataQueryParams) {
  const src = mockRealtimeHourlySpendComparison
  let series = src.series.map((s) => ({
    ...s,
    costSeries: [...s.costSeries]
  }))
  if (params?.s_app_id) {
    series = series.filter((s) => s.s_app_id === params.s_app_id)
  }
  if (params?.n_source) {
    const allowed = new Set(filterRowsByParams(params).map((r) => r.id))
    series = series.filter((s) => allowed.has(s.s_app_id))
  }
  return Promise.resolve<RealtimeHourlySpendComparison>({
    hourLabels: [...src.hourLabels],
    roiPercentSeries: [...src.roiPercentSeries],
    series
  })
}
