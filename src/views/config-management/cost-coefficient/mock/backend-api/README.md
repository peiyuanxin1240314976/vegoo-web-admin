# 成本系数管理 backend-api 契约清单

父级 API 路径：`/api/config-management/cost-coefficient`

| 文件 | 接口 | 说明 | 优先级 |
|---|---|---|---|
| `01-cost-coefficient-table.json` | `POST /table` | 成本系数分页列表 | P0 |
| `02-cost-coefficient-create.json` | `POST /` | 新增成本系数 | P0 |
| `03-cost-coefficient-update.json` | `PUT /:id` | 编辑成本系数 | P0 |
| `04-cost-coefficient-delete.json` | `DELETE /:id` | 删除成本系数 | P0 |
| `05-cost-coefficient-history.json` | `POST /history` | 查询修改历史 | P1 |
| `06-cost-coefficient-export.json` | `POST /export` | 导出列表 | P1 |
