# 导入商店订单 backend-api 契约清单

父级 API 路径：`/api/config-management/order-import`

| 文件 | 接口 | 说明 | 优先级 |
|---|---|---|---|
| `01-order-import-table.json` | `POST /table` | 导入任务分页列表 | P0 |
| `02-order-import-summary.json` | `POST /summary` | 今日导入统计 | P0 |
| `03-order-import-submit.json` | `POST /submit` | 提交导入任务 | P0 |
| `04-order-import-pause.json` | `POST /pause` | 暂停导入任务 | P1 |
| `05-order-import-cancel.json` | `POST /cancel` | 取消导入任务 | P1 |
| `06-order-import-report.json` | `POST /report` | 报告详情 | P0 |
| `07-order-import-report-export.json` | `POST /report/export` | 导出报告 | P1 |
| `08-order-import-template.json` | `GET /template` | 下载导入模板 | P1 |
