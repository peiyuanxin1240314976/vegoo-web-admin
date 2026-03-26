/**
 * 商业洞察 - IAA / IAP 分析 API（Mock / 远程由模块配置切换）
 * IAP 分片接口见 ./iap-analysis.ts（与 iap-analysis/mock/backend-api 契约对齐）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  IaaAnalysisEndpoint,
  isIaaAnalysisEndpointMock
} from '@/views/business-insight/iaa-analysis/config/data-source'
import {
  RevenueOverviewEndpoint,
  isRevenueOverviewEndpointMock
} from '@/views/business-insight/revenue-overview/config/data-source'
import {
  EcpmAnalysisEndpoint,
  isEcpmAnalysisEndpointMock
} from '@/views/business-insight/ecpm-analysis/config/data-source'
import * as insightMock from '@/views/business-insight/mocks/business-insight-api-mock'
import { MOCK_REVENUE_OVERVIEW_KPIS } from '@/views/business-insight/revenue-overview/mock'
import type {
  RevenueOverviewIaaCountryRow,
  RevenueOverviewFilterState,
  RevenueOverviewIaaAdUnitRow,
  RevenueOverviewIaaBreakdownRow,
  RevenueOverviewIaaPlatformRow,
  RevenueOverviewIaaVersionRow,
  RevenueOverviewIapChannelRow,
  RevenueOverviewIapChannelSegment,
  RevenueOverviewIapBreakdownRow,
  RevenueOverviewIapTrendKpiCard,
  RevenueOverviewKpiCard
} from '@/views/business-insight/revenue-overview/mock'
import type { RevenueOverviewPieSlice } from '@/views/business-insight/revenue-overview/mock'
import type { RevenueOverviewTopCountryRow } from '@/views/business-insight/revenue-overview/mock'
import type { RevenueOverviewQualityMetric } from '@/views/business-insight/revenue-overview/mock'
import type {
  IaaFilterOptions,
  IaaKpiCard,
  IaaPlatformTableRow,
  IaaPlatformRankItem,
  IaaRevenueDonutItem,
  IaaAdTypeTrend7dSeries,
  IaaFilterState,
  IaaAdTypeTabData,
  IaaPlatformTabData,
  IaaPlacementTabData,
  IaaAdUnitTabData,
  IaaCountryTabData,
  IaaVersionTabData
} from '@/views/business-insight/iaa-analysis/types'
import type {
  ProfitAnalysisQueryParams,
  ProfitAppProfitResponseDto,
  ProfitCountryProfitResponseDto,
  ProfitFilterOptions,
  ProfitKpiOverviewDto,
  ProfitSankeyDto,
  ProfitTrend30d
} from '@/views/business-insight/profit-analysis/types'
import type {
  EcpmMetaFilterOptions,
  EcpmOverviewKpis,
  EcpmTrendBundle
} from '@/views/business-insight/ecpm-analysis/types'

export {
  fetchIapMetaFilterOptions,
  fetchIapOverviewKpi,
  fetchIapOverviewTrend,
  fetchIapOverviewAppCards,
  fetchIapOverviewCountryDistribution,
  fetchIapOverviewProductTypeDonut,
  fetchIapOverviewPlatformCompare,
  fetchIapOverviewTable,
  fetchIapTableOverview,
  fetchIapDetailKpi,
  fetchIapDetailProduct,
  fetchIapDetailUser,
  fetchIapDetailTrend
} from './iap-analysis'
export type { IapOverviewTableQuery } from './iap-analysis'

const IAA_BASE = `${ANALYSIS_API_BASE}/business-insight/iaa-analysis`
const REVENUE_OVERVIEW_BASE = `${ANALYSIS_API_BASE}/business-insight/revenue-overview`
const ECPM_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/business-insight/ecpm-analysis`

function normalizeEcpmMetaFilterOptions(
  raw: EcpmMetaFilterOptions | null | undefined
): EcpmMetaFilterOptions {
  const arr = (v: unknown) => (Array.isArray(v) ? v : []) as EcpmMetaFilterOptions['apps']
  const countryArr = (v: unknown) =>
    (Array.isArray(v) ? v : []) as EcpmMetaFilterOptions['countries']
  const o =
    raw !== null && raw !== undefined && typeof raw === 'object'
      ? (raw as unknown as Record<string, unknown>)
      : {}
  return {
    apps: arr(o.apps),
    platforms_terminal: arr(o.platforms_terminal),
    sources: arr(o.sources),
    countries: countryArr(o.countries)
  }
}

/** ECPM 分析 - 顶栏筛选项 GET .../meta-filter-options */
export async function fetchEcpmMetaFilterOptions() {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.MetaFilterOptions)) {
    const { MOCK_ECPM_MAP_COUNTRIES, MOCK_ECPM_PLATFORMS, MOCK_ECPM_APP_RANK } = await import(
      '@/views/business-insight/ecpm-analysis/mock'
    )
    return {
      apps: [
        { value: '', label: '全部应用' },
        ...MOCK_ECPM_APP_RANK.map((item) => ({
          value: item.s_app_name,
          label: item.s_app_name
        }))
      ],
      platforms_terminal: [
        { value: '', label: '全部终端' },
        { value: 'android', label: 'Android' },
        { value: 'ios', label: 'iOS' }
      ],
      sources: [
        { value: '', label: '全部广告平台' },
        ...MOCK_ECPM_PLATFORMS.map((item) => ({ value: item.name.toLowerCase(), label: item.name }))
      ],
      countries: [
        { value: '', label: '全部国家', s_country_code: '' },
        ...MOCK_ECPM_MAP_COUNTRIES.map((item) => ({
          value: item.s_country_code.toLowerCase(),
          label: item.geo_name,
          s_country_code: item.s_country_code
        }))
      ]
    }
  }
  const raw = await request.get<unknown>({ url: `${ECPM_ANALYSIS_BASE}/meta-filter-options` })
  return normalizeEcpmMetaFilterOptions(unwrapIaaPayload<EcpmMetaFilterOptions>(raw))
}

