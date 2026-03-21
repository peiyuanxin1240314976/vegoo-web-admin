/** 应用分配模块类型定义 */

export type AssignmentPlatform = 'Android' | 'iOS'
export type AssignmentStatus = '活跃' | '草稿配置' | '已归档'
export type VersionStatus = '已发布' | '草稿' | '已归档'
export type ChangeLogType = '配置变更' | '优化师变更' | '备注更新' | '初始分配' | '已删除'
export type ChangeLogStatus = '有效' | '已删除'

/** 绩效配置版本 */
export interface PerformanceVersion {
  id: string
  version: string // 'v1' | 'v2' | 'v3'
  status: VersionStatus
  isActive: boolean // ★ 当前激活
  date: string
  creator: string
  evalMethod: string // 评估方式
  evalDays: number // 评估天数
  targetRate: string // 达标要求
  minRate: string // 最低要求
  difficulty: number // 难度系数
  minProfit: string // 最低利润
  extraCondition: string // 附加条件
}

/** 变更记录条目 */
export interface ChangeLogItem {
  id: string
  time: string
  type: ChangeLogType
  operator: string
  content: string
  note: string
  status: ChangeLogStatus
}

/** 分配列表条目 */
export interface AppAssignmentItem {
  id: string
  appName: string
  appId: string
  iconColor: string
  platform: AssignmentPlatform
  adPlatform: string
  optimizer: string
  configVersionId: string
  configVersionLabel: string
  assignTime: string
  effectiveTime: string
  status: AssignmentStatus
  operator: string
  note: string
  availableVersions: PerformanceVersion[]
  changeLogs: ChangeLogItem[]
}

/** 表单模型（新建/编辑共用） */
export interface AssignmentFormModel {
  appId: string
  platform: AssignmentPlatform
  adPlatform: string
  optimizer: string
  note: string
  configVersionId: string
  changeReason: string
}
