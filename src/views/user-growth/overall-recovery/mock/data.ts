/**
 * 整体回收页本地 Mock（与 `mock/backend-api` 契约、`types.ts` 一致）
 * 由 `src/api/user-growth/overall-recovery.ts` 中整体回收相关方法引用（接入真实接口前）
 */
import type { OverallTabData, OrganicTabData } from '../types'

// ─── Tab1: 整体回收 ────────────────────────────────────────────

const RECOVERY_DAYS = [
  'Day1',
  'Day7',
  'Day30',
  'Day45',
  'Day60',
  'Day90',
  'Day120',
  'Day150',
  'Day180'
]

export const MOCK_OVERALL_TAB_DATA: OverallTabData = {
  kpis: [
    {
      id: 'totalInstall',
      title: '今日总安装',
      primaryValue: '12,485',
      subLabel: '付费',
      subValue: '8,642 + 自然3,843',
      trendText: '+3.2% YoY日',
      trendUp: true
    },
    {
      id: 'organicRatio',
      title: '自然量占比',
      primaryValue: '30.8%',
      subLabel: 'K-factor',
      subValue: '0.43',
      trendText: '+2.1pp',
      trendUp: true
    },
    {
      id: 'effectiveCpi',
      title: '整体有效CPI',
      primaryValue: '$1.67',
      subLabel: '付费',
      subValue: '$2.41',
      trendText: '+5.2% 自然量提高',
      trendUp: true
    },
    {
      id: 'ltv7',
      title: 'LTV7（整体）',
      primaryValue: '$1.24',
      subLabel: '自然量用户人均入',
      trendText: '-8.4%',
      trendUp: false
    },
    {
      id: 'ltv30',
      title: 'LTV30（整体）',
      primaryValue: '$3.85',
      subLabel: '自然量用户人均入',
      trendText: '+12%',
      trendUp: true
    },
    {
      id: 'roiDay30',
      title: '整体ROI Day30',
      primaryValue: '230.5%',
      subLabel: '相比付费212.3%',
      trendText: '+1.8pp 日对照增加',
      trendUp: true
    }
  ],
  recoveryCurve: {
    days: RECOVERY_DAYS,
    series: [
      { name: 'Google+自然', color: '#4B8EF1', data: [18, 65, 135, 165, 190, 230, 265, 285, 300] },
      {
        name: 'Facebook+自然',
        color: '#F4923A',
        data: [15, 55, 115, 145, 168, 200, 228, 248, 260]
      },
      { name: 'TikTok+自然', color: '#A855F7', data: [12, 48, 100, 128, 150, 180, 205, 218, 228] },
      {
        name: '付费用户',
        color: '#EF4444',
        data: [10, 40, 85, 108, 128, 155, 178, 192, 200],
        dashed: true
      },
      {
        name: '平均线',
        color: '#14B8A6',
        data: [14, 52, 109, 137, 159, 191, 219, 236, 247],
        dashed: true
      }
    ]
  },
  dailyVolume: Array.from({ length: 30 }, (_, i) => ({
    date: `03-${String(i + 1).padStart(2, '0')}`,
    paid: 200 + ((i * 37 + 17) % 100),
    organic: 80 + ((i * 23 + 11) % 60)
  })),
  roiCompare: [
    { label: '付费', day1: '10%', day14: '85%', day30: '212%', day60: '310%', day90: '380%' },
    {
      label: '整体',
      day1: '12%',
      day14: '95%',
      day30: '230%',
      day60: '335%',
      day90: '412%',
      isHighlight: true
    },
    { label: '自然量增益', day1: '+2%', day14: '+10%', day30: '+18%', day60: '+25%', day90: '+32%' }
  ],
  detailRows: [
    {
      detailApp: 'weather5',
      detailChannel: 'google',
      date: '03-09',
      adSpend: 8754,
      cpi: 1.13,
      paidUsers: 9557,
      totalUsers: 12400,
      organicUsers: 2843,
      roiDay0: 5.2,
      roiDay1: 9.7,
      roiDay2: 15.4,
      roiDay3: 21.2,
      roiDay5: 33.8,
      roiDay7: 43.1,
      rush: 53,
      threeStar: 62,
      sevenStar: 71,
      retDay1: 38.2,
      retDay3: 25.6,
      retDay7: 18.4
    },
    {
      detailApp: 'weather5',
      detailChannel: 'facebook',
      date: '03-08',
      adSpend: 9216,
      cpi: 1.13,
      paidUsers: 9557,
      totalUsers: 12400,
      organicUsers: 2843,
      roiDay0: 5.1,
      roiDay1: 9.7,
      roiDay2: 15.4,
      roiDay3: 21.2,
      roiDay5: 33.8,
      roiDay7: 43.1,
      rush: 53,
      threeStar: 62,
      sevenStar: 71,
      retDay1: 37.8,
      retDay3: 24.9,
      retDay7: 17.8
    },
    {
      detailApp: 'weather5',
      detailChannel: 'google',
      date: '03-07',
      adSpend: 9521,
      cpi: 1.13,
      paidUsers: 9557,
      totalUsers: 12400,
      organicUsers: 2843,
      roiDay0: 5.6,
      roiDay1: 10.2,
      roiDay2: 16.8,
      roiDay3: 23.5,
      roiDay5: 36.2,
      roiDay7: 46.4,
      rush: 55,
      threeStar: 65,
      sevenStar: 74,
      retDay1: 39.1,
      retDay3: 26.3,
      retDay7: 19.2
    },
    {
      date: '03-06',
      adSpend: 8641,
      cpi: 0.13,
      paidUsers: 5735,
      totalUsers: 8203,
      organicUsers: 2468,
      roiDay0: 4.3,
      roiDay1: 7.8,
      roiDay2: 13.2,
      roiDay3: 18.9,
      roiDay5: 30.1,
      roiDay7: 39.8,
      rush: 48,
      threeStar: 58,
      sevenStar: 67,
      retDay1: 35.4,
      retDay3: 22.8,
      retDay7: 15.6
    },
    {
      date: '03-05',
      adSpend: 9865,
      cpi: 0.13,
      paidUsers: 4147,
      totalUsers: 6203,
      organicUsers: 2056,
      roiDay0: 5.5,
      roiDay1: 10.2,
      roiDay2: 16.3,
      roiDay3: 22.8,
      roiDay5: 36.4,
      roiDay7: 46.1,
      rush: 57,
      threeStar: 67,
      sevenStar: 76,
      retDay1: 40.2,
      retDay3: 27.1,
      retDay7: 19.8
    },
    {
      date: '03-04',
      adSpend: 8865,
      cpi: 0.15,
      paidUsers: 4342,
      totalUsers: 6043,
      organicUsers: 1701,
      roiDay0: 4.7,
      roiDay1: 8.5,
      roiDay2: 14.2,
      roiDay3: 19.8,
      roiDay5: 31.6,
      roiDay7: 41.2,
      rush: 50,
      threeStar: 60,
      sevenStar: 69,
      retDay1: 36.8,
      retDay3: 23.5,
      retDay7: 16.9
    }
  ]
}