function normalizeEcpmOverviewKpis(raw: EcpmOverviewKpis | null | undefined): EcpmOverviewKpis {
  return {
    d_ecpm_estimated: Number(raw?.d_ecpm_estimated ?? 0),
    d_ecpm_real: Number(raw?.d_ecpm_real ?? 0),
    estimated_change_pct_vs_prev_month: Number(raw?.estimated_change_pct_vs_prev_month ?? 0),
    real_change_pct_vs_prev_month: Number(raw?.real_change_pct_vs_prev_month ?? 0),
    top_country: {
      s_country_code: String(raw?.top_country?.s_country_code ?? ''),
      label_display: String(raw?.top_country?.label_display ?? ''),
      d_ecpm: Number(raw?.top_country?.d_ecpm ?? 0),
      second: {
        s_country_code: String(raw?.top_country?.second?.s_country_code ?? ''),
        label_display: String(raw?.top_country?.second?.label_display ?? ''),
        d_ecpm: Number(raw?.top_country?.second?.d_ecpm ?? 0)
      }
    },
    top_ad_slot: {
      s_app_id: String(raw?.top_ad_slot?.s_app_id ?? ''),
      s_app_name: String(raw?.top_ad_slot?.s_app_name ?? ''),
      n_ad_type_label: String(raw?.top_ad_slot?.n_ad_type_label ?? ''),
      d_ecpm: Number(raw?.top_ad_slot?.d_ecpm ?? 0)
    }
  }
}

type EcpmOverviewKpiParams = {
  t_start_date: string
  t_end_date: string
  platform: string
  source?: string
  s_app_id?: string
  s_country_code?: string
}

/** ECPM 分析 - 顶部 KPI POST .../overview/kpis */
export async function fetchEcpmOverviewKpis(params: EcpmOverviewKpiParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.OverviewKpis)) {
    const { MOCK_ECPM_KPIS } = await import('@/views/business-insight/ecpm-analysis/mock')
    return normalizeEcpmOverviewKpis(MOCK_ECPM_KPIS)
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/overview/kpis`,
    data: params
  })
  return normalizeEcpmOverviewKpis(unwrapIaaPayload<EcpmOverviewKpis>(raw))
}

function normalizeEcpmTrendBundle(raw: EcpmTrendBundle | null | undefined): EcpmTrendBundle {
  const toNumArr = (v: unknown) => (Array.isArray(v) ? v.map((item) => Number(item)) : [])
  const toStrArr = (v: unknown) => (Array.isArray(v) ? v.map((item) => String(item)) : [])
  const xLabels = toStrArr(raw?.x_labels)
  const estimated = toNumArr(raw?.series_estimated)
  const real = toNumArr(raw?.series_real)
  const revenue = toNumArr(raw?.series_revenue)
  return {
    x_labels: xLabels,
    series_estimated: estimated,
    series_real: real,
    series_revenue: revenue
  }
}

/** ECPM 分析 - 趋势图 POST .../overview/trend */
export async function fetchEcpmOverviewTrend(params: EcpmOverviewKpiParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.OverviewTrend)) {
    const { MOCK_ECPM_TREND } = await import('@/views/business-insight/ecpm-analysis/mock')
    return normalizeEcpmTrendBundle(MOCK_ECPM_TREND)
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/overview/trend`,
    data: params
  })
  return normalizeEcpmTrendBundle(unwrapIaaPayload<EcpmTrendBundle>(raw))
}

type EcpmPlatformTableResponse = {
  rows: {
    name: string
    d_ecpm_estimated: number
    d_ecpm_real: number
    revenue_display: string
    share_display: string
    trend: 'up' | 'down' | 'flat'
    spark_series: number[]
  }[]
  subtotal: {
    d_ecpm_estimated: number
    d_ecpm_real: number
    revenue_display: string
    share_display: string
  }
}

function normalizeEcpmPlatformTableResponse(
  raw: EcpmPlatformTableResponse | null | undefined
): EcpmPlatformTableResponse {
  const rows = Array.isArray(raw?.rows)
    ? raw.rows.map((row) => ({
        name: String(row?.name ?? ''),
        d_ecpm_estimated: Number(row?.d_ecpm_estimated ?? 0),
        d_ecpm_real: Number(row?.d_ecpm_real ?? 0),
        revenue_display: String(row?.revenue_display ?? ''),
        share_display: String(row?.share_display ?? ''),
        trend:
          row?.trend === 'down' || row?.trend === 'flat' || row?.trend === 'up'
            ? row.trend
            : 'flat',
        spark_series: Array.isArray(row?.spark_series)
          ? row.spark_series.map((item) => Number(item))
          : []
      }))
    : []
  return {
    rows,
    subtotal: {
      d_ecpm_estimated: Number(raw?.subtotal?.d_ecpm_estimated ?? 0),
      d_ecpm_real: Number(raw?.subtotal?.d_ecpm_real ?? 0),
      revenue_display: String(raw?.subtotal?.revenue_display ?? ''),
      share_display: String(raw?.subtotal?.share_display ?? '')
    }
  }
}

/** ECPM 分析 - 平台对比表 POST .../table/platform */
export async function fetchEcpmTablePlatform(params: EcpmOverviewKpiParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.TablePlatform)) {
    const { MOCK_ECPM_PLATFORMS, MOCK_ECPM_PLATFORM_SUBTOTAL } = await import(
      '@/views/business-insight/ecpm-analysis/mock'
    )
    return normalizeEcpmPlatformTableResponse({
      rows: MOCK_ECPM_PLATFORMS.map((item) => ({
        name: item.name,
        d_ecpm_estimated: item.estimated,
        d_ecpm_real: item.real,
        revenue_display: item.revenue,
        share_display: item.share,
        trend: item.trend,
        spark_series: item.sparkData
      })),
      subtotal: {
        d_ecpm_estimated: MOCK_ECPM_PLATFORM_SUBTOTAL.d_ecpm_estimated,
        d_ecpm_real: MOCK_ECPM_PLATFORM_SUBTOTAL.d_ecpm_real,
        revenue_display: MOCK_ECPM_PLATFORM_SUBTOTAL.revenue_display,
        share_display: MOCK_ECPM_PLATFORM_SUBTOTAL.share_display
      }
    })
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/table/platform`,
    data: params
  })
  return normalizeEcpmPlatformTableResponse(unwrapIaaPayload<EcpmPlatformTableResponse>(raw))
}

type EcpmMapCountryResponse = {
  items: {
    s_country_code: string
    geo_name: string
    d_ecpm_estimated: number
    d_ecpm_real: number
  }[]
}

type EcpmMapCountryParams = EcpmOverviewKpiParams & {
  map_metric: 'estimated' | 'real'
}

function normalizeEcpmMapCountryResponse(
  raw: EcpmMapCountryResponse | null | undefined
): EcpmMapCountryResponse {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((item) => ({
        s_country_code: String(item?.s_country_code ?? ''),
        geo_name: String(item?.geo_name ?? ''),
        d_ecpm_estimated: Number(item?.d_ecpm_estimated ?? 0),
        d_ecpm_real: Number(item?.d_ecpm_real ?? 0)
      }))
    : []
  return { items }
}

/** ECPM 分析 - 地图国家分布 POST .../overview/map-country */
export async function fetchEcpmOverviewMapCountry(params: EcpmMapCountryParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.OverviewMapCountry)) {
    const { MOCK_ECPM_MAP_COUNTRIES } = await import('@/views/business-insight/ecpm-analysis/mock')
    return normalizeEcpmMapCountryResponse({ items: MOCK_ECPM_MAP_COUNTRIES })
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/overview/map-country`,
    data: params
  })
  return normalizeEcpmMapCountryResponse(unwrapIaaPayload<EcpmMapCountryResponse>(raw))
}

