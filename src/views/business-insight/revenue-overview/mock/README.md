# 收入总览（Revenue Overview）— Mock 说明

## 用途

- 页面入口：`src/views/business-insight/revenue-overview/index.vue`
- 当前页面数据由同级 **`mock.ts`** 提供（KPI、IAA/IAP 表格、图表序列、AI 洞察等），与筛选联动时仅刷新图表，未接远程接口。
- **接口契约**见本目录下 **`backend-api/`**（`sampleRequest` / `sampleResponse` 与 `mock.ts` 导出常量对齐，便于后续接 `src/api` 与模块 `config` 开关）。

## 与类型的关系

- 业务展示类型定义在 **`mock.ts`**（如 `RevenueOverviewKpiCard`、`RevenueOverviewIaaBreakdownRow` 等）。
- 联调时可将契约 JSON 中的字段同步到 `src/types/api/api.d.ts` 的 `Api.*` 或页面侧 `types.ts`（按团队约定）。

## 国旗展示

- 国家维度仅使用 **`s_country_code`（ISO 3166-1 alpha-2）**；不在接口中返回国旗 emoji 或图片 URL，前端用 `flag-icons` 渲染（见项目 `project-conventions.mdc`）。
