/**
 * 我的绩效 - 与 `fetchMyPerformance*` 对齐的本地 Mock（按接口分片返回）
 */
import { buildMyPerformanceMockData } from './data'
import metaPersonApi from './api-mock/meta-person-options.json'
import metaPeriodApi from './api-mock/meta-period-options.json'
import appDateRangeApi from './backend-api/09-app-dimension-table-by-date-range.json'
import type {
  MyPerformanceAppDimensionTableQueryBody,
  MyPerformanceAppDimensionTableResponse,
  MyPerformanceKpiAchievementResponse,
  MyPerformanceMetaPeriodResponse,
  MyPerformanceMetaPersonResponse,
  MyPerformanceOverviewKpiResponse,
  MyPerformancePerformanceHistoryResponse,
  MyPerformanceQueryBody,
  MyPerformanceRoiTrendResponse,
  MyPerformanceSpendProgressResponse
} from '../types'

export function mockFetchMyPerformanceMetaPersonOptions(): Promise<MyPerformanceMetaPersonResponse> {
  return Promise.resolve(metaPersonApi.sampleResponse as MyPerformanceMetaPersonResponse)
}

export function mockFetchMyPerformanceMetaPeriodOptions(params?: {
  personId?: string
}): Promise<MyPerformanceMetaPeriodResponse> {
  void params
  return Promise.resolve(metaPeriodApi.sampleResponse as MyPerformanceMetaPeriodResponse)
}

function slicePage(body: MyPerformanceQueryBody) {
  return buildMyPerformanceMockData(body.periodType, body.periodValue, body.personId)
}

export function mockFetchMyPerformanceOverviewKpi(
  body: MyPerformanceQueryBody
): Promise<MyPerformanceOverviewKpiResponse> {
  const page = slicePage(body)
  return Promise.resolve({ topKpis: page.topKpis })
}

export function mockFetchMyPerformanceKpiAchievement(
  body: MyPerformanceQueryBody
): Promise<MyPerformanceKpiAchievementResponse> {
  const page = slicePage(body)
  return Promise.resolve({ kpiAchievement: page.kpiAchievement })
}

export function mockFetchMyPerformanceRoiTrend(
  body: MyPerformanceQueryBody
): Promise<MyPerformanceRoiTrendResponse> {
  const page = slicePage(body)
  return Promise.resolve({ title: page.roiTrend.title, points: page.roiTrend.points })
}

export function mockFetchMyPerformanceSpendProgress(
  body: MyPerformanceQueryBody
): Promise<MyPerformanceSpendProgressResponse> {
  const page = slicePage(body)
  return Promise.resolve({
    title: page.spendProgress.title,
    list: page.spendProgress.list
  })
}

export function mockFetchMyPerformancePerformanceHistory(
  body: MyPerformanceQueryBody
): Promise<MyPerformancePerformanceHistoryResponse> {
  const page = slicePage(body)
  return Promise.resolve({
    title: page.performanceHistory.title,
    list: page.performanceHistory.list
  })
}

export function mockFetchMyPerformanceAppDimensionTable(
  body: MyPerformanceQueryBody
): Promise<MyPerformanceAppDimensionTableResponse> {
  const page = slicePage(body)
  return Promise.resolve({
    title: page.appDimensionTable.title,
    list: page.appDimensionTable.list,
    summary: page.appDimensionTable.summary
  })
}

export function mockFetchMyPerformanceAppDimensionTableByDateRange(
  body: MyPerformanceAppDimensionTableQueryBody
): Promise<MyPerformanceAppDimensionTableResponse> {
  void body
  const page = appDateRangeApi.sampleResponse as MyPerformanceAppDimensionTableResponse
  return Promise.resolve({
    title: page.title,
    list: page.list,
    summary: page.summary,
    excelTables: page.excelTables
  })
}
