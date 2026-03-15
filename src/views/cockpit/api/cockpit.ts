/**
 * 驾驶舱数据接口层
 *
 * - 第一排总数据（KPI 卡片）：真实接口 POST /api/v1/datacenter/analysis/cockpit/overall
 * - 其余子模块（警示、花费节奏、地图、Top3、收入趋势等）：仍走 Mock 或各自独立接口，结构清晰便于后续按模块接独立接口与骨架屏
 */
import request from '@/utils/http'
import type {
  CockpitOverview,
  CockpitOverviewParams,
  CockpitOverallResponse,
  CockpitKpiCard,
  CockpitKpiCardType,
  CockpitOverallPeriodItem,
  CockpitConsumptionRhythmResponse,
  CockpitSpendPaceItem,
  CockpitTop3Response,
  CockpitTopRevenueItem,
  CockpitTopBadReviewItem,
  CockpitTopUserItem,
  CockpitChannelRoiInstallResponse,
  CockpitChannelRoiInstallItem,
  CockpitBusinessMapApiItem,
  CockpitMapCountry,
  CockpitMapLegendItem
} from '../types'
import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

/** 是否使用 Mock 数据（仅影响非 overall 的其余概览字段）；overall 接口始终请求真实接口 */
const COCKPIT_USE_MOCK = true

/** 驾驶舱概览接口路径（其余模块对接时替换） */
const COCKPIT_OVERVIEW_URL = '/api/cockpit/overview'

/** 经营驾驶舱第一排总数据接口（KPI 卡片数据源） */
const COCKPIT_OVERALL_URL = '/api/v1/datacenter/analysis/cockpit/overall'

/** 消耗节奏监控接口（自投/代投） */
const COCKPIT_CONSUMPTION_RHYTHM_URL =
  '/api/v1/datacenter/analysis/cockpit/consumptionRhythmMonitoring'

/** Top3 数据接口（收入应用 / 差评产品 / 用户增长） */
const COCKPIT_TOP3_URL = '/api/v1/datacenter/analysis/cockpit/top3'

/** 渠道 ROI&安装量接口（消耗/安装量/CPI 取 list[0]，近 7 日折线取 list 的 7 个对象） */
const COCKPIT_CHANNEL_ROI_URL = '/api/v1/datacenter/analysis/cockpit/installAndRoiOfChannel'

/** 业务分布地图接口 */
const COCKPIT_BUSINESS_MAP_URL = '/api/v1/datacenter/analysis/cockpit/businessMap'

/** 国家中文名 → 英文名（与 public/geo/world.json 的 properties.name 一致，美国用 United States、韩国用 Korea） */
const COUNTRY_CN_TO_EN: Record<string, string> = {
  美国: 'United States',
  中国: 'China',
  日本: 'Japan',
  英国: 'United Kingdom',
  俄罗斯: 'Russia',
  巴西: 'Brazil',
  印度: 'India',
  澳大利亚: 'Australia',
  德国: 'Germany',
  法国: 'France',
  加拿大: 'Canada',
  韩国: 'Korea',
  墨西哥: 'Mexico',
  印度尼西亚: 'Indonesia',
  土耳其: 'Turkey',
  沙特阿拉伯: 'Saudi Arabia',
  南非: 'South Africa',
  意大利: 'Italy',
  西班牙: 'Spain',
  越南: 'Vietnam',
  泰国: 'Thailand',
  菲律宾: 'Philippines',
  马来西亚: 'Malaysia',
  新加坡: 'Singapore',
  香港: 'Hong Kong',
  台湾: 'Taiwan',
  荷兰: 'Netherlands',
  波兰: 'Poland',
  阿根廷: 'Argentina',
  哥伦比亚: 'Colombia',
  埃及: 'Egypt',
  尼日利亚: 'Nigeria',
  巴基斯坦: 'Pakistan',
  孟加拉国: 'Bangladesh',
  乌克兰: 'Ukraine',
  美國: 'United States',
  中國: 'China',
  英國: 'United Kingdom',
  俄羅斯: 'Russia',
  澳洲: 'Australia',
  澳大利亞: 'Australia',
  德國: 'Germany',
  法國: 'France',
  韓國: 'Korea',
  台灣: 'Taiwan',
  荷蘭: 'Netherlands',
  波蘭: 'Poland',
  烏克蘭: 'Ukraine',
  尼日利亞: 'Nigeria',
  孟加拉國: 'Bangladesh'
}

