# 国家管理 backend-api 契约清单

父级 API 路径：`/api/config-management/country`

| 文件 | 接口 | 说明 | 优先级 |
| --- | --- | --- | --- |
| `01-country-table.json` | `POST /table` | 国家分页列表查询 | P0 |
| `02-country-create.json` | `POST /` | 新增国家 | P0 |
| `03-country-update.json` | `PUT /:code` | 编辑国家 | P0 |
| `04-country-delete.json` | `DELETE /:code` | 删除国家 | P0 |
| `05-country-export.json` | `POST /export` | 导出国家列表 | P1 |
| `06-country-import.json` | `POST /import` | 批量导入国家 | P0 |
| `07-country-flag-icon-upload.json` | `POST /flag-icon/upload` | 国旗图标上传，返回 `url` | P1 |
| `08-country-meta-options.json` | `POST /meta-options` | 时区/地区/货币选项元数据 | P0 |
| `09-country-overview-kpi.json` | `POST /overview/kpi` | 顶栏 KPI 全量统计 | P0 |
| `10-country-region-distribution.json` | `POST /charts/region-distribution` | 地区分布图表数据 | P0 |
| `11-country-main-market-share.json` | `POST /charts/main-market-share` | 主要市场占比图表数据 | P0 |
| `12-country-detail.json` | `POST /detail` | 查看抽屉详情 | P1 |

说明：

- 契约字段与 `types.ts` 中 `CountryItem` / `CountryFormModel` / `CountryTableQuery` 对齐。
- `code`（ISO alpha-2）为国家唯一主键，新增时需校验唯一性，更新时主键不可变更。
- 导入接口支持“同 code 覆盖更新”策略，便于运营批量维护。

## 场景 → 接口（`/config-management/country-management`）

| 场景 | 契约文件 | `src/api` |
| --- | --- | --- |
| 列表首屏 / 筛选 / 分页 | `01-country-table.json` | `fetchCountryTable` |
| 新建国家 | `02-country-create.json` | `createCountry` |
| 编辑国家 | `03-country-update.json` | `updateCountry`（当前 **PUT**） |
| 删除国家 | `04-country-delete.json` | `deleteCountry`（当前 **DELETE**） |
| 导出 | `05-country-export.json` | `exportCountryList` |
| 批量导入 | `06-country-import.json` | `importCountryList` |
| 国旗图标上传 | `07-country-flag-icon-upload.json` | `uploadCountryFlagIcon` |
| 时区/地区/货币选项 | `08-country-meta-options.json` | `fetchCountryMetaOptions` |
| 顶栏 KPI（全量统计） | `09-country-overview-kpi.json` | `fetchCountryOverviewKpi` |
| 地区分布图表 | `10-country-region-distribution.json` | `fetchCountryRegionDistribution` |
| 主要市场占比图表 | `11-country-main-market-share.json` | `fetchCountryMainMarketShare` |
| 查看详情抽屉 | `12-country-detail.json` | `fetchCountryDetail` |

## HTTP 方法与后续统一

- 与 **`src/api/config-management.ts` 现状**一致：`updateCountry` 为 **PUT**，`deleteCountry` 为 **DELETE**。
- 项目规范倾向 **POST + JSON**；后续若后端统一迁移，应改为例如 `POST /country/update`、`POST /country/delete` 并同步修改 `src/api` 与各契约 `api.method`。

数据源开关：[`../../config/data-source.ts`](../../config/data-source.ts) 的 `CountryApiSource`（`true` = 页面侧 mock，语义见文件头）。
