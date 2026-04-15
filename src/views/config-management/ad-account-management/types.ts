export type AccountStatus = 'enabled' | 'disabled'

export interface AdAccount {
  id: number
  status: AccountStatus
  /** 应用 ID，与 cockpit meta `appOptions[].value` 一致 */
  appId: string
  /** 应用展示名 */
  appName: string
  /** 终端平台枚举值，与 cockpit meta `platformOptions[].value` 一致 */
  platform: string
  /** 广告平台枚举值，与 cockpit meta `sourceOptions[].value` 一致 */
  source: string
  managerAccount: string
  adAccounts: string[]
  credential: string
  token: string | null
}

export interface AdAccountForm {
  appId: string
  /** 应用展示名；创建时由前端从 meta 选项解析，便于列表展示 */
  appName?: string
  platform: string
  source: string
  managerAccount: string
  credential: string
  adAccounts: string[]
  token: string
}

export interface AdAccountTableQuery {
  current: number
  size: number
  keyword?: string
  appId?: string
  platform?: string
  source?: string
  status?: AccountStatus | ''
}

export interface AdAccountOverviewStatsQuery {
  keyword?: string
  appId?: string
  platform?: string
  source?: string
  status?: AccountStatus | ''
}

export interface AdAccountOverviewStats {
  total: number
  enabled: number
  disabled: number
  platformCount: number
}

export type AdAccountUpdatePayload = Pick<
  AdAccount,
  'managerAccount' | 'credential' | 'adAccounts' | 'appId' | 'platform' | 'source' | 'appName'
> & {
  token: string
}
