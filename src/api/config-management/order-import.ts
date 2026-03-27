/**
 * 配置管理 · 导入商店订单 API（与 `views/config-management/order-import` 对齐）
 */
import request from '@/utils/http'
import type { ImportTask, ImportReportDetail } from '@/views/config-management/order-import/types'

/** 上传历史分页列表 */
export function fetchOrderImportTable(params: {
  page: number
  pageSize: number
  dataSource?: string
  status?: string
}) {
  return request.post<Api.Common.PaginatedResponse<ImportTask>>({
    url: '/api/config-management/order-import/table',
    data: params,
    showErrorMessage: false
  })
}

/** 今日导入统计（顶部 KPI） */
export function fetchOrderImportSummary() {
  return request.post<{
    todayTotal: number
    completed: number
    processing: number
    failed: number
  }>({
    url: '/api/config-management/order-import/summary',
    data: {},
    showErrorMessage: false
  })
}

/** 提交导入任务（multipart，前端模拟时传 FormData） */
export function submitOrderImport(data: FormData) {
  return request.post<{ taskId: string }>({
    url: '/api/config-management/order-import/submit',
    data,
    showErrorMessage: false
  })
}

/** 暂停导入任务 */
export function pauseOrderImport(taskId: string) {
  return request.post<unknown>({
    url: '/api/config-management/order-import/pause',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 取消导入任务 */
export function cancelOrderImport(taskId: string) {
  return request.post<unknown>({
    url: '/api/config-management/order-import/cancel',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 获取导入报告详情 */
export function fetchOrderImportReport(taskId: string) {
  return request.post<ImportReportDetail>({
    url: '/api/config-management/order-import/report',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 导出导入报告 */
export function exportOrderImportReport(taskId: string) {
  return request.post<unknown>({
    url: '/api/config-management/order-import/report/export',
    data: { taskId },
    showErrorMessage: false
  })
}
