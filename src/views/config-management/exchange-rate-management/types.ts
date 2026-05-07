// 汇率管理类型定义

export interface ExchangeRateItem {
  id: string
  pair: string // 货币对，如 USD/EUR
  baseCurrency: string
  quoteCurrency: string
  currentRate: number // 当前汇率
  yesterdayRate: number // 昨日汇率
  changePercent: number // 变动幅度 %
  lastUpdated: string // 最后更新时间 HH:mm
  dataSource: 'auto' | 'manual' // 数据来源
  isEnabled: boolean
  isPinned: boolean
  overrideAuto: boolean // 覆盖自动同步
  remark?: string
  effectiveDate?: string
  effectiveTime?: string
}

export interface ExchangeRateQuery {
  pair?: string
  date?: string
  page: number
  pageSize: number
}

export interface ManualRateFormModel {
  baseCurrency: string
  quoteCurrency: string
  rate: number
  effectiveDate: string
  effectiveTime: string
  overrideAuto: boolean
  remark: string
}

export interface SyncConfig {
  frequency: 'hourly' | 'every6h' | 'daily'
  alertThreshold: number
  primarySource: 'openexchange' | 'fixer' | 'custom'
  backupSourceEnabled: boolean
}

export interface SyncResult {
  total: number
  success: number
  overrideManual: number
  failed: number
  syncTime: string
}

export interface SyncProgress {
  current: number
  total: number
  currentPair: string
  pairs: string[]
}

export interface ExchangeRateOverviewKpi {
  total: number
  abnormal: number
  lastSyncTime: string
  dataSourceLabel: string
}

export interface ExchangeRateTrendPoint {
  date: string
  rate: number
}

export interface OptionItem {
  label: string
  value: string
}

export interface ExchangeRateSyncMetaOptions {
  sourceOptions: OptionItem[]
  pairOptions: OptionItem[]
  currencyOptions: OptionItem[]
}
