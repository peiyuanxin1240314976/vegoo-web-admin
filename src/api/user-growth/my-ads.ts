/**
 * 用户增长 - 我的广告 API
 */
import request from '@/utils/http'

/** 我的广告 - 人员下拉选项 POST /api/v1/datacenter/analysis/my-ads/meta-staff-options（无请求体） */
export function fetchMyAdsStaffOptions() {
  return request.post<{ id: string; name: string }[]>({
    url: '/api/v1/datacenter/analysis/my-ads/meta-staff-options',
    data: {}
  })
}

/** 我的广告 - 頁頭用戶信息與指標 POST /api/v1/datacenter/analysis/my-ads/overview/page-header */
export function fetchMyAdsPageHeader(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsPageHeaderResponseDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/page-header',
    data: params
  })
}

/** 我的广告 - 汇总 Tab POST /api/v1/datacenter/analysis/my-ads/overview/summary */
export function fetchMyAdsSummary(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsSummaryResponseDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/summary',
    data: params
  })
}

/** 我的广告 - 应用+广告平台 Tab POST /api/v1/datacenter/analysis/my-ads/overview/platform */
export function fetchMyAdsPlatform(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsPlatformResponseDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/platform',
    data: params
  })
}

/** 我的广告 - 广告系列明细 Tab POST /api/v1/datacenter/analysis/my-ads/overview/campaign */
export function fetchMyAdsCampaign(params: Api.UserGrowth.MyAdsPageHeaderRequestParams) {
  return request.post<Api.UserGrowth.MyAdsCampaignTableDto>({
    url: '/api/v1/datacenter/analysis/my-ads/overview/campaign',
    data: params
  })
}
