import type { ComprehensiveAnalysisApiParams, ComprehensiveAnalysisFilterState } from '../types'
import { getAppNow, cloneAppDate } from '@/utils/app-now'
import { toAppIdsRequestBody } from '@/utils/app-id-request'

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
export function resolveDateRangeFromPreset(dateRange: string): {
  date_start: string
  date_end: string
} {
  const end = cloneAppDate(getAppNow())
  end.setHours(0, 0, 0, 0)
  const start = cloneAppDate(end)
  if (dateRange === '7d') {
    start.setDate(start.getDate() - 6)
  }
  return { date_start: formatYmd(start), date_end: formatYmd(end) }
}

/** 筛选维度「全部」：请求体须为 `''`；兼容历史 UI/meta 仍使用字面量 `all` */
function dimensionToApiValue(v: string) {
  return v === 'all' || v === '' ? '' : v
}

export function buildComprehensiveAnalysisApiParams(
  filters: ComprehensiveAnalysisFilterState
): ComprehensiveAnalysisApiParams {
  const { date_start, date_end } = resolveDateRangeFromPreset(filters.dateRange)
  return {
    date_start,
    date_end,
    appIds: toAppIdsRequestBody(filters.s_app_id),
    source: dimensionToApiValue(filters.adPlatform),
    s_country_code: dimensionToApiValue(filters.s_country_code)
  }
}
