/**
 * 利润分析 - Mock 数据
 * 与 types.ts、backend-api 契约一致，供 BusinessInsight.vue 使用；接口就绪后可切换为真实请求
 */
import type {
  ProfitKpiCard,
  ProfitAppProfitTreeNode,
  ProfitCountryRow,
  ProfitMapDataItem,
  ProfitMapScatterItem,
  ProfitTrend30d,
  ProfitSankeyNode,
  ProfitSankeyLink,
  ProfitFilterMeta
} from '../types'

export const MOCK_FILTER_META: ProfitFilterMeta = {
  dateRange: '2026-03-01 ～ 2026-03-05',
  appLabel: '全部',
  countryLabel: '全部'
}

export const MOCK_KPI_CARDS: ProfitKpiCard[] = [
  {
    label: '预估利润',
    badge: '⚠ 预估值',
    badgeColor: '#f5a623',
    value: '+$36,440',
    valueColor: '#a855f7',
    sub: '广告收入+付费-广告支出',
    border: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    bg: 'rgba(124,58,237,0.12)'
  },
  {
    label: '总收入',
    value: '$125,680',
    valueColor: '#4ade80',
    sub: '广告$98,240 + 付费$27,440',
    border: 'linear-gradient(135deg,#16a34a,#4ade80)',
    bg: 'rgba(22,163,74,0.10)'
  },
  {
    label: '广告支出',
    value: '$89,240',
    valueColor: '#fb923c',
    sub: '自投$88,934 + 代投$306',
    border: 'linear-gradient(135deg,#c2410c,#fb923c)',
    bg: 'rgba(194,65,12,0.10)'
  },
  {
    label: '广告收益率',
    value: '40.8%',
    valueColor: '#38bdf8',
    sub: '(广告收入-广告支出)/广告支出',
    border: 'linear-gradient(135deg,#0369a1,#38bdf8)',
    bg: 'rgba(3,105,161,0.10)'
  },
  {
    label: '付费收入占比',
    value: '21.8%',
    valueColor: '#2dd4bf',
    sub: '付费$27,440/总$125,680',
    border: 'linear-gradient(135deg,#0d9488,#2dd4bf)',
    bg: 'rgba(13,148,136,0.10)'
  }
]

function makeTrend(len = 7, base = 2000, variance = 520) {
  const points: { date: string; profit: number }[] = []
  let v = base
  for (let i = 0; i < len; i++) {
    v += (Math.random() - 0.48) * variance
    points.push({ date: `D${String(i + 1).padStart(2, '0')}`, profit: Math.round(v) })
  }
  return points
}

function makeUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n)
}

function makePct(n: number) {
  return `${n.toFixed(2)}%`
}

function makeInt(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n))
}

function buildCountryChildren(count = 320): ProfitAppProfitTreeNode[] {
  const appsSeed = [
    'Weather5',
    'PhoneTracker',
    'BloodSugar2',
    'HealthTracker2',
    'CPUMonitor',
    'VideoDownloader'
  ]
  const countriesSeed = [
    { code: 'us', name: '美国' },
    { code: 'kr', name: '韩国' },
    { code: 'de', name: '德国' },
    { code: 'za', name: '南非' },
    { code: 'jp', name: '日本' },
    { code: 'gb', name: '英国' },
    { code: 'au', name: '澳大利亚' },
    { code: 'ca', name: '加拿大' },
    { code: 'fr', name: '法国' },
    { code: 'br', name: '巴西' }
  ]
  const rows: ProfitAppProfitTreeNode[] = []
  for (let i = 0; i < count; i++) {
    const seed = countriesSeed[i % countriesSeed.length]!
    const appName = appsSeed[i % appsSeed.length]!
    const idx = i + 1
    const adRevNum = 2000 + (count - i) * 37 + (i % 9) * 120
    const paidRevNum = 200 + (i % 11) * 38
    const adSpendNum = 1300 + (i % 13) * 52 + (idx % 7) * 90
    const totalNum = adRevNum + paidRevNum
    const profitNum = totalNum - adSpendNum
    const roi1d = adSpendNum > 0 ? (profitNum / adSpendNum) * 100 : 0
    const good = profitNum >= 0
    const avgDau = Math.max(120, Math.round(900 + (count - i) * 2.6 + (i % 17) * 13))
    const newUsers = Math.max(20, Math.round(80 + (count - i) * 0.65 + (i % 19) * 3))
    const paidUsers = Math.max(0, Math.round(newUsers * (0.28 + (i % 7) * 0.03)))
    const organicUsers = Math.max(0, newUsers - paidUsers)
    rows.push({
      id: `country-${seed.code}-${idx}`,
      name: seed.name,
      appName,
      countryCode: seed.code,
      adRev: makeUsd(adRevNum),
      paidRev: makeUsd(paidRevNum),
      adSpend: makeUsd(adSpendNum),
      profit: `${good ? '+' : '-'}${makeUsd(Math.abs(profitNum))}`,
      profitColor: good ? '#4ade80' : '#f87171',
      roi1d: makePct(roi1d),
      avgDau: makeInt(avgDau),
      newUsers: makeInt(newUsers),
      paidUsers: makeInt(paidUsers),
      organicUsers: makeInt(organicUsers),
      profitTrend: makeTrend(10, Math.max(200, profitNum / 4), 260)
    })
  }
  return rows
}

