import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { AdPlatformInfoFilterState, AdPlatformInfoPageData } from '../types'
import { buildMockAdPlatformInfoPageData } from '../mock'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function useAdPlatformInfo() {
  const route = useRoute()

  /** 查询参数 `?id=`，对应广告系列 `s_campaign_id` */
  const detailId = computed(() => {
    const raw = route.query.id
    const s = Array.isArray(raw) ? raw[0] : raw
    return String(s ?? '').trim()
  })

  const filtersDraft = reactive<AdPlatformInfoFilterState>({
    dateRange: '30d'
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
    const id = detailId.value
    if (!id) {
      state.value = 'error'
      data.value = null
      errorMsg.value = '缺少广告系列 ID'
      return
    }

    state.value = 'loading'
    errorMsg.value = ''
    try {
      // 预留：POST 详情接口，body 含 s_campaign_id + 时间范围（与 filters 一致）
      await new Promise((r) => setTimeout(r, 450))
      data.value = buildMockAdPlatformInfoPageData(id)
      state.value = 'ready'
    } catch (e: unknown) {
      const err = e as { message?: string }
      errorMsg.value = err?.message || '加载失败'
      state.value = 'error'
      data.value = null
    }
  }

  watch(
    detailId,
    () => {
      void load()
    },
    { immediate: true }
  )

  return {
    detailId,
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
