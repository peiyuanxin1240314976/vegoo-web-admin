# open-account backend-api 契约索引

父级 API：`/api/account-management/open-account`

## 接口清单

- `00-subject-setting-overview-cards.json`：顶部卡片统计（P0）
- `01-subject-setting-list.json`：主体配置分页列表查询（P0）
- `02-subject-setting-save.json`：主体保存（新建/编辑）（P0）
- `03-subject-setting-toggle-platform.json`：平台开关快速切换（P0）
- `04-subject-setting-license-upload.json`：营业执照上传（P0）
- `05-subject-setting-delete.json`：主体删除（P0）
- `07-subject-setting-filter-options.json`：筛选下拉选项（平台状态/执照状态/排序）（P1）

## 场景 -> 接口

| 场景 | 触发时机 | 契约 JSON |
| --- | --- | --- |
| 顶部卡片加载 | 页面进入后拉取统计卡片 | `00-subject-setting-overview-cards.json` |
| 列表首屏加载 | 页面进入后自动拉取分页列表 | `01-subject-setting-list.json` |
| 筛选查询 | keyword / 平台状态 / 执照状态 / 排序变化 | `01-subject-setting-list.json` |
| 分页切换 | 页码或每页条数变化 | `01-subject-setting-list.json` |
| 新建主体 | 抽屉 mode=create 点击保存 | `02-subject-setting-save.json` |
| 编辑主体 | 表格行点击编辑后保存 | `02-subject-setting-save.json` |
| 快速切平台状态 | 表格行内 Facebook/TikTok 开关切换 | `03-subject-setting-toggle-platform.json` |
| 营业执照上传 | 抽屉上传执照文件 | `04-subject-setting-license-upload.json` |
| 删除主体 | 列表行删除并确认 | `05-subject-setting-delete.json` |
| 筛选选项加载 | 筛选栏初始化时拉取平台/执照/排序下拉 | `07-subject-setting-filter-options.json` |

## 说明

- 本目录契约按页面需求拆分：卡片统计与分页列表分离。
- 接口统一采用 `POST + JSON body`。
- 页面当前优先使用 `07-subject-setting-filter-options.json` 驱动筛选栏三项下拉。
