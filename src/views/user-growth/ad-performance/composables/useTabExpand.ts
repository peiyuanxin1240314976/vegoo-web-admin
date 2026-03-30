import { computed, ref, watch } from 'vue'

/**
 * 管理树形表格行展开/折叠状态。
 * keyword 变化时自动清空所有展开行。
 */
export function useTabExpand(getKeyword: () => string | undefined) {
  const expandedSet = ref(new Set<string>())
  const expandedRowKeys = computed(() => [...expandedSet.value])

  watch(getKeyword, () => {
    expandedSet.value = new Set()
  })

  function onExpandChange(id: string) {
    const next = new Set(expandedSet.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expandedSet.value = next
  }

  return { expandedRowKeys, onExpandChange }
}
