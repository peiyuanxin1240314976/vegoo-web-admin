import { computed, reactive, ref } from 'vue'
import type { AdPlatformInfoFilterState, AdPlatformInfoPageData } from '../types'
import { MOCK_AD_PLATFORM_INFO_PAGE_DATA } from '../mock'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function useAdPlatformInfo() {
  const filtersDraft = reactive<AdPlatformInfoFilterState>({
    dateRange: '30d',
    source: 'google_ads'
  })
  const filters = reactive<AdPlatformInfoFilterState>({ ...filtersDraft })

  const state = ref<LoadState>('idle')
  const data = ref<AdPlatformInfoPageData | null>(null)
  const errorMsg = ref<string>('')

  const isLoading = computed(() => state.value === 'loading')

  function applyDraftFilters() {
    Object.assign(filters, filtersDraft)
  }

  async function load() {
    state.value = 'loading'
    errorMsg.value = ''
    try {
      // 预留后续接入真实接口：按 filters 调整返回
      await new Promise((r) => setTimeout(r, 450))
      data.value = MOCK_AD_PLATFORM_INFO_PAGE_DATA
      state.value = 'ready'
    } catch (e: any) {
      errorMsg.value = e?.message || '加载失败'
      state.value = 'error'
    }
  }

  return {
    filtersDraft,
    filters,
    applyDraftFilters,
    state,
    isLoading,
    data,
    errorMsg,
    load
  }
}
