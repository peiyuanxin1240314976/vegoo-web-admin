# 导入商店订单 backend-api 契约清单

父级 API 路径：`/api/config-management/order-import`

| 文件                           | 接口            | 说明             | 优先级 |
| ------------------------------ | --------------- | ---------------- | ------ |
| `01-order-import-table.json`   | `POST /table`   | 导入任务分页列表 | P0     |
| `02-order-import-summary.json` | `POST /summary` | 今日导入统计     | P0     |
| `03-order-import-submit.json`  | `POST /submit`  | 提交导入任务     | P0     |
| `04-order-import-pause.json`   | `POST /pause`   | 暂停导入任务     | P1     |
| `05-order-import-cancel.json`  | `POST /cancel`  | 取消导入任务     | P1     |

## 场景 → 接口

| 场景 | 路由 | 契约文件 | `src/api` |
| --- | --- | --- | --- |
| 任务列表 + KPI | `/config-management/order-import` | `01` / `02` | `fetchOrderImportTable` / `fetchOrderImportSummary` |
| 提交文件导入 | 同上 | `03` | `submitOrderImport`（FormData） |
| 暂停 / 取消任务 | 同上 | `04` / `05` | `pauseOrderImport` / `cancelOrderImport` |
| 报告详情 / 导出 | `/order-import/import-report/:taskId` | 见 `../../import-report/mock/backend-api/README.md` | `fetchOrderImportReportTaskInfo` / `fetchOrderImportReportDataStats` / `fetchOrderImportReportPreviewList` / `fetchOrderImportReportFailedItems` / `fetchOrderImportReportErrorDistribution` / `exportOrderImportReport` |

开关：[`../../config/data-source.ts`](../../config/data-source.ts) → `OrderImportListApiSource`（`isOrderImportListEndpointMock`）。
