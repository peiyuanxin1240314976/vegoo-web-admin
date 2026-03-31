/**
 * 本地聚合 Mock，字段与 `mock/backend-api/01-08-*.json` 各模块 `sampleResponse` 合并后的 `AdPlatformInfoPageData` 一致。
 * 分接口 Mock 见 `ad-platform-info-api-mock.ts`；远程联调见 `src/api/user-growth/ad-platform-info.ts` + `../config/data-source.ts`。
 */
import type {
  AdPlatformInfoCampaignRow,
  AdPlatformInfoFunnelStage,
  AdPlatformInfoHeatmapData,
  AdPlatformInfoKpiCard,
  AdPlatformInfoMapPoint,
  AdPlatformInfoPageData,
  AdPlatformInfoPlatformSummary,
  AdPlatformInfoTopRow,
  AdPlatformInfoTrendData
} from '../types'

function fmtUsd2(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtInt(n: number) {
  return n.toLocaleString('en-US')
}

function fmtPct2(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
}

const ACCENT_COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F97316',
  red: '#EF4444',
  purple: '#A78BFA',
  teal: '#26C2AD'
} as const

export const MOCK_AD_PLATFORM_INFO_SUMMARY: AdPlatformInfoPlatformSummary = {
  name: 'Google Ads',
  subtitle: '聚合深度分析 / Google Ads',
  score: 92,
  scoreText: '92/100'
}

export const MOCK_AD_PLATFORM_INFO_KPIS: AdPlatformInfoKpiCard[] = [
  {
    id: 'spend',
    title: '总支出',
    metricKey: 'spend',
    valueText: `$${fmtUsd2(120500)}`,
    deltaPct: 12.3,
    accent: 'blue',
    variant: 'top',
    spark: [82, 88, 84, 90, 96, 94, 102, 98, 112, 108, 116, 120.5]
  },
  {
    id: 'revenue',
    title: '总收入',
    metricKey: 'revenue',
    valueText: `$${fmtUsd2(241500)}`,
    deltaPct: 12.3,
    accent: 'green',
    variant: 'top',
    spark: [120, 126, 132, 141, 155, 168, 175, 182, 198, 210, 229, 241.5]
  },
  {
    id: 'profit',
    title: '总利润',
    metricKey: 'profit',
    valueText: `+$${fmtUsd2(121000)}`,
    deltaPct: 12.3,
    accent: 'teal',
    variant: 'top',
    spark: [38, 42, 39, 45, 50, 53, 57, 60, 66, 70, 78, 82]
  },
  {
    id: 'roi',
    title: '平均 ROI',
    metricKey: 'roi',
    valueText: fmtPct2(200),
    deltaPct: 12.3,
    accent: 'amber',
    variant: 'top',
    spark: [150, 158, 162, 170, 178, 185, 192, 188, 195, 198, 202, 200]
  },
  {
    id: 'cpi',
    title: '平均 CPI',
    metricKey: 'cpi',
    valueText: `$${fmtUsd2(0.85)}`,
    deltaPct: -1.5,
    accent: 'purple',
    variant: 'stat',
    icon: 'ri:coupon-3-line',
    noteText: '低于平均值15%',
    spark: [0.92, 0.9, 0.88, 0.86, 0.84, 0.87, 0.86, 0.85, 0.86, 0.84, 0.83, 0.85]
  },
  {
    id: 'installs',
    title: '安装量',
    metricKey: 'installs',
    valueText: fmtInt(141756),
    deltaPct: 12.3,
    accent: 'blue',
    variant: 'stat',
    icon: 'ri:download-2-line',
    spark: [8600, 9100, 9400, 9800, 10300, 10900, 11500, 12000, 12900, 13400, 13900, 14176]
  },
  {
    id: 'cvr',
    title: '转化率',
    metricKey: 'cvr',
    valueText: fmtPct2(32.5),
    deltaPct: 1.1,
    accent: 'teal',
    variant: 'stat',
    icon: 'ri:percent-line',
    noteText: '高于平均值8%',
    spark: [28.2, 29.1, 30.4, 31.0, 31.6, 31.9, 32.2, 32.1, 32.6, 32.8, 33.0, 32.5]
  },
  {
    id: 'd7_ltv',
    title: 'D7 LTV',
    metricKey: 'd7_ltv',
    valueText: `$${fmtUsd2(1.7)}`,
    deltaPct: -0.4,
    accent: 'blue',
    variant: 'stat',
    icon: 'ri:bar-chart-2-line',
    noteText: '低于预期12%',
    spark: [1.42, 1.5, 1.48, 1.58, 1.62, 1.6, 1.68, 1.72, 1.65, 1.7, 1.74, 1.7]
  },
  {
    id: 'retention',
    title: '用户留存',
    metricKey: 'retention',
    valueText: '',
    deltaPct: 0,
    accent: 'green',
    variant: 'retention',
    icon: 'ri:user-smile-line',
    spark: [],
    retentionSegments: [
      { label: 'D1', valueText: fmtPct2(45), spark: [32, 34, 36, 35, 38, 42, 45] },
      { label: 'D7', valueText: fmtPct2(18), spark: [12, 13, 14, 15, 16, 17, 18] },
      { label: 'D30', valueText: fmtPct2(8), spark: [5.2, 5.8, 6.1, 6.6, 7.1, 7.6, 8] }
    ]
  },
  {
    id: 'pay_rate',
    title: '付费率',
    metricKey: 'pay_rate',
    valueText: fmtPct2(3.2),
    deltaPct: 0.6,
    accent: 'green',
    variant: 'stat',
    icon: 'ri:money-dollar-circle-line',
    noteText: '高于平均',
    spark: [2.7, 2.9, 2.8, 3.0, 3.1, 3.0, 3.2, 3.3, 3.2, 3.1, 3.3, 3.2]
  }
]

