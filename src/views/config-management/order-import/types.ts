export type ImportStatus = 'completed' | 'processing' | 'partial' | 'failed'
export type ImportDataSource = 'appstore' | 'googleplay'

export interface ImportTask {
  id: string
  taskId: string
  dataSource: ImportDataSource
  uploadTime: string
  totalRecords: number
  newImports: number
  duplicateSkipped: number | null  // null 表示处理中，尚未统计
  failedCount: number | null
  status: ImportStatus
  remark?: string
}

export interface ImportDialogModel {
  dataSource: ImportDataSource | ''
  fileName: string
  remark: string
}

export interface ImportReportItem {
  rowNo: number
  orderId: string
  transactionDate: string
  settlementDate: string
  productName: string
  sku: string
  country: string
  partnerShare: number
  currency: string
  status: 'success' | 'duplicate' | 'failed'
  reason?: string
}

export type ErrorType = 'missing_field' | 'amount_format' | 'date_format' | 'country_code' | 'other'

export interface FailedRecordItem {
  rowNo: number
  transactionDate: string
  sku: string
  errorType: ErrorType
  errorMsg: string
  suggestion: string
}

export interface ImportReportDetail {
  taskId: string
  dataSource: ImportDataSource
  fileName: string
  uploadTime: string
  completedTime: string
  durationSec: number
  status: ImportStatus
  totalRecords: number
  newImports: number
  duplicateSkipped: number
  failedCount: number
  previewList: ImportReportItem[]
  previewTotal: number
  duplicateRatio: number
}
