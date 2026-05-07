# agency backend-api 契约索引

父级 API：`/api/config-management/agency`

## 接口清单

| 优先级 | 说明 | 逻辑 URL | 契约文件 |
| --- | --- | --- | --- |
| P0 | 代理商分页列表 | `POST /api/config-management/agency/table` | `01-agency-table.json` |
| P0 | 新建代理商 | `POST /api/config-management/agency` | `02-agency-create.json` |
| P0 | 编辑代理商 | `POST /api/config-management/agency/update` | `03-agency-update.json` |
| P0 | 删除代理商 | `POST /api/config-management/agency/delete` | `04-agency-delete.json` |
| P1 | 代理商导出 | `POST /api/config-management/agency/export` | `05-agency-export.json` |
| P1 | 页面独有筛选项（合作模式/状态） | `POST /api/config-management/agency/filter-options` | `06-agency-filter-options.json` |

## 场景 -> 接口 -> 触发时机

| 场景                   | 接口                            | 触发时机                             |
| ---------------------- | ------------------------------- | ------------------------------------ |
| 列表首屏加载           | `01-agency-table.json`          | `agency-tab.vue` 挂载时加载          |
| 搜索/筛选刷新          | `01-agency-table.json`          | 关键词、合作模式、状态、广告平台变更 |
| 新建提交               | `02-agency-create.json`         | 新建弹窗提交                         |
| 编辑提交               | `03-agency-update.json`         | 编辑弹窗提交                         |
| 删除确认               | `04-agency-delete.json`         | 删除确认弹窗                         |
| 导出                   | `05-agency-export.json`         | 页头导出按钮                         |
| 筛选选项初始化（可选） | `06-agency-filter-options.json` | 页面初始化时加载合作模式/状态下拉    |

## 重要说明（广告平台筛选）

- 广告平台筛选项与 cockpit 同构，页面直接读 `useCockpitMetaFilterStore().data.sourceOptions`。
- 本目录不新增同构 `meta-filter-options` JSON，避免重复契约。
- 业务 POST 请求体中的广告平台筛选键名统一为 `source`（`string`，全部传 `""`）。