export const MOCK_AD_PLATFORM_INFO_MAP_POINTS: AdPlatformInfoMapPoint[] = [
  { name: 'United States', cnName: '美国', value: 86.2 },
  { name: 'Canada', cnName: '加拿大', value: 74.5 },
  { name: 'Brazil', cnName: '巴西', value: 62.1 },
  { name: 'Germany', cnName: '德国', value: 78.3 },
  { name: 'United Kingdom', cnName: '英国', value: 73.9 },
  { name: 'France', cnName: '法国', value: 69.2 },
  { name: 'India', cnName: '印度', value: 55.1 },
  { name: 'Japan', cnName: '日本', value: 80.6 },
  { name: 'Australia', cnName: '澳大利亚', value: 71.4 },
  { name: 'Mexico', cnName: '墨西哥', value: 58.6 },
  { name: 'Spain', cnName: '西班牙', value: 63.5 },
  { name: 'Italy', cnName: '意大利', value: 66.1 },
  { name: 'Netherlands', cnName: '荷兰', value: 70.8 },
  { name: 'Sweden', cnName: '瑞典', value: 72.3 },
  { name: 'Norway', cnName: '挪威', value: 71.2 },
  { name: 'Poland', cnName: '波兰', value: 60.7 },
  { name: 'Turkey', cnName: '土耳其', value: 57.4 },
  { name: 'Saudi Arabia', cnName: '沙特', value: 59.8 },
  { name: 'United Arab Emirates', cnName: '阿联酋', value: 64.2 },
  { name: 'Israel', cnName: '以色列', value: 67.9 },
  { name: 'South Africa', cnName: '南非', value: 52.3 },
  { name: 'Egypt', cnName: '埃及', value: 49.6 },
  { name: 'Nigeria', cnName: '尼日利亚', value: 45.8 },
  { name: 'Kenya', cnName: '肯尼亚', value: 44.9 },
  { name: 'Argentina', cnName: '阿根廷', value: 51.7 },
  { name: 'Chile', cnName: '智利', value: 54.1 },
  { name: 'Colombia', cnName: '哥伦比亚', value: 50.6 },
  { name: 'Peru', cnName: '秘鲁', value: 47.2 },
  { name: 'Thailand', cnName: '泰国', value: 53.6 },
  { name: 'Vietnam', cnName: '越南', value: 48.7 },
  { name: 'Indonesia', cnName: '印尼', value: 46.4 },
  { name: 'Philippines', cnName: '菲律宾', value: 45.1 },
  { name: 'Malaysia', cnName: '马来西亚', value: 50.2 },
  { name: 'Singapore', cnName: '新加坡', value: 73.4 },
  { name: 'South Korea', cnName: '韩国', value: 76.8 },
  { name: 'Taiwan', cnName: '台湾', value: 69.4 },
  { name: 'Hong Kong', cnName: '香港', value: 71.9 },
  { name: 'New Zealand', cnName: '新西兰', value: 68.7 }
]

