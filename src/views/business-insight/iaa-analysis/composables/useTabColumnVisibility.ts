import { computed, ref, watch } from 'vue'

export interface VisibleColumnDef {
  key: string
  label: string
  required?: boolean
}

function safeLoad(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === 'string') : []
  } catch {
    return []
  }
}

/**
 * IAA tab 表格：自定义列显示（localStorage 持久化）
 *
 * - required 列强制显示，不可取消
 * - checkedKeys 用于 Dialog 临时勾选
 * - visibleKeys 作为最终生效列集合
 */
export function useTabColumnVisibility(storageKey: string, allColumns: VisibleColumnDef[]) {
  const requiredKeys = allColumns.filter((c) => c.required).map((c) => c.key)
  const allKeys = allColumns.map((c) => c.key)

  function load(): string[] {
    const parsed = safeLoad(storageKey)
    const set = new Set(parsed)
    const keys = allKeys.filter((k) => set.has(k))
    const merged = [...new Set([...requiredKeys, ...keys])]
    return merged.length ? merged : [...requiredKeys, ...allKeys]
  }

  const visibleKeys = ref<string[]>(load())
  const checkedKeys = ref<string[]>([])
  const dialogVisible = ref(false)

  watch(visibleKeys, (val) => localStorage.setItem(storageKey, JSON.stringify(val)), { deep: true })

  function isVisible(key: string) {
    return visibleKeys.value.includes(key)
  }

  const selectableColumns = computed(() => allColumns.filter((c) => !c.required))

  function openDialog() {
    checkedKeys.value = [...visibleKeys.value]
    dialogVisible.value = true
  }

  function resetDialog() {
    checkedKeys.value = [...requiredKeys, ...allKeys]
  }

  function confirmDialog() {
    const set = new Set([...requiredKeys, ...checkedKeys.value])
    visibleKeys.value = allKeys.filter((k) => set.has(k))
    dialogVisible.value = false
  }

  return {
    requiredKeys,
    allKeys,
    visibleKeys,
    checkedKeys,
    dialogVisible,
    selectableColumns,
    isVisible,
    openDialog,
    resetDialog,
    confirmDialog
  }
}
