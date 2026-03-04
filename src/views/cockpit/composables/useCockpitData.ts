/**
 * 驾驶舱数据 Composable
 * 统一拉取驾驶舱数据，供主页面与子组件使用；后续对接真实接口无需改组件，只改 api/cockpit
 */
import { ref, onMounted } from 'vue'
import { fetchCockpitOverview } from '../api/cockpit'
import type { CockpitOverview, CockpitOverviewParams, CockpitDateRange } from '../types'

export function useCockpitData(initialDateRange: CockpitDateRange = 'today') {
  const overview = ref<CockpitOverview | null>(null)
  const loading = ref(true)
  const dateRange = ref<CockpitDateRange>(initialDateRange)

  async function load(params?: CockpitOverviewParams) {
    loading.value = true
    try {
      overview.value = await fetchCockpitOverview(params ?? { dateRange: dateRange.value })
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    await load({ dateRange: dateRange.value })
  }

  onMounted(() => {
    load({ dateRange: dateRange.value })
  })

  return {
    overview,
    loading,
    dateRange,
    load,
    refresh
  }
}