// ─── Tab2: 自然量分析 ──────────────────────────────────────────

const ORGANIC_DATES = Array.from({ length: 30 }, (_, i) => `03-${String(i + 1).padStart(2, '0')}`)

export const MOCK_ORGANIC_TAB_DATA: OrganicTabData = {
  kpis: [
    {
      id: 'organicInstall',
      title: '自然量安装',
      primaryValue: '3,843',
      trendText: '+14.2%',
      trendUp: true
    },
    {
      id: 'organicRatio',
      title: '自然量占比',
      primaryValue: '30.8%',
      trendText: '+2pp',
      trendUp: true
    },
    { id: 'kfactor', title: 'K-factor', primaryValue: '0.43', trendText: '+0.02', trendUp: true },
    {
      id: 'organicLtv7',
      title: '自然量LTV7',
      primaryValue: '$0',
      trendText: '自然量用户人均广告变现'
    },
    {
      id: 'organicLtv30',
      title: '自然量LTV30',
      primaryValue: '$3.12',
      trendText: '+11.4%',
      trendUp: true
    },
    {
      id: 'roiBoost',
      title: '自然量ROI增幅',
      primaryValue: '+44.3%',
      trendText: '整体 vs 纯付费',
      trendUp: true
    }
  ],
  trendData: ORGANIC_DATES.map((date, i) => ({
    date,
    organic: Math.floor(100 + Math.sin(i * 0.3) * 40 + ((i * 17 + 3) % 30)),
    paid: Math.floor(250 + Math.cos(i * 0.2) * 50 + ((i * 13 + 7) % 40)),
    organicRatio: parseFloat((28 + Math.sin(i * 0.4) * 5 + ((i * 7 + 2) % 3)).toFixed(1))
  })),
  trafficSources: [
    { name: '广告曝光', value: 38, color: '#4B8EF1' },
    { name: '口碑推荐', value: 32, color: '#14B8A6' },
    { name: '品牌效应', value: 18, color: '#A855F7' },
    { name: '社交分享', value: 12, color: '#F4923A' }
  ],
  radarData: {
    indicators: ['ARPU', 'LTV', 'K-factor', '自然量用户比', '价格弹性'],
    organicValues: [72, 85, 95, 100, 60],
    paidValues: [88, 92, 30, 0, 85]
  },
  kfactorTrend: {
    dates: ORGANIC_DATES,
    values: ORGANIC_DATES.map((_, i) =>
      parseFloat((0.38 + Math.sin(i * 0.4) * 0.06 + ((i * 3 + 1) % 4) * 0.01).toFixed(2))
    )
  },
  kfactorChannels: [
    {
      source: 'Google',
      paidInstall: 2845,
      organicDriven: 1456,
      total: 4301,
      kfactor: 0.47,
      roiBoost: 67.2,
      trend: [0.42, 0.44, 0.46, 0.45, 0.47, 0.47, 0.48]
    },
    {
      source: 'Facebook',
      paidInstall: 3134,
      organicDriven: 1456,
      total: 4590,
      kfactor: 0.47,
      roiBoost: 67.2,
      trend: [0.4, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47]
    },
    {
      source: 'TikTok',
      paidInstall: 1288,
      organicDriven: 640,
      total: 1928,
      kfactor: 0.43,
      roiBoost: 44.3,
      trend: [0.38, 0.39, 0.41, 0.42, 0.42, 0.43, 0.43]
    },
    {
      source: 'Montegar',
      paidInstall: 1000,
      organicDriven: 0,
      total: 1000,
      kfactor: 0,
      roiBoost: 0,
      trend: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      source: '合计',
      paidInstall: 8267,
      organicDriven: 3552,
      total: 11819,
      kfactor: 0.43,
      roiBoost: 44.3,
      trend: [0.4, 0.41, 0.42, 0.43, 0.43, 0.43, 0.43]
    }
  ],
  countryTop8: [
    {
      countryCode: 'US',
      countryName: '美国',
      organicInstall: 1248,
      paidInstall: 3200,
      kfactor: 0.39,
      roiBoost: 35.5,
      organicRatio: 28.1
    },
    {
      countryCode: 'GB',
      countryName: '英国',
      organicInstall: 692,
      paidInstall: 1800,
      kfactor: 0.38,
      roiBoost: 32.1,
      organicRatio: 27.8
    },
    {
      countryCode: 'CA',
      countryName: '加拿大',
      organicInstall: 524,
      paidInstall: 1400,
      kfactor: 0.37,
      roiBoost: 28.4,
      organicRatio: 27.2
    },
    {
      countryCode: 'AU',
      countryName: '澳大利亚',
      organicInstall: 412,
      paidInstall: 1100,
      kfactor: 0.37,
      roiBoost: 27.9,
      organicRatio: 27.3
    },
    {
      countryCode: 'JP',
      countryName: '日本',
      organicInstall: 384,
      paidInstall: 1050,
      kfactor: 0.37,
      roiBoost: 26.8,
      organicRatio: 26.8
    },
    {
      countryCode: 'DE',
      countryName: '德国',
      organicInstall: 248,
      paidInstall: 720,
      kfactor: 0.34,
      roiBoost: 22.3,
      organicRatio: 25.6
    },
    {
      countryCode: 'FR',
      countryName: '法国',
      organicInstall: 169,
      paidInstall: 510,
      kfactor: 0.33,
      roiBoost: 21.5,
      organicRatio: 24.9
    },
    {
      countryCode: 'KR',
      countryName: '韩国',
      organicInstall: 147,
      paidInstall: 460,
      kfactor: 0.32,
      roiBoost: 19.4,
      organicRatio: 24.2
    }
  ]
}
