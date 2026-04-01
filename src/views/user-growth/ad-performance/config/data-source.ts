/**
 * 广告成效 - 数据源开关（模块根唯一 config；与各 `mock/backend-api/*.json` 契约 1:1）
 *
 * - `true` = 本地 Mock（`../mock/ad-performance-api-mock.ts`）
 * - `false` = 真实 HTTP（`src/api/ad-performance.ts`，经 `@/api/user-growth/ad-performance` 导出）
 *
 * 多页面拆分方式：按路由分多组 `enum` + 多份 `Record` + 多个 `is*EndpointMock()`，
 * `src/api/ad-performance.ts` 中按接口归属调用对应判断函数。
 */
// ── 路由：/user-growth/ad-performance（列表、KPI、分布、预警、主表各 Tab、抽屉、导出）──
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
  /** 主表 Tab「按广告系列」 */
  [AdPerformanceEndpoint.TableCampaign]: false,
  [AdPerformanceEndpoint.TableCountry]: false,
  [AdPerformanceEndpoint.TableOwner]: false,
  [AdPerformanceEndpoint.TableAccount]: false,
  /** 列表页点行打开抽屉拉系列详情 */
  [AdPerformanceEndpoint.CampaignDetailDrawer]: false,
  [AdPerformanceEndpoint.Export]: false,
  [AdPerformanceEndpoint.AlertAction]: false
}

export function isAdPerformanceEndpointMock(endpoint: AdPerformanceEndpoint): boolean {
  return AD_PERFORMANCE_USE_MOCK[endpoint]
}

// ── 路由：/campaign-detail（系列详情页）──
/** 系列详情页分片读接口 + 系列级/广告组级写操作 */
export enum AdPerformanceCampaignDetailEndpoint {
  Overview = 'overview',
  AdList = 'adList',
  CreativeTop5 = 'creativeTop5',
  AiInsights = 'aiInsights',
  CampaignAction = 'campaignAction',
  AdGroupAction = 'adGroupAction'
}

export const AD_PERFORMANCE_CAMPAIGN_DETAIL_USE_MOCK: Record<
  AdPerformanceCampaignDetailEndpoint,
  boolean
> = {
  [AdPerformanceCampaignDetailEndpoint.Overview]: false,
  [AdPerformanceCampaignDetailEndpoint.AdList]: false,
  [AdPerformanceCampaignDetailEndpoint.CreativeTop5]: false,
  [AdPerformanceCampaignDetailEndpoint.AiInsights]: false,
  [AdPerformanceCampaignDetailEndpoint.CampaignAction]: false,
  [AdPerformanceCampaignDetailEndpoint.AdGroupAction]: false
}

export function isAdPerformanceCampaignDetailEndpointMock(
  endpoint: AdPerformanceCampaignDetailEndpoint
): boolean {
  return AD_PERFORMANCE_CAMPAIGN_DETAIL_USE_MOCK[endpoint]
}

// ── 路由：/campaign-detail/ad-detail（单广告组详情）──
export enum AdPerformanceAdDetailEndpoint {
  Overview = 'overview'
}

export const AD_PERFORMANCE_AD_DETAIL_USE_MOCK: Record<AdPerformanceAdDetailEndpoint, boolean> = {
  [AdPerformanceAdDetailEndpoint.Overview]: false
}

export function isAdPerformanceAdDetailEndpointMock(
  endpoint: AdPerformanceAdDetailEndpoint
): boolean {
  return AD_PERFORMANCE_AD_DETAIL_USE_MOCK[endpoint]
}

// ── 路由：/campaign-detail/ad-edit（编辑 Campaign）──
export enum AdPerformanceAdEditEndpoint {
  Form = 'form',
  SaveDraft = 'saveDraft',
  SubmitLaunch = 'submitLaunch'
}

export const AD_PERFORMANCE_AD_EDIT_USE_MOCK: Record<AdPerformanceAdEditEndpoint, boolean> = {
  [AdPerformanceAdEditEndpoint.Form]: false,
  [AdPerformanceAdEditEndpoint.SaveDraft]: false,
  [AdPerformanceAdEditEndpoint.SubmitLaunch]: false
}

export function isAdPerformanceAdEditEndpointMock(endpoint: AdPerformanceAdEditEndpoint): boolean {
  return AD_PERFORMANCE_AD_EDIT_USE_MOCK[endpoint]
}
