/**
 * IAA 分析 - 全局筛选与下拉选项
 * 应用选项与公用 **`GET .../cockpit/meta-filter-options`** 对齐（Pinia `useCockpitMetaFilterStore`），不请求 `.../iaa-analysis/meta-filter-options`
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
import type { IaaSelectOption } from '../types'

export function useIaaFilters() {
  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)

  const appOptions = computed<IaaSelectOption[]>(() =>
    (cockpitMeta.value?.appOptions ?? []).map((o) => ({
      label: String(o.label ?? ''),
      value: String(o.value ?? '')
    }))
  )

  /** 终端平台 Tab 等仍可能引用；与历史静态默认值一致 */
  const platformOptions = computed<IaaSelectOption[]>(() => [
    { label: 'Android&iOS', value: 'all' },
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' }
  ])

  /** 不再单独请求 meta；骨架屏由 `effectiveFilter` 与 Tab 数据驱动 */
  const loading = computed(() => false)

  return {
    appOptions,
    platformOptions,
    loading
  }
}
