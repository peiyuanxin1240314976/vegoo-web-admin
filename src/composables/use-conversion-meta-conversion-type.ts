/**
 * 转化管理 — 与 `useConversionMetaConversionTypeStore` 配套：筛选「全部」补项、表格/弹窗 label 匹配列表。
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useConversionMetaConversionTypeStore } from '@/store/modules/conversion-meta-conversion-type'
import { MOCK_CONVERSION_TYPE_OPTIONS } from '@/views/user-growth/conversion-management/mock/data'

/**
 * 与 `meta-conversion-type-options` 的 `value` 匹配：双方 **转大写** 再比（接口枚举多为大写，列表行可能小写）。
 */
export function findConversionTypeOptionByValue(
  options: { label: string; value: string }[],
  raw: string | undefined | null
): { label: string; value: string } | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  const key = String(raw).toUpperCase()
  return options.find((o) => String(o.value).toUpperCase() === key)
}

/** 将行内取值规范为选项中的 `value`（便于 ElSelect 与提交与接口一致） */
export function normalizeConversionTypeValueToOption(
  options: { label: string; value: string }[],
  raw: string | undefined | null
): string {
  if (raw === undefined || raw === null || raw === '') return ''
  const m = findConversionTypeOptionByValue(options, raw)
  return m?.value ?? String(raw)
}

export function useConversionMetaConversionTypeOptions() {
  const store = useConversionMetaConversionTypeStore()
  const { conversionTypeOptions } = storeToRefs(store)
  const { t } = useI18n()

  /** 含「全部」`value: ''`，供 name Tab / data Tab 筛选下拉 */
  const filterConversionTypeOptions = computed(() => {
    const raw = conversionTypeOptions.value
    if (!raw?.length) return MOCK_CONVERSION_TYPE_OPTIONS
    let list = [...raw]
    if (!list.some((o) => o.value === '')) {
      list = [
        { label: t('conversionManagement.filterConversionType'), value: '' },
        ...list.filter((o) => o && o.value !== '')
      ]
    }
    return list
  })

  /** 不含空 value，供表格/弹窗用 value 匹配 label */
  const optionsForLabelMatch = computed(() =>
    (conversionTypeOptions.value ?? []).filter((o) => o && o.value !== '')
  )

  return {
    conversionTypeOptions,
    filterConversionTypeOptions,
    optionsForLabelMatch,
    ensureLoaded: () => store.ensureLoaded()
  }
}
