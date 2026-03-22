# 收入概览（revenue-overview）Mock 说明

本目录为 **商业洞察 / 收入概览** 页面的 Mock 与界面契约。

- **页面数据来源**：`../mock.ts` 导出常量，供 `index.vue` 直接引用（开发预览与图表初始化）。
- **后端契约**：`backend-api/` 内 JSON 为接口契约源文件，与 `mock.ts` 中数值与结构对齐；联调时以契约为准。
- **数据源开关**：本页目前未接远端开关；若后续接入，请在 **`src/views/business-insight/revenue-overview/config/`** 按接口粒度配置（见项目 `module-api-mock-config`）。
