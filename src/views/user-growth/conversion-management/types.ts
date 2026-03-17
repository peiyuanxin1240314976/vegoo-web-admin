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
  app?: string
  appPackage?: string
  conversionName?: string
  conversionId?: string
  platformConversionType?: PlatformConversionType
  systemDisplayName?: string
  billingType?: BillingType
  status?: MappingStatus
}
