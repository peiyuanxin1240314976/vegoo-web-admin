/**
 * 广告平台分析详情页本地 Mock（与 `types.ts`、`mock/backend-api` 契约一致）
 * 由 `src/api/user-growth.ts` 中 `fetchPlatformAnalysisDetailData` 引用（接入真实接口前）
 */
import type { CountryRow, PlatformAnalysisDetailData, PlatformRow } from '../types'

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function spark(n: number, base: number): number[] {
  return Array.from(
    { length: n },
    (_, i) => +(base + Math.sin(i * 0.7) * 0.15 + (i % 3) * 0.02).toFixed(2)
  )
}

function buildMatrixRows(displayName: string, jitter: number): PlatformRow[] {
  const mkCountry = (
    id: string,
    platform: string,
    country: string,
    flag: string,
    base: number
  ): CountryRow => ({
    id,
    isCountry: true,
    platform,
    country,
    flag,
    adSpend: `$${(8.2 * jitter + base * 0.3).toFixed(1)}k`,
    cpi: `$${(2.8 + base * 0.05).toFixed(2)}`,
    cpiLevel: base > 2 ? 'over' : base > 1 ? 'near' : 'good',
    cpm: `$${(11 + base).toFixed(1)}`,
    cpc: `$${(0.38 + base * 0.01).toFixed(2)}`,
    roiD1: `${Math.round(95 + base * 3)}%`,
    roiD1Level: base > 2 ? 'danger' : base > 1 ? 'warn' : 'good',
    roiD3: `${Math.round(102 + base * 2)}%`,
    roiD7: `${Math.round(110 + base * 2)}%`,
    profit: `$${(3.1 * jitter + base * 0.2).toFixed(1)}k`,
    profitNeg: base > 2.5,
    sparkline: spark(7, 2.4 + base * 0.1)
  })

  const gChildren: CountryRow[] = [
    mkCountry(`${displayName}-g-us`, 'Google Ads', '美国', '🇺🇸', 2.2),
    mkCountry(`${displayName}-g-de`, 'Google Ads', '德国', '🇩🇪', 1.6),
    mkCountry(`${displayName}-g-jp`, 'Google Ads', '日本', '🇯🇵', 1.4)
  ]

  const tChildren: CountryRow[] = [
    mkCountry(`${displayName}-t-us`, 'TikTok', '美国', '🇺🇸', 1.9),
    mkCountry(`${displayName}-t-gb`, 'TikTok', '英国', '🇬🇧', 1.5)
  ]

  const google: PlatformRow = {
    id: `${displayName}-google`,
    isCountry: false,
    platform: 'Google Ads',
    countryCount: String(gChildren.length),
    adSpend: `$${(24.5 * jitter).toFixed(1)}k`,
    cpi: '$2.92',
    cpiLevel: 'near',
    cpm: '$12.8',
    cpc: '$0.44',
    roiD1: '104%',
    roiD1Level: 'good',
    roiD3: '111%',
    roiD7: '118%',
    profit: `$${(8.2 * jitter).toFixed(1)}k`,
    sparkline: spark(7, 2.5),
    children: gChildren
  }

  const tiktok: PlatformRow = {
    id: `${displayName}-tiktok`,
    isCountry: false,
    platform: 'TikTok',
    countryCount: String(tChildren.length),
    adSpend: `$${(14.2 * jitter).toFixed(1)}k`,
    cpi: '$2.18',
    cpiLevel: 'good',
    cpm: '$9.6',
    cpc: '$0.31',
    roiD1: '112%',
    roiD1Level: 'good',
    roiD3: '119%',
    roiD7: '124%',
    profit: `$${(5.4 * jitter).toFixed(1)}k`,
    sparkline: spark(7, 2.1),
    children: tChildren
  }

  return [google, tiktok]
}

/**
 * @param params.name 路由 query `name`，与钻取应用名一致
 */
