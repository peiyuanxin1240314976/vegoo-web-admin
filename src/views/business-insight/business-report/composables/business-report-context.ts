import type { InjectionKey, Ref } from 'vue'
import type {
  SummaryResponse,
  AdPlatformResponse,
  ByCountryResponse,
  PlatformCountryResponse,
  CampaignsResponse
} from '../types'

export type BusinessReportContext = {
  loading: Ref<boolean>
  summary: Ref<SummaryResponse | null>
  adPlatform: Ref<AdPlatformResponse | null>
  byCountry: Ref<ByCountryResponse | null>
  platformCountry: Ref<PlatformCountryResponse | null>
  campaigns: Ref<CampaignsResponse | null>
}

export const businessReportContextKey: InjectionKey<BusinessReportContext> =
  Symbol('businessReportContext')
