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
  MyPerformanceAppDimensionTableResponse,
  MyPerformanceKpiAchievementResponse,
  MyPerformanceMetaPeriodResponse,
  MyPerformanceMetaPersonResponse,
  MyPerformanceOverviewKpiResponse,
  MyPerformancePerformanceHistoryResponse,
  MyPerformanceQueryBody,
  MyPerformanceRoiTrendResponse,
  MyPerformanceSpendProgressResponse
} from '@/views/user-growth/my-performance/types'

/** 与 `IAP_BASE` 同级结构：`.../analysis/user-growth/my-performance` */
export const MY_PERFORMANCE_BASE = `${ANALYSIS_API_BASE}/user-growth/my-performance`

function bodyForRemote(body: MyPerformanceQueryBody) {
  return {
    personId: body.personId,
    periodType: body.periodType,
    periodValue: body.periodValue
  }
}

/** 契约 01-meta-person-options — GET */
export function fetchMyPerformanceMetaPersonOptions() {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.MetaPersonOptions)) {
    return myPerformanceMock.mockFetchMyPerformanceMetaPersonOptions()
  }
  return request.get<MyPerformanceMetaPersonResponse>({
    url: `${MY_PERFORMANCE_BASE}/meta-person-options`
  })
}

/** 契约 02-meta-period-options — GET，personId 可选 */
export function fetchMyPerformanceMetaPeriodOptions(params?: { personId?: string }) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.MetaPeriodOptions)) {
    return myPerformanceMock.mockFetchMyPerformanceMetaPeriodOptions(params)
  }
  return request.get<MyPerformanceMetaPeriodResponse>({
    url: `${MY_PERFORMANCE_BASE}/meta-period-options`,
    params: params?.personId ? { personId: params.personId } : undefined
  })
}

/** 契约 03-overview-kpi — POST */
export function fetchMyPerformanceOverviewKpi(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.OverviewKpi)) {
    return myPerformanceMock.mockFetchMyPerformanceOverviewKpi(body)
  }
  return request.post<MyPerformanceOverviewKpiResponse>({
    url: `${MY_PERFORMANCE_BASE}/overview-kpi`,
    data: bodyForRemote(body)
  })
}

/** 契约 04-kpi-achievement — POST */
export function fetchMyPerformanceKpiAchievement(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.KpiAchievement)) {
    return myPerformanceMock.mockFetchMyPerformanceKpiAchievement(body)
  }
  return request.post<MyPerformanceKpiAchievementResponse>({
    url: `${MY_PERFORMANCE_BASE}/kpi-achievement`,
    data: bodyForRemote(body)
  })
}

/** 契约 05-roi-trend — POST */
export function fetchMyPerformanceRoiTrend(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.RoiTrend)) {
    return myPerformanceMock.mockFetchMyPerformanceRoiTrend(body)
  }
  return request.post<MyPerformanceRoiTrendResponse>({
    url: `${MY_PERFORMANCE_BASE}/roi-trend`,
    data: bodyForRemote(body)
  })
}

/** 契约 06-spend-progress — POST */
export function fetchMyPerformanceSpendProgress(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.SpendProgress)) {
    return myPerformanceMock.mockFetchMyPerformanceSpendProgress(body)
  }
  return request.post<MyPerformanceSpendProgressResponse>({
    url: `${MY_PERFORMANCE_BASE}/spend-progress`,
    data: bodyForRemote(body)
  })
}

/** 契约 07-app-dimension-table — POST */
export function fetchMyPerformanceAppDimensionTable(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.AppDimensionTable)) {
    return myPerformanceMock.mockFetchMyPerformanceAppDimensionTable(body)
  }
  return request.post<MyPerformanceAppDimensionTableResponse>({
    url: `${MY_PERFORMANCE_BASE}/app-dimension-table`,
    data: bodyForRemote(body)
  })
}

/** 契约 08-performance-history — POST */
export function fetchMyPerformancePerformanceHistory(body: MyPerformanceQueryBody) {
  if (isMyPerformanceEndpointMock(MyPerformanceEndpoint.PerformanceHistory)) {
    return myPerformanceMock.mockFetchMyPerformancePerformanceHistory(body)
  }
  return request.post<MyPerformancePerformanceHistoryResponse>({
    url: `${MY_PERFORMANCE_BASE}/performance-history`,
    data: bodyForRemote(body)
  })
}
