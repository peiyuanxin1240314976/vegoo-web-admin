/**
 * 我的绩效 - Mock 数据（由 api-mock 各拆分接口组装）
 */
import metaPersonApi from './api-mock/meta-person-options.json'
import metaPeriodApi from './api-mock/meta-period-options.json'
import overviewKpiApi from './api-mock/overview-kpi.json'
import kpiAchievementApi from './api-mock/kpi-achievement.json'
import roiTrendApi from './api-mock/roi-trend.json'
import spendProgressApi from './api-mock/spend-progress.json'
import performanceHistoryApi from './api-mock/performance-history.json'
import appTableApi from './api-mock/app-dimension-table.json'
import appDateRangeApi from './backend-api/09-app-dimension-table-by-date-range.json'
import type { MyPerformancePageData, MyPerformancePeriodType } from '../types'

type PeriodKey = 'month' | 'quarter'

const personRes = metaPersonApi.sampleResponse as Pick<
  MyPerformancePageData,
  'personOptions' | 'selectedPersonId'
>
const periodRes = metaPeriodApi.sampleResponse as {
  periodOptions: MyPerformancePageData['periodOptions']
  selectedPeriod: { periodType: MyPerformancePeriodType; periodValue: string }
}

function getPeriodKey(periodType: MyPerformancePeriodType): PeriodKey {
  return periodType === 'quarter' ? 'quarter' : 'month'
}

export function buildMyPerformanceMockData(
  periodType: MyPerformancePeriodType,
  periodValue: string,
  personId?: string
): MyPerformancePageData {
  const key = getPeriodKey(periodType)
  const selectedPersonId = personId ?? personRes.selectedPersonId

  const overview = (overviewKpiApi.sampleResponse as any)[key]
  const achievement = (kpiAchievementApi.sampleResponse as any)[key]
  const roiTrend = (roiTrendApi.sampleResponse as any)[key]
  const spendProgress = (spendProgressApi.sampleResponse as any)[key]
  const performanceHistory = (performanceHistoryApi.sampleResponse as any)[key]
  const appTable = (appTableApi.sampleResponse as any)[key]
  const appDateRangeTable = appDateRangeApi.sampleResponse as any

  return {
    personOptions: personRes.personOptions,
    selectedPersonId,
    periodType,
    periodOptions: periodRes.periodOptions,
    selectedPeriodValue: periodValue,
    topKpis: overview.topKpis,
    kpiAchievement: achievement.kpiAchievement,
    roiTrend: { title: roiTrend.title, points: roiTrend.points },
    spendProgress: { title: spendProgress.title, list: spendProgress.list },
    performanceHistory: { title: performanceHistory.title, list: performanceHistory.list },
    appDimensionTable: { title: appTable.title, list: appTable.list, summary: appTable.summary },
    appDateRangeTable: {
      title: appDateRangeTable.title,
      list: appDateRangeTable.list,
      summary: appDateRangeTable.summary,
      excelTables: appDateRangeTable.excelTables
    }
  }
}

export const DEFAULT_PERIOD = periodRes.selectedPeriod

export const MOCK_MY_PERFORMANCE_DATA: MyPerformancePageData = buildMyPerformanceMockData(
  DEFAULT_PERIOD.periodType,
  DEFAULT_PERIOD.periodValue
)
