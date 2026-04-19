import type { CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
import { readCockpitMetaFilterFromSession } from '@/utils/cockpit-meta-filter-session'

export interface RequestAppItem {
  appId: string
  platform: number
}

function normalizeSelectedAppIds(selected: string | string[] | undefined | null): string[] {
  if (Array.isArray(selected)) {
    const out: string[] = []
    const seen = new Set<string>()
    for (const item of selected) {
      const id = String(item ?? '').trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
    return out
  }
  const id = typeof selected === 'string' ? selected.trim() : ''
  return id ? [id] : []
}

function resolveSettingApps(settingApps?: CockpitSettingAppItem[] | null): CockpitSettingAppItem[] {
  if (Array.isArray(settingApps)) return settingApps
  return readCockpitMetaFilterFromSession()?.settingApps ?? []
}

function toPlatformNumber(value: number | string): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : null
}

export function toAppIdsRequestBody(selectedAppId: string | string[] | undefined | null): string[] {
  return normalizeSelectedAppIds(selectedAppId)
}

export function toAppsRequestBody(
  selectedAppId: string | string[] | undefined | null,
  settingApps?: CockpitSettingAppItem[] | null
): RequestAppItem[] {
  const appIds = normalizeSelectedAppIds(selectedAppId)
  if (appIds.length === 0) return []

  const apps = resolveSettingApps(settingApps)
  return appIds
    .map((appId) => {
      const matched = apps.find((item) => String(item.sAppId ?? '').trim() === appId)
      if (!matched) return null
      const platform = toPlatformNumber(matched.nPlatform)
      if (platform == null) return null
      return { appId, platform }
    })
    .filter((item): item is RequestAppItem => item !== null)
}

export function buildAppSelectionRequestBody(
  selectedAppId: string | string[] | undefined | null,
  settingApps?: CockpitSettingAppItem[] | null
): {
  appIds: string[]
  apps: RequestAppItem[]
} {
  const appIds = normalizeSelectedAppIds(selectedAppId)
  return {
    appIds,
    apps: toAppsRequestBody(appIds, settingApps)
  }
}
