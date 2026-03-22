/**
 * IAP Dashboard：按 mock/backend-api 01～07 分片拉取（每块独立接口，可并行）
 */
import type { IapOverviewTableQuery } from '@/api/iap-analysis'
import {
  fetchIapMetaFilterOptions,
  fetchIapOverviewKpi,
  fetchIapOverviewTrend,
  fetchIapOverviewAppCards,
  fetchIapOverviewCountryDistribution,
  fetchIapOverviewProductTypeDonut,
  fetchIapOverviewPlatformCompare
} from '@/api/iap-analysis'

export async function loadIapDashboardOverviewModules(p: IapOverviewTableQuery) {
  const [meta, kpi, trend, appCards, country, donut, platform] = await Promise.all([
    fetchIapMetaFilterOptions(),
    fetchIapOverviewKpi(p),
    fetchIapOverviewTrend(p),
    fetchIapOverviewAppCards(p),
    fetchIapOverviewCountryDistribution(p),
    fetchIapOverviewProductTypeDonut(p),
    fetchIapOverviewPlatformCompare(p)
  ])

  return { meta, kpi, trend, appCards, country, donut, platform }
}
