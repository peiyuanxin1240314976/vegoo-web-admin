/**
 * 应用管理 Mock，与 `mock/backend-api` 契约及 `Api.Common.PaginatedResponse` 一致。
 */
import { getAppNow } from '@/utils/app-now'
import type { ApplicationAppItem, ApplicationFormPayload, ApplicationTableQuery } from '../types'
import { deriveIconColorFromId } from '../types'
import { cloneApplicationMockList } from './data'

let mockList: ApplicationAppItem[] = cloneApplicationMockList()

function filterApps(
  list: ApplicationAppItem[],
  params: ApplicationTableQuery
): ApplicationAppItem[] {
  const kw = (params.keyword ?? '').trim().toLowerCase()
  return list.filter((item) => {
    if (kw && !item.id.toLowerCase().includes(kw) && !item.appName.toLowerCase().includes(kw)) {
      return false
    }
    if (params.category && item.category !== params.category) return false
    if (params.platform && item.platform !== params.platform) return false
    if (params.status && item.status !== params.status) return false
    if (params.creator && item.creator !== params.creator) return false
    return true
  })
}

export function mockFetchApplicationTable(
  params: ApplicationTableQuery
): Promise<Api.Common.PaginatedResponse<ApplicationAppItem>> {
  const filtered = filterApps(mockList, params)
  const start = (params.current - 1) * params.size
  const records = filtered.slice(start, start + params.size).map((r) => ({ ...r }))
  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.current,
    size: params.size
  })
}

export function mockCreateApplication(data: ApplicationFormPayload): Promise<ApplicationAppItem> {
  if (mockList.some((a) => a.id === data.id)) {
    return Promise.reject(new Error('应用 ID 已存在'))
  }
  const dateStr = getAppNow().toISOString().slice(0, 10)
  const item: ApplicationAppItem = {
    ...data,
    iconColor: data.iconColor ?? deriveIconColorFromId(data.id),
    packageId: data.packageId ?? data.bundleId,
    shortName: data.shortName ?? '',
    timezone: data.timezone ?? 'PST',
    priority: data.priority ?? 1,
    status: data.status ?? '正常',
    creator: data.creator ?? '系统',
    createTime: dateStr,
    lastModifier: data.creator ?? '系统',
    lastModifyTime: getAppNow().toISOString().slice(0, 19).replace('T', ' ')
  }
  mockList = [item, ...mockList]
  return Promise.resolve({ ...item })
}

export function mockUpdateApplication(data: ApplicationFormPayload): Promise<ApplicationAppItem> {
  if (!data.id) {
    return Promise.reject(new Error('缺少应用 id'))
  }
  const idx = mockList.findIndex((a) => a.id === data.id)
  if (idx < 0) {
    return Promise.reject(new Error('应用不存在'))
  }
  const prev = mockList[idx]
  const now = getAppNow().toISOString().slice(0, 19).replace('T', ' ')
  const next: ApplicationAppItem = {
    ...prev,
    ...data,
    iconColor: data.iconColor ?? prev.iconColor,
    packageId: data.packageId ?? data.bundleId ?? prev.packageId,
    lastModifier: data.lastModifier ?? prev.lastModifier,
    lastModifyTime: now
  }
  mockList = mockList.slice()
  mockList[idx] = next
  return Promise.resolve({ ...next })
}

export function mockDeleteApplication(id: string): Promise<unknown> {
  const idx = mockList.findIndex((a) => a.id === id)
  if (idx < 0) {
    return Promise.reject(new Error('应用不存在'))
  }
  mockList = mockList.filter((a) => a.id !== id)
  return Promise.resolve({})
}

export function mockExportApplicationList(
  params: Partial<ApplicationTableQuery>
): Promise<{ downloadUrl: string; fileName: string }> {
  void params
  return Promise.resolve({
    downloadUrl: 'https://example.com/exports/applications-mock.xlsx',
    fileName: `applications-${getAppNow().getTime()}.xlsx`
  })
}
