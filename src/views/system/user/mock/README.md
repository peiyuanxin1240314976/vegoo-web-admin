# 系统管理 · 用户管理 · Mock / 契约说明

- 列表数据由 `GET /api/user/list` 返回（见 `@/api/system-manage`）。
- 字段约定以 `Api.SystemManage.UserListItem`、`UserSearchParams`（`src/types/api/api.d.ts`）为准。
- `backend-api/` 为联调用 JSON 契约，与上述类型一致。
