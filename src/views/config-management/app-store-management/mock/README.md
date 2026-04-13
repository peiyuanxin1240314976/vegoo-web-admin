# 应用商店凭据管理 Mock 说明

本目录用于 `app-store-management` 页面的接口契约与联调示例。

- 接口契约位于 `./backend-api/*.json`，一接口一文件。
- 契约 JSON 包含 `fieldDescription`、`sampleRequest`、`sampleResponse`、`api`、`interaction`。
- 数据源开关见 `../config/data-source.ts`，与 `backend-api` 接口一一对应。
- 页面需保证接口失败或空数据时仍可展示筛选区、统计卡片与表格结构。
