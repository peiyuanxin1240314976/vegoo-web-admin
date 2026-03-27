/**
 * 用户管理 Mock，与 `mock/backend-api` 契约 unwrap 后的业务体一致。
 */
import { getAppNow } from '@/utils/app-now'
import type { UserFormPayload, UserItem, UserTableQuery, UserStatus } from '../types'
import { deriveAvatarColorFromId } from '../types'
import { cloneUserMockList } from './data'

let mockList: UserItem[] = cloneUserMockList()

function filterUsers(list: UserItem[], params: UserTableQuery): UserItem[] {
  const kw = (params.keyword ?? '').trim().toLowerCase()
  return list.filter((item) => {
    if (kw && !item.userName.toLowerCase().includes(kw) && !item.email.toLowerCase().includes(kw)) {
      return false
    }
    if (params.role && item.role !== params.role) return false
    if (params.status && item.status !== params.status) return false
    return true
  })
}

export function mockFetchUserTable(
  params: UserTableQuery
): Promise<Api.Common.PaginatedResponse<UserItem>> {
  const filtered = filterUsers(mockList, params)
  const start = (params.current - 1) * params.size
  const records = filtered.slice(start, start + params.size).map((r) => ({ ...r }))
  return Promise.resolve({
    records,
    total: filtered.length,
    current: params.current,
    size: params.size
  })
}

export function mockCreateUser(data: UserFormPayload): Promise<UserItem> {
  if (mockList.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return Promise.reject(new Error('该邮箱已注册'))
  }
  const item: UserItem = {
    id: `u${getAppNow().getTime()}`,
    userName: data.userName,
    email: data.email,
    avatarColor: deriveAvatarColorFromId(data.email),
    role: data.role,
    status: '待激活',
    lastLogin: '未登录',
    joinTime: getAppNow().toISOString().slice(0, 10),
    accessibleApps: [...data.accessibleApps],
    remark: data.remark ?? ''
  }
  mockList = [item, ...mockList]
  return Promise.resolve({ ...item })
}

export function mockUpdateUser(data: UserFormPayload): Promise<UserItem> {
  if (!data.id) {
    return Promise.reject(new Error('缺少用户 id'))
  }
  const idx = mockList.findIndex((u) => u.id === data.id)
  if (idx < 0) {
    return Promise.reject(new Error('用户不存在'))
  }
  const prev = mockList[idx]
  const next: UserItem = {
    ...prev,
    userName: data.userName,
    role: data.role,
    accessibleApps: [...data.accessibleApps],
    remark: data.remark ?? '',
    ...(data.status != null ? { status: data.status } : {})
  }
  mockList = mockList.slice()
  mockList[idx] = next
  return Promise.resolve({ ...next })
}

export function mockDeleteUser(id: string): Promise<unknown> {
  const idx = mockList.findIndex((u) => u.id === id)
  if (idx < 0) {
    return Promise.reject(new Error('用户不存在'))
  }
  mockList = mockList.filter((u) => u.id !== id)
  return Promise.resolve({})
}

export function mockUpdateUserStatus(id: string, status: string): Promise<unknown> {
  const idx = mockList.findIndex((u) => u.id === id)
  if (idx < 0) {
    return Promise.reject(new Error('用户不存在'))
  }
  const nextStatus = status as UserStatus
  const row = { ...mockList[idx], status: nextStatus }
  mockList = mockList.slice()
  mockList[idx] = row
  return Promise.resolve({})
}

export function mockResetUserPassword(id: string): Promise<unknown> {
  if (!mockList.some((u) => u.id === id)) {
    return Promise.reject(new Error('用户不存在'))
  }
  return Promise.resolve({})
}

export function mockResendUserActivation(id: string): Promise<unknown> {
  if (!mockList.some((u) => u.id === id)) {
    return Promise.reject(new Error('用户不存在'))
  }
  return Promise.resolve({})
}

export function mockExportUserList(
  params: Partial<UserTableQuery>
): Promise<{ downloadUrl: string; fileName: string }> {
  void params
  return Promise.resolve({
    downloadUrl: 'https://example.com/exports/users-mock.xlsx',
    fileName: `users-${getAppNow().getTime()}.xlsx`
  })
}
