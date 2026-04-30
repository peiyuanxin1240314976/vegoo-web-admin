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
  /** 广告平台枚举 string，与 cockpit `sourceOptions.value`、请求体/筛选 `source` 一致 */
  source: string
  /** 广告平台展示名（表格/详情） */
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
  /** 广告平台，与 `source` 筛选及 cockpit `sourceOptions.value` 一致 */
  source: string
  optimizer: string
  note: string
  configVersionId: string
  changeReason: string
}

/** 列表查询（契约 `app-assignment/table`）；`source` 表示广告平台筛选，与 UI 筛选「广告平台」一致 */
export interface AssignmentTableQuery {
  keyword?: string
  /** 终端平台：`Android` | `iOS`，空串表示全部 */
  platform?: string
  /** 广告平台筛选，与 `AppAssignmentItem.source`、cockpit `sourceOptions.value` 一致；空串表示全部 */
  source?: string
  optimizer?: string
  /** `活跃` | `草稿配置` | `已归档`，空串表示全部 */
  status?: string
  current: number
  size: number
}

/** 新建分配提交体（契约 create） */
export type AssignmentCreatePayload = AssignmentFormModel

/** 更新分配提交体（契约 update，id 必填） */
export type AssignmentUpdatePayload = AssignmentFormModel & { id: string }

/** 页头 KPI（契约 overview） */
export interface AppAssignmentOverviewResponse {
  /** 分配总条数（与表格维度一致，不含仅统计类虚拟行） */
  total: number
  /** 状态为「活跃」的分配数 */
  active: number
  /** 已配置绩效目标但尚未建立任何分配的应用数（或产品定义口径） */
  unassigned: number
  /** 当前列表涉及的优化师去重人数（可与 overview 同屏或独立统计） */
  optimizerCount: number
}

/** 筛选区下拉（契约 meta-filter-options） */
export interface AppAssignmentMetaFilterResponse {
  /** 优化师选项；广告平台下拉见公用 `useCockpitMetaFilterStore().data.sourceOptions` */
  optimizerOptions: { label: string; value: string }[]
}

/** 新建分配可选应用（契约 meta-assignable-apps） */
export interface AppAssignableAppMetaItem {
  appId: string
  appName: string
  iconColor: string
  platform: AssignmentPlatform
}

/** `meta-assignable-apps` 响应体 */
export interface AppAssignmentMetaAssignableAppsResponse {
  apps: AppAssignableAppMetaItem[]
}

/** 新建弹窗应用下拉的选项（由 meta apps 映射） */
export interface AssignmentAssignableSelectOption {
  label: string
  value: string
  appName: string
  iconColor: string
}

/** 某应用下可选绩效版本（契约 meta-performance-versions） */
export interface AppAssignmentMetaVersionsResponse {
  versions: PerformanceVersion[]
}
