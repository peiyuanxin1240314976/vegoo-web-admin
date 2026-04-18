/**
 * 公用 cockpit 顶栏筛选项：浏览器 sessionStorage 缓存（同标签页登录会话内复用，关闭标签即失效）
 */

import type { CockpitMetaFilterOptionsData } from '@/types/cockpit-meta-filter'

const SESSION_KEY = 'vegoo-session-cockpit-meta-filter-v3'

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x)
}

function isOptionList(x: unknown): boolean {
  if (!Array.isArray(x)) return false
  return x.every(
    (it) => isRecord(it) && typeof it.label === 'string' && typeof it.value === 'string'
  )
}

function isSettingAppList(x: unknown): boolean {
  if (!Array.isArray(x)) return false
  return x.every(
    (it) =>
      isRecord(it) &&
      typeof it.sAppId === 'string' &&
      (typeof it.nPlatform === 'string' || typeof it.nPlatform === 'number') &&
      typeof it.platformName === 'string' &&
      typeof it.sAppName === 'string' &&
      typeof it.sAppShortName === 'string' &&
      (typeof it.nCategory === 'string' || typeof it.nCategory === 'number') &&
      typeof it.categoryName === 'string'
  )
}

export function isCockpitMetaFilterPayload(x: unknown): x is CockpitMetaFilterOptionsData {
  if (!isRecord(x)) return false
  return (
    isOptionList(x.appOptions) &&
    isOptionList(x.platformOptions) &&
    isOptionList(x.sourceOptions) &&
    isOptionList(x.accountOptions) &&
    isOptionList(x.countryOptions) &&
    isSettingAppList(x.settingApps)
  )
}

export function readCockpitMetaFilterFromSession(): CockpitMetaFilterOptionsData | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isCockpitMetaFilterPayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeCockpitMetaFilterToSession(data: CockpitMetaFilterOptionsData): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
  } catch {
    /* 配额满等：忽略，内存态仍可用 */
  }
}

export function clearCockpitMetaFilterSession(): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
