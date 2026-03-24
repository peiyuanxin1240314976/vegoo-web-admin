# ECPM 分析 — 接口契约清单

## 父级 API 路径

- 文档示例：`/api/business-insight/ecpm-analysis/<endpoint>`
- 网关实现若带分析前缀，与 `src/api/analysis-api-base.ts` 中 `ANALYSIS_API_BASE` 拼接；若层级不同，以实际 `src/api` 为准并在本 README 备注。

## 拆分原则

- 每个契约对应**一个明确 UI 区块**，避免单接口返回整页不可裁剪的大包。
- 筛选入参统一包含日期范围、`platform`（终端）、`source`（广告平台，可选）、`s_app_id`、`s_country_code` 等，与 `mock.ts` 中联调扩展一致。

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 筛选：应用、终端平台、广告平台、国家 | `/meta-filter-options` | GET | P0 |
| `02-overview-kpis.json` | 顶部 KPI（预估/真实 ECPM、最高国家、最高广告位） | `/overview/kpis` | POST | P0 |
| `03-overview-trend.json` | ECPM 趋势（30 日：预估、真实、广告收入序列） | `/overview/trend` | POST | P0 |
| `04-table-platform.json` | 广告平台 ECPM 对比表 + 小计 | `/table/platform` | POST | P0 |
| `05-overview-map-country.json` | 国家地图散点（预估/真实） | `/overview/map-country` | POST | P0 |
| `06-overview-top10-country.json` | ECPM Top 10 国家（横向条） | `/overview/top10-country` | POST | P0 |
| `07-overview-ad-slot-ranking.json` | 广告位 ECPM 排行 | `/overview/ad-slot-ranking` | POST | P0 |
| `08-overview-app-ranking.json` | 应用 ECPM 排行（含预估/真实） | `/overview/app-ranking` | POST | P0 |
| `09-overview-insight-tip.json` | 右侧提示文案 | `/overview/insight-tip` | POST | P2 |

## 前端对照

- Mock 常量：`src/views/business-insight/ecpm-analysis/mock.ts`（`MOCK_*` 与各契约 `sampleResponse` 对应）。
