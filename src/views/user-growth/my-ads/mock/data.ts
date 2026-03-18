/**
 * 我的广告 - Mock 数据（由 api-mock 各拆分接口组装）
 * 每个 Tab 下为多接口：汇总 5 个、应用+广告平台 2 个、广告系列明细 2 个。
 */
import type { MyAdsPageData, MyAdsCampaignRow } from '../types'
import userApi from '../api-mock/user.json'
import kpiApi from '../api-mock/kpi.json'
import summaryKpiCardsApi from '../api-mock/summary-kpi-cards.json'
import summaryTrendApi from '../api-mock/summary-trend.json'
import summaryChannelApi from '../api-mock/summary-channel-distribution.json'
import summaryAppSpendApi from '../api-mock/summary-app-spend.json'
import summaryPaceMonitorApi from '../api-mock/summary-pace-monitor.json'
import appPlatformListApi from '../api-mock/app-platform-list.json'
import appPlatformFooterApi from '../api-mock/app-platform-footer.json'
import campaignDetailListApi from '../api-mock/campaign-detail-list.json'
import campaignDetailSummaryBarApi from '../api-mock/campaign-detail-summary-bar.json'

const userRes = userApi.sampleResponse as {
  user: MyAdsPageData['user']
  dateRange: MyAdsPageData['dateRange']
}

/** n_source → 广告平台展示名 */
const N_SOURCE_TO_SOURCE_NAME: Record<number, string> = {
  1: 'Google',
  2: 'Facebook',
  3: 'Unity',
  4: 'Applovin',
  5: 'IronSource',
  6: 'AdColony',
  7: 'Pangle',
  8: 'TikTok'
}

type CampaignDetailRowApi = {
  s_campaign_id: string
  s_app_id?: string
  appName: string
  campaignName: string
  n_source: number
  platform?: string
  s_country_code: string
  country: string
  status: string
  statusText: string
  cost: number
  d_budget: number
  n_progress: number
  calculatedConsumption: number
  commissionConsumption: number
  d_first_day_roi: number | null
  minConsumption: number
  estimatedProfit: number
  minProfit: number
  d_cpi: number | null
  trend: number[]
}

function mapCampaignDetailRow(row: CampaignDetailRowApi): MyAdsCampaignRow {
  return {
    id: row.s_campaign_id,
    appName: row.appName,
    campaignName: row.campaignName,
    source: N_SOURCE_TO_SOURCE_NAME[row.n_source] ?? String(row.n_source),
    platform: row.platform ?? 'Android',
    country: row.country,
    countryCode: row.s_country_code,
    status: row.status as MyAdsCampaignRow['status'],
    statusText: row.statusText,
    spend: row.cost,
    budget: row.d_budget,
    progress: row.n_progress,
    calculatedConsumption: row.calculatedConsumption,
    commissionConsumption: row.commissionConsumption,
    firstDayRoi: row.d_first_day_roi,
    minConsumption: row.minConsumption,
    estimatedProfit: row.estimatedProfit,
    minProfit: row.minProfit,
    cpi: row.d_cpi,
    trend: row.trend
  }
}

type CampaignDetailListApi = {
  filters: MyAdsPageData['campaignDetail']['filters']
  list: CampaignDetailRowApi[]
  total: number
}

const campaignDetailListRes = campaignDetailListApi.sampleResponse as CampaignDetailListApi
const summaryPaceRes = summaryPaceMonitorApi.sampleResponse as {
  paceMonitor: MyAdsPageData['summary']['paceMonitor']
  paceRemainingDays?: number
}

export const MOCK_MY_ADS_DATA: MyAdsPageData = {
  user: userRes.user,
  dateRange: userRes.dateRange,
  kpi: kpiApi.sampleResponse as MyAdsPageData['kpi'],
  summary: {
    kpiCards: summaryKpiCardsApi.sampleResponse as MyAdsPageData['summary']['kpiCards'],
    trend: summaryTrendApi.sampleResponse as MyAdsPageData['summary']['trend'],
    channelDistribution:
      summaryChannelApi.sampleResponse as MyAdsPageData['summary']['channelDistribution'],
    appSpend: summaryAppSpendApi.sampleResponse as MyAdsPageData['summary']['appSpend'],
    paceMonitor: summaryPaceRes.paceMonitor,
    paceRemainingDays: summaryPaceRes.paceRemainingDays
  },
  appPlatform: {
    ...(appPlatformListApi.sampleResponse as {
      groupBy: 'app' | 'platform'
      viewDesc: string
      appGroups: MyAdsPageData['appPlatform']['appGroups']
    }),
    footer: appPlatformFooterApi.sampleResponse as MyAdsPageData['appPlatform']['footer']
  },
  campaignDetail: {
    filters: campaignDetailListRes.filters,
    list: campaignDetailListRes.list.map(mapCampaignDetailRow),
    total: campaignDetailListRes.total,
    summaryBar:
      campaignDetailSummaryBarApi.sampleResponse as MyAdsPageData['campaignDetail']['summaryBar']
  }
}
