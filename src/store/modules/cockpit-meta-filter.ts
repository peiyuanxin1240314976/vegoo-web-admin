/**
 * 公用 cockpit 顶栏 meta-filter-options：内存 + sessionStorage。
 * 业务页 **直接读 `data`**；`ensureLoaded` 由路由守卫或兜底调用，非常规页面入口。
 */

import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { fetchCockpitMetaFilterOptions } from '@/api/cockpit-meta-filter'
import type { CockpitMetaFilterOptionsData } from '@/types/cockpit-meta-filter'
import {
  clearCockpitMetaFilterSession,
  readCockpitMetaFilterFromSession,
  writeCockpitMetaFilterToSession
} from '@/utils/cockpit-meta-filter-session'

export const useCockpitMetaFilterStore = defineStore('cockpitMetaFilter', () => {
  const data = shallowRef<CockpitMetaFilterOptionsData | null>(null)
  let loadPromise: Promise<CockpitMetaFilterOptionsData | null> | null = null

  function reset() {
    data.value = null
    loadPromise = null
    clearCockpitMetaFilterSession()
  }

  /**
   * 优先内存 → sessionStorage → 网络；并发合并为同一 Promise
   * @returns 失败时返回 null（不抛），便于路由初始化不因该接口阻断
   */
  async function ensureLoaded(): Promise<CockpitMetaFilterOptionsData | null> {
    if (data.value) return data.value
    const cached = readCockpitMetaFilterFromSession()
    if (cached) {
      data.value = cached
      return cached
    }
    if (loadPromise) return loadPromise
    loadPromise = (async () => {
      try {
        const res = await fetchCockpitMetaFilterOptions()
        data.value = res
        writeCockpitMetaFilterToSession(res)
        return res
      } catch (e) {
        console.warn('[cockpit-meta-filter] 拉取 meta-filter-options 失败', e)
        return null
      } finally {
        loadPromise = null
      }
    })()
    return loadPromise
  }

  return { data, ensureLoaded, reset }
})
