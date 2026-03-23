# 预估收入偏差 — 接口契约清单

## 父级 API 路径

- 文档示例：`/api/v1/datacenter/analysis/business-insight/revenue-deviation/<endpoint>`
- 与 `src/api/analysis-api-base.ts` 中 `ANALYSIS_API_BASE` 拼接；网关若多层级以实际 `src/api/revenue-deviation.ts` 为准。

## 拆分原则

- 每个契约对应**一个明确 UI 区块**（KPI、趋势、平台表、原因饼图、对账建议、国家 Top10、历史表、矩阵表），避免单接口返回整页不可裁剪的大包。
- 筛选入参统一包含日期范围、`source`（广告平台，可选）、`s_app_id`（应用，可选），与 `backend-fields.mdc` 一致。

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-overview-kpis.json` | 顶部 KPI（预估/真实/偏差/偏差率/ROI 影响等） | `/overview/kpis` | POST | P0 |
| `02-overview-trend.json` | 收入偏差趋势（30 日：预估、真实序列） | `/overview/trend` | POST | P0 |
| `03-table-platform.json` | 广告平台偏差对比表 + 合计 | `/table/platform` | POST | P0 |
| `04-overview-reason.json` | 偏差原因分析（饼图占比） | `/overview/reason` | POST | P0 |
| `05-overview-advice.json` | 对账建议文案列表 | `/overview/advice` | POST | P1 |
| `06-overview-country-top10.json` | 国家偏差 Top10（按「偏差金额 / 偏差率」两套序列） | `/overview/country-top10` | POST | P0 |
| `07-table-history.json` | 偏差历史记录（按月） | `/table/history` | POST | P1 |
| `08-table-matrix.json` | 四维度偏差明细矩阵（应用 × 平台） | `/table/matrix` | POST | P0 |

## 前端对照

- Mock 实现：`src/views/business-insight/revenue-deviation/mock/data.ts`（与各契约 `sampleResponse` 对应）。
