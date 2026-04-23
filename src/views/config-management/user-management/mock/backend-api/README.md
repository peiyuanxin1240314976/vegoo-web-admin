# 平台管理 · 用户管理 · 接口清单

**路由**：`/config-management/user-management`  
**父级路径**：`/api/config-management/user-management`  
**数据源开关**：`../config/data-source.ts`（与各 `fetch*` 一一对应；默认远程，单接口可切 Mock）。

## 接口清单

| 优先级 | 说明 | 逻辑 URL | 方法 | 契约文件 |
| --- | --- | --- | --- | --- |
| P0 | 分页用户列表 | `/table` | POST | `01-user-list.json` |
| P0 | 筛选/弹窗元数据（角色+状态） | `/meta-options` | POST | `02-user-meta-options.json` |
| P0 | 新建用户 | `/create` | POST | `03-user-create.json` |
| P0 | 编辑用户基础信息 | `/update` | POST | `04-user-update.json` |
| P0 | 右侧权限面板保存（角色/应用/备注） | `/permission-update` | POST | `05-user-permission-update.json` |
| P0 | 禁用用户（非物理删除） | `/disable` | POST | `06-user-disable.json` |
| P0 | 应用权限弹窗 · 选项 | `/app-permissions/options` | GET | `07-user-app-permissions-options.json` |
| P0 | 应用权限弹窗 · 保存 | `/app-permissions` | POST | `08-user-app-permissions-save.json` |

**网关前缀（与代码一致）**：`/api/v1/datacenter/analysis/config-management/user`；上表逻辑 URL 为相对该前缀的路径。

## 场景 → 接口

| 场景 | 契约文件 | 触发时机摘要 |
| --- | --- | --- |
| 页面首屏加载列表 | `01-user-list.json` | `index.vue` 的 `useTable` 初始化 |
| 搜索/筛选/分页/刷新 | `01-user-list.json` | 关键词、角色、状态、分页变化 |
| 页面首屏加载筛选项 | `02-user-meta-options.json` | 进入页面后加载角色与状态选项 |
| 新建用户弹窗提交 | `03-user-create.json` | 点击「新建用户」并提交 |
| 编辑用户弹窗提交 | `04-user-update.json` | 列表行编辑弹窗提交 |
| 右侧面板点击保存 | `05-user-permission-update.json` | 修改角色、应用、备注后保存 |
| 列表删除/右侧禁用确认 | `06-user-disable.json` | 两处禁用动作共用 |
| 列表操作打开应用权限 | `07-user-app-permissions-options.json` | 弹窗打开后按 userId 拉选项与回显 |
| 应用权限弹窗保存 | `08-user-app-permissions-save.json` | 提交 allowedAppUuids |

## 联调与落地说明

- 当前代码中的列表请求为 `GET /api/user/list`（`src/api/system-manage.ts`），本契约已按统一规范升级为 `POST` 逻辑 URL；建议后端优先按本目录契约实现，同时保留历史 GET 直到前端完成切换。
- 所有契约 `sampleResponse` 均为可直接联调的完整示例；表格类接口满足主数组至少 3 条，且状态枚举全部覆盖。
- 空态约定：分页列表无数据返回 `records: []`、`total: 0`、`current/size` 保持请求值；写操作失败返回业务错误码并附错误信息，不改变响应结构。
