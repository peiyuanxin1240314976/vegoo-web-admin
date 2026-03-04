/**
 * 大屏数据统计 - 类型定义
 *
 * 区域维度：欧洲、亚洲、中国等，支持大区 → 国家 → 省份下钻
 *
 * @module types/bigScreen
 */

/** 区域统计指标 */
export interface RegionMetrics {
  /** 收入（万元） */
  revenue?: number
  /** 用户数 */
  users?: number
  /** 订单数 */
  orders?: number
  /** 增长率（如 0.15 表示 15%） */
  growth?: number
}

/** 区域统计项 */
export interface RegionStats {
  /** 区域编码：europe | asia | china 或 ISO 国家码 */
  regionCode: string
  /** 区域名称 */
  regionName: string
  /** 所属大区编码，用于下钻 */
  parentCode?: string
  /** 指标 */
  metrics: RegionMetrics
  /** 子区域（下钻用） */
  children?: RegionStats[]
}

/** 投放分析 KPI 卡片 - 今日已花费 */
export interface KpiCardSpend {
  type: 'spend'
  title: string
  status: 'normal' | 'warn' | 'danger'
  statusText: string
  value: number
  budgetPercent: number
  budgetText: string
  trendPercent: number
  trendVs: string
}

/** 投放分析 KPI 卡片 - 今日预估ROI */
export interface KpiCardRoi {
  type: 'roi'
  title: string
  status: 'met' | 'below'
  statusText: string
  value: number
  target: number
  targetText: string
  trendPercent: number
  trendVs: string
}

/** 投放分析 KPI 卡片 - 今日预估利润 */
export interface KpiCardProfit {
  type: 'profit'
  title: string
  trendLabel: string
  value: number
  trendPercent: number
  trendVs: string
}

/** 投放分析 KPI 卡片 - 异常广告系列 */
export interface KpiCardAbnormal {
  type: 'abnormal'
  title: string
  value: number
  trendPercent: number
  trendVs: string
  viewButtonText: string
}

export type KpiCardItem = KpiCardSpend | KpiCardRoi | KpiCardProfit | KpiCardAbnormal

/** 大屏总览数据 */
export interface BigScreenOverview {
  /** 汇总指标 */
  summary: {
    totalRevenue: number
    totalUsers: number
    totalOrders: number
    revenueGrowth: number
    usersGrowth: number
  }
  /** 按区域统计列表（用于地图/柱状/饼图） */
  regions: RegionStats[]
  /** 数据时间说明 */
  dataTime?: string
  /** 投放分析顶部 KPI 卡片（今日已花费、ROI、利润、异常） */
  kpiCards?: KpiCardItem[]
}