/** 按收入区间映射颜色（与 mock 色板一致），minRevenue=150, maxRevenue=8200 */
function getColorByRevenue(revenue: number, minRevenue = 150, maxRevenue = 8200): string {
  const colors = ['#f56c6c', '#e6a23c', '#E2C33D', '#409eff', '#67c23a']
  if (!Number.isFinite(revenue) || maxRevenue <= minRevenue) return colors[0]
  const t = Math.max(0, Math.min(1, (revenue - minRevenue) / (maxRevenue - minRevenue)))
  const index = Math.min(colors.length - 1, Math.floor(t * colors.length))
  return colors[index] ?? colors[0]
}

/** 将变化量格式化为趋势文案，如 "+12%"、"-5%" */
function formatChangeToTrend(change: number, lastVal: number): string {
  if (!Number.isFinite(lastVal) || lastVal === 0) return '—'
  const pct = Number.isFinite(change) ? (change / lastVal) * 100 : 0
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${Number(pct.toFixed(1))}%`
}

function formatMoney(n: number): string {
  return (
    '$' +
    (Number.isFinite(n)
      ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00')
  )
}

function formatInt(n: number): string {
  return Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '0'
}

function percentChange(curr: number, last: number): number | null {
  if (!Number.isFinite(last) || last === 0) return null
  return Number((((curr - last) / last) * 100).toFixed(1))
}

function buildCompare(lastVal: string, percent: number | null, compareUp: boolean): string {
  const arrow = compareUp ? '↑' : '↓'
  const p = percent != null ? ` ${percent >= 0 ? '+' : ''}${percent}%${arrow}` : ''
  return `上周期: ${lastVal}${p}`
}

/**
 * 将 overall 接口的 last/now 转为 KPI 卡片列表（6 项：总收入、付费收入、广告支出、有效订阅、DAU、预估利润）
 */
export function mapOverallToKpiCards(
  last: CockpitOverallPeriodItem,
  now: CockpitOverallPeriodItem
): CockpitKpiCard[] {
  const cards: {
    type: CockpitKpiCardType
    label: string
    valueKey: keyof CockpitOverallPeriodItem
    format: 'money' | 'int'
    detail?: (n: CockpitOverallPeriodItem) => string
  }[] = [
    {
      type: 'income',
      label: '总收入',
      valueKey: 'totalRevenue',
      format: 'money',
      detail: (n) => `广告: ${formatMoney(n.dAdRevenue)} | 内购: ${formatMoney(n.dIapRevenue)}`
    },
    { type: 'paidRevenue', label: '付费收入', valueKey: 'payRevenue', format: 'money' },
    {
      type: 'adSpend',
      label: '广告支出',
      valueKey: 'dCost',
      format: 'money',
      detail: (n) => `买量 ${formatInt(n.ninstalls)}  代投 ${formatMoney(n.proxyCost)}`
    },
    { type: 'subscriptions', label: '有效订阅', valueKey: 'activeSubscription', format: 'int' },
    {
      type: 'dau',
      label: 'DAU',
      valueKey: 'dau',
      format: 'int',
      detail: (n) => `新增 ${formatInt(n.nNewUserCount)}`
    },
    { type: 'profit', label: '预估利润', valueKey: 'profit', format: 'money' }
  ]
  return cards.map(({ type, label, valueKey, format, detail }) => {
    const curr = now[valueKey] as number
    const prev = last[valueKey] as number
    const value = format === 'money' ? formatMoney(curr) : formatInt(curr)
    const pct = percentChange(curr, prev)
    const compareUp = pct != null ? pct >= 0 : false
    const lastStr = format === 'money' ? formatMoney(prev) : formatInt(prev)
    return {
      type,
      label,
      value,
      detail: detail ? detail(now) : undefined,
      compare: buildCompare(lastStr, pct, compareUp),
      compareUp
    }
  })
}

/**
 * 获取经营驾驶舱第一排总数据（last/now 周期对比）
 * 请求体：{ startTime, endTime }，用于 KPI 卡片数据源
 */
export async function fetchCockpitOverall(): Promise<CockpitOverallResponse> {
  return request.post<CockpitOverallResponse>({
    url: COCKPIT_OVERALL_URL,
    data: {}
  })
}

/** 将节奏状态文案映射为 tagType（success | warning | danger） */
function statusToTagType(status: string): 'success' | 'warning' | 'danger' {
  const s = (status || '').trim()
  if (/预警|危险|超标|超支/.test(s)) return 'danger'
  if (/注意|偏快|偏慢/.test(s)) return 'warning'
  return 'success'
}

/**
 * 将消耗节奏监控接口返回的 proxy/self 转为 CockpitSpendPaceItem[]（自投在前，代投在后）
 */
export function mapConsumptionRhythmToSpendPace(
  res: CockpitConsumptionRhythmResponse
): CockpitSpendPaceItem[] {
  const toItem = (
    raw: { channel: string; status: string; total: number; used: number },
    section: 'default' | 'managed'
  ): CockpitSpendPaceItem => {
    const total = Number(raw.total) || 0
    const used = Number(raw.used) || 0
    const percent = total > 0 ? Math.min(100, (used / total) * 100) : 0
    return {
      name: raw.channel || '—',
      current: used,
      budget: total,
      percent,
      status: raw.status || '—',
      tagType: statusToTagType(raw.status),
      section
    }
  }
  const selfList = (res.self || []).map((i) => toItem(i, 'default'))
  const proxyList = (res.proxy || []).map((i) => toItem(i, 'managed'))
  return [...selfList, ...proxyList]
}

/**
 * 获取消耗节奏监控数据（自投 + 代投）
 * 请求体：空对象 {}
 */
export async function fetchConsumptionRhythmMonitoring(): Promise<CockpitConsumptionRhythmResponse> {
  return request.post<CockpitConsumptionRhythmResponse>({
    url: COCKPIT_CONSUMPTION_RHYTHM_URL,
    data: {}
  })
}

/** 将 Top3 接口 app 转为 TopRevenueItem */
function mapTop3AppToRevenue(items: CockpitTop3Response['app']): CockpitTopRevenueItem[] {
  return (items || []).map((row) => {
    const last = row.last?.dAdRevenue ?? 0
    const curr = row.now?.dAdRevenue ?? 0
    const pct = percentChange(curr, last)
    const trendPercent = pct != null ? `${pct >= 0 ? '+' : ''}${pct}%` : undefined
    return {
      name: row.sAppName || '—',
      revenue: formatMoney(curr),
      roas: row.now?.roas != null ? String(row.now.roas) : undefined,
      trendPercent
    }
  })
}

/** 将 Top3 接口 badApp 转为 TopBadReviewItem */
function mapTop3BadAppToBadReview(items: CockpitTop3Response['badApp']): CockpitTopBadReviewItem[] {
  return (items || []).map((row) => {
    const roiChange = row.roiChange ?? 0
    const dauChange = row.dauChange ?? 0
    const trend: 'up' | 'down' = roiChange >= 0 ? 'up' : 'down'
    const metricParts: string[] = []
    if (dauChange !== 0)
      metricParts.push(`DAU ${dauChange >= 0 ? '↑' : '↓'}${Math.abs(dauChange)}%`)
    if (row.now?.cpl != null && row.last?.cpl != null && row.last.cpl !== 0) {
      const cplPct = percentChange(row.now.cpl, row.last.cpl)
      if (cplPct != null) metricParts.push(`CPI ${cplPct >= 0 ? '↑' : '↓'}${Math.abs(cplPct)}%`)
    }
    return {
      name: row.sAppName || '—',
      reasonTag: row.last?.note?.trim() || (roiChange < 0 ? 'ROI 下降' : 'ROI 变化'),
      metric: metricParts.length ? metricParts.join(' ') : row.last?.note || '—',
      trend
    }
  })
}

/** 将 Top3 接口 user 转为 TopUserItem */
function mapTop3UserToUser(items: CockpitTop3Response['user']): CockpitTopUserItem[] {
  return (items || []).map((row) => {
    const last = row.last?.dau ?? 0
    const curr = row.now?.dau ?? 0
    const pct = percentChange(curr, last)
    const trendPercent = pct != null ? `${pct >= 0 ? '+' : ''}${pct}%` : undefined
    const growth = curr - last
    return {
      name: row.sAppName || '—',
      dau: formatInt(curr),
      growth: growth !== 0 ? `${growth >= 0 ? '+' : ''}${formatInt(growth)}` : undefined,
      trendPercent
    }
  })
}

/**
 * 将 Top3 接口响应转为 overview 所需的 topRevenue / topBadReview / topUser
 */
export function mapTop3ResponseToOverview(res: CockpitTop3Response | null): {
  topRevenue: CockpitTopRevenueItem[]
  topBadReview: CockpitTopBadReviewItem[]
  topUser: CockpitTopUserItem[]
} {
  if (!res) return { topRevenue: [], topBadReview: [], topUser: [] }
  return {
    topRevenue: mapTop3AppToRevenue(Array.isArray(res.app) ? res.app : []),
    topBadReview: mapTop3BadAppToBadReview(Array.isArray(res.badApp) ? res.badApp : []),
    topUser: mapTop3UserToUser(Array.isArray(res.user) ? res.user : [])
  }
}

/**
 * 获取 Top3 数据（收入应用、差评产品、用户增长）
 * 请求体：空对象 {}
 */
export async function fetchCockpitTop3(): Promise<CockpitTop3Response> {
  return request.post<CockpitTop3Response>({
    url: COCKPIT_TOP3_URL,
    data: {}
  })
}

/**
 * 将渠道 ROI&安装量接口数据转为表格/折线用结构
 * - 渠道名称：使用 channel 字段
 * - 消耗、安装量、CPI：使用 list 数组中索引为 0 的对象（list[0]）的 cost、install、cpl（接口可能返回 null，已做兼容）
 * - 近七日折线图：使用 list 中每日的 install（安装量）按顺序组成 trend 数组
 */
export function mapChannelRoiInstallToItems(
  data: CockpitChannelRoiInstallResponse | null
): CockpitChannelRoiInstallItem[] {
  if (!Array.isArray(data) || !data.length) return []
  const num = (v: unknown) => (v != null && Number.isFinite(Number(v)) ? Number(v) : 0)
  return data.map((row) => {
    const list = row.list ?? []
    const first = list[0] ?? { cost: null, cpl: null, install: null }
    const trend = list.map((d) => num(d.install))
    return {
      channel: row.channel ?? '—',
      spend: num(first.cost),
      installs: num(first.install),
      cpi: num(first.cpl),
      trend
    }
  })
}

/**
 * 获取渠道 ROI&安装量（经营驾驶舱大屏 渠道ROI&安装量）
 * 请求体：空对象 {}
 */
export async function fetchChannelRoiInstall(): Promise<CockpitChannelRoiInstallResponse> {
  return request.post<CockpitChannelRoiInstallResponse>({
    url: COCKPIT_CHANNEL_ROI_URL,
    data: {}
  })
}

/**
 * 将业务分布地图后端 data[] 转为与 mock mapCountries 一致的结构
 * 仅输出能映射到 world.json 的国家（nameEn 有效）
 */
export function mapBusinessMapToMapCountries(
  data: CockpitBusinessMapApiItem[] | null
): CockpitMapCountry[] {
  if (!Array.isArray(data) || !data.length) return []
  const list: CockpitMapCountry[] = []
  const num = (v: unknown) => (v != null && Number.isFinite(Number(v)) ? Number(v) : 0)
  data.forEach((item) => {
    const countryKey = (item.country ?? '').trim()
    const nameEn = COUNTRY_CN_TO_EN[countryKey]
    if (!nameEn) return
    const { last, now } = item
    const revenue = num(now.dAdRevenue)
    const spend = num(now.dCost)
    const user = num(now.nActiveUserCount)
    const trend =
      item.dAdRevenueChange != null
        ? formatChangeToTrend(num(item.dAdRevenueChange), num(last.dAdRevenue))
        : formatChangeToTrend(revenue - num(last.dAdRevenue), num(last.dAdRevenue))
    const newUser = now.nNewUserCount
    const newUserTrend =
      item.nNewUserCountChange != null
        ? formatChangeToTrend(num(item.nNewUserCountChange), num(last.nNewUserCount))
        : formatChangeToTrend(
            num(now.nNewUserCount) - num(last.nNewUserCount),
            num(last.nNewUserCount)
          )
    const spendTrendVal =
      item.dCostChange != null
        ? formatChangeToTrend(num(item.dCostChange), num(last.dCost))
        : formatChangeToTrend(spend - num(last.dCost), num(last.dCost))
    const userTrendVal =
      item.nActiveUserCountChange != null
        ? formatChangeToTrend(num(item.nActiveUserCountChange), num(last.nActiveUserCount))
        : formatChangeToTrend(user - num(last.nActiveUserCount), num(last.nActiveUserCount))
    const ecpmVal = num((now as { eCPM?: number }).eCPM ?? (now as { ecpm?: number }).ecpm)
    const lastEcpm = num((last as { eCPM?: number }).eCPM ?? (last as { ecpm?: number }).ecpm)
    const ecpmTrend =
      item.eCPMChange != null
        ? formatChangeToTrend(num(item.eCPMChange), lastEcpm)
        : formatChangeToTrend(ecpmVal - lastEcpm, lastEcpm)
    list.push({
      nameEn,
      name: countryKey || '—',
      revenue,
      spend,
      user,
      trend,
      color: getColorByRevenue(revenue, 150, 8200),
      newUser,
      newUserTrend: newUserTrend === '—' ? undefined : newUserTrend,
      spendTrend: spendTrendVal === '—' ? undefined : spendTrendVal,
      userTrend: userTrendVal === '—' ? undefined : userTrendVal,
      ecpm: Number.isFinite(ecpmVal) ? ecpmVal : undefined,
      ecpmTrend: ecpmTrend === '—' ? undefined : ecpmTrend
    })
  })
  return list
}

/**
 * 从 mapCountries 生成图例（按收入取前 5，与 mock mapLegend 结构一致）
 */
export function mapCountriesToLegend(
  mapCountries: CockpitMapCountry[],
  maxItems = 5
): CockpitMapLegendItem[] {
  const sorted = [...mapCountries].sort((a, b) => b.revenue - a.revenue).slice(0, maxItems)
  return sorted.map((item) => ({
    name: item.name,
    value: item.revenue >= 1000 ? `$${(item.revenue / 1000).toFixed(1)}M` : `$${item.revenue}K`,
    trend: item.trend,
    color: item.color ?? '#67c23a'
  }))
}

/**
 * 获取业务分布地图数据，请求体：空对象 {}
 */
export async function fetchCockpitBusinessMap(): Promise<CockpitBusinessMapApiItem[]> {
  return request.post<CockpitBusinessMapApiItem[]>({
    url: COCKPIT_BUSINESS_MAP_URL,
    data: {}
  })
}

/**
 * 获取驾驶舱全量数据
 * - KPI 卡片：来自真实接口 fetchCockpitOverall，与 dateRange 换算的 startTime/endTime 在 useCockpitData 中调用
 * - 其余模块：Mock 或后续各子模块独立接口
 */
export async function fetchCockpitOverview(
  params?: CockpitOverviewParams
): Promise<CockpitOverview> {
  if (COCKPIT_USE_MOCK) {
    return Promise.resolve({ ...MOCK_COCKPIT_OVERVIEW })
  }

  const res = await request.get<CockpitOverview>({
    url: COCKPIT_OVERVIEW_URL,
    params: params ?? {}
  })
  return res
}
