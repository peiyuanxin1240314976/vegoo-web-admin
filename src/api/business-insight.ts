/**
 * 商业洞察 - IAA / IAP 分析 API（Mock / 远程由模块配置切换）
 * IAP 分片接口见 ./iap-analysis.ts（与 iap-analysis/mock/backend-api 契约对齐）
 */
import request from '@/utils/http'
import {
  IaaAnalysisEndpoint,
  isIaaAnalysisEndpointMock
} from '@/views/business-insight/iaa-analysis/config/data-source'
import * as insightMock from '@/views/business-insight/mocks/business-insight-api-mock'
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

const IAA_BASE = '/api/v1/datacenter/analysis/business-insight/iaa-analysis'

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

export async function fetchIaaOverviewKpi(params: {
  tab: string
  s_app_id?: string
  platform?: string
  s_country_code?: string
  t_date: string
}) {
  if (isIaaAnalysisEndpointMock(IaaAnalysisEndpoint.OverviewKpi)) {
    return insightMock.mockFetchIaaOverviewKpi(params)
  }
  const body = {
    tab: params.tab,
    ...normalizeIaaBody({
      s_app_id: params.s_app_id ?? 'all',
      platform: params.platform ?? 'all',
      s_country_code: params.s_country_code ?? 'all',
      t_date: params.t_date
    })
  }
  const raw = await request.post<unknown>({ url: `${IAA_BASE}/overview-kpi`, data: body })
  return unwrapIaaPayload<{ kpis: IaaKpiCard[] }>(raw)
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
