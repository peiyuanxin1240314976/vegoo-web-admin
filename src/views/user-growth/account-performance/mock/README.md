## 账户成效页 - Mock 说明

该目录用于 `src/views/user-growth/account-performance` 页面在 Mock 阶段的模拟数据与接口契约沉淀。

### 当前已存在的 Mock

- 页面整体数据来自 `mock/data.ts`（包含 KPI、表格树、图表数据、预警事项等）。
- `modules/app-performance-placeholder.vue`、`modules/platform-performance-placeholder.vue` 在当前实现中为“自包含 mock”（表格数据直接写在组件内部）。

### 本次新增的内容

- 为新增的两个 placeholder 表格补齐 `mock/backend-api/` 下的接口契约 JSON（用于后续对接真实接口时替换数据源）。
