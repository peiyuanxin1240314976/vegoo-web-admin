/**
 * 用户增长 - 整体回收 API（Mock / 远程由模块 `views/user-growth/overall-recovery/config/data-source` 切换）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type {
  OverallRecoveryFilterOptions,
  OverallRecoveryFilterState,
  OverallTabData,
  OrganicTabData
} from '@/views/user-growth/overall-recovery/types'
import { buildOverallRecoveryApiParams } from '@/views/user-growth/overall-recovery/utils/buildApiParams'
import {
  OverallRecoveryEndpoint,
  isOverallRecoveryEndpointMock
} from '@/views/user-growth/overall-recovery/config/data-source'
import * as overallRecoveryMock from '@/views/user-growth/overall-recovery/mock/overall-recovery-api-mock'

/** 与其它 user-growth 模块同级结构：`.../analysis/user-growth/overall-recovery` */
export const OVERALL_RECOVERY_BASE = `${ANALYSIS_API_BASE}/user-growth/overall-recovery`

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

/** 整体回收 - 下拉筛选选项 */
export function fetchOverallRecoveryFilterOptions() {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.MetaFilterOptions)) {
    return overallRecoveryMock.mockFetchOverallRecoveryMetaFilterOptions()
  }
  return request
    .post<any>({
      url: `${OVERALL_RECOVERY_BASE}/meta-filter-options`,
      data: {}
    })
    .then((res) => unwrapDataDeep<OverallRecoveryFilterOptions>(res))
    .then((opts) => ({
      appOptions: asArray(opts?.appOptions),
      sourceOptions: asArray(opts?.sourceOptions),
      countryOptions: asArray(opts?.countryOptions)
    }))
}

/** 整体回收 - Tab1 整体回收数据 */
export function fetchOverallTabData(
  filters: Pick<OverallRecoveryFilterState, 'dateRange' | 's_app_id' | 'source' | 's_country_code'>
) {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OverallTab)) {
    return overallRecoveryMock.mockFetchOverallRecoveryOverallTab()
  }
  const params = buildOverallRecoveryApiParams(filters)
  return request
    .post<any>({
      url: `${OVERALL_RECOVERY_BASE}/overall-tab`,
      data: params
    })
    .then((res) => unwrapDataDeep<OverallTabData>(res))
    .then((d) => {
      const obj = asRecord(d)
      return {
        kpis: asArray(obj.kpis),
        recoveryCurve: obj.recoveryCurve ?? { days: [], series: [] },
        dailyVolume: asArray(obj.dailyVolume),
        roiCompare: asArray(obj.roiCompare),
        detailRows: asArray(obj.detailRows)
      } satisfies OverallTabData
    })
}

/** 整体回收 - Tab2 自然量分析数据 */
export function fetchOrganicTabData(
  filters: Pick<OverallRecoveryFilterState, 'dateRange' | 's_app_id' | 'source' | 's_country_code'>
) {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OrganicTab)) {
    return overallRecoveryMock.mockFetchOverallRecoveryOrganicTab()
  }
  const params = buildOverallRecoveryApiParams(filters)
  return request
    .post<any>({
      url: `${OVERALL_RECOVERY_BASE}/organic-tab`,
      data: params
    })
    .then((res) => unwrapDataDeep<OrganicTabData>(res))
    .then((d) => {
      const obj = asRecord(d)
      const radar = asRecord(obj.radarData)
      const kfactorTrend = asRecord(obj.kfactorTrend)
      return {
        kpis: asArray(obj.kpis),
        trendData: asArray(obj.trendData),
        trafficSources: asArray(obj.trafficSources),
        radarData: {
          indicators: asArray(radar.indicators),
          organicValues: asArray(radar.organicValues),
          paidValues: asArray(radar.paidValues)
        },
        kfactorTrend: {
          dates: asArray(kfactorTrend.dates),
          values: asArray(kfactorTrend.values)
        },
        kfactorChannels: asArray(obj.kfactorChannels),
        countryTop8: asArray(obj.countryTop8)
      } satisfies OrganicTabData
    })
}
