/**
 * 平台管理 · 用户管理 Mock，与 `mock/backend-api/*.json` 中 unwrap 后的业务体一致。
 */
import { MOCK_ROLE_LIST } from '@/views/config-management/role/mock/data'
import { getSystemUserMockList, patchSystemUserMockItem } from './data'
import type {
  UserStats,
  SystemUserItem,
  SystemUserSearchParams,
  SystemUserListResponse,
  SystemUserMetaOptionsResponse,
  CreateUserPayload,
  UpdateUserPayload,
  PermissionUpdatePayload,
  DisableUserPayload,
  DisableUserResponse,
  UserAppPermissionsOptionsData,
  SaveUserAppPermissionsPayload
} from '../types'

const MAX_PAGE_SIZE = 10

function roleIdsToRoleCodes(roleIds: number[]): string[] {
  const idSet = new Set(roleIds)
  return MOCK_ROLE_LIST.filter((r) => idSet.has(r.roleId)).map((r) => r.roleCode)
}

// ==================== 00-user-stats ====================

export function mockFetchStats(): Promise<UserStats> {
  return Promise.resolve({ total: 24, active: 8, disabled: 5, pending: 11 })
}

// ==================== 01-user-list ====================

function matchUserName(row: SystemUserItem, kw: string): boolean {
  const q = kw.trim().toLowerCase()
  if (!q) return true
  return (
    row.userName.toLowerCase().includes(q) ||
    row.nickName.toLowerCase().includes(q) ||
    row.userEmail.toLowerCase().includes(q)
  )
}

function filterRows(list: SystemUserItem[], params: SystemUserSearchParams): SystemUserItem[] {
  const roleFilter =
    typeof params.role === 'number'
      ? MOCK_ROLE_LIST.find((r) => r.roleId === params.role)?.roleCode
      : typeof params.role === 'string'
        ? params.role.trim()
        : ''

  return list.filter((row) => {
    if (params.id != null && row.id !== params.id) return false
    if (params.userName && !matchUserName(row, params.userName)) return false
    if (params.status && row.status !== params.status) return false
    if (params.userGender && row.userGender !== params.userGender) return false
    if (params.userPhone && !row.userPhone.includes(params.userPhone.trim())) return false
    if (
      params.userEmail &&
      !row.userEmail.toLowerCase().includes(params.userEmail.trim().toLowerCase())
    ) {
      return false
    }
    if (roleFilter && !row.userRoles.includes(roleFilter)) return false
    return true
  })
}

export function mockFetchGetUserList(
  params: SystemUserSearchParams
): Promise<SystemUserListResponse> {
  const current = params.current ?? 1
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, params.size ?? MAX_PAGE_SIZE))
  const filtered = filterRows(getSystemUserMockList() as SystemUserItem[], params)
  const start = (current - 1) * size
  return Promise.resolve({
    records: filtered.slice(start, start + size).map((r) => ({ ...r })),
    total: filtered.length,
    current,
    size
  })
}

// ==================== 02-user-meta-options ====================

export function mockFetchMetaOptions(params?: {
  scene?: string
}): Promise<SystemUserMetaOptionsResponse> {
  void params
  return Promise.resolve({
    roleOptions: [
      { label: '管理层/老板', value: 'admin' },
      { label: '投放人员', value: 'ops' },
      { label: '审计人员', value: 'auditor' }
    ],
    statusOptions: [
      { label: '在线', value: '1' },
      { label: '离线', value: '2' },
      { label: '异常', value: '3' },
      { label: '已禁用', value: '4' }
    ]
  })
}

// ==================== 03-user-create ====================

export function mockCreateUser(payload: CreateUserPayload): Promise<SystemUserItem> {
  const now = new Date()
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  const t = fmt(now)
  return Promise.resolve({
    id: Date.now(),
    avatar: '',
    status: '1',
    userName: payload.userName,
    nickName: payload.nickName ?? '',
    userGender: payload.userGender,
    userPhone: payload.userPhone,
    userEmail: payload.userEmail ?? '',
    userRoles: roleIdsToRoleCodes(payload.userRoles),
    accessibleApps: payload.accessibleApps ?? [],
    remark: payload.remark ?? '',
    createBy: 'current_user',
    createTime: t,
    updateBy: 'current_user',
    updateTime: t
  })
}

// ==================== 04-user-update ====================

export function mockUpdateUser(
  payload: UpdateUserPayload
): Promise<{ success: boolean; updatedUser: SystemUserItem }> {
  const all = getSystemUserMockList() as SystemUserItem[]
  const now = new Date()
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  const existing = all.find((r) => r.id === payload.id) ?? all[0]
  return Promise.resolve({
    success: true,
    updatedUser: {
      ...existing,
      userName: payload.userName,
      userPhone: payload.userPhone,
      userGender: payload.userGender,
      userRoles: roleIdsToRoleCodes(payload.userRoles),
      userEmail: payload.userEmail ?? existing.userEmail,
      nickName: payload.nickName ?? existing.nickName,
      accessibleApps: payload.accessibleApps ?? existing.accessibleApps,
      remark: payload.remark ?? existing.remark,
      updateBy: 'current_user',
      updateTime: fmt(now)
    }
  })
}

// ==================== 05-user-permission-update ====================

export function mockPermissionUpdate(
  payload: PermissionUpdatePayload
): Promise<{ success: boolean; updatedUser: SystemUserItem }> {
  const all = getSystemUserMockList() as SystemUserItem[]
  const now = new Date()
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  const existing = all.find((r) => r.id === payload.id) ?? all[0]
  const updatedUser = {
    ...existing,
    userRoles: [payload.role],
    accessibleApps: payload.apps,
    remark: payload.remark ?? existing.remark,
    updateBy: 'current_user',
    updateTime: fmt(now)
  }
  patchSystemUserMockItem(payload.id, updatedUser)
  return Promise.resolve({
    success: true,
    updatedUser
  })
}

// ==================== 06-user-disable ====================

export function mockDisableUser(payload: DisableUserPayload): Promise<DisableUserResponse> {
  const now = new Date()
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  return Promise.resolve({ success: true, id: payload.id, status: '4', updateTime: fmt(now) })
}

// ==================== 07-user-app-permissions-options ====================

const MOCK_APP_PERMISSION_OPTIONS: UserAppPermissionsOptionsData['apps'] = [
  {
    appId: 'app-weather',
    appName: '天气助手',
    appUuid: '550e8400-e29b-41d4-a716-446655440001',
    permitted: true,
    platform: 1,
    status: 1
  },
  {
    appId: 'app-tracker',
    appName: '手机定位',
    appUuid: '550e8400-e29b-41d4-a716-446655440002',
    permitted: true,
    platform: 1,
    status: 1
  },
  {
    appId: 'app-sugar',
    appName: '血糖管理',
    appUuid: '550e8400-e29b-41d4-a716-446655440003',
    permitted: false,
    platform: 2,
    status: 0
  }
]

export function mockFetchUserAppPermissionsOptions(
  userId: number
): Promise<UserAppPermissionsOptionsData> {
  return Promise.resolve({
    userId,
    mode: 'whitelist',
    apps: MOCK_APP_PERMISSION_OPTIONS.map((a) => ({ ...a }))
  })
}

// ==================== 08-user-app-permissions-save ====================

export function mockSaveUserAppPermissions(
  payload: SaveUserAppPermissionsPayload
): Promise<{ success: boolean }> {
  patchSystemUserMockItem(payload.userId, {
    accessibleApps: [...payload.allowedAppUuids]
  })
  return Promise.resolve({ success: true })
}
