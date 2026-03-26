# 代投分析 - 接口契约清单

## 父级 API 路径

`/api/v1/datacenter/analysis/business-insight/agency-analysis`

## 接口清单

| 文件 | 说明 | URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-overview.json` | 顶部 KPI 概览 | `/overview` | POST | P0 |
| `02-agency-summary.json` | 代投方汇总（含展开详情） | `/table/agency-summary` | POST | P0 |
| `03-campaign-table.json` | 代投广告系列明细 | `/table/campaign` | POST | P1 |
| `04-daily-comparison.json` | 逐日对比（近 7 天） | `/table/daily-comparison` | POST | P1 |
| `05-donut-spend-share.json` | 代投方消耗占比 | `/chart/donut-spend-share` | POST | P1 |
| `06-channel-distribution.json` | 渠道分布分析 | `/chart/channel-distribution` | POST | P1 |
| `07-country-top8.json` | 国家消耗分布 Top 8 | `/chart/country-top8` | POST | P1 |
| `08-spend-trend30d.json` | 代投消耗趋势（近30天） | `/chart/spend-trend30d` | POST | P1 |

## 说明

- `backend-api/*.json` 为接口契约源文件，后端按契约实现。
- 前端 `mock-data.ts` 结构与契约 `sampleResponse` 保持一致。
