import type {
  AppStoreBatchTestParams,
  AppStoreBatchTestResult,
  AppStoreConnectionAnomaliesData,
  AppStoreConnectionAnomalyItem,
  AppStoreConnectionCheckItem,
  AppStoreCreateCredentialResult,
  AppStoreCredentialConnectionTestResult,
  AppStoreCredentialDetailData,
  AppStoreCredentialOverviewStatsData,
  AppStoreCredentialOverviewStatsParams,
  AppStoreCredentialRow,
  AppStoreCredentialStatus,
  AppStoreCredentialTableData,
  AppStoreCredentialTableParams,
  AppStoreCredentialUpsertPayload,
  AppStoreExportParams,
  AppStoreRetryConnectionResult,
  AppStoreUpdateCredentialResult
} from '../types'

const SUCCESS_CHECKS: AppStoreConnectionCheckItem[] = [
  { label: '认证方式', value: 'Service Account', passed: true },
  { label: '应用访问权限', value: '已授权', passed: true },
  { label: '订阅数据访问', value: '可访问', passed: true },
  { label: '评论回复权限', value: '可访问', passed: true }
]

const INITIAL_CREDENTIALS: AppStoreCredentialRow[] = [
  {
    id: 'credential-gp-001',
    platform: 'Google Play',
    appName: 'Vegoo Keyboard',
    credType: 'Service Account JSON',
    account: 'vegoo-sa@project.iam.gserviceaccount.com',
    expiry: '永久',
    lastVerify: '2026-04-13 09:50:11',
    verifyOk: true,
    status: '正常'
  },
  {
    id: 'credential-gp-002',
    platform: 'Google Play',
    appName: 'Vegoo Camera',
    credType: 'Service Account JSON',
    account: 'vegoo-cam@project.iam.gserviceaccount.com',
    expiry: '永久',
    lastVerify: '2026-04-13 09:10:05',
    verifyOk: true,
    status: '正常'
  },
  {
    id: 'credential-as-002',
    platform: 'App Store',
    appName: 'Vegoo Notes',
    credType: 'API Key (P8)',
    account: 'Key ID: XYZ789GHI',
    expiry: '2026-05-10',
    lastVerify: '2026-04-13 08:42:05',
    verifyOk: true,
    status: '即将过期'
  },
  {
    id: 'credential-hw-003',
    platform: 'Huawei AppGallery',
    appName: 'Vegoo Cleaner',
    credType: 'OAuth Client',
    account: 'Client ID: hw_vegoo_cleaner',
    expiry: '2026-11-30',
    lastVerify: '2026-04-12 21:12:30',
    verifyOk: false,
    status: '连接异常'
  },
  {
    id: 'credential-ss-004',
    platform: 'Samsung Galaxy Store',
    appName: 'Vegoo Launcher',
    credType: 'API Token',
    account: 'Token: sgst_*****8f2a',
    expiry: '永久',
    lastVerify: '2026-04-11 17:33:40',
    verifyOk: false,
    status: '连接异常'
  }
]

const INITIAL_ANOMALIES: AppStoreConnectionAnomalyItem[] = [
  {
    id: 'credential-hw-003',
    platform: 'Huawei AppGallery',
    appName: 'Vegoo Cleaner',
    account: 'Client ID: hw_vegoo_cleaner',
    credType: 'OAuth Client',
    errorMessage: 'Invalid credentials - Token expired',
    expiredAt: '2026-04-12 21:12:30',
    suggestions: [
      '检查 OAuth Client Secret 是否已更新',
      '确认应用权限是否已授予',
      '检查项目 ID 与回调配置是否一致'
    ]
  },
  {
    id: 'credential-ss-004',
    platform: 'Samsung Galaxy Store',
    appName: 'Vegoo Launcher',
    account: 'Token: sgst_*****8f2a',
    credType: 'API Token',
    errorMessage: 'Gateway timeout - upstream not reachable',
    expiredAt: '2026-04-10 09:00:00',
    suggestions: [
      '检查 API Token 是否已轮换',
      '确认三星开发者平台网络策略',
      '稍后重试或联系商店侧支持'
    ]
  }
]

