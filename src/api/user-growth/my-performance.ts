/**
 * 用户增长 - 我的绩效 API（Mock / 远程由模块 `views/user-growth/my-performance/config/data-source` 切换）
 *
 * 根路径与 IAP 一致：`/api/v1/datacenter/analysis/{模块}/{子模块}`，见 `iap-analysis.ts` 的 `IAP_BASE`
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  MyPerformanceEndpoint,
  isMyPerformanceEndpointMock
} from '@/views/user-growth/my-performance/config/data-source'
import * as myPerformanceMock from '@/views/user-growth/my-performance/mock/my-performance-api-mock'
import type {
  MyPerformanceAppDimensionTableQueryBody,
  MyPerformanceAppDimensionTableResponse,
  MyPerformanceKpiAchievementResponse,
  MyPerformanceMetaPeriodResponse,
  MyPerformanceMetaPersonResponse,
  MyPerformanceOverviewKpiResponse,
  MyPerformancePeriodOption,
  MyPerformancePeriodType,
  MyPerformancePerformanceHistoryResponse,
  MyPerformanceQueryBody,
  MyPerformanceRoiTrendPoint,
  MyPerformanceRoiTrendResponse,
  MyPerformanceSpendProgressItem,
  MyPerformanceSpendProgressResponse,
  MyPerformanceSpendProgressTone
} from '@/views/user-growth/my-performance/types'

/** 与 `IAP_BASE` 同级结构：`.../analysis/user-growth/my-performance` */
export const MY_PERFORMANCE_BASE = `${ANALYSIS_API_BASE}/user-growth/my-performance`

/**
 * 网关在 BaseResponse.data 内再包一层且业务体为 `{ data: T }` 单键对象时，http 取到的是该外壳，此处再剥一层。
 * 若业务体本身含 `data` 键且为唯一子键才会再剥（spend-progress 新版为 `title` + `list`，不会被误剥）。
 */
function unwrapMyPerformancePayload<T>(raw: unknown): T {
  if (raw === null || raw === undefined) return raw as T
  if (typeof raw !== 'object' || Array.isArray(raw)) return raw as T
  const o = raw as Record<string, unknown>
  const keys = Object.keys(o)
  if (
    keys.length === 1 &&
    keys[0] === 'data' &&
    o.data !== null &&
    o.data !== undefined &&
    typeof o.data === 'object' &&
    !Array.isArray(o.data)
  ) {
    return o.data as T
  }
  return raw as T
}

function bodyForRemote(body: MyPerformanceQueryBody) {
  return {
    personId: body.personId,
    periodType: body.periodType,
    periodValue: body.periodValue
  }
}

function bodyForAppDimensionTableRemote(body: MyPerformanceAppDimensionTableQueryBody) {
  return {
    personId: body.personId,
    startDate: body.startDate,
    endDate: body.endDate
  }
}

function mapPeriodOptionList(items: unknown): MyPerformancePeriodOption[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((x) => x !== null && x !== undefined && typeof x === 'object')
    .map((x) => {
      const r = x as Record<string, unknown>
      const value = r.value != null ? String(r.value) : ''
      const label = r.label != null ? String(r.label) : value
      return { label, value }
    })
    .filter((x) => x.value.length > 0)
}

/**
 * 契约：`periodOptions` + `selectedPeriod`。
 * 远程常见：`types` + `quarterValues` + `monthValues`（与 Mock 契约字段名不一致时在此收敛）。
 */
function mapRemoteMetaPeriodToContract(raw: unknown): MyPerformanceMetaPeriodResponse {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      periodOptions: { quarter: [], month: [] },
      selectedPeriod: { periodType: 'month', periodValue: '' }
    }
  }
  const o = raw as Record<string, unknown>
  const po = o.periodOptions
  if (po !== null && po !== undefined && typeof po === 'object' && !Array.isArray(po)) {
    return raw as MyPerformanceMetaPeriodResponse
  }

  const quarter = mapPeriodOptionList(o.quarterValues ?? o.quarter_values)
  const month = mapPeriodOptionList(o.monthValues ?? o.month_values)

  let periodType: MyPerformancePeriodType = 'month'
  let periodValue = ''
  if (month[0]?.value) {
    periodType = 'month'
    periodValue = month[0].value
  } else if (quarter[0]?.value) {
    periodType = 'quarter'
    periodValue = quarter[0].value
  }

  return {
    periodOptions: { quarter, month },
    selectedPeriod: { periodType, periodValue }
  }
}

function parseRoiPercent(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number(
    String(v ?? '')
      .replace(/%/g, '')
      .trim()
  )
  return Number.isFinite(n) ? n : 0
}

