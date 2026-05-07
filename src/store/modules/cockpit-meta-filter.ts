/**
 * 公用 cockpit 顶栏 meta-filter-options：内存 + sessionStorage。
 * 业务页 **直接读 `data`**；`ensureLoaded` 由路由守卫或兜底调用，非常规页面入口。
 */

import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { fetchCockpitMetaFilterOptions } from '@/api/cockpit-meta-filter'
import type {
  CockpitMetaFilterOptionsData,
  CockpitSettingAppItem
} from '@/types/cockpit-meta-filter'
import {
  clearCockpitMetaFilterSession,
  readCockpitMetaFilterFromSession,
  writeCockpitMetaFilterToSession
} from '@/utils/cockpit-meta-filter-session'

type RawOption = Record<string, unknown> | string | number | null | undefined

function toStringValue(input: unknown): string {
  if (typeof input === 'string') return input.trim()
  if (typeof input === 'number') return String(input)
  return ''
}

function normalizeOptionList(
  raw: unknown,
  valueKeys: string[],
  labelKeys: string[]
): CockpitMetaFilterOptionsData['appOptions'] {
  if (!Array.isArray(raw)) return []
  const result: CockpitMetaFilterOptionsData['appOptions'] = []
  const used = new Set<string>()

  for (const item of raw as RawOption[]) {
    if (typeof item === 'string' || typeof item === 'number') {
      const text = toStringValue(item)
      if (!text || used.has(text)) continue
      result.push({ label: text, value: text })
      used.add(text)
      continue
    }
    if (!item || typeof item !== 'object') continue

    let value = ''
    let label = ''

    for (const key of valueKeys) {
      value = toStringValue(item[key])
      if (value) break
    }
    for (const key of labelKeys) {
      label = toStringValue(item[key])
      if (label) break
    }

    if (!value && label) value = label
    if (!label && value) label = value
    if (!value || used.has(value)) continue

    result.push({ label, value })
    used.add(value)
  }

  return result
}

function normalizeSettingApps(raw: unknown): CockpitSettingAppItem[] {
  if (!Array.isArray(raw)) return []
  const result: CockpitSettingAppItem[] = []
  const used = new Set<string>()

  for (const item of raw as RawOption[]) {
    if (!item || typeof item !== 'object') continue

    const sAppUUId = toStringValue(item.sAppUUId ?? item.sAppUuid ?? item.appUuid ?? item.uuid)
    const sAppId = toStringValue(item.sAppId ?? item.appId ?? item.value ?? item.id)
    const sAppStoreId = toStringValue(item.sAppStoreId ?? item.appStoreId ?? item.storeId)
    const platformName = toStringValue(item.platformName ?? item.platform_label ?? item.platform)
    const sAppName = toStringValue(item.sAppName ?? item.appName ?? item.label ?? item.name)
    const sAppShortName = toStringValue(item.sAppShortName ?? item.appShortName ?? item.shortName)
    const categoryName = toStringValue(item.categoryName ?? item.category_label ?? item.category)
    const nPlatformRaw = item.nPlatform ?? item.platformCode ?? item.platform_value ?? ''
    const nCategoryRaw = item.nCategory ?? item.categoryId ?? item.category_value ?? ''
    const nPlatform =
      typeof nPlatformRaw === 'number' || typeof nPlatformRaw === 'string' ? nPlatformRaw : ''
    const nCategory =
      typeof nCategoryRaw === 'number' || typeof nCategoryRaw === 'string' ? nCategoryRaw : ''
    const uniqueKey = `${sAppId}__${String(nPlatform)}`

    if (!sAppId || used.has(uniqueKey)) continue

    result.push({
      sAppUUId,
      sAppId,
      sAppStoreId,
      nPlatform,
      platformName,
      sAppName,
      sAppShortName,
      nCategory,
      categoryName
    })
    used.add(uniqueKey)
  }

  return result
}

function normalizeCockpitMetaPayload(raw: unknown): CockpitMetaFilterOptionsData {
  const payload = (raw ?? {}) as Record<string, unknown>
  return {
    appOptions: normalizeOptionList(
      payload.appOptions ?? payload.settingApps,
      ['value', 'appId', 'sAppId', 'id'],
      ['label', 'appName', 'sAppName', 'name']
    ),
    platformOptions: normalizeOptionList(
      payload.platformOptions,
      ['value', 'platform', 'id'],
      ['label', 'platformName', 'name']
    ),
    sourceOptions: normalizeOptionList(
      payload.sourceOptions,
      ['value', 'source', 'id'],
      ['label', 'sourceName', 'name']
    ),
    accountOptions: normalizeOptionList(
      payload.accountOptions,
      ['value', 'ownerId', 'accountId', 'id'],
      ['label', 'accountName', 'name']
    ),
    countryOptions: normalizeOptionList(
      payload.countryOptions,
      ['value', 'countryCode', 'id'],
      ['label', 'countryName', 'name']
    ),
    settingApps: normalizeSettingApps(payload.settingApps)
  }
}

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
        const normalized = normalizeCockpitMetaPayload(res)
        data.value = normalized
        writeCockpitMetaFilterToSession(normalized)
        return normalized
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
