# 人员绩效（Performance Analysis）接口契约

本目录为「用户增长 / 人员绩效」的接口契约，供后端实现与前端联调。

## 父级 API 路径（与 `src/api/user-growth/performance-analysis.ts` 一致）

`/api/v1/datacenter/analysis/user-growth/performance-analysis`

## 公用驾驶舱顶栏 meta（无本目录 JSON）

与同构顶栏配套时数据来自 `**useCockpitMetaFilterStore().data**`，勿在本目录建 `*meta-filter-options*.json`。说明见 `src/views/user-growth/paid-analysis/mock/backend-api/README.md` 附录 A。

列表页独有筛选项见 `01-list-filter-options.json`（非 cockpit GET）。

## 接口清单

### 列表页（`/user-growth/performance-analysis`）

| 文件                          | 说明            | URL（POST，相对父路径） | 优先级 |
| ----------------------------- | --------------- | ----------------------- | ------ |
| `01-list-filter-options.json` | Chip 筛选项     | `/list-filter-options`  | P0     |
| `02-performance-list.json`    | 主表 + 表尾合计 | `/performance-list`     | P0     |
| `03-overview-metrics.json`    | 右侧指标概览    | `/overview-metrics`     | P0     |

### 对比页（`/user-growth/performance-analysis/comparison`）

| 文件 | 说明 | URL（POST，相对父路径） | 优先级 |
| --- | --- | --- | --- |
| `04-compare-candidates.json` | 添加对比候选（排除已选） | `/compare-candidates` | P0 |
| `05-comparison-overview.json` | 顶部 KPI 四卡片 | `/comparison-overview` | P0 |
| `06-comparison-charts.json` | 四图：ROI/支出趋势、雷达、利润条 | `/comparison-charts` | P0 |
| `07-comparison-rankings.json` | 指标排名表 | `/comparison-rankings` | P0 |
| `08-comparison-score-detail.json` | 绩效得分明细表 | `/comparison-score-detail` | P0 |
| `09-comparison-alerts.json` | 异常预警列表 | `/comparison-alerts` | P1 |

## 场景 → 接口

| 场景 | 接口 |
| --- | --- |
| 列表初始化筛选项 | `list-filter-options` |
| 列表表格 / 分页 / 排序 | `performance-list` |
| 列表右侧 KPI | `overview-metrics` |
| 对比页打开「添加对比」/ 刷新候选 | `compare-candidates` |
| 对比页 KPI / 图表 / 排名 / 得分 / 预警 | `comparison-overview`、`comparison-charts`、`comparison-rankings`、`comparison-score-detail`、`comparison-alerts`（可与 overview 并行） |

## 统一约定

- 日期范围：`startDate` / `endDate`，`YYYY-MM-DD`。
- 列表与候选：`personFilter`、`appFilter`、`statusFilter`、`keyword`；「全部」为 `""`（UI 若传「全部」前端应归一为 `""`）。
- 对比页主体：`staffIds` 为当前已选人员 id，顺序与页面标签一致。

数据源开关：`../config/data-source.ts`（与每个 `fetch*` 一一对应）。
