import type { InjectionKey, Ref } from 'vue'
import type {
  SummaryResponse,
  AdPlatformResponse,
  ByCountryResponse,
  PlatformCountryResponse,
  CampaignsResponse
} from '../types'
import type { ReportPeriod } from '../types'

export type BusinessReportContext = {
  loading: Ref<boolean>
  period: Ref<ReportPeriod>
  reportRange: Ref<{ startDate: string; endDate: string }>
  refreshReport: () => Promise<void>
  getLastPushText: (period: ReportPeriod) => string
  summary: Ref<SummaryResponse | null>
  adPlatform: Ref<AdPlatformResponse | null>
  byCountry: Ref<ByCountryResponse | null>
  platformCountry: Ref<PlatformCountryResponse | null>
  campaigns: Ref<CampaignsResponse | null>
}

export const businessReportContextKey: InjectionKey<BusinessReportContext> =
  Symbol('businessReportContext')
