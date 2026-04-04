import type { OverallRecoveryFilterState } from '../types'
import { cloneAppDate, getAppNow } from '@/utils/app-now'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function allToEmpty(v: string) {
  if (v === 'all' || v === '') return ''
  return v
}

export function resolveDateRangeFromPreset(dateRange: string): {
  date_start: string
  date_end: string
} {
  const end = cloneAppDate(getAppNow())
  end.setHours(0, 0, 0, 0)
  const start = cloneAppDate(end)
  if (dateRange === '30d') {
    start.setDate(start.getDate() - 29)
  }
  return { date_start: formatYmd(start), date_end: formatYmd(end) }
}

export function buildOverallRecoveryApiParams(
  filters: Pick<OverallRecoveryFilterState, 'dateRange' | 's_app_id' | 'source' | 's_country_code'>
) {
  const { date_start, date_end } = resolveDateRangeFromPreset(filters.dateRange)
  return {
    date_start,
    date_end,
    s_app_id: allToEmpty(filters.s_app_id),
    source: allToEmpty(filters.source),
    s_country_code: allToEmpty(filters.s_country_code)
  }
}
