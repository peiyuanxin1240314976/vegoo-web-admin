# 利润分析 - Mock 说明

## 用途

本目录为「商业洞察 > 利润分析」模块提供 Mock 数据与后端接口契约，用于：

- 开发阶段按 KPI、应用表、国家分布、趋势图、桑基图独立联调
- 与 `types.ts`、`BusinessInsight.vue`、API 层保持数据结构一致
- 接口就绪后平滑切换为真实请求

## 与页面的对应关系

| 页面区块       | 数据来源（mock/backend-api）                                             |
| -------------- | ------------------------------------------------------------------------ |
| 筛选区         | `meta-filter-options`（`GET`，无参）+ `query` 绑定顶栏 Select / 日期范围 |
| KPI 卡片行     | overview/kpi                                                             |
| 应用利润详情表 | table/app-profit（含合计行）                                             |
| 国家利润分布   | overview/country-profit（地图 + Top10 表）                               |
| 利润趋势图     | overview/trend30d                                                        |
| 利润构成桑基图 | overview/sankey                                                          |

## 数据来源与类型

- Mock 数据结构与 `src/views/business-insight/profit-analysis/types.ts` 中定义的类型一致
- 接口契约位于 `backend-api/`，字段命名遵循项目数据字典（`backend-fields.mdc`）：`platform`、`source`、`s_country_code`、`s_app_id`、`revenue`、`cost`、`ad_revenue`、`lap_revenue` 等
