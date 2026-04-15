export type PerfStatus = 'published' | 'draft' | 'archived'
export type EvalMethod = 'ROI' | 'CPA'
export type RunStatus = 'running' | 'paused' | 'stopped'

export interface PerfVersion {
  version: number
  status: PerfStatus
  publishedAt: string
  publishedBy: string
  evalMethod: EvalMethod
  evalDays: number
  targetRate: number
  minRate: number
  difficultyFactor: number
  minProfit: number | null
  extraCondition: string
  isActive: boolean
}

/** 列表行；应用 / 终端平台 / 广告平台与 cockpit meta-filter-options 的 value 对齐 */
export interface PerfConfigItem {
  id: string
  appId: string
  appName: string
  appIcon: string
  /** 终端平台，与 `platformOptions[].value` 一致，如 `"0"` 安卓、`"1"` iOS */
  platform: string
  /** 主广告平台（多选时取展示/筛选主键，与 `sourceList[0]` 一致） */
  source: string
  /** 已选广告平台枚举值列表，与 `sourceOptions[].value` 一致 */
  sourceList: string[]
  runStatus: RunStatus
  allowMulti: boolean
  activeVersion: PerfVersion
  versions: PerfVersion[]
}

export interface PerfStep1Form {
  appId: string
  appName: string
  platform: string
  sourceList: string[]
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

/** 顶栏 KPI：与列表相同筛选条件下、全量数据的统计（非当前页） */
export interface PerfConfigOverviewKpi {
  total: number
  published: number
  draft: number
  archived: number
}
