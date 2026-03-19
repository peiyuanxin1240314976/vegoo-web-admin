# IAP 分析 - 接口契约清单

## 父级 API 路径

`/api/business-insight/iap-analysis/<endpoint>`

（GET 用于 meta，POST 用于带筛选的查询）

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 筛选下拉：应用、平台、国家、产品类型、时间范围 | `/meta-filter-options` | GET | P0 |
| `02-overview-kpi.json` | Dashboard 顶部 6 个 KPI 卡片 | `/overview/kpi` | POST | P0 |
| `03-overview-trend.json` | Dashboard 三块趋势图（订单vs收入、转化率、ARPU） | `/overview/trend` | POST | P0 |
| `04-overview-app-cards.json` | Dashboard 应用分析卡片列表 | `/overview/app-cards` | POST | P0 |
| `05-overview-country-distribution.json` | Dashboard 按国家/地区收入分布表 | `/overview/country-distribution` | POST | P0 |
| `06-overview-product-type-donut.json` | Dashboard 产品类型分布甜甜圈 | `/overview/product-type-donut` | POST | P0 |
| `07-overview-platform-compare.json` | Dashboard 平台对比柱状图 | `/overview/platform-compare` | POST | P0 |
| `08-table-overview.json` | Overview 表格（树形）+ 合计行 | `/table/overview` | POST | P1 |
| `09-detail-kpi.json` | Detail 页顶部 6 个 KPI | `/detail/kpi` | POST | P0 |
| `10-detail-product.json` | Detail 产品统计 Tab 数据 | `/detail/product` | POST | P0 |
| `11-detail-user.json` | Detail 用户分析 Tab 数据 | `/detail/user` | POST | P0 |
| `12-detail-trend.json` | Detail 趋势分析 Tab 数据 | `/detail/trend` | POST | P0 |

## 拆分原则

- 一个接口只服务一个明确 UI 模块（一块 KPI、一张图、一张表或一个 Tab 聚合）
- 全局筛选参数（timeRange、s_app_id、productType、s_country_code、platform）由各 POST 接口统一接收
- Detail 接口需带 s_app_id（或应用标识）以按应用拉取详情

## 字段约定

- 遵循 `backend-fields.mdc`：终端平台 `platform`，国家 `s_country_code`，应用 `s_app_id`，收入 `revenue`，实收 `amount`，数量 `quantity`，商品 `sku`，订单 `order`，订阅收入 `subscription_revenue`，内购价值 `lap_revenue` 等
