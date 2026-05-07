# 汇率管理 backend-api 契约清单

父级 API 路径：`/api/config-management/exchange-rate`

| 文件 | 接口 | 说明 | 优先级 |
| --- | --- | --- | --- |
| `01-exchange-rate-table.json` | `POST /table` | 汇率分页列表 | P0 |
| `02-exchange-rate-create.json` | `POST /` | 手动新增汇率 | P0 |
| `03-exchange-rate-sync.json` | `POST /sync` | 批量同步汇率 | P0 |
| `04-exchange-rate-sync-config.json` | `POST /sync-config` | 保存同步设置 | P0 |
| `05-exchange-rate-override.json` | `POST /override` | 覆盖自动同步状态更新 | P1 |
| `06-exchange-rate-export.json` | `POST /export` | 导出汇率列表 | P1 |
| `07-exchange-rate-overview-kpi.json` | `POST /overview/kpi` | 左列 KPI 概览 | P0 |
| `08-exchange-rate-trend.json` | `POST /trend` | 右列 30 天走势 | P0 |
| `09-exchange-rate-sync-config-detail.json` | `POST /sync-config/detail` | 右列同步设置读取 | P0 |
| `10-exchange-rate-sync-meta-options.json` | `POST /sync-meta-options` | 同步/手动弹窗元数据 | P0 |

## 场景 → 接口（`/config-management/exchange-rate-management`）

| 场景 | 契约文件 | `src/api` |
| --- | --- | --- |
| 列表首屏 / 筛选 | `01-exchange-rate-table.json` | `fetchExchangeRateTable` |
| 手动新增汇率 | `02-exchange-rate-create.json` | `createExchangeRate` |
| 触发同步 | `03-exchange-rate-sync.json` | `syncExchangeRates` |
| 保存同步配置 | `04-exchange-rate-sync-config.json` | `saveSyncConfig` |
| 覆盖自动同步开关 | `05-exchange-rate-override.json` | `updateExchangeRateOverride` |
| 导出 | `06-exchange-rate-export.json` | `exportExchangeRates` |
| KPI 概览 | `07-exchange-rate-overview-kpi.json` | `fetchExchangeRateOverviewKpi` |
| 30 天走势 | `08-exchange-rate-trend.json` | `fetchExchangeRateTrend` |
| 同步设置回填 | `09-exchange-rate-sync-config-detail.json` | `fetchExchangeRateSyncConfig` |
| 同步/手动弹窗元数据 | `10-exchange-rate-sync-meta-options.json` | `fetchExchangeRateSyncMetaOptions` |

开关：[`../../config/data-source.ts`](../../config/data-source.ts) → `ExchangeRateApiSource`（含 `rateOverride` 等，见文件内枚举说明）。
