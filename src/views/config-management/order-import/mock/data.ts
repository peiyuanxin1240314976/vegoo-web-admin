import type { ImportTask, ImportReportItem } from '../types'

const RAW_TASKS: ImportTask[] = [
  {
    id: '026', taskId: 'IMP-026', dataSource: 'appstore',
    uploadTime: '2026-02-28 14:32', totalRecords: 5234,
    newImports: 4342, duplicateSkipped: 892, failedCount: 0,
    status: 'completed'
  },
  {
    id: '025', taskId: 'IMP-025', dataSource: 'googleplay',
    uploadTime: '2026-02-27 10:18', totalRecords: 8921,
    newImports: 7687, duplicateSkipped: 1234, failedCount: 0,
    status: 'completed'
  },
  {
    id: '024', taskId: 'IMP-024', dataSource: 'appstore',
    uploadTime: '2026-02-26 09:45', totalRecords: 3102,
    newImports: 3102, duplicateSkipped: 0, failedCount: 0,
    status: 'completed'
  },
  {
    id: '023', taskId: 'IMP-023', dataSource: 'googleplay',
    uploadTime: '2026-02-25 16:20', totalRecords: 11450,
    newImports: 9876, duplicateSkipped: 1574, failedCount: 0,
    status: 'completed'
  },
  {
    id: '022', taskId: 'IMP-022', dataSource: 'appstore',
    uploadTime: '2026-02-25 08:05', totalRecords: 6780,
    newImports: 4210, duplicateSkipped: null, failedCount: null,
    status: 'processing'
  },
  {
    id: '021', taskId: 'IMP-021', dataSource: 'googleplay',
    uploadTime: '2026-02-24 11:30', totalRecords: 9340,
    newImports: 8120, duplicateSkipped: 1220, failedCount: 0,
    status: 'completed'
  },
  {
    id: '020', taskId: 'IMP-020', dataSource: 'appstore',
    uploadTime: '2026-02-23 15:45', totalRecords: 2890,
    newImports: 2450, duplicateSkipped: 410, failedCount: 30,
    status: 'partial'
  },
  {
    id: '019', taskId: 'IMP-019', dataSource: 'googleplay',
    uploadTime: '2026-02-22 09:10', totalRecords: 7600,
    newImports: 7600, duplicateSkipped: 0, failedCount: 0,
    status: 'completed'
  },
  {
    id: '018', taskId: 'IMP-018', dataSource: 'appstore',
    uploadTime: '2026-02-21 16:55', totalRecords: 4410,
    newImports: 3980, duplicateSkipped: 380, failedCount: 50,
    status: 'partial'
  },
  {
    id: '017', taskId: 'IMP-017', dataSource: 'googleplay',
    uploadTime: '2026-02-20 11:00', totalRecords: 6120,
    newImports: 5890, duplicateSkipped: 230, failedCount: 0,
    status: 'completed'
  },
  {
    id: '016', taskId: 'IMP-016', dataSource: 'appstore',
    uploadTime: '2026-02-19 14:20', totalRecords: 3300,
    newImports: 0, duplicateSkipped: null, failedCount: 3300,
    status: 'failed'
  },
  {
    id: '015', taskId: 'IMP-015', dataSource: 'googleplay',
    uploadTime: '2026-02-18 09:30', totalRecords: 5100,
    newImports: 4900, duplicateSkipped: 200, failedCount: 0,
    status: 'completed'
  }
]

export const cloneTaskList = (): ImportTask[] =>
  RAW_TASKS.map((t) => ({ ...t }))

export const DATA_SOURCE_LABELS: Record<string, { label: string; abbr: string; color: string }> = {
  appstore: { label: 'App Store', abbr: 'A', color: '#1d6fce' },
  googleplay: { label: 'Google Play', abbr: 'G', color: '#1a8a43' }
}

export const STATUS_CONFIGS: Record<string, { label: string; type: string }> = {
  completed:  { label: '已完成', type: 'success' },
  processing: { label: '处理中', type: 'processing' },
  partial:    { label: '部分成功', type: 'partial' },
  failed:     { label: '失败', type: 'error' }
}

