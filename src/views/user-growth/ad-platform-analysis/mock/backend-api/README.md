# 广告平台分析（大屏）- 接口契约清单

## 基路径（以 `src/api` 实际请求为准）

本页面接口来自：`src/api/user-growth/ad-platform-analysis.ts`

| 模块           | URL（完整）                                               | 方法 |
| -------------- | --------------------------------------------------------- | ---- |
| 筛选元数据     | `/api/v1/datacenter/analysis/ad-platform/filters/meta`    | POST |
| KPI 卡片       | `/api/v1/datacenter/analysis/ad-platform/kpi/cards`       | POST |
| ROI 趋势       | `/api/v1/datacenter/analysis/ad-platform/roi/trend`       | POST |
| 用户质量热力图 | `/api/v1/datacenter/analysis/ad-platform/quality/heatmap` | POST |
| Top10 广告系列 | `/api/v1/datacenter/analysis/ad-platform/campaign/top10`  | POST |
| 指标比较详情表 | `/api/v1/datacenter/analysis/ad-platform/metrics/table`   | POST |

**响应包裹**：成功时业务体位于网关 `BaseResponse.data`；本目录各契约的 `sampleResponse` 表示 **unwrap 后的 `data`**。

## 接口清单

| 文件                      | 页面模块               | URL                   | 优先级 |
| ------------------------- | ---------------------- | --------------------- | ------ |
| `01-filters-meta.json`    | 顶栏筛选下拉           | `.../filters/meta`    | P0     |
| `02-kpi-cards.json`       | 第一排 KPI 卡片        | `.../kpi/cards`       | P0     |
| `03-roi-trend.json`       | ROI 趋势图             | `.../roi/trend`       | P0     |
| `04-quality-heatmap.json` | 用户质量热力图         | `.../quality/heatmap` | P0     |
| `05-campaign-top10.json`  | Top10 广告系列         | `.../campaign/top10`  | P0     |
| `06-metrics-table.json`   | 指标比较详情表（分页） | `.../metrics/table`   | P0     |

## 场景 → 接口（与各 JSON `interaction` 一致）

| 场景 / 触发时机 | 调用的接口 | 说明 |
| --- | --- | --- |
| 页面首屏进入 | 01～06 全部 | `index.vue` 首屏初始化，按模块并行请求 |
| 点击顶栏「查询」 | 02～06（可选 01） | 以当前筛选值构造请求体，刷新各模块数据；筛选元数据一般可缓存 |
| 变更分页 / 排序（指标比较表） | 06 | 仅刷新表格接口（携带 `currentPage/pageSize` 与排序字段，若后端支持） |
