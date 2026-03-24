# 绩效配置 backend-api 契约清单

父级 API 路径：`/api/config-management/perf-config`

| 文件 | 接口 | 说明 | 优先级 |
|---|---|---|---|
| `01-perf-config-table.json` | `POST /table` | 绩效配置分页列表 | P0 |
| `02-perf-config-create.json` | `POST /` | 新建绩效配置 | P0 |
| `03-perf-config-update.json` | `PUT /:id` | 编辑绩效配置 | P0 |
| `04-perf-config-publish.json` | `POST /:id/publish` | 发布草稿版本 | P0 |
| `05-perf-config-archive.json` | `POST /:id/archive` | 归档版本 | P1 |
| `06-perf-config-activate.json` | `POST /:id/activate` | 激活版本 | P1 |
| `07-perf-config-export.json` | `POST /export` | 导出配置列表 | P1 |
