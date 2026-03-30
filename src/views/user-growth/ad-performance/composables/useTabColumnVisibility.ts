import { computed, ref, watch } from 'vue'

export interface TabColumnDef {
  key: string
  label: string
  required?: boolean
}

/**
 * 管理表格自定义列可见性（localStorage 持久化 + 弹窗状态）。
 * 供 4 个 Tab 组件复用，消除重复样板代码。
 */
export function useTabColumnVisibility(storageKey: string, allColumns: readonly TabColumnDef[]) {
  const requiredKeys = allColumns.filter((c) => c.required).map((c) => c.key)
  const allKeys = allColumns.map((c) => c.key)

  function load(): string[] {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return [...allKeys]
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return [...allKeys]
      const set = new Set(parsed.filter((k) => typeof k === 'string') as string[])
      const keys = allKeys.filter((k) => set.has(k))
      for (const k of requiredKeys) {
        if (!keys.includes(k)) keys.unshift(k)
      }
      return keys
    } catch {
      return [...allKeys]
    }
  }

  const visibleKeys = ref<string[]>(load())

  watch(visibleKeys, (val) => localStorage.setItem(storageKey, JSON.stringify(val)), { deep: true })

  /** 判断某列是否可见（供模板 v-if 使用） */
  function isVisible(key: string): boolean {
    return visibleKeys.value.includes(key)
  }

  // --- 自定义列弹窗 ---
  const dialogVisible = ref(false)
  const checkedKeys = ref<string[]>([])

  const allChecked = computed({
    get: () => checkedKeys.value.length === allColumns.length,
    set: (val: boolean) => {
      checkedKeys.value = val ? [...allKeys] : [...requiredKeys]
    }
  })

  const indeterminate = computed(() => {
    const len = checkedKeys.value.length
    return len > 0 && len < allColumns.length
  })

  function openDialog() {
    checkedKeys.value = [...visibleKeys.value]
    dialogVisible.value = true
  }

  function resetDialog() {
    checkedKeys.value = [...allKeys]
  }

  function confirmDialog() {
    const set = new Set(checkedKeys.value)
    for (const k of requiredKeys) set.add(k)
    visibleKeys.value = allKeys.filter((k) => set.has(k))
    dialogVisible.value = false
  }

  return {
    allColumns,
    isVisible,
    dialogVisible,
    checkedKeys,
    allChecked,
    indeterminate,
    openDialog,
    resetDialog,
    confirmDialog
  }
}
