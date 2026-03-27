# 广告成效（Ad Performance）接口 Mock 规范

本目录为「用户增长 / 广告成效」**全模块**接口契约（列表页 + 系列详情 + 广告详情 + 编辑）。字段以各页面 `types.ts` 及 `src/api/ad-performance.ts` 为准。

## 一、URL 与请求规范

- **方法**：**全部 POST**，请求体 JSON。
- **父级路径（与代码一致）**：`ANALYSIS_API_BASE` + `ANALYSIS_API_MIDDLE_PREFIX` + `/ad-performance`，即默认 **`/api/v1/datacenter/analysis/ad-performance`**（见 [`src/api/analysis-api-base.ts`](../../../../../api/analysis-api-base.ts) 与 [`src/api/ad-performance.ts`](../../../../../api/ad-performance.ts) 的 `AD_PERFORMANCE_BASE` / `AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE`）。
- **功能段**：kebab-case；系列下钻接口在 `.../ad-performance/campaign-detail/...`。

每个契约 JSON 根级含 **`interaction`**（触发时机、与组件对应关系、默认选型与去重建议）。**`03-table.json`** 仅为 **索引 + 公共 request 说明**，**不**与 `config/data-source.ts` 中某一开关项 1:1；真实开关与 Mock 以 **03-a～03-d** 为准。

## 二、接口清单（契约文件）

| 优先级 | 契约文件 | URL（POST，逻辑路径；相对父级） |
| --- | --- | --- |
| P0 | `01-meta-filter-options.json` | `/ad-performance/meta-filter-options` |
| P0 | `02-overview.json` | `/ad-performance/overview` |
| — | `03-table.json` | （说明文件，见上文） |
| P0 | `03-a-table-campaign.json` | `/ad-performance/table/campaign` |
| P0 | `03-b-table-country.json` | `/ad-performance/table/country` |
| P0 | `03-c-table-owner.json` | `/ad-performance/table/owner` |
| P0 | `03-d-table-account.json` | `/ad-performance/table/account` |
| P0 | `04-campaign-detail.json` | `/ad-performance/campaign-detail` |
| P2 | `05-export.json` | `/ad-performance/export` |
| P2 | `06-alert-action.json` | `/ad-performance/alert-action` |
| P0 | `07-campaign-detail-overview.json` | `/ad-performance/campaign-detail/overview` |
| P0 | `08-campaign-detail-ad-list.json` | `/ad-performance/campaign-detail/ad-list` |
| P1 | `09-campaign-detail-creative-top5.json` | `/ad-performance/campaign-detail/creative-top5` |
| P1 | `10-campaign-detail-ai-insights.json` | `/ad-performance/campaign-detail/ai-insights` |
| P1 | `11-campaign-detail-campaign-action.json` | `/ad-performance/campaign-detail/campaign-action` |
| P1 | `12-campaign-detail-ad-group-action.json` | `/ad-performance/campaign-detail/ad-group-action` |
| P0 | `13-ad-detail-overview.json` | `/ad-performance/campaign-detail/ad-detail/overview` |
| P0 | `14-ad-edit-form.json` | `/ad-performance/campaign-detail/ad-edit/form` |
| P0 | `15-ad-edit-save-draft.json` | `/ad-performance/campaign-detail/ad-edit/save-draft` |
| P0 | `16-ad-edit-submit-launch.json` | `/ad-performance/campaign-detail/ad-edit/submit-launch` |

网关若统一包裹 `{ code, message, data }`，各接口出参放在 `data` 即可。

## 三、场景 → 接口（联调索引）

| UI 场景                                   | 契约文件 / `fetch*`                             |
| ----------------------------------------- | ----------------------------------------------- |
| 列表页筛选下拉                            | `01` / `fetchAdPerformanceMetaFilterOptions`    |
| 列表 KPI、趋势、分布、预警                | `02` / `fetchAdPerformanceOverview`             |
| 主表 Campaign / Country / Owner / Account | `03-a`～`03-d` / `fetchAdPerformanceTable*`     |
| 列表行打开系列抽屉（聚合详情）            | `04` / `fetchAdPerformanceCampaignDetailDrawer` |
| 导出、预警卡片操作                        | `05`、`06`                                      |
| 独立路由「系列详情」首屏四块 + 列表       | `07`～`10`、`08`；操作 `11`、`12`               |
| 独立路由「广告详情」                      | `13`；暂停等写操作同 `12`                       |
| 独立路由「编辑 Campaign」                 | `14`～`16`                                      |

## 四、统一约定

- 筛选「全部」：下拉字段可用空字符串 `''`。
- 日期范围：`dateRange` 枚举（today / yesterday / last7d / month）与主列表、详情约定一致。
- 导出：`05` 支持文件流或 `downloadUrl`（见契约）。
- 数据源开关：[`../config/data-source.ts`](../config/data-source.ts) 按接口粒度配置（列表 9 项 + 系列详情 6 项 + 广告详情 1 项 + 编辑 3 项）。
