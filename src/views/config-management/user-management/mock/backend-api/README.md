# 用户管理 · 接口清单

**父级路径（与路由 `/config-management/user-management` 对应）**：`/api/config-management/user`

**联调准绳**：以 `src/api/config-management.ts` 中 **method 与 URL** 为准；下表与契约 JSON 已对齐。若网关统一包裹 `{ code, message, data }`，各 JSON 的 `sampleResponse` 表示 **unwrap 后的业务体**。

---

## 页面模块与文件位置

| 区域 | 文件 | 说明 |
| --- | --- | --- |
| 页面入口 | `views/config-management/user-management/index.vue` | 顶栏、KPI、筛选、表格、分页 |
| 用户抽屉 | `modules/user-detail-drawer.vue` | 行点击展开；内可编辑角色/应用/备注、触发禁用等 |
| 表单弹窗 | `modules/user-form-dialog.vue` | 「新建用户」与「编辑」共用 |

**数据现状**：入口通过 **`@/api/config-management`** 调用 `fetchUser*` 等；Mock 与远程由 **`config/data-source.ts`**（`UserEndpoint`）按接口切换。

---

## 页面交互 → 契约 / API（细表）

| 交互（用户操作） | 界面位置 / 处理器 | 建议调用的 API | 契约 JSON |
| --- | --- | --- | --- |
| 进入页面、筛选、改每页条数、翻页、跳转页 | `loadTable` / `loadStats`；筛选变更会重置到第 1 页 | **`fetchUserTable`**（请求体对齐 `UserTableQuery`） | `01-table.json` |
| 点击「新建用户」并提交表单 | 顶栏按钮 → `handleAdd` → `UserFormDialog` → `@success` → **`handleFormSuccess`**（`payload` 无 `id` 时视为新建） | **`createUser`** | `02-create.json` |
| 表格行「编辑」或抽屉内「编辑」 | **`handleEdit`** → 打开 `UserFormDialog`；提交成功且 `payload.id` 存在 | **`updateUser`** | `03-update.json` |
| 表格行「删除」（仅 **待激活** 状态展示） | **`handleDeleteConfirm`**，二次确认后从本地列表移除 | **`deleteUser`** | `04-delete.json` |
| 表格行「禁用」（**活跃** 用户） | **`handleToggleStatus`**：`next` 为 `已禁用` | **`updateUserStatus`**（`id` + `status: '已禁用'` 或后端约定枚举） | `05-status.json` |
| 表格行「启用」（**已禁用** 用户） | 同上 **`handleToggleStatus`**：`next` 为 `活跃` | **`updateUserStatus`** | `05-status.json` |
| 抽屉内保存角色 / 可访问应用 / 备注 | `UserDetailDrawer` → **`@save`** → **`handleDrawerSave`**（本地合并字段） | 联调时可 **`updateUser`**（提交完整 `UserFormPayload` 或与后端约定 PATCH 字段） | `03-update.json` |
| 表格行「重置密码」（**活跃** 用户） | **`handleResetPassword`**，确认后当前仅 `ElMessage` | **`resetUserPassword`** | `06-reset-password.json` |
| 表格行「发送激活邮件」（**待激活**） | **`handleResendActivation`**，当前仅 `ElMessage` | **`resendUserActivation`** | `07-resend-activation.json` |
| 导出当前筛选结果为文件 | **无**：页面无导出按钮；`08-export` 为预留契约 | **`exportUserList`** | `08-export.json` |
| 「批量操作」按钮 | 筛选栏 **`btn-batch`**：当前无 `@click` 业务，仅占位 | 无协议定接口 | — |

**状态与操作列逻辑（表格 `index.vue` 模板）**：

- **待激活**：显示「发送激活邮件」「删除」，不显示禁用/重置密码。
- **已禁用**：仅「启用」。
- **活跃**：「重置密码」「禁用」。

---

## 接口清单（汇总）

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

**说明**：`exportUserList` 已在 `config-management.ts` 实现并与 `UserEndpoint.Export` / `mockExportUserList` 对齐；页面可无导出入口。

---

## 各契约内的 `interaction`

联调与测试场景仍以各 JSON 根级 **`interaction`**（若有）为准；本 README 的「页面交互 → 契约」表与之互补。

---

## 目录约定

- 契约文件前缀：`01`–`08` + 功能英文词，一接口一 JSON。
- 类型定义：`../types.ts`；请求封装：`@/api/config-management.ts`。
