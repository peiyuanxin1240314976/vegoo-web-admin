/**
 * 汇率管理（`/config-management/exchange-rate-management`）按能力的数据源开关。
 *
 * - **`true`**：`config-management.ts` 走 `mock/exchange-rate-api-mock.ts`。
 * - **`false`**：真实网关。页面一律 `@/api/config-management`。
 *
 * 实现参考：`../mock/data.ts`、`index.vue`。
 */

type UseMock = boolean

/** 与契约文件、`fetch*` 一一对应，避免散落字符串 key */
export enum ExchangeRateEndpoint {
  RateTable = 'rateTable',
  OverviewKpi = 'overviewKpi',
  TrendSeries = 'trendSeries',
  SyncConfigDetail = 'syncConfigDetail',
  ManualCreate = 'manualCreate',
  SyncRates = 'syncRates',
  SaveSyncConfig = 'saveSyncConfig',
  RateOverride = 'rateOverride',
  ExportRates = 'exportRates'
}

export const ExchangeRateApiSource: Record<ExchangeRateEndpoint, UseMock> = {
  [ExchangeRateEndpoint.RateTable]: true,
  [ExchangeRateEndpoint.OverviewKpi]: true,
  [ExchangeRateEndpoint.TrendSeries]: true,
  [ExchangeRateEndpoint.SyncConfigDetail]: true,
  [ExchangeRateEndpoint.ManualCreate]: true,
  [ExchangeRateEndpoint.SyncRates]: true,
  [ExchangeRateEndpoint.SaveSyncConfig]: true,
  [ExchangeRateEndpoint.RateOverride]: true,
  [ExchangeRateEndpoint.ExportRates]: true
}

/** 读取方：`src/api/config-management.ts` 汇率段（`ExchangeRateApiSource` 可继续作说明/导出默认值） */
export function isExchangeRateEndpointMock(endpoint: ExchangeRateEndpoint): boolean {
  return ExchangeRateApiSource[endpoint]
}
