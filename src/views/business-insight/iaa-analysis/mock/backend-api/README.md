# IAA 分析 - 接口契约清单

## 父级 API 路径

`POST /api/business-insight/iaa-analysis/<endpoint>`

（若项目统一使用 datacenter 网关，则为：`POST /api/v1/datacenter/analysis/business-insight/iaa-analysis/<endpoint>`）

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 全局筛选下拉（App/Platform/Country） | `/meta-filter-options` | GET | P0 |
| `02-overview-kpi.json` | 当前 Tab 顶部 4 个 KPI 卡片 | `/overview-kpi` | POST | P0 |
| `03-table-ad-platform.json` | 广告平台 Tab - 平台详细对比表 | `/table/ad-platform` | POST | P0 |
| `04-table-ad-placement.json` | 广告位 Tab - 广告位详细数据表 | `/table/ad-placement` | POST | P0 |
| `05-table-ad-unit.json` | 广告单元 Tab - 广告单元 Top15 收入表 | `/table/ad-unit` | POST | P0 |
| `06-table-country.json` | 国家 Tab - 国家收入 Top10 表 | `/table/country` | POST | P0 |
| `07-table-version.json` | 版本 Tab - 版本详细数据表 | `/table/version` | POST | P0 |
| `08-chart-platform-ranking.json` | 广告平台效果排行（柱状） | `/chart/platform-ranking` | POST | P0 |
| `09-chart-revenue-donut.json` | 广告平台收入占比（环形图） | `/chart/revenue-donut` | POST | P0 |
| `10-chart-revenue-trend-7d.json` | 近 7 天收入趋势（多线/堆叠） | `/chart/revenue-trend-7d` | POST | P0 |

## 拆分原则

- 一个接口只服务一个 UI 模块（一个 Tab 内的一块图表或一张表）
- 全局筛选参数（s_app_id、platform、s_country_code、t_date）由各 POST 接口统一接收
- 按 Tab 切换时，仅请求该 Tab 可见模块的接口，避免一次拉取全页

## 字段约定

- 遵循 `backend-fields.mdc`：广告平台 `source`/`n_source`，终端平台 `platform`，国家 `s_country_code`，收入 `revenue`，展示 `impressions`，ECPM 预估/真实、充填率、版本 `app_version` 等
