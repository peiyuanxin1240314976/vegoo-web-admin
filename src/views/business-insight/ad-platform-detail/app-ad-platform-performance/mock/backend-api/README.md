# 应用内广告平台表现 — 接口契约清单

## 父级 API 路径

- 文档示例：`POST /api/business-insight/ad-platform-detail/app-ad-platform-performance/<endpoint>`
- 网关实现建议：`POST /api/v1/datacenter/analysis/business-insight/ad-platform-detail/app-ad-platform-performance/<endpoint>`（与 `ANALYSIS_API_BASE` 拼接；以实际 `src/api` 为准）

## 公用 meta

与 **`ad-platform-detail`** 父页相同：**不** 在本目录建 `meta-filter-options`；国家选项来自 **`GET`** `.../cockpit/meta-filter-options`。

## 请求体公共字段（非筛选项）

| 字段                    | 说明                                                         |
| ----------------------- | ------------------------------------------------------------ |
| `startDate` / `endDate` | 统计区间 `YYYY-MM-DD`。                                      |
| `s_country_code`        | 国家；`""` 全部。                                            |
| `appId`                 | **必填**，当前查看的应用，来自路由 `query.app`（非筛选器）。 |
| `source`                | 可选，广告平台上下文（与路由 `query.source` 一致）。         |

## 接口清单

| 文件 | 说明 | 建议 URL | 优先级 |
| --- | --- | --- | --- |
| `01-overview-kpis.json` | 左侧 KPI 四卡（含环比角标、迷你序列） | `/overview/kpis` | P0 |
| `02-overview-trend.json` | 核心指标趋势图 | `/overview/trend` | P0 |
| `03-waterfall.json` | 瀑布流设置（按横幅/插屏/激励/其他 Tab） | `/waterfall` | P0 |
| `04-table-ad-units.json` | 广告位表现表 | `/table/ad-units` | P0 |
| `05-ai-insights.json` | AI 洞察与建议 | `/overview/ai-insights` | P1 |

## 前端对照

- 页面：`app-ad-platform-performance/index.vue`。接入时在 **`config/data-source.ts`**（待建）按接口配置 mock/remote。
