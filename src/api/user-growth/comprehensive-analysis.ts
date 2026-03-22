/**
 * 用户增长 - 综合分析 API（当前为 mock）
 */
import type { ComprehensiveAnalysisFilterState } from '@/views/user-growth/comprehensive-analysis/types'
import { buildComprehensiveAnalysisApiParams } from '@/views/user-growth/comprehensive-analysis/utils/buildApiParams'
import {
  buildMockComprehensiveAnalysisData,
  MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS
} from '@/views/user-growth/comprehensive-analysis/mock/data'

/** 综合分析 - 下拉筛选选项（当前：mock；后端：`POST /api/user-growth/comprehensive-analysis/meta-filter-options`） */
export function fetchComprehensiveAnalysisFilterOptions() {
  return Promise.resolve(MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS)
}

/** 综合分析 - 页面 KPI/图表聚合（不含仅前端的 viewMode）（当前：mock；后端：`POST .../overview`） */
export function fetchComprehensiveAnalysisData(
  filters: Pick<
    ComprehensiveAnalysisFilterState,
    'dateRange' | 's_app_id' | 'adPlatform' | 's_country_code'
  >
) {
  return Promise.resolve(
    buildMockComprehensiveAnalysisData(buildComprehensiveAnalysisApiParams(filters))
  )
}
