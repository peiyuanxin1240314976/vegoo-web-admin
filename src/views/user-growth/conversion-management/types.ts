/**
 * 转化管理 - 类型定义
 * 表格行、筛选、右侧统计、弹窗表单
 */

/** 广告平台转化类型（与设计稿一致） */
export type PlatformConversionType =
  | 'PHONE_CALL_LEAD'
  | 'DOWNLOAD'
  | 'PURCHASE'
  | 'ADD_TO_CART'
  | 'PAGE_VIEW'
  | 'BEGIN_CHECKOUT'
  | string

/** 映射状态 */
export type MappingStatus = 'enabled' | 'duplicate' | 'unmapped'

/** 平台 */
export type PlatformType = 'android' | 'ios'

/** 广告平台（弹窗用） */
export type AdPlatformType = 'google' | 'meta' | 'tiktok' | 'mintegral'

/** 转化类型展示（付费/激活/行为/收入，弹窗用） */
export type ConversionDisplayType = 'paid' | 'activation' | 'behavior' | 'revenue'

/** 计费类型 */
export type BillingType = 'CPA' | 'CPI' | 'CPE' | ''

/** 表格行 - 转化映射项 */
export interface ConversionMappingItem {
  id: string
  platform: PlatformType
  mccAccount: string
  appPackage: string
  conversionName: string
  conversionId: string
  platformConversionType: PlatformConversionType
  systemDisplayName: string
  billingType: BillingType
  status: MappingStatus
}

/** 筛选参数 */
export interface ConversionFilterParams {
  platform?: string
  /**
   * 应用筛选字段（兼容）
   * - appPackage: 推荐使用（语义更准确，对应列表字段 appPackage）
   * - app: 历史字段，保留兼容
   */
  appPackage?: string
  app?: string
  conversionType?: string
  status?: string
  keyword?: string
  current?: number
  size?: number
}

/** 转化类型分布项（甜甜圈图） */
export interface ConversionTypeDistributionItem {
  name: string
  value: number
  count?: number
}

/** 映射状态统计 */
export interface MappingStats {
  mapped: number
  duplicate: number
  unmapped: number
}

/** 平台分布统计 */
export interface PlatformStats {
  android: number
  ios: number
}

/** 右侧面板统计数据 */
export interface ConversionSideStats {
  typeDistribution: ConversionTypeDistributionItem[]
  mappingStats: MappingStats
  platformStats: PlatformStats
}

/** 新增/编辑映射表单 */
export interface ConversionMappingForm {
  platform?: PlatformType
  /**
   * 广告平台字段（与接口约定一致）
   * - source: 推荐使用
   * - adPlatform: 历史字段，保留兼容
   */
  source?: AdPlatformType
  adPlatform?: AdPlatformType
  mccAccount?: string
  app?: string
  appPackage?: string
  conversionName?: string
  conversionId?: string
  platformConversionType?: PlatformConversionType
  conversionDisplayType?: ConversionDisplayType
  systemDisplayName?: string
  billingType?: BillingType
  status?: MappingStatus
  remarks?: string
}

/**
 * 转化数据（Data Tab）- 类型定义
 */

export interface ConversionDataFilterParams {
  /** 查询起始日期（含），YYYY-MM-DD；与契约 data-tab / data-export 一致 */
  startDate?: string
  /** 查询结束日期（含），YYYY-MM-DD */
  endDate?: string
  platform?: string
  /** 同上，兼容 app/appPackage 两种入参 */
  appPackage?: string
  app?: string
  /**
   * 广告平台字段（与接口约定一致）
   * - source: 推荐使用
   * - adPlatform: 历史字段，保留兼容
   */
  source?: string
  adPlatform?: string
  conversionType?: string
}

export interface ConversionKpiItem {
  value: number
  deltaPercent: number
}

export interface ConversionKpi {
  conversionCount: ConversionKpiItem
  conversionValue: ConversionKpiItem
  averageValue: ConversionKpiItem
  activeTypeCount: ConversionKpiItem
}

export type ConversionDataRowLevel = 'group' | 'account' | 'conversion'

export interface ConversionDataRow {
  id: string
  level: ConversionDataRowLevel

  /** 维度信息 */
  accountGroupName?: string
  accountName?: string
  appPackage?: string
  conversionName?: string
  platformConversionType?: PlatformConversionType

  /** 指标 */
  conversionCount: number
  conversionValue: number
  share: number
  trendPoints: number[]

  children?: ConversionDataRow[]
}

export interface ConversionTop10Item {
  name: string
  value: number
}

export interface ConversionValueTrendPoint {
  date: string
  value: number
}

export interface ConversionAccountShareItem {
  accountName: string
  /** 该账户在各转化类型上的占比（0-100），总和=100 */
  segments: { type: string; percent: number }[]
}

export interface ConversionDataSidePanels {
  typeDistribution: ConversionTypeDistributionItem[]
  top10: ConversionTop10Item[]
  valueTrend30d: ConversionValueTrendPoint[]
  accountShare: ConversionAccountShareItem[]
}

export interface ConversionDataResponse {
  kpi: ConversionKpi
  tableRows: ConversionDataRow[]
  sidePanels: ConversionDataSidePanels
}
