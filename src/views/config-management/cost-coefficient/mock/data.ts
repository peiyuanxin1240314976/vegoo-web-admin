import type { AdPlatform, CostCoefficientItem, CostCoefficientHistory } from '../types'

export const AD_PLATFORMS: AdPlatform[] = [
  { nSource: 1, name: 'Google Ads', abbr: 'G', color: '#4285f4' },
  { nSource: 2, name: 'Facebook Ads', abbr: 'F', color: '#1877f2' },
  { nSource: 3, name: 'Unity Ads', abbr: 'U', color: '#222c37' },
  { nSource: 5, name: 'IronSource', abbr: 'IS', color: '#e74c3c' },
  { nSource: 7, name: 'Mintegral', abbr: 'M', color: '#7c4dff' },
  { nSource: 9, name: 'Applovin', abbr: 'A', color: '#e8335a' },
  { nSource: 11, name: 'TikTok Ads', abbr: 'T', color: '#010101' },
  { nSource: 13, name: 'Vungle', abbr: 'V', color: '#ff6b35' }
]

export function getPlatform(nSource: number): AdPlatform {
  return (
    AD_PLATFORMS.find((p) => p.nSource === nSource) ?? {
      nSource,
      name: `Platform(${nSource})`,
      abbr: String(nSource),
      color: '#475569'
    }
  )
}

const mockItems: CostCoefficientItem[] = [
  {
    id: '1',
    nSource: 1,
    platformName: 'Google Ads',
    tstart: '2000-01-01',
    dcostRatio: 1.0,
    dinstallCost: 0.001,
    updatedAt: '2024-01-15 10:23',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  },
  {
    id: '2',
    nSource: 2,
    platformName: 'Facebook Ads',
    tstart: '2000-01-01',
    dcostRatio: 0.93,
    dinstallCost: 0.002,
    updatedAt: '2024-01-15 10:23',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  },
  {
    id: '3',
    nSource: 2,
    platformName: 'Facebook Ads',
    tstart: '2026-01-01',
    dcostRatio: 1.0,
    dinstallCost: 0.002,
    updatedAt: '2024-03-01 09:15',
    updatedBy: 'operator',
    remark: '2026年起新系数',
    isDeleted: false
  },
  {
    id: '4',
    nSource: 3,
    platformName: 'Unity Ads',
    tstart: '2000-01-01',
    dcostRatio: 1.0,
    dinstallCost: 0.002,
    updatedAt: '2024-01-15 10:23',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  },
  {
    id: '5',
    nSource: 9,
    platformName: 'Applovin',
    tstart: '2025-07-01',
    dcostRatio: 1.02,
    dinstallCost: 0.002,
    updatedAt: '2024-06-20 14:30',
    updatedBy: 'manager',
    remark: '2025年Q3起调整系数',
    isDeleted: false
  },
  {
    id: '6',
    nSource: 9,
    platformName: 'Applovin',
    tstart: '2025-10-01',
    dcostRatio: 1.0,
    dinstallCost: 0.002,
    updatedAt: '2024-09-01 11:00',
    updatedBy: 'manager',
    remark: '',
    isDeleted: false
  },
  {
    id: '7',
    nSource: 5,
    platformName: 'IronSource',
    tstart: '2000-01-01',
    dcostRatio: 1.05,
    dinstallCost: 0.002,
    updatedAt: '2024-01-15 10:23',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  },
  {
    id: '8',
    nSource: 7,
    platformName: 'Mintegral',
    tstart: '2000-01-01',
    dcostRatio: 1.0,
    dinstallCost: 0.002,
    updatedAt: '2024-01-15 10:23',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  },
  {
    id: '9',
    nSource: 11,
    platformName: 'TikTok Ads',
    tstart: '2000-01-01',
    dcostRatio: 0.98,
    dinstallCost: 0.0015,
    updatedAt: '2024-02-10 09:00',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  },
  {
    id: '10',
    nSource: 13,
    platformName: 'Vungle',
    tstart: '2000-01-01',
    dcostRatio: 1.0,
    dinstallCost: 0.0018,
    updatedAt: '2024-01-15 10:23',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  },
  {
    id: '11',
    nSource: 1,
    platformName: 'Google Ads',
    tstart: '2025-01-01',
    dcostRatio: 1.05,
    dinstallCost: 0.0012,
    updatedAt: '2024-11-01 14:00',
    updatedBy: 'manager',
    remark: '2025年起调价',
    isDeleted: false
  },
  {
    id: '12',
    nSource: 3,
    platformName: 'Unity Ads',
    tstart: '2025-04-01',
    dcostRatio: 1.02,
    dinstallCost: 0.002,
    updatedAt: '2024-12-05 10:00',
    updatedBy: 'admin',
    remark: '',
    isDeleted: false
  }
]

// 模拟调整历史（按 id 对应）
const mockHistoryMap: Record<string, CostCoefficientHistory[]> = {
  '5': [
    {
      time: '2024-06-20 14:30',
      operator: 'manager',
      changes: ['修改了折算比例：1.000 → 1.020', '安装成本：0.00200 → 0.00200']
    },
    {
      time: '2024-03-15 09:00',
      operator: 'admin',
      changes: ['修改了生效起始日期：2000-01-01 → 2025-07-01']
    },
    {
      time: '2024-01-15 10:23',
      operator: 'admin',
      changes: ['创建了此配置']
    }
  ]
}

export function getHistory(id: string): CostCoefficientHistory[] {
  return (
    mockHistoryMap[id] ?? [
      { time: '2024-01-15 10:23', operator: 'admin', changes: ['创建了此配置'] }
    ]
  )
}

export function cloneCostList(): CostCoefficientItem[] {
  return mockItems.map((i) => ({ ...i }))
}
