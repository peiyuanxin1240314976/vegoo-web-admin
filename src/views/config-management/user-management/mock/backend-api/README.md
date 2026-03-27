# 用户管理 · 接口清单

**父级路径（与路由 `/config-management/user-management` 对应）**：`/api/config-management/user`

**联调准绳**：以 `src/api/config-management.ts` 中 `fetchUserTable`、`createUser`、`updateUser` 等**实际 method 与 URL** 为准；下表与契约 JSON 已对齐。若网关统一包裹 `{ code, message, data }`，下文 `sampleResponse` 表示 **unwrap 后的业务体**。

## 接口清单

| 优先级 | 说明 | 逻辑 URL | HTTP（当前实现） | 契约文件 |
| --- | --- | --- | --- | --- |
| P0 | 分页列表 | `/api/config-management/user/table` | POST | `01-table.json` |
| P0 | 新增用户 | `/api/config-management/user` | POST | `02-create.json` |
| P0 | 更新用户 | `/api/config-management/user/:id` | PUT | `03-update.json` |
| P0 | 删除用户 | `/api/config-management/user/:id` | DELETE | `04-delete.json` |
| P0 | 禁用/启用 | `/api/config-management/user/:id/status` | PUT | `05-status.json` |
| P1 | 重置密码 | `/api/config-management/user/:id/reset-password` | POST | `06-reset-password.json` |
| P1 | 重发激活邮件 | `/api/config-management/user/:id/resend-activation` | POST | `07-resend-activation.json` |
| P2 | 导出列表 | `/api/config-management/user/export` | POST | `08-export.json` |

**待迁移为全 POST + JSON（与项目新模块约定一致）**：更新/删除/状态 当前为 `PUT`/`DELETE`，可在后续迭代改为 `POST .../update`、`POST .../delete`、`POST .../status`，body 携带 `id`；详见各契约 `apiSuggestion`。

**缺口**：`08-export.json` 对应能力 **`src/api` 尚未实现** `exportUserList`；页面当前也无导出按钮，以 Mock 列表为主。

## 场景 → 接口（摘要）

| 场景 / 路由 | 触发时机 | 接口（POST/…） | 详见 `interaction` |
| --- | --- | --- | --- |
| 列表首屏与筛选、分页 | 接入远程后初始化与表格交互 | `01-table` | `01-table.json` |
| 新建用户 | UserFormDialog 提交成功 | `02-create` | `02-create.json` |
| 编辑用户 | 表单提交 | `03-update` | `03-update.json` |
| 删除（待激活） | 确认删除 | `04-delete` | `04-delete.json` |
| 禁用 / 启用 | 确认后更新状态 | `05-status` | `05-status.json` |
| 重置密码 | 活跃用户操作确认 | `06-reset-password` | `06-reset-password.json` |
| 发送激活邮件 | 待激活用户行操作 | `07-resend-activation` | `07-resend-activation.json` |
| 导出（预留） | 导出按钮（待 UI） | `08-export` | `08-export.json` |

**当前页面实现**：`views/config-management/user-management/index.vue` 使用 `mock/data.ts` 本地数据，**未调用**上述 `fetch*`；联调时需接 API 并视需要增加 `config/data-source.ts` 按接口粒度切换 Mock（参考 `optimizer-management`）。

## 目录约定

- 契约文件前缀：`01`–`08` + 功能英文词，一接口一 JSON。
- 类型定义：`../types.ts`；请求封装：`@/api/config-management.ts`。
