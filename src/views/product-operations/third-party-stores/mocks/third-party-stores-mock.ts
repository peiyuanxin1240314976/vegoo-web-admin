import type {
  AppStoreRecord,
  ThirdPartyStoresDashboardPayload,
  ThirdPartyStoresQueryParams
} from '../types'
import { THIRD_PARTY_STORES_DEFAULT_PAYLOAD } from './third-party-stores-default-payload'

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function filterAppStoreRows(
  rows: AppStoreRecord[],
  params: ThirdPartyStoresQueryParams
): AppStoreRecord[] {
  const app = params.s_app_id
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