export const MOCK_AD_PLATFORM_INFO_TOP10: AdPlatformInfoTopRow[] = Array.from({ length: 10 }).map(
  (_, idx) => {
    const base = 118000 - idx * 5200
    const revenue = Math.max(42000, base + (idx % 3) * 1300)
    const roi = 220 - idx * 8 + (idx % 2 ? 4 : 0)
    const profit = revenue * (roi / 100 - 1) * 0.42
    const cc = ['US', 'GB', 'DE', 'JP', 'BR', 'CA', 'FR', 'IN', 'AU', 'MX'][idx] || 'US'
    const cn = [
      '美国',
      '英国',
      '德国',
      '日本',
      '巴西',
      '加拿大',
      '法国',
      '印度',
      '澳大利亚',
      '墨西哥'
    ][idx]
    return {
      rank: idx + 1,
      s_country_code: cc,
      countryName: cn,
      revenue,
      roi,
      profit
    }
  }
)

export const MOCK_AD_PLATFORM_INFO_HEATMAP: AdPlatformInfoHeatmapData = (() => {
  const xLabels = ['D1', 'D3', 'D7', 'D14', 'D30']
  const yLabels = ['01/01', '01/02', '01/03', '01/04', '01/05', '01/06', '01/07']
  const points: AdPlatformInfoHeatmapData['points'] = []
  // 按获客日期 cohort：越靠近今天，越缺少更长周期留存 → 形成倒梯形空白区
  const colCounts = [5, 5, 4, 4, 3, 2, 1]
  yLabels.forEach((_, y) => {
    const cols = colCounts[y] ?? xLabels.length
    xLabels.slice(0, cols).forEach((_, x) => {
      const base = 42 - x * 6 + (y % 3) * 2
      const v = Math.max(6, base + Math.sin((x + 1) * (y + 1)) * 3)
      points.push([x, y, Number(v.toFixed(1))])
    })
  })
  const values = points.map((p) => p[2])
  return {
    xLabels,
    yLabels,
    points,
    legendMin: Math.min(...values),
    legendMax: Math.max(...values)
  }
})()

export const MOCK_AD_PLATFORM_INFO_FUNNEL: AdPlatformInfoFunnelStage[] = [
  { name: '引流', value: 789 },
  { name: '安装', value: 253 },
  { name: '留存', value: 113 },
  { name: '支付', value: 59 }
]

