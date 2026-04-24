import type {
  OverallRecoveryCommonRequestBody,
  OverallRecoveryDetailRecordsBody,
  OverallRecoveryFilterState
} from '../types'
import { cloneAppDate, getAppNow } from '@/utils/app-now'
import { toAppIdsRequestBody } from '@/utils/app-id-request'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function allToEmpty(v: string | string[]) {
  if (Array.isArray(v)) return v
  if (v === 'all' || v === '') return ''
  return v
}

function allToEmptyString(v: string) {
  return v === 'all' || v === '' ? '' : v
}

export function resolveDateRangeFromPreset(dateRange: string): {
  startDate: string
  endDate: string
} {
  const end = cloneAppDate(getAppNow())
  end.setHours(0, 0, 0, 0)
  const start = cloneAppDate(end)
  if (dateRange === '30d') {
    start.setDate(start.getDate() - 29)
  }
  return { startDate: formatYmd(start), endDate: formatYmd(end) }
}

function normalizeDateRange(filters: Pick<OverallRecoveryFilterState, 'startDate' | 'endDate'>): {
  startDate: string
  endDate: string
} {
  let start = (filters.startDate ?? '').trim()
  let end = (filters.endDate ?? '').trim()
  if (!start || !end) {
    return resolveDateRangeFromPreset('30d')
  }
  if (start > end) {
    const t = start
    start = end
    end = t
  }
  return { startDate: start, endDate: end }
}

export function buildOverallRecoveryCommonBody(
  filters: Pick<
    OverallRecoveryFilterState,
    'startDate' | 'endDate' | 's_app_id' | 'source' | 's_country_code'
  >
): OverallRecoveryCommonRequestBody {
  const { startDate, endDate } = normalizeDateRange(filters)
  return {
    startDate,
    endDate,
    appIds: toAppIdsRequestBody(allToEmpty(filters.s_app_id)),
    source: allToEmptyString(filters.source),
    countryCode: allToEmptyString(filters.s_country_code)
  }
}

export function buildOverallRecoveryDetailRecordsBody(
  filters: Pick<
    OverallRecoveryFilterState,
    'startDate' | 'endDate' | 's_app_id' | 'source' | 's_country_code'
  >,
  detail: { detailApp: string; detailChannel: string }
): OverallRecoveryDetailRecordsBody {
  return {
    ...buildOverallRecoveryCommonBody(filters),
    detailApp: allToEmptyString(detail.detailApp),
    detailChannel: allToEmptyString(detail.detailChannel)
  }
}