function normalizeRoiTrendPointsFromContract(items: unknown): MyPerformanceRoiTrendPoint[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((p) => p !== null && p !== undefined && typeof p === 'object')
    .map((p) => {
      const r = p as Record<string, unknown>
      const point: MyPerformanceRoiTrendPoint = {
        date: String(r.date ?? ''),
        roi: parseRoiPercent(r.roi)
      }
      if (r.targetRoi != null) point.targetRoi = parseRoiPercent(r.targetRoi)
      return point
    })
}

/**
 * 契约：`{ title, points: { date, roi }[] }`。
 * 远程常见：`{ roiTrend: { title, xAxis[], series[] } }`（与 ECharts option 接近）。
 */
function mapRemoteRoiTrendToContract(raw: unknown): MyPerformanceRoiTrendResponse {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return { title: '', points: [] }
  }
  const root = raw as Record<string, unknown>
  const payload =
    root.roiTrend !== null &&
    root.roiTrend !== undefined &&
    typeof root.roiTrend === 'object' &&
    !Array.isArray(root.roiTrend)
      ? (root.roiTrend as Record<string, unknown>)
      : root

  if (Array.isArray(payload.points)) {
    return {
      title: String(payload.title ?? ''),
      points: normalizeRoiTrendPointsFromContract(payload.points)
    }
  }

  const title = String(payload.title ?? 'ROI 趋势')
  const xAxis = Array.isArray(payload.xAxis) ? payload.xAxis : []
  const seriesRaw = Array.isArray(payload.series) ? payload.series : []
  const lineSeries = seriesRaw.filter(
    (s): s is Record<string, unknown> =>
      s !== null &&
      typeof s === 'object' &&
      !Array.isArray(s) &&
      String((s as Record<string, unknown>).type ?? 'line') === 'line'
  )
  const d0 = Array.isArray(lineSeries[0]?.data) ? (lineSeries[0]!.data as unknown[]) : []
  const d1 = Array.isArray(lineSeries[1]?.data) ? (lineSeries[1]!.data as unknown[]) : []

  const points: MyPerformanceRoiTrendPoint[] = xAxis.map((x, i) => {
    const date = String(x ?? '')
    const roi = parseRoiPercent(d0[i])
    const point: MyPerformanceRoiTrendPoint = { date, roi }
    if (lineSeries.length > 1 && d1.length > i) {
      point.targetRoi = parseRoiPercent(d1[i])
    }
    return point
  })

  return { title, points }
}

const EMPTY_SPEND_PROGRESS: MyPerformanceSpendProgressResponse = {
  title: '',
  list: []
}

const SPEND_PROGRESS_TONES: MyPerformanceSpendProgressTone[] = [
  'success',
  'warning',
  'danger',
  'primary',
  'default'
]

function clampSpendProgressRate(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
}

function formatSpendProgressUsd2(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function normalizeSpendProgressList(items: unknown): MyPerformanceSpendProgressItem[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((x) => x !== null && x !== undefined && typeof x === 'object')
    .map((x) => {
      const r = x as Record<string, unknown>
      const label = r.label != null ? String(r.label) : ''
      const value = r.value != null ? String(r.value) : ''
      const rawRate = r.rate
      const rateNum =
        typeof rawRate === 'number' && Number.isFinite(rawRate)
          ? rawRate
          : Number(
              String(rawRate ?? '')
                .replace(/%/g, '')
                .trim()
            )
      const typeRaw = r.type != null ? String(r.type) : ''
      const type = SPEND_PROGRESS_TONES.includes(typeRaw as MyPerformanceSpendProgressTone)
        ? (typeRaw as MyPerformanceSpendProgressTone)
        : undefined
      const row: MyPerformanceSpendProgressItem = {
        label,
        value,
        rate: clampSpendProgressRate(Number.isFinite(rateNum) ? rateNum : 0)
      }
      if (type) row.type = type
      return row
    })
}

/**
 * 契约：`{ title, list }`（网关 `data.spendProgress`）。
 * 兼容旧版 `{ title, data: { spend, target, rate } }` 或顶层 spend/target/rate。
 */
function mapRemoteSpendProgressToContract(raw: unknown): MyPerformanceSpendProgressResponse {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return EMPTY_SPEND_PROGRESS
  }
  const root = raw as Record<string, unknown>
  const payload =
    root.spendProgress !== null &&
    root.spendProgress !== undefined &&
    typeof root.spendProgress === 'object' &&
    !Array.isArray(root.spendProgress)
      ? (root.spendProgress as Record<string, unknown>)
      : root

  const title = String(payload.title ?? '')

  if (Array.isArray(payload.list)) {
    return { title, list: normalizeSpendProgressList(payload.list) }
  }

  const inner = payload.data
  if (inner !== null && inner !== undefined && typeof inner === 'object' && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>
    const spend = Number(d.spend ?? 0)
    const target = Number(d.target ?? 0)
    const rate = clampSpendProgressRate(Number(d.rate ?? 0))
    return {
      title,
      list: [
        {
          label: '总消耗',
          value: `${formatSpendProgressUsd2(spend)} / ${formatSpendProgressUsd2(target)}`,
          rate,
          type: 'success'
        }
      ]
    }
  }

  if ('spend' in payload || 'target' in payload || 'rate' in payload) {
    const spend = Number(payload.spend ?? 0)
    const target = Number(payload.target ?? 0)
    const rate = clampSpendProgressRate(Number(payload.rate ?? 0))
    return {
      title,
      list: [
        {
          label: '总消耗',
          value: `${formatSpendProgressUsd2(spend)} / ${formatSpendProgressUsd2(target)}`,
          rate,
          type: 'success'
        }
      ]
    }
  }

  return { title, list: [] }
}

