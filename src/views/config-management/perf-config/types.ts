export type PerfStatus = 'published' | 'draft' | 'archived'
export type EvalMethod = 'ROI' | 'CPA'
export type AdPlatform = 'Google' | 'Facebook' | 'TikTok' | 'Kwai' | 'Mintegral' | 'NewsBreak' | 'Unity' | 'IronSource'
export type AppPlatform = 'android' | 'ios'
export type RunStatus = 'running' | 'paused' | 'stopped'

export interface PerfVersion {
  version: number          // v1 / v2 / v3
  status: PerfStatus
  publishedAt: string
  publishedBy: string
  evalMethod: EvalMethod
  evalDays: number
  targetRate: number       // 达标要求 %（ROI）或 $ (CPA)
  minRate: number          // 最低要求
  difficultyFactor: number // 难度系数
  minProfit: number | null // 最低利润 $
  extraCondition: string   // 附加条件
  isActive: boolean
}

export interface PerfConfigItem {
  id: string
  appName: string
  appIcon: string          // 首字母色块颜色
  appPlatform: AppPlatform
  adPlatform: AdPlatform
  runStatus: RunStatus
  allowMulti: boolean
  activeVersion: PerfVersion
  versions: PerfVersion[]
}

// ── 新建表单 ──────────────────────────────────────────────
export interface PerfStep1Form {
  appName: string
  appPlatform: AppPlatform
  adPlatforms: AdPlatform[]
  runStatus: RunStatus
  allowMulti: boolean
}

export interface PerfStep2Form {
  evalMethod: EvalMethod
  evalDays: number
  targetRate: number
  minRate: number
  difficultyFactor: number
  minProfit: number | null
  extraCondition: string
}

export type SaveMode = 'draft' | 'publish'
