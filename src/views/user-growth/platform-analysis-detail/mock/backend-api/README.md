# 广告平台分析详情 — 接口清单

## 父级路径

与路由 `/user-growth/comprehensive-analysis/platform-analysis-detail` 对齐：**`/api/user-growth/platform-analysis-detail`**

约定：**POST**，请求体 JSON。

## 接口表

| 优先级 | 说明 | URL（POST） | 契约文件 |
| --- | --- | --- | --- |
| P0 | 详情页整页数据（KPI/矩阵/趋势等） | `/api/user-growth/platform-analysis-detail/overview` | `01-overview.json` |

## 与综合分析的关系

- 综合分析页 `router.push` 时传入 `query.name`、`query.from`；本接口请求体 `name`、`from` 与之一致。
- `name` 为钻取实体展示名（如应用名），与页面 `sourceName` 展示对应。
