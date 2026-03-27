/**
 * 优化师管理 Mock，与 `mock/backend-api` 契约 unwrap 后的 `data` 形态一致。
 */
import { getAppNow } from '@/utils/app-now'
import type { OptimizerItem } from '../types'
import { cloneOptimizerMockList, systemUsers } from './data'

let mockList: OptimizerItem[] = cloneOptimizerMockList()

function overviewFromList(list: OptimizerItem[]): Api.ConfigManagement.Optimizer.OverviewResponse {
  const active = list.filter((i) => i.status === '在职')
  const avgMinConsumption = active.length
    ? Math.round(active.reduce((s, i) => s + i.minConsumption, 0) / active.length)
    : 0
  const monthPrefix = getAppNow().toISOString().slice(0, 7)
  const monthNew = list.filter((i) => i.createTime.startsWith(monthPrefix)).length
  return {
    total: list.length,
    active: active.length,
    avgMinConsumption,
    monthNew
  }
}

function filterTable(
  list: OptimizerItem[],
  params: Api.ConfigManagement.Optimizer.TableQuery
): OptimizerItem[] {
  const kw = (params.keyword ?? '').trim().toLowerCase()
  return list.filter((item) => {
    if (kw && !item.userName.toLowerCase().includes(kw) && !item.sCode.toLowerCase().includes(kw)) {
      return false
    }
    if (params.status && item.status !== params.status) return false
    return true
  })
}

export function mockFetchOptimizerOverview(): Promise<Api.ConfigManagement.Optimizer.OverviewResponse> {
  return Promise.resolve(overviewFromList(mockList))
}

export function mockFetchOptimizerTable(
  params: Api.ConfigManagement.Optimizer.TableQuery
): Promise<Api.Common.PaginatedResponse<Api.ConfigManagement.Optimizer.ListItem>> {
  const filtered = filterTable(mockList, params)
  const start = (params.current - 1) * params.size
  const records = filtered.slice(
    start,
    start + params.size
  ) as Api.ConfigManagement.Optimizer.ListItem[]
  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.current,
    size: params.size
  })
}

export function mockFetchOptimizerMetaSystemUsers(): Promise<
  Api.ConfigManagement.Optimizer.MetaSystemUserItem[]
> {
  return Promise.resolve([...systemUsers])
}

export function mockCreateOptimizer(
  data: Api.ConfigManagement.Optimizer.FormPayload
): Promise<Api.ConfigManagement.Optimizer.ListItem> {
  const u = systemUsers.find((x) => x.id === data.userId)
  if (!u) {
    return Promise.reject(new Error('用户不存在'))
  }
  const maxNo = mockList.reduce((m, i) => Math.max(m, i.no), 0)
  const nowLabel = getAppNow().toISOString().slice(0, 16).replace('T', ' ')
  const item: OptimizerItem = {
    id: `opt-mock-${getAppNow().getTime()}`,
    no: maxNo + 1,
    userId: data.userId,
    userName: u.userName,
    email: u.email,
    avatarColor: u.avatarColor,
    version: data.version,
    sCode: data.sCode,
    sCode2: data.sCode2,
    minConsumption: data.minConsumption,
    checkCode: data.checkCode,
    status: data.status,
    apps: [],
    recentLogs: [{ id: 'log-new', timeLabel: '刚刚', content: '新建优化师' }],
    createTime: getAppNow().toISOString().slice(0, 10),
    lastModifyTime: nowLabel
  }
  mockList = [...mockList, item]
  return Promise.resolve(item as Api.ConfigManagement.Optimizer.ListItem)
}

export function mockUpdateOptimizer(
  data: Api.ConfigManagement.Optimizer.FormPayload & { id: string }
): Promise<Api.ConfigManagement.Optimizer.ListItem> {
  const idx = mockList.findIndex((i) => i.id === data.id)
  if (idx < 0) {
    return Promise.reject(new Error('优化师不存在'))
  }
  const u = systemUsers.find((x) => x.id === data.userId)
  const prev = mockList[idx]
  const nowLabel = getAppNow().toISOString().slice(0, 16).replace('T', ' ')
  const next: OptimizerItem = {
    ...prev,
    userId: data.userId,
    userName: u?.userName ?? prev.userName,
    email: u?.email ?? prev.email,
    avatarColor: u?.avatarColor ?? prev.avatarColor,
    version: data.version,
    sCode: data.sCode,
    sCode2: data.sCode2,
    minConsumption: data.minConsumption,
    checkCode: data.checkCode,
    status: data.status,
    lastModifyTime: nowLabel,
    recentLogs: [
      { id: 'log-upd', timeLabel: '刚刚', content: '更新优化师信息' },
      ...prev.recentLogs.slice(0, 7)
    ]
  }
  mockList = mockList.map((row, i) => (i === idx ? next : row))
  return Promise.resolve(next as Api.ConfigManagement.Optimizer.ListItem)
}

export function mockExportOptimizerList(
  params: Partial<Api.ConfigManagement.Optimizer.TableQuery>
): Promise<Api.ConfigManagement.Optimizer.ExportResponse> {
  void params
  return Promise.resolve({ fileToken: `optimizer-export-${getAppNow().getTime()}` })
}
