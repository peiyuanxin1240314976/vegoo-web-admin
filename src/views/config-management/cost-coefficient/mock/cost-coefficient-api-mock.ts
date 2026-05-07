/**
 * 成本系数 Mock，与契约及 `Api.Common.PaginatedResponse` 一致。
 */
import { getAppNow } from '@/utils/app-now'
import type {
  CostCoefficientFormModel,
  CostCoefficientItem,
  CostCoefficientOverviewKpi,
  CostCoefficientQuery
} from '../types'
import { cloneCostList, getHistory, getPlatform } from './data'

let mockList: CostCoefficientItem[] = cloneCostList()

function filterRows(params: CostCoefficientQuery): CostCoefficientItem[] {
  return mockList.filter((row) => {
    if (row.isDeleted) return false
    if (params.nSource != null && params.nSource !== '' && row.nSource !== params.nSource) {
      return false
    }
    if (params.tStartYear && !row.tstart.startsWith(String(params.tStartYear))) return false
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      if (
        !row.platformName.toLowerCase().includes(kw) &&
        !row.tstart.includes(kw) &&
        !row.updatedBy.toLowerCase().includes(kw)
      ) {
        return false
      }
    }
    return true
  })
}

export function mockFetchCostCoefficientTable(
  params: CostCoefficientQuery
): Promise<Api.Common.PaginatedResponse<CostCoefficientItem>> {
  const filtered = filterRows(params)
  const start = (params.page - 1) * params.pageSize
  const records = filtered.slice(start, start + params.pageSize).map((r) => ({ ...r }))
  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.page,
    size: params.pageSize
  })
}

export function mockFetchCostCoefficientOverviewKpi(
  params: Partial<CostCoefficientQuery>
): Promise<CostCoefficientOverviewKpi> {
  const filtered = filterRows({
    nSource: params.nSource,
    tStartYear: params.tStartYear,
    keyword: params.keyword,
    page: 1,
    pageSize: 100000
  })
  const today = getAppNow().toISOString().slice(0, 10)
  const monthPrefix = today.slice(0, 7)
  return Promise.resolve({
    total: filtered.length,
    active: filtered.filter((row) => row.tstart <= today).length,
    platforms: new Set(filtered.map((row) => row.nSource)).size,
    monthChanges: filtered.filter((row) => row.updatedAt.startsWith(monthPrefix)).length
  })
}

export function mockCreateCostCoefficient(
  data: CostCoefficientFormModel
): Promise<CostCoefficientItem> {
  const now = getAppNow()
  const pad = (n: number) => String(n).padStart(2, '0')
  const timeStr =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}`
  const platform = getPlatform(data.nSource ?? 1)
  const item: CostCoefficientItem = {
    id: `mock-${getAppNow().getTime()}`,
    nSource: data.nSource ?? 1,
    platformName: platform.name,
    tstart: data.tstart,
    dcostRatio: Number(data.dcostRatio),
    dinstallCost: Number(data.dinstallCost),
    remark: data.remark,
    updatedAt: timeStr,
    updatedBy: 'admin',
    isDeleted: false
  }
  mockList = [item, ...mockList]
  return Promise.resolve({ ...item })
}

export function mockUpdateCostCoefficient(
  id: string,
  data: Partial<CostCoefficientFormModel>
): Promise<unknown> {
  const idx = mockList.findIndex((r) => r.id === id)
  if (idx < 0) return Promise.reject(new Error('不存在'))
  const now = getAppNow()
  const pad = (n: number) => String(n).padStart(2, '0')
  const timeStr =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}`
  const prev = mockList[idx]
  mockList = mockList.slice()
  mockList[idx] = {
    ...prev,
    tstart: data.tstart ?? prev.tstart,
    dcostRatio:
      data.dcostRatio !== undefined && data.dcostRatio !== ''
        ? Number(data.dcostRatio)
        : prev.dcostRatio,
    dinstallCost:
      data.dinstallCost !== undefined && data.dinstallCost !== ''
        ? Number(data.dinstallCost)
        : prev.dinstallCost,
    remark: data.remark ?? prev.remark,
    updatedAt: timeStr,
    updatedBy: 'admin'
  }
  return Promise.resolve({})
}

export function mockDeleteCostCoefficient(id: string): Promise<unknown> {
  mockList = mockList.map((r) => (r.id === id ? { ...r, isDeleted: true } : r))
  return Promise.resolve({})
}

export function mockFetchCostCoefficientHistory(id: string): Promise<unknown> {
  return Promise.resolve(getHistory(id))
}
