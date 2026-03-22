/**
 * 综合分析页本地 Mock（与 `mock/backend-api` 契约、`types.ts` 一致）
 * 由 `src/api/user-growth/comprehensive-analysis.ts` 中综合分析相关方法引用（接入真实接口前）
 */
import type {
  ComprehensiveAnalysisApiParams,
  ComprehensiveAnalysisData,
  ComprehensiveAnalysisFilterOptions,
  CpiStatus,
  SectionAppData
} from '../types'

export const MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS: ComprehensiveAnalysisFilterOptions = {
  appOptions: [
    { label: '全部', value: 'all' },
    { label: 'Weather5', value: 'weather5' },
    { label: 'PhoneTracker', value: 'phonetracker' }
  ],
  sourceOptions: [
    { label: '全部', value: 'all' },
    { label: 'Google Ads', value: 'google' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'TikTok', value: 'tiktok' }
  ],
  countryOptions: [
    { label: '全部', value: 'all' },
    { label: '美国', value: 'US' },
    { label: '英国', value: 'GB' },
    { label: '日本', value: 'JP' }
  ]
}

export const MOCK_COMPREHENSIVE_ANALYSIS_DATA: ComprehensiveAnalysisData = {
  kpis: [
    {
      id: 'totalInstall',
      title: '总安装量',
      subTitle: '近7天',
      primaryValue: '12,485',
      trendText: '+8.5%',
      trendUp: true
    },
    {
      id: 'totalSpend',
      title: '总花费',
      subTitle: '近7天',
      primaryValue: '$48.2k',
      trendText: '+3.2%',
      trendUp: false
    },
    {
      id: 'avgCpi',
      title: '平均 CPI',
      subTitle: '近7天',
      primaryValue: '$2.65',
      trendText: '-2.1%',
      trendUp: true
    },
    {
      id: 'roiD1',
      title: 'ROI D1',
      subTitle: '近7天',
      primaryValue: '112%',
      trendText: '+4.0%',
      trendUp: true
    },
    {
      id: 'newUsers',
      title: '新增用户',
      subTitle: '近7天',
      primaryValue: '9,820',
      trendText: '+6.1%',
      trendUp: true
    }
  ],
  platformCpiBar: {
    target: 2.5,
    items: [
      { name: 'Google Ads', cpi: 3.21, color: '#4B8EF1', status: 'over' },
      { name: 'Facebook', cpi: 2.48, color: '#1877F2', status: 'near' },
      { name: 'TikTok', cpi: 2.12, color: '#000000', status: 'good' },
      { name: 'Unity', cpi: 2.89, color: '#A855F7', status: 'over' },
      { name: 'AppLovin', cpi: 2.35, color: '#FF6B6B', status: 'good' }
    ]
  },
  appCpiRank: [
    { id: 'app1', name: 'PhoneTracker', cpi: 3.21, trend: 'down' },
    { id: 'app2', name: 'Weather5', cpi: 2.88, trend: 'up' },
    { id: 'app3', name: 'BloodSugar2', cpi: 2.54, trend: 'flat' },
    { id: 'app4', name: 'StepCounter', cpi: 2.31, trend: 'up' },
    { id: 'app5', name: 'SleepTrack', cpi: 2.09, trend: 'down' }
  ],
  countryCpiMap: [
    { country: '美国', code: 'US', cpi: 3.12, x: 22, y: 36 },
    { country: '英国', code: 'GB', cpi: 2.76, x: 48, y: 28 },
    { country: '日本', code: 'JP', cpi: 2.45, x: 88, y: 38 },
    { country: '德国', code: 'DE', cpi: 2.91, x: 52, y: 30 },
    { country: '巴西', code: 'BR', cpi: 3.45, x: 32, y: 72 }
  ],
  countryTop8: [
    { country: '美国', code: 'US', cpi: 3.12 },
    { country: '英国', code: 'GB', cpi: 2.76 },
    { country: '日本', code: 'JP', cpi: 2.45 },
    { country: '德国', code: 'DE', cpi: 2.91 },
    { country: '法国', code: 'FR', cpi: 2.68 },
    { country: '加拿大', code: 'CA', cpi: 2.82 },
    { country: '澳大利亚', code: 'AU', cpi: 2.71 },
    { country: '巴西', code: 'BR', cpi: 3.45 }
  ],
  alerts: [
    {
      id: 'a1',
      level: 'danger',
      text: 'Google Ads × US: CPI $3.21 超标 28.4%，ROI D1 仅 22%'
    },
    {
      id: 'a2',
      level: 'warning',
      text: 'Facebook × DE: 预算消耗 92%，建议关注次日转化'
    },
    {
      id: 'a3',
      level: 'info',
      text: 'TikTok × JP: CPI 低于目标 15%，可适度放量'
    }
  ],
  platformCpiTrend: {
    dates: ['03-14', '03-15', '03-16', '03-17', '03-18', '03-19', '03-20'],
    target: 2.5,
    series: [
      {
        name: 'Google Ads',
        color: '#4B8EF1',
        data: [2.1, 2.2, 2.15, 2.35, 2.48, 2.9, 3.21]
      },
      {
        name: 'Facebook',
        color: '#1877F2',
        data: [2.4, 2.38, 2.42, 2.45, 2.46, 2.47, 2.48]
      },
      {
        name: 'TikTok',
        color: '#22c55e',
        data: [2.05, 2.08, 2.1, 2.11, 2.12, 2.11, 2.12]
      }
    ]
  },
  ecpmAnalysis: {
    dates: ['03-14', '03-15', '03-16', '03-17', '03-18', '03-19', '03-20'],
    estimated: [18.2, 18.5, 18.8, 19.0, 19.2, 19.5, 19.8],
    actual: [17.9, 18.1, 18.3, 18.0, 18.4, 18.5, 18.6],
    metrics: {
      estimatedEcpm: '$19.8',
      actualEcpm: '$18.6',
      biasRate: '-6.1%',
      biasAmount: '-$1.2'
    }
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function cloneComprehensiveData(data: ComprehensiveAnalysisData): ComprehensiveAnalysisData {
  return JSON.parse(JSON.stringify(data)) as ComprehensiveAnalysisData
}

function cpiToStatus(cpi: number, target: number): CpiStatus {
  if (cpi <= target) return 'good'
  if (cpi <= target * 1.2) return 'near'
  return 'over'
}

/** 广告平台筛选项 value → 与柱图 / 趋势图系列名称匹配 */
function platformSeriesMatches(seriesName: string, source: string): boolean {
  if (!source) return true
  const s = source.toLowerCase()
  const n = seriesName.toLowerCase()
  if (s === 'google') return n.includes('google')
  if (s === 'tiktok') return n.includes('tiktok')
  if (s === 'facebook') return n.includes('facebook')
  return true
}

function platformBarItemMatches(itemName: string, source: string): boolean {
  return platformSeriesMatches(itemName, source)
}

/**
 * 按当前筛选生成 overview Mock（切换应用 / 广告平台 / 国家 / 日期时数值与维度会变化）
 */
export function buildMockComprehensiveAnalysisData(
  params: ComprehensiveAnalysisApiParams
): ComprehensiveAnalysisData {
  const key = `${params.date_start}|${params.date_end}|${params.s_app_id}|${params.source}|${params.s_country_code}`
  const h = hashStr(key)
  const jitter = 0.88 + (h % 25) / 100
  const d = cloneComprehensiveData(MOCK_COMPREHENSIVE_ANALYSIS_DATA)

  d.kpis = d.kpis.map((k) => {
    if (k.id === 'totalInstall' || k.id === 'newUsers') {
      const n = parseInt(String(k.primaryValue).replace(/,/g, ''), 10)
      const n2 = Math.max(0, Math.round(n * jitter))
      return { ...k, primaryValue: n2.toLocaleString('en-US') }
    }
    if (k.id === 'totalSpend') {
      const raw = String(k.primaryValue).replace(/[$k]/g, '')
      const num = parseFloat(raw) * jitter
      return { ...k, primaryValue: `$${num.toFixed(1)}k` }
    }
    if (k.id === 'avgCpi') {
      const num = parseFloat(String(k.primaryValue).replace('$', '')) * jitter
      return { ...k, primaryValue: `$${num.toFixed(2)}` }
    }
    if (k.id === 'roiD1') {
      const num = parseFloat(String(k.primaryValue).replace('%', '')) * (0.96 + (h % 8) / 100)
      return { ...k, primaryValue: `${Math.round(num)}%` }
    }
    return k
  })

  const target = d.platformCpiBar.target
  d.platformCpiBar.items = d.platformCpiBar.items
    .filter((item) => platformBarItemMatches(item.name, params.source))
    .map((item) => {
      const cpi = item.cpi * jitter
      const c = +cpi.toFixed(2)
      return { ...item, cpi: c, status: cpiToStatus(c, target) }
    })

  d.appCpiRank = d.appCpiRank.map((row, i) => {
    let cpi = row.cpi * jitter
    if (params.s_app_id && params.s_app_id === 'weather5' && row.name === 'Weather5') {
      cpi *= 0.92
    }
    if (params.s_app_id && params.s_app_id === 'phonetracker' && row.name === 'PhoneTracker') {
      cpi *= 0.9
    }
    return {
      ...row,
      cpi: +(cpi * (1 + (i % 4) * 0.008)).toFixed(2)
    }
  })

  let mapList = d.countryCpiMap
  let top8 = d.countryTop8
  if (params.s_country_code) {
    mapList = mapList.filter((c) => c.code === params.s_country_code.toUpperCase())
    top8 = top8.filter((c) => c.code === params.s_country_code.toUpperCase())
    if (mapList.length === 0) {
      mapList = [
        { country: '筛选国家', code: params.s_country_code.toUpperCase(), cpi: 2.8, x: 50, y: 40 }
      ]
    }
    if (top8.length === 0) {
      top8 = [{ country: '筛选国家', code: params.s_country_code.toUpperCase(), cpi: 2.8 }]
    }
  }

  d.countryCpiMap = mapList.map((c) => ({
    ...c,
    cpi: +(c.cpi * jitter).toFixed(2)
  }))
  d.countryTop8 = top8.map((c) => ({
    ...c,
    cpi: +(c.cpi * jitter).toFixed(2)
  }))

  d.platformCpiTrend.series = d.platformCpiTrend.series
    .filter((s) => platformSeriesMatches(s.name, params.source))
    .map((s) => ({
      ...s,
      data: s.data.map((v) => +(v * jitter).toFixed(2))
    }))

  d.ecpmAnalysis = {
    ...d.ecpmAnalysis,
    estimated: d.ecpmAnalysis.estimated.map((v) => +(v * jitter).toFixed(1)),
    actual: d.ecpmAnalysis.actual.map((v) => +(v * jitter).toFixed(1)),
    metrics: {
      estimatedEcpm: `$${(19.8 * jitter).toFixed(1)}`,
      actualEcpm: `$${(18.6 * jitter).toFixed(1)}`,
      biasRate: `${((h % 2 === 0 ? -1 : 1) * (5 + (h % 5))).toFixed(1)}%`,
      biasAmount: `$${((h % 2 === 0 ? -1 : 1) * (0.8 + (h % 5) / 10)).toFixed(1)}`
    }
  }

  if (params.source) {
    d.alerts = d.alerts.filter((a) =>
      platformSeriesMatches(a.text.split('×')[0]?.trim() ?? '', params.source)
    )
    if (d.alerts.length === 0) {
      d.alerts = [
        {
          id: 'mock-filter',
          level: 'info' as const,
          text: `当前仅展示 ${params.source} 相关预警（Mock）`
        }
      ]
    }
  }

  return d
}

const CODE_TO_COUNTRY_LABEL: Record<string, string> = {
  US: '美国',
  GB: '英国',
  JP: '日本',
  DE: '德国',
  FR: '法国',
  BR: '巴西'
}

/** 看板视图 SectionApp 用 Mock（随筛选变化） */
export function buildMockSectionAppData(params: ComprehensiveAnalysisApiParams): SectionAppData {
  const h = hashStr(JSON.stringify(params))
  const jitter = 0.9 + (h % 20) / 100
  const cc = params.s_country_code.toUpperCase()
  const countries = params.s_country_code
    ? [CODE_TO_COUNTRY_LABEL[cc] ?? cc]
    : (['美国', '日本', '德国'] as const)

  const cpiBase = (i: number) => +(2.2 + i * 0.35 * jitter).toFixed(2)

  return {
    appCpiRank: [
      { rank: 1, appName: 'PhoneTracker', cpi: cpiBase(3), change: 2.4, isHighlight: true },
      { rank: 2, appName: 'Weather5', cpi: cpiBase(2), change: -1.2 },
      { rank: 3, appName: 'BloodSugar2', cpi: cpiBase(1), change: 0.5 },
      { rank: 4, appName: 'StepCounter', cpi: cpiBase(0), change: -0.8 }
    ],
    platformCountryMatrix: {
      countries: [...countries],
      rows: [
        {
          platform: 'Google Ads',
          cells: Object.fromEntries(
            countries.map((c, i) => [
              c,
              {
                value: `$${(3.1 + i * 0.2).toFixed(2)}`,
                changeRate: `${h % 2 === 0 ? '+' : '-'}${1 + (i % 3)}%`,
                highlight: (i === 0 ? 'warn' : '') as '' | 'warn' | 'good'
              }
            ])
          )
        },
        {
          platform: 'TikTok',
          cells: Object.fromEntries(
            countries.map((c, i) => [
              c,
              {
                value: `$${(2.4 + i * 0.15).toFixed(2)}`,
                changeRate: `${h % 2 === 1 ? '+' : '-'}${2 + (i % 2)}%`,
                highlight: '' as const
              }
            ])
          )
        }
      ]
    },
    appCpiTrend: {
      dates: ['03-14', '03-15', '03-16', '03-17', '03-18', '03-19', '03-20'],
      target: 2.5,
      series: [
        {
          name: 'PhoneTracker',
          color: '#4B8EF1',
          data: [2.1, 2.15, 2.2, 2.35, 2.5, 2.68, 2.9].map((v) => +(v * jitter).toFixed(2))
        },
        {
          name: 'Weather5',
          color: '#22c55e',
          data: [1.9, 1.95, 2.0, 2.05, 2.1, 2.12, 2.15].map((v) => +(v * jitter).toFixed(2))
        }
      ]
    }
  }
}
