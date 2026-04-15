# 广告账户管理 · 接口清单

**父级路径**：`/api/config-management/ad-account-management`

## 接口清单

| 优先级 | 说明 | 逻辑 URL | 契约文件 |
| --- | --- | --- | --- |
| P0 | 广告账户分页列表 | `POST /api/config-management/ad-account-management/account/table` | `01-account-table.json` |
| P0 | 顶部统计卡片 | `POST /api/config-management/ad-account-management/account/overview-stats` | `02-overview-stats.json` |
| P0 | 新增广告账户 | `POST /api/config-management/ad-account-management/account/create` | `03-account-create.json` |
| P0 | 编辑广告账户 | `POST /api/config-management/ad-account-management/account/update` | `04-account-update.json` |
| P0 | 启用广告账户 | `POST /api/config-management/ad-account-management/account/enable` | `05-account-enable.json` |
| P0 | 禁用广告账户 | `POST /api/config-management/ad-account-management/account/disable` | `06-account-disable.json` |
| P0 | 删除广告账户 | `POST /api/config-management/ad-account-management/account/delete` | `07-account-delete.json` |
| P1 | 导出广告账户列表 | `POST /api/config-management/ad-account-management/account/export` | `08-account-export.json` |

## 场景 -> 接口 -> 触发时机

| 页面场景 | 触发时机 | 契约 JSON | 说明 |
| --- | --- | --- | --- |
| 页面首屏进入 | `index.vue` 首次渲染 | `01-account-table.json` + `02-overview-stats.json` | 表格与统计卡片并行加载 |
| 搜索/筛选变化 | 搜索框输入、应用/平台/广告平台/状态切换 | `01-account-table.json` + `02-overview-stats.json` | 统计口径与列表保持一致 |
| 分页变化 | 页码或每页条数变化 | `01-account-table.json` | 统计卡片可不重复请求，也可按实现保持并行 |
| 新增账户保存 | 新增弹窗点击“保存” | `03-account-create.json` | 成功后关闭弹窗并刷新列表/统计 |
| 编辑账户保存 | 详情弹窗编辑态点击“保存” | `04-account-update.json` | 成功后关闭编辑态并刷新列表 |
| 启用账户 | 列表行点击“启用”并确认 | `05-account-enable.json` | 仅对当前 `status=disabled` 的记录触发 |
| 禁用账户 | 列表行点击“禁用”并确认 | `06-account-disable.json` | 仅对当前 `status=enabled` 的记录触发 |
| 删除账户 | 列表行点击“删除”并确认 | `07-account-delete.json` | 成功后刷新列表与统计 |
| 导出当前筛选结果 | 页面头部点击“导出” | `08-account-export.json` | 沿用当前搜索与筛选条件 |

## 表单与字段约定

- 列表查询使用 `keyword` 模糊匹配 `appName`、`appId`、`managerAccount`。
- 筛选与请求体维度键名：`appId`、`platform`、`source`（取值与公用 `GET .../cockpit/meta-filter-options` 的 `appOptions` / `platformOptions` / `sourceOptions` 的 `value` 一致；「全部」为 `""`）。**不在本目录重复 meta 契约**，见付费分析 `mock/backend-api/README.md` 附录 A。
- 新增表单提交：`appId`、`platform`、`source`、`managerAccount`、`credential`、`adAccounts`、`token`；可选带 `appName` 供展示。
- 编辑保存提交：`appId`、`appName`、`platform`、`source`、`managerAccount`、`credential`、`adAccounts`、`token`，响应体仍返回完整账户对象。
- `adAccounts` 无数据时固定返回 `[]`，不要返回 `null`。
- `token` 无值时固定返回 `null`；有值时返回完整字符串，前端自行做掩码显示。

## 空态与错误兜底

- 列表无数据时返回 `records: []`、`total: 0`，`current` 与 `size` 保持请求值。
- 统计无数据时返回 `total: 0`、`enabled: 0`、`disabled: 0`、`platformCount: 0`。
- 保存类接口字段校验失败时，建议网关 `message` 直接返回可展示文案，例如“管理账户不能为空”“广告账户 ID 不可重复”。
- 删除/启用/禁用接口若目标记录不存在，建议返回明确业务错误，避免前端误判为成功。
