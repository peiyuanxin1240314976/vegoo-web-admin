/**
 * 应用分配接口 Mock，与 `mock/backend-api` 契约 sample 形态一致（unwrap 后的 data；export 为本地 blob 模拟）。
 */
import FileSaver from 'file-saver'
import { getAppNow, getAppTodayYYYYMMDD } from '@/utils/app-now'
import type {
  AppAssignableAppMetaItem,
  AppAssignmentMetaAssignableAppsResponse,
  AppAssignmentItem,
  AppAssignmentMetaFilterResponse,
  AppAssignmentMetaVersionsResponse,
  AppAssignmentOverviewResponse,
  AssignmentCreatePayload,
  AssignmentTableQuery,
  AssignmentUpdatePayload
} from '../types'
import {
  appOptions,
  assignmentAdPlatformLabel,
  assignmentMockList,
  optimizerOptions,
  versionsByApp
} from './data'

function matchKeyword(item: AppAssignmentItem, kw: string) {
  if (!kw) return true
  const k = kw.toLowerCase()
  return item.appName.toLowerCase().includes(k) || item.optimizer.toLowerCase().includes(k)
}

function filterAssignments(q: AssignmentTableQuery): AppAssignmentItem[] {
  return assignmentMockList.filter((item) => {
    if (!matchKeyword(item, q.keyword ?? '')) return false
    if (q.platform && item.platform !== q.platform) return false
    if (q.source && item.source !== q.source) return false
    if (q.optimizer && item.optimizer !== q.optimizer) return false
    if (q.status && item.status !== q.status) return false
    return true
  })
}

export function mockFetchAppAssignmentOverview(): Promise<AppAssignmentOverviewResponse> {
  const list = assignmentMockList
  const active = list.filter((i) => i.status === '活跃').length
  const optimizerCount = new Set(list.map((i) => i.optimizer)).size
  return Promise.resolve({
    total: list.length,
    active,
    unassigned: 6,
    optimizerCount
  })
}

export function mockFetchAppAssignmentMetaFilterOptions(): Promise<AppAssignmentMetaFilterResponse> {
  return Promise.resolve({
    optimizerOptions
  })
}

export function mockFetchAppAssignmentMetaAssignableApps(): Promise<AppAssignmentMetaAssignableAppsResponse> {
  const apps: AppAssignableAppMetaItem[] = appOptions.map((o) => ({
    appId: o.value,
    appName: o.appName,
    iconColor: o.iconColor,
    platform: 'Android'
  }))
  return Promise.resolve({ apps })
}

export function mockFetchAppAssignmentMetaPerformanceVersions(body: {
  appId: string
}): Promise<AppAssignmentMetaVersionsResponse> {
  const versions = versionsByApp[body.appId] ?? []
  return Promise.resolve({ versions })
}

export function mockFetchAppAssignmentTable(
  params: AssignmentTableQuery
): Promise<Api.Common.PaginatedResponse<AppAssignmentItem>> {
  const filtered = filterAssignments(params)
  const start = (params.current - 1) * params.size
  const records = filtered.slice(start, start + params.size)
  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.current,
    size: params.size
  })
}

export function mockFetchAppAssignmentDetail(body: {
  id: string
}): Promise<AppAssignmentItem | null> {
  const row = assignmentMockList.find((i) => i.id === body.id) ?? null
  return Promise.resolve(row ? structuredClone(row) : null)
}

function labelForVersion(versionId: string, versions: AppAssignmentItem['availableVersions']) {
  const v = versions.find((x) => x.id === versionId)
  if (!v) return `${versionId}`
  return `${v.version} ${v.status === '已发布' ? '已发布' : v.status === '草稿' ? '草稿' : '已归档'}`
}

export function mockCreateAppAssignment(data: AssignmentCreatePayload): Promise<AppAssignmentItem> {
  const versions = versionsByApp[data.appId] ?? []
  const appMeta = appOptions.find((o) => o.value === data.appId)
  const now = getAppTodayYYYYMMDD()
  const item: AppAssignmentItem = {
    id: `asgn-${Date.now()}`,
    appName: appMeta?.appName ?? 'MockApp',
    appId: data.appId,
    iconColor: appMeta?.iconColor ?? '#3b82f6',
    platform: data.platform,
    source: data.source,
    adPlatform: assignmentAdPlatformLabel(data.source),
    optimizer: data.optimizer,
    configVersionId: data.configVersionId,
    configVersionLabel: labelForVersion(data.configVersionId, versions),
    assignTime: now,
    effectiveTime: now,
    status: '活跃',
    operator: '当前用户',
    note: data.note,
    availableVersions: structuredClone(versions),
    changeLogs: [
      {
        id: 'log-mock-1',
        time: `${now} 10:00:00`,
        type: '初始分配',
        operator: '当前用户',
        content: `初始分配：应用 ${appMeta?.appName ?? data.appId}-${data.platform}-${assignmentAdPlatformLabel(data.source)} 分配给 ${data.optimizer}`,
        note: data.changeReason || '-',
        status: '有效'
      }
    ]
  }
  assignmentMockList.unshift(item)
  return Promise.resolve(item)
}

export function mockUpdateAppAssignment(data: AssignmentUpdatePayload): Promise<AppAssignmentItem> {
  const prev = assignmentMockList.find((i) => i.id === data.id)
  if (!prev) {
    return Promise.reject(new Error('分配记录不存在'))
  }
  const versions = structuredClone(prev.availableVersions)
  const next: AppAssignmentItem = {
    ...prev,
    source: data.source,
    adPlatform: assignmentAdPlatformLabel(data.source),
    optimizer: data.optimizer,
    note: data.note,
    configVersionId: data.configVersionId,
    configVersionLabel: labelForVersion(data.configVersionId, versions),
    operator: '当前用户',
    changeLogs: [
      {
        id: 'log-mock-upd',
        time: `${getAppTodayYYYYMMDD()} 11:00:00`,
        type: '配置变更',
        operator: '当前用户',
        content: '由 Mock 更新：绩效版本/优化师/备注等',
        note: data.changeReason,
        status: '有效'
      },
      ...prev.changeLogs
    ],
    availableVersions: versions
  }
  const idx = assignmentMockList.findIndex((i) => i.id === data.id)
  if (idx >= 0) assignmentMockList[idx] = next
  return Promise.resolve(next)
}

function csvCell(value: string) {
  if (/[,"\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** Mock：生成与列表筛选一致的 CSV 并触发下载（模拟文件流） */
export async function mockExportAppAssignmentList(
  params: Partial<AssignmentTableQuery>
): Promise<void> {
  const q: AssignmentTableQuery = {
    keyword: params.keyword ?? '',
    platform: params.platform ?? '',
    source: params.source ?? '',
    optimizer: params.optimizer ?? '',
    status: params.status ?? '',
    current: 1,
    size: 10000
  }
  const rows = filterAssignments(q)
  const header = '应用名称,应用ID,平台,广告平台编码,广告平台,优化师,状态,分配时间'
  const lines = [
    '\uFEFF' + header,
    ...rows.map((r) =>
      [r.appName, r.appId, r.platform, r.source, r.adPlatform, r.optimizer, r.status, r.assignTime]
        .map((c) => csvCell(String(c)))
        .join(',')
    )
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  FileSaver.saveAs(blob, `app-assignment-mock_${getAppNow().getTime()}.csv`)
}
