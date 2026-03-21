# 综合分析 — 接口清单（backend-api）

## 父级路径

与路由 `/user-growth/comprehensive-analysis` 对齐：**`/api/user-growth/comprehensive-analysis`**

约定：**POST**，请求体 JSON；筛选「全部」字段用 **空字符串 `''`**。

## 接口表

| 优先级 | 说明 | URL（POST） | 契约文件 |
| --- | --- | --- | --- |
| P0 | 筛选下拉（应用 / 广告平台 / 国家） | `/api/user-growth/comprehensive-analysis/meta-filter-options` | `01-meta-filter-options.json` |
| P0 | 页面 KPI + 中部四列 + 底部趋势/ECPM 聚合 | `/api/user-growth/comprehensive-analysis/overview` | `02-overview.json` |

## 拆分原则

- 单接口服务当前页「数据」视图的主内容区；若后续 `viewMode` 下钻为独立大数据模块，再按 `api-contract-and-mock-conventions.mdc` 拆子接口。
- 钻取进入 **广告平台分析详情** 的接口见 `src/views/user-growth/platform-analysis-detail/mock/backend-api/README.md`。

## 请求字段对照（overview）

| 前端构建字段              | 含义                                      |
| ------------------------- | ----------------------------------------- |
| `date_start` / `date_end` | 统计区间，YYYY-MM-DD                      |
| `s_app_id`                | 应用 ID；`''` 表示全部                    |
| `source`                  | 广告平台（项目约定字段名）；`''` 表示全部 |
| `s_country_code`          | 国家代码；`''` 表示全部                   |

与 `Api.UserGrowth.ComprehensiveAnalysisOverviewRequest`、`ComprehensiveAnalysisApiParams` 一致。
