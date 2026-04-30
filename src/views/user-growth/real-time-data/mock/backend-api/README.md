## 实时数据 - backend-api 契约

### 父级 API 路径（与 `src/api` 一致）

逻辑前缀：`` `${ANALYSIS_API_BASE}/user-growth/real-time-data` ``，即：

`/api/v1/datacenter/analysis/user-growth/real-time-data`

（`ANALYSIS_API_BASE` 定义见 `src/api/analysis-api-base.ts`。）

对应路由：`/user-growth/real-time-data`（`src/router/modules/user-growth.ts`）。

### `sampleResponse` 约定

与 `src/utils/http` 一致：axios 已解包一层业务 **`data`**。本目录各 JSON 的 `sampleResponse` 表示 **再 unwrap 后的业务体**（与 `src/api/user-growth/real-time-data.ts` 中 `fetch*` 解析结果一致）。若网关仍多包一层 `data`，由 `fetch*` 内 `unwrapDataDeep` 兼容。

### 筛选项（不在本目录）

应用 / 广告平台等筛选项 **不复用** 本模块独立契约，统一使用 **cockpit** 公用接口（与 `paid-analysis` 附录 A 一致）：

- `GET ${ANALYSIS_API_BASE}/cockpit/meta-filter-options`
- 前端：`useCockpitMetaFilterStore`（`src/store/modules/cockpit-meta-filter.ts`）

本页数据接口（01～04）请求体 **不含** `startDate` / `endDate`；实时口径由服务端按业务日/当前时刻处理。

### 接口清单

| 契约文件 | 说明 | 逻辑 URL（POST） | 优先级 |
| --- | --- | --- | --- |
| `01-overview-kpi-summary.json` | 顶部 KPI 四卡 | `.../overview-kpi-summary` | P0 |
| `02-table-app-cards.json` | 应用卡片栅格（火花图，无详情大字段） | `.../table/app-cards` | P0 |
| `03-app-detail.json` | 点击卡片后详情弹窗 | `.../app-detail` | P0 |
| `04-overview-hourly-spend-comparison.json` | 底部「实时小时消耗对比」柱 + ROI 折线 | `.../overview-hourly-spend-comparison` | P0 |

### 场景 → 接口（与各 JSON 根级 `interaction` 一致）

| 用户场景          | 契约 JSON                            | 触发时机                             |
| ----------------- | ------------------------------------ | ------------------------------------ |
| 首屏筛选项        | （公用 cockpit meta-filter-options） | 进入页面初始化（可与 01/02/04 并行） |
| 首屏 KPI          | `01`                                 | 初始化；筛选/刷新                    |
| 卡片列表 + 火花图 | `02`                                 | 初始化；筛选/刷新                    |
| 详情弹窗          | `03`                                 | 点击卡片打开 `AppDetailModal`        |
| 底部对比图        | `04`                                 | 初始化；筛选/刷新                    |

### 拆分原则

- **列表与详情分离**：`02` 仅服务卡片网格；打开弹窗再请求 `03`。
- **KPI / 分时图分离**：顶部汇总与底部小时对比独立。
- **筛选项**：见上文公用 cockpit meta；本页 POST 请求体带 **`appId`**（与 `appOptions[].value` 同源）、**`source`**（与 `sourceOptions[].value` 同源）。

### 数据源开关

按接口粒度配置见 **`../config/data-source.ts`**（与本表 01～04 一一对应）；Mock 实现见 **`../real-time-data-api-mock.ts`**。

### 字段与数据字典

- 应用：**请求体键名 `appId`**（与 cockpit `appOptions[].value`、卡片行 `id` 同源）；不限时 `""`。
- 终端平台：`platform`（若后续按 Android/iOS 区分）。
- 广告平台：请求体 **`source`** 为 **string**（如 `"1"`），不限时 `""`；与 `sourceOptions` 对齐。
- 花费：响应中与 **`cost` 同语义** 的度量在部分 UI 仍显示为 `spend`，联调时在适配层对齐命名。

### JSON 命名

前缀 `01`～`04` 与数据源枚举顺序一致；单路由单页，契约均放在本目录（不再分子路由目录）。
