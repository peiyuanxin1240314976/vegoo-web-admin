/**
 * 综合分析页本地 Mock（与 `mock/backend-api` 契约、`types.ts` 一致）
 * 由 `src/api/user-growth/comprehensive-analysis.ts` 中综合分析相关方法引用（接入真实接口前）
 */
import type { ComprehensiveAnalysisApiParams, ComprehensiveAnalysisData, CpiStatus } from '../types'

export const MOCK_COMPREHENSIVE_ANALYSIS_DATA: ComprehensiveAnalysisData = {
  kpis: [
    {
      id: 'cpiToday',
      title: '今日CPI（综合）',
      subTitle: '安装成本',
      primaryValue: '$2.38',
      trendText: '5.20%',
      trendUp: true,
      trendCompareLabel: 'vs昨日'
    },
    {
      id: 'installsToday',
      title: '今日安装数',
      subTitle: '买量用户',
      primaryValue: '42,156',
      trendText: '2.30%',
      trendUp: true
    },
    {
      id: 'ecpmKpi',
      title: 'ECPM',
      subTitle: '广告变现效率',
      primaryValue: '19.20',
      trendText: '5.20%',
      trendUp: true
    },
    {
      id: 'roiD1Comprehensive',
      title: '首日ROI（综合）',
      subTitle: '回收率',
      primaryValue: '87%',
      trendText: '2.10%',
      trendUp: true
    },
    {
      id: 'estProfit',
      title: '预估利润',
      subTitle: '今日',
      primaryValue: '$3,358',
      trendText: '8.40%',
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
      estimatedEcpm: '$19.80',
      actualEcpm: '$18.60',
      biasRate: '-6.10%',
      biasAmount: '-$1.20'
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
  const appKey = [...params.appIds].sort().join(',')
  const key = `${params.date_start}|${params.date_end}|${appKey}|${params.source}|${params.s_country_code}`
  const h = hashStr(key)
  const jitter = 0.88 + (h % 25) / 100
  const d = cloneComprehensiveData(MOCK_COMPREHENSIVE_ANALYSIS_DATA)

  d.kpis = d.kpis.map((k) => {
    if (k.id === 'installsToday') {
      const n = parseInt(String(k.primaryValue).replace(/,/g, ''), 10)
      const n2 = Math.max(0, Math.round(n * jitter))
      return { ...k, primaryValue: n2.toLocaleString('en-US') }
    }
    if (k.id === 'estProfit') {
      const raw = String(k.primaryValue).replace(/[$,]/g, '')
      const num = parseInt(raw, 10) * jitter
      return { ...k, primaryValue: `$${Math.round(num).toLocaleString('en-US')}` }
    }
    if (k.id === 'cpiToday') {
      const num = parseFloat(String(k.primaryValue).replace('$', '')) * jitter
      return { ...k, primaryValue: `$${num.toFixed(2)}` }
    }
    if (k.id === 'ecpmKpi') {
      const num = parseFloat(String(k.primaryValue)) * jitter
      return {
        ...k,
        primaryValue: num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }
    }
    if (k.id === 'roiD1Comprehensive') {
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
    if (params.appIds.includes('weather5') && row.name === 'Weather5') {
      cpi *= 0.92
    }
    if (params.appIds.includes('phonetracker') && row.name === 'PhoneTracker') {
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
      estimatedEcpm: `$${(19.8 * jitter).toFixed(2)}`,
      actualEcpm: `$${(18.6 * jitter).toFixed(2)}`,
      biasRate: `${((h % 2 === 0 ? -1 : 1) * (5 + (h % 5))).toFixed(2)}%`,
      biasAmount: `$${((h % 2 === 0 ? -1 : 1) * (0.8 + (h % 5) / 10)).toFixed(2)}`
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
