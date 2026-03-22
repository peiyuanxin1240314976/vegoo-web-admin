/**
 * 转化管理 - 转化数据（Data Tab）Mock 数据
 * 返回：顶部 KPI、三层树表、右侧面板（类型占比/Top10/30天趋势/账户占比）
 */

import type {
  ConversionAccountShareItem,
  ConversionDataFilterParams,
  ConversionDataResponse,
  ConversionDataRow,
  ConversionKpi,
  ConversionTop10Item,
  ConversionTypeDistributionItem,
  ConversionValueTrendPoint,
  PlatformConversionType
} from '../types'
import { getAppNow, cloneAppDate } from '@/utils/app-now'

const CONVERSION_TYPES: PlatformConversionType[] = [
  'PHONE_CALL_LEAD',
  'DOWNLOAD',
  'PURCHASE',
  'ADD_TO_CART',
  'PAGE_VIEW',
  'BEGIN_CHECKOUT'
]

const ACCOUNT_GROUPS = [
  {
    name: 'ACCOUNT GROUP 1',
    accounts: ['PT_262__bgeoo_0903_b', 'PT_262__ww_0917_t', 'PT_262__l7geo_0929_h2']
  },
  { name: 'ACCOUNT GROUP 2', accounts: ['PT_262__2', 'PT_262__3'] }
]

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function round(n: number, digits = 2) {
  const p = 10 ** digits
  return Math.round(n * p) / p
}

function formatDateYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildDateRange(end: Date, days: number) {
  const list: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = cloneAppDate(end)
    d.setDate(d.getDate() - i)
    list.push(formatDateYmd(d))
  }
  return list
}

function pseudoRand(seed: number) {
  let t = seed % 2147483647
  if (t <= 0) t += 2147483646
  return () => {
    t = (t * 16807) % 2147483647
    return (t - 1) / 2147483646
  }
}

function seedFromParams(params: ConversionDataFilterParams) {
  const str = JSON.stringify(params ?? {})
  let seed = 0
  for (let i = 0; i < str.length; i++) seed = (seed * 31 + str.charCodeAt(i)) >>> 0
  return seed || 20260317
}

function buildKpi(seed: number): ConversionKpi {
  const r = pseudoRand(seed)
  const conversionCount = Math.floor(220_000 + r() * 120_000)
  const conversionValue = Math.floor(1_000_000 + r() * 900_000)
  const averageValue = round(conversionValue / Math.max(1, conversionCount), 2)
  const activeTypeCount = Math.floor(6 + r() * 4)

  const delta = () => round((r() * 40 - 20) / 1, 1)
  return {
    conversionCount: { value: conversionCount, deltaPercent: delta() },
    conversionValue: { value: conversionValue, deltaPercent: delta() },
    averageValue: { value: averageValue, deltaPercent: -5.2 },
    activeTypeCount: { value: activeTypeCount, deltaPercent: delta() }
  }
}

function buildTypeDistribution(seed: number): ConversionTypeDistributionItem[] {
  const r = pseudoRand(seed + 11)
  const base = [44, 11, 11, 11, 17, 6].map((v) => v + (r() * 6 - 3))
  const sum = base.reduce((a, b) => a + b, 0)
  const normalized = base.map((v) => Math.max(1, v / sum))
  const sum2 = normalized.reduce((a, b) => a + b, 0)

  return CONVERSION_TYPES.map((t, i) => {
    const pct = (normalized[i] / sum2) * 100
    const count = Math.round(pct * 2000 * (0.8 + r() * 0.4))
    return { name: String(t), value: Math.round(pct), count }
  })
}

function buildTop10(seed: number): ConversionTop10Item[] {
  const r = pseudoRand(seed + 23)
  const names = [
    'ad_impression_revenue',
    'session_start',
    'first_open',
    'Android installs',
    'add_to_cart',
    'begin_checkout',
    'view_item',
    'in-app_purchase',
    'purchase',
    'PHONE_CALL_LEAD'
  ]

  const list: ConversionTop10Item[] = names.map((name, idx) => ({
    name,
    value: Math.floor((22_000 - idx * 1800) * (0.85 + r() * 0.35))
  }))
  return list.sort((a, b) => b.value - a.value)
}

function buildValueTrend30d(seed: number): ConversionValueTrendPoint[] {
  const r = pseudoRand(seed + 37)
  const end = getAppNow()
  const dates = buildDateRange(end, 30)
  let v = 820 + r() * 120
  return dates.map((date, idx) => {
    v += r() * 60 - 30 + Math.sin(idx / 4) * 14
    v = clamp(v, 520, 1200)
    return { date, value: Math.round(v) }
  })
}

