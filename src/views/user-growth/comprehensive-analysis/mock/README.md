# 综合分析 — Mock 说明

## 数据源开关

- **配置**：`../config/data-source.ts` 中 `COMPREHENSIVE_ANALYSIS_USE_MOCK`（按接口粒度）。
- **实现**：`comprehensive-analysis-api-mock.ts` 内 `mockFetch*`；聚合页通过 `src/api/user-growth/comprehensive-analysis.ts` 中 `isComprehensiveAnalysisEndpointMock` 分支调用。
- **默认**：仓库内开关当前为 **全 Mock**（便于离线开发）；联调真实网关时将对应 endpoint 改为 `false`。

## 运行时 Mock 数据

- **`data.ts`**：`MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS`、`MOCK_COMPREHENSIVE_ANALYSIS_DATA` 基线数据。
- **`buildMockComprehensiveAnalysisData(apiParams)`**：按 `date_start` / `date_end` / `s_app_id` / `source` / `s_country_code` 做哈希抖动，模拟筛选联动（与契约筛选语义一致）。

## 接口契约（backend-api）

- 目录：`mock/backend-api/`，**一接口一 JSON**，含 `fieldDescription`、`sampleRequest`、`sampleResponse`、`interaction`、`api`。
- 父级路径：`POST /api/user-growth/comprehensive-analysis/*`（与路由 `/user-growth/comprehensive-analysis` 对齐）。
- **筛选「全部」**：请求体 `s_app_id` / `source` / `s_country_code` 均为 **`""`**；meta 下拉「全部」项 `value` 同为 `""`（见 `utils/buildApiParams.ts`）。

## 工具用示例 JSON（api-mock）

- 目录：`mock/api-mock/`，根级 `data` 与网关包裹形态一致，便于 Postman / MSW；须与 `backend-api` 示例及 `data.ts` 基线同步维护。
