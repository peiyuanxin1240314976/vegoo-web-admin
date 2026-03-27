/**
 * 广告系列 / 广告编辑页表单数据（与页面子模块字段一一对应，联调以前端类型为准）
 * 路由：/user-growth/ad-performance/campaign-detail/ad-edit
 */

export interface AdEditBasicInfo {
  /** Campaign 名称 */
  name: string
  /** 应用 value，与 ElOption 一致 */
  app: string
  /** 地区代码，如 US */
  region: string
  /** 广告平台 value，如 google */
  channel: string
}

export interface AdEditBudget {
  /** 日预算滑块值（美元量级，与现有 UI 一致） */
  dailyBudget: number
  /** 总预算展示字符串，可含千分位 */
  totalBudget: string
  scheduleType: 'always' | 'custom'
  startDate: string
  endDate: string
  bidStrategy: string
  /** 出价输入，字符串便于展示前缀 $ */
  bidValue: string
}

export interface AdEditTargeting {
  devicePhone: boolean
  deviceTablet: boolean
  iosMin: number
  androidMin: number
  ageRange: [number, number]
  gender: 'all' | 'male' | 'female'
}

export interface AdEditCreativeItem {
  id: string
  name: string
  thumb: string
}

export interface AdEditCreatives {
  items: AdEditCreativeItem[]
  /** 已选素材 id */
  selectedIds: string[]
}

export interface AdEditSidebarRefItem {
  id: string
  name: string
  /** 展示用 ROI 文案，如 3.2x */
  roi: string
  cpi: string
  spend: string
}

export interface AdEditSidebar {
  refItems: AdEditSidebarRefItem[]
  tips: string[]
  /** 预算预测折线数据（14 点），缺省时侧栏用内置默认 */
  budgetForecastValues?: number[]
}

/** POST ad-edit/form 响应体（与表单结构一致） */
export interface AdEditFormData {
  basic: AdEditBasicInfo
  budget: AdEditBudget
  targeting: AdEditTargeting
  creatives: AdEditCreatives
  sidebar: AdEditSidebar
}

export type AdEditFormResponse = AdEditFormData

/** POST ad-edit/save-draft */
export interface AdEditSaveDraftBody {
  campaignId: string
  form: AdEditFormData
  adId?: string
}

export interface AdEditSaveDraftResponse {
  success: boolean
  message?: string
  draftId?: string
}

/** POST ad-edit/submit-launch */
export interface AdEditSubmitLaunchBody {
  campaignId: string
  form: AdEditFormData
  adId?: string
}

export interface AdEditSubmitLaunchResponse {
  success: boolean
  message?: string
  campaignId?: string
  adId?: string
}
