# ECPM 分析 — Mock 说明

## 用途

- 页面入口：`src/views/business-insight/ecpm-analysis/EcpmDashboard.vue`
- 页面展示数据由同级 **`mock.ts`** 提供（KPI、趋势、地图、表格、排行等），与 **`mock/backend-api/`** 中 `sampleRequest` / `sampleResponse` 对齐，便于后续在 `src/api` 实现 `fetch*` 并在本目录 **`config/data-source.ts`** 按接口切换 mock/remote。

## 与类型的关系

- 字段与展示类型见 **`../types.ts`**。
- 联调时可将契约字段同步到 `src/types/api/api.d.ts` 的 `Api.*`（按团队约定）。

## 国旗与地图

- 国家维度使用 **`s_country_code`（ISO 3166-1 alpha-2）**；世界地图展示需与 ECharts geo 名称一致时在契约中增加 **`geo_name`**（与 `/geo/world.json` 中名称一致）。

## 数据源开关

- 见同级 **`../config/data-source.ts`**（`EcpmAnalysisEndpoint` + `ECPM_ANALYSIS_USE_MOCK`），与 `module-api-mock-config.mdc` 一致。
