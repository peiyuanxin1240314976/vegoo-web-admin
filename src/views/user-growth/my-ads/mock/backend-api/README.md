# 我的广告页接口契约（Mock）

本目录与前端路由 `/user-growth/my-ads` 对齐，**父级 API 路径**：`/api/user-growth/my-ads`。

## 拆分原则

- 按 **一个接口服务一个明确 UI 场景** 拆分：顶部元数据、汇总 Tab、应用+广告平台 Tab、广告系列明细 Tab 各独立。
- 禁止单接口返回整页全部数据且不可裁剪。

## 接口清单

| 优先级 | 功能 | URL（POST） | 契约文件 |
| --- | --- | --- | --- |
| P0 | 优化师等顶部筛选项 | `/api/user-growth/my-ads/meta-staff-options` | `01-meta-staff-options.json` |
| P0 | 页面头部（用户卡 + KPI 横条 + 默认期间） | `/api/user-growth/my-ads/overview/page-header` | `02-overview-page-header.json` |
| P0 | 汇总 Tab | `/api/user-growth/my-ads/table/summary` | `03-table-summary.json` |
| P0 | 应用 + 广告平台 Tab | `/api/user-growth/my-ads/table/platform` | `04-table-platform.json` |
| P0 | 广告系列明细 Tab | `/api/user-growth/my-ads/table/campaign` | `05-table-campaign.json` |
| P2 | 导出报表 | `/api/user-growth/my-ads/export` | （待补充） |

若网关统一包裹为 `{ code, message, data }`，下列 `sampleResponse` 表示 `data` 内结构。

字段命名涉及广告业务时与 `backend-fields.mdc` 一致；**终端平台**用 `platform`，**广告平台**用 `source`（本页 Mock 中部分展示名仍可能为产品文案，对接时以接口字段为准）。
