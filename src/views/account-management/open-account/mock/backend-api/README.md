# open-account backend-api 契约索引

父级 API：`/api/account-management/open-account`

## 接口清单

- `01-open-account-table.json`：开户记录分页列表（P0）
- `02-open-account-create.json`：新建开户记录（P0）
- `03-open-account-assign.json`：分配凭据并激活（P0）
- `04-open-account-delete.json`：删除开户记录（P0）
- `05-open-account-feishu-config-fetch.json`：飞书推送配置读取（P1）
- `06-open-account-feishu-config-save.json`：飞书推送配置保存（P1）
- `07-open-account-export.json`：开户记录导出（P1）
- `08-open-account-filter-options.json`：开户状态/代理商筛选项（P0）

## 场景 -> 接口

| 场景              | 触发时机                   | 契约 JSON                                  |
| ----------------- | -------------------------- | ------------------------------------------ |
| 列表首屏加载      | 页面进入后加载记录         | `01-open-account-table.json`               |
| 新建开户          | 点击新建后提交             | `02-open-account-create.json`              |
| 分配凭据          | 待分配行点击分配并确认     | `03-open-account-assign.json`              |
| 删除记录          | 行操作删除并确认           | `04-open-account-delete.json`              |
| 飞书状态展示      | 页面加载或设置弹窗打开     | `05-open-account-feishu-config-fetch.json` |
| 飞书状态更新      | 设置保存                   | `06-open-account-feishu-config-save.json`  |
| 导出记录          | 点击导出按钮               | `07-open-account-export.json`              |
| 状态/代理商筛选项 | 页面初始化，筛选组件渲染前 | `08-open-account-filter-options.json`      |

## 公用顶栏 meta 说明（无独立 JSON）

本页面应用/广告平台选项与 cockpit 同构，直接读取 `useCockpitMetaFilterStore().data`；不在本目录重复维护 `meta-filter-options` 契约 JSON。
