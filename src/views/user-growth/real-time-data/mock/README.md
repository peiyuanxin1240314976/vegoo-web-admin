# 用户增长 / 实时数据 - Mock 说明

本目录用于「实时数据」页面在接口未就绪或联调阶段的展示与开发，并作为 **接口契约** 与 **前端类型** 的对照来源。

## 规范依据

须同时遵循：

- `.cursor/rules/api-contract-and-mock-conventions.mdc`（Mock 目录、`backend-api` 契约格式、按 UI 拆接口）
- `.cursor/rules/backend-fields.mdc`（业务字段语义：如应用 `s_app_id`、花费 `cost`、广告平台 `source` / `n_source`、安装 `installs` 等）

**后续新建/扩展业务页**：请在对应 `views/<模块>/<页面>/mock/` 下按同样结构补齐 `README.md`、`backend-api/README.md`、按接口拆分的 `*.json`，并（推荐）维护 `api-mock/` 与 `sampleResponse` 对齐。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `README.md` | 本说明 |
| `backend-api/README.md` | 父级 API、接口清单、优先级 |
| `backend-api/01-*.json` … `04-*.json` | 各数据接口字段解释 + `sampleRequest` / `sampleResponse` + 根级 `interaction`（筛选项见综合分析公用契约） |
| `api-mock/*.json` | 与对应 `backend-api/*.json` 的 `sampleResponse` 对齐的示例响应（便于静态对照或接入 MSW） |
| `real-time-data-api-mock.ts` | 与 `fetch*` 对齐的本地 Mock；开关见 **`../config/data-source.ts`** |
| `data.ts` | 聚合源数据：`AppCard[]`（列表 + 内嵌详情）、KPI、底部图；衍生 `mockRealtimeAppCardRows` / `mockRealtimeAppDetailsById` / `mockRealtimeHourlySpendComparison` 以与 **02 / 03 / 04** 契约对齐 |

## 与代码的对应关系

- 页面类型：`../types.ts`（`AppCard`、`AppDetailData`、`RealtimeKpiSummary`、`RealtimeHourlySpendComparison` 等）
- 数据入口：`../composables/useRealtimeDashboardMock.ts`（当前本地聚合；接入后端时筛选项用 `@/api/user-growth/comprehensive-analysis` 的 `fetchComprehensiveAnalysisFilterOptions`，数据用 `@/api/user-growth/real-time-data` 的 `fetchRealtime*` + `../config/data-source.ts` 切换）

## 文案与筛选

- 页面上「渠道筛选」等 UI 文案在实现时应使用 **「广告平台」**（见 `project-conventions.mdc`）；契约请求字段使用 `source` / `n_source` 等与数据字典一致。
