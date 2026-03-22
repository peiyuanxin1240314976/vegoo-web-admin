# 广告成效（Ad Performance）接口 Mock 规范

本目录为「用户增长 / 广告成效」页面的接口契约定义，供后端实现与前端联调使用。字段结构以页面现有类型为准：`src/views/user-growth/ad-performance/types.ts`。

## 一、URL 与请求规范

- **规则**：采用 **模块 + 功能名称** 的路径，**全部使用 POST**，请求体为 JSON。
- **父级路径（当前前端默认）**：`/api/v1/datacenter/analysis/user-growth/ad-performance`（与「我的绩效」同级，见 [`src/api/ad-performance.ts`](../../../../../api/ad-performance.ts) 的 `AD_PERFORMANCE_BASE`）。下表历史示例仍为 `/api/user-growth/ad-performance/...`，联调以前端常量为准。
- **功能路径**：kebab-case，见下表。

## 二、接口清单（按功能模块拆分）

| 优先级 | 功能说明 | URL（POST） | 对应文件 |
| --- | --- | --- | --- |
| **P0** | 筛选下拉选项 | `/api/user-growth/ad-performance/meta-filter-options` | 01 |
| **P0** | 页面概览数据（KPI/趋势/分布/预警/数据时间） | `/api/user-growth/ad-performance/overview` | 02 |
| **P0** | 主表格数据 - Campaign tab | `/api/user-growth/ad-performance/table/campaign` | 03-a |
| **P0** | 主表格数据 - Country tab | `/api/user-growth/ad-performance/table/country` | 03-b |
| **P0** | 主表格数据 - Owner tab | `/api/user-growth/ad-performance/table/owner` | 03-c |
| **P0** | 主表格数据 - Account tab | `/api/user-growth/ad-performance/table/account` | 03-d |
| **P0** | 广告系列详情（抽屉：广告组/日期/国家三维度） | `/api/user-growth/ad-performance/campaign-detail` | 04 |
| **P2** | 导出报表 | `/api/user-growth/ad-performance/export` | 05 |
| **P2** | 预警操作（暂停/查看/优化） | `/api/user-growth/ad-performance/alert-action` | 06 |

**优先级规则**：先获取数据为主（P0），后操作数据为辅助（P2）。

## 三、统一约定

- **筛选“全部”**：下拉筛选字段用空字符串 `''` 表示全部。
- **主表格 tab 切换**：主表格接口按 tab 拆分为 4 个 endpoint（03-a/03-b/03-c/03-d），不再通过 `tab` 参数在一个接口内复用。
- **日期范围**：当前 UI 为枚举 `dateRange`（today/yesterday/last7d/month），若后端最终使用真实日期区间，建议在实现中兼容并清晰约定（可扩展字段见 02/03）。
- **导出**：支持文件流或 `downloadUrl` 两种方案（见 05）。
- 若网关统一包裹为 `{ code, message, data }`，将各接口的出参放入 `data` 即可。

每个接口的字段详解与示例见对应编号的 JSON 文件（`fieldDescription`、`sampleRequest`、`sampleResponse`）。
