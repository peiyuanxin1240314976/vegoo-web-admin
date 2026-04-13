# 应用管理 · 接口清单

**父级路径**：`/api/config-management/application`

数据源开关：`../config/data-source.ts`（每接口一项，读取方：`src/api/config-management.ts`）。

## 场景 → 接口

| 场景 | 契约文件 | fetch\* |
| --- | --- | --- |
| 进入页 / 筛选 / 分页 / 改每页条数 | `01-application-table.json` | `fetchApplicationTable` |
| 顶部四张统计卡片（与列表响应分离） | `06-application-overview-stats.json` | `fetchApplicationOverviewStats` |
| 筛选与新增/编辑弹窗选项 | `07-application-filter-form-options.json` | `fetchApplicationFilterFormOptions` |
| 上传图标 | `08-application-upload-icon.json` | `uploadApplicationIcon` |
| 新增应用 | `02-application-create.json` | `createApplication` |
| 编辑应用 | `03-application-update.json` | `updateApplication`（当前 **PUT**） |
| 删除应用 | `04-application-delete.json` | `deleteApplication`（当前 **DELETE**） |
| 导出 | `05-application-export.json` | `exportApplicationList` + 本地 CSV |

## 与方法说明

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/table` | 分页列表 |
| POST | `/overview-stats` | 顶部统计卡片 |
| POST | `/filter-form-options` | 筛选与表单下拉选项 |
| POST | `/upload-icon` | 图标上传（multipart） |
| POST | `/` | 新增 |
| PUT | `/:id` | 更新（契约已标注；后续若网关统一 POST JSON 再改契约与 `config-management.ts`） |
| DELETE | `/:id` | 删除 |
| POST | `/export` | 导出 |

详细字段见各 `*.json`。
