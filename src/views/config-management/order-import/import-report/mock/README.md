# 导入报告 Mock 说明

本目录用于 `order-import/import-report` 子页面的本地数据与接口契约：

- `backend-api/`：报告详情与导出契约（与列表页契约分离维护）。

数据源开关仍复用上级模块：`../../config/data-source.ts` （`OrderImportReportApiSource.importReport` / `exportReport`）。
