/**
 * 广告系列详情页数据类型
 */

/** 广告系列运行状态 */
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'archived'

/** 广告平台 */
export type AdChannel = 'google' | 'facebook' | 'tiktok' | 'mintegral' | 'kwai' | 'meta'

/** 基本信息 */
export interface CampaignBasicInfo {
  campaignId: string
  channel: AdChannel
  channelName: string
  appName: string
  appIcon?: string
  createdAt: string
}

/** 预算与排期 */
export interface CampaignBudgetInfo {
  budgetType: string
  budgetAmount: number
  todaySpend: number
  todaySpendPercent: number
  totalSpend: number
  scheduleStart: string
  scheduleEnd: string
}

/** 目标与出价 */
export interface CampaignTargetInfo {
  region: string
  regionCode: string
  platform: 'android' | 'ios' | 'all'
  bidStrategy: string
  targetCpi: number
}

/** 核心指标趋势数据点 */
export interface CampaignTrendPoint {
  date: string
  spend: number
  installs: number
  cpi: number
  roi: number
}

/** 广告列表行 */
export interface CampaignAdRow {
  id: string
  adGroupName: string
  status: 'active' | 'paused' | 'completed'
  spend: number
  installs: number
  cpi: number
  roi: number
}

/** 素材表现 Top5 */
export interface CreativeTop5Item {
  id: string
  thumbnail: string
  roi: number
  ctr: number
}

/** AI 洞察级别 */
export type AiInsightLevel = 'info' | 'warning' | 'danger'

/** AI 洞察项 */
export interface AiInsightItem {
  id: string
  level: AiInsightLevel
  title: string
  content: string
}

/** 广告系列详情完整数据 */
export interface CampaignDetailData {
  campaignName: string
  status: CampaignStatus
  basicInfo: CampaignBasicInfo
  budgetInfo: CampaignBudgetInfo
  targetInfo: CampaignTargetInfo
  trendData: CampaignTrendPoint[]
  adRows: CampaignAdRow[]
  creativeTop5: CreativeTop5Item[]
  aiInsights: AiInsightItem[]
}

/** POST campaign-detail/overview 响应 */
export type CampaignDetailOverviewResponse = Pick<
  CampaignDetailData,
  'campaignName' | 'status' | 'basicInfo' | 'budgetInfo' | 'targetInfo' | 'trendData'
>

/** POST campaign-detail/ad-list 响应 */
export interface CampaignDetailAdListResponse {
  rows: CampaignAdRow[]
}

/** POST campaign-detail/creative-top5 响应 */
export interface CampaignDetailCreativeTop5Response {
  items: CreativeTop5Item[]
}

/** POST campaign-detail/ai-insights 响应 */
export interface CampaignDetailAiInsightsResponse {
  insights: AiInsightItem[]
}
