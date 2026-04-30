# 三方商店管理 — 接口契约

## 父级 API 路径

`/api/product-operations/third-party-stores`

与路由 `/product-operations/third-party-stores` 层级一致。

## 接口清单

| 契约文件 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| `01-overview-dashboard.json` | POST | `/overview/dashboard` | 页面首屏与查询：平台卡、KPI、双表、图表 |
| `06-filter-options.json` | POST | `/meta/filter-options` | **模块独有**筛选下拉（应用商店/渠道/货币）；通用维度见下方说明 |
| `02-platform-detail.json` | POST | `/platform/detail` | 平台详情（卡片「查看详情」） |
| `03-platform-create.json` | POST | `/platform/create` | 新增平台（右上角「新增平台」） |
| `04-platform-auth-fix.json` | POST | `/platform/auth-fix` | 修复认证（卡片「修复认证」） |
| `05-export-dashboard.json` | POST | `/export/dashboard` | 导出（右上角「导出」） |

## 通用下拉（不在本模块单独建契约）

本页筛选中的 **应用/平台/广告平台（以及国家等通用维度）** 统一复用 cockpit 顶栏 meta：

- **数据来源**：`useCockpitMetaFilterStore().data`（或 `useCockpitMetaFilterOptions().cockpitMeta`）
- **接口**：`GET /api/v1/datacenter/analysis/cockpit/meta-filter-options`（无参）
- **说明**：按项目规范该能力 **无模块内 JSON 契约**，仅在此 README 标注即可

## 拆分原则

单接口对应单页主要数据场景；后续若首屏过大可再拆 `overview/kpi`、`table/app-store` 等（见项目 api-contract 规范）。

## 场景 → 接口

| 场景 | 触发 | 接口 |
| --- | --- | --- |
| 首屏初始化（下拉选项） | 进入路由 `/product-operations/third-party-stores` | `POST /meta/filter-options`（`06-filter-options.json`） |
| 首屏初始化 | 进入路由 `/product-operations/third-party-stores` | `POST /overview/dashboard`（`01-overview-dashboard.json`） |
| 查询 | 点击「查询」 | `POST /overview/dashboard`（请求体由筛选栏构建） |
| 重置 | 点击「重置」 | `POST /overview/dashboard`（恢复默认筛选后请求） |
| 查看平台详情 | 点击平台卡片「查看详情」 | `POST /platform/detail`（`02-platform-detail.json`） |
| 新增平台 | 点击右上角「新增平台」提交 | `POST /platform/create`（`03-platform-create.json`） |
| 修复认证 | 点击平台卡片「修复认证」 | `POST /platform/auth-fix`（`04-platform-auth-fix.json`） |
| 导出 | 点击右上角「导出」 | `POST /export/dashboard`（`05-export-dashboard.json`） |