export const MOCK_AD_PLATFORM_INFO_TREND: AdPlatformInfoTrendData = (() => {
  const dates = Array.from({ length: 28 }).map(
    (_, i) => `10/${(i + 1).toString().padStart(2, '0')}`
  )
  const spend = dates.map((_, i) => 3800 + i * 35 + Math.sin(i / 3) * 260)
  const revenue = dates.map((_, i) => 7200 + i * 55 + Math.sin(i / 2.8) * 380)
  const roi = dates.map((_, i) => 160 + Math.sin(i / 2.2) * 28 + i * 0.6)
  const cpi = dates.map((_, i) => 0.82 + Math.sin(i / 2.6) * 0.06 + i * 0.001)
  return {
    dates,
    series: [
      {
        name: 'ROI',
        type: 'line',
        yAxisIndex: 0,
        data: roi.map((v) => Number(v.toFixed(2))),
        color: '#3B82F6'
      },
      {
        name: '收入',
        type: 'line',
        yAxisIndex: 0,
        data: revenue.map((v) => Math.max(0, Math.round(v))),
        color: '#10B981'
      },
      {
        name: '支出',
        type: 'line',
        yAxisIndex: 0,
        data: spend.map((v) => Math.max(0, Math.round(v))),
        color: '#A78BFA'
      },
      {
        name: 'CPI',
        type: 'line',
        yAxisIndex: 0,
        data: cpi.map((v) => Number(v.toFixed(2))),
        color: '#F59E0B'
      }
    ]
  }
})()

export const MOCK_AD_PLATFORM_INFO_CAMPAIGNS: AdPlatformInfoCampaignRow[] = Array.from({
  length: 12
}).map((_, idx) => {
  const spend = 5000 + idx * 720 + (idx % 2 ? 240 : -120)
  const roi = 140 + (idx % 5) * 18 - (idx % 3) * 6
  const revenue = spend * (roi / 100)
  const profit = revenue - spend
  const clicks = Math.max(0, Math.round(3200 + idx * 260 + Math.sin(idx / 2) * 180))
  const conversionRate = Number((1.8 + (idx % 4) * 0.35 + Math.sin(idx / 3) * 0.15).toFixed(2))
  return {
    id: `cmp_${idx + 1}`,
    campaign: `P${(7262 + idx).toString()}_a_${(3 + (idx % 3)).toString()}_17geo_${(9 + idx)
      .toString()
      .padStart(2, '0')}`,
    spend: Number(spend.toFixed(2)),
    clicks,
    conversionRate,
    revenue: Number(revenue.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    roi: Number(roi.toFixed(2)),
    cpi: Number((0.72 + (idx % 4) * 0.06 + Math.sin(idx) * 0.03).toFixed(2)),
    installs: Math.round(6800 + idx * 520 + (idx % 4) * 140),
    status: idx % 4 === 0 ? 'paused' : 'active'
  }
})

export const MOCK_AD_PLATFORM_INFO_PAGE_DATA: AdPlatformInfoPageData = {
  summary: MOCK_AD_PLATFORM_INFO_SUMMARY,
  kpis: MOCK_AD_PLATFORM_INFO_KPIS,
  mapPoints: MOCK_AD_PLATFORM_INFO_MAP_POINTS,
  top10: MOCK_AD_PLATFORM_INFO_TOP10,
  heatmap: MOCK_AD_PLATFORM_INFO_HEATMAP,
  funnel: MOCK_AD_PLATFORM_INFO_FUNNEL,
  trend: MOCK_AD_PLATFORM_INFO_TREND,
  campaigns: MOCK_AD_PLATFORM_INFO_CAMPAIGNS,
  updatedAtText: '截止：2026-03-25 23:59'
}

/** 按广告系列 ID 生成与契约 `sampleResponse` 结构一致的 Mock（接入真实接口后删除） */
export function buildMockAdPlatformInfoPageData(sCampaignId: string): AdPlatformInfoPageData {
  const id = sCampaignId.trim() || '—'
  return {
    ...MOCK_AD_PLATFORM_INFO_PAGE_DATA,
    summary: {
      ...MOCK_AD_PLATFORM_INFO_PAGE_DATA.summary,
      subtitle: `聚合深度分析 · ${id}`
    }
  }
}

export function getAccentColor(accent: AdPlatformInfoKpiCard['accent']) {
  return ACCENT_COLORS[accent]
}
