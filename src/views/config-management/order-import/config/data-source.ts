/**
 * 导入商店订单（`/config-management/order-import` 及报告子路由）数据源开关。
 *
 * - **`true`**：跳过远程，使用页面 mock / 本地逻辑。
 * - **`false`**：调用 `src/api/config-management.ts`。
 */

type UseMock = boolean

export enum OrderImportEndpoint {
  ImportTable = 'importTable',
  ImportSummary = 'importSummary',
  SubmitImport = 'submitImport',
  PauseImport = 'pauseImport',
  CancelImport = 'cancelImport',
  ImportReport = 'importReport',
  ExportReport = 'exportReport'
}

export const OrderImportApiSource: Record<OrderImportEndpoint, UseMock> = {
  [OrderImportEndpoint.ImportTable]: true,
  [OrderImportEndpoint.ImportSummary]: true,
  [OrderImportEndpoint.SubmitImport]: true,
  [OrderImportEndpoint.PauseImport]: true,
  [OrderImportEndpoint.CancelImport]: true,
  [OrderImportEndpoint.ImportReport]: true,
  [OrderImportEndpoint.ExportReport]: true
}