export const getReport = (taskId: string): ImportReportItem[] => {
  const items: ImportReportItem[] = []
  for (let i = 1; i <= 30; i++) {
    const r = Math.random()
    items.push({
      rowNo: i,
      orderId: `ORD-${taskId}-${String(i).padStart(4, '0')}`,
      status: r > 0.85 ? 'duplicate' : r > 0.75 ? 'failed' : 'success',
      reason: r > 0.75 && r <= 0.85 ? undefined : r > 0.85 ? '记录已存在' : r > 0.75 ? '格式错误' : undefined
    })
  }
  return items
}

export interface FailedItem {
  rowNo: number
  transactionDate: string
  sku: string
  errorType: 'missing_field' | 'amount_format' | 'date_format' | 'country_code' | 'other'
  errorMsg: string
  suggestion: string
}

const FAILED_ITEMS_MAP: Record<string, FailedItem[]> = {
  'IMP-020': [
    { rowNo: 47,  transactionDate: 'Feb 3, 2026',  sku: 'vip_yearly',      errorType: 'missing_field', errorMsg: '必填字段缺失：Sku Id 为空',         suggestion: '确保 SKU 字段非空' },
    { rowNo: 112, transactionDate: 'Feb 8, 2026',  sku: 'pt_vip_monthly',  errorType: 'amount_format', errorMsg: '金额格式异常：包含非数字字符',      suggestion: '检查 Amount 字段数据格式' },
    { rowNo: 156, transactionDate: 'Feb 12, 2026', sku: 'season_subs29',   errorType: 'country_code',  errorMsg: '国家代码异常：长度超过 2 位',       suggestion: '使用标准 2 位国家代码' },
    { rowNo: 203, transactionDate: 'Feb 17, 2026', sku: 'vip_weekly',      errorType: 'date_format',   errorMsg: '日期格式错误：无法解析',            suggestion: '使用格式 MMM D, YYYY' },
    { rowNo: 287, transactionDate: 'Feb 24, 2026', sku: 'pt_vip_monthly',  errorType: 'missing_field', errorMsg: '必填字段缺失：Buyer Country 为空',  suggestion: '确保国家字段非空' }
  ],
  'IMP-018': [
    { rowNo: 23,  transactionDate: 'Feb 1, 2026',  sku: 'pt_vip_monthly',  errorType: 'missing_field', errorMsg: '必填字段缺失：Transaction Date 为空', suggestion: '确保日期字段非空' },
    { rowNo: 58,  transactionDate: 'Feb 5, 2026',  sku: 'vip_yearly',      errorType: 'amount_format', errorMsg: '金额格式异常：负数不合法',           suggestion: '检查金额是否为正数' },
    { rowNo: 91,  transactionDate: 'Feb 9, 2026',  sku: 'season_subs29',   errorType: 'date_format',   errorMsg: '日期格式错误：月份超出范围',         suggestion: '使用格式 MMM D, YYYY' },
    { rowNo: 134, transactionDate: 'Feb 13, 2026', sku: 'pt_vip_weekly',   errorType: 'other',         errorMsg: '未知错误：解析异常',                 suggestion: '请联系技术支持' },
    { rowNo: 201, transactionDate: 'Feb 20, 2026', sku: 'vip_monthly',     errorType: 'amount_format', errorMsg: '金额格式异常：包含货币符号',         suggestion: '仅保留数字，去除货币符号' }
  ]
}

const ERROR_TYPE_COLORS: Record<string, string> = {
  missing_field: '#ef4444',
  amount_format: '#f59e0b',
  date_format:   '#f97316',
  country_code:  '#f59e0b',
  other:         '#64748b'
}

const ERROR_TYPE_LABELS: Record<string, string> = {
  missing_field: '必填字段缺失',
  amount_format: '金额格式异常',
  date_format:   '日期格式错误',
  country_code:  '国家代码异常',
  other:         '其他异常'
}

export const getFailedItems = (taskId: string): FailedItem[] => {
  return FAILED_ITEMS_MAP[taskId] ?? []
}

export const getErrorDistribution = (items: FailedItem[]) => {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item.errorType] = (counts[item.errorType] ?? 0) + 1
  }
  const total = items.length || 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      label: ERROR_TYPE_LABELS[type] ?? type,
      count,
      pct: Math.round((count / total) * 100),
      color: ERROR_TYPE_COLORS[type] ?? '#64748b'
    }))
}
