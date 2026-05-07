# 成本系数管理 backend-api 契约清单

父级 API 路径：`/api/config-management/cost-coefficient`

| 文件                                    | 接口                 | 说明             | 优先级 |
| --------------------------------------- | -------------------- | ---------------- | ------ |
| `01-cost-coefficient-table.json`        | `POST /table`        | 成本系数分页列表 | P0     |
| `02-cost-coefficient-create.json`       | `POST /`             | 新增成本系数     | P0     |
| `03-cost-coefficient-update.json`       | `PUT /:id`           | 编辑成本系数     | P0     |
| `04-cost-coefficient-delete.json`       | `DELETE /:id`        | 删除成本系数     | P0     |
| `05-cost-coefficient-history.json`      | `POST /history`      | 查询修改历史     | P1     |
| `06-cost-coefficient-overview-kpi.json` | `POST /overview/kpi` | KPI 概览         | P0     |

## 场景 → 接口（`/config-management/cost-coefficient`）

| 场景     | 契约文件                                | `src/api`                             |
| -------- | --------------------------------------- | ------------------------------------- |
| 列表     | `01-cost-coefficient-table.json`        | `fetchCostCoefficientTable`           |
| 新建     | `02-cost-coefficient-create.json`       | `createCostCoefficient`               |
| 编辑     | `03-cost-coefficient-update.json`       | `updateCostCoefficient`（**PUT**）    |
| 删除     | `04-cost-coefficient-delete.json`       | `deleteCostCoefficient`（**DELETE**） |
| 调整历史 | `05-cost-coefficient-history.json`      | `fetchCostCoefficientHistory`         |
| KPI 概览 | `06-cost-coefficient-overview-kpi.json` | `fetchCostCoefficientOverviewKpi`     |

## HTTP 迁移（可选）

- 与 `src/api` 一致：**PUT/DELETE**；长期可改为 **POST** `/update`、`/delete` + body。

开关：[`../../config/data-source.ts`](../../config/data-source.ts) → `CostCoefficientApiSource`。
