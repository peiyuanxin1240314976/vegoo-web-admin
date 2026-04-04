/**
 * 整体回收 - 顶栏筛选项：复用公用 **`GET .../cockpit/meta-filter-options`**（Pinia Store），
 * 不请求 `/overall-recovery/meta-filter-options`。
 */
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'

function fallbackOptions(): CockpitMetaOptionItem[] {
  return [{ label: '全部', value: '' }]
}

export function useOverallRecoveryFilters() {
  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)

  const appOptions = computed(() => {
    const list = cockpitMeta.value?.appOptions
    return list?.length ? list : fallbackOptions()
  })
  const sourceOptions = computed(() => {
    const list = cockpitMeta.value?.sourceOptions
    return list?.length ? list : fallbackOptions()
  })
  const countryOptions = computed(() => {
    const list = cockpitMeta.value?.countryOptions
    return list?.length ? list : fallbackOptions()
  })

  onMounted(() => {
    metaStore.ensureLoaded()
  })

  return { appOptions, sourceOptions, countryOptions }
}