export const MOCK_APP_PROFIT_ROOT: ProfitAppProfitTreeNode = (() => {
  const children = buildCountryChildren(320)
  const sum = (k: keyof Pick<ProfitAppProfitTreeNode, 'adRev' | 'paidRev' | 'adSpend'>) => {
    const n = (s: string) => Number(String(s).replace(/[^\d.-]/g, '')) || 0
    return children.reduce((acc, r) => acc + n(r[k]), 0)
  }
  const total = sum('adRev') + sum('paidRev')
  const adSpend = sum('adSpend')
  const profit = total - adSpend
  const good = profit >= 0
  const avgDau = children.reduce(
    (acc, r) => acc + (Number(r.avgDau.replace(/[^\d.-]/g, '')) || 0),
    0
  )
  const newUsers = children.reduce(
    (acc, r) => acc + (Number(r.newUsers.replace(/[^\d.-]/g, '')) || 0),
    0
  )
  const paidUsers = children.reduce(
    (acc, r) => acc + (Number(r.paidUsers.replace(/[^\d.-]/g, '')) || 0),
    0
  )
  const organicUsers = children.reduce(
    (acc, r) => acc + (Number(r.organicUsers.replace(/[^\d.-]/g, '')) || 0),
    0
  )
  const roi1d = adSpend > 0 ? (profit / adSpend) * 100 : 0
  return {
    id: 'root',
    name: '全部应用、全部国家',
    appName: '全部应用',
    adRev: makeUsd(sum('adRev')),
    paidRev: makeUsd(sum('paidRev')),
    adSpend: makeUsd(adSpend),
    profit: `${good ? '+' : '-'}${makeUsd(Math.abs(profit))}`,
    profitColor: good ? '#4ade80' : '#f87171',
    roi1d: makePct(roi1d),
    avgDau: makeInt(avgDau / children.length),
    newUsers: makeInt(newUsers),
    paidUsers: makeInt(paidUsers),
    organicUsers: makeInt(organicUsers),
    profitTrend: makeTrend(10, profit / 10, 520),
    children
  }
})()

export const MOCK_COUNTRY_ROWS: ProfitCountryRow[] = [
  {
    s_country_code: 'US',
    name: '美国',
    adRev: '$52,000',
    paidRev: '$14,200',
    adSpend: '$38,500',
    profit: '+$27,700',
    profitColor: '#4ade80',
    rate: '53.3%',
    rateColor: '#4ade80'
  },
  {
    s_country_code: 'KR',
    name: '韩国',
    adRev: '$11,200',
    paidRev: '$3,100',
    adSpend: '$8,400',
    profit: '+$5,900',
    profitColor: '#4ade80',
    rate: '52.7%',
    rateColor: '#4ade80'
  },
  {
    s_country_code: 'DE',
    name: '德国',
    adRev: '$7,800',
    paidRev: '$2,200',
    adSpend: '$6,100',
    profit: '+$3,900',
    profitColor: '#4ade80',
    rate: '50.0%',
    rateColor: '#4ade80'
  },
  {
    s_country_code: 'ZA',
    name: '南非',
    adRev: '$9,600',
    paidRev: '$1,200',
    adSpend: '$8,200',
    profit: '+$2,600',
    profitColor: '#4ade80',
    rate: '27.1%',
    rateColor: '#4ade80'
  }
]

