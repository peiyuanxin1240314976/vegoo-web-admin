# 应用管理 · Mock 说明

- `data.ts`：列表种子 `APPLICATION_MOCK_SEED`、类别/创建人选项；`cloneApplicationMockList()` 供 **`application-api-mock.ts`** 初始化内存列表（页面不直接引用）。
- `application-api-mock.ts`：与 `backend-api` 契约一致；是否走 Mock 由 **`../config/data-source.ts`** 决定。
- `backend-api/`：契约与场景表见目录内 `README.md`。

页面类型见 `../types.ts`，请求统一走 `@/api/config-management`。
