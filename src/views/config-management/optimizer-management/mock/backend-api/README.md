# 优化师管理 · 接口清单

**路由**：`/config-management/optimizer-management`。

**父级路径**：`/api/config-management/optimizer`

**约定**：与项目规范一致，**所有接口均为 POST + JSON**（含更新，见 `05-optimizer-update.json`）。  
`sampleResponse` 表示网关 **unwrap 后的 `data`**，与 `request.post` 泛型一致（`meta-system-users` 根类型为 **数组**）。

## 1. 接口清单

| 优先级 | 契约文件 | URL（逻辑） | 说明 |
| --- | --- | --- | --- |
| P0 | `01-optimizer-table.json` | `POST .../table` | 分页列表 |
| P0 | `02-optimizer-overview.json` | `POST .../overview` | 页头 KPI |
| P0 | `03-meta-system-users.json` | `POST .../meta-system-users` | 新建弹窗：关联用户下拉 |
| P0 | `04-optimizer-create.json` | `POST .../optimizer` | 新增 |
| P0 | `05-optimizer-update.json` | `POST .../optimizer/update` | 更新（body 含 `id`） |
| P1 | `06-optimizer-export.json` | `POST .../export` | 导出（HTTP 文件流，`requestBlob`） |

## 2. 场景 → 接口

| 场景 | POST | 契约 | 说明 |
| --- | --- | --- | --- |
| 首屏 | `overview` + `table`（+ `meta-system-users`） | 02、01、03 | 详见各 JSON 的 `interaction` |
| 筛选/分页 | `table` | 01 | `refreshTable` |
| 筛选后 KPI（远程表模式） | `overview` | 02 | `refreshOverview` |
| 新增提交 | `create` | 04 | 路径为 `POST /api/config-management/optimizer` |
| 编辑提交 | `update` | 05 | 非 PUT |
| 导出 | `export` | 06 | 失败时页面 CSV 兜底 |

## 3. 拆分原则

- 列表与 KPI **分开**，表格分页场景下不依赖当前页推算全量统计。
- 「关联用户」独立 **meta**，不把整站用户塞进列表接口。

## 4. 实现与开关

- HTTP + Mock 分支：`src/api/config-management.ts`（`fetchOptimizer*`、`createOptimizer`、`updateOptimizer`、`exportOptimizerList`）。
- Mock 实现：`../optimizer-api-mock.ts`。
- 按接口开关：`../../config/data-source.ts`（`OptimizerEndpoint`）。

## 5. 历史迁移

- **更新**：由 `PUT /optimizer/:id` 调整为 **`POST /optimizer/update`**，请求体包含 `id`（与 `src/api` 一致）。存量网关若仍用 PUT，须在 README 或网关文档中单列差异直至对齐。
