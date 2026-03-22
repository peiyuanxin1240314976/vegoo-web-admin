/**
 * IAA 分析 - 数据源开关（小模块内 config，与 `mock/backend-api` 及 `src/api/business-insight` IAA 方法 1:1）
 *
 * - `IaaAnalysisEndpoint`：每个 `fetchIaa*` 一个枚举值。
 * - `true` = Mock；`false` = 走 HTTP
 *
 * 当前默认全部为 `true`（IAA 走 Mock）；联调远程时把对应项改为 `false`。
 *
 * 说明：契约 03～10 为细粒度文档，当前实现为 Tab 聚合接口（11～16 对应各 `overview/*-tab`），无单独 fetch。
 */
export enum IaaAnalysisEndpoint {
  /** 01-meta-filter-options */
  MetaFilterOptions = 'metaFilterOptions',
  /** 02-overview-kpi */
  OverviewKpi = 'overviewKpi',
  /** 03-table-ad-platform（平台对比表，与广告平台 Tab 并存） */
  TableAdPlatform = 'tableAdPlatform',
  /** 11-overview-ad-type-tab */
  AdTypeTab = 'adTypeTab',
  /** 12-overview-platform-tab */
  PlatformTab = 'platformTab',
  /** 13-overview-placement-tab */
  PlacementTab = 'placementTab',
  /** 14-overview-ad-unit-tab */
  AdUnitTab = 'adUnitTab',
  /** 15-overview-country-tab */
  CountryTab = 'countryTab',
  /** 16-overview-version-tab */
  VersionTab = 'versionTab'
}

export const IAA_ANALYSIS_USE_MOCK: Record<IaaAnalysisEndpoint, boolean> = {
  [IaaAnalysisEndpoint.MetaFilterOptions]: true,
  [IaaAnalysisEndpoint.OverviewKpi]: true,
  [IaaAnalysisEndpoint.TableAdPlatform]: true,
  [IaaAnalysisEndpoint.AdTypeTab]: true,
  [IaaAnalysisEndpoint.PlatformTab]: true,
  [IaaAnalysisEndpoint.PlacementTab]: true,
  [IaaAnalysisEndpoint.AdUnitTab]: true,
  [IaaAnalysisEndpoint.CountryTab]: true,
  [IaaAnalysisEndpoint.VersionTab]: true
}

export function isIaaAnalysisEndpointMock(endpoint: IaaAnalysisEndpoint): boolean {
  return IAA_ANALYSIS_USE_MOCK[endpoint] === true
}
