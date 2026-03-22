/**
 * 商业洞察 - IAA / IAP 分析 API（Mock / 远程由模块配置切换）
 * IAP 分片接口见 ./iap-analysis.ts（与 iap-analysis/mock/backend-api 契约对齐）
 */
import request from '@/utils/http'
import { isBusinessInsightIaaIapUsingMock } from '@/views/business-insight/config/data-source'
import * as insightMock from '@/views/business-insight/mocks/business-insight-api-mock'
import type {
  IaaFilterOptions,
  IaaKpiCard,
  IaaPlatformTableRow,
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

export function fetchIaaMetaFilterOptions() {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaMetaFilterOptions()
  return request.get<IaaFilterOptions>({ url: `${IAA_BASE}/meta-filter-options` })
}

export function fetchIaaOverviewKpi(params: {
  tab: string
  s_app_id?: string
  platform?: string
  s_country_code?: string
  t_date: string
}) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaOverviewKpi(params)
  const body = {
    tab: params.tab,
    ...normalizeIaaBody({
      s_app_id: params.s_app_id ?? 'all',
      platform: params.platform ?? 'all',
      s_country_code: params.s_country_code ?? 'all',
      t_date: params.t_date
    })
  }
  return request.post<{ kpis: IaaKpiCard[] }>({ url: `${IAA_BASE}/overview-kpi`, data: body })
}

export function fetchIaaTableAdPlatform(params: IaaFilterState) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaTableAdPlatform(params)
  return request.post<{ list: IaaPlatformTableRow[] }>({
    url: `${IAA_BASE}/table/ad-platform`,
    data: normalizeIaaBody(params)
  })
}

export function fetchIaaAdTypeTabData(params: IaaFilterState) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaAdTypeTabData(params)
  return request.post<IaaAdTypeTabData>({
    url: `${IAA_BASE}/overview/ad-type-tab`,
    data: normalizeIaaBody(params)
  })
}

export function fetchIaaPlatformTabData(params: IaaFilterState) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaPlatformTabData(params)
  return request.post<IaaPlatformTabData>({
    url: `${IAA_BASE}/overview/platform-tab`,
    data: normalizeIaaBody(params)
  })
}

export function fetchIaaPlacementTabData(params: IaaFilterState) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaPlacementTabData(params)
  return request.post<IaaPlacementTabData>({
    url: `${IAA_BASE}/overview/placement-tab`,
    data: normalizeIaaBody(params)
  })
}

export function fetchIaaAdUnitTabData(params: IaaFilterState) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaAdUnitTabData(params)
  return request.post<IaaAdUnitTabData>({
    url: `${IAA_BASE}/overview/ad-unit-tab`,
    data: normalizeIaaBody(params)
  })
}

export function fetchIaaCountryTabData(params: IaaFilterState) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaCountryTabData(params)
  return request.post<IaaCountryTabData>({
    url: `${IAA_BASE}/overview/country-tab`,
    data: normalizeIaaBody(params)
  })
}

export function fetchIaaVersionTabData(params: IaaFilterState) {
  if (isBusinessInsightIaaIapUsingMock()) return insightMock.mockFetchIaaVersionTabData(params)
  return request.post<IaaVersionTabData>({
    url: `${IAA_BASE}/overview/version-tab`,
    data: normalizeIaaBody(params)
  })
}
