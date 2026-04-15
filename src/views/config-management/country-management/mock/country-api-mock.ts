/**
 * 国家管理 Mock，与 `mock/backend-api`、`Api.Common.PaginatedResponse` 一致。
 */
import { getAppNow } from '@/utils/app-now'
import type {
  CountryFormModel,
  CountryItem,
  CountryMainMarketShareItem,
  CountryMetaOptionsResponse,
  CountryOverviewKpi,
  CountryRegionDistributionItem,
  CountryTableQuery
} from '../types'
import { cloneCountryList, currencyOptions, regionOptions, timezoneOptions } from './data'

let mockList: CountryItem[] = cloneCountryList()

function filterCountryList(
  sourceList: CountryItem[],
  params: { keyword: string; region: string; currency: string }
): CountryItem[] {
  return sourceList.filter((item) => {
    const kw = params.keyword.toLowerCase()
    if (kw) {
      const match =
        item.code.toLowerCase().includes(kw) ||
        item.nameCn.toLowerCase().includes(kw) ||
        item.nameEn.toLowerCase().includes(kw) ||
        item.aliases.some((a) => a.toLowerCase().includes(kw))
      if (!match) return false
    }
    if (params.region && item.region !== params.region) return false
    if (params.currency && item.currency !== params.currency) return false
    return true
  })
}

export function mockFetchCountryTable(
  params: CountryTableQuery
): Promise<Api.Common.PaginatedResponse<CountryItem>> {
  const filtered = filterCountryList(mockList, {
    keyword: (params.keyword ?? '').trim(),
    region: params.region ?? '',
    currency: params.currency ?? ''
  })
  const start = (params.page - 1) * params.pageSize
  const records = filtered.slice(start, start + params.pageSize).map((r) => ({ ...r }))
  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.page,
    size: params.pageSize
  })
}

export function mockFetchCountryDetail(params: { code: string }): Promise<CountryItem> {
  const hit = mockList.find((item) => item.code === params.code)
  if (!hit) return Promise.reject(new Error('国家不存在'))
  return Promise.resolve({ ...hit })
}

export function mockUploadCountryFlagIcon(file: File): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ url: String(reader.result ?? '') })
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

export function mockFetchCountryMetaOptions(): Promise<CountryMetaOptionsResponse> {
  return Promise.resolve({
    timezoneOptions: [...timezoneOptions],
    regionOptions: [...regionOptions],
    currencyOptions: [...currencyOptions]
  })
}

export function mockFetchCountryOverviewKpi(params: {
  keyword?: string
  region?: string
  currency?: string
}): Promise<CountryOverviewKpi> {
  const filtered = filterCountryList(mockList, {
    keyword: (params.keyword ?? '').trim(),
    region: params.region ?? '',
    currency: params.currency ?? ''
  })
  const uniqCurrencies = new Set(filtered.map((c) => c.currency).filter(Boolean))
  return Promise.resolve({
    total: filtered.length,
    currencies: uniqCurrencies.size,
    mainMarkets: filtered.filter((c) => c.isMainMarket).length,
    noCurrency: filtered.filter((c) => !c.currency).length
  })
}

export function mockFetchCountryRegionDistribution(params: {
  keyword?: string
  region?: string
  currency?: string
}): Promise<CountryRegionDistributionItem[]> {
  const filtered = filterCountryList(mockList, {
    keyword: (params.keyword ?? '').trim(),
    region: params.region ?? '',
    currency: params.currency ?? ''
  })
  const totalCount = filtered.length
  const regions = ['亚太', '欧洲', '北美', '其他']
  const result = regions.map((region) => {
    const count = filtered.filter((c) => c.region === region).length
    const percent = totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(2)) : 0
    return { region, count, percent }
  })
  return Promise.resolve(result)
}

export function mockFetchCountryMainMarketShare(params: {
  keyword?: string
  region?: string
  currency?: string
}): Promise<CountryMainMarketShareItem[]> {
  const filtered = filterCountryList(mockList, {
    keyword: (params.keyword ?? '').trim(),
    region: params.region ?? '',
    currency: params.currency ?? ''
  })
    .filter((c) => c.isMainMarket)
    .slice(0, 6)

  if (filtered.length === 0) return Promise.resolve([])

  const weights = filtered.map((_, idx) => filtered.length - idx)
  const totalWeight = weights.reduce((sum, n) => sum + n, 0)

  const result = filtered.map((item, idx) => ({
    countryCode: item.code,
    countryName: item.nameCn,
    sharePercent: Number(((weights[idx] / totalWeight) * 100).toFixed(2))
  }))
  return Promise.resolve(result)
}

export function mockCreateCountry(data: CountryFormModel): Promise<CountryItem> {
  const now = getAppNow().toISOString().slice(0, 19).replace('T', ' ')
  const exists = mockList.some((item) => item.code === data.code)
  const item: CountryItem = {
    ...data,
    createdBy: 'admin',
    createdTime: now,
    updatedBy: 'admin',
    updatedTime: now
  }
  if (exists) {
    mockList = mockList.map((row) => (row.code === data.code ? item : row))
  } else {
    mockList = [item, ...mockList]
  }
  return Promise.resolve({ ...item })
}

export function mockUpdateCountry(
  code: string,
  data: Partial<CountryFormModel>
): Promise<CountryItem> {
  const idx = mockList.findIndex((i) => i.code === code)
  if (idx < 0) {
    return Promise.reject(new Error('国家不存在'))
  }
  const prev = mockList[idx]
  const now = getAppNow().toISOString().slice(0, 19).replace('T', ' ')
  const next: CountryItem = {
    ...prev,
    ...data,
    flagIconUrl: data.flagIconUrl !== undefined ? data.flagIconUrl : prev.flagIconUrl,
    updatedBy: 'admin',
    updatedTime: now
  }
  mockList = mockList.slice()
  mockList[idx] = next
  return Promise.resolve({ ...next })
}

export function mockDeleteCountry(code: string): Promise<unknown> {
  mockList = mockList.filter((i) => i.code !== code)
  return Promise.resolve({})
}

export function mockExportCountryList(params: Partial<CountryTableQuery>): Promise<unknown> {
  const filtered = filterCountryList(mockList, {
    keyword: (params.keyword ?? '').trim(),
    region: params.region ?? '',
    currency: params.currency ?? ''
  })
  const header =
    'code,nameCn,nameEn,timezone,phoneCode,code3,criteriaId,flagIconUrl,currency,currencySymbol,region,isMainMarket'
  const lines = [header]
  for (const r of filtered) {
    lines.push(
      [
        r.code,
        r.nameCn,
        r.nameEn,
        r.timezone,
        r.phoneCode,
        r.code3,
        r.criteriaId,
        r.flagIconUrl ?? '',
        r.currency,
        r.currencySymbol,
        r.region,
        r.isMainMarket
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
  }
  const bom = '\uFEFF'
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `countries_${getAppNow().getTime()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  return Promise.resolve({ ok: true })
}

export function mockImportCountryList(data: { items: CountryFormModel[] }): Promise<unknown> {
  const now = getAppNow().toISOString().slice(0, 19).replace('T', ' ')
  const storeMap = new Map(mockList.map((item) => [item.code, item]))
  for (const item of data.items) {
    const prev = storeMap.get(item.code)
    storeMap.set(item.code, {
      ...item,
      flagIconUrl: item.flagIconUrl ?? '',
      createdBy: prev?.createdBy ?? 'admin',
      createdTime: prev?.createdTime ?? now,
      updatedBy: 'admin',
      updatedTime: now
    })
  }
  mockList = Array.from(storeMap.values())
  return Promise.resolve({})
}
