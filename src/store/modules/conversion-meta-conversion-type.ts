/**
 * 转化管理 — `meta-conversion-type-options`（契约 08）全局缓存。
 * 页面/筛选/表格/弹窗 **读 store**；`ensureLoaded` 在入口或子组件挂载时调用，合并并发请求。
 */

import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { fetchConversionMetaConversionTypeOptions } from '@/api/user-growth/conversion-management'
import { MOCK_CONVERSION_TYPE_OPTIONS } from '@/views/user-growth/conversion-management/mock/data'

export const useConversionMetaConversionTypeStore = defineStore(
  'conversionMetaConversionType',
  () => {
    const conversionTypeOptions = shallowRef<{ label: string; value: string }[]>([])
    const loaded = ref(false)
    let loadPromise: Promise<void> | null = null

    async function ensureLoaded(): Promise<void> {
      if (loaded.value) return
      if (loadPromise) return loadPromise
      loadPromise = (async () => {
        try {
          const res = await fetchConversionMetaConversionTypeOptions()
          const raw = res.conversionTypeOptions ?? []
          conversionTypeOptions.value = raw.length ? raw : [...MOCK_CONVERSION_TYPE_OPTIONS]
        } catch (e) {
          console.warn(
            '[conversion-meta-conversion-type] 拉取 meta-conversion-type-options 失败',
            e
          )
          conversionTypeOptions.value = [...MOCK_CONVERSION_TYPE_OPTIONS]
        } finally {
          loaded.value = true
          loadPromise = null
        }
      })()
      return loadPromise
    }

    function reset() {
      conversionTypeOptions.value = []
      loaded.value = false
      loadPromise = null
    }

    return { conversionTypeOptions, loaded, ensureLoaded, reset }
  }
)
