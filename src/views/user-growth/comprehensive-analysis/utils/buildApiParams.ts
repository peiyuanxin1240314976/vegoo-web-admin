import type { ComprehensiveAnalysisApiParams, ComprehensiveAnalysisFilterState } from '../types'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** 本地日历日格式化为 YYYY-MM-DD */
export function formatYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/**
 * 根据筛选上的 dateRange 预设解析为起止日期（与顶栏「近7天」一致）
 */
export function resolveDateRangeFromPreset(dateRange: string): { date_start: string; date_end: string } {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  if (dateRange === '7d') {
    start.setDate(start.getDate() - 6)
  }
  return { date_start: formatYmd(start), date_end: formatYmd(end) }
}

/** UI 筛选「全部」→ 请求体空字符串（与 ad-performance mock 约定一致） */
function allToEmpty(v: string) {
  return v === 'all' ? '' : v
}

export function buildComprehensiveAnalysisApiParams(
  filters: Pick<
    ComprehensiveAnalysisFilterState,
    'dateRange' | 's_app_id' | 'adPlatform' | 's_country_code'
  >
): ComprehensiveAnalysisApiParams {
  const { date_start, date_end } = resolveDateRangeFromPreset(filters.dateRange)
  return {
    date_start,
    date_end,
    s_app_id: allToEmpty(filters.s_app_id),
    source: allToEmpty(filters.adPlatform),
    s_country_code: allToEmpty(filters.s_country_code)
  }
}
