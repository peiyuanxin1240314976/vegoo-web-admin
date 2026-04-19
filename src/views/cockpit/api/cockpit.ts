/**
 * 驾驶舱数据接口层
 *
 * - 第一排总数据（KPI 卡片）：真实接口 POST /api/v1/datacenter/analysis/cockpit/overall
 * - Top3：POST `.../cockpit/top3`（`fetchCockpitTop3`）。
 * - 无聚合 `cockpit/overview` / `today-summary-cards` / `yesterday-summary-panel` 时：`fetchCockpitOverview` 与 Tab 专属 fetch 返回空壳/空数组，数据由各子接口与 `overall` 合并。
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type {
  CockpitOverview,
  CockpitOverviewParams,
  CockpitOverallData,
  CockpitOverallDataPeriod,
  CockpitOverallApiResponse,
  CockpitOverallSeriesItem,
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
  CockpitMapLegendItem,
  CockpitRevenueStructureFlow,
  CockpitRevenueStructureNode,
  CockpitRevenueStructureLink,
  CockpitRevenueStructureInsight,
  CockpitAlertBanner,
  CockpitAlertSummaryMetric,
  CockpitTodaySummaryCard,
  CockpitYesterdaySummarySection,
  CockpitWarnListItem,
  CockpitAppSimulationParams,
  CockpitAppSimulationData,
  CountryInfoChannelLaunchItem,
  CountryInfoAppLaunchItem,
  CountryInfoLtvData,
  CountryInfoOverallData,
  CountryInfoRemainData,
  CountryInfoRemainDataItem,
  CountryInfoTop5CampaignItem,
  CountryInfoUserPayLaunchData
} from '../types'

/** 无 `cockpit/overview` 时首屏 merge 用空壳（不发无效聚合请求） */
const EMPTY_COCKPIT_OVERVIEW: CockpitOverview = {
  kpi: [],
  alertBanners: [],
  revenueCostTrend: { dates: [], revenue: [], cost: [] },
  userQuality: [],
  spendPace: [],
  mapCountries: [],
  mapLegend: [],
  topRevenue: [],
  topSpend: [],
  topUser: [],
  smartAlerts: [],
  top5Apps: [],
  top10Campaigns: []
}

/** 经营驾驶舱第一排总数据接口（KPI 卡片数据源） */
const COCKPIT_OVERALL_URL = `${ANALYSIS_API_BASE}/cockpit/overall`

/** 国家详情第一排总数据接口（地图进入国家详情页顶部卡片） */
const COUNTRY_INFO_OVERALL_URL = `${ANALYSIS_API_BASE}/countryInfo/overall`

/** 国家详情当前投放中 Campaign Top5 接口 */
const COUNTRY_INFO_TOP5_CAMPAIGN_URL = `${ANALYSIS_API_BASE}/countryInfo/top5Campaign`

/** 国家详情各 APP 表现接口 */
const COUNTRY_INFO_APP_LAUNCH_URL = `${ANALYSIS_API_BASE}/countryInfo/appLaunch`

/** 国家详情用户留存曲线接口 */
const COUNTRY_INFO_REMAIN_URL = `${ANALYSIS_API_BASE}/countryInfo/remain`

/** 国家详情用户分层接口 */
const COUNTRY_INFO_USER_PAY_LAUNCH_URL = `${ANALYSIS_API_BASE}/countryInfo/userPayLaunch`

/** 国家详情广告平台投放效果对比接口 */
const COUNTRY_INFO_CHANNEL_LAUNCH_URL = `${ANALYSIS_API_BASE}/countryInfo/channelLaunch`

/** 国家详情 LTV 预测接口 */
const COUNTRY_INFO_LTV_URL = `${ANALYSIS_API_BASE}/countryInfo/ltv`

export interface CountryInfoQueryParams {
  countryCode: string
  startDate: string
  endDate: string
}

function buildCountryInfoQueryParams(
  params?: Partial<CountryInfoQueryParams>
): CountryInfoQueryParams {
  return {
    countryCode: params?.countryCode ?? '',
    startDate: params?.startDate ?? '',
    endDate: params?.endDate ?? ''
  }
}

/** 消耗节奏监控接口（自投/代投） */
const COCKPIT_CONSUMPTION_RHYTHM_URL = `${ANALYSIS_API_BASE}/cockpit/consumptionRhythmMonitoring`

/** Top3 数据接口（收入应用 / 差评产品 / 用户增长） */
const COCKPIT_TOP3_URL = `${ANALYSIS_API_BASE}/cockpit/top3`

/** 广告平台 ROI&安装量接口（消耗/安装量/CPI 取 list[0]，近 7 日折线取 list 的 7 个对象） */
const COCKPIT_CHANNEL_ROI_URL = `${ANALYSIS_API_BASE}/cockpit/installAndRoiOfChannel`

/** 业务分布地图接口 */
const COCKPIT_BUSINESS_MAP_URL = `${ANALYSIS_API_BASE}/cockpit/businessMap`

/** 收入结构接口（近7日收入结构流向桑基图） */
const COCKPIT_INCOME_STRUCTURE_URL = `${ANALYSIS_API_BASE}/cockpit/incomeStructure`

/** 情景模拟接口 */
const COCKPIT_APP_SIMULATION_URL = `${ANALYSIS_API_BASE}/cockpit/appSimulation`

