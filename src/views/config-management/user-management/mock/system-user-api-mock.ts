/**
 * 平台管理 · 用户列表 Mock，与 `mock/backend-api/01-user-list.json` 中 unwrap 后的业务体一致。
 */
import { getSystemUserMockList } from './data'

/** 与用户页列表分页上限一致（`views/config-management/user-management/index.vue`） */
const MAX_PAGE_SIZE = 10

function matchUserName(row: Api.SystemManage.UserListItem, kw: string): boolean {
  const q = kw.trim().toLowerCase()
  if (!q) return true
  return (
    row.userName.toLowerCase().includes(q) ||
    row.nickName.toLowerCase().includes(q) ||
    row.userEmail.toLowerCase().includes(q)
  )
}

function filterRows(
  list: Api.SystemManage.UserListItem[],
  params: Api.SystemManage.UserSearchParams
): Api.SystemManage.UserListItem[] {
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
    if (params.role) {
      if (!row.userRoles.includes(params.role)) return false
    }
    return true
  })
}

export function mockFetchGetUserList(
  params: Api.SystemManage.UserSearchParams
): Promise<Api.SystemManage.UserList> {
  const current = params.current ?? 1
  const rawSize = params.size ?? MAX_PAGE_SIZE
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize))
  const all = getSystemUserMockList()
  const filtered = filterRows(all, params)
  const start = (current - 1) * size
  const records = filtered.slice(start, start + size).map((r) => ({ ...r }))
  return Promise.resolve({
    records,
    total: filtered.length,
    current,
    size
  })
}
