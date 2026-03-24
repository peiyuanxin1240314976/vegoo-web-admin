# 预估收入偏差 — Mock 说明

## 用途

- 页面入口：`src/views/business-insight/revenue-deviation/RevenueDeviation.vue`
- 展示数据由同级 **`data.ts`** 提供，与 **`backend-api/`** 中 `sampleRequest` / `sampleResponse` 对齐；`src/api/revenue-deviation.ts` 中 `fetch*` 在 **`config/data-source.ts`** 为 mock 时走此处。

## 与类型的关系

- 字段类型见 **`../types.ts`**。
- 联调时可按需将契约字段同步到 `src/types/api/api.d.ts` 的 `Api.*`（按团队约定）。

## 国旗与国家

- 国家 Top10 使用 **`s_country_code`（ISO 3166-1 alpha-2，小写）** 与 `label_display`；不在接口中返回国旗 emoji 或图片 URL，若页面后续展示国旗请用 `flag-icons`（见 `project-conventions.mdc`）。

## 数据源开关

- 见 **`../config/data-source.ts`**（`RevenueDeviationEndpoint` + `REVENUE_DEVIATION_USE_MOCK`），与 `module-api-mock-config.mdc` 一致。
