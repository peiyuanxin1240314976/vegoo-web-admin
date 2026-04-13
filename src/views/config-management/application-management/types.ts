/** 应用管理：列表 / 详情 / 表单共用类型（Mock 与后续接口对齐） */

export type ApplicationPlatform = 'Android' | 'iOS' | 'Web'

export interface ApplicationAppItem {
  id: string
  appName: string
  iconColor: string
  platform: ApplicationPlatform
  bundleId: string
  packageId: string
  shortName: string
  category: string
  timezone: string
  priority: number
  status: string
  creator: string
  createTime: string
  storeId?: string
  url?: string
  dataIsolation?: boolean
  toolEnabled?: boolean
  preGenReport?: boolean
  useOrderDetail?: boolean
  showOrderReport?: boolean
  lastModifier?: string
  lastModifyTime?: string
}

/** 新增/编辑表单提交载荷 */
export type ApplicationFormPayload = Partial<ApplicationAppItem> & {
  appName: string
  platform: ApplicationPlatform
  category: string
  id: string
  bundleId: string
  /** 列表色块；未上传图标时由 id 派生 */
  iconColor?: string
}

/** 由应用 ID 生成稳定色值（HSL），用于列表首字母色块 */
export function deriveIconColorFromId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = id.charCodeAt(i) + ((h << 5) - h)
  }
  const hue = Math.abs(h) % 360
  return `hsl(${hue} 42% 46%)`
}

/** 列表查询（与 table 接口对齐） */
export interface ApplicationTableQuery {
  current: number
  size: number
  keyword?: string
  category?: string
  /** 终端平台：Android / iOS */
  platform?: string
  status?: string
  creator?: string
}

/** 顶部统计卡片查询（与 overview-stats 接口、列表筛选同参，无分页） */
export interface ApplicationOverviewStatsQuery {
  keyword?: string
  category?: string
  /** 终端平台：Android / iOS */
  platform?: string
  status?: string
  creator?: string
}

/** 顶部四卡片指标（与 `06-application-overview-stats.json` 对齐） */
export interface ApplicationOverviewStats {
  /** 当前筛选下应用总条数 */
  totalApplications: number
  /** 其中 iOS 应用数 */
  iosCount: number
  /** 其中 Android 应用数 */
  androidCount: number
  /** 待处理：状态为「禁用」的应用数 */
  pendingCount: number
}

export interface OptionItem {
  label: string
  value: string
}

export interface ApplicationFilterFormOptions {
  categoryOptions: OptionItem[]
  creatorOptions: OptionItem[]
  timezoneOptions: OptionItem[]
}

/** 表单内部模型（与 ElForm 绑定） */
export type ApplicationFormModel = Partial<ApplicationAppItem> & {
  appName: string
  platform: ApplicationPlatform
  category: string
  id: string
  bundleId: string
}