type EcpmTop10CountryParams = EcpmOverviewKpiParams & {
  metric: 'estimated' | 'real'
}

type EcpmTop10CountryResponse = {
  rows: {
    s_country_code: string
    label_zh: string
    d_ecpm: number
    bar_color: string
  }[]
}

function normalizeEcpmTop10CountryResponse(
  raw: EcpmTop10CountryResponse | null | undefined
): EcpmTop10CountryResponse {
  const rows = Array.isArray(raw?.rows)
    ? raw.rows.map((row) => ({
        s_country_code: String(row?.s_country_code ?? ''),
        label_zh: String(row?.label_zh ?? ''),
        d_ecpm: Number(row?.d_ecpm ?? 0),
        bar_color: String(row?.bar_color ?? '#4db6e8')
      }))
    : []
  return { rows }
}

/** ECPM 分析 - Top10 国家 POST .../overview/top10-country */
export async function fetchEcpmOverviewTop10Country(params: EcpmTop10CountryParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.OverviewTop10Country)) {
    const { MOCK_ECPM_TOP_COUNTRIES } = await import('@/views/business-insight/ecpm-analysis/mock')
    return normalizeEcpmTop10CountryResponse({ rows: MOCK_ECPM_TOP_COUNTRIES })
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/overview/top10-country`,
    data: params
  })
  return normalizeEcpmTop10CountryResponse(unwrapIaaPayload<EcpmTop10CountryResponse>(raw))
}

type EcpmAdSlotRankingResponse = {
  rows: {
    s_ad_unit_label: string
    d_ecpm: number
    bar_color: string
  }[]
}

function normalizeEcpmAdSlotRankingResponse(
  raw: EcpmAdSlotRankingResponse | null | undefined
): EcpmAdSlotRankingResponse {
  const rows = Array.isArray(raw?.rows)
    ? raw.rows.map((row) => ({
        s_ad_unit_label: String(row?.s_ad_unit_label ?? ''),
        d_ecpm: Number(row?.d_ecpm ?? 0),
        bar_color: String(row?.bar_color ?? '#4db6e8')
      }))
    : []
  return { rows }
}

/** ECPM 分析 - 广告位排行 POST .../overview/ad-slot-ranking */
export async function fetchEcpmOverviewAdSlotRanking(params: EcpmOverviewKpiParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.OverviewAdSlotRanking)) {
    const { MOCK_ECPM_AD_SLOTS } = await import('@/views/business-insight/ecpm-analysis/mock')
    return normalizeEcpmAdSlotRankingResponse({
      rows: MOCK_ECPM_AD_SLOTS.map((item) => ({
        s_ad_unit_label: item.name,
        d_ecpm: item.value,
        bar_color: item.color
      }))
    })
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/overview/ad-slot-ranking`,
    data: params
  })
  return normalizeEcpmAdSlotRankingResponse(unwrapIaaPayload<EcpmAdSlotRankingResponse>(raw))
}

type EcpmAppRankingResponse = {
  rows: {
    s_app_name: string
    icon_text: string
    d_ecpm_estimated: number
    d_ecpm_real: number
    revenue_display: string
    mom_change_pct: number
  }[]
}

function normalizeEcpmAppRankingResponse(
  raw: EcpmAppRankingResponse | null | undefined
): EcpmAppRankingResponse {
  const rows = Array.isArray(raw?.rows)
    ? raw.rows.map((row) => ({
        s_app_name: String(row?.s_app_name ?? ''),
        icon_text: String(row?.icon_text ?? ''),
        d_ecpm_estimated: Number(row?.d_ecpm_estimated ?? 0),
        d_ecpm_real: Number(row?.d_ecpm_real ?? 0),
        revenue_display: String(row?.revenue_display ?? ''),
        mom_change_pct: Number(row?.mom_change_pct ?? 0)
      }))
    : []
  return { rows }
}

