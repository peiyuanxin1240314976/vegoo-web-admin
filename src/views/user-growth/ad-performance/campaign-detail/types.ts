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
  /** 1 日 ROI，百分比数值（如 93 表示 93%） */
  roi1: number
  /** 总 ROI，百分比数值 */
  roiTotal: number
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

/** 远程模式下初始态 / 失败回退：不使用页面 Mock，避免与真实接口混显 */
export function createEmptyCampaignDetail(): CampaignDetailData {
  return {
    campaignName: '',
    status: 'paused',
    basicInfo: {
      campaignId: '',
      channel: 'google',
      channelName: '',
      appName: '',
      createdAt: ''
    },
    budgetInfo: {
      budgetType: '',
      budgetAmount: 0,
      todaySpend: 0,
      todaySpendPercent: 0,
      totalSpend: 0,
      scheduleStart: '',
      scheduleEnd: ''
    },
    targetInfo: {
      region: '',
      regionCode: '',
      platform: 'all',
      bidStrategy: '',
      targetCpi: 0
    },
    trendData: [],
    adRows: [],
    creativeTop5: [],
    aiInsights: []
  }
}

/** 将多分片接口结果合并为完整模型；缺字段时用空结构覆盖，避免残留本地 Mock */
export function normalizeCampaignDetailFromApi(
  o: Partial<CampaignDetailOverviewResponse> | null | undefined,
  ads: Partial<CampaignDetailAdListResponse> | null | undefined,
  cr: Partial<CampaignDetailCreativeTop5Response> | null | undefined,
  ai: Partial<CampaignDetailAiInsightsResponse> | null | undefined
): CampaignDetailData {
  const e = createEmptyCampaignDetail()
  const status = o?.status
  return {
    campaignName: o?.campaignName ?? e.campaignName,
    status: (status === 'active' ||
    status === 'paused' ||
    status === 'completed' ||
    status === 'archived'
      ? status
      : e.status) as CampaignStatus,
    basicInfo: { ...e.basicInfo, ...(o?.basicInfo ?? {}) },
    budgetInfo: { ...e.budgetInfo, ...(o?.budgetInfo ?? {}) },
    targetInfo: { ...e.targetInfo, ...(o?.targetInfo ?? {}) },
    trendData: Array.isArray(o?.trendData) ? o.trendData : [],
    adRows: Array.isArray(ads?.rows) ? ads.rows : [],
    creativeTop5: Array.isArray(cr?.items) ? cr.items : [],
    aiInsights: Array.isArray(ai?.insights) ? ai.insights : []
  }
}

/** POST campaign-detail/campaign-action */
export type CampaignDetailCampaignActionType = 'pause' | 'copy' | 'archive'

export interface CampaignDetailCampaignActionBody {
  campaignId: string
  actionType: CampaignDetailCampaignActionType
}

export interface CampaignDetailCampaignActionResponse {
  success: boolean
  message?: string
  /** copy 成功时可选返回新系列 ID */
  newCampaignId?: string
}

/** POST campaign-detail/ad-group-action */
export interface CampaignDetailAdGroupActionBody {
  campaignId: string
  adId: string
  actionType: 'pause'
}

export interface CampaignDetailAdGroupActionResponse {
  success: boolean
  message?: string
}