/** 契约 01-meta-person-options — GET */
export function fetchMyPerformanceMetaPersonOptions() {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.MetaPersonOptions)) {
    return myPerformanceMock.mockFetchMyPerformanceMetaPersonOptions()
  }
  return request
    .get({ url: `${MY_PERFORMANCE_BASE}/meta-person-options` })
    .then((raw) => unwrapMyPerformancePayload<MyPerformanceMetaPersonResponse>(raw))
}

/** 契约 02-meta-period-options — GET，personId 可选 */
export function fetchMyPerformanceMetaPeriodOptions(params?: { personId?: string }) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.MetaPeriodOptions)) {
    return myPerformanceMock.mockFetchMyPerformanceMetaPeriodOptions(params)
  }
  return request
    .get({
      url: `${MY_PERFORMANCE_BASE}/meta-period-options`,
      params: params?.personId ? { personId: params.personId } : undefined
    })
    .then((raw) => mapRemoteMetaPeriodToContract(unwrapMyPerformancePayload<unknown>(raw)))
}

/** 契约 03-overview-kpi — POST */
export function fetchMyPerformanceOverviewKpi(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.OverviewKpi)) {
    return myPerformanceMock.mockFetchMyPerformanceOverviewKpi(body)
  }
  return request
    .post({
      url: `${MY_PERFORMANCE_BASE}/overview-kpi`,
      data: bodyForRemote(body)
    })
    .then((raw) => unwrapMyPerformancePayload<MyPerformanceOverviewKpiResponse>(raw))
}

/** 契约 04-kpi-achievement — POST */
export function fetchMyPerformanceKpiAchievement(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.KpiAchievement)) {
    return myPerformanceMock.mockFetchMyPerformanceKpiAchievement(body)
  }
  return request
    .post({
      url: `${MY_PERFORMANCE_BASE}/kpi-achievement`,
      data: bodyForRemote(body)
    })
    .then((raw) => unwrapMyPerformancePayload<MyPerformanceKpiAchievementResponse>(raw))
}

/** 契约 05-roi-trend — POST */
export function fetchMyPerformanceRoiTrend(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.RoiTrend)) {
    return myPerformanceMock.mockFetchMyPerformanceRoiTrend(body)
  }
  return request
    .post({
      url: `${MY_PERFORMANCE_BASE}/roi-trend`,
      data: bodyForRemote(body)
    })
    .then((raw) => mapRemoteRoiTrendToContract(unwrapMyPerformancePayload<unknown>(raw)))
}

/** 契约 06-spend-progress — POST */
export function fetchMyPerformanceSpendProgress(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.SpendProgress)) {
    return myPerformanceMock.mockFetchMyPerformanceSpendProgress(body)
  }
  return request
    .post({
      url: `${MY_PERFORMANCE_BASE}/spend-progress`,
      data: bodyForRemote(body)
    })
    .then((raw) => mapRemoteSpendProgressToContract(unwrapMyPerformancePayload<unknown>(raw)))
}

/** 契约 09-app-dimension-table-by-date-range — POST */
export function fetchMyPerformanceAppDimensionTable(body: MyPerformanceAppDimensionTableQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.AppDimensionTableByDateRange)) {
    return myPerformanceMock.mockFetchMyPerformanceAppDimensionTable(body)
  }
  return request
    .post({
      url: `${MY_PERFORMANCE_BASE}/app-dimension-table-by-date-range`,
      data: bodyForAppDimensionTableRemote(body)
    })
    .then((raw) => unwrapMyPerformancePayload<MyPerformanceAppDimensionTableResponse>(raw))
}

/** 契约 08-performance-history — POST */
export function fetchMyPerformancePerformanceHistory(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.PerformanceHistory)) {
    return myPerformanceMock.mockFetchMyPerformancePerformanceHistory(body)
  }
  return request
    .post({
      url: `${MY_PERFORMANCE_BASE}/performance-history`,
      data: bodyForRemote(body)
    })
    .then((raw) => unwrapMyPerformancePayload<MyPerformancePerformanceHistoryResponse>(raw))
}