/** ECPM 分析 - 应用排行 POST .../overview/app-ranking */
export async function fetchEcpmOverviewAppRanking(params: EcpmOverviewKpiParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.OverviewAppRanking)) {
    const { MOCK_ECPM_APP_RANK } = await import('@/views/business-insight/ecpm-analysis/mock')
    return normalizeEcpmAppRankingResponse({ rows: MOCK_ECPM_APP_RANK })
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/overview/app-ranking`,
    data: params
  })
  return normalizeEcpmAppRankingResponse(unwrapIaaPayload<EcpmAppRankingResponse>(raw))
}

type EcpmInsightTipResponse = {
  message: string
}

function normalizeEcpmInsightTipResponse(
  raw: EcpmInsightTipResponse | null | undefined
): EcpmInsightTipResponse {
  return {
    message: String(raw?.message ?? '')
  }
}

/** ECPM 分析 - 运营提示 POST .../overview/insight-tip */
export async function fetchEcpmOverviewInsightTip(params: EcpmOverviewKpiParams) {
  if (isEcpmAnalysisEndpointMock(EcpmAnalysisEndpoint.OverviewInsightTip)) {
    const { MOCK_ECPM_INSIGHT_TIP } = await import('@/views/business-insight/ecpm-analysis/mock')
    return normalizeEcpmInsightTipResponse({ message: MOCK_ECPM_INSIGHT_TIP })
  }
  const raw = await request.post<unknown>({
    url: `${ECPM_ANALYSIS_BASE}/overview/insight-tip`,
    data: params
  })
  return normalizeEcpmInsightTipResponse(unwrapIaaPayload<EcpmInsightTipResponse>(raw))
}

export type RevenueOverviewMetaFilterOption = {
  label: string
  value: string
}

export type RevenueOverviewMetaFilterOptions = {
  countryOptions: RevenueOverviewMetaFilterOption[]
  versionOptions: RevenueOverviewMetaFilterOption[]
  platformOptions: RevenueOverviewMetaFilterOption[]
  appOptions: RevenueOverviewMetaFilterOption[]
}

export type RevenueOverviewKpisResponse = {
  kpis: RevenueOverviewKpiCard[]
}

export type RevenueOverviewIaaAdTypeResponse = {
  rows: RevenueOverviewIaaBreakdownRow[]
}

export type RevenueOverviewIaaPlatformResponse = {
  rows: RevenueOverviewIaaPlatformRow[]
}

export type RevenueOverviewIaaAdUnitResponse = {
  rows: RevenueOverviewIaaAdUnitRow[]
}

export type RevenueOverviewIaaCountryResponse = {
  rows: RevenueOverviewIaaCountryRow[]
}

export type RevenueOverviewIaaVersionResponse = {
  rows: RevenueOverviewIaaVersionRow[]
}

export type RevenueOverviewIapProductResponse = {
  header: {
    subscriptionValueText: string
    subscriptionPctText: string
    oneTimeValueText: string
    oneTimePctText: string
  }
  foot: {
    conversionRateText: string
    arppuText: string
    renewalRateText: string
  }
  rows: RevenueOverviewIapBreakdownRow[]
}

export type RevenueOverviewIapChannelMetric = {
  title: string
  valueText: string
  accent: 'purple' | 'green' | 'amber'
}

export type RevenueOverviewIapChannelResponse = {
  segments: RevenueOverviewIapChannelSegment[]
  rows: RevenueOverviewIapChannelRow[]
  leftMetrics: RevenueOverviewIapChannelMetric[]
}

export type RevenueOverviewIapTrendResponse = {
  dateLabels: string[]
  series: {
    revenue: number[]
    orders: number[]
  }
  kpis: RevenueOverviewIapTrendKpiCard[]
}

export type RevenueOverviewTrend7dIaaIapResponse = {
  dateLabels: string[]
  iaa: number[]
  iap: number[]
}

export type RevenueOverviewTrend7dEcpmResponse = {
  dateLabels: string[]
  predicted: number[]
  actual: number[]
}

export type RevenueOverviewPlatformPieResponse = {
  slices: RevenueOverviewPieSlice[]
}

export type RevenueOverviewTopCountriesResponse = {
  rows: RevenueOverviewTopCountryRow[]
}

export type RevenueOverviewAiInsightResponse = {
  title: string
  bullets: string[]
}

export type RevenueOverviewQualityMetricsResponse = {
  metrics: RevenueOverviewQualityMetric[]
}

function emptyIfAll(v: string | undefined, all = 'all') {
  if (v === undefined || v === '' || v === all) return ''
  return v
}

function normalizeIaaBody(state: IaaFilterState) {
  return {
    s_app_id: emptyIfAll(state.s_app_id),
    platform: emptyIfAll(state.platform),
    s_country_code: emptyIfAll(state.s_country_code),
    t_date: state.t_date
  }
}

/**
 * 网关在 BaseResponse.data 内再包一层 `{ data: T }` 时，http 取 `res.data.data` 后仍为 `{ data: T }`，此处再剥一层。
 * Mock / 未套娃的响应无多余 `data` 键，原样返回。
 */
function unwrapIaaPayload<T>(raw: unknown): T {
  if (raw === null || raw === undefined) return raw as T
  if (typeof raw !== 'object' || Array.isArray(raw)) return raw as T
  const o = raw as Record<string, unknown>
  if (
    'data' in o &&
    o.data !== null &&
    o.data !== undefined &&
    typeof o.data === 'object' &&
    !Array.isArray(o.data)
  ) {
    return o.data as T
  }
  return raw as T
}

/** 广告平台 Tab：补全 table 缺省列、由 tableRows/platformRanking 推导 donut、对齐 trend7d 与 dates 长度 */
function normalizeIaaPlatformTrend7d(raw: unknown): {
  dates: string[]
  series: IaaAdTypeTrend7dSeries[]
} {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { dates: [], series: [] }
  }
  const t = raw as { dates?: unknown; series?: unknown }
  let dates = Array.isArray(t.dates) ? t.dates.map((x) => String(x)) : []
  let series = (Array.isArray(t.series) ? t.series : [])
    .filter((s) => s && typeof s === 'object' && !Array.isArray(s))
    .map((s) => {
      const x = s as Record<string, unknown>
      return {
        name: String(x.name ?? ''),
        color: String(x.color ?? '#3B82F6'),
        data: Array.isArray(x.data) ? x.data.map((v) => Number(v)) : []
      }
    }) as IaaAdTypeTrend7dSeries[]
  const maxLen = Math.max(
    dates.length,
    series.reduce((m, s) => Math.max(m, s.data.length), 0),
    1
  )
  while (dates.length < maxLen) {
    dates.push(dates.length > 0 ? dates[dates.length - 1]! : '')
  }
  dates = dates.slice(0, maxLen)
  series = series.map((s) => {
    const d = [...s.data]
    while (d.length < maxLen) {
      d.push(d.length > 0 ? d[d.length - 1]! : 0)
    }
    return { ...s, data: d.slice(0, maxLen) }
  })
  return { dates, series }
}

function normalizeIaaPlatformTabData(raw: unknown): IaaPlatformTabData {
  const o =
    raw !== null && raw !== undefined && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  const kpis = (Array.isArray(o.kpis) ? o.kpis : []) as IaaKpiCard[]
  const platformRankingRaw = Array.isArray(o.platformRanking) ? o.platformRanking : []
  const platformRanking: IaaPlatformRankItem[] = platformRankingRaw
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const r = x as Record<string, unknown>
      return {
        sourceName: String(r.sourceName ?? ''),
        revenue: Number(r.revenue ?? 0),
        ecpm: Number(r.ecpm ?? 0)
      }
    })

  const platformInsight = typeof o.platformInsight === 'string' ? o.platformInsight : ''

  type EcpmCmp = { name: string; ecpmEst: number; ecpmReal: number }
  const ecpmComparison: EcpmCmp[] = (Array.isArray(o.ecpmComparison) ? o.ecpmComparison : [])
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const r = x as Record<string, unknown>
      return {
        name: String(r.name ?? ''),
        ecpmEst: Number(r.ecpmEst ?? 0),
        ecpmReal: Number(r.ecpmReal ?? 0)
      }
    })

  const tableRowsIn = (Array.isArray(o.tableRows) ? o.tableRows : []) as Record<string, unknown>[]
  const tableRows: IaaPlatformTableRow[] = tableRowsIn.map((row) => {
    const sourceName = String(row.sourceName ?? '')
    const rankItem = platformRanking.find((r) => r.sourceName === sourceName)
    const ecpmItem = ecpmComparison.find((e) => e.name === sourceName)
    const revenue = Number(row.revenue ?? 0)
    const revenueShare = Number(row.revenueShare ?? 0)
    let ecpmEst =
      row.ecpmEst !== undefined && row.ecpmEst !== null ? Number(row.ecpmEst) : Number.NaN
    let ecpmReal =
      row.ecpmReal !== undefined && row.ecpmReal !== null ? Number(row.ecpmReal) : Number.NaN
    if (Number.isNaN(ecpmEst)) {
      ecpmEst = Number(ecpmItem?.ecpmEst ?? rankItem?.ecpm ?? 0)
    }
    if (Number.isNaN(ecpmReal)) {
      ecpmReal = Number(ecpmItem?.ecpmReal ?? rankItem?.ecpm ?? 0)
    }
    const impressions = Number(row.impressions ?? 0)
    const impressionShare = Number(
      row.impressionShare !== undefined && row.impressionShare !== null
        ? row.impressionShare
        : revenueShare
    )
    const adUsers = Number(row.adUsers ?? 0)
    const userShare = Number(
      row.userShare !== undefined && row.userShare !== null ? row.userShare : revenueShare
    )
    let variance =
      row.variance !== undefined && row.variance !== null ? Number(row.variance) : Number.NaN
    if (Number.isNaN(variance)) {
      variance = ecpmReal > 0 ? Math.round(((ecpmEst - ecpmReal) / ecpmReal) * 1000) / 10 : 0
    }
    const fillRate = Number(row.fillRate ?? 0)
    const tr = row.trend
    const trend: IaaPlatformTableRow['trend'] =
      tr === 'up' || tr === 'down' || tr === 'flat' ? tr : 'flat'
    return {
      sourceName,
      source: Number(row.source ?? 0),
      revenue,
      revenueShare,
      impressions,
      impressionShare,
      adUsers,
      userShare,
      ecpmEst,
      ecpmReal,
      variance,
      fillRate,
      trend
    }
  })

  let donut = (Array.isArray(o.donut) ? o.donut : []) as IaaRevenueDonutItem[]
  if (donut.length === 0 && tableRows.length > 0) {
    donut = tableRows.map((r) => ({
      name: r.sourceName,
      value: r.revenue,
      percent: r.revenueShare
    }))
  } else if (donut.length === 0 && platformRanking.length > 0) {
    const total = platformRanking.reduce((s, r) => s + r.revenue, 0) || 1
    donut = platformRanking.map((r) => ({
      name: r.sourceName,
      value: r.revenue,
      percent: Math.round((r.revenue / total) * 1000) / 10
    }))
  }
  donut = donut.map((d) => ({
    name: String((d as IaaRevenueDonutItem).name ?? ''),
    value: Number((d as IaaRevenueDonutItem).value ?? 0),
    percent: Number((d as IaaRevenueDonutItem).percent ?? 0)
  }))

  return {
    kpis,
    platformRanking,
    platformInsight,
    tableRows,
    donut,
    ecpmComparison,
    trend7d: normalizeIaaPlatformTrend7d(o.trend7d)
  }
}

/** 网关 data 可能缺字段或为 null，避免下拉赋值 undefined 导致页面异常 */
function normalizeIaaFilterOptions(raw: IaaFilterOptions | null | undefined): IaaFilterOptions {
  const arr = (v: unknown) => (Array.isArray(v) ? v : []) as IaaFilterOptions['appOptions']
  const o =
    raw !== null && raw !== undefined && typeof raw === 'object'
      ? (raw as unknown as Record<string, unknown>)
      : {}
  return {
    appOptions: arr(o.appOptions ?? o.app_options),
    platformOptions: arr(o.platformOptions ?? o.platform_options),
    countryOptions: arr(o.countryOptions ?? o.country_options)
  }
}

export async function fetchIaaMetaFilterOptions() {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.MetaFilterOptions)) {
    return insightMock.mockFetchIaaMetaFilterOptions()
  }
  const raw = await request.get<unknown>({ url: `${IAA_BASE}/meta-filter-options` })
  return normalizeIaaFilterOptions(unwrapIaaPayload<IaaFilterOptions>(raw))
}

function normalizeRevenueOverviewMetaFilterOptions(
  raw: RevenueOverviewMetaFilterOptions | null | undefined
): RevenueOverviewMetaFilterOptions {
  const arr = (v: unknown) => (Array.isArray(v) ? v : []) as RevenueOverviewMetaFilterOption[]
  const o =
    raw !== null && raw !== undefined && typeof raw === 'object'
      ? (raw as unknown as Record<string, unknown>)
      : {}
  return {
    countryOptions: arr(o.countryOptions),
    versionOptions: arr(o.versionOptions),
    platformOptions: arr(o.platformOptions),
    appOptions: arr(o.appOptions)
  }
}

/** 收入总览 - 顶栏筛选项 GET .../meta-filter-options */
export async function fetchRevenueOverviewMetaFilterOptions() {
  const raw = await request.get<unknown>({ url: `${REVENUE_OVERVIEW_BASE}/meta-filter-options` })
  return normalizeRevenueOverviewMetaFilterOptions(
    unwrapIaaPayload<RevenueOverviewMetaFilterOptions>(raw)
  )
}

function normalizeRevenueOverviewKpisResponse(
  raw: RevenueOverviewKpisResponse | null | undefined
): RevenueOverviewKpisResponse {
  const kpis = Array.isArray(raw?.kpis) ? raw.kpis : []
  return { kpis }
}

/** 收入总览 - 顶部 KPI 卡片 POST .../overview/kpis */
export async function fetchRevenueOverviewOverviewKpis(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewKpis)) {
    return { kpis: MOCK_REVENUE_OVERVIEW_KPIS }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/kpis`,
    data: params
  })
  return normalizeRevenueOverviewKpisResponse(unwrapIaaPayload<RevenueOverviewKpisResponse>(raw))
}

