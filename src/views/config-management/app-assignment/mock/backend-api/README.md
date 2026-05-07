# 应用分配 · 接口清单（契约目录）

**路由**：`/config-management/app-assignment`（菜单「应用分配」）。

**父级 API 路径**：`/api/config-management/app-assignment`  
**约定**：一律 **POST + JSON** 请求体；网关统一 `{ code, message, data }` 时，各 JSON 的 `sampleResponse` 表示 **unwrap 后的 `data`**，与 `request.post` 泛型一致。**例外**：`09-app-assignment-export` 响应为 **二进制文件流**（非 JSON `data`），前端使用 `requestBlob`。

## 1. 接口清单

| 优先级 | 契约文件 | URL（逻辑） | 说明 |
| --- | --- | --- | --- |
| P0 | `01-app-assignment-overview.json` | `POST .../overview` | 页头 KPI（总分配数、活跃、未分配应用、优化师数） |
| P0 | `02-app-assignment-meta-filter-options.json` | `POST .../meta-filter-options` | 筛选项：优化师（广告平台见公用 cockpit `sourceOptions`） |
| P0 | `03-app-assignment-meta-assignable-apps.json` | `POST .../meta-assignable-apps` | 新建弹窗：可选应用（已配置绩效目标） |
| P0 | `04-app-assignment-meta-performance-versions.json` | `POST .../meta-performance-versions` | 按应用拉取可选绩效配置版本 |
| P0 | `05-app-assignment-table.json` | `POST .../table` | 分页列表（筛选 + 分页） |
| P1 | `06-app-assignment-detail.json` | `POST .../detail` | 单条详情（抽屉内刷新；列表精简时可必填） |
| P0 | `07-app-assignment-create.json` | `POST .../` | 新建分配 |
| P0 | `08-app-assignment-update.json` | `POST .../update` | 编辑分配 |
| P1 | `09-app-assignment-export.json` | `POST .../export` | 导出列表 |

## 2. 场景 → 接口（页面分组）

| 场景 | 接口（POST） | 契约 | 说明 |
| --- | --- | --- | --- |
| 列表首屏 | `overview`、`meta-filter-options`、`table` | 01、02、05 | 可与 `table` 并行；KPI 亦可由 01 独立提供；广告平台筛选项读 `useCockpitMetaFilterStore().data` |
| 修改筛选 / 翻页 | `table` | 05 | `keyword` / `platform` / `source` / `optimizer` / `status` + `current` / `size` |
| 点击行开抽屉 | 可用列表行数据；若列表无大字段则 `detail` | 06 | 详见 06 的 `interaction` |
| 新建 · 打开弹窗 | `meta-assignable-apps`；选应用后 `meta-performance-versions` | 03、04 | 详见对应 JSON `interaction` |
| 新建 · 提交 | `create`（路径 `POST /`） | 07 | `assignment-form-dialog` 提交 |
| 编辑 · 提交 | `update` | 08 | 同上，`id` 必填 |
| 导出 | `export` | 09 | 页头「导出」；**文件流**（`requestBlob` + `Content-Disposition`） |

## 3. 目录约定

- 编号前缀 `01–09` + 模块名，与本目录下一接口一 JSON。
- **无**子页面路由，契约不分散到其他 `views` 子目录。
- Mock 实现：`../app-assignment-api-mock.ts`；开关：`../../config/data-source.ts`（`AppAssignmentEndpoint`）。

## 4. 与代码对齐

- 类型：`src/views/config-management/app-assignment/types.ts`
- `fetch*`：`src/api/config-management/app-assignment.ts`（`fetchAppAssignment*`、`createAppAssignment`、`updateAppAssignment`、`exportAppAssignmentList`）
