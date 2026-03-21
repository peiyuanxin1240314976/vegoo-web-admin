# 广告系列详情页接口规范

页面路由：`/user-growth/ad-performance/campaign-detail` **父级 API 路径**：`/api/user-growth/ad-performance/campaign-detail`（与前端路由一致）

## 一、接口清单

| 优先级 | 功能说明 | URL（POST） | 对应文件 |
| --- | --- | --- | --- |
| **P0** | 系列概览（基本信息/预算/目标/趋势） | `/api/user-growth/ad-performance/campaign-detail/overview` | 01 |
| **P0** | 广告列表（广告组明细表格） | `/api/user-growth/ad-performance/campaign-detail/ad-list` | 02 |
| **P1** | 素材表现 Top5 | `/api/user-growth/ad-performance/campaign-detail/creative-top5` | 03 |
| **P1** | AI 洞察与建议 | `/api/user-growth/ad-performance/campaign-detail/ai-insights` | 04 |

## 二、统一约定

- **全部使用 POST**，请求体为 JSON。
- 请求体必传字段：`campaignId`（广告系列唯一标识）。
- 广告列表（02）支持 `status` 过滤参数（`all/active/paused/completed`）。
- 若网关统一包裹为 `{ code, message, data }`，各接口出参放入 `data` 即可。