const PROFIT_BASE = `${ANALYSIS_API_BASE}/business-insight/profit-analysis`

/** 利润分析 - 顶栏筛选项 GET .../meta-filter-options（仅依赖全局 Token，无 query/body） */
export function fetchProfitMetaFilterOptions() {
  return request.get<ProfitFilterOptions>({
    url: `${PROFIT_BASE}/meta-filter-options`
  })
}

function normalizeRevenueOverviewIaaAdTypeResponse(
  raw: RevenueOverviewIaaAdTypeResponse | null | undefined
): RevenueOverviewIaaAdTypeResponse {
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  return { rows }
}

/** 收入总览 - IAA 广告类型维度 POST .../overview/iaa/ad-type */
export async function fetchRevenueOverviewIaaAdType(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIaaAdType)) {
    const { MOCK_REVENUE_OVERVIEW_IAA_ROWS } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { rows: MOCK_REVENUE_OVERVIEW_IAA_ROWS }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iaa/ad-type`,
    data: params
  })
  return normalizeRevenueOverviewIaaAdTypeResponse(
    unwrapIaaPayload<RevenueOverviewIaaAdTypeResponse>(raw)
  )
}

function normalizeRevenueOverviewIaaPlatformResponse(
  raw: RevenueOverviewIaaPlatformResponse | null | undefined
): RevenueOverviewIaaPlatformResponse {
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  return { rows }
}

/** 收入总览 - IAA 广告平台维度 POST .../overview/iaa/platform */
export async function fetchRevenueOverviewIaaPlatform(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIaaPlatform)) {
    const { MOCK_REVENUE_OVERVIEW_IAA_PLATFORM_ROWS } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { rows: MOCK_REVENUE_OVERVIEW_IAA_PLATFORM_ROWS }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iaa/platform`,
    data: params
  })
  return normalizeRevenueOverviewIaaPlatformResponse(
    unwrapIaaPayload<RevenueOverviewIaaPlatformResponse>(raw)
  )
}

