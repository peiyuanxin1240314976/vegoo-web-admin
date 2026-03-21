/** 应用管理：列表 / 详情 / 表单共用类型（Mock 与后续接口对齐） */

export type ApplicationPlatform = 'Android' | 'iOS'

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
}

/** 表单内部模型（与 ElForm 绑定） */
export type ApplicationFormModel = Partial<ApplicationAppItem> & {
  appName: string
  platform: ApplicationPlatform
  category: string
  id: string
  bundleId: string
}
