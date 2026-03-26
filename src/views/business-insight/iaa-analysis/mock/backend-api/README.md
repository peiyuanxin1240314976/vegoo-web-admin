# IAA 分析 - 接口契约清单

## 父级 API 路径

`POST /api/business-insight/iaa-analysis/<endpoint>`

（若项目统一使用 datacenter 网关，则为：`POST /api/v1/datacenter/analysis/business-insight/iaa-analysis/<endpoint>`）

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 全局筛选下拉（App/Platform/Country） | `/meta-filter-options` | GET | P0 |
| `03-table-ad-platform.json` | 广告平台 Tab - 平台详细对比表 | `/table/ad-platform` | POST | P0 |
| `04-table-ad-placement.json` | 广告位 Tab - 广告位详细数据表 | `/table/ad-placement` | POST | P0 |
| `05-table-ad-unit.json` | 广告单元 Tab - 广告单元 Top15 收入表 | `/table/ad-unit` | POST | P0 |
| `06-table-country.json` | 国家 Tab - 国家收入 Top10 表 | `/table/country` | POST | P0 |
| `07-table-version.json` | 版本 Tab - 版本详细数据表 | `/table/version` | POST | P0 |
| `08-chart-platform-ranking.json` | 广告平台效果排行（柱状） | `/chart/platform-ranking` | POST | P0 |
| `09-chart-revenue-donut.json` | 广告平台收入占比（环形图） | `/chart/revenue-donut` | POST | P0 |
| `10-chart-revenue-trend-7d.json` | 近 7 天收入趋势（多线/堆叠） | `/chart/revenue-trend-7d` | POST | P0 |
| `11-overview-ad-type-tab.json` | 广告类型 Tab 整页（KPI/表格/多图） | `/overview/ad-type-tab` | POST | P0 |
| `12-overview-platform-tab.json` | 广告平台 Tab 整页（KPI/排行/对比表/ECPM/趋势） | `/overview/platform-tab` | POST | P0 |
| `13-overview-placement-tab.json` | 广告位 Tab 整页（KPI/Top10/详表/环形/ECPM/散点） | `/overview/placement-tab` | POST | P0 |
| `14-overview-ad-unit-tab.json` | 广告单元 Tab 整页（KPI/Top15表/充填率/散点/趋势） | `/overview/ad-unit-tab` | POST | P0 |
| `15-overview-country-tab.json` | 国家 Tab 整页（KPI/地图热力mapData/Top10表/ECPM对比/7天趋势/渗透率） | `/overview/country-tab` | POST | P0 |
| `16-overview-version-tab.json` | 版本 Tab 整页（KPI/收入对比/版本表/ECPM趋势/升级进度/AI洞察） | `/overview/version-tab` | POST | P0 |

## 拆分原则

- 一个接口只服务一个 UI 模块（一个 Tab 内的一块图表或一张表）
- 全局筛选参数（s_app_id、platform、s_country_code、t_date）由各 POST 接口统一接收
- 按 Tab 切换时，仅请求该 Tab 可见模块的接口，避免一次拉取全页

## 字段约定

- 遵循 `backend-fields.mdc`：广告平台 `source`/`n_source`，终端平台 `platform`，国家 `s_country_code`，收入 `revenue`，展示 `impressions`，ECPM 预估/真实、充填率、版本 `app_version` 等

## `sampleRequest` / `sampleResponse` 与 Mock 一致

本目录每个 `*.json` 中的 **`sampleRequest`、`sampleResponse` 应与 `src/api/business-insight.ts` 在 Mock 模式下实际返回的数据结构一致**（含字段、数组长度、嵌套形状）。后端可对照 JSON 实现；前端改 Mock 或改 `business-insight-api-mock` 等实现时，**请同步更新**对应契约里的示例，避免契约与运行时不一致。

- **`fieldDescription`**：字段含义、必填、枚举仍以本文件为准，并与 `types.ts` 一致。
- **`api`**：路径与方法说明。
- **Markdown 不重复粘贴整段 JSON**，样例以各 `*.json` 为准。

### 本仓库当前已有文件

`01`、`03`、`11`～`16`。新增契约时，示例同样须与 Mock 实现一致。

### 清单与 `types.ts` 对应关系（整页接口）

| 文件                             | `types.ts` 类型                   |
| -------------------------------- | --------------------------------- |
| `11-overview-ad-type-tab.json`   | `IaaAdTypeTabData`                |
| `12-overview-platform-tab.json`  | `IaaPlatformTabData`              |
| `13-overview-placement-tab.json` | `IaaPlacementTabData`             |
| `14-overview-ad-unit-tab.json`   | `IaaAdUnitTabData`                |
| `15-overview-country-tab.json`   | `IaaCountryTabData`               |
| `16-overview-version-tab.json`   | `IaaVersionTabData`               |
| `01-meta-filter-options.json`    | `IaaFilterOptions`                |
| `03-table-ad-platform.json`      | `IaaPlatformTableRow[]`（`list`） |
