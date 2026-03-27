# 绩效配置 backend-api 契约清单

父级 API 路径：`/api/config-management/perf-config`

| 文件                           | 接口                 | 说明             | 优先级 |
| ------------------------------ | -------------------- | ---------------- | ------ |
| `01-perf-config-table.json`    | `POST /table`        | 绩效配置分页列表 | P0     |
| `02-perf-config-create.json`   | `POST /`             | 新建绩效配置     | P0     |
| `03-perf-config-activate.json` | `POST /:id/activate` | 激活版本         | P1     |
| `04-perf-config-export.json`   | `POST /export`       | 导出配置列表     | P1     |

## 场景 → 接口（`/config-management/perf-config`）

| 场景 | 契约文件 | `src/api` |
| --- | --- | --- |
| 列表（分页见契约：推荐 `records/total/current/size`） | `01-perf-config-table.json` | `fetchPerfTable` |
| 新建向导提交 | `02-perf-config-create.json` | `createPerfConfig` |
| 激活版本 | `03-perf-config-activate.json` | `activatePerfConfig` |
| 导出 | `04-perf-config-export.json` | `exportPerfConfig` |

## 分页说明

- `fetchPerfTable` 泛型为 `Api.Common.PaginatedResponse`，字段为 **`records` / `current` / `size` / `total`**；请求体为 **`page` / `pageSize`**。网关若返回 `list`，需在网关或前端适配层映射。

开关：[`../../config/data-source.ts`](../../config/data-source.ts) → `PerfConfigApiSource` / `PerfConfigEndpoint`（`true` = 跳过远程，见文件头 JSDoc）。
