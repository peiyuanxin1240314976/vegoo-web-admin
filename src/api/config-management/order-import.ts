/**
 * 配置管理 · 导入商店订单 API（与 `views/config-management/order-import` 对齐）
 */
import FileSaver from 'file-saver'
import request, { requestBlob } from '@/utils/http'
import type {
  ErrorDistributionItem,
  FailedRecordItem,
  ImportReportDataStats,
  ImportReportPreviewListData,
  ImportReportTaskInfo,
  ImportTask
} from '@/views/config-management/order-import/types'
import {
  OrderImportListEndpoint,
  OrderImportReportEndpoint,
  isOrderImportListEndpointMock,
  isOrderImportReportEndpointMock
} from '@/views/config-management/order-import/config/data-source'
import * as orderImportMock from '@/views/config-management/order-import/mock/order-import-api-mock'

/** 上传历史分页列表 */
export function fetchOrderImportTable(params: {
  page: number
  pageSize: number
  dataSource?: string
  status?: string
}) {
  if (isOrderImportListEndpointMock(OrderImportListEndpoint.ImportTable)) {
    return orderImportMock.mockFetchOrderImportTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<ImportTask>>({
    url: '/api/config-management/order-import/table',
    data: params,
    showErrorMessage: false
  })
}

/** 今日导入统计（顶部 KPI） */
export function fetchOrderImportSummary(params?: { dataSource?: string; status?: string }) {
  if (isOrderImportListEndpointMock(OrderImportListEndpoint.ImportSummary)) {
    return orderImportMock.mockFetchOrderImportSummary(params)
  }
  return request.post<{
    todayTotal: number
    completed: number
    processing: number
    failed: number
  }>({
    url: '/api/config-management/order-import/summary',
    data: params ?? {},
    showErrorMessage: false
  })
}

/** 提交导入任务（multipart，前端模拟时传 FormData） */
export function submitOrderImport(data: FormData) {
  if (isOrderImportListEndpointMock(OrderImportListEndpoint.SubmitImport)) {
    return orderImportMock.mockSubmitOrderImport(data)
  }
  return request.post<{ taskId: string }>({
    url: '/api/config-management/order-import/submit',
    data,
    showErrorMessage: false
  })
}

/** 暂停导入任务 */
export function pauseOrderImport(taskId: string) {
  if (isOrderImportListEndpointMock(OrderImportListEndpoint.PauseImport)) {
    return orderImportMock.mockPauseOrderImport(taskId)
  }
  return request.post<unknown>({
    url: '/api/config-management/order-import/pause',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 取消导入任务 */
export function cancelOrderImport(taskId: string) {
  if (isOrderImportListEndpointMock(OrderImportListEndpoint.CancelImport)) {
    return orderImportMock.mockCancelOrderImport(taskId)
  }
  return request.post<unknown>({
    url: '/api/config-management/order-import/cancel',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 获取导入报告：任务信息 */
export function fetchOrderImportReportTaskInfo(taskId: string) {
  if (isOrderImportReportEndpointMock(OrderImportReportEndpoint.ReportTaskInfo)) {
    return orderImportMock.mockFetchOrderImportReportTaskInfo(taskId)
  }
  return request.post<ImportReportTaskInfo>({
    url: '/api/config-management/order-import/report/task-info',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 获取导入报告：数据统计 */
export function fetchOrderImportReportDataStats(taskId: string) {
  if (isOrderImportReportEndpointMock(OrderImportReportEndpoint.ReportDataStats)) {
    return orderImportMock.mockFetchOrderImportReportDataStats(taskId)
  }
  return request.post<ImportReportDataStats>({
    url: '/api/config-management/order-import/report/data-stats',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 获取导入报告：预览列表 */
export function fetchOrderImportReportPreviewList(params: {
  taskId: string
  page: number
  pageSize: number
}) {
  if (isOrderImportReportEndpointMock(OrderImportReportEndpoint.ReportPreviewList)) {
    return orderImportMock.mockFetchOrderImportReportPreviewList(params)
  }
  return request.post<ImportReportPreviewListData>({
    url: '/api/config-management/order-import/report/preview-list',
    data: params,
    showErrorMessage: false
  })
}

/** 获取导入报告：失败明细列表 */
export function fetchOrderImportReportFailedItems(taskId: string) {
  if (isOrderImportReportEndpointMock(OrderImportReportEndpoint.ReportFailedItems)) {
    return orderImportMock.mockFetchOrderImportReportFailedItems(taskId)
  }
  return request.post<{ records: FailedRecordItem[]; total: number }>({
    url: '/api/config-management/order-import/report/failed-items',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 获取导入报告：失败原因分布 */
export function fetchOrderImportReportErrorDistribution(taskId: string) {
  if (isOrderImportReportEndpointMock(OrderImportReportEndpoint.ReportErrorDistribution)) {
    return orderImportMock.mockFetchOrderImportReportErrorDistribution(taskId)
  }
  return request.post<{ items: ErrorDistributionItem[] }>({
    url: '/api/config-management/order-import/report/error-distribution',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 导出导入报告 */
export async function exportOrderImportReport(taskId: string) {
  if (isOrderImportReportEndpointMock(OrderImportReportEndpoint.ExportReport)) {
    const { blob, fileName } = await orderImportMock.mockExportOrderImportReport(taskId)
    FileSaver.saveAs(blob, fileName)
    return
  }
  const response = await requestBlob({
    url: '/api/config-management/order-import/report/export',
    method: 'POST',
    data: { taskId }
  })
  FileSaver.saveAs(response.data, `import_report_${taskId}_failed.csv`)
}
