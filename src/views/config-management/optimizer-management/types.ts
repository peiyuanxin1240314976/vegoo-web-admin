// ─── 优化师管理 类型定义 ─────────────────────────────────────────

export interface SystemUser {
  id: string
  userName: string
  email: string
  avatarColor: string
}

export interface OptimizerItem {
  id: string
  no: number
  userId: string
  userName: string
  email: string
  avatarColor: string
  /** 版本号（整数，展示为 v{n}） */
  version: number
  /** 代号 s_code */
  sCode: string
  /** 代号2 s_code2，可选 */
  sCode2?: string
  /** 最低消耗要求（美元） */
  minConsumption: number
  /** 检验码（最多 200 字符） */
  checkCode: string
  status: '在职' | '离职'
  /** 负责应用名称列表 */
  apps: string[]
  /** 最近操作记录 */
  recentLogs: OperationLog[]
  createTime: string
  lastModifyTime?: string
}

export interface OperationLog {
  id: string
  timeLabel: string
  content: string
}

export interface OptimizerFormPayload {
  id?: string
  userId: string
  version: number
  sCode: string
  sCode2?: string
  minConsumption: number
  checkCode: string
  status: '在职' | '离职'
}

/** 列表查询（与 Api.ConfigManagement.Optimizer.TableQuery 一致） */
export interface OptimizerTableQuery extends Api.Common.CommonSearchParams {
  keyword?: string
  status?: string
}