const remarks: Record<string, string> = {
  'credential-gp-001': 'Google Play 主账号凭据',
  'credential-gp-002': 'Camera 发布凭据',
  'credential-as-002': '续期后的 P8 凭据',
  'credential-hw-003': '华为市场备用凭据',
  'credential-ss-004': '三星商店发布凭据'
}

const credentialStore = INITIAL_CREDENTIALS.map((item) => ({ ...item }))
let anomalyStore = INITIAL_ANOMALIES.map((item) => ({ ...item }))
let nextId = 100

function cloneRow(row: AppStoreCredentialRow): AppStoreCredentialRow {
  return { ...row }
}

function filterCredentials(platform?: string, status?: string) {
  const normalizedPlatform = platform ?? ''
  const normalizedStatus = status ?? ''

  return credentialStore.filter((item) => {
    const matchPlatform = !normalizedPlatform || item.platform === normalizedPlatform
    const matchStatus = !normalizedStatus || item.status === normalizedStatus
    return matchPlatform && matchStatus
  })
}

function findAnomalyById(id: string) {
  return anomalyStore.find((item) => item.id === id)
}

function syncAnomalies() {
  const previous = anomalyStore.map((item) => ({ ...item }))
  anomalyStore = credentialStore
    .filter((item) => item.status === '连接异常')
    .map((item) => {
      const matched = previous.find((candidate) => candidate.id === item.id)
      return (
        matched ?? {
          id: item.id,
          platform: item.platform,
          appName: item.appName,
          account: item.account,
          credType: item.credType,
          errorMessage: '连接校验失败，请检查凭据配置后重试',
          expiredAt: item.expiry === '永久' ? '--' : `${item.expiry} 00:00:00`,
          suggestions: ['检查密钥内容是否正确', '确认应用商店授权范围', '检查网络与回调配置']
        }
      )
    })
}

function successResult(row: AppStoreCredentialRow): AppStoreCredentialConnectionTestResult {
  return {
    success: true,
    platform: row.platform,
    appName: row.appName,
    durationMs: 1200,
    statusAfterTest: row.status === '连接异常' ? '正常' : row.status,
    checks: SUCCESS_CHECKS.map((item) => ({ ...item })),
    errorCode: '',
    errorMessage: '',
    invalidAt: '',
    suggestions: []
  }
}

function failureResult(row: AppStoreCredentialRow): AppStoreCredentialConnectionTestResult {
  const anomaly = findAnomalyById(row.id)

  return {
    success: false,
    platform: row.platform,
    appName: row.appName,
    durationMs: 980,
    statusAfterTest: '连接异常',
    checks: [],
    errorCode: 'CONNECTION_FAILED',
    errorMessage: anomaly?.errorMessage ?? '连接失败',
    invalidAt: anomaly?.expiredAt ?? '',
    suggestions: anomaly?.suggestions ?? []
  }
}

function createCsvBlob(rows: AppStoreCredentialRow[]) {
  const header = ['平台', '应用名称', '凭据类型', '账号/Key', '过期时间', '最后验证', '状态']
  const lines = [header.join(',')]

  rows.forEach((row) => {
    const values = [
      row.platform,
      row.appName,
      row.credType,
      row.account,
      row.expiry,
      row.lastVerify,
      row.status
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',')
    lines.push(values)
  })

  return new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
}

export function mockFetchAppStoreCredentialTable(
  params: AppStoreCredentialTableParams
): Promise<AppStoreCredentialTableData> {
  const records = filterCredentials(params.platform, params.status)

  return Promise.resolve({
    records: records.slice(0, params.size).map(cloneRow),
    current: params.current,
    size: params.size,
    total: records.length
  })
}

export function mockFetchAppStoreOverviewStats(
  params: AppStoreCredentialOverviewStatsParams
): Promise<AppStoreCredentialOverviewStatsData> {
  const records = filterCredentials(params.platform, params.status)

  return Promise.resolve({
    configured: records.length,
    normal: records.filter((item) => item.status === '正常').length,
    error: records.filter((item) => item.status === '连接异常').length,
    expiring: records.filter((item) => item.status === '即将过期').length
  })
}

