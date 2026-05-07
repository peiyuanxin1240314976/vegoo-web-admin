# 收入总览 — 接口契约清单

## 父级 API 路径

- 文档示例：`/api/business-insight/revenue-overview/<endpoint>`
- 网关实现建议：`/api/v1/datacenter/analysis/business-insight/revenue-overview/<endpoint>`（与 `src/api/analysis-api-base.ts` 中 `ANALYSIS_API_BASE` 拼接；若网关层级不同，以实际 `src/api` 为准并在本 README 备注）

## 拆分原则

- 每个契约对应**一个明确 UI 区块**或 Tab 数据源，避免单接口返回整页不可裁剪的大包。
- 筛选入参统一包含：`appIds`（`string[]`，不限为 `[]`）、`platform`（收入概览页固定 `""`）、`s_country_code`（**空串 `""` 表示不按国家筛选**）、`app_version`、`startDate` / `endDate`（统计区间，`YYYY-MM-DD`），与 `mock.ts` 中 `RevenueOverviewFilterState` 一致。

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 筛选下拉：应用、终端平台、国家、版本（可选） | `/meta-filter-options` | GET | P0 |
| `02-overview-kpis.json` | 顶部 KPI 卡片（含 spark 序列） | `/overview/kpis` | POST | P0 |
| `03-overview-iaa-ad-type.json` | IAA 构成 — 广告类型维度 | `/overview/iaa/ad-type` | POST | P0 |
| `04-overview-iaa-platform.json` | IAA 构成 — 广告平台维度 | `/overview/iaa/platform` | POST | P0 |
| `05-overview-iaa-ad-unit.json` | IAA 构成 — 广告位维度 | `/overview/iaa/ad-unit` | POST | P0 |
| `06-overview-iaa-country.json` | IAA 构成 — 国家维度 | `/overview/iaa/country` | POST | P0 |
| `07-overview-iaa-version.json` | IAA 构成 — 版本维度 | `/overview/iaa/version` | POST | P0 |
| `08-overview-iap-product.json` | IAP — 商品构成（表 + 顶/底摘要） | `/overview/iap/product` | POST | P0 |
| `09-overview-iap-channel.json` | IAP — 广告平台分析（条、表、侧栏指标） | `/overview/iap/channel` | POST | P0 |
| `10-overview-iap-trend.json` | IAP — 趋势 Tab（序列 + 底部 KPI） | `/overview/iap/trend` | POST | P0 |
| `11-overview-trend-7d-iaa-iap.json` | 7 日 IAA vs IAP 趋势 | `/overview/trend-7d/iaa-iap` | POST | P0 |
| `12-overview-trend-7d-ecpm.json` | 7 日预估/真实 eCPM | `/overview/trend-7d/ecpm` | POST | P0 |
| `13-overview-platform-pie.json` | 广告平台占比饼图 | `/overview/platform-pie` | POST | P0 |
| `14-overview-top-countries.json` | 国家 Top 列表 | `/overview/top-countries` | POST | P1 |
| `15-overview-ai-insight.json` | AI 洞察文案 | `/overview/ai-insight` | POST | P2 |
| `16-overview-quality-metrics.json` | 收入质量指标卡片 | `/overview/quality-metrics` | POST | P1 |

## 前端对照

- 当前 Mock 常量：`src/views/business-insight/revenue-overview/mock.ts`（`MOCK_*` 与各契约 `sampleResponse` 对应）。
- 接入时在 **`revenue-overview/config/`**（如 `data-source.ts`）按接口粒度配置 mock/remote，并在 `src/api` 中实现 `fetch*`（见 `module-api-mock-config.mdc`）。
