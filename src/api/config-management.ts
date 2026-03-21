/**
 * 系统配置管理 API（应用 / 用户 / 优化师等）
 * 接入真实网关后由 request 返回 `data`；部分页面在接口不可用时回退本地 Mock。
 */
import request from '@/utils/http'
import type {
  ApplicationAppItem,
  ApplicationFormPayload,
  ApplicationTableQuery
} from '@/views/config-management/application-management/types'

/** 分页列表 */
export function fetchApplicationTable(params: ApplicationTableQuery) {
  return request.post<Api.Common.PaginatedResponse<ApplicationAppItem>>({
    url: '/api/config-management/application/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增应用 */
export function createApplication(data: ApplicationFormPayload) {
  return request.post<ApplicationAppItem>({
    url: '/api/config-management/application',
    data,
    showErrorMessage: false
  })
}

/** 更新应用 */
export function updateApplication(data: ApplicationFormPayload) {
  return request.put<ApplicationAppItem>({
    url: `/api/config-management/application/${data.id}`,
    data,
    showErrorMessage: false
  })
}

/** 删除应用 */
export function deleteApplication(id: string) {
  return request.del<unknown>({
    url: `/api/config-management/application/${id}`,
    showErrorMessage: false
  })
}

/** 导出（联调时若返回文件流需在 http 层单独处理 responseType） */
export function exportApplicationList(params: Partial<ApplicationTableQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/application/export',
    data: params,
    showErrorMessage: false
  })
}

// ─── 用户管理 ───────────────────────────────────────────

import type {
  UserItem,
  UserFormPayload,
  UserTableQuery
} from '@/views/config-management/user-management/types'

/** 分页列表 */
export function fetchUserTable(params: UserTableQuery) {
  return request.post<Api.Common.PaginatedResponse<UserItem>>({
    url: '/api/config-management/user/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增用户 */
export function createUser(data: UserFormPayload) {
  return request.post<UserItem>({
    url: '/api/config-management/user',
    data,
    showErrorMessage: false
  })
}

/** 更新用户 */
export function updateUser(data: UserFormPayload) {
  return request.put<UserItem>({
    url: `/api/config-management/user/${data.id}`,
    data,
    showErrorMessage: false
  })
}

/** 删除用户 */
export function deleteUser(id: string) {
  return request.del<unknown>({
    url: `/api/config-management/user/${id}`,
    showErrorMessage: false
  })
}

/** 禁用/启用用户 */
export function updateUserStatus(id: string, status: string) {
  return request.put<unknown>({
    url: `/api/config-management/user/${id}/status`,
    data: { status },
    showErrorMessage: false
  })
}

/** 重置密码 */
export function resetUserPassword(id: string) {
  return request.post<unknown>({
    url: `/api/config-management/user/${id}/reset-password`,
    showErrorMessage: false
  })
}

/** 发送激活邮件 */
export function resendUserActivation(id: string) {
  return request.post<unknown>({
    url: `/api/config-management/user/${id}/resend-activation`,
    showErrorMessage: false
  })
}

// ─── 优化师管理 ───────────────────────────────────────────

/** 分页列表（筛选与分页由服务端处理） */
export function fetchOptimizerTable(params: Api.ConfigManagement.Optimizer.TableQuery) {
  return request.post<Api.Common.PaginatedResponse<Api.ConfigManagement.Optimizer.ListItem>>({
    url: '/api/config-management/optimizer/table',
    data: params,
    showErrorMessage: false
  })
}

/** 页头 KPI 卡片 */
export function fetchOptimizerOverview() {
  return request.post<Api.ConfigManagement.Optimizer.OverviewResponse>({
    url: '/api/config-management/optimizer/overview',
    data: {},
    showErrorMessage: false
  })
}

/** 新建弹窗：可选系统用户列表 */
export function fetchOptimizerMetaSystemUsers() {
  return request.post<Api.ConfigManagement.Optimizer.MetaSystemUserItem[]>({
    url: '/api/config-management/optimizer/meta-system-users',
    data: {},
    showErrorMessage: false
  })
}

/** 新增优化师 */
export function createOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload) {
  return request.post<Api.ConfigManagement.Optimizer.ListItem>({
    url: '/api/config-management/optimizer',
    data,
    showErrorMessage: false
  })
}

/** 更新优化师 */
export function updateOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload & { id: string }) {
  return request.put<Api.ConfigManagement.Optimizer.ListItem>({
    url: `/api/config-management/optimizer/${data.id}`,
    data,
    showErrorMessage: false
  })
}

/** 导出（联调时若返回文件流需在 http 层单独处理 responseType） */
export function exportOptimizerList(params: Partial<Api.ConfigManagement.Optimizer.TableQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/optimizer/export',
    data: params,
    showErrorMessage: false
  })
}
