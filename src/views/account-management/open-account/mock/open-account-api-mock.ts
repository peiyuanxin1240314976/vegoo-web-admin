import type {
  OpenAccountFormModel,
  OpenAccountItem,
  OpenAccountTableQuery
} from '@/views/config-management/account-management/types'
import { cloneOpenAccountLocalMock, openAccountAgencyOptions } from './data'

let openAccountState: OpenAccountItem[] = cloneOpenAccountLocalMock()

type FeishuConfig = { enabled: boolean; webhook?: string; mentionAll?: boolean }
let feishuConfigState: FeishuConfig = {
  enabled: true,
  webhook: 'https://open.feishu.cn/open-apis/bot/v2/hook/abcdefg',
  mentionAll: false
}

function applyTableFilters(rows: OpenAccountItem[], params: OpenAccountTableQuery) {
  const keyword = (params.keyword ?? '').trim().toLowerCase()
  return rows.filter((item) => {
    if (
      keyword &&
      !item.id.toLowerCase().includes(keyword) &&
      !item.app.toLowerCase().includes(keyword)
    ) {
      return false
    }
    if (params.source && item.source !== params.source) return false
    if (params.status && item.status !== params.status) return false
    if (params.agency && item.agency !== params.agency) return false
    if (params.app && item.app !== params.app) return false
    return true
  })
}

export async function mockFetchOpenAccountTable(params: OpenAccountTableQuery) {
  const current = params.current || 1
  const size = params.size || 20
  const filtered = applyTableFilters(openAccountState, params)
  const start = (current - 1) * size
  const records = filtered.slice(start, start + size)
  return {
    records: records.map((item) => ({
      ...item,
      feishuRecords: item.feishuRecords.map((r) => ({ ...r }))
    })),
    total: filtered.length,
    current,
    size
  }
}

export async function mockFetchOpenAccountFilterOptions() {
  const pending = openAccountState.filter((i) => i.status === '待分配').length
  const active = openAccountState.filter((i) => i.status === '已激活').length
  const failed = openAccountState.filter((i) => i.status === '开户失败').length
  return {
    statusOptions: [
      { label: '全部', value: '', count: openAccountState.length },
      { label: '待分配', value: '待分配', count: pending },
      { label: '已激活', value: '已激活', count: active },
      { label: '开户失败', value: '开户失败', count: failed }
    ],
    agencyOptions: [
      { label: '全部', value: '' },
      ...openAccountAgencyOptions.map((a) => ({ label: a, value: a }))
    ]
  }
}

export async function mockCreateOpenAccount(data: OpenAccountFormModel): Promise<OpenAccountItem> {
  const nextId = `OA-${String(openAccountState.length + 101).padStart(3, '0')}`
  const created: OpenAccountItem = {
    id: nextId,
    source: data.source as OpenAccountItem['source'],
    app: data.app,
    platform: data.platform,
    accountType: data.accountType,
    agency: data.agency,
    amount: Number(data.amount || 0),
    applicant: data.applicant,
    registerTime: '2026-04-08 10:20',
    status: '待分配',
    remark: data.remark || '',
    adAccountId: data.adAccountId || '',
    adAccountName: data.adAccountName || '',
    credential: data.credential || '',
    credentialStatus: '',
    feishuRecords: [
      { time: '2026-04-08 10:20', event: '开户登记', result: '成功', target: '广告账户群' }
    ]
  }
  openAccountState = [created, ...openAccountState]
  return { ...created, feishuRecords: created.feishuRecords.map((r) => ({ ...r })) }
}

export async function mockAssignOpenAccountCredential(id: string, credential: string) {
  const idx = openAccountState.findIndex((item) => item.id === id)
  if (idx < 0) throw new Error('记录不存在')
  const current = openAccountState[idx]
  const next: OpenAccountItem = {
    ...current,
    status: '已激活',
    credential,
    credentialStatus: '验证正常',
    activateTime: '2026-04-08 10:35',
    adAccountId: current.adAccountId || `act_mock_${id.toLowerCase()}`,
    adAccountName: current.adAccountName || `Vegoo_${current.source.replace(/\s+/g, '_')}_${id}`,
    feishuRecords: [
      ...current.feishuRecords,
      { time: '2026-04-08 10:35', event: '凭据分配激活', result: '成功', target: '广告账户群' }
    ]
  }
  openAccountState[idx] = next
  return { ...next, feishuRecords: next.feishuRecords.map((r) => ({ ...r })) }
}

export async function mockDeleteOpenAccount(id: string) {
  openAccountState = openAccountState.filter((item) => item.id !== id)
  return { success: true }
}

export async function mockFetchOpenAccountFeishuConfig() {
  return { ...feishuConfigState }
}

export async function mockSaveOpenAccountFeishuConfig(data: FeishuConfig) {
  feishuConfigState = { ...feishuConfigState, ...data }
  return { success: true }
}

export async function mockExportOpenAccountList() {
  return {
    taskId: 'open_account_export_20260408_001',
    downloadUrl: 'https://mock.vegoo.com/export/open-account/open_account_export_20260408_001.xlsx'
  }
}
