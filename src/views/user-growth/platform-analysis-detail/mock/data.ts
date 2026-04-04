/**
 * 广告平台分析详情页本地 Mock（与 `types.ts`、`mock/backend-api` 契约一致）
 * 分片接口各调一次 `buildMockPlatformAnalysisDetailData` 后取子集（仅 Mock 路径，体量可接受）。
 */
import type {
  AlertBarItem,
  ChartTrend,
  CountryRow,
  MatrixTableData,
  PlatformAnalysisDetailData,
  PlatformAnalysisDetailEcpmBlock,
  PlatformAnalysisDetailSummary,
  PlatformRow
} from '../types'

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
    s_country_code: string,
    base: number
  ): CountryRow => ({
    id,
    isCountry: true,
    platform,
    country,
    s_country_code,
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
    mkCountry(`${displayName}-g-us`, 'Google Ads', '美国', 'US', 2.2),
    mkCountry(`${displayName}-g-de`, 'Google Ads', '德国', 'DE', 1.6),
    mkCountry(`${displayName}-g-jp`, 'Google Ads', '日本', 'JP', 1.4)
  ]

  const tChildren: CountryRow[] = [
    mkCountry(`${displayName}-t-us`, 'TikTok', '美国', 'US', 1.9),
    mkCountry(`${displayName}-t-gb`, 'TikTok', '英国', 'GB', 2.8)
  ]

  const fChildren: CountryRow[] = [
    mkCountry(`${displayName}-f-in`, 'Facebook', '印度', 'IN', 1.2),
    mkCountry(`${displayName}-f-br`, 'Facebook', '巴西', 'BR', 2.4)
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

  const facebook: PlatformRow = {
    id: `${displayName}-facebook`,
    isCountry: false,
    platform: 'Facebook',
    countryCount: String(fChildren.length),
    adSpend: `$${(18.0 * jitter).toFixed(1)}k`,
    cpi: '$2.65',
    cpiLevel: 'near',
    cpm: '$11.2',
    cpc: '$0.38',
    roiD1: '102%',
    roiD1Level: 'good',
    roiD3: '109%',
    roiD7: '115%',
    profit: `$${(6.1 * jitter).toFixed(1)}k`,
    sparkline: spark(7, 2.45),
    children: fChildren
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

  return [google, facebook, tiktok]
}

/**
 * @param params.name 路由 query `name`，与钻取应用名一致
 */
export function buildMockPlatformAnalysisDetailData(params: {
  name: string
  from?: string
}): PlatformAnalysisDetailData {
  const displayName = params.name?.trim() || '应用'
  const h = hashStr(`${displayName}|${params.from ?? ''}`)
  const jitter = 0.92 + (h % 17) / 100

  const dates = ['02-27', '02-28', '03-01', '03-02', '03-03', '03-04', '03-05']

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
        id: 'cpiToday',
        title: '今日CPI（综合）',
        subTitle: '安装成本',
        primaryValue: `$${(2.38 * jitter).toFixed(2)}`,
        trendText: `${(5.2 + (h % 5) * 0.07).toFixed(2)}%`,
        trendUp: h % 2 === 0,
        trendCompareLabel: 'vs昨日'
      },
      {
        id: 'installsToday',
        title: '今日安装数',
        subTitle: '买量用户',
        primaryValue: `${Math.round(42156 * jitter).toLocaleString('en-US')}`,
        trendText: `${(1.35 + (h % 3) * 0.02).toFixed(2)}%`,
        trendUp: false
      },
      {
        id: 'ecpmKpi',
        title: 'ECPM',
        subTitle: '广告变现效率',
        primaryValue: (19.2 * jitter).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        trendText: `${(5.2 + (h % 3) * 0.06).toFixed(2)}%`,
        trendUp: true
      },
      {
        id: 'roiD1Comprehensive',
        title: '首日ROI（综合）',
        subTitle: '回收率',
        primaryValue: `${Math.round(87 * jitter)}%`,
        trendText: `${(2.1 + (h % 4) * 0.04).toFixed(2)}%`,
        trendUp: true
      },
      {
        id: 'estProfit',
        title: '预估利润',
        subTitle: '今日',
        primaryValue: `$${(3358 * jitter).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        trendText: `${(8.4 + (h % 3) * 0.05).toFixed(2)}%`,
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
        cpi: `$${(2.55 * jitter).toFixed(2)}`,
        cpm: `$${(11.2 * jitter).toFixed(1)}`,
        cpc: `$${(0.39 * jitter).toFixed(2)}`,
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
          data: [2.22, 2.28, 2.35, 2.41, 2.48, 2.55, 2.62].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: 'Facebook',
          color: '#8B5CF6',
          data: [2.45, 2.42, 2.38, 2.36, 2.34, 2.32, 2.3].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: 'TikTok',
          color: '#10B981',
          data: [1.95, 1.98, 2.02, 2.05, 2.08, 2.1, 2.12].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: 'Mintegral',
          color: '#06B6D4',
          data: [2.08, 2.12, 2.15, 2.18, 2.21, 2.24, 2.27].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: 'Kwai',
          color: '#F97316',
          data: [2.55, 2.52, 2.48, 2.45, 2.42, 2.4, 2.38].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: '目标 CPI',
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
          data: [17.2, 17.45, 17.7, 17.95, 18.2, 18.45, 18.7].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: '真实ECPM',
          color: '#14b8a6',
          data: [16.85, 17.0, 17.15, 17.3, 17.45, 17.6, 17.75].map((v) => +(v * jitter).toFixed(2))
        }
      ]
    },
    ecpmMetrics: {
      estimatedEcpm: (19.2 * jitter).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      actualEcpm: (17.8 * jitter).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      biasRate: `+${(7.9 + (h % 3) * 0.05).toFixed(2)}%`,
      biasAmount: `+$${(284 * jitter).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    alertBar: [
      {
        id: 'alert-1',
        level: 'danger',
        text: `${displayName} × Google Ads × US：CPI 高于目标 22%，建议收紧定向`
      },
      {
        id: 'alert-2',
        level: 'warning',
        text: 'TikTok × DE：预算已用 89%，关注次日回收'
      },
      {
        id: 'alert-3',
        level: 'info',
        text:
          params.from === 'comprehensive-analysis' ? '来自综合分析钻取（Mock）' : '详情页 Mock 数据'
      },
      {
        id: 'alert-4',
        level: 'good',
        text: 'Facebook × IN：ROI 达标，可适度扩量'
      }
    ]
  }
}

export function mockFetchPlatformAnalysisDetailSummary(params: {
  name: string
  from?: string
}): PlatformAnalysisDetailSummary {
  const d = buildMockPlatformAnalysisDetailData(params)
  return { sourceName: d.sourceName, kpis: d.kpis, statCards: d.statCards }
}

export function mockFetchPlatformAnalysisDetailCpiTrend(params: {
  name: string
  from?: string
}): ChartTrend {
  return buildMockPlatformAnalysisDetailData(params).cpiTrend
}

export function mockFetchPlatformAnalysisDetailEcpm(params: {
  name: string
  from?: string
}): PlatformAnalysisDetailEcpmBlock {
  const d = buildMockPlatformAnalysisDetailData(params)
  return { ecpmTrend: d.ecpmTrend, ecpmMetrics: d.ecpmMetrics }
}

export function mockFetchPlatformAnalysisDetailMatrixTable(params: {
  name: string
  from?: string
}): MatrixTableData {
  return buildMockPlatformAnalysisDetailData(params).matrixTable
}

export function mockFetchPlatformAnalysisDetailAlertBar(params: {
  name: string
  from?: string
}): AlertBarItem[] {
  return buildMockPlatformAnalysisDetailData(params).alertBar
}