function normalizeRevenueOverviewIaaAdUnitResponse(
  raw: RevenueOverviewIaaAdUnitResponse | null | undefined
): RevenueOverviewIaaAdUnitResponse {
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  return { rows }
}

/** 收入总览 - IAA 广告位维度 POST .../overview/iaa/ad-unit */
export async function fetchRevenueOverviewIaaAdUnit(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIaaAdUnit)) {
    const { MOCK_REVENUE_OVERVIEW_IAA_AD_UNIT_ROWS } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { rows: MOCK_REVENUE_OVERVIEW_IAA_AD_UNIT_ROWS }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iaa/ad-unit`,
    data: params
  })
  return normalizeRevenueOverviewIaaAdUnitResponse(
    unwrapIaaPayload<RevenueOverviewIaaAdUnitResponse>(raw)
  )
}

function normalizeRevenueOverviewIaaCountryResponse(
  raw: RevenueOverviewIaaCountryResponse | null | undefined
): RevenueOverviewIaaCountryResponse {
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  return { rows }
}

/** 收入总览 - IAA 国家维度 POST .../overview/iaa/country */
export async function fetchRevenueOverviewIaaCountry(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIaaCountry)) {
    const { MOCK_REVENUE_OVERVIEW_IAA_COUNTRY_ROWS } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { rows: MOCK_REVENUE_OVERVIEW_IAA_COUNTRY_ROWS }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iaa/country`,
    data: params
  })
  return normalizeRevenueOverviewIaaCountryResponse(
    unwrapIaaPayload<RevenueOverviewIaaCountryResponse>(raw)
  )
}

function normalizeRevenueOverviewIaaVersionResponse(
  raw: RevenueOverviewIaaVersionResponse | null | undefined
): RevenueOverviewIaaVersionResponse {
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  return { rows }
}

/** 收入总览 - IAA 版本维度 POST .../overview/iaa/version */
export async function fetchRevenueOverviewIaaVersion(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIaaVersion)) {
    const { MOCK_REVENUE_OVERVIEW_IAA_VERSION_ROWS } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { rows: MOCK_REVENUE_OVERVIEW_IAA_VERSION_ROWS }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iaa/version`,
    data: params
  })
  return normalizeRevenueOverviewIaaVersionResponse(
    unwrapIaaPayload<RevenueOverviewIaaVersionResponse>(raw)
  )
}

function normalizeRevenueOverviewIapProductResponse(
  raw: RevenueOverviewIapProductResponse | null | undefined
): RevenueOverviewIapProductResponse {
  const header = raw?.header ?? {
    subscriptionValueText: '$0.00',
    subscriptionPctText: '0.0%',
    oneTimeValueText: '$0.00',
    oneTimePctText: '0.0%'
  }
  const foot = raw?.foot ?? {
    conversionRateText: '0.0%',
    arppuText: '$0.00',
    renewalRateText: '0.0%'
  }
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  return { header, foot, rows }
}

/** 收入总览 - IAP 商品维度 POST .../overview/iap/product */
export async function fetchRevenueOverviewIapProduct(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIapProduct)) {
    const {
      MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_HEADER,
      MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_FOOT,
      MOCK_REVENUE_OVERVIEW_IAP_ROWS
    } = await import('@/views/business-insight/revenue-overview/mock')
    return {
      header: MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_HEADER,
      foot: MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_FOOT,
      rows: MOCK_REVENUE_OVERVIEW_IAP_ROWS
    }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iap/product`,
    data: params
  })
  return normalizeRevenueOverviewIapProductResponse(
    unwrapIaaPayload<RevenueOverviewIapProductResponse>(raw)
  )
}

function normalizeRevenueOverviewIapChannelResponse(
  raw: RevenueOverviewIapChannelResponse | null | undefined
): RevenueOverviewIapChannelResponse {
  const segments = Array.isArray(raw?.segments) ? raw.segments : []
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  const leftMetrics = Array.isArray(raw?.leftMetrics) ? raw.leftMetrics : []
  return { segments, rows, leftMetrics }
}

