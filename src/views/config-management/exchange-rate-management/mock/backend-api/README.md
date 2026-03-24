# 汇率管理 backend-api 契约清单

父级 API 路径：`/api/config-management/exchange-rate`

| 文件 | 接口 | 说明 | 优先级 |
|---|---|---|---|
| `01-exchange-rate-table.json` | `POST /table` | 汇率分页列表 | P0 |
| `02-exchange-rate-create.json` | `POST /` | 手动新增汇率 | P0 |
| `03-exchange-rate-sync.json` | `POST /sync` | 批量同步汇率 | P0 |
| `04-exchange-rate-sync-config.json` | `POST /sync-config` | 保存同步设置 | P0 |
| `05-exchange-rate-override.json` | `POST /override` | 覆盖自动同步状态更新 | P1 |
| `06-exchange-rate-export.json` | `POST /export` | 导出汇率列表 | P1 |
