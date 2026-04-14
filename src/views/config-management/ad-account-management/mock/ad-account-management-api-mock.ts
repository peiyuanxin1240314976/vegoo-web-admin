import { getAppNow } from '@/utils/app-now'
import type {
  AdAccount,
  AdAccountForm,
  AdAccountOverviewStats,
  AdAccountOverviewStatsQuery,
  AdAccountTableQuery,
  AdAccountUpdatePayload
} from '../types'

const MOCK_SEED: AdAccount[] = [
  {
    id: 101,
    status: 'enabled',
    appName: 'Weather5',
    platform: 'Android',
    adPlatform: 'Google',
    managerAccount: '560-369-9741',
    adAccounts: ['385-510-4056', '250-161-1888', '542-141-4898', '292-126-4627'],
    credential: 'AdCost',
    token: '32ba778abac3978d34a0a46db475d7147f1997b8'
  },
  {
    id: 102,
    status: 'enabled',
    appName: 'Weather6',
    platform: 'iOS',
    adPlatform: 'TikTok',
    managerAccount: '744708116631368720',
    adAccounts: ['744708116631368721', '744708116631368722'],
    credential: 'TikTokGlobalMain',
    token: 'tt_x9w2k4v8c1m5n7p3s6d0f2g4h8j1'
  },
  {
    id: 103,
    status: 'enabled',
    appName: 'Weather8',
    platform: 'Android',
    adPlatform: 'Mintegral',
    managerAccount: 'vegoo',
    adAccounts: [],
    credential: 'MintegralAdCost1',
    token: null
  },
  {
    id: 104,
    status: 'disabled',
    appName: 'Weather9',
    platform: 'iOS',
    adPlatform: 'NewsBreak',
    managerAccount: '196006482456592752',
    adAccounts: [],
    credential: 'NewsBreakCost2',
    token: null
  }
]

let mockList: AdAccount[] = MOCK_SEED.map((item) => ({
  ...item,
  adAccounts: [...item.adAccounts]
}))

function cloneAccount(item: AdAccount): AdAccount {
  return {
    ...item,
    adAccounts: [...item.adAccounts]
  }
}

function normalizeToken(token?: string | null): string | null {
  const value = String(token ?? '').trim()
  return value ? value : null
}

function filterAccounts(list: AdAccount[], params: AdAccountOverviewStatsQuery): AdAccount[] {
  const keyword = String(params.keyword ?? '')
    .trim()
    .toLowerCase()

  return list.filter((item) => {
    if (
      keyword &&
      !item.appName.toLowerCase().includes(keyword) &&
      !item.managerAccount.toLowerCase().includes(keyword)
    ) {
      return false
    }
    if (params.appName && item.appName !== params.appName) return false
    if (params.platform && item.platform !== params.platform) return false
    if (params.adPlatform && item.adPlatform !== params.adPlatform) return false
    if (params.status && item.status !== params.status) return false
    return true
  })
}

function requireAccount(id: number): AdAccount {
  const account = mockList.find((item) => item.id === id)
  if (!account) {
    throw new Error(`Ad account ${id} not found`)
  }
  return account
}

export function mockFetchAdAccountTable(
  params: AdAccountTableQuery
): Promise<Api.Common.PaginatedResponse<AdAccount>> {
  const filtered = filterAccounts(mockList, params)
  const start = (params.current - 1) * params.size
  const records = filtered.slice(start, start + params.size).map(cloneAccount)

  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.current,
    size: params.size
  })
}

export function mockFetchAdAccountOverviewStats(
  params: AdAccountOverviewStatsQuery
): Promise<AdAccountOverviewStats> {
  const filtered = filterAccounts(mockList, params)
  return Promise.resolve({
    total: filtered.length,
    enabled: filtered.filter((item) => item.status === 'enabled').length,
    disabled: filtered.filter((item) => item.status === 'disabled').length,
    platformCount: new Set(filtered.map((item) => item.adPlatform)).size
  })
}

export function mockCreateAdAccount(payload: AdAccountForm): Promise<AdAccount> {
  const duplicated = mockList.some(
    (item) =>
      item.appName === payload.appName &&
      item.platform === payload.platform &&
      item.adPlatform === payload.adPlatform &&
      item.managerAccount === payload.managerAccount
  )

  if (duplicated) {
    return Promise.reject(new Error('Duplicate manager account configuration'))
  }

  const item: AdAccount = {
    id: getAppNow().getTime(),
    status: 'enabled',
    appName: payload.appName,
    platform: payload.platform,
    adPlatform: payload.adPlatform,
    managerAccount: payload.managerAccount.trim(),
    credential: payload.credential.trim(),
    adAccounts: payload.adAccounts.map((value) => value.trim()).filter(Boolean),
    token: normalizeToken(payload.token)
  }

  mockList = [item, ...mockList]
  return Promise.resolve(cloneAccount(item))
}

export function mockUpdateAdAccount(
  id: number,
  payload: AdAccountUpdatePayload
): Promise<AdAccount> {
  const account = requireAccount(id)
  account.managerAccount = payload.managerAccount.trim()
  account.credential = payload.credential.trim()
  account.adAccounts = payload.adAccounts.map((value) => value.trim()).filter(Boolean)
  account.token = normalizeToken(payload.token)
  return Promise.resolve(cloneAccount(account))
}

export function mockEnableAdAccount(
  id: number
): Promise<{ updated: boolean; status: AdAccount['status'] }> {
  const account = requireAccount(id)
  account.status = 'enabled'
  return Promise.resolve({ updated: true, status: account.status })
}

export function mockDisableAdAccount(
  id: number
): Promise<{ updated: boolean; status: AdAccount['status'] }> {
  const account = requireAccount(id)
  account.status = 'disabled'
  return Promise.resolve({ updated: true, status: account.status })
}

export function mockDeleteAdAccount(id: number): Promise<{ deleted: boolean }> {
  requireAccount(id)
  mockList = mockList.filter((item) => item.id !== id)
  return Promise.resolve({ deleted: true })
}

export function mockExportAdAccountList(
  params: Partial<AdAccountTableQuery>
): Promise<{ blob: Blob; fileName: string }> {
  const filtered = filterAccounts(mockList, params)
  const header = [
    'id',
    'status',
    'appName',
    'platform',
    'adPlatform',
    'managerAccount',
    'adAccounts',
    'credential',
    'tokenConfigured'
  ]
  const rows = filtered.map((item) => [
    String(item.id),
    item.status,
    item.appName,
    item.platform,
    item.adPlatform,
    item.managerAccount,
    item.adAccounts.join('|'),
    item.credential,
    item.token ? 'yes' : 'no'
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return Promise.resolve({
    blob: new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    fileName: `ad-account-management-${getAppNow().getTime()}.csv`
  })
}