/** 收入总览 - IAP 广告平台维度 POST .../overview/iap/channel */
export async function fetchRevenueOverviewIapChannel(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIapChannel)) {
    const {
      MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_SEGMENTS,
      MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_ROWS,
      MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_LEFT_METRICS
    } = await import('@/views/business-insight/revenue-overview/mock')
    return {
      segments: MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_SEGMENTS,
      rows: MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_ROWS,
      leftMetrics: MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_LEFT_METRICS
    }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iap/channel`,
    data: params
  })
  return normalizeRevenueOverviewIapChannelResponse(
    unwrapIaaPayload<RevenueOverviewIapChannelResponse>(raw)
  )
}

function normalizeRevenueOverviewIapTrendResponse(
  raw: RevenueOverviewIapTrendResponse | null | undefined
): RevenueOverviewIapTrendResponse {
  const dateLabels = Array.isArray(raw?.dateLabels) ? raw.dateLabels.map((x) => String(x)) : []
  const revenue = Array.isArray(raw?.series?.revenue)
    ? raw!.series.revenue.map((x) => Number(x))
    : []
  const orders = Array.isArray(raw?.series?.orders) ? raw!.series.orders.map((x) => Number(x)) : []
  const kpis = Array.isArray(raw?.kpis) ? raw.kpis : []
  return { dateLabels, series: { revenue, orders }, kpis }
}

/** 收入总览 - IAP 趋势维度 POST .../overview/iap/trend */
export async function fetchRevenueOverviewIapTrend(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewIapTrend)) {
    const {
      MOCK_REVENUE_OVERVIEW_7D_DATES,
      MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES,
      MOCK_REVENUE_OVERVIEW_IAP_TREND_KPIS
    } = await import('@/views/business-insight/revenue-overview/mock')
    return {
      dateLabels: MOCK_REVENUE_OVERVIEW_7D_DATES,
      series: {
        revenue: MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES.revenue,
        orders: MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES.orders
      },
      kpis: MOCK_REVENUE_OVERVIEW_IAP_TREND_KPIS
    }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/iap/trend`,
    data: params
  })
  return normalizeRevenueOverviewIapTrendResponse(
    unwrapIaaPayload<RevenueOverviewIapTrendResponse>(raw)
  )
}

function normalizeRevenueOverviewTrend7dIaaIapResponse(
  raw: RevenueOverviewTrend7dIaaIapResponse | null | undefined
): RevenueOverviewTrend7dIaaIapResponse {
  const dateLabels = Array.isArray(raw?.dateLabels) ? raw.dateLabels.map((x) => String(x)) : []
  const iaa = Array.isArray(raw?.iaa) ? raw.iaa.map((x) => Number(x)) : []
  const iap = Array.isArray(raw?.iap) ? raw.iap.map((x) => Number(x)) : []
  return { dateLabels, iaa, iap }
}

/** 收入总览 - 7 日 IAA vs IAP 趋势 POST .../overview/trend-7d/iaa-iap */
export async function fetchRevenueOverviewTrend7dIaaIap(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewTrend7dIaaIap)) {
    const { MOCK_REVENUE_OVERVIEW_7D_DATES, MOCK_REVENUE_OVERVIEW_7D_TREND } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return {
      dateLabels: MOCK_REVENUE_OVERVIEW_7D_DATES,
      iaa: MOCK_REVENUE_OVERVIEW_7D_TREND.iaa,
      iap: MOCK_REVENUE_OVERVIEW_7D_TREND.iap
    }
  }
  const raw = await request.post<unknown>({
    url: `${REVENUE_OVERVIEW_BASE}/overview/trend-7d/iaa-iap`,
    data: params
  })
  return normalizeRevenueOverviewTrend7dIaaIapResponse(
    unwrapIaaPayload<RevenueOverviewTrend7dIaaIapResponse>(raw)
  )
}

function normalizeRevenueOverviewTrend7dEcpmResponse(
  raw: RevenueOverviewTrend7dEcpmResponse | null | undefined
): RevenueOverviewTrend7dEcpmResponse {
  const dateLabels = Array.isArray(raw?.dateLabels) ? raw.dateLabels.map((x) => String(x)) : []
  const predicted = Array.isArray(raw?.predicted) ? raw.predicted.map((x) => Number(x)) : []
  const actual = Array.isArray(raw?.actual) ? raw.actual.map((x) => Number(x)) : []
  return { dateLabels, predicted, actual }
}

/** 收入总览 - 7 日 eCPM 趋势 POST .../overview/trend-7d/ecpm */
export async function fetchRevenueOverviewTrend7dEcpm(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewTrend7dEcpm)) {
    const { MOCK_REVENUE_OVERVIEW_7D_DATES, MOCK_REVENUE_OVERVIEW_ECPM_7D } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return {
      dateLabels: MOCK_REVENUE_OVERVIEW_7D_DATES,
      predicted: MOCK_REVENUE_OVERVIEW_ECPM_7D.predicted,
      actual: MOCK_REVENUE_OVERVIEW_ECPM_7D.actual
    }
  }
  const raw = await request.post<unknown>({
    url: '/api/v1/datacenter/analysis/business-insight/revenue-overview/overview/trend-7d/ecpm',
    data: params
  })
  return normalizeRevenueOverviewTrend7dEcpmResponse(
    unwrapIaaPayload<RevenueOverviewTrend7dEcpmResponse>(raw)
  )
}

function normalizeRevenueOverviewPlatformPieResponse(
  raw: RevenueOverviewPlatformPieResponse | null | undefined
): RevenueOverviewPlatformPieResponse {
  const slices = Array.isArray(raw?.slices) ? raw.slices : []
  return { slices }
}

/** 收入总览 - 平台分布饼图 POST .../overview/platform-pie */
export async function fetchRevenueOverviewPlatformPie(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewPlatformPie)) {
    const { MOCK_REVENUE_OVERVIEW_PLATFORM_PIE } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { slices: MOCK_REVENUE_OVERVIEW_PLATFORM_PIE }
  }
  const raw = await request.post<unknown>({
    url: '/api/v1/datacenter/analysis/business-insight/revenue-overview/overview/platform-pie',
    data: params
  })
  return normalizeRevenueOverviewPlatformPieResponse(
    unwrapIaaPayload<RevenueOverviewPlatformPieResponse>(raw)
  )
}

function normalizeRevenueOverviewTopCountriesResponse(
  raw: RevenueOverviewTopCountriesResponse | null | undefined
): RevenueOverviewTopCountriesResponse {
  const rows = Array.isArray(raw?.rows) ? raw.rows : []
  return { rows }
}

/** 收入总览 - Top 国家列表 POST .../overview/top-countries */
export async function fetchRevenueOverviewTopCountries(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewTopCountries)) {
    const { MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { rows: MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES }
  }
  const raw = await request.post<unknown>({
    url: '/api/v1/datacenter/analysis/business-insight/revenue-overview/overview/top-countries',
    data: params
  })
  return normalizeRevenueOverviewTopCountriesResponse(
    unwrapIaaPayload<RevenueOverviewTopCountriesResponse>(raw)
  )
}

function normalizeRevenueOverviewAiInsightResponse(
  raw: RevenueOverviewAiInsightResponse | null | undefined
): RevenueOverviewAiInsightResponse {
  const title = typeof raw?.title === 'string' ? raw.title : ''
  const bullets = Array.isArray(raw?.bullets) ? raw.bullets.map((x) => String(x)) : []
  return { title, bullets }
}

