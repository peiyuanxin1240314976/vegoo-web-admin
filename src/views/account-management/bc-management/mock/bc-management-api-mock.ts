import type {
  BcFormModel,
  BcItem,
  BcTableQuery
} from '@/views/config-management/account-management/types'
import {
  bcBanRecordOptions,
  bcOwnerTypeOptions,
  bcStatusOptions,
  cloneBcManagementMockList
} from './data'

let bcState: BcItem[] = cloneBcManagementMockList()

function filterRows(rows: BcItem[], params: BcTableQuery) {
  const keyword = (params.keyword ?? '').toLowerCase().trim()
  return rows.filter((item) => {
    if (
      keyword &&
      !item.id.toLowerCase().includes(keyword) &&
      !item.bmName.toLowerCase().includes(keyword) &&
      !item.bmId.toLowerCase().includes(keyword)
    ) {
      return false
    }
    if (params.source && item.source !== params.source) return false
    if (params.status && item.status !== params.status) return false
    if (params.ownerType && item.ownerType !== params.ownerType) return false
    if (params.banRecord && item.banRecord !== params.banRecord) return false
    return true
  })
}

export async function mockFetchBcTable(params: BcTableQuery) {
  const current = params.current || 1
  const size = params.size || 10
  const filtered = filterRows(bcState, params)
  const start = (current - 1) * size
  return {
    records: filtered.slice(start, start + size).map((i) => ({ ...i })),
    total: filtered.length,
    current,
    size
  }
}

export async function mockFetchBcFilterOptions() {
  return {
    statusOptions: bcStatusOptions.map((i) => ({ ...i })),
    ownerTypeOptions: bcOwnerTypeOptions.map((i) => ({ ...i })),
    banRecordOptions: bcBanRecordOptions.map((i) => ({ ...i }))
  }
}

export async function mockCreateBc(data: BcFormModel) {
  const nextId = `BM-${String(101 + bcState.length).padStart(3, '0')}`
  const next: BcItem = {
    id: nextId,
    bmId: data.bmId,
    bmName: data.bmName,
    source: data.source as BcItem['source'],
    group: data.group,
    status: data.status,
    ownerType: data.ownerType,
    manager: data.manager,
    banRecord: data.banRecord,
    banDesc: data.banDesc,
    createTime: '2026-04-08',
    remark: data.remark,
    linkedAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    monthSpend: 0,
    monthOpenCount: 0
  }
  bcState = [next, ...bcState]
  return { ...next }
}

export async function mockUpdateBc(id: string, data: Partial<BcFormModel>) {
  const idx = bcState.findIndex((i) => i.id === id)
  if (idx < 0) throw new Error('BC 不存在')
  const { source, ...rest } = data
  bcState[idx] = {
    ...bcState[idx],
    ...rest,
    ...(source ? { source } : {})
  }
  return { ...bcState[idx] }
}

export async function mockDeleteBc(id: string) {
  bcState = bcState.filter((i) => i.id !== id)
  return { success: true }
}

export async function mockExportBcList() {
  return {
    taskId: 'bc_export_20260408_001',
    downloadUrl: 'https://mock.vegoo.com/export/bc/bc_export_20260408_001.xlsx'
  }
}
