# 应用管理 · Mock 说明

- `data.ts`：列表种子数据 `APPLICATION_MOCK_SEED`、类别/创建人选项；`cloneApplicationMockList()` 供页面初始化可变列表。
- `backend-api/`：与网关路径 `/api/config-management/application/*` 对应的契约说明（见目录内 README）。

页面类型见 `../types.ts`，请求封装见 `@/api/config-management`。