/** 收入总览 - AI 洞察 POST .../overview/ai-insight */
export async function fetchRevenueOverviewAiInsight(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewAiInsight)) {
    const { MOCK_REVENUE_OVERVIEW_AI_INSIGHT } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return MOCK_REVENUE_OVERVIEW_AI_INSIGHT
  }
  const raw = await request.post<unknown>({
    url: '/api/v1/datacenter/analysis/business-insight/revenue-overview/overview/ai-insight',
    data: params
  })
  return normalizeRevenueOverviewAiInsightResponse(
    unwrapIaaPayload<RevenueOverviewAiInsightResponse>(raw)
  )
}

function normalizeRevenueOverviewQualityMetricsResponse(
  raw: RevenueOverviewQualityMetricsResponse | null | undefined
): RevenueOverviewQualityMetricsResponse {
  const metrics = Array.isArray(raw?.metrics) ? raw.metrics : []
  return { metrics }
}

/** 收入总览 - 质量指标 POST .../overview/quality-metrics */
export async function fetchRevenueOverviewQualityMetrics(params: RevenueOverviewFilterState) {
  if (isRevenueOverviewEndpointMock(RevenueOverviewEndpoint.OverviewQualityMetrics)) {
    const { MOCK_REVENUE_OVERVIEW_QUALITY_METRICS } = await import(
      '@/views/business-insight/revenue-overview/mock'
    )
    return { metrics: MOCK_REVENUE_OVERVIEW_QUALITY_METRICS }
  }
  const raw = await request.post<unknown>({
    url: '/api/v1/datacenter/analysis/business-insight/revenue-overview/overview/quality-metrics',
    data: params
  })
  return normalizeRevenueOverviewQualityMetricsResponse(
    unwrapIaaPayload<RevenueOverviewQualityMetricsResponse>(raw)
  )
}

/** 利润分析 - 顶部 KPI POST .../overview/kpi，body 扁平 ProfitAnalysisQueryParams */
export function fetchProfitOverviewKpi(fo: ProfitAnalysisQueryParams) {
  return request.post<ProfitKpiOverviewDto>({
    url: `${PROFIT_BASE}/overview/kpi`,
    data: fo
  })
}

/** 利润分析 - 应用利润详情表 POST .../table/app-profit */
export function fetchProfitTableAppProfit(fo: ProfitAnalysisQueryParams) {
  return request.post<ProfitAppProfitResponseDto>({
    url: `${PROFIT_BASE}/table/app-profit`,
    data: fo
  })
}

/** 利润分析 - 国家利润分布 POST .../overview/country-profit */
export function fetchProfitOverviewCountryProfit(fo: ProfitAnalysisQueryParams) {
  return request.post<ProfitCountryProfitResponseDto>({
    url: `${PROFIT_BASE}/overview/country-profit`,
    data: fo
  })
}

/** 利润分析 - 近 30 天趋势 POST .../profit-analysis/overview/trend30d，响应 data 为 ProfitTrend30d */
export function fetchProfitOverviewTrend30d(fo: ProfitAnalysisQueryParams) {
  return request.post<ProfitTrend30d>({
    url: `${PROFIT_BASE}/overview/trend30d`,
    data: fo
  })
}

/** 利润分析 - 利润构成桑基图 POST .../overview/sankey */
export function fetchProfitOverviewSankey(fo: ProfitAnalysisQueryParams) {
  return request.post<ProfitSankeyDto>({
    url: `${PROFIT_BASE}/overview/sankey`,
    data: fo
  })
}

export async function fetchIaaTableAdPlatform(params: IaaFilterState) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.TableAdPlatform)) {
    return insightMock.mockFetchIaaTableAdPlatform(params)
  }
  const raw = await request.post<unknown>({
    url: `${IAA_BASE}/table/ad-platform`,
    data: normalizeIaaBody(params)
  })
  return unwrapIaaPayload<{ list: IaaPlatformTableRow[] }>(raw)
}

export async function fetchIaaAdTypeTabData(params: IaaFilterState) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.AdTypeTab)) {
    return insightMock.mockFetchIaaAdTypeTabData(params)
  }
  const raw = await request.post<unknown>({
    url: `${IAA_BASE}/overview/ad-type-tab`,
    data: normalizeIaaBody(params)
  })
  return unwrapIaaPayload<IaaAdTypeTabData>(raw)
}

export async function fetchIaaPlatformTabData(params: IaaFilterState) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.PlatformTab)) {
    return insightMock.mockFetchIaaPlatformTabData(params)
  }
  const raw = await request.post<unknown>({
    url: `${IAA_BASE}/overview/platform-tab`,
    data: normalizeIaaBody(params)
  })
  return normalizeIaaPlatformTabData(unwrapIaaPayload<unknown>(raw))
}

export async function fetchIaaPlacementTabData(params: IaaFilterState) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.PlacementTab)) {
    return insightMock.mockFetchIaaPlacementTabData(params)
  }
  const raw = await request.post<unknown>({
    url: `${IAA_BASE}/overview/placement-tab`,
    data: normalizeIaaBody(params)
  })
  return unwrapIaaPayload<IaaPlacementTabData>(raw)
}

export async function fetchIaaAdUnitTabData(params: IaaFilterState) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.AdUnitTab)) {
    return insightMock.mockFetchIaaAdUnitTabData(params)
  }
  const raw = await request.post<unknown>({
    url: `${IAA_BASE}/overview/ad-unit-tab`,
    data: normalizeIaaBody(params)
  })
  return unwrapIaaPayload<IaaAdUnitTabData>(raw)
}

export async function fetchIaaCountryTabData(params: IaaFilterState) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.CountryTab)) {
    return insightMock.mockFetchIaaCountryTabData(params)
  }
  const raw = await request.post<unknown>({
    url: `${IAA_BASE}/overview/country-tab`,
    data: normalizeIaaBody(params)
  })
  return unwrapIaaPayload<IaaCountryTabData>(raw)
}

export async function fetchIaaVersionTabData(params: IaaFilterState) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.VersionTab)) {
    return insightMock.mockFetchIaaVersionTabData(params)
  }
  const raw = await request.post<unknown>({
    url: `${IAA_BASE}/overview/version-tab`,
    data: normalizeIaaBody(params)
  })
  return unwrapIaaPayload<IaaVersionTabData>(raw)
}
