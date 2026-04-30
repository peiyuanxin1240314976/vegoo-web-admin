import { cloneAppDate } from '@/utils/app-now'

export type DateShortcutItem = {
  text: string
  value: () => Date | [Date, Date]
}

/** 与角色管理 / 用户信息契约一致：无权限配置时不做运行时限制 */
export function resolveEffectiveDateScope(
  info: Partial<Api.Auth.UserInfo> | undefined | null,
  pageKey: string | undefined,
  opts: { apply: boolean }
): Api.Auth.DateScopeConfig | null {
  if (!opts.apply) return null
  if (!info?.permissionConfig?.datePermissions) return null
  if (info.roles?.includes('SuperAdmin')) return null

  const { defaultDateScope, pageDateScopes } = info.permissionConfig.datePermissions
  if (!defaultDateScope) return null

  if (pageKey && pageDateScopes?.length) {
    const hit = pageDateScopes.find((p) => p.pageKey === pageKey)
    if (hit) {
      const { pageKey, ...scope } = hit
      void pageKey
      return scope
    }
  }
  return { ...defaultDateScope }
}

function startOfDay(d: Date): Date {
  const x = cloneAppDate(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date): Date {
  const x = cloneAppDate(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/** 自然日 inclusive 天数（与本地时区日历对齐） */
export function inclusiveLocalDayCount(a: Date, b: Date): number {
  const s = startOfDay(a).getTime()
  const e = startOfDay(b).getTime()
  return Math.floor((e - s) / 86400000) + 1
}

function minSelectableDay(now: Date, maxHistoryDays: number): Date {
  const t = cloneAppDate(now)
  t.setDate(t.getDate() - maxHistoryDays)
  return startOfDay(t)
}

export function buildPermissionDisabledDate(
  scope: Api.Auth.DateScopeConfig,
  now: Date,
  chain?: (date: Date) => boolean
): (date: Date) => boolean {
  const min =
    typeof scope.maxHistoryDays === 'number' && scope.maxHistoryDays >= 0
      ? minSelectableDay(now, scope.maxHistoryDays)
      : null
  const max = endOfDay(now)

  return (date: Date) => {
    if (chain?.(date)) return true
    const t = date.getTime()
    if (t > max.getTime()) return true
    if (min && startOfDay(date).getTime() < min.getTime()) return true
    return false
  }
}

export function makeFixedRangeShortcut(
  scope: Api.Auth.DateScopeConfig,
  now: Date
): DateShortcutItem {
  return {
    text: `近${scope.defaultRangeDays}天`,
    value: () => {
      const end = cloneAppDate(now)
      const start = cloneAppDate(end)
      start.setDate(start.getDate() - (scope.defaultRangeDays - 1))
      return [start, end]
    }
  }
}

/** 过滤范围类 shortcuts：落在 [min,max] 内；若不允许自定义，仅保留跨度等于 defaultRangeDays 的项 */
export function filterDateRangeShortcutsForScope(
  shortcuts: readonly DateShortcutItem[],
  scope: Api.Auth.DateScopeConfig,
  now: Date
): DateShortcutItem[] {
  const min =
    typeof scope.maxHistoryDays === 'number' && scope.maxHistoryDays >= 0
      ? minSelectableDay(now, scope.maxHistoryDays)
      : null
  const max = endOfDay(now)

  return shortcuts.filter((s) => {
    const raw = s.value()
    if (!Array.isArray(raw)) return false
    const [a, b] = raw
    if (startOfDay(a).getTime() < (min?.getTime() ?? -Infinity)) return false
    if (endOfDay(b).getTime() > max.getTime()) return false
    if (!scope.allowCustomRange) {
      const days = inclusiveLocalDayCount(a, b)
      if (days !== scope.defaultRangeDays) return false
    }
    return true
  })
}

/** 不允许自定义且过滤后无快捷项时，补一条与 defaultRangeDays 一致的快捷项，避免侧栏空白 */
export function ensureRangeShortcutsForStrictMode(
  filtered: DateShortcutItem[],
  scope: Api.Auth.DateScopeConfig,
  now: Date
): DateShortcutItem[] {
  if (filtered.length > 0) return filtered
  if (!scope.allowCustomRange) return [makeFixedRangeShortcut(scope, now)]
  return filtered
}
