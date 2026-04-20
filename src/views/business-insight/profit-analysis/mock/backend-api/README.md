# 利润分析 - 接口契约清单

## 父级 API 路径

`/api/v1/datacenter/analysis/business-insight/profit-analysis/<endpoint>`

（与 `src/api/business-insight.ts` 中 `PROFIT_BASE` 一致。）

- **顶栏筛选项**：`GET .../meta-filter-options`，无 query/body（仅全局 Token），响应用于 `ElSelect`；日期范围由 `ElDatePicker` 写入 `query.dateRange`（`YYYY-MM-DD,YYYY-MM-DD`）。
- **数据接口**：POST，请求体为**扁平对象**（`dateRange` 必填；`currentPage`、`pageSize`、`platform`、`sAppId`、`sCountryCode` 可选），**无 `fo` 包裹**；**GET meta-filter-options** 除外。

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 筛选下拉：应用、国家、日期范围选项 | `/meta-filter-options` | GET | P0 |
| `02-overview-kpi.json` | 顶部 5 个 KPI 卡片（预估利润、总收入、广告支出、广告收益率、付费收入占比） | `/overview/kpi` | POST | P0 |
| `03-table-app-profit.json` | 应用利润详情（树表）：单根节点 + 国家子节点（前端展开后增量渲染 + 虚拟列表） | `/table/app-profit` | POST | P0 |
| `04-overview-country-profit.json` | 国家利润分布（地图数据 + Top10 表） | `/overview/country-profit` | POST | P0 |
| `05-overview-trend30d.json` | 利润趋势近 30 天（总收入、广告支出、预估利润） | `/overview/trend30d` | POST | P0 |
| `06-overview-sankey.json` | 利润构成桑基图（节点与连线） | `/overview/sankey` | POST | P0 |

## 拆分原则

- 一个接口只服务一个明确 UI 模块（KPI 行、应用表、国家地图+表、趋势图、桑基图）
- 全局筛选参数（`dateRange`、`currentPage`、`pageSize`、`platform`、`sAppId`、`sCountryCode`）由各业务 POST 接口统一接收
- 金额/占比展示格式可由前端根据数值格式化，契约中可约定数值与单位

## 字段约定

- **请求体**为扁平 **ProfitAnalysisQueryParams**（camelCase：`sAppId`、`sCountryCode` 等）；业务含义仍对应数据字典中的应用、国家、终端平台等概念。
- 响应与报表字段展示在遵守 `backend-fields.mdc` 语义的前提下，以实际 DTO 字段名为准。
