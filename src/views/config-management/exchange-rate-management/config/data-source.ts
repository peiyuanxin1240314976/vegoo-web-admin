type UseMock = boolean

export const ExchangeRateApiSource: Record<string, UseMock> = {
  rateTable: true,
  syncConfig: true,
  manualCreate: true,
  syncRates: true,
  exportRates: true,
  saveSyncConfig: true
}
