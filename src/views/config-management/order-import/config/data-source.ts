/**
 * 导入商店订单（列表页 + 报告页）数据源开关。
 *
 * - true: 走 `mock/order-import-api-mock.ts`
 * - false: 走真实网关
 */
type UseMock = boolean

/** 列表页与导入弹窗能力 */
export enum OrderImportListEndpoint {
  ImportTable = 'importTable',
  ImportSummary = 'importSummary',
  SubmitImport = 'submitImport',
  PauseImport = 'pauseImport',
  CancelImport = 'cancelImport'
}

/** 报告页能力 */
export enum OrderImportReportEndpoint {
  ReportTaskInfo = 'reportTaskInfo',
  ReportDataStats = 'reportDataStats',
  ReportPreviewList = 'reportPreviewList',
  ReportFailedItems = 'reportFailedItems',
  ReportErrorDistribution = 'reportErrorDistribution',
  ExportReport = 'exportReport'
}

export const OrderImportListApiSource: Record<OrderImportListEndpoint, UseMock> = {
  [OrderImportListEndpoint.ImportTable]: true,
  [OrderImportListEndpoint.ImportSummary]: true,
  [OrderImportListEndpoint.SubmitImport]: true,
  [OrderImportListEndpoint.PauseImport]: true,
  [OrderImportListEndpoint.CancelImport]: true
}

export const OrderImportReportApiSource: Record<OrderImportReportEndpoint, UseMock> = {
  [OrderImportReportEndpoint.ReportTaskInfo]: true,
  [OrderImportReportEndpoint.ReportDataStats]: true,
  [OrderImportReportEndpoint.ReportPreviewList]: true,
  [OrderImportReportEndpoint.ReportFailedItems]: true,
  [OrderImportReportEndpoint.ReportErrorDistribution]: true,
  [OrderImportReportEndpoint.ExportReport]: true
}

export function isOrderImportListEndpointMock(endpoint: OrderImportListEndpoint): boolean {
  return OrderImportListApiSource[endpoint]
}

export function isOrderImportReportEndpointMock(endpoint: OrderImportReportEndpoint): boolean {
  return OrderImportReportApiSource[endpoint]
}
