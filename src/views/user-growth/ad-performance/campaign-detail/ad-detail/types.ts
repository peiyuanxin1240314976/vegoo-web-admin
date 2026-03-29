/**
 * 广告详情页数据类型
 * 路由：/user-growth/ad-performance/campaign-detail/ad-detail
 */

/** 广告状态 */
export type AdDetailStatus = 'active' | 'paused' | 'completed'

/** KPI 趋势方向（与上期对比） */
export type KpiTrendDir = 'up' | 'down' | 'flat'

/** 受众定向信息 */
export interface AdTargeting {
  /** 地理位置 ISO 代码，如 "US" */
  geoCode: string
  /** 地理位置名称，如 "美国" */
  geoName: string
  /** 终端平台，如 "Android 12+" */
  platform: string
  /** 性别，如 "Male" */
  gender: string
  /** 年龄段，如 "25-35" */
  ageRange: string
}

/** KPI 趋势（与上期对比） */
export interface AdKpiTrends {
  spend?: KpiTrendDir
  installs?: KpiTrendDir
  /** CPI 升 = 变差；CPI 降 = 变好 */
  cpi?: KpiTrendDir
  /** ROI 升 = 变好；ROI 降 = 变差 */
  roi?: KpiTrendDir
}

/** 广告核心指标（页面展示 4 项） */
export interface AdKpiMetrics {
  spend: number
  installs: number
  /** CPI，单位美元 */
  cpi: number
  /** ROI，百分比值，如 142 表示 142% */
  roi: number
}

/** 趋势折线数据点 */
export interface AdTrendPoint {
  date: string
  spend: number
  installs: number
  cpi: number
  roi: number
}

/** 素材类型 */
export type AdCreativeType = 'video' | 'image'

/** 素材行 */
export interface AdCreativeItem {
  id: string
  type: AdCreativeType
  name: string
  thumbnail?: string
  /** 消耗，单位美元 */
  spend: number
  installs: number
  /** 点击率，百分比值 */
  ctr: number
  /** 转化率，百分比值 */
  cvr: number
  /** CPI，单位美元 */
  cpi: number
  /** ROI，百分比值 */
  roi: number
  status: 'active' | 'paused'
}

/** 广告详情完整数据 */
export interface AdDetailData {
  adId: string
  adGroupName: string
  campaignName: string
  campaignId: string
  status: AdDetailStatus
  targeting: AdTargeting
  kpiMetrics: AdKpiMetrics
  kpiTrends: AdKpiTrends
  trendData: AdTrendPoint[]
  creatives: AdCreativeItem[]
  /** AI 素材优化建议文案 */
  creativeSuggestion: string
}

/** POST ad-detail/overview 响应 */
export type AdDetailOverviewResponse = AdDetailData

/** 远程模式初始态；接口缺字段时不与本地 Mock 混显 */
export function createEmptyAdDetail(): AdDetailData {
  return {
    adId: '',
    adGroupName: '',
    campaignName: '',
    campaignId: '',
    status: 'paused',
    targeting: {
      geoCode: '',
      geoName: '',
      platform: '',
      gender: '',
      ageRange: ''
    },
    kpiMetrics: { spend: 0, installs: 0, cpi: 0, roi: 0 },
    kpiTrends: {},
    trendData: [],
    creatives: [],
    creativeSuggestion: ''
  }
}

export function normalizeAdDetailFromApi(
  res: Partial<AdDetailOverviewResponse> | null | undefined
): AdDetailData {
  const e = createEmptyAdDetail()
  if (!res) return e
  const status = res.status
  return {
    adId: res.adId ?? e.adId,
    adGroupName: res.adGroupName ?? e.adGroupName,
    campaignName: res.campaignName ?? e.campaignName,
    campaignId: res.campaignId ?? e.campaignId,
    status: (status === 'active' || status === 'paused' || status === 'completed'
      ? status
      : e.status) as AdDetailStatus,
    targeting: { ...e.targeting, ...(res.targeting ?? {}) },
    kpiMetrics: { ...e.kpiMetrics, ...(res.kpiMetrics ?? {}) },
    kpiTrends: { ...e.kpiTrends, ...(res.kpiTrends ?? {}) },
    trendData: Array.isArray(res.trendData) ? res.trendData : [],
    creatives: Array.isArray(res.creatives) ? res.creatives : [],
    creativeSuggestion: res.creativeSuggestion ?? e.creativeSuggestion
  }
}
