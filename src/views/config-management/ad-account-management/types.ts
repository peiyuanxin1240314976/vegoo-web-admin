export type AccountStatus = 'enabled' | 'disabled'

export type AppPlatform = 'Android' | 'iOS'

export type AdPlatform = 'Google' | 'TikTok' | 'Mintegral' | 'NewsBreak'

export interface AdAccount {
  id: number
  status: AccountStatus
  appName: string
  platform: AppPlatform
  adPlatform: AdPlatform
  managerAccount: string
  adAccounts: string[]
  credential: string
  token: string | null
}

export interface AdAccountForm {
  appName: string
  platform: AppPlatform
  adPlatform: AdPlatform
  managerAccount: string
  credential: string
  adAccounts: string[]
  token: string
}

export interface AdAccountTableQuery {
  current: number
  size: number
  keyword?: string
  appName?: string
  platform?: AppPlatform | ''
  adPlatform?: AdPlatform | ''
  status?: AccountStatus | ''
}

export interface AdAccountOverviewStatsQuery {
  keyword?: string
  appName?: string
  platform?: AppPlatform | ''
  adPlatform?: AdPlatform | ''
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
  'managerAccount' | 'credential' | 'adAccounts'
> & {
  token: string
}
