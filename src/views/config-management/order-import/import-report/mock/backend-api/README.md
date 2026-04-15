# 导入报告 backend-api 契约清单

父级 API 路径：`/api/config-management/order-import/report`

| 文件 | 接口 | 说明 | 优先级 |
| --- | --- | --- | --- |
| `01-order-import-report-detail.json` | `POST /task-info` | 任务头信息 | P0 |
| `02-order-import-report-data-stats.json` | `POST /data-stats` | 数据统计 | P0 |
| `03-order-import-report-preview-list.json` | `POST /preview-list` | 成功预览分页列表 | P0 |
| `04-order-import-report-failed-items.json` | `POST /failed-items` | 失败明细列表 | P0 |
| `05-order-import-report-error-distribution.json` | `POST /error-distribution` | 失败原因分布 | P0 |
| `06-order-import-report-export.json` | `POST /export` | 导出失败数据报告 | P1 |

## 场景 → 接口（`/order-import/import-report/:taskId`）

| 场景 | 契约文件 | `src/api` |
| --- | --- | --- |
| 任务头信息 | `01-order-import-report-detail.json` | `fetchOrderImportReportTaskInfo` |
| 数据统计卡片 | `02-order-import-report-data-stats.json` | `fetchOrderImportReportDataStats` |
| 成功预览列表+分页 | `03-order-import-report-preview-list.json` | `fetchOrderImportReportPreviewList` |
| 失败明细列表 | `04-order-import-report-failed-items.json` | `fetchOrderImportReportFailedItems` |
| 失败原因分布 | `05-order-import-report-error-distribution.json` | `fetchOrderImportReportErrorDistribution` |
| 下载失败数据 | `06-order-import-report-export.json` | `exportOrderImportReport` |

数据源开关：`../../../config/data-source.ts` → `OrderImportReportApiSource.reportTaskInfo` / `reportDataStats` / `reportPreviewList` / `reportFailedItems` / `reportErrorDistribution` / `exportReport`。
