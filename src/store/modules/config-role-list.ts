/**
 * 系统配置-角色列表（配置管理 /role 与用户管理等共用）
 * 并发请求合并为同一 Promise；支持强制刷新。
 */

import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { fetchRoleList } from '@/api/config-management/role'

type RoleListItem = Api.SystemManage.RoleListItem

export const useConfigRoleListStore = defineStore('configRoleList', () => {
  const items = shallowRef<RoleListItem[]>([])
  const loading = ref(false)
  let loadPromise: Promise<RoleListItem[]> | null = null

  function reset() {
    items.value = []
    loadPromise = null
    loading.value = false
  }

  /**
   * 拉取角色列表并写入 items。
   * @param options.force 为 true 时忽略缓存重新请求；为 false 且已有数据则直接返回内存数据。
   */
  async function loadRoleList(options?: { force?: boolean }): Promise<RoleListItem[]> {
    const force = options?.force === true
    if (!force && items.value.length > 0) {
      return items.value
    }
    if (loadPromise) {
      return loadPromise
    }

    loading.value = true
    loadPromise = (async () => {
      try {
        const res = await fetchRoleList()
        const next = res.items || []
        items.value = next
        return next
      } catch (e) {
        console.error('[config-role-list] 获取角色列表失败', e)
        return items.value
      } finally {
        loading.value = false
        loadPromise = null
      }
    })()

    return loadPromise
  }

  return { items, loading, loadRoleList, reset }
})
