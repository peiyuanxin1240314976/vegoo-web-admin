import { storeToRefs } from 'pinia'
import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'

/**
 * 公用 cockpit 顶栏筛选项。
 * - **常规用法**：直接读 **`cockpitMeta`**（即 Store 的 `data`）绑定 `appOptions` 等，不要每页再请求接口。
 * - **兜底**：`ensureCockpitMetaLoaded` → `ensureLoaded()`，仅当 `cockpitMeta` 仍为空且守卫尚未写入时使用。
 */
export function useCockpitMetaFilterOptions() {
  const store = useCockpitMetaFilterStore()
  const { data } = storeToRefs(store)
  return {
    cockpitMeta: data,
    ensureCockpitMetaLoaded: () => store.ensureLoaded()
  }
}
