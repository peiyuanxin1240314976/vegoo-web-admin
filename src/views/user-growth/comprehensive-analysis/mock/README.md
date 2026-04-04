# 综合分析 — Mock 说明

## 数据源开关

- **配置**：`../config/data-source.ts` 中 `COMPREHENSIVE_ANALYSIS_USE_MOCK`（**仅** KPI / 图表等 **POST** 接口，`02`～`08`）。
- **实现**：`comprehensive-analysis-api-mock.ts` 内 `mockFetch*`；聚合页通过 `src/api/user-growth/comprehensive-analysis.ts` 中 `isComprehensiveAnalysisEndpointMock` 分支调用。
- **默认**：仓库内开关当前为 **全 Mock**（离线开发）；联调真实网关时将对应 endpoint 改为 `false`。

## 筛选项（不在本模块 Mock）

与驾驶舱同构的顶栏下拉由 **`useCockpitMetaFilterStore`**（`GET .../cockpit/meta-filter-options`）提供；页面使用 **`composables/useComprehensiveAnalysisFilters.ts`**（内部 `useCockpitMetaFilterOptions`）。  
兼容方法 **`fetchComprehensiveAnalysisFilterOptions`** 同样读 Store，**不**请求 `.../comprehensive-analysis/meta-filter-options`。

## 运行时 Mock 数据（POST 块）

- **`data.ts`**：`MOCK_COMPREHENSIVE_ANALYSIS_DATA` 基线。
- **`buildMockComprehensiveAnalysisData(apiParams)`**：按 `date_start` / `date_end` / `s_app_id` / `source` / `s_country_code` 做哈希抖动。

## 接口契约（backend-api）

- 目录：`mock/backend-api/`，**`02`～`08`** 一接口一 JSON（**无** `01-meta-filter-options`）。
- 父级路径：`POST /api/user-growth/comprehensive-analysis/*`。
- **筛选「全部」**：请求体维度字段为 **`""`**；与公用 meta 下拉「全部」`value` 一致，见 `utils/buildApiParams.ts`。

## 工具用示例 JSON（api-mock）

- 目录：`mock/api-mock/`，**`02`～`08`**，根级 `data`；须与 `backend-api` 及 `data.ts` 基线同步维护。
