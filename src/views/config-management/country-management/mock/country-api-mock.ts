/**
 * 国家管理 Mock，与 `mock/backend-api`、`Api.Common.PaginatedResponse` 一致。
 */
import { getAppNow } from '@/utils/app-now'
import type { CountryFormModel, CountryItem, CountryTableQuery } from '../types'
import { cloneCountryList } from './data'

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
    'code,nameCn,nameEn,timezone,phoneCode,code3,criteriaId,currency,currencySymbol,region,isMainMarket'
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
      createdBy: prev?.createdBy ?? 'admin',
      createdTime: prev?.createdTime ?? now,
      updatedBy: 'admin',
      updatedTime: now
    })
  }
  mockList = Array.from(storeMap.values())
  return Promise.resolve({})
}
