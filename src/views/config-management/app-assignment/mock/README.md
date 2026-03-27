# 应用分配 · Mock 说明

静态示例见 `data.ts`（当前页面首屏数据源）。接口契约与联调示例见 **`backend-api/README.md`**。  
数据源开关：**`../config/data-source.ts`**（`AppAssignmentEndpoint`）；Mock 实现：**`app-assignment-api-mock.ts`**；HTTP 封装：`src/api/config-management.ts` 中 `fetchAppAssignment*` / `createAppAssignment` / `updateAppAssignment` / `exportAppAssignmentList`。