export const MOCK_MAP_DATA: ProfitMapDataItem[] = [
  { name: 'United States', value: 27700 },
  { name: 'South Korea', value: 5900 },
  { name: 'Germany', value: 3900 },
  { name: 'South Africa', value: 2600 },
  { name: 'Japan', value: 2100 },
  { name: 'United Kingdom', value: 1800 },
  { name: 'Australia', value: 1500 },
  { name: 'Canada', value: 1200 },
  { name: 'France', value: 900 },
  { name: 'Brazil', value: 600 }
]

export const MOCK_MAP_SCATTER: ProfitMapScatterItem[] = [
  { name: '美国 +$18,200', value: [-95, 38, 18200] },
  { name: '韩国 +$4,800', value: [127, 37, 4800] },
  { name: '德国 +$3,200', value: [10, 51, 3200] },
  { name: '南非 +$2,100', value: [25, -29, 2100] }
]

function generateTrendData(base: number, variance: number, len = 30): number[] {
  const data: number[] = []
  let v = base
  for (let i = 0; i < len; i++) {
    v += (Math.random() - 0.48) * variance
    v = Math.max(base * 0.4, v)
    data.push(Math.round(v))
  }
  return data
}

/** 固定种子便于重现；实际接口返回真实序列 */
export function getMockTrend30d(): ProfitTrend30d {
  const revenue = generateTrendData(4000, 600, 30)
  const adSpend = generateTrendData(2800, 400, 30)
  const profit = revenue.map((r, i) => Math.round(r - adSpend[i]))
  const days = Array.from({ length: 30 }, (_, i) => `${String(i + 1).padStart(2, '0')}天`)
  return { days, revenue, adSpend, profit }
}

export const MOCK_TREND_30D: ProfitTrend30d = (() => {
  const revenue = [
    3842, 4120, 3980, 4210, 4050, 4180, 4320, 4080, 4250, 4380, 4150, 4280, 4420, 4180, 4350, 4480,
    4220, 4380, 4520, 4260, 4320, 4450, 4300, 4420, 4560, 4340, 4480, 4620, 4380, 4520
  ]
  const adSpend = [
    2720, 2880, 2780, 2920, 2820, 2860, 2980, 2760, 2900, 3020, 2800, 2940, 3060, 2780, 2920, 3080,
    2840, 2960, 3100, 2860, 2900, 3000, 2880, 2980, 3120, 2900, 3020, 3160, 2920, 3040
  ]
  const profit = revenue.map((r, i) => r - adSpend[i])
  const days = Array.from({ length: 30 }, (_, i) => `${String(i + 1).padStart(2, '0')}天`)
  return { days, revenue, adSpend, profit }
})()

export const MOCK_SANKEY_NODES: ProfitSankeyNode[] = [
  { name: '广告收入(IAA)\n$98,240', itemStyle: { color: '#38bdf8' } },
  { name: '付费收入(IAP)\n$27,440', itemStyle: { color: '#2dd4bf' } },
  { name: '总收入\n$125,680', itemStyle: { color: '#818cf8' } },
  { name: '广告支出\n$89,240', itemStyle: { color: '#fb923c' } },
  { name: '预估利润\n$36,440', itemStyle: { color: '#a855f7' } }
]

export const MOCK_SANKEY_LINKS: ProfitSankeyLink[] = [
  { source: '广告收入(IAA)\n$98,240', target: '总收入\n$125,680', value: 98240 },
  { source: '付费收入(IAP)\n$27,440', target: '总收入\n$125,680', value: 27440 },
  { source: '总收入\n$125,680', target: '广告支出\n$89,240', value: 89240 },
  { source: '总收入\n$125,680', target: '预估利润\n$36,440', value: 36440 }
]
