/**
 * 用户增长 - 综合分析 API（Mock / 远程由模块 `views/user-growth/comprehensive-analysis/config/data-source` 切换）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import { toAppsRequestBody } from '@/utils/app-id-request'
import type {
  ComprehensiveAnalysisApiParams,
  ComprehensiveAnalysisData,
  ComprehensiveAnalysisFilterOptions,
  ComprehensiveAnalysisFilterState,
  KpiCard,
  PlatformCpiBarData,
  PlatformCpiBarItem,
  AppCpiRankItem,
  AlertItem,
  PlatformCpiTrend,
  TrendSeries,
  EcpmAnalysis,
  SelectOption,
  CountryCpiMapItem,
  CountryCpiTopItem
} from '@/views/user-growth/comprehensive-analysis/types'
import { buildComprehensiveAnalysisApiParams } from '@/views/user-growth/comprehensive-analysis/utils/buildApiParams'
import {
  ComprehensiveAnalysisEndpoint,
  isComprehensiveAnalysisEndpointMock
} from '@/views/user-growth/comprehensive-analysis/config/data-source'
import * as comprehensiveAnalysisMock from '@/views/user-growth/comprehensive-analysis/mock/comprehensive-analysis-api-mock'
import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'

/** 与 `MY_PERFORMANCE_BASE` 同级结构：`.../analysis/user-growth/comprehensive-analysis` */
export const COMPREHENSIVE_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/user-growth/comprehensive-analysis`

function withApps<T extends { appIds: string[] }>(params: T) {
  return {
    ...params,
    apps: toAppsRequestBody(params.appIds)
  }
}

/**
 * 兼容后端多层 data 包裹：
 * - request 层已返回 `res.data.data`
 * - 部分网关会继续包一层/多层 `data`
 */
function unwrapDataDeep<T = unknown>(value: unknown, maxDepth = 3): T {
  let cur: any = value
  let depth = 0
  while (depth < maxDepth && cur && typeof cur === 'object' && 'data' in cur) {
    cur = (cur as any).data
    depth++
  }
  return cur as T
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' ? (value as Record<string, any>) : {}
}

const EMPTY_ECPM: EcpmAnalysis = {
  dates: [],
  estimated: [],
  actual: [],
  metrics: {
    estimatedEcpm: '-',
    actualEcpm: '-',
    biasRate: '-',
    biasAmount: '-'
  }
}

/** meta 下拉「全部」须与请求体一致为 `''`；兼容后端仍返回字面量 `all` */
function normalizeMetaSelectOptions(options: unknown): SelectOption[] {
  return asArray<SelectOption>(options).map((o) => ({
    ...o,
    value: o.value === 'all' ? '' : o.value
  }))
}

/**
 * 筛选项与公用 **`GET .../cockpit/meta-filter-options`** 同构：读 Pinia **`useCockpitMetaFilterStore`**，
 * 不调用本模块 `.../comprehensive-analysis/meta-filter-options`。
 * 供仍使用 `fetch*` 命名的历史调用方（如其它页的 `onMounted`）兼容；新页面优先用 `useCockpitMetaFilterOptions`。
 */
export async function fetchComprehensiveAnalysisFilterOptions(): Promise<ComprehensiveAnalysisFilterOptions> {
  const store = useCockpitMetaFilterStore()
  const raw = await store.ensureLoaded()
  if (!raw) {
    return { appOptions: [], sourceOptions: [], countryOptions: [] }
  }
  return {
    appOptions: normalizeMetaSelectOptions(raw.appOptions),
    sourceOptions: normalizeMetaSelectOptions(raw.sourceOptions),
    countryOptions: normalizeMetaSelectOptions(raw.countryOptions)
  }
}

/** 契约 02-kpi — POST */
export function fetchComprehensiveAnalysisKpi(params: ComprehensiveAnalysisApiParams) {
  if (isComprehensiveAnalysisEndpointMock(ComprehensiveAnalysisEndpoint.Kpi)) {
    return comprehensiveAnalysisMock.mockFetchComprehensiveAnalysisKpi(params)
  }
  return request
    .post<any>({
      url: `${COMPREHENSIVE_ANALYSIS_BASE}/kpi`,
      data: withApps(params)
    })
    .then((res) => asArray<KpiCard>(unwrapDataDeep(res)))
}

/** 契约 03-platform-cpi-bar — POST */
export function fetchComprehensiveAnalysisPlatformCpiBar(params: ComprehensiveAnalysisApiParams) {
  if (isComprehensiveAnalysisEndpointMock(ComprehensiveAnalysisEndpoint.PlatformCpiBar)) {
    return comprehensiveAnalysisMock.mockFetchComprehensiveAnalysisPlatformCpiBar(params)
  }
  return request
    .post<any>({
      url: `${COMPREHENSIVE_ANALYSIS_BASE}/platform-cpi-bar`,
      data: withApps(params)
    })
    .then((res) => unwrapDataDeep<PlatformCpiBarData>(res))
    .then((d) => ({
      target: typeof d?.target === 'number' ? d.target : 0,
      items: asArray<PlatformCpiBarItem>(d?.items)
    }))
}

/** 契约 04-app-cpi-rank — POST */
export function fetchComprehensiveAnalysisAppCpiRank(params: ComprehensiveAnalysisApiParams) {
  if (isComprehensiveAnalysisEndpointMock(ComprehensiveAnalysisEndpoint.AppCpiRank)) {
    return comprehensiveAnalysisMock.mockFetchComprehensiveAnalysisAppCpiRank(params)
  }
  return request
    .post<any>({
      url: `${COMPREHENSIVE_ANALYSIS_BASE}/app-cpi-rank`,
      data: withApps(params)
    })
    .then((res) => asArray<AppCpiRankItem>(unwrapDataDeep(res)))
}

/** 契约 05-country-distribution — POST */
export function fetchComprehensiveAnalysisCountryDistribution(
  params: ComprehensiveAnalysisApiParams
) {
  if (isComprehensiveAnalysisEndpointMock(ComprehensiveAnalysisEndpoint.CountryDistribution)) {
    return comprehensiveAnalysisMock.mockFetchComprehensiveAnalysisCountryDistribution(params)
  }
  return request
    .post<any>({
      url: `${COMPREHENSIVE_ANALYSIS_BASE}/country-distribution`,
      data: withApps(params)
    })
    .then((res) => unwrapDataDeep(res))
    .then((d) => {
      const obj = asRecord(d)
      return {
        mapItems: asArray<CountryCpiMapItem>(obj.mapItems),
        top8: asArray<CountryCpiTopItem>(obj.top8)
      }
    })
}

/** 契约 06-alerts — POST */
export function fetchComprehensiveAnalysisAlerts(params: ComprehensiveAnalysisApiParams) {
  if (isComprehensiveAnalysisEndpointMock(ComprehensiveAnalysisEndpoint.Alerts)) {
    return comprehensiveAnalysisMock.mockFetchComprehensiveAnalysisAlerts(params)
  }
  return request
    .post<any>({
      url: `${COMPREHENSIVE_ANALYSIS_BASE}/alerts`,
      data: withApps(params)
    })
    .then((res) => asArray<AlertItem>(unwrapDataDeep(res)))
}

/** 契约 07-platform-cpi-trend — POST */
export function fetchComprehensiveAnalysisPlatformCpiTrend(params: ComprehensiveAnalysisApiParams) {
  if (isComprehensiveAnalysisEndpointMock(ComprehensiveAnalysisEndpoint.PlatformCpiTrend)) {
    return comprehensiveAnalysisMock.mockFetchComprehensiveAnalysisPlatformCpiTrend(params)
  }
  return request
    .post<any>({
      url: `${COMPREHENSIVE_ANALYSIS_BASE}/platform-cpi-trend`,
      data: withApps(params)
    })
    .then((res) => unwrapDataDeep<PlatformCpiTrend>(res))
    .then((d) => ({
      dates: asArray<string>(d?.dates),
      target: typeof d?.target === 'number' ? d.target : 0,
      series: asArray<TrendSeries>(d?.series)
    }))
}

/** 契约 08-ecpm-analysis — POST */
export function fetchComprehensiveAnalysisEcpmAnalysis(params: ComprehensiveAnalysisApiParams) {
  if (isComprehensiveAnalysisEndpointMock(ComprehensiveAnalysisEndpoint.EcpmAnalysis)) {
    return comprehensiveAnalysisMock.mockFetchComprehensiveAnalysisEcpmAnalysis(params)
  }
  return request
    .post<any>({
      url: `${COMPREHENSIVE_ANALYSIS_BASE}/ecpm-analysis`,
      data: withApps(params)
    })
    .then((res) => unwrapDataDeep(res))
    .then((d) => {
      const obj = asRecord(d)
      const metrics = asRecord(obj.metrics)
      return {
        dates: asArray<string>(obj.dates),
        estimated: asArray<number>(obj.estimated),
        actual: asArray<number>(obj.actual),
        metrics: {
          estimatedEcpm: String(metrics.estimatedEcpm ?? EMPTY_ECPM.metrics.estimatedEcpm),
          actualEcpm: String(metrics.actualEcpm ?? EMPTY_ECPM.metrics.actualEcpm),
          biasRate: String(metrics.biasRate ?? EMPTY_ECPM.metrics.biasRate),
          biasAmount: String(metrics.biasAmount ?? EMPTY_ECPM.metrics.biasAmount)
        }
      } satisfies EcpmAnalysis
    })
}

/**
 * 页面聚合：内部按契约拆分请求后合并为 `ComprehensiveAnalysisData`。
 */
export async function fetchComprehensiveAnalysisData(filters: ComprehensiveAnalysisFilterState) {
  const params = buildComprehensiveAnalysisApiParams(filters)
  const [
    kpis,
    platformCpiBar,
    appCpiRank,
    countryDistribution,
    alerts,
    platformCpiTrend,
    ecpmAnalysis
  ] = await Promise.all([
    fetchComprehensiveAnalysisKpi(params),
    fetchComprehensiveAnalysisPlatformCpiBar(params),
    fetchComprehensiveAnalysisAppCpiRank(params),
    fetchComprehensiveAnalysisCountryDistribution(params),
    fetchComprehensiveAnalysisAlerts(params),
    fetchComprehensiveAnalysisPlatformCpiTrend(params),
    fetchComprehensiveAnalysisEcpmAnalysis(params)
  ])

  const emptyBar: PlatformCpiBarData = { target: 0, items: [] }
  const emptyTrend: PlatformCpiTrend = { dates: [], target: 0, series: [] }

  return {
    kpis: asArray<KpiCard>(kpis),
    platformCpiBar: platformCpiBar ?? emptyBar,
    appCpiRank: asArray<AppCpiRankItem>(appCpiRank),
    countryCpiMap: asArray<CountryCpiMapItem>(countryDistribution?.mapItems),
    countryTop8: asArray<CountryCpiTopItem>(countryDistribution?.top8),
    alerts: asArray<AlertItem>(alerts),
    platformCpiTrend: platformCpiTrend ?? emptyTrend,
    ecpmAnalysis: ecpmAnalysis ?? EMPTY_ECPM
  } satisfies ComprehensiveAnalysisData
}
