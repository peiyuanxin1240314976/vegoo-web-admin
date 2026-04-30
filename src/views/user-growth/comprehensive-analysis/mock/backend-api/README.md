# 综合分析 — 接口清单（backend-api）

## 父级路径

与路由 `/user-growth/comprehensive-analysis` 对齐：**`/api/user-growth/comprehensive-analysis`**

约定：**POST**，请求体 JSON；筛选「全部」字段用 **空字符串 `''`**。

## 公用顶栏筛选项（无本目录 JSON）

与 **`CockpitMetaFilterOptionsData`** 同构的应用 / 广告平台 / 国家等下拉：**不**再使用 `.../comprehensive-analysis/meta-filter-options`。

- **HTTP**：**`GET`** `${ANALYSIS_API_BASE}/cockpit/meta-filter-options`（无参），`fetchCockpitMetaFilterOptions`（`@/api/cockpit-meta-filter`）。
- **页面**：读 Pinia **`useCockpitMetaFilterStore().data`** 或 **`useCockpitMetaFilterOptions()`**；综合分析组合式见 **`composables/useComprehensiveAnalysisFilters.ts`**。
- **说明**：`src/views/user-growth/paid-analysis/mock/backend-api/README.md` **附录 A**；规则见 `api-contract-and-mock-conventions.mdc` §0.6。

## 接口表

每份契约 JSON 根级含 **`interaction`**（路由 / 页面落点 / 触发时机）。

| 优先级 | 说明 | URL（POST） | 契约文件 |
| --- | --- | --- | --- |
| P0 | 顶部 KPI 卡片 | `/api/user-growth/comprehensive-analysis/kpi` | `02-kpi.json` |
| P0 | 广告平台 CPI 横向柱图 | `/api/user-growth/comprehensive-analysis/platform-cpi-bar` | `03-platform-cpi-bar.json` |
| P1 | 应用 CPI 排行榜 | `/api/user-growth/comprehensive-analysis/app-cpi-rank` | `04-app-cpi-rank.json` |
| P1 | 国家 CPI 地图分布 + Top8 | `/api/user-growth/comprehensive-analysis/country-distribution` | `05-country-distribution.json` |
| P1 | 投放预警列表 | `/api/user-growth/comprehensive-analysis/alerts` | `06-alerts.json` |
| P1 | 广告平台 CPI 趋势折线图 | `/api/user-growth/comprehensive-analysis/platform-cpi-trend` | `07-platform-cpi-trend.json` |
| P1 | ECPM 分析（预估 vs 真实） | `/api/user-growth/comprehensive-analysis/ecpm-analysis` | `08-ecpm-analysis.json` |

**示例响应副本**（根级 `data`）：`../api-mock/02-*.json` … `08-*.json`。

## 公共请求参数（上表 POST 均适用）

| 字段             | 类型     | 说明                                      |
| ---------------- | -------- | ----------------------------------------- |
| `date_start`     | `string` | 统计区间开始 YYYY-MM-DD                   |
| `date_end`       | `string` | 统计区间结束 YYYY-MM-DD                   |
| `s_app_id`       | `string` | 应用 ID；`''` 表示全部                    |
| `source`         | `string` | 广告平台（项目约定字段名）；`''` 表示全部 |
| `s_country_code` | `string` | 国家代码；`''` 表示全部                   |

与 `ComprehensiveAnalysisApiParams`（`types.ts`）、`buildComprehensiveAnalysisApiParams`（`utils/buildApiParams.ts`）一致。

## 拆分原则

- 每个接口对应页面的一个独立 UI 区块（一图 / 一列表 / 一组 KPI），便于局部刷新与错误隔离。
- `meta-filter-options` 由全局 Store + 路由守卫预取；本页 KPI 等与筛选联动仍用上表 POST。
- 钻取进入**广告平台分析详情**的接口见 `src/views/user-growth/platform-analysis-detail/mock/backend-api/README.md`。
