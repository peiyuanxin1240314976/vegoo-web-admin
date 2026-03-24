import type { ExchangeRateItem, SyncConfig } from '../types'

export const mockRateList: ExchangeRateItem[] = [
  {
    id: '1',
    pair: 'USD/EUR',
    baseCurrency: 'USD',
    quoteCurrency: 'EUR',
    currentRate: 0.9234,
    yesterdayRate: 0.9218,
    changePercent: 0.17,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: true,
    overrideAuto: false
  },
  {
    id: '2',
    pair: 'USD/GBP',
    baseCurrency: 'USD',
    quoteCurrency: 'GBP',
    currentRate: 0.7891,
    yesterdayRate: 0.7905,
    changePercent: -0.18,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '3',
    pair: 'USD/JPY',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    currentRate: 148.32,
    yesterdayRate: 147.95,
    changePercent: 0.25,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '4',
    pair: 'USD/CNY',
    baseCurrency: 'USD',
    quoteCurrency: 'CNY',
    currentRate: 7.1823,
    yesterdayRate: 7.1756,
    changePercent: 0.09,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '5',
    pair: 'USD/KRW',
    baseCurrency: 'USD',
    quoteCurrency: 'KRW',
    currentRate: 1324.5,
    yesterdayRate: 1321.2,
    changePercent: 0.25,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '6',
    pair: 'USD/AUD',
    baseCurrency: 'USD',
    quoteCurrency: 'AUD',
    currentRate: 1.5234,
    yesterdayRate: 1.5289,
    changePercent: -0.36,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '7',
    pair: 'USD/BRL',
    baseCurrency: 'USD',
    quoteCurrency: 'BRL',
    currentRate: 4.9823,
    yesterdayRate: 4.9756,
    changePercent: 0.13,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '8',
    pair: 'USD/CAD',
    baseCurrency: 'USD',
    quoteCurrency: 'CAD',
    currentRate: 1.3456,
    yesterdayRate: 1.3478,
    changePercent: -0.16,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '9',
    pair: 'USD/SGD',
    baseCurrency: 'USD',
    quoteCurrency: 'SGD',
    currentRate: 1.3412,
    yesterdayRate: 1.3398,
    changePercent: 0.1,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '10',
    pair: 'USD/THB',
    baseCurrency: 'USD',
    quoteCurrency: 'THB',
    currentRate: 35.42,
    yesterdayRate: 36.05,
    changePercent: -1.75,
    lastUpdated: '10:32',
    dataSource: 'manual',
    isEnabled: true,
    isPinned: false,
    overrideAuto: true
  },
  {
    id: '11',
    pair: 'USD/MYR',
    baseCurrency: 'USD',
    quoteCurrency: 'MYR',
    currentRate: 4.7123,
    yesterdayRate: 4.7056,
    changePercent: 0.14,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  },
  {
    id: '12',
    pair: 'USD/IDR',
    baseCurrency: 'USD',
    quoteCurrency: 'IDR',
    currentRate: 15732,
    yesterdayRate: 15680,
    changePercent: 0.33,
    lastUpdated: '10:32',
    dataSource: 'auto',
    isEnabled: true,
    isPinned: false,
    overrideAuto: false
  }
]

export const mockSyncConfig: SyncConfig = {
  frequency: 'hourly',
  alertThreshold: 2,
  primarySource: 'openexchange',
  backupSourceEnabled: true
}

// 30天走势数据（USD/EUR）
export const mockTrendData = Array.from({ length: 30 }, (_, i) => {
  const base = 0.92
  const noise = (Math.sin(i * 0.4) * 0.012 + Math.random() * 0.006 - 0.003)
  return parseFloat((base + noise).toFixed(4))
})

export const ALL_CURRENCY_PAIRS = [
  'USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/CNY',
  'USD/KRW', 'USD/AUD', 'USD/CAD', 'USD/SGD',
  'USD/THB', 'USD/MYR', 'USD/BRL', 'USD/IDR'
]

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW',
  'AUD', 'CAD', 'SGD', 'THB', 'MYR', 'BRL', 'IDR', 'HKD', 'INR'
]

export function cloneRateList(): ExchangeRateItem[] {
  return mockRateList.map((r) => ({ ...r }))
}
