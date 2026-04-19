/**
 * 用户增长 - 整体回收 API（Mock / 远程由模块 `views/user-growth/overall-recovery/config/data-source` 切换）
 *
 * 顶栏筛选项复用公用 **`GET .../cockpit/meta-filter-options`**（`useCockpitMetaFilterStore`），本模块不提供 meta-filter-options。
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import { toAppsRequestBody } from '@/utils/app-id-request'
import type {
  DailyVolumeItem,
  OrganicTabData,
  OverallKpiCard,
  OverallRecoveryFilterState,
  OverallTabData,
  RecoveryCurveData,
  RecoveryDetailRow,
  RoiCompareRow
} from '@/views/user-growth/overall-recovery/types'
import {
  buildOverallRecoveryCommonBody,
  buildOverallRecoveryDetailRecordsBody
} from '@/views/user-growth/overall-recovery/utils/buildApiParams'
import {
  OverallRecoveryEndpoint,
  isOverallRecoveryEndpointMock
} from '@/views/user-growth/overall-recovery/config/data-source'
import * as overallRecoveryMock from '@/views/user-growth/overall-recovery/mock/overall-recovery-api-mock'

/** 与其它 user-growth 模块同级结构：`.../analysis/user-growth/overall-recovery` */
export const OVERALL_RECOVERY_BASE = `${ANALYSIS_API_BASE}/user-growth/overall-recovery`

function withApps<T extends { appIds: string[] }>(body: T) {
  return {
    ...body,
    apps: toAppsRequestBody(body.appIds)
  }
}

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

type OverallFilterPick = Pick<
  OverallRecoveryFilterState,
  'startDate' | 'endDate' | 's_app_id' | 'source' | 's_country_code'
>

/** Tab1 — KPI */
export function fetchOverallTabKpis(filters: OverallFilterPick) {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OverallTabKpis)) {
    return overallRecoveryMock.mockFetchOverallTabKpis()
  }
  const data = buildOverallRecoveryCommonBody(filters)
  return request
    .post<any>({ url: `${OVERALL_RECOVERY_BASE}/overall-tab/kpis`, data: withApps(data) })
    .then((res) => asRecord(unwrapDataDeep(res)))
    .then((obj) => ({ kpis: asArray(obj.kpis) }))
}

/** Tab1 — 回收曲线 */
export function fetchOverallTabRecoveryCurve(filters: OverallFilterPick) {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OverallTabRecoveryCurve)) {
    return overallRecoveryMock.mockFetchOverallTabRecoveryCurve()
  }
  const data = buildOverallRecoveryCommonBody(filters)
  return request
    .post<any>({ url: `${OVERALL_RECOVERY_BASE}/overall-tab/recovery-curve`, data: withApps(data) })
    .then((res) => asRecord(unwrapDataDeep(res)))
    .then((obj) => ({
      recoveryCurve: obj.recoveryCurve ?? { days: [], series: [] }
    }))
}

/** Tab1 — 日均量 */
export function fetchOverallTabDailyVolume(filters: OverallFilterPick) {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OverallTabDailyVolume)) {
    return overallRecoveryMock.mockFetchOverallTabDailyVolume()
  }
  const data = buildOverallRecoveryCommonBody(filters)
  return request
    .post<any>({ url: `${OVERALL_RECOVERY_BASE}/overall-tab/daily-volume`, data: withApps(data) })
    .then((res) => asRecord(unwrapDataDeep(res)))
    .then((obj) => ({ dailyVolume: asArray(obj.dailyVolume) }))
}

/** Tab1 — ROI 对比 */
export function fetchOverallTabRoiCompare(filters: OverallFilterPick) {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OverallTabRoiCompare)) {
    return overallRecoveryMock.mockFetchOverallTabRoiCompare()
  }
  const data = buildOverallRecoveryCommonBody(filters)
  return request
    .post<any>({ url: `${OVERALL_RECOVERY_BASE}/overall-tab/roi-compare`, data: withApps(data) })
    .then((res) => asRecord(unwrapDataDeep(res)))
    .then((obj) => ({ roiCompare: asArray(obj.roiCompare) }))
}

/** Tab1 — 明细表（含卡片子筛；`all` 由调用方传入，在 body 构建时转为 `''`） */
export function fetchOverallTabDetailRecords(
  filters: OverallFilterPick,
  detail: { detailApp: string; detailChannel: string }
): Promise<{ detailRows: RecoveryDetailRow[] }> {
  const data = buildOverallRecoveryDetailRecordsBody(filters, detail)
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OverallTabDetailRecords)) {
    return overallRecoveryMock.mockFetchOverallTabDetailRecords(data)
  }
  return request
    .post<any>({ url: `${OVERALL_RECOVERY_BASE}/overall-tab/detail-records`, data: withApps(data) })
    .then((res) => asRecord(unwrapDataDeep(res)))
    .then((obj) => ({ detailRows: asArray(obj.detailRows) as RecoveryDetailRow[] }))
}

/** Tab1 — 并行拉齐五段数据（等价于旧单接口 `overall-tab`） */
export function fetchOverallTabData(filters: OverallFilterPick): Promise<OverallTabData> {
  const detailAll = { detailApp: 'all' as const, detailChannel: 'all' as const }
  return Promise.all([
    fetchOverallTabKpis(filters),
    fetchOverallTabRecoveryCurve(filters),
    fetchOverallTabDailyVolume(filters),
    fetchOverallTabRoiCompare(filters),
    fetchOverallTabDetailRecords(filters, detailAll)
  ]).then(
    ([kpi, curve, vol, roi, det]): OverallTabData => ({
      kpis: kpi.kpis as OverallKpiCard[],
      recoveryCurve: curve.recoveryCurve as RecoveryCurveData,
      dailyVolume: vol.dailyVolume as DailyVolumeItem[],
      roiCompare: roi.roiCompare as RoiCompareRow[],
      detailRows: det.detailRows
    })
  )
}

/** 整体回收 - Tab2 自然量分析数据 */
export function fetchOrganicTabData(filters: OverallFilterPick) {
  if (isOverallRecoveryEndpointMock(OverallRecoveryEndpoint.OrganicTab)) {
    return overallRecoveryMock.mockFetchOverallRecoveryOrganicTab()
  }
  const data = buildOverallRecoveryCommonBody(filters)
  return request
    .post<any>({
      url: `${OVERALL_RECOVERY_BASE}/organic-tab`,
      data: withApps(data)
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
