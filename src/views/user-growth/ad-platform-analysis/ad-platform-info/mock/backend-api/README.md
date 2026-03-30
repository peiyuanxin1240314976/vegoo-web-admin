# 广告平台信息 - 接口契约清单

## 父级 API 路径（与 `src/api` 一致）

**基路径**：`/api/v1/datacenter/analysis/ad-platform/ad-platform-info`

完整 URL：`POST {基路径}/{endpoint}`，见各 JSON `api.url`。

对应前端路由：`/user-growth/ad-platform-analysis/ad-platform-info?id=<s_campaign_id>`（`id` 即请求体 `s_campaign_id`）。

**响应包裹**：成功时业务体在网关 **`BaseResponse.data`**，各契约 `sampleResponse` 为 **unwrap 后的 `data` 内结构**（与 `request.post` 泛型一致）。

## 拆分原则

- **一接口一 UI 模块**：首屏可按模块并行请求，避免单接口 payload 过大。
- 各接口 **POST + JSON**，请求体均含 **`s_campaign_id`** 与 **`date_range`**（及可选 `t_start_date`/`t_end_date`）。

## 接口清单

| 文件                        | 页面模块            | endpoint（相对基路径） | 方法 | 优先级 |
| --------------------------- | ------------------- | ---------------------- | ---- | ------ |
| `01-platform-summary.json`  | 顶部摘要 + 更新时间 | `/platform-summary`    | POST | P0     |
| `02-kpi-cards.json`         | KPI 卡片            | `/kpi-cards`           | POST | P0     |
| `03-roi-map-points.json`    | ROI 地图散点        | `/roi-map-points`      | POST | P0     |
| `04-country-top10.json`     | 国家 Top10          | `/country-top10`       | POST | P0     |
| `05-retention-heatmap.json` | 留存热力图          | `/retention-heatmap`   | POST | P0     |
| `06-conversion-funnel.json` | 转化漏斗            | `/conversion-funnel`   | POST | P1     |
| `07-trend-chart.json`       | 趋势图              | `/trend-chart`         | POST | P0     |
| `08-campaign-table.json`    | 广告系列明细表      | `/campaign-table`      | POST | P1     |

## 场景 → 接口（与各 JSON 根级 `interaction` 一致）

| 用户场景 / 触发时机 | 调用的 POST（ endpoint ） | 说明 |
| --- | --- | --- |
| 进入详情页且 `?id=` 有效 | 上表 **全部 8 个** | `useAdPlatformInfo` 内 `Promise.all` 并行 |
| 顶栏「查询」（应用时间筛选草稿） | 上表 **全部 8 个** | `applyDraftFilters` → `load()`，携带最新 `date_range` |
| 顶栏「刷新」 | 同上 | 调用 `load()`，请求体与当前 `filters` 一致 |

**默认选中**：`date_range` 初始 `30d`；`s_campaign_id` = 路由 `query.id`。

## `fetch*` 与数据源开关

- HTTP 封装：`src/api/user-growth/ad-platform-info.ts`
- Mock 分片响应：`mock/ad-platform-info-api-mock.ts`（与各契约 `sampleResponse` 同形）
- 按接口 Mock/远程：`src/views/.../ad-platform-info/config/data-source.ts`（`AD_PLATFORM_INFO_USE_MOCK`）

## 字段与数据字典

- 广告系列主键：`s_campaign_id`（与路由 query `id` 一致）。
- 国家代码：`s_country_code`（ISO 3166-1 alpha-2）。
- 金额类：数值 + USD 语义，展示格式由前端统一。

## 目录约定

- 契约位于本子目录 `01`～`08`；**聚合大屏**契约仍在 `ad-platform-analysis` 侧，与本详情页分离。
- **不另建 `api-mock/`**：与规范中「推荐」条目相比，本页以各契约内 `sampleResponse` 为唯一示例源，避免与 `backend-api` 重复维护；需要静态文件时直接从契约复制即可。
- 技能「大模块契约上收」：若产品将「广告平台分析」视为单一聚合单元，可后续将本目录迁至 `ad-platform-analysis/mock/backend-api/` 并以文件名前缀区分（当前保持子页目录不动，避免大范围搬家）。
