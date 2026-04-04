import type {
  OverallRecoveryCommonRequestBody,
  OverallRecoveryDetailRecordsBody,
  OverallRecoveryFilterState
} from '../types'
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

export function buildOverallRecoveryCommonBody(
  filters: Pick<OverallRecoveryFilterState, 'dateRange' | 's_app_id' | 'source' | 's_country_code'>
): OverallRecoveryCommonRequestBody {
  const { startDate, endDate } = resolveDateRangeFromPreset(filters.dateRange)
  return {
    startDate,
    endDate,
    appId: allToEmpty(filters.s_app_id),
    source: allToEmpty(filters.source),
    countryCode: allToEmpty(filters.s_country_code)
  }
}

export function buildOverallRecoveryDetailRecordsBody(
  filters: Pick<OverallRecoveryFilterState, 'dateRange' | 's_app_id' | 'source' | 's_country_code'>,
  detail: { detailApp: string; detailChannel: string }
): OverallRecoveryDetailRecordsBody {
  return {
    ...buildOverallRecoveryCommonBody(filters),
    detailApp: allToEmpty(detail.detailApp),
    detailChannel: allToEmpty(detail.detailChannel)
  }
}
