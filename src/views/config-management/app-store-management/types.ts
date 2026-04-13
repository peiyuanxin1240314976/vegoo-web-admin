/**
 * 应用商店凭据管理 · 与 `mock/backend-api`、API 对齐的类型。
 */

/** 单条连接异常项（业务唯一性：platform + appName + account） */
export interface AppStoreConnectionAnomalyItem {
  id: string
  platform: string
  appName: string
  account: string
  credType: string
  errorMessage: string
  /** 失效时间展示；`YYYY-MM-DD HH:mm:ss` 或占位符 */
  expiredAt: string
  suggestions: string[]
}

export interface AppStoreConnectionAnomaliesData {
  items: AppStoreConnectionAnomalyItem[]
}
