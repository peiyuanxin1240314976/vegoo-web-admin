# 应用管理 · 接口清单

**父级路径**：`/api/config-management/application`

| 方法   | 路径      | 说明                          |
| ------ | --------- | ----------------------------- |
| POST   | `/table`  | 分页列表                      |
| POST   | `/`       | 新增                          |
| PUT    | `/:id`    | 更新                          |
| DELETE | `/:id`    | 删除                          |
| POST   | `/export` | 导出（可与前端 CSV 兜底并存） |

详细字段见各 `*.json` 契约文件。
