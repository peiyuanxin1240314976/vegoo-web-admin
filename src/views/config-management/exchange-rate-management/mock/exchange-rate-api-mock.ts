/**
 * 汇率管理 Mock，与契约及 `Api.Common.PaginatedResponse` 一致。
 */
import { getAppNow } from '@/utils/app-now'
import type {
  ExchangeRateItem,
  ExchangeRateOverviewKpi,
  ExchangeRateQuery,
  ExchangeRateTrendPoint,
  ManualRateFormModel,
  SyncConfig
} from '../types'
import { cloneRateList, mockSyncConfig, mockTrendData } from './data'

let mockList: ExchangeRateItem[] = cloneRateList()
let mockSyncStore: SyncConfig = { ...mockSyncConfig }

function filterByQuery(list: ExchangeRateItem[], params: ExchangeRateQuery): ExchangeRateItem[] {
  let rows = [...list]
  rows.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
  if (params.pair) {
    rows = rows.filter((r) => r.pair === params.pair)
  }
  if (params.date) {
    rows = rows.filter((r) => !r.effectiveDate || r.effectiveDate === params.date)
  }
  return rows
}

export function mockFetchExchangeRateTable(
  params: ExchangeRateQuery
): Promise<Api.Common.PaginatedResponse<ExchangeRateItem>> {
  const filtered = filterByQuery(mockList, params)
  const start = (params.page - 1) * params.pageSize
  const records = filtered.slice(start, start + params.pageSize).map((r) => ({ ...r }))
  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.page,
    size: params.pageSize
  })
}

export function mockFetchExchangeRateOverviewKpi(
  params: Partial<ExchangeRateQuery> & { alertThreshold?: number }
): Promise<ExchangeRateOverviewKpi> {
  const filtered = filterByQuery(mockList, {
    pair: params.pair,
    date: params.date,
    page: 1,
    pageSize: 100000
  })
  const threshold = params.alertThreshold ?? mockSyncStore.alertThreshold
  return Promise.resolve({
    total: filtered.length,
    abnormal: filtered.filter((row) => Math.abs(row.changePercent) > threshold).length,
    lastSyncTime: getAppNow().toISOString().slice(0, 19).replace('T', ' '),
    dataSourceLabel: 'Open Exchange'
  })
}

export function mockFetchExchangeRateTrend(params: {
  pair: string
  date?: string
}): Promise<ExchangeRateTrendPoint[]> {
  const seed = params.pair.charCodeAt(0) % 7
  const points = mockTrendData.map((rate, idx) => {
    const d = new Date(getAppNow())
    d.setDate(d.getDate() - (mockTrendData.length - 1 - idx))
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`,
      rate: Number((rate + seed * 0.001).toFixed(4))
    }
  })
  return Promise.resolve(points)
}

export function mockFetchExchangeRateSyncConfig(): Promise<SyncConfig> {
  return Promise.resolve({ ...mockSyncStore })
}

export function mockCreateExchangeRate(data: ManualRateFormModel): Promise<ExchangeRateItem> {
  const pair = `${data.baseCurrency}/${data.quoteCurrency}`
  const time = getAppNow().toTimeString().slice(0, 5)
  const existingIdx = mockList.findIndex((r) => r.pair === pair)
  if (existingIdx >= 0) {
    const prev = mockList[existingIdx]
    const next: ExchangeRateItem = {
      ...prev,
      currentRate: data.rate,
      dataSource: 'manual',
      overrideAuto: data.overrideAuto,
      remark: data.remark,
      lastUpdated: time,
      effectiveDate: data.effectiveDate,
      effectiveTime: data.effectiveTime
    }
    mockList = mockList.slice()
    mockList[existingIdx] = next
    return Promise.resolve({ ...next })
  }
  const item: ExchangeRateItem = {
    id: `er-${getAppNow().getTime()}`,
    pair,
    baseCurrency: data.baseCurrency,
    quoteCurrency: data.quoteCurrency,
    currentRate: data.rate,
    yesterdayRate: data.rate,
    changePercent: 0,
    lastUpdated: time,
    dataSource: 'manual',
    isEnabled: true,
    isPinned: false,
    overrideAuto: data.overrideAuto,
    remark: data.remark,
    effectiveDate: data.effectiveDate,
    effectiveTime: data.effectiveTime
  }
  mockList = [item, ...mockList]
  return Promise.resolve({ ...item })
}

export function mockSyncExchangeRates(pairs: string[], source: string): Promise<unknown> {
  void pairs
  void source
  const jitter = () => Math.random() * 0.002 - 0.001
  mockList = mockList.map((r) =>
    r.dataSource === 'auto' && !r.overrideAuto
      ? {
          ...r,
          currentRate: parseFloat((r.currentRate * (1 + jitter())).toFixed(4)),
          lastUpdated: getAppNow().toTimeString().slice(0, 5)
        }
      : { ...r }
  )
  return Promise.resolve({ ok: true })
}

export function mockSaveSyncConfig(data: SyncConfig): Promise<unknown> {
  mockSyncStore = { ...data }
  return Promise.resolve({ ...mockSyncStore })
}

export function mockUpdateExchangeRateOverride(
  id: string,
  overrideAuto: boolean
): Promise<unknown> {
  const idx = mockList.findIndex((r) => r.id === id)
  if (idx < 0) return Promise.reject(new Error('记录不存在'))
  mockList = mockList.slice()
  mockList[idx] = { ...mockList[idx], overrideAuto }
  return Promise.resolve({})
}

export function mockExportExchangeRates(
  params: Partial<ExchangeRateQuery>
): Promise<{ blob: Blob; fileName: string }> {
  const filtered = filterByQuery(mockList, {
    pair: params.pair,
    date: params.date,
    page: 1,
    pageSize: 100000
  })
  const header = 'pair,currentRate,yesterdayRate,changePercent,lastUpdated,dataSource'
  const lines = [header]
  for (const r of filtered) {
    lines.push(
      [r.pair, r.currentRate, r.yesterdayRate, r.changePercent, r.lastUpdated, r.dataSource]
        .map((v) => `"${String(v ?? '')}"`)
        .join(',')
    )
  }
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  return Promise.resolve({
    blob,
    fileName: `exchange_rates_${getAppNow().getTime()}.csv`
  })
}
