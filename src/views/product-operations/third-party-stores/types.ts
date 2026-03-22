/**
 * 三方商店管理 — 與 mock/backend-api 契約對齊的類型
 */

export interface PlatformCard {
  id: string
  name: string
  icon: string
  iconBg: string
  status: 'connected' | 'warning' | 'pending'
  appCount: number
  lastSync: string
}

export interface FilterState {
  platform: string
  appStore: string
  app: string
  adPlatform: string
  channel: string
  dateRange: [Date, Date] | null
  currency: string
}

export interface AppStoreRecord {
  key: string
  app: string
  platform: string
  adStore: string
  adPlatform: string
  newUsers: number
  totalRevenue: number
  adRevenue: number
  paidRevenue: number
  adRatio: number
  isGroup?: boolean
  expanded?: boolean
  children?: AppStoreRecord[]
}

export interface ChannelRecord {
  key: string
  app: string
  platform: string
  channel: string
  adCampaign: string
  newUsers: number
  totalRevenue: number
  adRevenue: number
  paidRevenue: number
  channelRatio: number
  isGroup?: boolean
  expanded?: boolean
  children?: ChannelRecord[]
}

/** 頂部四張摘要卡（已接入 / 總應用 / 待同步 / 本月新增） */
export interface ThirdPartyStoresStatusSummary {
  connectedPlatforms: number
  totalApps: number
  pendingSync: number
  newPlatformsThisMonth: number
  newPlatformName: string
}

export interface ThirdPartyStoresSummaryMetrics {
  newUsers: number
  totalRevenue: number
  adRevenue: number
  paidRevenue: number
  arpu: number
}

export interface DonutSlice {
  value: number
  name: string
  color: string
}

export interface ThirdPartyStoresDashboardPayload {
  platformCards: PlatformCard[]
  statusSummary: ThirdPartyStoresStatusSummary
  summary: ThirdPartyStoresSummaryMetrics
  appStoreData: AppStoreRecord[]
  channelData: ChannelRecord[]
  donut: {
    legend: string[]
    slices: DonutSlice[]
  }
  bar: {
    apps: string[]
    values: number[]
    ratios: number[]
  }
}

/**
 * 與後端契約一致的查詢參數（POST body）
 * - 終端平臺：platform
 * - 廣告平臺：source（對應篩選「廣告平臺」）
 */
export interface ThirdPartyStoresQueryParams {
  platform?: string
  app_store?: string
  s_app_id?: string
  source?: string
  channel?: string
  t_date_start?: string
  t_date_end?: string
  currency?: string
}
