# IAA 分析 - Mock 说明

## 用途

本目录为「商业洞察 > IAA 分析」页面提供 Mock 数据与后端接口契约，用于：

- 开发阶段按 6 个 Tab（广告类型、广告平台、广告位、广告单元、国家、版本）独立联调
- 与 `types.ts`、页面组件、API 层保持数据结构一致
- 接口就绪后平滑切换为真实请求

## 与 6 个 Tab 的对应关系

| Tab | 主要数据来源（契约） |
| --- | --- |
| 广告类型 | overview-kpi、table-ad-type、chart-ad-type-trend、chart-user-breakdown |
| 广告平台 | overview-kpi、table-ad-platform、chart-platform-ranking、chart-revenue-donut、chart-ecpm-compare、chart-revenue-trend-7d |
| 广告位 | overview-kpi、table-ad-placement、chart-placement-top10、chart-placement-donut、chart-placement-scatter |
| 广告单元 | overview-kpi、table-ad-unit、chart-fill-rate-dist、chart-ecpm-fill-scatter、chart-revenue-trend-7d |
| 国家 | overview-kpi、table-country、chart-country-map、chart-country-ecpm、chart-country-trend、chart-country-penetration |
| 版本 | overview-kpi、table-version、chart-version-revenue、chart-version-ecpm-trend、chart-version-upgrade、chart-version-penetration-crash、ai-insight-version |

## 数据来源与类型

- Mock 数据结构与 `src/views/business-insight/iaa-analysis/types.ts` 中定义的类型一致
- 接口契约位于 `backend-api/`，字段命名遵循项目数据字典（`backend-fields.mdc`）：`source` 广告平台、`platform` 终端平台、`s_country_code`、`revenue`、`impressions` 等
