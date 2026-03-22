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
  [AdPerformanceEndpoint.TableCampaign]: false,
  [AdPerformanceEndpoint.TableCountry]: false,
  [AdPerformanceEndpoint.TableOwner]: false,
  [AdPerformanceEndpoint.TableAccount]: false,
  [AdPerformanceEndpoint.CampaignDetailDrawer]: false,
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
  [AdPerformanceCampaignDetailEndpoint.Overview]: false,
  [AdPerformanceCampaignDetailEndpoint.AdList]: false,
  [AdPerformanceCampaignDetailEndpoint.CreativeTop5]: false,
  [AdPerformanceCampaignDetailEndpoint.AiInsights]: false
}

export function isAdPerformanceCampaignDetailEndpointMock(
  endpoint: AdPerformanceCampaignDetailEndpoint
): boolean {
  return AD_PERFORMANCE_CAMPAIGN_DETAIL_USE_MOCK[endpoint]
}
