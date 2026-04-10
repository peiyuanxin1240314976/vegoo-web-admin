import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  AppListItem,
  ReportTopBarFilterArrays,
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
  /** 顶栏应用/平台/广告平台/国家多选（空数组=不限），与请求体一致 */
  topBarFilters: ComputedRef<ReportTopBarFilterArrays>
  /** 侧栏应用列表（独立 app-list 接口，不随选中应用刷新） */
  sidebarAppList: Ref<AppListItem[]>
  summary: Ref<SummaryResponse | null>
  adPlatform: Ref<AdPlatformResponse | null>
  byCountry: Ref<ByCountryResponse | null>
  platformCountry: Ref<PlatformCountryResponse | null>
  campaigns: Ref<CampaignsResponse | null>
}

export const businessReportContextKey: InjectionKey<BusinessReportContext> =
  Symbol('businessReportContext')
