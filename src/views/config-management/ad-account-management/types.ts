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
