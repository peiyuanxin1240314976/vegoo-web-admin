# 国家管理 backend-api 契约清单

父级 API 路径：`/api/config-management/country`

| 文件 | 接口 | 说明 | 优先级 |
|---|---|---|---|
| `01-country-table.json` | `POST /table` | 国家分页列表查询 | P0 |
| `02-country-create.json` | `POST /` | 新增国家 | P0 |
| `03-country-update.json` | `PUT /:code` | 编辑国家 | P0 |
| `04-country-delete.json` | `DELETE /:code` | 删除国家 | P0 |
| `05-country-export.json` | `POST /export` | 导出国家列表 | P1 |
| `06-country-import.json` | `POST /import` | 批量导入国家 | P0 |

说明：

- 契约字段与 `types.ts` 中 `CountryItem` / `CountryFormModel` / `CountryTableQuery` 对齐。
- `code`（ISO alpha-2）为国家唯一主键，新增时需校验唯一性，更新时主键不可变更。
- 导入接口支持“同 code 覆盖更新”策略，便于运营批量维护。
