# 广告账户模块说明（`/account-management/ad-account`）

本页面为账户管理广告账户入口，页面实现位于 `index.vue`，并复用配置管理账户管理子模块能力。为方便按目录检索，当前目录已补充本地契约索引：`mock/backend-api/README.md`。

复用关系如下：

- 组件复用：`@/views/config-management/account-management/modules/ad-account-tab.vue`
- API 复用：`@/api/config-management/account-management`
- 数据源开关：`@/views/config-management/account-management/config/data-source`
- 接口契约：`@/views/config-management/account-management/mock/backend-api`

## 当前路由对应接口（广告账户子域）

- 列表：`POST /api/config-management/account/table`（契约：`01-account-table.json`）
- 新建：`POST /api/config-management/account`（契约：`02-account-create.json`）
- 编辑：`POST /api/config-management/account/update`（契约：`03-account-update.json`）
- 充值：`POST /api/config-management/account/recharge`（契约：`04-account-recharge.json`）
- 停用：`POST /api/config-management/account/disable`（契约：`05-account-disable.json`）
- 启用：`POST /api/config-management/account/enable`（契约：`06-account-enable.json`）
- 导出：`POST /api/config-management/account/export`（契约：`07-account-export.json`）
- 导入：`POST /api/config-management/account/import`（契约：`21-account-import.json`）

## 入参规范对齐说明

- 应用筛选入参统一使用 `appId`（字符串，全部传 `""`），不再使用 `app` 作为筛选主键。
- 广告平台筛选使用 `source`（字符串），全部传 `""`。
- 所有接口方法均为 `POST`，请求体为 JSON。
