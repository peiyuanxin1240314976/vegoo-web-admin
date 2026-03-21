# 优化师管理 · Mock 说明

- `data.ts`：本地演示用 `systemUsers`（新建关联用户下拉）、`cloneOptimizerMockList()`（可变列表种子）。
- `backend-api/`：与网关路径 `/api/config-management/optimizer/*` 对应的契约（见目录内 README）。

页面类型见 `../types.ts`，请求封装见 `@/api/config-management`（`fetchOptimizerTable`、`fetchOptimizerOverview` 等）。

页面在接口可用时使用远端列表与统计；请求失败时自动回退为本地 Mock，不阻塞开发。
