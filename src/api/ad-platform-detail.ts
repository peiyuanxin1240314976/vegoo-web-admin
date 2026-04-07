/**
 * 商业洞察 · 广告平台详情 / 应用内广告平台表现（Mock 与远程由各页 `config/data-source.ts` 按接口切换）
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  AdPlatformDetailEndpoint,
  isAdPlatformDetailEndpointMock
} from '@/views/business-insight/ad-platform-detail/config/data-source'
import {
  AppAdPlatformPerformanceEndpoint,
  isAppAdPlatformPerformanceEndpointMock
} from '@/views/business-insight/ad-platform-detail/app-ad-platform-performance/config/data-source'
import type {
  AdPlatformDetailAiInsightsResponse,
  AdPlatformDetailOverviewKpisResponse,
  AdPlatformDetailOverviewTrendResponse,
  AdPlatformDetailQueryBody,
  AdPlatformDetailTableAppsResponse,
  AppAdPlatformAdUnitsResponse,
  AppAdPlatformAiInsightsResponse,
  AppAdPlatformWaterfallResponse
} from '@/views/business-insight/ad-platform-detail/types'

const AD_PLATFORM_DETAIL_BASE = `${ANALYSIS_API_BASE}/business-insight/ad-platform-detail`
const APP_AD_PLATFORM_PERF_BASE = `${ANALYSIS_API_BASE}/business-insight/ad-platform-detail/app-ad-platform-performance`

function unwrapPayload<T>(raw: unknown): T {
  if (raw === null || raw === undefined) return raw as T
  if (typeof raw !== 'object' || Array.isArray(raw)) return raw as T
  const o = raw as Record<string, unknown>
  if (
    'data' in o &&
    o.data !== null &&
    o.data !== undefined &&
    typeof o.data === 'object' &&
    !Array.isArray(o.data)
  ) {
    return o.data as T
  }
  return raw as T
}

function buildQueryBody(body: AdPlatformDetailQueryBody): Record<string, unknown> {
  const out: Record<string, unknown> = {
    startDate: body.startDate,
    endDate: body.endDate,
    appId: body.appId ?? '',
    s_country_code: body.s_country_code ?? ''
  }
  if (body.source !== undefined && body.source !== '') {
    out.source = body.source
  }
  return out
}

/** 父页 — KPI POST .../overview/kpis */
export async function fetchAdPlatformDetailOverviewKpis(body: AdPlatformDetailQueryBody) {
  if (isAdPlatformDetailEndpointMock(AdPlatformDetailEndpoint.OverviewKpis)) {
    const { mockAdPlatformDetailOverviewKpis } = await import(
      '@/views/business-insight/ad-platform-detail/mock/ad-platform-detail-api-mock'
    )
    return mockAdPlatformDetailOverviewKpis()
  }
  const raw = await request.post<unknown>({
    url: `${AD_PLATFORM_DETAIL_BASE}/overview/kpis`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AdPlatformDetailOverviewKpisResponse>(raw)
}

/** 父页 — 趋势 POST .../overview/trend */
export async function fetchAdPlatformDetailOverviewTrend(body: AdPlatformDetailQueryBody) {
  if (isAdPlatformDetailEndpointMock(AdPlatformDetailEndpoint.OverviewTrend)) {
    const { mockAdPlatformDetailOverviewTrend } = await import(
      '@/views/business-insight/ad-platform-detail/mock/ad-platform-detail-api-mock'
    )
    return mockAdPlatformDetailOverviewTrend()
  }
  const raw = await request.post<unknown>({
    url: `${AD_PLATFORM_DETAIL_BASE}/overview/trend`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AdPlatformDetailOverviewTrendResponse>(raw)
}

/** 父页 — 应用表 POST .../table/apps */
export async function fetchAdPlatformDetailTableApps(body: AdPlatformDetailQueryBody) {
  if (isAdPlatformDetailEndpointMock(AdPlatformDetailEndpoint.TableApps)) {
    const { mockAdPlatformDetailTableApps } = await import(
      '@/views/business-insight/ad-platform-detail/mock/ad-platform-detail-api-mock'
    )
    return mockAdPlatformDetailTableApps()
  }
  const raw = await request.post<unknown>({
    url: `${AD_PLATFORM_DETAIL_BASE}/table/apps`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AdPlatformDetailTableAppsResponse>(raw)
}

/** 父页 — AI 洞察 POST .../overview/ai-insights */
export async function fetchAdPlatformDetailAiInsights(body: AdPlatformDetailQueryBody) {
  if (isAdPlatformDetailEndpointMock(AdPlatformDetailEndpoint.AiInsights)) {
    const { mockAdPlatformDetailAiInsights } = await import(
      '@/views/business-insight/ad-platform-detail/mock/ad-platform-detail-api-mock'
    )
    return mockAdPlatformDetailAiInsights()
  }
  const raw = await request.post<unknown>({
    url: `${AD_PLATFORM_DETAIL_BASE}/overview/ai-insights`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AdPlatformDetailAiInsightsResponse>(raw)
}

/** 子页 — KPI POST .../overview/kpis */
export async function fetchAppAdPlatformPerformanceOverviewKpis(body: AdPlatformDetailQueryBody) {
  if (isAppAdPlatformPerformanceEndpointMock(AppAdPlatformPerformanceEndpoint.OverviewKpis)) {
    const { mockAppAdPlatformPerformanceOverviewKpis } = await import(
      '@/views/business-insight/ad-platform-detail/app-ad-platform-performance/mock/app-ad-platform-performance-api-mock'
    )
    return mockAppAdPlatformPerformanceOverviewKpis()
  }
  const raw = await request.post<unknown>({
    url: `${APP_AD_PLATFORM_PERF_BASE}/overview/kpis`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AdPlatformDetailOverviewKpisResponse>(raw)
}

/** 子页 — 趋势 POST .../overview/trend */
export async function fetchAppAdPlatformPerformanceOverviewTrend(body: AdPlatformDetailQueryBody) {
  if (isAppAdPlatformPerformanceEndpointMock(AppAdPlatformPerformanceEndpoint.OverviewTrend)) {
    const { mockAppAdPlatformPerformanceOverviewTrend } = await import(
      '@/views/business-insight/ad-platform-detail/app-ad-platform-performance/mock/app-ad-platform-performance-api-mock'
    )
    return mockAppAdPlatformPerformanceOverviewTrend()
  }
  const raw = await request.post<unknown>({
    url: `${APP_AD_PLATFORM_PERF_BASE}/overview/trend`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AdPlatformDetailOverviewTrendResponse>(raw)
}

/** 子页 — 瀑布流 POST .../waterfall */
export async function fetchAppAdPlatformPerformanceWaterfall(body: AdPlatformDetailQueryBody) {
  if (isAppAdPlatformPerformanceEndpointMock(AppAdPlatformPerformanceEndpoint.Waterfall)) {
    const { mockAppAdPlatformPerformanceWaterfall } = await import(
      '@/views/business-insight/ad-platform-detail/app-ad-platform-performance/mock/app-ad-platform-performance-api-mock'
    )
    return mockAppAdPlatformPerformanceWaterfall()
  }
  const raw = await request.post<unknown>({
    url: `${APP_AD_PLATFORM_PERF_BASE}/waterfall`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AppAdPlatformWaterfallResponse>(raw)
}

/** 子页 — 广告位表 POST .../table/ad-units */
export async function fetchAppAdPlatformPerformanceTableAdUnits(body: AdPlatformDetailQueryBody) {
  if (isAppAdPlatformPerformanceEndpointMock(AppAdPlatformPerformanceEndpoint.TableAdUnits)) {
    const { mockAppAdPlatformPerformanceTableAdUnits } = await import(
      '@/views/business-insight/ad-platform-detail/app-ad-platform-performance/mock/app-ad-platform-performance-api-mock'
    )
    return mockAppAdPlatformPerformanceTableAdUnits()
  }
  const raw = await request.post<unknown>({
    url: `${APP_AD_PLATFORM_PERF_BASE}/table/ad-units`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AppAdPlatformAdUnitsResponse>(raw)
}

/** 子页 — AI 洞察 POST .../overview/ai-insights */
export async function fetchAppAdPlatformPerformanceAiInsights(body: AdPlatformDetailQueryBody) {
  if (isAppAdPlatformPerformanceEndpointMock(AppAdPlatformPerformanceEndpoint.AiInsights)) {
    const { mockAppAdPlatformPerformanceAiInsights } = await import(
      '@/views/business-insight/ad-platform-detail/app-ad-platform-performance/mock/app-ad-platform-performance-api-mock'
    )
    return mockAppAdPlatformPerformanceAiInsights()
  }
  const raw = await request.post<unknown>({
    url: `${APP_AD_PLATFORM_PERF_BASE}/overview/ai-insights`,
    data: buildQueryBody(body)
  })
  return unwrapPayload<AppAdPlatformAiInsightsResponse>(raw)
}
