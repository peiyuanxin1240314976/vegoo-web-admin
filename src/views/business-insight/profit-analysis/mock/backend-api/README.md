# 利润分析 - 接口契约清单

## 父级 API 路径

`/api/business-insight/profit-analysis/<endpoint>`

（GET 用于 meta，POST 用于带筛选的查询）

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 筛选下拉：应用、国家、日期范围选项 | `/meta-filter-options` | GET | P0 |
| `02-overview-kpi.json` | 顶部 5 个 KPI 卡片（预估利润、总收入、广告支出、广告收益率、付费收入占比） | `/overview/kpi` | POST | P0 |
| `03-table-app-profit.json` | 应用利润详情表 + 合计行 | `/table/app-profit` | POST | P0 |
| `04-overview-country-profit.json` | 国家利润分布（地图数据 + Top10 表） | `/overview/country-profit` | POST | P0 |
| `05-overview-trend30d.json` | 利润趋势近 30 天（总收入、广告支出、预估利润） | `/overview/trend30d` | POST | P0 |
| `06-overview-sankey.json` | 利润构成桑基图（节点与连线） | `/overview/sankey` | POST | P0 |

## 拆分原则

- 一个接口只服务一个明确 UI 模块（KPI 行、应用表、国家地图+表、趋势图、桑基图）
- 全局筛选参数（dateRange、s_app_id、s_country_code、platform）由各 POST 接口统一接收
- 金额/占比展示格式可由前端根据数值格式化，契约中可约定数值与单位

## 字段约定

- 遵循 `backend-fields.mdc`：终端平台 `platform`，广告平台 `source`，国家 `s_country_code`，应用 `s_app_id`，收入 `revenue`，花费 `cost`，广告价值 `ad_revenue`，内购价值 `lap_revenue` 等
