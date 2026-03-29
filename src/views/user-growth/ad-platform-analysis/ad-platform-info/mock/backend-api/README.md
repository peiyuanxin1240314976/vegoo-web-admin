# 广告平台信息 - 接口契约清单

## 父级 API 路径（建议）

`/api/user-growth/ad-platform-analysis/ad-platform-info`

对应前端路由：`/user-growth/ad-platform-analysis/ad-platform-info?id=<s_campaign_id>`。

网关真实前缀若不一致，以 `src/api` 实际请求为准。

## 拆分原则

- **一接口一 UI 模块**：首屏可按模块并行请求，避免单接口 payload 过大。
- 各接口 **POST + JSON**，请求体均含 **`s_campaign_id`** 与 **时间**（`date_range` 和/或 `t_start_date`/`t_end_date`）。

## 接口清单

| 文件                        | 模块                | 建议 URL（相对父级） | 方法 | 优先级 |
| --------------------------- | ------------------- | -------------------- | ---- | ------ |
| `01-platform-summary.json`  | 顶部摘要 + 更新时间 | `/platform-summary`  | POST | P0     |
| `02-kpi-cards.json`         | KPI 卡片            | `/kpi-cards`         | POST | P0     |
| `03-roi-map-points.json`    | ROI 地图散点        | `/roi-map-points`    | POST | P0     |
| `04-country-top10.json`     | 国家 Top10          | `/country-top10`     | POST | P0     |
| `05-retention-heatmap.json` | 留存热力图          | `/retention-heatmap` | POST | P0     |
| `06-conversion-funnel.json` | 转化漏斗            | `/conversion-funnel` | POST | P1     |
| `07-trend-chart.json`       | 趋势图              | `/trend-chart`       | POST | P0     |
| `08-campaign-table.json`    | 广告系列明细表      | `/campaign-table`    | POST | P1     |

## 字段与数据字典

- 广告系列主键：`s_campaign_id`（与路由 query `id` 一致）。
- 国家代码：`s_country_code`（ISO 3166-1 alpha-2）。
- 金额类：数值 + USD 语义，展示格式由前端统一。
