# IAP 分析 - Mock 说明

## 用途

本目录为「商业洞察 > IAP 分析」模块提供 Mock 数据与后端接口契约，用于：

- 开发阶段按 Dashboard 一级页、Detail 二级页、Overview 表格页独立联调
- 与 `types.ts`、页面组件、API 层保持数据结构一致
- 接口就绪后平滑切换为真实请求

## 与页面的对应关系

| 页面 | 主要数据来源（契约） |
| --- | --- |
| Dashboard（首页） | meta-filter-options、overview/kpi、overview/trend、overview/app-cards、overview/country-distribution、overview/product-type-donut、overview/platform-compare |
| Detail（应用详情） | detail/kpi、detail/product、detail/user、detail/trend |
| Overview（表格视图） | table/overview |

## 数据来源与类型

- Mock 数据结构与 `src/views/business-insight/iap-analysis/types.ts` 中定义的类型一致
- 接口契约位于 `backend-api/`，字段命名遵循项目数据字典（`backend-fields.mdc`）：`platform`、`s_country_code`、`s_app_id`、`revenue`、`amount`、`quantity`、`sku`、`order`、`subscription_revenue`、`lap_revenue` 等
