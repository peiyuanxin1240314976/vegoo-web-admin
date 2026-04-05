import { ref } from 'vue'
import type { AppCard, RealtimeBottomSeries, RealtimeKpiSummary } from '../types'
import {
  mockRealtimeAppCards,
  mockRealtimeBottomSeries,
  mockRealtimeKpiSummary
} from '../mock/data'

/**
 * 实时数据看板数据源（当前为本地 `mock/data` 聚合）。
 *
 * 联调：筛选项用 `useCockpitMetaFilterStore().ensureLoaded()`（`@/store/modules/cockpit-meta-filter`）；
 * 数据用 `@/api/user-growth/real-time-data` 下四个 `fetchRealtime*`，开关见 `config/data-source.ts`；契约见 `mock/backend-api/*.json`。
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
