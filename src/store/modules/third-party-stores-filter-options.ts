import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { thirdPartyStoresApi } from '@/views/product-operations/third-party-stores/api/third-party-stores'
import type { ThirdPartyStoresFilterOptionsData } from '@/views/product-operations/third-party-stores/types'

export const useThirdPartyStoresFilterOptionsStore = defineStore(
  'thirdPartyStoresFilterOptions',
  () => {
    const data = shallowRef<ThirdPartyStoresFilterOptionsData | null>(null)
    let loadPromise: Promise<ThirdPartyStoresFilterOptionsData | null> | null = null

    function reset() {
      data.value = null
      loadPromise = null
    }

    async function ensureLoaded(): Promise<ThirdPartyStoresFilterOptionsData | null> {
      if (data.value) return data.value
      if (loadPromise) return loadPromise
      loadPromise = (async () => {
        try {
          const res = await thirdPartyStoresApi.getFilterOptions()
          data.value = res
          return res
        } catch (e) {
          console.warn('[third-party-stores] 拉取筛选下拉失败', e)
          return null
        } finally {
          loadPromise = null
        }
      })()
      return loadPromise
    }

    return { data, ensureLoaded, reset }
  }
)
