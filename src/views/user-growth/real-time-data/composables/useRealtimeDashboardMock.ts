import { ref } from 'vue'
import type { AppCard, RealtimeBottomSeries, RealtimeKpiSummary } from '../types'
import {
  mockRealtimeAppCards,
  mockRealtimeBottomSeries,
  mockRealtimeKpiSummary
} from '../mock/data'

/**
 * 实时数据看板数据源（当前为 Mock；接口就绪后可在此按 `mock/backend-api` 契约拆分为多请求并映射）。
 *
 * 契约对照：01-meta-filter-options · 02-overview-kpi-summary · 03-table-app-cards ·
 * 04-app-detail · 05-overview-hourly-spend-comparison
 */
export function useRealtimeDashboardMock() {
  const apps = ref<AppCard[]>(cloneAppCards(mockRealtimeAppCards))
  const kpiData = ref<RealtimeKpiSummary>({ ...mockRealtimeKpiSummary })
  const bottomSeries: RealtimeBottomSeries = { ...mockRealtimeBottomSeries }

  function reloadMock() {
    apps.value = cloneAppCards(mockRealtimeAppCards)
    kpiData.value = { ...mockRealtimeKpiSummary }
  }

  return {
    apps,
    kpiData,
    bottomSeries,
    reloadMock
  }
}

function cloneAppCards(list: AppCard[]): AppCard[] {
  return list.map((a) => ({
    ...a,
    detail: {
      ...a.detail,
      channels: a.detail.channels.map((c) => ({ ...c }))
    },
    chartData: [...a.chartData]
  }))
}
