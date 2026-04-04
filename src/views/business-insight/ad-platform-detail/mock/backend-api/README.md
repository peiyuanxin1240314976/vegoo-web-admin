# 广告平台详情 — 接口契约清单

## 父级 API 路径

- 文档示例：`POST /api/business-insight/ad-platform-detail/<endpoint>`
- 网关实现建议：`POST /api/v1/datacenter/analysis/business-insight/ad-platform-detail/<endpoint>`（与 `src/api/analysis-api-base.ts` 中 `ANALYSIS_API_BASE` 拼接；若网关层级不同，以实际 `src/api` 为准并在本 README 备注）

## 公用 meta（无本目录 JSON）

| 能力 | URL | 说明 |
| --- | --- | --- |
| 顶栏筛选项 | `GET ${ANALYSIS_API_BASE}/cockpit/meta-filter-options` | 应用、终端平台、广告平台、国家等；**无参**。页面读 `useCockpitMetaFilterStore().data`。详见 `paid-analysis/mock/backend-api/README.md` 附录 A。 |

## 拆分原则

- 按 **KPI / 趋势图 / 表格 / AI 洞察** 拆接口，避免单接口整页大包。
- 筛选入参：`startDate`、`endDate`（`YYYY-MM-DD`）、`appId`（`""` 表全部应用）、`s_country_code`（`""` 表全部国家）、`source`（可选，广告平台，与路由钻取 query `source` 及数据字典 `source`/`n_source` 语义一致，值为展示名或枚举 string 以联调为准）。

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-overview-kpis.json` | 顶部 KPI 四卡（主文案 + 环比 + 迷你序列） | `/overview/kpis` | POST | P0 |
| `02-overview-trend.json` | 核心指标趋势（收入、eCPM、填充率） | `/overview/trend` | POST | P0 |
| `03-table-apps.json` | 按应用拆分的收入/eCPM/填充/展示表 | `/table/apps` | POST | P0 |
| `04-ai-insights.json` | AI 洞察与建议列表 | `/overview/ai-insights` | POST | P1 |

## 前端对照

- 当前页面仍为静态 mock；接入时在 **`ad-platform-detail/config/`** 维护数据源开关，在 `src/api` 增加 `fetch*` 并与本目录契约对齐。
