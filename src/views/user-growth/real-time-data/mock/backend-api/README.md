## 实时数据 - backend-api 契约

### 父级 API 路径（与 `src/api` 一致）

逻辑前缀：`` `${ANALYSIS_API_BASE}/user-growth/real-time-data` ``，即：

`/api/v1/datacenter/analysis/user-growth/real-time-data`

（`ANALYSIS_API_BASE` 定义见 `src/api/analysis-api-base.ts`。）

对应路由：`/user-growth/real-time-data`（`src/router/modules/user-growth.ts`）。

### `sampleResponse` 约定

与 `src/utils/http` 一致：axios 已解包一层业务 **`data`**。本目录各 JSON 的 `sampleResponse` 表示 **再 unwrap 后的业务体**（与 `src/api/user-growth/real-time-data.ts` 中 `fetch*` 解析结果一致）。若网关仍多包一层 `data`，由 `fetch*` 内 `unwrapDataDeep` 兼容。

### 请求体日期

筛选入参统一 **`startDate` / `endDate`**（`YYYY-MM-DD`）。实时看板单日快照时二者同值；不传由服务端默认「今日」。

### 接口清单

| 契约文件 | 说明 | 逻辑 URL（POST） | 优先级 |
| --- | --- | --- | --- |
| `01-meta-filter-options.json` | 应用、广告平台筛选项 | `.../meta-filter-options` | P0 |
| `02-overview-kpi-summary.json` | 顶部 KPI 四卡 | `.../overview-kpi-summary` | P0 |
| `03-table-app-cards.json` | 应用卡片栅格（火花图，无详情大字段） | `.../table/app-cards` | P0 |
| `04-app-detail.json` | 点击卡片后详情弹窗 | `.../app-detail` | P0 |
| `05-overview-hourly-spend-comparison.json` | 底部「实时小时消耗对比」柱 + ROI 折线 | `.../overview-hourly-spend-comparison` | P0 |

### 场景 → 接口（与各 JSON 根级 `interaction` 一致）

| 用户场景          | 契约 JSON | 触发时机                             |
| ----------------- | --------- | ------------------------------------ |
| 首屏筛选项        | `01`      | 进入页面初始化（可与 02/03/05 并行） |
| 首屏 KPI          | `02`      | 初始化；筛选/刷新                    |
| 卡片列表 + 火花图 | `03`      | 初始化；筛选/刷新                    |
| 详情弹窗          | `04`      | 点击卡片打开 `AppDetailModal`        |
| 底部对比图        | `05`      | 初始化；筛选/刷新                    |

### 拆分原则

- **列表与详情分离**：`03` 仅服务卡片网格；打开弹窗再请求 `04`。
- **KPI / 分时图分离**：顶部汇总与底部小时对比独立。
- **筛选项独立**：`01` 可单独缓存；其它接口携带同一筛选维度。

### 数据源开关

按接口粒度配置见 **`../config/data-source.ts`**（与上表 1:1）；Mock 实现见 **`../real-time-data-api-mock.ts`**。

### 字段与数据字典

- 应用：`s_app_id`（卡片行上可与 `id` 同值）。
- 终端平台：`platform`（若后续按 Android/iOS 区分）。
- 广告平台：请求/筛选 `n_source`；选项见 `01`。
- 花费：响应中与 **`cost` 同语义** 的度量在部分 UI 仍显示为 `spend`，联调时在适配层对齐命名。

### JSON 命名

前缀 `01`～`05` 与数据源枚举顺序一致；单路由单页，契约均放在本目录（不再分子路由目录）。
