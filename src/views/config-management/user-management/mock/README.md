# 平台管理 · 用户管理 · Mock / 契约说明

- 数据源开关见 `../config/data-source.ts`，与 `mock/backend-api` 接口一一对应；列表默认走本地 Mock（`mock/system-user-api-mock.ts`），切远程时由 `fetchGetUserList` 请求 `GET /api/user/list`（`@/api/system-manage`）。
- 字段约定以 `Api.SystemManage.UserListItem`、`UserSearchParams`（`src/types/api/api.d.ts`）为准。
- `backend-api/` 为联调用 JSON 契约，与上述类型一致。
