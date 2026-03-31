# IAP 分析 - 接口契约清单

## 父级 API 路径

文档示例：`/api/business-insight/iap-analysis/<endpoint>`  
当前网关实现：`/api/v1/datacenter/analysis/business-insight/iap-analysis/<endpoint>`（见 `src/api/iap-analysis.ts`，与下表一一对应）

（GET 用于 meta，POST 用于带筛选的查询）

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 筛选下拉：应用、平台、国家、产品类型、时间范围 | `/meta-filter-options` | GET | P0 |
| `02-overview-kpi.json` | Dashboard 顶部 6 个 KPI 卡片 | `/overview/kpi` | POST | P0 |
| `03-overview-trend.json` | Dashboard 三块趋势图（订单vs收入、转化率、ARPU） | `/overview/trend` | POST | P0 |
| `04-overview-app-cards.json` | Dashboard 应用分析卡片列表 | `/overview/app-cards` | POST | P0 |
| `05-overview-country-distribution.json` | Dashboard 按国家/地区收入分布表 | `/overview/country-distribution` | POST | P0 |
| `06-overview-product-type-donut.json` | Dashboard 产品类型分布甜甜圈 | `/overview/product-type-donut` | POST | P0 |
| `07-overview-platform-compare.json` | Dashboard 平台对比柱状图 | `/overview/platform-compare` | POST | P0 |
| `09-detail-kpi.json` | Detail 页顶部 6 个 KPI | `/detail/kpi` | POST | P0 |
| `10-detail-product.json` | Detail 产品统计 Tab 数据 | `/detail/product` | POST | P0 |
| `11-detail-user.json` | Detail 用户分析 Tab 数据 | `/detail/user` | POST | P0 |
| `12-detail-trend.json` | Detail 趋势分析 Tab 数据 | `/detail/trend` | POST | P0 |

## 前端分片调用

- 各契约对应方法集中在 `src/api/iap-analysis.ts`（按文件名注释可查）
- Dashboard 01～07：`composables/useIapDashboardModules.ts` 内并行拉取
- 详情 09～12：按 Tab 懒加载，见 `detail.vue`（进入页仅 KPI + 当前 Tab，切换 Tab 再请求对应接口）

## 拆分原则

- 一个接口只服务一个明确 UI 模块（一块 KPI、一张图、一张表或一个 Tab 聚合）
- **Dashboard 带筛选的 POST（02～07）**：请求体与 `02-overview-kpi.json` 的 `request` **一致**，均接收五维筛选  
  `startDate`、`endDate`（必填）、`s_app_id`、`s_country_code`、`platform`（可选，未选或「全部」时传 `all` 或空由网关约定；前端见 `normalizeIapOverviewBody`）。各图/KPI/卡片/分布/甜甜圈/平台对比的后端实现须 **按同一语义过滤**，避免「只有表格跟着筛、图不跟筛」。
- **Mock 模式**：`business-insight-api-mock.ts` 内 Dashboard Mock 已按上述入参做 **演示级** 变化（非真实聚合）；接真接口后以服务端为准。
- Detail 接口需带 s_app_id（或应用标识）以按应用拉取详情

## 字段约定

- 遵循 `backend-fields.mdc`：终端平台 `platform`，国家 `s_country_code`，应用 `s_app_id`，收入 `revenue`，实收 `amount`，数量 `quantity`，商品 `sku`，订单 `order`，订阅收入 `subscription_revenue`，内购价值 `lap_revenue` 等

## 契约示例与 Mock 一致

与仓库根目录 [README.md](../../../../../../README.md) **「契约示例与 Mock 一致」**相同：本目录各 `*.json` 的 **`sampleRequest` / `sampleResponse` 须与 IAP 相关 Mock 实际返回一致**（见 `src/api/iap-analysis.ts` Mock 分支及 `business-insight-api-mock` 等）；改 Mock 或改示例时请同步。**具体样例正文只在各 JSON 文件内。**
