# ad-edit — backend-api 契约

父级路径以前端 `src/views/user-growth/ad-performance/config/api-base.ts` 中 `AD_PERFORMANCE_AD_EDIT_BASE` 为准（默认在 `.../campaign-detail/ad-edit` 下）。

| 文件 | 说明 |
| --- | --- |
| `01-form.json` | 编辑页表单拉取：`POST .../form`，响应体对齐 `ad-edit/types.ts` 的 `AdEditFormData`。 |

数据源开关见 `../../../../config/data-source.ts` 中 `AD_PERFORMANCE_AD_EDIT_USE_MOCK`。
