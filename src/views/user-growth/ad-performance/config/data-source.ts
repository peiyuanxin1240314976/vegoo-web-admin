/**
 * 广告成效 - 数据源开关（小模块内 config，与 `mock/backend-api` 契约 1:1）
 *
 * - `true` = 本地 Mock（`mock/ad-performance-api-mock.ts`）
 * - `false` = 真实 HTTP（`src/api/ad-performance.ts`）
 *
 * `true` = Mock；`false` = HTTP。无后端时可将对应项改回 `true`。
 */
export enum AdPerformanceEndpoint {
  MetaFilterOptions = 'metaFilterOptions',
  Overview = 'overview',
  TableCampaign = 'tableCampaign',
  TableCountry = 'tableCountry',
  TableOwner = 'tableOwner',
  TableAccount = 'tableAccount',
  CampaignDetailDrawer = 'campaignDetailDrawer',
  Export = 'export',
  AlertAction = 'alertAction'
}

export const AD_PERFORMANCE_USE_MOCK: Record<AdPerformanceEndpoint, boolean> = {
  [AdPerformanceEndpoint.MetaFilterOptions]: false,
  [AdPerformanceEndpoint.Overview]: false,
  /** 广告系列明细主表 + 行内抽屉详情 */
  [AdPerformanceEndpoint.TableCampaign]: true,
  [AdPerformanceEndpoint.TableCountry]: false,
  [AdPerformanceEndpoint.TableOwner]: false,
  [AdPerformanceEndpoint.TableAccount]: false,
  [AdPerformanceEndpoint.CampaignDetailDrawer]: true,
  [AdPerformanceEndpoint.Export]: false,
  [AdPerformanceEndpoint.AlertAction]: false
}

export function isAdPerformanceEndpointMock(endpoint: AdPerformanceEndpoint): boolean {
  return AD_PERFORMANCE_USE_MOCK[endpoint]
}

/** 独立路由「广告系列详情」页 4 个分片接口 */
export enum AdPerformanceCampaignDetailEndpoint {
  Overview = 'overview',
  AdList = 'adList',
  CreativeTop5 = 'creativeTop5',
  AiInsights = 'aiInsights'
}

export const AD_PERFORMANCE_CAMPAIGN_DETAIL_USE_MOCK: Record<
  AdPerformanceCampaignDetailEndpoint,
  boolean
> = {
  [AdPerformanceCampaignDetailEndpoint.Overview]: true,
  [AdPerformanceCampaignDetailEndpoint.AdList]: true,
  [AdPerformanceCampaignDetailEndpoint.CreativeTop5]: true,
  [AdPerformanceCampaignDetailEndpoint.AiInsights]: true
}

export function isAdPerformanceCampaignDetailEndpointMock(
  endpoint: AdPerformanceCampaignDetailEndpoint
): boolean {
  return AD_PERFORMANCE_CAMPAIGN_DETAIL_USE_MOCK[endpoint]
}

/** 独立路由「广告详情」页接口 */
export enum AdPerformanceAdDetailEndpoint {
  Overview = 'overview'
}

export const AD_PERFORMANCE_AD_DETAIL_USE_MOCK: Record<AdPerformanceAdDetailEndpoint, boolean> = {
  [AdPerformanceAdDetailEndpoint.Overview]: true
}

export function isAdPerformanceAdDetailEndpointMock(
  endpoint: AdPerformanceAdDetailEndpoint
): boolean {
  return AD_PERFORMANCE_AD_DETAIL_USE_MOCK[endpoint]
}

/** 独立路由「编辑 Campaign」页 */
export enum AdPerformanceAdEditEndpoint {
  Form = 'form'
}

export const AD_PERFORMANCE_AD_EDIT_USE_MOCK: Record<AdPerformanceAdEditEndpoint, boolean> = {
  [AdPerformanceAdEditEndpoint.Form]: true
}

export function isAdPerformanceAdEditEndpointMock(endpoint: AdPerformanceAdEditEndpoint): boolean {
  return AD_PERFORMANCE_AD_EDIT_USE_MOCK[endpoint]
}
