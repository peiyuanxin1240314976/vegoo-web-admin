/**
 * 广告平台分析大屏 - 分接口 Mock（与 `mock/backend-api/01-06*.json` sampleResponse 同形）
 */
import type {
  ChannelKpiCard,
  ChannelMetricRow,
  ChannelRoiTrend,
  TopCampaignRow,
  UserQualityHeatmapRow
} from '../mock'
import {
  MOCK_CHANNEL_KPI_CARDS,
  MOCK_CHANNEL_METRICS,
  MOCK_CHANNEL_ROI_TREND,
  MOCK_TOP_CAMPAIGNS,
  MOCK_USER_QUALITY_HEATMAP
} from '../mock'

export function mockFetchAdPlatformAnalysisFiltersMeta(): Promise<Api.UserGrowth.AdPlatformFiltersMetaDto> {
  return Promise.resolve({
    apps: [
      { label: '全部Apps', value: 'all' },
      { label: 'App A', value: 'app_a' }
    ],
    platforms: [
      { label: 'IOS & Android', value: 'all' },
      { label: 'iOS', value: 'ios' },
      { label: 'Android', value: 'android' }
    ],
    sources: [
      { label: '全部广告平台', value: 'all' },
      { label: 'Google Ads', value: 'google' },
      { label: 'Facebook', value: 'facebook' },
      { label: 'TikTok', value: 'tiktok' },
      { label: 'Unity', value: 'unity' },
      { label: 'Kwai', value: 'kwai' }
    ]
  })
}

function mapKpi(x: ChannelKpiCard): Api.UserGrowth.AdPlatformKpiCardDto {
  return {
    id: x.id,
    name: x.name,
    logo: x.logo,
    cost: x.cost,
    revenue: x.revenue,
    cpi: x.cpi,
    roi: x.roi,
    roiChange: x.roiChange,
    roiChangeUp: x.roiChangeUp,
    trendData: x.trendData
  }
}

export function mockFetchAdPlatformAnalysisKpiCards(
  _body: Api.UserGrowth.AdPlatformAnalysisRequestParams
): Promise<Api.UserGrowth.AdPlatformKpiCardDto[]> {
  void _body
  return Promise.resolve(MOCK_CHANNEL_KPI_CARDS.map(mapKpi))
}

function mapTrend(x: ChannelRoiTrend): Api.UserGrowth.AdPlatformRoiTrendDto {
  return {
    dates: x.dates,
    series: x.series.map((s) => ({ name: s.name, data: s.data }))
  }
}

export function mockFetchAdPlatformAnalysisRoiTrend(
  _body: Api.UserGrowth.AdPlatformAnalysisRequestParams
): Promise<Api.UserGrowth.AdPlatformRoiTrendDto> {
  void _body
  return Promise.resolve(mapTrend(MOCK_CHANNEL_ROI_TREND))
}

function mapHeatRow(x: UserQualityHeatmapRow): Api.UserGrowth.AdPlatformQualityHeatmapRowDto {
  return {
    source: x.channel,
    d1Retention: x.d1Retention,
    d7Retention: x.d7Retention,
    d30Retention: x.d30Retention,
    payRate: x.payRate,
    arpu: x.arpu
  }
}

export function mockFetchAdPlatformAnalysisQualityHeatmap(
  _body: Api.UserGrowth.AdPlatformAnalysisRequestParams
): Promise<Api.UserGrowth.AdPlatformQualityHeatmapRowDto[]> {
  void _body
  return Promise.resolve(MOCK_USER_QUALITY_HEATMAP.map(mapHeatRow))
}

function mapTop10(x: TopCampaignRow): Api.UserGrowth.AdPlatformCampaignTop10RowDto {
  return {
    campaignId: String(x.campaignId ?? ''),
    campaignName: x.campaign,
    cost: x.cost,
    cpi: x.cpi,
    roi: x.roi,
    source: x.channel,
    ...(x.appId ? { appId: x.appId } : {}),
    ...(x.appName ? { appName: x.appName } : {})
  }
}

export function mockFetchAdPlatformAnalysisCampaignTop10(
  _body: Api.UserGrowth.AdPlatformAnalysisRequestParams
): Promise<Api.UserGrowth.AdPlatformCampaignTop10RowDto[]> {
  void _body
  return Promise.resolve(MOCK_TOP_CAMPAIGNS.map(mapTop10))
}

function mapMetricsRow(x: ChannelMetricRow): Api.UserGrowth.AdPlatformMetricsTableRowDto {
  return {
    source: x.channel,
    status: x.status,
    cost: x.cost,
    revenue: x.revenue,
    installs: x.installs,
    cpi: x.cpi,
    cpiTrendUp: x.cpiTrendUp,
    roi: x.roi,
    roiTrendUp: x.roiTrendUp,
    roas: x.roas,
    ltv7: x.ltv7,
    ltv30: x.ltv30,
    userQualityD7: x.userQualityD7,
    userQualityD7TrendUp: x.userQualityD7TrendUp,
    userQualityPay: x.userQualityPay,
    userQualityPayTrendUp: x.userQualityPayTrendUp,
    roiSparkline: x.roiSparkline,
    cpiSparkline: x.cpiSparkline
  }
}

export function mockFetchAdPlatformAnalysisMetricsTable(
  body: Api.UserGrowth.AdPlatformAnalysisRequestParams
): Promise<Api.UserGrowth.AdPlatformMetricsTableDto> {
  const size = Math.max(1, Math.floor(body.pageSize || 10))
  const page = Math.max(0, Math.floor(body.currentPage || 0))
  const all = MOCK_CHANNEL_METRICS.map(mapMetricsRow)
  const start = page * size
  const rows = all.slice(start, start + size)
  return Promise.resolve({ total: all.length, rows })
}
