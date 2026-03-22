# 收入概览（revenue-overview）Mock 说明

本目录为 **商业洞察 / 收入概览** 页面的 Mock 与界面契约。

- **页面数据来源**：`../mock.ts` 导出常量，供 `index.vue` 直接引用（开发预览与图表初始化）。
- **后端契约（源文件）**：**仅** `backend-api/` 目录下各 JSON（含 `fieldDescription`、`sampleRequest` / `sampleResponse`、`api`）；入口索引见 `backend-api/00-endpoints-index.json`。联调以契约为准；契约与 `mock.ts` 字段风格不一致处（如 snake_case / camelCase）在对应契约 `apiSuggestion` 中说明，接入时在 `fetch` 或页面侧映射。
- **数据源开关**：本页目前未接远端开关；若后续接入，请在 **`src/views/business-insight/revenue-overview/config/`** 按接口粒度配置（见项目 `module-api-mock-config`）。
