/**
 * 与各 `mock/backend-api/0*.json` 中 `sampleResponse` 同形的本地 Mock，
 * 供 `src/api/user-growth/ad-platform-info.ts` 在 `data-source` 开关为 Mock 时使用。
 * 命名与 `ad-performance/mock/ad-performance-api-mock.ts` 对齐。
 */
import type {
  AdPlatformInfoCampaignRow,
  AdPlatformInfoFunnelStage,
  AdPlatformInfoHeatmapData,
  AdPlatformInfoKpiCard,
  AdPlatformInfoMapPoint,
  AdPlatformInfoPlatformSummary,
  AdPlatformInfoTopRow,
  AdPlatformInfoTrendData
} from '../types'
import { buildMockAdPlatformInfoPageData } from './index'

export type AdPlatformInfoRequestBody = Api.UserGrowth.AdPlatformInfoRequestBody

function page(body: AdPlatformInfoRequestBody) {
  return buildMockAdPlatformInfoPageData(String(body?.s_campaign_id ?? '').trim() || '—')
}

export function mockAdPlatformInfoPlatformSummary(
  body: AdPlatformInfoRequestBody
): Promise<{ summary: AdPlatformInfoPlatformSummary; updatedAtText: string }> {
  const p = page(body)
  return Promise.resolve({ summary: p.summary, updatedAtText: p.updatedAtText })
}

export function mockAdPlatformInfoKpiCards(
  body: AdPlatformInfoRequestBody
): Promise<{ kpis: AdPlatformInfoKpiCard[] }> {
  return Promise.resolve({ kpis: page(body).kpis })
}

export function mockAdPlatformInfoRoiMapPoints(
  body: AdPlatformInfoRequestBody
): Promise<{ mapPoints: AdPlatformInfoMapPoint[] }> {
  return Promise.resolve({ mapPoints: page(body).mapPoints })
}

export function mockAdPlatformInfoCountryTop10(
  body: AdPlatformInfoRequestBody
): Promise<{ top10: AdPlatformInfoTopRow[] }> {
  return Promise.resolve({ top10: page(body).top10 })
}

export function mockAdPlatformInfoRetentionHeatmap(
  body: AdPlatformInfoRequestBody
): Promise<{ heatmap: AdPlatformInfoHeatmapData }> {
  return Promise.resolve({ heatmap: page(body).heatmap })
}

export function mockAdPlatformInfoConversionFunnel(
  body: AdPlatformInfoRequestBody
): Promise<{ funnel: AdPlatformInfoFunnelStage[] }> {
  return Promise.resolve({ funnel: page(body).funnel })
}

export function mockAdPlatformInfoTrendChart(
  body: AdPlatformInfoRequestBody
): Promise<{ trend: AdPlatformInfoTrendData }> {
  return Promise.resolve({ trend: page(body).trend })
}

export function mockAdPlatformInfoCampaignTable(
  body: AdPlatformInfoRequestBody
): Promise<{ campaigns: AdPlatformInfoCampaignRow[] }> {
  return Promise.resolve({ campaigns: page(body).campaigns })
}
