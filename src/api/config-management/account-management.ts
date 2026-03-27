/**
 * 配置管理 · 账户管理 API（广告账户 / 代理商 / 凭据 / 开户，与 `views/config-management/account-management` 对齐）
 */
import request from '@/utils/http'
import type {
  AdAccountItem,
  AccountFormModel,
  AccountTableQuery,
  RechargeFormModel,
  AgencyItem,
  AgencyFormModel,
  AgencyTableQuery,
  CredentialItem,
  CredentialFormModel,
  CredentialTableQuery,
  CredentialValidateResult,
  OpenAccountItem,
  OpenAccountFormModel,
  OpenAccountTableQuery
} from '@/views/config-management/account-management/types'

/** 广告账户分页列表 */
export function fetchAccountTable(params: AccountTableQuery) {
  return request.post<Api.Common.PaginatedResponse<AdAccountItem>>({
    url: '/api/config-management/account/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新建广告账户（提交开户申请） */
export function createAccount(data: AccountFormModel) {
  return request.post<AdAccountItem>({
    url: '/api/config-management/account',
    data,
    showErrorMessage: false
  })
}

/** 编辑广告账户（id 放入请求体） */
export function updateAccount(id: string, data: Partial<AccountFormModel>) {
  return request.post<AdAccountItem>({
    url: '/api/config-management/account/update',
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 停用广告账户（id 放入请求体） */
export function disableAccount(id: string) {
  return request.post<unknown>({
    url: '/api/config-management/account/disable',
    data: { id },
    showErrorMessage: false
  })
}

/** 启用广告账户（id 放入请求体） */
export function enableAccount(id: string) {
  return request.post<unknown>({
    url: '/api/config-management/account/enable',
    data: { id },
    showErrorMessage: false
  })
}

/** 账户充值（id 放入请求体） */
export function rechargeAccount(id: string, data: RechargeFormModel) {
  return request.post<unknown>({
    url: '/api/config-management/account/recharge',
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 导出账户列表 */
export function exportAccountList(params: Partial<AccountTableQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/account/export',
    data: params,
    showErrorMessage: false
  })
}

/** 批量导入账户 */
export function importAccountList(data: { items: AccountFormModel[] }) {
  return request.post<unknown>({
    url: '/api/config-management/account/import',
    data,
    showErrorMessage: false
  })
}

/** 代理商分页列表 */
export function fetchAgencyTable(params: AgencyTableQuery) {
  return request.post<Api.Common.PaginatedResponse<AgencyItem>>({
    url: '/api/config-management/agency/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增代理商 */
export function createAgency(data: AgencyFormModel) {
  return request.post<AgencyItem>({
    url: '/api/config-management/agency',
    data,
    showErrorMessage: false
  })
}

/** 编辑代理商（id 放入请求体） */
export function updateAgency(id: string, data: Partial<AgencyFormModel>) {
  return request.post<AgencyItem>({
    url: '/api/config-management/agency/update',
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 删除代理商（id 放入请求体） */
export function deleteAgency(id: string) {
  return request.post<unknown>({
    url: '/api/config-management/agency/delete',
    data: { id },
    showErrorMessage: false
  })
}

/** 导出代理商列表 */
export function exportAgencyList(params: Partial<AgencyTableQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/agency/export',
    data: params,
    showErrorMessage: false
  })
}

/** 凭据分页列表 */
export function fetchCredentialTable(params: CredentialTableQuery) {
  return request.post<Api.Common.PaginatedResponse<CredentialItem>>({
    url: '/api/config-management/credential/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新建凭据 */
export function createCredential(data: CredentialFormModel) {
  return request.post<CredentialItem>({
    url: '/api/config-management/credential',
    data,
    showErrorMessage: false
  })
}

/** 更新凭据（id 放入请求体） */
export function updateCredential(id: string, data: Partial<CredentialFormModel>) {
  return request.post<CredentialItem>({
    url: '/api/config-management/credential/update',
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 手动触发凭据验证 */
export function validateCredential(id: string) {
  return request.post<CredentialValidateResult>({
    url: '/api/config-management/credential/validate',
    data: { id },
    showErrorMessage: false
  })
}

/** 删除凭据（id 放入请求体） */
export function deleteCredential(id: string) {
  return request.post<unknown>({
    url: '/api/config-management/credential/delete',
    data: { id },
    showErrorMessage: false
  })
}

/** 导出凭据列表 */
export function exportCredentialList(params: Partial<CredentialTableQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/credential/export',
    data: params,
    showErrorMessage: false
  })
}

/** 批量验证凭据 */
export function validateCredentialBatch(ids?: string[]) {
  return request.post<unknown>({
    url: '/api/config-management/credential/validate-batch',
    data: { ids: ids ?? [] },
    showErrorMessage: false
  })
}

/** 开户记录分页列表 */
export function fetchOpenAccountTable(params: OpenAccountTableQuery) {
  return request.post<Api.Common.PaginatedResponse<OpenAccountItem>>({
    url: '/api/config-management/open-account/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新建开户记录 */
export function createOpenAccount(data: OpenAccountFormModel) {
  return request.post<OpenAccountItem>({
    url: '/api/config-management/open-account',
    data,
    showErrorMessage: false
  })
}

/** 分配凭据并激活（id 放入请求体） */
export function assignOpenAccountCredential(id: string, credential: string) {
  return request.post<OpenAccountItem>({
    url: '/api/config-management/open-account/assign',
    data: { id, credential },
    showErrorMessage: false
  })
}

/** 删除开户记录（id 放入请求体） */
export function deleteOpenAccount(id: string) {
  return request.post<unknown>({
    url: '/api/config-management/open-account/delete',
    data: { id },
    showErrorMessage: false
  })
}

/** 导出开户记录 */
export function exportOpenAccountList(params: Partial<OpenAccountTableQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/open-account/export',
    data: params,
    showErrorMessage: false
  })
}

/** 读取飞书推送设置 */
export function fetchOpenAccountFeishuConfig() {
  return request.post<{ enabled: boolean; webhook?: string; mentionAll?: boolean }>({
    url: '/api/config-management/open-account/feishu-config',
    data: {},
    showErrorMessage: false
  })
}

/** 保存飞书推送设置 */
export function saveOpenAccountFeishuConfig(data: {
  enabled: boolean
  webhook?: string
  mentionAll?: boolean
}) {
  return request.post<unknown>({
    url: '/api/config-management/open-account/feishu-config/save',
    data,
    showErrorMessage: false
  })
}