function buildAccountShare(seed: number): ConversionAccountShareItem[] {
  const r = pseudoRand(seed + 41)
  const accounts = ACCOUNT_GROUPS.flatMap((g) => g.accounts).slice(0, 6)

  return accounts.map((accountName) => {
    const raw = CONVERSION_TYPES.map(() => 8 + r() * 30)
    const sum = raw.reduce((a, b) => a + b, 0)
    let segments = raw.map((v, i) => ({
      type: String(CONVERSION_TYPES[i]),
      percent: round((v / sum) * 100, 1)
    }))
    const diff = round(100 - segments.reduce((a, b) => a + b.percent, 0), 1)
    segments = segments.map((s, idx) =>
      idx === 0 ? { ...s, percent: round(s.percent + diff, 1) } : s
    )
    return { accountName, segments }
  })
}

function buildTrendPoints(seed: number, count: number) {
  const r = pseudoRand(seed)
  let v = 30 + r() * 60
  const points: number[] = []
  for (let i = 0; i < count; i++) {
    v += r() * 14 - 7 + Math.sin(i / 3) * 3
    v = clamp(v, 8, 120)
    points.push(Math.round(v))
  }
  return points
}

function buildTableRows(seed: number): ConversionDataRow[] {
  const r = pseudoRand(seed + 101)
  const appPackages = ['com.locate.phone.track', 'com.example.shop', 'com.other.app']

  const groups: ConversionDataRow[] = []
  const trendLen = 14

  ACCOUNT_GROUPS.forEach((group, gi) => {
    const groupId = `g-${gi + 1}`
    const groupRow: ConversionDataRow = {
      id: groupId,
      level: 'group',
      accountGroupName: group.name,
      conversionCount: 0,
      conversionValue: 0,
      share: 0,
      trendPoints: buildTrendPoints(seed + gi, trendLen),
      children: []
    }

    group.accounts.forEach((accountName, ai) => {
      const accountId = `${groupId}-a-${ai + 1}`
      const accountRow: ConversionDataRow = {
        id: accountId,
        level: 'account',
        accountGroupName: group.name,
        accountName,
        conversionCount: 0,
        conversionValue: 0,
        share: 0,
        trendPoints: buildTrendPoints(seed + gi * 10 + ai, trendLen),
        children: []
      }

      const conversions = 4 + Math.floor(r() * 3)
      for (let ci = 0; ci < conversions; ci++) {
        const type = CONVERSION_TYPES[(gi + ai + ci) % CONVERSION_TYPES.length]
        const conversionCount = Math.floor(600 + r() * 40_000)
        const value = Math.floor(conversionCount * (1.2 + r() * 18))
        const convRow: ConversionDataRow = {
          id: `${accountId}-c-${ci + 1}`,
          level: 'conversion',
          accountGroupName: group.name,
          accountName,
          appPackage: appPackages[(gi + ai + ci) % appPackages.length],
          conversionName:
            ci === 0
              ? `${accountName} | ${type} | main`
              : `phonenumbertracker-${ai}${ci}-event-${type.toLowerCase()}`,
          platformConversionType: type,
          conversionCount,
          conversionValue: value,
          share: 0,
          trendPoints: buildTrendPoints(seed + gi * 100 + ai * 10 + ci, trendLen)
        }
        accountRow.conversionCount += convRow.conversionCount
        accountRow.conversionValue += convRow.conversionValue
        accountRow.children?.push(convRow)
      }

      groupRow.conversionCount += accountRow.conversionCount
      groupRow.conversionValue += accountRow.conversionValue
      groupRow.children?.push(accountRow)
    })

    groups.push(groupRow)
  })

  const totalCount = groups.reduce((a, b) => a + b.conversionCount, 0)
  const applyShare = (row: ConversionDataRow) => {
    row.share = totalCount ? round((row.conversionCount / totalCount) * 100, 1) : 0
    row.children?.forEach(applyShare)
  }
  groups.forEach(applyShare)
  return groups
}

export function fetchConversionDataMock(
  params: ConversionDataFilterParams
): Promise<ConversionDataResponse> {
  const seed = seedFromParams(params)

  const kpi = buildKpi(seed)
  const tableRows = buildTableRows(seed)
  const typeDistribution = buildTypeDistribution(seed)
  const top10 = buildTop10(seed)
  const valueTrend30d = buildValueTrend30d(seed)
  const accountShare = buildAccountShare(seed)

  return Promise.resolve({
    kpi,
    tableRows,
    sidePanels: { typeDistribution, top10, valueTrend30d, accountShare }
  })
}
