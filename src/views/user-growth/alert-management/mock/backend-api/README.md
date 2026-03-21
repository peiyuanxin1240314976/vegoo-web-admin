# 预警管理 — 接口清单（backend-api）

## 父级路径

与路由 `/user-growth/alert-management` 对齐：**`/api/user-growth/alert-management`**

约定：**POST**，请求体 JSON；网关统一包裹时业务数据在 `data` 内。

## 接口表

| 优先级 | 说明 | URL（POST） | 契约文件 |
| --- | --- | --- | --- |
| P0 | 整页聚合（趋势图、异常分类、KPI、预警列表等） | `/api/user-growth/alert-management/overview` | `01-overview.json` |

## 拆分原则（后续）

若首屏 payload 过大，可按 UI 边界拆为：

- `overview/summary-trend`：四宫格 KPI + 单列「预警趋势」折线图
- `overview/classification`：异常分类环形图（含中心文案）
- `overview/rule-groups`：预警规则折叠区
- `table/alerts`：预警卡片列表（支持分页、筛选；与左侧网格对应）
- `meta-filter-options`：筛选项字典（若与页面强绑定）

当前首版前端使用单接口 mock，与 `01-overview.json` 对齐；`fetchAlertManagementOverview` 已接收与契约一致的请求体（`types.ts`：`AlertManagementOverviewParams`），筛选变更会重新请求；接入后端时替换为真实 `POST` 即可。