/** 收入结构接口单项（/api/v1/datacenter/analysis/cockpit/incomeStructure） */
interface CockpitIncomeStructureRow {
  app?: string
  country?: string
  dAdRevenue?: number
  dIapRevenue?: number
}

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

/** 国家中文名 → ISO 3166-1 alpha-2（小写），用于收入结构桑基图国旗展示 */
const COUNTRY_CN_TO_ISO: Record<string, string> = {
  美国: 'us',
  中國: 'cn',
  中国: 'cn',
  日本: 'jp',
  英国: 'gb',
  英國: 'gb',
  俄罗斯: 'ru',
  俄羅斯: 'ru',
  巴西: 'br',
  印度: 'in',
  澳大利亚: 'au',
  澳大利亞: 'au',
  澳洲: 'au',
  德国: 'de',
  德國: 'de',
  法国: 'fr',
  法國: 'fr',
  加拿大: 'ca',
  韩国: 'kr',
  韓國: 'kr',
  墨西哥: 'mx',
  印度尼西亚: 'id',
  土耳其: 'tr',
  沙特阿拉伯: 'sa',
  南非: 'za',
  意大利: 'it',
  西班牙: 'es',
  越南: 'vn',
  泰国: 'th',
  菲律宾: 'ph',
  马来西亚: 'my',
  新加坡: 'sg',
  香港: 'hk',
  台湾: 'tw',
  台灣: 'tw',
  荷兰: 'nl',
  荷蘭: 'nl',
  波兰: 'pl',
  波蘭: 'pl',
  阿根廷: 'ar',
  哥伦比亚: 'co',
  埃及: 'eg',
  尼日利亚: 'ng',
  尼日利亞: 'ng',
  巴基斯坦: 'pk',
  孟加拉国: 'bd',
  孟加拉國: 'bd',
  乌克兰: 'ua',
  烏克蘭: 'ua'
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

/** 金额格式化，null/undefined 按 0 展示 */
function formatMoney(n: number | null | undefined): string {
  const val = n == null ? 0 : n
  return (
    '$' +
    (Number.isFinite(val)
      ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00')
  )
}

/** 整数格式化，null/undefined 按 0 展示 */
function formatInt(n: number | null | undefined): string {
  const val = n == null ? 0 : n
  return Number.isFinite(val) ? Math.round(val).toLocaleString('en-US') : '0'
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

/** 将后端 *List 转为 number[]，用于 KPI 迷你折线 */
function seriesToChartData(list: CockpitOverallSeriesItem[] | undefined): number[] {
  if (!Array.isArray(list) || list.length === 0) return []
  return list.map((item) => (typeof item === 'number' ? item : (item && Number(item.value)) || 0))
}

/** 用后端返回的 change 生成对比文案（上升/下降直接使用，不再前端计算） */
function buildCompareFromChange(
  change: number | undefined,
  lastVal: string,
  format: 'money' | 'int'
): { compare: string; compareUp: boolean } {
  const hasChange = change != null && Number.isFinite(change)
  const compareUp = !hasChange || change >= 0
  const changeStr = hasChange
    ? format === 'money'
      ? formatMoney(change)
      : (change >= 0 ? '+' : '') + formatInt(change)
    : ''
  const compare = changeStr
    ? `上周期: ${lastVal} 较上期 ${changeStr}${compareUp ? '↑' : '↓'}`
    : `上周期: ${lastVal}`
  return { compare, compareUp }
}

function pickFirstNumber(obj: unknown, keys: string[]): number {
  if (obj == null || typeof obj !== 'object') return 0
  const record = obj as Record<string, unknown>
  for (const k of keys) {
    const v = record[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string') {
      const n = Number(v)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

/**
 * 将 overall 新接口的 data（now + *Change + *List）转为 KPI 卡片列表
 * 展示用 now，升降用后端 *Change，折线用 *List
 */
export function mapOverallDataToKpiCards(data: CockpitOverallData): CockpitKpiCard[] {
  const now = data.now
  const last = data.last
  const cards: {
    type: CockpitKpiCardType
    label: string
    valueKey: keyof CockpitOverallDataPeriod
    format: 'money' | 'int'
    changeKey?: keyof CockpitOverallData
    listKey?: keyof CockpitOverallData
    detail?: (n: CockpitOverallDataPeriod) => string | undefined
  }[] = [
    {
      type: 'income',
      label: '总收入',
      valueKey: 'totalRevenue',
      format: 'money',
      changeKey: 'totalRevenueChange',
      listKey: 'totalRevenueList',
      detail: (n) => {
        const ad = (n as { dAdRevenue?: number; adRevenue?: number }).dAdRevenue ?? n.adRevenue ?? 0
        return `广告 ${formatMoney(ad)}  付费 ${formatMoney(n.payRevenue ?? 0)}`
      }
    },
    {
      type: 'paidRevenue',
      label: '付费收入',
      valueKey: 'payRevenue',
      format: 'money',
      changeKey: 'payRevenueChange',
      listKey: 'payRevenueList',
      detail: () => '未扣平台费用'
    },
    {
      type: 'adSpend',
      label: '广告支出',
      valueKey: 'dCost',
      format: 'money',
      changeKey: 'dCostChange',
      listKey: 'dCostList',
      detail: () => undefined
    },
    {
      type: 'subscriptions',
      label: '有效订阅',
      valueKey: 'activeSubscription',
      format: 'int',
      changeKey: 'activeSubscriptionChange',
      listKey: 'activeSubscriptionList',
      detail: () => {
        const inc = pickFirstNumber(data, ['activeSubscriptionNew'])
        const dec = pickFirstNumber(data, ['activeSubscriptionLost'])
        return `新增 +${formatInt(inc)}  流失 -${formatInt(dec)}`
      }
    },
    {
      type: 'dau',
      label: '新用户',
      valueKey: 'dau',
      format: 'int',
      changeKey: 'dauChange',
      listKey: 'dauList',
      detail: () => {
        const dnu = formatInt(now.dnu)
        const change = data.dnuChange
        const hasChange = change != null && Number.isFinite(change)
        return hasChange ? `DNU ${dnu}` : `DNU ${dnu}`
      }
    },
    {
      type: 'profit',
      label: '预估利润',
      valueKey: 'profit',
      format: 'money',
      changeKey: 'profitChange',
      listKey: 'profitList',
      detail: () => '当前广告｜付费收入-广告支出'
    }
  ]
  return cards.map(({ type, label, valueKey, format, changeKey, listKey, detail }) => {
    const curr = (now[valueKey] as number | null | undefined) ?? 0
    const prev = (last[valueKey] as number | null | undefined) ?? 0
    const value = format === 'money' ? formatMoney(curr) : formatInt(curr)
    const lastStr = format === 'money' ? formatMoney(prev) : formatInt(prev)
    const change =
      type === 'adSpend'
        ? (data.dCostChange ?? data.adCostChange)
        : changeKey
          ? (data[changeKey] as number | undefined)
          : undefined
    const { compare, compareUp } = buildCompareFromChange(change, lastStr, format)
    const chartData = listKey
      ? seriesToChartData(data[listKey] as CockpitOverallSeriesItem[] | undefined)
      : undefined
    const subItems =
      type === 'adSpend'
        ? [
            {
              label: '自投',
              value: formatMoney(Math.max(0, (now.dCost ?? 0) - (now.proxyCost ?? 0))),
              tone: 'default' as const
            },
            { label: '代投', value: formatMoney(now.proxyCost ?? 0), tone: 'info' as const }
          ]
        : undefined
    const detailChange =
      type === 'dau' && data.dnuChange != null && Number.isFinite(data.dnuChange)
        ? `${data.dnuChange >= 0 ? '↑' : '↓'} ${formatInt(Math.abs(data.dnuChange))}`
        : undefined
    const detailTrend =
      type === 'dau' && data.dnuChange != null && Number.isFinite(data.dnuChange)
        ? data.dnuChange >= 0
          ? 'up'
          : 'down'
        : undefined
    return {
      type,
      label,
      value,
      detail: detail ? detail(now) : undefined,
      detailChange,
      detailTrend,
      subItems,
      compare,
      compareUp,
      chartData: chartData?.length ? chartData : undefined
    }
  })
}

/**
 * 从 overall 接口的 now + *Change 组装警示摘要指标（DNU、自然量、买量用户、广告系列、广告账户）
 * 返回 null 的字段默认按 0 展示
 */
export function mapOverallDataToAlertSummaryMetrics(
  data: CockpitOverallData
): CockpitAlertSummaryMetric[] {
  const now = data.now
  const metrics: CockpitAlertSummaryMetric[] = []

  // DNU：取值 now.dnu，null 按 0 展示；变化 dnuChange
  const dnuChange = data.dnuChange
  metrics.push({
    label: '新用户',
    value: formatInt(now.dnu),
    ...(dnuChange != null && Number.isFinite(dnuChange)
      ? { change: Math.abs(dnuChange), trend: (dnuChange >= 0 ? 'up' : 'down') as 'up' | 'down' }
      : {})
  })

  // 自然量：取值 now.naturalCount，null 按 0 展示
  const naturalCountChange = data.naturalCountChange
  metrics.push({
    label: '自然量',
    value: formatInt(now.naturalCount),
    ...(naturalCountChange != null && Number.isFinite(naturalCountChange)
      ? {
          change: Math.abs(naturalCountChange),
          trend: (naturalCountChange >= 0 ? 'up' : 'down') as 'up' | 'down'
        }
      : {})
  })

  // 买量用户：取值 now.initialCount，null 按 0 展示
  const initialCountChange = data.initialCountChange
  metrics.push({
    label: '买量用户',
    value: `${formatInt(now.initialCount)}个`,
    ...(initialCountChange != null && Number.isFinite(initialCountChange)
      ? {
          change: Math.abs(initialCountChange),
          trend: (initialCountChange >= 0 ? 'up' : 'down') as 'up' | 'down'
        }
      : {})
  })

  // 广告系列：取值 now.adGroupCount，null 按 0 展示
  const adGroupCountChange = data.adGroupCountChange
  metrics.push({
    label: '广告系列',
    value: `${formatInt(now.adGroupCount)}个`,
    ...(adGroupCountChange != null && Number.isFinite(adGroupCountChange)
      ? {
          change: Math.abs(adGroupCountChange),
          trend: (adGroupCountChange >= 0 ? 'up' : 'down') as 'up' | 'down'
        }
      : {})
  })

  // 广告账户：取值 now.adAccountCount，null 按 0 展示
  const adAccountCountChange = data.adAccountCountChange
  metrics.push({
    label: '广告账户',
    value: `${formatInt(now.adAccountCount)}个`,
    ...(adAccountCountChange != null && Number.isFinite(adAccountCountChange)
      ? {
          change: Math.abs(adAccountCountChange),
          trend: (adAccountCountChange >= 0 ? 'up' : 'down') as 'up' | 'down'
        }
      : {})
  })

  return metrics
}

/** overall 接口 warnList：type 1=warning 2=opportunity 3=risk → 组件用 type + text */
const WARN_TYPE_MAP: Record<1 | 2 | 3, CockpitAlertBanner['type']> = {
  1: 'warning',
  2: 'opportunity',
  3: 'risk'
}

export function mapWarnListToAlertBanners(warnList: CockpitWarnListItem[]): CockpitAlertBanner[] {
  if (!Array.isArray(warnList) || warnList.length === 0) return []
  return warnList.map((item: CockpitWarnListItem) => {
    const type = WARN_TYPE_MAP[item.type as 1 | 2 | 3] ?? 'warning'
    return { type, text: item.msg ?? '', suggestion: '' }
  })
}

/**
 * 将 overall 接口的 last/now 转为 KPI 卡片列表（旧结构兼容，6 项）
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
    subItems?: (n: CockpitOverallPeriodItem) => CockpitKpiCard['subItems']
  }[] = [
    {
      type: 'income',
      label: '总收入',
      valueKey: 'totalRevenue',
      format: 'money',
      detail: (n) =>
        `广告 ${formatMoney(n.dAdRevenue ?? 0)}  付费 ${formatMoney(n.dIapRevenue ?? 0)}`
    },
    {
      type: 'paidRevenue',
      label: '付费收入',
      valueKey: 'payRevenue',
      format: 'money',
      detail: () => '未扣平台费用'
    },
    {
      type: 'adSpend',
      label: '广告支出',
      valueKey: 'dCost',
      format: 'money',
      subItems: (n) => [
        {
          label: '自投',
          value: formatMoney(Math.max(0, (n.dCost ?? 0) - (n.proxyCost ?? 0))),
          tone: 'default'
        },
        { label: '代投', value: formatMoney(n.proxyCost ?? 0), tone: 'info' }
      ]
    },
    {
      type: 'subscriptions',
      label: '有效订阅',
      valueKey: 'activeSubscription',
      format: 'int',
      detail: (n) => {
        const inc = pickFirstNumber(n, ['activeSubscriptionNew'])
        const dec = pickFirstNumber(n, ['activeSubscriptionLost'])
        return `新增 +${formatInt(inc)}  流失 -${formatInt(dec)}`
      }
    },
    {
      type: 'dau',
      label: 'DAU',
      valueKey: 'dau',
      format: 'int',
      detail: (n) => `DNU ${formatInt(n.nNewUserCount)}`
    },
    {
      type: 'profit',
      label: '预估利润',
      valueKey: 'profit',
      format: 'money',
      detail: () => '当前广告｜付费收入-广告支出'
    }
  ]
  return cards.map(({ type, label, valueKey, format, detail, subItems }) => {
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
      subItems: subItems ? subItems(now) : undefined,
      compare: buildCompare(lastStr, pct, compareUp),
      compareUp
    }
  })
}

/**
 * 获取经营驾驶舱第一排总数据（新结构：code/data，data 含 now、*Change、*List，供 KPI + 警示同接口）
 * 请求体：{ date: 'YYYY-MM-DD' }（若不传则按 {} 兜底）
 */
export async function fetchCockpitOverall(params?: {
  date?: string
}): Promise<CockpitOverallApiResponse> {
  return request.post<CockpitOverallApiResponse>({
    url: COCKPIT_OVERALL_URL,
    data: params?.date ? { date: params.date } : {}
  })
}

/**
 * 情景模拟分析 POST /api/v1/datacenter/analysis/cockpit/appSimulation
 * 注意：request 层返回的是 res.data.data，即接口的 data 字段
 */
export async function fetchAppSimulation(
  params: CockpitAppSimulationParams
): Promise<CockpitAppSimulationData> {
  return request.post<CockpitAppSimulationData>({
    url: COCKPIT_APP_SIMULATION_URL,
    data: params
  })
}

/** 国家详情页顶部卡片项（与 MapDetailStatsCards 的 StatCardItem 一致） */
export interface CountryInfoStatCardItem {
  label: string
  value: string
  compare: string
  compareUp: boolean
  bgClass: string
}

/**
 * 将国家详情 overall 接口的 data 转为顶部 5 张卡片（广告收入、广告支出、ROI、DAU、新增用户）
 * @param periodLabel 与页头范围按钮一致：如「昨天」「过去7天」「本月」，用于对比文案「vs昨天」等；不传则用「上周期」
 */
export function mapCountryInfoOverallToStatCards(
  data: CountryInfoOverallData,
  periodLabel?: string
): CountryInfoStatCardItem[] {
  const now = data.now
  const last = data.last
  const cycleText = periodLabel ?? '上周期'
  const fmtPct = (change: number | undefined): string => {
    if (change == null || !Number.isFinite(change)) return '—'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${Number(change).toFixed(1)}%`
  }
  const compareStr = (change: number | undefined, up: boolean): string => {
    const pct = fmtPct(change)
    return pct === '—' ? `${cycleText}数据` : `${up ? '↑' : '↓'}${pct} vs${cycleText}`
  }
  return [
    {
      label: '广告收入 (Ad Revenue)',
      value: formatMoney(now?.dAdRevenue),
      compare: compareStr(data.dAdRevenueChange, (data.dAdRevenueChange ?? 0) >= 0),
      compareUp: (data.dAdRevenueChange ?? 0) >= 0,
      bgClass: 'bg-green'
    },
    {
      label: '广告支出 (Ad Spend)',
      value: formatMoney(now?.dCost),
      compare: compareStr(data.dCostChange, (data.dCostChange ?? 0) >= 0),
      compareUp: (data.dCostChange ?? 0) >= 0,
      bgClass: 'bg-orange'
    },
    {
      label: 'ROI',
      value: now?.roi != null ? String(Number(now.roi).toFixed(2)) : '0.00',
      compare: compareStr(data.roiChange, (data.roiChange ?? 0) >= 0),
      compareUp: (data.roiChange ?? 0) >= 0,
      bgClass: 'bg-blue'
    },
    {
      label: '活跃用户 DAU',
      value: formatInt(now?.dau),
      compare: compareStr(data.dauChange, (data.dauChange ?? 0) >= 0),
      compareUp: (data.dauChange ?? 0) >= 0,
      bgClass: 'bg-purple'
    },
    {
      label: '新增用户',
      value: formatInt(now?.nNewUserCount),
      compare: compareStr(last?.nNewUserCountChange, (last?.nNewUserCountChange ?? 0) >= 0),
      compareUp: (last?.nNewUserCountChange ?? 0) >= 0,
      bgClass: 'bg-green'
    }
  ]
}

/**
 * 获取国家详情第一排总数据（顶部卡片）
 * 请求体：空对象 {}；若后端需要国家维度可传 { countryCode: string }
 * 注意：http 层成功时返回的是接口的 data 字段，即 CountryInfoOverallData
 */
export async function fetchCountryInfoOverall(params?: {
  countryCode?: string
  startDate?: string
  endDate?: string
}): Promise<CountryInfoOverallData> {
  return request.post<CountryInfoOverallData>({
    url: COUNTRY_INFO_OVERALL_URL,
    data: buildCountryInfoQueryParams(params)
  })
}

/**
 * 获取国家详情当前投放中 Campaign Top5
 * POST /api/v1/datacenter/analysis/countryInfo/top5Campaign，请求体：{}
 * 返回 data 数组，项为 { cost, install, roi, campaign } 等
 */
export async function fetchCountryInfoTop5Campaign(
  params?: Partial<CountryInfoQueryParams>
): Promise<CountryInfoTop5CampaignItem[]> {
  return request.post<CountryInfoTop5CampaignItem[]>({
    url: COUNTRY_INFO_TOP5_CAMPAIGN_URL,
    data: buildCountryInfoQueryParams(params)
  })
}

/**
 * 获取国家详情各 APP 表现
 * POST /api/v1/datacenter/analysis/countryInfo/appLaunch，请求体：{}
 * 返回 data 数组，项为 { app, arpu, dAdRevenue, dIapRevenue, remainDay1 }
 */
export async function fetchCountryInfoAppLaunch(
  params?: Partial<CountryInfoQueryParams>
): Promise<CountryInfoAppLaunchItem[]> {
  return request.post<CountryInfoAppLaunchItem[]>({
    url: COUNTRY_INFO_APP_LAUNCH_URL,
    data: buildCountryInfoQueryParams(params)
  })
}

/**
 * 获取国家详情广告平台投放效果对比
 * POST /api/v1/datacenter/analysis/countryInfo/channelLaunch，请求体：{}
 * 返回 data 数组，项为 { now, last, cplChange [, channel] }
 */
export async function fetchCountryInfoChannelLaunch(
  params?: Partial<CountryInfoQueryParams>
): Promise<CountryInfoChannelLaunchItem[]> {
  return request.post<CountryInfoChannelLaunchItem[]>({
    url: COUNTRY_INFO_CHANNEL_LAUNCH_URL,
    data: buildCountryInfoQueryParams(params)
  })
}

/** 广告平台投放表格行（与 map-detail-spend-panel ChannelRow 一致） */
export interface ChannelLaunchRow {
  channel: string
  spend: number
  installs: number
  cpi: number
  roi: number
  roas: string
  trend: string
  trendClass: 'trend-up' | 'trend-right' | 'trend-down' | 'trend-empty'
}

/** 根据 cplChange 返回趋势符号与样式类 */
function getCplChangeTrend(cplChange: number | null): {
  trend: string
  trendClass: ChannelLaunchRow['trendClass']
} {
  if (cplChange === null || cplChange === undefined)
    return { trend: '—', trendClass: 'trend-empty' }
  if (cplChange > 0) return { trend: '↑', trendClass: 'trend-up' }
  if (cplChange < 0) return { trend: '↓', trendClass: 'trend-down' }
  return { trend: '→', trendClass: 'trend-right' }
}

/** 将 channelLaunch 接口 data 转为广告平台投放效果对比表格行（仅展示 now） */
export function mapChannelLaunchToChannelRows(
  list: CountryInfoChannelLaunchItem[]
): ChannelLaunchRow[] {
  return list.map((item, index) => {
    const now = item.now || {}
    const cost = Number(now.cost) || 0
    const install = Number(now.install) || 0
    const cpl = Number(now.cpl ?? now.cpi) || 0
    const roi = Number(now.roi) || 0
    const roas = now.roas != null ? Number(now.roas) : 0
    const { trend, trendClass } = getCplChangeTrend(item.cplChange)
    return {
      channel: item.sourceName ?? item.channel ?? `广告平台${index + 1}`,
      spend: cost,
      installs: install,
      cpi: cpl,
      roi,
      roas: roas >= 0 ? `${roas.toFixed(2)}x` : '—',
      trend,
      trendClass
    }
  })
}

/**
 * 获取国家详情用户留存曲线
 * POST /api/v1/datacenter/analysis/countryInfo/remain，请求体：{}
 * 返回 data：{ currentCountry: { day1, day3, day7, day14, day30 }, globalAvg: { ... } }
 */
export async function fetchCountryInfoRemain(
  params?: Partial<CountryInfoQueryParams>
): Promise<CountryInfoRemainData> {
  return request.post<CountryInfoRemainData>({
    url: COUNTRY_INFO_REMAIN_URL,
    data: buildCountryInfoQueryParams(params)
  })
}

/** 将单条留存项转为图表 series [D1, D3, D7, D14, D30]，null 转为 0 */
function remainItemToSeries(item: CountryInfoRemainDataItem): number[] {
  return [item.day1 ?? 0, item.day3 ?? 0, item.day7 ?? 0, item.day14 ?? 0, item.day30 ?? 0]
}

/** 将 remain 接口 data 转为图表的本地区 + 全局平均两条曲线 */
export function mapRemainDataToSeries(data: CountryInfoRemainData): {
  local: number[]
  global: number[]
} {
  return {
    local: remainItemToSeries(data.currentCountry),
    global: remainItemToSeries(data.globalAvg)
  }
}

/**
 * 获取国家详情 LTV 预测
 * POST /api/v1/datacenter/analysis/countryInfo/ltv，请求体：{}
 * 返回 data：{ d7, d30, d90, d180, days }（days 为预计回收周期天数）
 */
export async function fetchCountryInfoLtv(
  params?: Partial<CountryInfoQueryParams>
): Promise<CountryInfoLtvData> {
  return request.post<CountryInfoLtvData>({
    url: COUNTRY_INFO_LTV_URL,
    data: buildCountryInfoQueryParams(params)
  })
}

/** 将 ltv 接口 data 转为图表柱状数据 + 头部说明文案 */
export function mapLtvToChart(data: CountryInfoLtvData): { data: number[]; note: string } {
  const dataArr = [
    Number(data.d7) || 0,
    Number(data.d30) || 0,
    Number(data.d90) || 0,
    Number(data.d180) || 0
  ]
  const days = data.days != null ? Number(data.days) : 0
  const note = `预计回收周期: ${days}天`
  return { data: dataArr, note }
}

/**
 * 获取国家详情用户分层（用户分层饼图 + 付费转化率文案）
 * POST /api/v1/datacenter/analysis/countryInfo/userPayLaunch，请求体：{}
 */
export async function fetchCountryInfoUserPayLaunch(
  params?: Partial<CountryInfoQueryParams>
): Promise<CountryInfoUserPayLaunchData> {
  return request.post<CountryInfoUserPayLaunchData>({
    url: COUNTRY_INFO_USER_PAY_LAUNCH_URL,
    data: buildCountryInfoQueryParams(params)
  })
}

/** 用户分层饼图单项（与 map-detail-segment-chart SegmentItem 一致） */
export interface UserPayLaunchSegmentItem {
  name: string
  value: number
}

/** 将 userPayLaunch 接口 data 转为用户分层饼图数据 + 底部说明文案 */
export function mapUserPayLaunchToSegment(data: CountryInfoUserPayLaunchData): {
  segmentData: UserPayLaunchSegmentItem[]
  note: string
} {
  const activeFree = Number(data.freeAndActiveUserCount) || 0
  const freeTotal = Number(data.freeUserCount) || 0
  const pay = Number(data.payUserCount) || 0
  const riskFree = Math.max(0, freeTotal - activeFree)
  const segmentData: UserPayLaunchSegmentItem[] = [
    { name: '活跃免费', value: activeFree },
    { name: '流失风险', value: riskFree },
    { name: '付费用户', value: pay }
  ]
  const rate = Number(data.payConversionRate) || 0
  const globalRate = Number(data.payConversionGlobalAvgRate) || 0
  const ratePct = rate <= 1 && rate >= 0 ? rate * 100 : rate
  const globalPct = globalRate <= 1 && globalRate >= 0 ? globalRate * 100 : globalRate
  const note = `付费转化率 ${ratePct.toFixed(1)}% (vs 全局 ${globalPct.toFixed(1)}%)`
  return { segmentData, note }
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
    const lastNote =
      row.last && typeof row.last === 'object' && 'note' in row.last
        ? String((row.last as { note?: unknown }).note ?? '')
        : ''
    const note = (row.note?.trim() || lastNote.trim()) ?? ''
    return {
      sAppName: row.sAppName || '—',
      name: row.sAppName || '—',
      note: note || undefined,
      reasonTag: note || undefined,
      metric: note || '—'
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
 * 请求体：{ date: 'YYYY-MM-DD' }
 */
export async function fetchCockpitTop3(params?: { date?: string }): Promise<CockpitTop3Response> {
  return request.post<CockpitTop3Response>({
    url: COCKPIT_TOP3_URL,
    data: params?.date ? { date: params.date } : {}
  })
}

/**
 * 获取消耗节奏监控数据（自投 + 代投）
 * 请求体：{ date: 'YYYY-MM-DD' }
 */
export async function fetchConsumptionRhythmMonitoring(params?: {
  date?: string
}): Promise<CockpitConsumptionRhythmResponse> {
  return request.post<CockpitConsumptionRhythmResponse>({
    url: COCKPIT_CONSUMPTION_RHYTHM_URL,
    data: params?.date ? { date: params.date } : {}
  })
}

/**
 * 将广告平台 ROI&安装量接口数据转为表格/折线用结构
 * - 广告平台名称：使用 channel 字段
 * - 消耗、安装量、CPI：使用 list 数组中索引为 0 的对象（list[0]）的 cost、install、cpl（接口可能返回 null，已做兼容）
 * - 近七日折线图：使用 list 中每日的 cost（消耗）按顺序组成 trend 数组
 */
export function mapChannelRoiInstallToItems(
  data: CockpitChannelRoiInstallResponse | null
): CockpitChannelRoiInstallItem[] {
  if (!Array.isArray(data) || !data.length) return []
  const num = (v: unknown) => (v != null && Number.isFinite(Number(v)) ? Number(v) : 0)
  return data.map((row) => {
    const list = row.list ?? []
    const first = list[0] ?? { cost: null, cpl: null, install: null, roi: null }
    return {
      channel: row.channel ?? '—',
      spend: num(first.cost),
      spendChange: num((row as { costChange?: unknown }).costChange),
      installs: num(first.install),
      installsChange: num((row as { installChange?: unknown }).installChange),
      roi: num((first as { roi?: unknown }).roi),
      roiChange: num((row as { roiChange?: unknown }).roiChange),
      cpi: num(first.cpl)
    }
  })
}

/**
 * 获取广告平台 ROI&安装量（经营驾驶舱大屏 广告平台ROI&安装量）
 * 请求体：{ date: 'YYYY-MM-DD' }
 */
export async function fetchChannelRoiInstall(params?: {
  date?: string
}): Promise<CockpitChannelRoiInstallResponse> {
  return request.post<CockpitChannelRoiInstallResponse>({
    url: COCKPIT_CHANNEL_ROI_URL,
    data: params?.date ? { date: params.date } : {}
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
export async function fetchCockpitBusinessMap(params?: {
  date?: string
}): Promise<CockpitBusinessMapApiItem[]> {
  return request.post<CockpitBusinessMapApiItem[]>({
    url: COCKPIT_BUSINESS_MAP_URL,
    data: params?.date ? { date: params.date } : {}
  })
}

/** 收入结构接口响应体（后端返回 code/data/message，request 会解包为 data 数组） */

/**
 * 将收入结构接口 data[] 转为桑基图 nodes/links/insights
 *
 * 接口语义：每条记录的 dAdRevenue、dIapRevenue 是该 APP 在该国家的值；
 * 同一国家下多条记录（不同 APP）需汇总为该国家的总和；顶层为全局汇总。
 * 结构：广告收入/付费收入(depth0) -> 国家(depth1) -> 应用(depth2)
 */
export function mapIncomeStructureToFlow(
  data: CockpitIncomeStructureRow[] | null
): CockpitRevenueStructureFlow {
  if (!Array.isArray(data) || !data.length) {
    return { nodes: [], links: [], insights: [] }
  }
  const num = (v: unknown) => (v != null && Number.isFinite(Number(v)) ? Number(v) : 0)
  /** 按国家汇总：该国下所有 APP 的广告收入之和 */
  const byCountryAd: Record<string, number> = {}
  /** 按国家汇总：该国下所有 APP 的内购收入之和 */
  const byCountryIap: Record<string, number> = {}
  /** 按国家+APP 汇总：该 APP 在该国家的广告+内购收入（APP 维度的值） */
  const byCountryApp: Record<string, number> = {}
  let totalAd = 0
  let totalIap = 0
  data.forEach((row) => {
    const countryKey = String(row.country ?? '')
    const app = (row.app ?? '').trim() || '—'
    const ad = num(row.dAdRevenue)
    const iap = num(row.dIapRevenue)
    byCountryAd[countryKey] = (byCountryAd[countryKey] ?? 0) + ad
    byCountryIap[countryKey] = (byCountryIap[countryKey] ?? 0) + iap
    const key = `${countryKey}\t${app}`
    byCountryApp[key] = (byCountryApp[key] ?? 0) + ad + iap
    totalAd += ad
    totalIap += iap
  })
  const total = totalAd + totalIap
  const countries = [...new Set(Object.keys(byCountryAd).concat(Object.keys(byCountryIap)))]
  const apps = [...new Set(data.map((r) => (r.app ?? '').trim() || '—'))]
  /** 每个 APP 在所有国家的收入总和（APP 节点展示用） */
  const byAppTotal: Record<string, number> = {}
  Object.entries(byCountryApp).forEach(([key, value]) => {
    const appName = key.split('\t')[1]
    byAppTotal[appName] = (byAppTotal[appName] ?? 0) + value
  })
  const nodeAd = '广告收入'
  const nodeIap = '付费收入'
  /** 国家节点唯一 id（避免与 app 同名如「其他」导致 ECharts 报 duplicate name） */
  const countryId = (c: string) => `country:${c}`
  /** 应用节点唯一 id */
  const appId = (a: string) => `app:${a}`
  const nodes: CockpitRevenueStructureNode[] = []
  const links: CockpitRevenueStructureLink[] = []

  const adPct = total > 0 ? ((totalAd / total) * 100).toFixed(1) : '0'
  const iapPct = total > 0 ? ((totalIap / total) * 100).toFixed(1) : '0'
  nodes.push({
    name: nodeAd,
    depth: 0,
    valueDisplay: formatMoney(totalAd),
    percent: `${adPct}%`,
    itemStyle: { color: '#14DEBA', borderRadius: 6 }
  })
  nodes.push({
    name: nodeIap,
    depth: 0,
    valueDisplay: formatMoney(totalIap),
    percent: `${iapPct}%`,
    itemStyle: { color: '#409eff', borderRadius: 6 }
  })
  const colorByDepth1 = ['#67c23a', '#409eff', '#7230b3', '#e6a23c', '#909399']
  countries.forEach((c, i) => {
    const adVal = byCountryAd[c] ?? 0
    const iapVal = byCountryIap[c] ?? 0
    const sum = adVal + iapVal
    const isoCode = COUNTRY_CN_TO_ISO[c]
    const cId = countryId(c)
    nodes.push({
      name: cId,
      displayName: c,
      depth: 1,
      code: isoCode,
      valueDisplay: formatMoney(sum),
      itemStyle: { color: colorByDepth1[i % colorByDepth1.length], borderRadius: 6 }
    })
    if (adVal > 0) links.push({ source: nodeAd, target: cId, value: adVal })
    if (iapVal > 0) links.push({ source: nodeIap, target: cId, value: iapVal })
  })
  const colorByDepth2 = ['#67c23a', '#409eff', '#7230b3', '#e6a23c', '#909399']
  apps.forEach((app, i) => {
    const appSum = byAppTotal[app] ?? 0
    const aId = appId(app)
    nodes.push({
      name: aId,
      displayName: app,
      depth: 2,
      valueDisplay: formatMoney(appSum),
      itemStyle: { color: colorByDepth2[i % colorByDepth2.length], borderRadius: 6 }
    })
  })
  Object.entries(byCountryApp).forEach(([key, value]) => {
    if (value <= 0) return
    const [countryKey, appName] = key.split('\t')
    if (countries.includes(countryKey) && apps.includes(appName))
      links.push({ source: countryId(countryKey), target: appId(appName), value })
  })
  const insights: CockpitRevenueStructureInsight[] = []
  if (total > 0) {
    insights.push({
      color: '#67c23a',
      text: `广告收入占比 ${adPct}%`
    })
    insights.push({
      color: '#409eff',
      text: `付费收入占比 ${iapPct}%`
    })
  }
  return { nodes, links, insights }
}

/**
 * 获取收入结构数据（近7日收入结构流向）
 * POST /api/v1/datacenter/analysis/cockpit/incomeStructure，请求体：{ date: 'YYYY-MM-DD' }
 * 响应 data: [{ app, country, dAdRevenue, dIapRevenue }, ...]
 */
export async function fetchIncomeStructure(params?: {
  date?: string
}): Promise<CockpitIncomeStructureRow[]> {
  const list = await request.post<CockpitIncomeStructureRow[]>({
    url: COCKPIT_INCOME_STRUCTURE_URL,
    data: params?.date ? { date: params.date } : {}
  })
  return Array.isArray(list) ? list : []
}

/**
 * 今日 Tab 专属：四卡片汇总（当前网关无独立 `cockpit/today-summary-cards` 时，非 Mock 返回空数组）
 */
export async function fetchCockpitTodaySummaryCards(params?: {
  date?: string
}): Promise<CockpitTodaySummaryCard[]> {
  void params
  return Promise.resolve([])
}

/**
 * 昨日 Tab 专属：汇总面板分组块（当前网关无独立 `cockpit/yesterday-summary-panel` 时，非 Mock 返回空数组）
 */
export async function fetchCockpitYesterdaySummaryPanel(params?: {
  date?: string
}): Promise<CockpitYesterdaySummarySection[]> {
  void params
  return Promise.resolve([])
}

/**
 * 驾驶舱「概览」形状数据：不发 `cockpit/overview`，返回空壳；由 overall、top3、地图等子请求写入 mergeOverview。
 */
export async function fetchCockpitOverview(
  params?: CockpitOverviewParams
): Promise<CockpitOverview> {
  void params
  return Promise.resolve({ ...EMPTY_COCKPIT_OVERVIEW })
}