export function mockCreateAppStoreCredential(
  payload: AppStoreCredentialUpsertPayload
): Promise<AppStoreCreateCredentialResult> {
  const id = `credential-mock-${nextId++}`
  credentialStore.unshift({
    id,
    platform: payload.platform,
    appName: payload.appName,
    credType: payload.platform === 'App Store' ? 'API Key (P8)' : 'Service Account JSON',
    account: payload.fileName || 'Manual Input',
    expiry: payload.expiryDate || '永久',
    lastVerify: '刚刚',
    verifyOk: true,
    status: '正常'
  })
  remarks[id] = payload.remark ?? ''
  syncAnomalies()

  return Promise.resolve({ id, created: true })
}

export function mockUpdateAppStoreCredential(
  payload: AppStoreCredentialUpsertPayload
): Promise<AppStoreUpdateCredentialResult> {
  const target = credentialStore.find((item) => item.id === payload.id)
  if (target) {
    target.platform = payload.platform
    target.appName = payload.appName
    target.account = payload.fileName || target.account
    target.expiry = payload.expiryDate || target.expiry
  }
  if (payload.id) remarks[payload.id] = payload.remark ?? remarks[payload.id] ?? ''
  syncAnomalies()

  return Promise.resolve({
    updated: true,
    updatedAt: '2026-04-15T10:00:00.000Z'
  })
}

export function mockTestAppStoreCredentialConnection(
  id: string
): Promise<AppStoreCredentialConnectionTestResult> {
  const row = credentialStore.find((item) => item.id === id)
  if (!row) {
    return Promise.resolve({
      success: false,
      platform: '',
      appName: '',
      durationMs: 0,
      statusAfterTest: '连接异常',
      checks: [],
      errorCode: 'NOT_FOUND',
      errorMessage: '凭据不存在',
      invalidAt: '',
      suggestions: []
    })
  }

  return Promise.resolve(row.status === '连接异常' ? failureResult(row) : successResult(row))
}

export function mockBatchTestAppStoreCredentialConnection(
  params: AppStoreBatchTestParams
): Promise<AppStoreBatchTestResult> {
  const rows =
    params.ids && params.ids.length > 0
      ? credentialStore.filter((item) => params.ids?.includes(item.id))
      : filterCredentials(params.platform, params.status)

  const results = rows.map((row) => ({
    id: row.id,
    platform: row.platform,
    appName: row.appName,
    success: row.status !== '连接异常',
    statusAfterTest: row.status,
    message: row.status === '连接异常' ? '连接失败' : '连接成功'
  }))

  return Promise.resolve({
    taskId: 'batch-test-mock-001',
    summary: {
      total: results.length,
      success: results.filter((item) => item.success).length,
      failed: results.filter((item) => !item.success).length,
      durationMs: results.length * 400
    },
    results
  })
}

export function mockRetryAppStoreCredentialConnection(
  id: string
): Promise<AppStoreRetryConnectionResult> {
  const row = credentialStore.find((item) => item.id === id)
  if (row) {
    row.status = '正常'
    row.verifyOk = true
    row.lastVerify = '刚刚'
  }
  anomalyStore = anomalyStore.filter((item) => item.id !== id)

  return Promise.resolve({
    retried: true,
    success: true,
    statusAfterRetry: '正常',
    message: '重试成功，连接已恢复',
    durationMs: 980
  })
}

export function mockFetchAppStoreCredentialDetail(
  id: string
): Promise<AppStoreCredentialDetailData> {
  const row = credentialStore.find((item) => item.id === id)
  const anomaly = findAnomalyById(id)

  return Promise.resolve({
    detail: {
      id: row?.id ?? id,
      platform: row?.platform ?? '',
      appName: row?.appName ?? '',
      credType: row?.credType ?? '',
      account: row?.account ?? '',
      expiryDate: row?.expiry === '永久' ? '' : row?.expiry,
      status: (row?.status ?? '连接异常') as AppStoreCredentialStatus,
      lastVerifyAt: row?.lastVerify ?? '',
      errorMessage: anomaly?.errorMessage ?? '',
      suggestions: anomaly?.suggestions ?? [],
      remark: remarks[id] ?? ''
    }
  })
}

export function mockExportAppStoreCredentials(params: AppStoreExportParams): Promise<Blob> {
  return Promise.resolve(createCsvBlob(filterCredentials(params.platform, params.status)))
}

export function mockFetchAppStoreConnectionAnomalies(): Promise<AppStoreConnectionAnomaliesData> {
  return Promise.resolve({
    items: anomalyStore.map((item) => ({ ...item }))
  })
}
