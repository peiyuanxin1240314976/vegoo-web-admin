/**
 * IAP Dashboard：按 mock/backend-api 01～07 分片拉取（每块独立接口，可并行）
 */
import type { IapOverviewTableQuery } from '@/api/iap-analysis'
import {
  fetchIapOverviewKpi,
  fetchIapOverviewTrend,
  fetchIapOverviewAppCards,
  fetchIapOverviewCountryDistribution,
  fetchIapOverviewProductTypeDonut,
  fetchIapOverviewPlatformCompare
} from '@/api/iap-analysis'

/** 筛选项（国家 / 应用等）由公用 `useCockpitMetaFilterStore` 提供，本函数不再请求 IAP meta-filter-options */
export async function loadIapDashboardOverviewModules(p: IapOverviewTableQuery) {
  const [kpi, trend, appCards, country, donut, platform] = await Promise.all([
    fetchIapOverviewKpi(p),
    fetchIapOverviewTrend(p),
    fetchIapOverviewAppCards(p),
    fetchIapOverviewCountryDistribution(p),
    fetchIapOverviewProductTypeDonut(p),
    fetchIapOverviewPlatformCompare(p)
  ])

  return { kpi, trend, appCards, country, donut, platform }
}
