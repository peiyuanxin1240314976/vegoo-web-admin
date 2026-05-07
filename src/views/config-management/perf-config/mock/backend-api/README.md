# 绩效配置 backend-api 契约清单

父级 API 路径：`/api/config-management/perf-config`

| 文件 | 接口 | 说明 | 优先级 |
| --- | --- | --- | --- |
| `01-perf-config-table.json` | `POST /table` | 绩效配置分页列表 | P0 |
| `02-perf-config-create.json` | `POST /` | 新建绩效配置 | P0 |
| `03-perf-config-activate.json` | `POST /:id/activate` | 激活版本 | P1 |
| `04-perf-config-export.json` | `POST /export` | 导出配置列表 | P1 |
| `05-perf-config-export-version-compare.json` | `POST /version-compare/export` | 版本对比结果导出（文件流） | P1 |
| `06-perf-config-overview-kpi.json` | `POST /overview/kpi` | 顶栏 KPI（与列表同筛、全量统计） | P0 |

## 场景 → 接口（`/config-management/perf-config`）

| 场景 | 契约文件 | `src/api` |
| --- | --- | --- |
| 顶栏 KPI（全量统计，勿用当前页推算） | `06-perf-config-overview-kpi.json` | `fetchPerfOverviewKpi` |
| 列表（分页见契约：推荐 `records/total/current/size`） | `01-perf-config-table.json` | `fetchPerfTable` |
| 新建向导提交 | `02-perf-config-create.json` | `createPerfConfig` |
| 激活版本 | `03-perf-config-activate.json` | `activatePerfConfig` |
| 导出 | `04-perf-config-export.json` | `exportPerfConfig` |
| 版本对比弹窗「导出对比」 | `05-perf-config-export-version-compare.json` | `exportPerfVersionCompare` |

## 分页说明

- `fetchPerfTable` 泛型为 `Api.Common.PaginatedResponse`，字段为 **`records` / `current` / `size` / `total`**；请求体为 **`page` / `pageSize`**。网关若返回 `list`，需在网关或前端适配层映射。

开关：[`../../config/data-source.ts`](../../config/data-source.ts) → `PerfConfigApiSource` / `PerfConfigEndpoint`（`true` = 跳过远程，见文件头 JSDoc）。

## 维度与 cockpit meta

新建向导 `step1` 及列表筛选中的 **应用 / 终端平台 / 广告平台** 取值与公用 **`GET .../cockpit/meta-filter-options`** 的 `appOptions` / `platformOptions` / `sourceOptions` 的 **`value`** 一致（请求字段 **`appId`**、**`platform`**、**`source`**）；**不在本目录** 重复 meta 契约，见付费分析 `mock/backend-api/README.md` 附录 A。
