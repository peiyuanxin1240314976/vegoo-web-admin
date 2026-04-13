/**
 * 应用商店凭据管理 Mock，与 `mock/backend-api` 契约对齐。
 */
import type { AppStoreConnectionAnomaliesData, AppStoreConnectionAnomalyItem } from '../types'

const MOCK_ANOMALIES: AppStoreConnectionAnomalyItem[] = [
  {
    id: '5',
    platform: 'Huawei AppGallery',
    appName: 'Vegoo Cleaner',
    account: 'Client ID: hw_vegoo_cleaner',
    credType: 'OAuth Client',
    errorMessage: 'Invalid credentials - Token expired',
    expiredAt: '2024-01-30 22:15:32',
    suggestions: [
      '检查 OAuth Client Secret 是否更新',
      '确认应用权限是否已授予',
      '检查项目 ID 与回调配置是否一致'
    ]
  },
  {
    id: '6',
    platform: 'Samsung Galaxy Store',
    appName: 'Vegoo Launcher',
    account: 'Token: sgst_*****8f2a',
    credType: 'API Token',
    errorMessage: 'Gateway timeout - upstream not reachable',
    expiredAt: '2026-04-10 09:00:00',
    suggestions: [
      '检查 API Token 是否被吊销或轮换',
      '确认三星开发者控制台网络策略',
      '稍后重试或联系应用商店支持'
    ]
  }
]

export function mockFetchAppStoreConnectionAnomalies(): Promise<AppStoreConnectionAnomaliesData> {
  return Promise.resolve({
    items: MOCK_ANOMALIES.map((r) => ({ ...r }))
  })
}
