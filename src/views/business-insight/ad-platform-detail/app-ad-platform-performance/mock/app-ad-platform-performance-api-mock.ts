import type {
  AppAdPlatformAdUnitsResponse,
  AppAdPlatformAiInsightsResponse,
  AppAdPlatformWaterfallResponse,
  AdPlatformDetailOverviewKpisResponse,
  AdPlatformDetailOverviewTrendResponse
} from '../../types'
import doc01 from './backend-api/01-overview-kpis.json'
import doc02 from './backend-api/02-overview-trend.json'
import doc03 from './backend-api/03-waterfall.json'
import doc04 from './backend-api/04-table-ad-units.json'
import doc05 from './backend-api/05-ai-insights.json'

export function mockAppAdPlatformPerformanceOverviewKpis(): AdPlatformDetailOverviewKpisResponse {
  return doc01.sampleResponse as AdPlatformDetailOverviewKpisResponse
}

export function mockAppAdPlatformPerformanceOverviewTrend(): AdPlatformDetailOverviewTrendResponse {
  return doc02.sampleResponse as AdPlatformDetailOverviewTrendResponse
}

export function mockAppAdPlatformPerformanceWaterfall(): AppAdPlatformWaterfallResponse {
  return doc03.sampleResponse as AppAdPlatformWaterfallResponse
}

export function mockAppAdPlatformPerformanceTableAdUnits(): AppAdPlatformAdUnitsResponse {
  return doc04.sampleResponse as AppAdPlatformAdUnitsResponse
}

export function mockAppAdPlatformPerformanceAiInsights(): AppAdPlatformAiInsightsResponse {
  return doc05.sampleResponse as AppAdPlatformAiInsightsResponse
}
