import { ref, watch, onMounted } from 'vue'
import { useCockpitMetaFilterOptions } from '@/composables/use-cockpit-meta-filter'
import type { SelectOption } from '../types'

/** 与业务 POST 入参一致：「全部」为 ''；兼容历史字面量 all */
function normalizeOptions(list: { label: string; value: string }[]): SelectOption[] {
  return list.map((o) => ({
    ...o,
    value: o.value === 'all' ? '' : o.value
  }))
}

/**
 * 顶栏筛选项：与驾驶舱同构，读 **`useCockpitMetaFilterStore`**（经 `useCockpitMetaFilterOptions`），
 * 不请求 `.../comprehensive-analysis/meta-filter-options`。
 */
export function useComprehensiveAnalysisFilters() {
  const { cockpitMeta, ensureCockpitMetaLoaded } = useCockpitMetaFilterOptions()
  const appOptions = ref<SelectOption[]>([])
  const sourceOptions = ref<SelectOption[]>([])
  const countryOptions = ref<SelectOption[]>([])
  const settingApps = ref<any[]>([])

  function syncFromMeta() {
    const m = cockpitMeta.value
    if (!m) return
    appOptions.value = normalizeOptions(m.appOptions)
    sourceOptions.value = normalizeOptions(m.sourceOptions)
    countryOptions.value = normalizeOptions(m.countryOptions)
    settingApps.value = m.settingApps ?? []
  }

  watch(cockpitMeta, syncFromMeta, { immediate: true })

  onMounted(async () => {
    await ensureCockpitMetaLoaded()
    syncFromMeta()
  })

  return { appOptions, sourceOptions, countryOptions, settingApps }
}
