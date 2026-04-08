import type {
  AppStoreRecord,
  ThirdPartyStoresFilterOptionsData,
  ThirdPartyStoresDashboardPayload,
  ThirdPartyStoresExportRequest,
  ThirdPartyStoresExportResponse,
  ThirdPartyStoresPlatformCreateRequest,
  ThirdPartyStoresPlatformCreateResponse,
  ThirdPartyStoresPlatformDetailRequest,
  ThirdPartyStoresPlatformDetailResponse,
  ThirdPartyStoresPlatformFixAuthRequest,
  ThirdPartyStoresPlatformFixAuthResponse,
  ThirdPartyStoresQueryParams
} from '../types'
import { THIRD_PARTY_STORES_DEFAULT_PAYLOAD } from './third-party-stores-default-payload'

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export async function mockFetchThirdPartyStoresFilterOptions(): Promise<ThirdPartyStoresFilterOptionsData> {
  await new Promise((r) => setTimeout(r, 150))
  return {
    appStoreOptions: [
      { label: '全部', value: '' },
      { label: 'XIAOMI', value: 'XIAOMI' },
      { label: 'OPPO', value: 'OPPO' },
      { label: 'Google Play', value: 'GooglePlay' }
    ],
    channelOptions: [
      { label: '全部', value: '' },
      { label: 'InAppShare', value: 'InAppShare' }
    ],
    currencyOptions: [
      { label: 'USD', value: 'USD' },
      { label: 'CNY', value: 'CNY' },
      { label: 'EUR', value: 'EUR' }
    ]
  }
}

function filterAppStoreRows(
  rows: AppStoreRecord[],
  params: ThirdPartyStoresQueryParams
): AppStoreRecord[] {
  const app = params.appId
  const platform = params.platform
  const map: Record<string, string> = { android: '安卓', ios: 'iOS' }

  const filtered = rows.filter((row) => {
    if (app && row.app !== app && row.app !== '') return false
    if (platform) {
      if (row.platform && row.platform !== map[platform]) return false
    }
    return true
  })
  return filtered.length > 0 ? filtered : rows
}

/**
 * Mock：依查詢參數返回儀表板（應用商店表按原邏輯篩選；渠道表保持全量）
 */
export async function mockFetchThirdPartyStoresDashboard(
  params: ThirdPartyStoresQueryParams
): Promise<ThirdPartyStoresDashboardPayload> {
  await new Promise((r) => setTimeout(r, 400))
  const base = deepClone(THIRD_PARTY_STORES_DEFAULT_PAYLOAD)
  base.appStoreData = filterAppStoreRows(base.appStoreData, params)
  return base
}

export async function mockFetchThirdPartyStoresPlatformDetail(
  params: ThirdPartyStoresPlatformDetailRequest
): Promise<ThirdPartyStoresPlatformDetailResponse> {
  await new Promise((r) => setTimeout(r, 250))
  const base = deepClone(THIRD_PARTY_STORES_DEFAULT_PAYLOAD)
  const card = base.platformCards.find((p) => p.id === params.platformId) || base.platformCards[0]
  return {
    detail: {
      id: card?.id || params.platformId,
      name: card?.name || 'Unknown',
      status: card?.status || 'pending',
      appCount: card?.appCount || 0,
      lastSync: card?.lastSync || '—',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
      remarks: card?.status === 'warning' ? '认证异常，请修复后重试' : ''
    }
  }
}

export async function mockCreateThirdPartyStoresPlatform(
  params: ThirdPartyStoresPlatformCreateRequest
): Promise<ThirdPartyStoresPlatformCreateResponse> {
  await new Promise((r) => setTimeout(r, 300))
  const id = `p_${params.name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 1000)}`
  return { id }
}

export async function mockFixThirdPartyStoresPlatformAuth(
  params: ThirdPartyStoresPlatformFixAuthRequest
): Promise<ThirdPartyStoresPlatformFixAuthResponse> {
  await new Promise((r) => setTimeout(r, 500))
  const detail = await mockFetchThirdPartyStoresPlatformDetail({ platformId: params.platformId })
  return {
    detail: {
      ...detail.detail,
      status: 'connected',
      lastSync: 'Just now',
      updatedAt: '2026-04-08T00:00:00.000Z',
      remarks: ''
    }
  }
}

export async function mockExportThirdPartyStoresDashboard(
  _params: ThirdPartyStoresExportRequest
): Promise<ThirdPartyStoresExportResponse> {
  await new Promise((r) => setTimeout(r, 200))
  void _params
  return {
    downloadUrl:
      'https://example.com/download/third-party-stores-dashboard-export.xlsx?expires=2026-04-09T00:00:00Z'
  }
}
