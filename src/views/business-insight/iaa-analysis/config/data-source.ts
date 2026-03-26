/**
 * IAA 分析 - 数据源开关（小模块内 config，与 `mock/backend-api` 及 `src/api/business-insight` IAA 方法 1:1）
 *
 * - `IaaAnalysisEndpoint`：每个 `fetchIaa*` 一个枚举值。
 * - `true` = Mock；`false` = 走 HTTP
 *
 * 当前默认全部为 `false`（走线上 HTTP）；本地只 Mock 某接口时把对应项改为 `true`。
 *
 * 说明：契约 03～10 为细粒度文档，当前实现为 Tab 聚合接口（11～16 对应各 `overview/*-tab`）；KPI 由各自 Tab 接口内返回，无单独 overview-kpi。
 */
export enum IaaAnalysisEndpoint {
  /** 01-meta-filter-options */
  MetaFilterOptions = 'metaFilterOptions',
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
  [IaaAnalysisEndpoint.MetaFilterOptions]: false,
  [IaaAnalysisEndpoint.AdTypeTab]: false,
  [IaaAnalysisEndpoint.PlatformTab]: false,
  [IaaAnalysisEndpoint.PlacementTab]: false,
  [IaaAnalysisEndpoint.AdUnitTab]: false,
  [IaaAnalysisEndpoint.CountryTab]: false,
  [IaaAnalysisEndpoint.VersionTab]: false
}

export function isIaaAnalysisEndpointMock(endpoint: IaaAnalysisEndpoint): boolean {
  return IAA_ANALYSIS_USE_MOCK[endpoint] === true
}