export function buildMockPlatformAnalysisDetailData(params: {
  name: string
  from: string
}): PlatformAnalysisDetailData {
  const displayName = params.name?.trim() || '应用'
  const h = hashStr(`${displayName}|${params.from ?? ''}`)
  const jitter = 0.92 + (h % 17) / 100

  const dates = ['03-14', '03-15', '03-16', '03-17', '03-18', '03-19', '03-20']

  const matrixRows = buildMatrixRows(displayName.replace(/\s/g, '-'), jitter)
  const totalAdK = matrixRows.reduce(
    (acc, r) => acc + parseFloat(r.adSpend.replace(/[$k]/g, '')),
    0
  )
  const totalProfitK = matrixRows.reduce(
    (acc, r) => acc + parseFloat(r.profit.replace(/[$k]/g, '')),
    0
  )

  return {
    sourceName: displayName,
    kpis: [
      {
        id: 'spend',
        title: '广告支出',
        subTitle: '近7天',
        primaryValue: `$${(38.7 * jitter).toFixed(1)}k`,
        trendText: `${h % 2 === 0 ? '+' : '-'}${3 + (h % 5)}.2%`,
        trendUp: h % 2 === 0
      },
      {
        id: 'installs',
        title: '安装量',
        subTitle: '近7天',
        primaryValue: `${Math.round(14200 * jitter).toLocaleString('en-US')}`,
        trendText: `+${5 + (h % 4)}.1%`,
        trendUp: true
      },
      {
        id: 'cpi',
        title: '平均 CPI',
        subTitle: '近7天',
        primaryValue: `$${(2.58 * jitter).toFixed(2)}`,
        trendText: '-1.8%',
        trendUp: true
      },
      {
        id: 'roi7',
        title: '7 日 ROI',
        subTitle: '近7天',
        primaryValue: `${Math.round(118 * jitter)}%`,
        trendText: `+${2 + (h % 3)}.0%`,
        trendUp: true
      },
      {
        id: 'profit',
        title: '预估利润',
        subTitle: '近7天',
        primaryValue: `$${(13.6 * jitter).toFixed(1)}k`,
        trendText: `+${4 + (h % 4)}.5%`,
        trendUp: true
      }
    ],
    statCards: [
      {
        label: `${displayName} 安卓`,
        platform: 'android',
        adSpend: `$${(22.4 * jitter).toFixed(1)}k`,
        roi: `${Math.round(108 * jitter)}%`,
        installs: `${Math.round(8200 * jitter).toLocaleString('en-US')}`,
        profit: `$${(7.8 * jitter).toFixed(1)}k`,
        activePlatforms: '4'
      },
      {
        label: `${displayName} iOS`,
        platform: 'ios',
        adSpend: `$${(16.3 * jitter).toFixed(1)}k`,
        roi: `${Math.round(115 * jitter)}%`,
        installs: `${Math.round(6000 * jitter).toLocaleString('en-US')}`,
        profit: `$${(5.8 * jitter).toFixed(1)}k`,
        activePlatforms: '4'
      },
      {
        label: '合计',
        platform: 'total',
        adSpend: `$${(38.7 * jitter).toFixed(1)}k`,
        roi: `${Math.round(112 * jitter)}%`,
        installs: `${Math.round(14200 * jitter).toLocaleString('en-US')}`,
        profit: `$${(13.6 * jitter).toFixed(1)}k`,
        activePlatforms: '6'
      }
    ],
    matrixTable: {
      rows: matrixRows,
      total: {
        adSpend: `$${totalAdK.toFixed(1)}k`,
        installs: `${Math.round(24.5 * jitter)}k`,
        cpi: `$${(2.55 * jitter).toFixed(2)}`,
        cpm: `$${(11.2 * jitter).toFixed(1)}`,
        roiD1: `${Math.round(106 * jitter)}%`,
        roiD3: `${Math.round(112 * jitter)}%`,
        roiD7: `${Math.round(120 * jitter)}%`,
        profit: `$${totalProfitK.toFixed(1)}k`
      }
    },
    cpiTrend: {
      dates,
      target: 2.5,
      series: [
        {
          name: 'Google Ads',
          color: '#3B82F6',
          data: [2.2, 2.25, 2.3, 2.45, 2.55, 2.7, 2.85].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: 'TikTok',
          color: '#10B981',
          data: [1.95, 2.0, 2.05, 2.08, 2.1, 2.12, 2.15].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: '目标线',
          color: '#94a3b8',
          dashed: true,
          data: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5]
        }
      ]
    },
    ecpmTrend: {
      dates,
      series: [
        {
          name: '预估ECPM',
          color: '#f59e0b',
          data: [17.2, 17.5, 17.8, 18.1, 18.4, 18.7, 19.0].map((v) => +(v * jitter).toFixed(1))
        },
        {
          name: '真实ECPM',
          color: '#14b8a6',
          data: [16.8, 17.0, 17.2, 17.5, 17.8, 18.0, 18.2].map((v) => +(v * jitter).toFixed(1))
        }
      ]
    },
    ecpmMetrics: {
      estimatedEcpm: `$${(19.2 * jitter).toFixed(1)}`,
      actualEcpm: `$${(18.1 * jitter).toFixed(1)}`,
      biasRate: `${-5.2 - (h % 4)}%`,
      biasAmount: `-$${(0.9 + (h % 5) / 10).toFixed(1)}`
    },
    alertBar: [
      {
        id: '1',
        level: 'danger',
        text: `${displayName} × Google Ads × US：CPI 高于目标 22%，建议收紧定向`
      },
      {
        id: '2',
        level: 'warning',
        text: 'TikTok × DE：预算已用 89%，关注次日回收'
      },
      {
        id: '3',
        level: 'info',
        text:
          params.from === 'comprehensive-analysis' ? '来自综合分析钻取（Mock）' : '详情页 Mock 数据'
      }
    ]
  }
}
