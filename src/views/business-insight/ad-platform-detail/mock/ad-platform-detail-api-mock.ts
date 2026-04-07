import type {
  AdPlatformDetailAiInsightsResponse,
  AdPlatformDetailOverviewKpisResponse,
  AdPlatformDetailOverviewTrendResponse,
  AdPlatformDetailTableAppsResponse
} from '../types'
import doc01 from './backend-api/01-overview-kpis.json'
import doc02 from './backend-api/02-overview-trend.json'
import doc03 from './backend-api/03-table-apps.json'
import doc04 from './backend-api/04-ai-insights.json'

export function mockAdPlatformDetailOverviewKpis(): AdPlatformDetailOverviewKpisResponse {
  return doc01.sampleResponse as AdPlatformDetailOverviewKpisResponse
}

export function mockAdPlatformDetailOverviewTrend(): AdPlatformDetailOverviewTrendResponse {
  return doc02.sampleResponse as AdPlatformDetailOverviewTrendResponse
}

export function mockAdPlatformDetailTableApps(): AdPlatformDetailTableAppsResponse {
  return doc03.sampleResponse as AdPlatformDetailTableAppsResponse
}

export function mockAdPlatformDetailAiInsights(): AdPlatformDetailAiInsightsResponse {
  return doc04.sampleResponse as AdPlatformDetailAiInsightsResponse
}
