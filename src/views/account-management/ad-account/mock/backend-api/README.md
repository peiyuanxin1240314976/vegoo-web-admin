# ad-account backend-api（本地契约）

当前路由：`/account-management/ad-account`

本目录维护广告账户页面本地契约 JSON；实现代码与开关位于：

- API：`src/api/config-management/account-management.ts`
- 数据源开关：`src/views/config-management/account-management/config/data-source.ts`

## 接口清单

| 优先级 | 说明 | 逻辑 URL | 契约文件 |
| --- | --- | --- | --- |
| P0 | 广告账户列表 | `POST /api/config-management/account/table` | `01-account-table.json` |
| P0 | 新建广告账户 | `POST /api/config-management/account` | `02-account-create.json` |
| P0 | 编辑广告账户 | `POST /api/config-management/account/update` | `03-account-update.json` |
| P0 | 账户充值 | `POST /api/config-management/account/recharge` | `04-account-recharge.json` |
| P0 | 停用账户 | `POST /api/config-management/account/disable` | `05-account-disable.json` |
| P0 | 启用账户 | `POST /api/config-management/account/enable` | `06-account-enable.json` |
| P1 | 广告账户导出 | `POST /api/config-management/account/export` | `07-account-export.json` |
| P1 | 批量导入广告账户 | `POST /api/config-management/account/import` | `21-account-import.json` |

## 场景 -> 接口 -> 触发时机

| 场景              | 接口                       | 触发时机                               |
| ----------------- | -------------------------- | -------------------------------------- |
| 列表首屏加载      | `01-account-table.json`    | 页面进入后 `ad-account-tab` 初始化加载 |
| 筛选 / 搜索后重载 | `01-account-table.json`    | 筛选项变化或关键词搜索触发刷新         |
| 新建账户提交      | `02-account-create.json`   | 新建弹窗点击保存                       |
| 编辑账户提交      | `03-account-update.json`   | 编辑弹窗点击保存修改                   |
| 账户充值提交      | `04-account-recharge.json` | 充值弹窗确认                           |
| 账户停用确认      | `05-account-disable.json`  | 停用弹窗确认                           |
| 账户启用          | `06-account-enable.json`   | 列表行内点击启用                       |
| 导出账户          | `07-account-export.json`   | 页头导出按钮                           |
| 批量导入          | `21-account-import.json`   | 页头批量导入按钮                       |

## 入参规范（本页）

- 应用筛选键名：`appId`（`string`，全部传 `""`）
- 广告平台筛选键名：`source`（`string`，全部传 `""`）
- 请求方法：`POST` + JSON body
