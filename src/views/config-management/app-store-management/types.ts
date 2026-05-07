/**
 * 应用商店凭据管理 · 与 `mock/backend-api`、API 对齐的类型。
 */

/** 单条连接异常项（业务唯一性：platform + appName + account） */
export interface AppStoreConnectionAnomalyItem {
  id: string
  platform: string
  appName: string
  account: string
  credType: string
  errorMessage: string
  /** 失效时间展示；`YYYY-MM-DD HH:mm:ss` 或占位符 */
  expiredAt: string
  suggestions: string[]
}

export interface AppStoreConnectionAnomaliesData {
  items: AppStoreConnectionAnomalyItem[]
}

export type AppStoreCredentialStatus = '正常' | '即将过期' | '连接异常'
export type AppStoreCredentialInputType = 'file' | 'paste'

export interface AppStoreCredentialRow {
  id: string
  platform: string
  appName: string
  credType: string
  account: string
  expiry: string
  lastVerify: string
  verifyOk: boolean
  status: AppStoreCredentialStatus
}

export interface AppStoreCredentialTableParams {
  current: number
  size: number
  platform?: string
  status?: string
}

export interface AppStoreCredentialTableData {
  records: AppStoreCredentialRow[]
  current: number
  size: number
  total: number
}

export interface AppStoreCredentialOverviewStatsParams {
  platform?: string
  status?: string
}

export interface AppStoreCredentialOverviewStatsData {
  configured: number
  normal: number
  error: number
  expiring: number
}

export interface AppStoreCredentialUpsertPayload {
  id?: string
  platform: string
  appName: string
  credInputType: AppStoreCredentialInputType
  credentialContent: string
  fileName?: string
  expiryDate?: string
  remark?: string
}

export interface AppStoreCreateCredentialResult {
  id: string
  created: boolean
}

export interface AppStoreUpdateCredentialResult {
  updated: boolean
  updatedAt: string
}

export interface AppStoreConnectionCheckItem {
  label: string
  value: string
  passed: boolean
}

export interface AppStoreCredentialConnectionTestResult {
  success: boolean
  platform: string
  appName: string
  durationMs: number
  statusAfterTest: AppStoreCredentialStatus
  checks: AppStoreConnectionCheckItem[]
  errorCode?: string
  errorMessage?: string
  invalidAt?: string
  suggestions?: string[]
}

export interface AppStoreBatchTestParams {
  ids?: string[]
  platform?: string
  status?: string
}

export interface AppStoreBatchTestResultItem {
  id: string
  platform: string
  appName: string
  success: boolean
  statusAfterTest: AppStoreCredentialStatus
  message: string
}

export interface AppStoreBatchTestResult {
  taskId: string
  summary: {
    total: number
    success: number
    failed: number
    durationMs: number
  }
  results: AppStoreBatchTestResultItem[]
}

export interface AppStoreRetryConnectionResult {
  retried: boolean
  success: boolean
  statusAfterRetry: AppStoreCredentialStatus
  message: string
  durationMs: number
}

export interface AppStoreCredentialDetail {
  id: string
  platform: string
  appName: string
  credType: string
  account: string
  expiryDate?: string
  status: AppStoreCredentialStatus
  lastVerifyAt: string
  errorMessage?: string
  suggestions: string[]
  remark?: string
}

export interface AppStoreCredentialDetailData {
  detail: AppStoreCredentialDetail
}

export interface AppStoreExportParams {
  platform?: string
  status?: string
}
