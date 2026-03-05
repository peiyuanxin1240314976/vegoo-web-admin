/**
 * 变现分析数据 Composable
 * 统一拉取数据，供父组件与子组件使用；后续对接真实接口只需改 api 层
 */
import { ref, onMounted } from 'vue'
import type {
  MonetizationAnalysisOverview,
  MonetizationAnalysisParams,
  MonetizationDateRange
} from '../types'
import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

export function useMonetizationAnalysisData(initialDateRange: MonetizationDateRange = 'month') {
  const overview = ref<MonetizationAnalysisOverview | null>(null)
  const loading = ref(true)
  const dateRange = ref<MonetizationDateRange>(initialDateRange)

  async function load(params?: MonetizationAnalysisParams) {
    console.log('load', params)
    loading.value = true
    try {
      // 当前使用 Mock；对接真实接口时在此调用 api
      overview.value = { ...MOCK_MONETIZATION_ANALYSIS }
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
