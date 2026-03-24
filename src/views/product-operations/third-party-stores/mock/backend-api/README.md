# 三方商店管理 — 接口契约

## 父级 API 路径

`/api/product-operations/third-party-stores`

与路由 `/product-operations/third-party-stores` 层级一致。

## 接口清单

| 契约文件 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| `01-overview-dashboard.json` | POST | `/overview/dashboard` | 页面首屏与查询：平台卡、KPI、双表、图表 |

## 拆分原则

单接口对应单页主要数据场景；后续若首屏过大可再拆 `overview/kpi`、`table/app-store` 等（见项目 api-contract 规范）。
