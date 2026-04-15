import { cloneAppDate, getAppNow } from '@/utils/app-now'
import type {
  ErrorDistributionItem,
  ImportReportDataStats,
  ImportReportDetail,
  ImportReportPreviewListData,
  ImportReportTaskInfo
} from '../types'
import { cloneTaskList, getErrorDistribution, getFailedItems, getReport } from './data'

type ImportTableParams = {
  page: number
  pageSize: number
  dataSource?: string
  status?: string
}

function buildReportDetail(taskId: string): ImportReportDetail {
  const task = cloneTaskList().find((t) => t.taskId === taskId)
  if (!task) {
    return {
      taskId,
      dataSource: 'appstore',
      fileName: '',
      uploadTime: '',
      completedTime: '',
      durationSec: 0,
      status: 'failed',
      totalRecords: 0,
      newImports: 0,
      duplicateSkipped: 0,
      failedCount: 0,
      previewList: [],
      previewTotal: 0,
      duplicateRatio: 0,
      failedItems: [],
      errorDistribution: []
    }
  }

  const rawItems = getReport(task.taskId)
  const previewList = rawItems.slice(0, 20)
  const failedItems = getFailedItems(task.taskId)
  const errorDistribution = getErrorDistribution(failedItems) as ErrorDistributionItem[]

  const completedTime = task.uploadTime
    ? task.uploadTime.replace(/(\d{2}):(\d{2})$/, (_m, h, m) => {
        const d = cloneAppDate(getAppNow())
        d.setHours(Number(h), Number(m) + 12)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      })
    : ''

  return {
    taskId: task.taskId,
    dataSource: task.dataSource,
    fileName: `${task.taskId.replace('-', '').toLowerCase()}_S.csv`,
    uploadTime: task.uploadTime,
    completedTime,
    durationSec: 802,
    status: task.status,
    totalRecords: task.totalRecords,
    newImports: task.newImports,
    duplicateSkipped: task.duplicateSkipped ?? 0,
    failedCount: task.failedCount ?? 0,
    previewList,
    previewTotal: task.newImports,
    duplicateRatio: (task.duplicateSkipped ?? 0) / (task.totalRecords || 1),
    failedItems,
    errorDistribution
  }
}

function buildReportTaskInfo(taskId: string): ImportReportTaskInfo {
  const report = buildReportDetail(taskId)
  return {
    taskId: report.taskId,
    dataSource: report.dataSource,
    fileName: report.fileName,
    uploadTime: report.uploadTime,
    completedTime: report.completedTime,
    durationSec: report.durationSec,
    status: report.status
  }
}

function buildReportDataStats(taskId: string): ImportReportDataStats {
  const report = buildReportDetail(taskId)
  return {
    totalRecords: report.totalRecords,
    newImports: report.newImports,
    duplicateSkipped: report.duplicateSkipped,
    failedCount: report.failedCount,
    duplicateRatio: report.duplicateRatio
  }
}

export function mockFetchOrderImportTable(params: ImportTableParams) {
  let rows = cloneTaskList()
  if (params.dataSource) rows = rows.filter((row) => row.dataSource === params.dataSource)
  if (params.status) rows = rows.filter((row) => row.status === params.status)
  const start = (params.page - 1) * params.pageSize
  const records = rows.slice(start, start + params.pageSize)
  return Promise.resolve({
    records,
    total: rows.length,
    current: params.page,
    size: params.pageSize
  })
}

export function mockFetchOrderImportSummary(params?: { dataSource?: string; status?: string }) {
  let rows = cloneTaskList()
  if (params?.dataSource) rows = rows.filter((row) => row.dataSource === params.dataSource)
  if (params?.status) rows = rows.filter((row) => row.status === params.status)
  return Promise.resolve({
    todayTotal: rows.length,
    completed: rows.filter((r) => r.status === 'completed').length,
    processing: rows.filter((r) => r.status === 'processing').length,
    failed: rows.filter((r) => r.status === 'failed' || r.status === 'partial').length
  })
}

export function mockSubmitOrderImport(data: FormData) {
  void data
  return Promise.resolve({
    taskId: `IMP-${String(getAppNow().getTime()).slice(-6)}`,
    status: 'processing' as const
  })
}

export function mockPauseOrderImport(taskId: string) {
  void taskId
  return Promise.resolve({ success: true })
}

export function mockCancelOrderImport(taskId: string) {
  void taskId
  return Promise.resolve({ success: true })
}

export function mockFetchOrderImportReport(taskId: string) {
  return Promise.resolve(buildReportDetail(taskId))
}

export function mockFetchOrderImportReportTaskInfo(taskId: string) {
  return Promise.resolve(buildReportTaskInfo(taskId))
}

export function mockFetchOrderImportReportDataStats(taskId: string) {
  return Promise.resolve(buildReportDataStats(taskId))
}

export function mockFetchOrderImportReportPreviewList(params: {
  taskId: string
  page: number
  pageSize: number
}) {
  const report = buildReportDetail(params.taskId)
  const start = (params.page - 1) * params.pageSize
  return Promise.resolve<ImportReportPreviewListData>({
    records: report.previewList.slice(start, start + params.pageSize),
    total: report.previewTotal,
    current: params.page,
    size: params.pageSize
  })
}

export function mockFetchOrderImportReportFailedItems(taskId: string) {
  const report = buildReportDetail(taskId)
  return Promise.resolve({
    records: report.failedItems ?? [],
    total: report.failedCount
  })
}

export function mockFetchOrderImportReportErrorDistribution(taskId: string) {
  const report = buildReportDetail(taskId)
  return Promise.resolve({
    items: report.errorDistribution ?? []
  })
}

export function mockExportOrderImportReport(taskId: string) {
  const report = buildReportDetail(taskId)
  const rows = [
    ['rowNo', 'transactionDate', 'sku', 'errorType', 'errorMsg', 'suggestion'],
    ...(report.failedItems ?? []).map((row) => [
      String(row.rowNo),
      row.transactionDate,
      row.sku,
      row.errorType,
      row.errorMsg,
      row.suggestion
    ])
  ]
  const csv = rows.map((row) => row.map((v) => `"${String(v ?? '')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  return Promise.resolve({
    blob,
    fileName: `import_report_${taskId}_failed.csv`
  })
}
