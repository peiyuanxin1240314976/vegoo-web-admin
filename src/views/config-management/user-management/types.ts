export type UserStatus = '活跃' | '待激活' | '已禁用'

export type UserRole = '管理层/老板' | '投放人员' | '变现人员' | '素材设计师' | '运营维护'

export interface UserItem {
  id: string
  userName: string
  email: string
  avatarColor: string
  role: UserRole
  status: UserStatus
  lastLogin: string
  joinTime: string
  accessibleApps: string[]
  remark: string
}

export interface UserFormPayload {
  id?: string
  userName: string
  email: string
  role: UserRole
  accessibleApps: string[]
  remark: string
  status?: UserStatus
}

export interface UserTableQuery {
  current: number
  size: number
  keyword?: string
  role?: string
  status?: string
}

export function deriveAvatarColorFromId(id: string): string {
  const colors = [
    '#3B82F6',
    '#10B981',
    '#F97316',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#EF4444',
    '#F59E0B'
  ]
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = id.charCodeAt(i) + ((h << 5) - h)
  }
  return colors[Math.abs(h) % colors.length]
}
