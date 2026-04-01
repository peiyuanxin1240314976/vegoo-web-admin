# 广告平台分析详情 — 接口清单（backend-api）

## 父级路径

与路由 `/user-growth/comprehensive-analysis/platform-analysis-detail` 对齐。逻辑资源路径：

**`/api/user-growth/comprehensive-analysis/platform-analysis-detail`**

（本契约以该父级路径为准；前端 `src/api/user-growth/platform-analysis-detail.ts` 的请求 base 以实际网关配置为准。）

约定：**POST**，各接口请求体均为 **`{ name, from? }`**（与钻取 query 一致）。

## 数据源开关

见 **`../config/data-source.ts`**，与下表 **1:1**；可逐接口切 Mock / 远程。

## 接口表

| 优先级 | 说明                               | URL（POST，末段）  | 契约文件               |
| ------ | ---------------------------------- | ------------------ | ---------------------- |
| P0     | 顶栏 KPI + 左列三卡 + `sourceName` | `.../summary`      | `01-summary.json`      |
| P0     | 广告平台 CPI 趋势图                | `.../cpi-trend`    | `02-cpi-trend.json`    |
| P0     | ECPM 趋势 + 底部四指标             | `.../ecpm-trend`   | `03-ecpm-trend.json`   |
| P0     | 广告平台 × 国家树形表 + 合计行     | `.../matrix-table` | `04-matrix-table.json` |
| P1     | 底部智能预警条                     | `.../alert-bar`    | `05-alert-bar.json`    |

## 场景 → 接口

| 场景 | 接口 | 说明 |
| --- | --- | --- |
| 进入详情页首屏 | 上表 **5 个 POST 并行** | 前端 `loadPlatformAnalysisDetailPage` 组装为 `PlatformAnalysisDetailData` |
| 顶栏 / 三卡 / 「当前查看」名 | `summary` | 含 `sourceName` |
| 左列 CPI 折线图 | `cpi-trend` | 响应体为 `ChartTrend` |
| 左列 ECPM 图 + 四色块 | `ecpm-trend` | 响应体为 `{ ecpmTrend, ecpmMetrics }` |
| 右侧矩阵表 | `matrix-table` | 响应体为 `MatrixTableData` |
| 底栏预警 | `alert-bar` | 响应体为 **`AlertBarItem[]`** 或 `{ "alertBar": [...] }`（前端兼容两种） |
| 表头展开/收起、自定义列、导出 | — | 本地占位或 P2，无契约 |

## 与综合分析的关系

- 钻取时 `query.name`、`query.from` 传入各接口请求体。
- 国家行仅用 **`s_country_code`**（ISO alpha-2）+ 前端 `flag-icons`，勿返回国旗 emoji。
