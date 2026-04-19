/**
 * 利润分析 - Mock 数据
 * 与 types.ts、backend-api 契约一致，供 BusinessInsight.vue 使用；接口就绪后可切换为真实请求
 */
import type {
  ProfitKpiCard,
  ProfitAppRow,
  ProfitAppTotal,
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

export const MOCK_APP_ROWS: ProfitAppRow[] = [
  {
    app: 'Weather5',
    adRev: '$45,200',
    paidRev: '$12,100',
    total: '$57,300',
    adSpend: '$38,500',
    profit: '+$18,800',
    profitColor: '#4ade80',
    rate: '32.8%',
    rateColor: '#4ade80',
    profitTrend: [
      { date: '2026-02-06', profit: 3720 },
      { date: '2026-02-07', profit: 3910 },
      { date: '2026-02-08', profit: 4020 },
      { date: '2026-02-09', profit: 3580 },
      { date: '2026-02-10', profit: 3570 }
    ]
  },
  {
    app: 'PhoneTracker',
    adRev: '$28,600',
    paidRev: '$8,200',
    total: '$36,800',
    adSpend: '$22,400',
    profit: '+$14,400',
    profitColor: '#4ade80',
    rate: '39.1%',
    rateColor: '#4ade80',
    profitTrend: [
      { date: '2026-02-06', profit: 2650 },
      { date: '2026-02-07', profit: 2810 },
      { date: '2026-02-08', profit: 2940 },
      { date: '2026-02-09', profit: 3010 },
      { date: '2026-02-10', profit: 2990 }
    ]
  },
  {
    app: 'BloodSugar2',
    adRev: '$15,300',
    paidRev: '$4,800',
    total: '$20,100',
    adSpend: '$18,200',
    profit: '+$1,900',
    profitColor: '#facc15',
    rate: '9.5%',
    rateColor: '#facc15',
    profitTrend: [
      { date: '2026-02-06', profit: 460 },
      { date: '2026-02-07', profit: 710 },
      { date: '2026-02-08', profit: 890 },
      { date: '2026-02-09', profit: 640 },
      { date: '2026-02-10', profit: 640 }
    ]
  },
  {
    app: 'HealthTracker',
    adRev: '$9,100',
    paidRev: '$2,340',
    total: '$11,440',
    adSpend: '$10,140',
    profit: '-$700',
    profitColor: '#f87171',
    rate: '-6.1%',
    rateColor: '#f87171',
    profitTrend: [
      { date: '2026-02-06', profit: -120 },
      { date: '2026-02-07', profit: -80 },
      { date: '2026-02-08', profit: -200 },
      { date: '2026-02-09', profit: -640 },
      { date: '2026-02-10', profit: -700 }
    ]
  },
  {
    app: 'FaceMe',
    adRev: '$0',
    paidRev: '$0',
    total: '$0',
    adSpend: '$0',
    profit: '$0',
    profitColor: '#94a3b8',
    rate: 'N/A',
    rateColor: '#94a3b8',
    profitTrend: [
      { date: '2026-02-06', profit: 0 },
      { date: '2026-02-07', profit: 0 },
      { date: '2026-02-08', profit: 0 },
      { date: '2026-02-09', profit: 0 },
      { date: '2026-02-10', profit: 0 }
    ]
  }
]

export const MOCK_APP_TOTAL: ProfitAppTotal = {
  adRev: '$98,200',
  paidRev: '$27,440',
  total: '$125,640',
  adSpend: '$89,240',
  profit: '+$36,400',
  rate: '40.8%'
}

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
