/**
 * 配置管理 · 账户管理 API（广告账户 / 代理商 / 凭据 / 开户 / BC，与 `views/config-management/account-management` 对齐）
 */
import request, { requestBlob } from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import FileSaver from 'file-saver'
import { getAppNow } from '@/utils/app-now'
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
  OpenAccountTableQuery,
  BcItem,
  BcFormModel,
  BcTableQuery
} from '@/views/config-management/account-management/types'

const CONFIG_MANAGEMENT_BASE = `${ANALYSIS_API_BASE}/config-management`
const ACCOUNT_MANAGEMENT_BASE = `${ANALYSIS_API_BASE}/account-management`
const BC_MANAGEMENT_BASE = `${ACCOUNT_MANAGEMENT_BASE}/bc-management`
const OPEN_ACCOUNT_BASE = `${ACCOUNT_MANAGEMENT_BASE}/open-account`

function getFilenameFromContentDisposition(value?: string): string | undefined {
  if (!value) return
  const v = String(value)

  // RFC 5987: filename*=UTF-8''...
  const mStar = v.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (mStar?.[1]) {
    try {
      return decodeURIComponent(mStar[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return mStar[1].trim().replace(/^"|"$/g, '')
    }
  }

  const m = v.match(/filename\s*=\s*("?)([^";]+)\1/i)
  if (m?.[2]) return m[2].trim()
}

async function downloadExportFile(url: string, data: unknown, fallbackBaseName: string) {
  if (import.meta.env.DEV) {
    console.debug('[downloadExportFile] request blob', { url, fallbackBaseName })
  }
  const res = await requestBlob({
    url,
    method: 'POST',
    data,
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*'
    }
  })

  const contentType = String(res.headers?.['content-type'] ?? '').toLowerCase()

  // 统一按“文件流导出”处理：若后端返回 JSON，视为不符合约定，给出明确提示
  if (contentType.includes('application/json')) {
    try {
      const text = await res.data.text()
      const msg = text
        ? `导出接口未返回文件流（返回 JSON）：${text}`
        : '导出接口未返回文件流（返回 JSON）'
      throw new Error(msg)
    } catch {
      throw new Error('导出接口未返回文件流（返回 JSON）')
    }
  }

  const filenameFromHeader = getFilenameFromContentDisposition(res.headers?.['content-disposition'])
  const hasAttachment = !!filenameFromHeader
  if (
    !hasAttachment &&
    !contentType.includes('spreadsheetml') &&
    !contentType.includes('excel') &&
    !contentType.includes('text/csv')
  ) {
    throw new Error(`导出接口未返回可识别的文件流（content-type=${contentType || 'unknown'}）`)
  }
  const ext =
    contentType.includes('text/csv') || contentType.includes('application/csv') ? 'csv' : 'xlsx'
  const fallback = `${fallbackBaseName}_${getAppNow().getTime()}.${ext}`
  const filename = filenameFromHeader || fallback

  FileSaver.saveAs(res.data, filename)
}

/** 广告账户分页列表 */
export function fetchAccountTable(params: AccountTableQuery) {
  return request.post<Api.Common.PaginatedResponse<AdAccountItem>>({
    url: `${CONFIG_MANAGEMENT_BASE}/account/table`,
    data: params,
    showErrorMessage: false
  })
}

/** 新建广告账户（提交开户申请） */
export function createAccount(data: AccountFormModel) {
  return request.post<AdAccountItem>({
    url: `${CONFIG_MANAGEMENT_BASE}/account`,
    data,
    showErrorMessage: false
  })
}

/** 编辑广告账户（id 放入请求体） */
export function updateAccount(id: string, data: Partial<AccountFormModel>) {
  return request.post<AdAccountItem>({
    url: `${CONFIG_MANAGEMENT_BASE}/account/update`,
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 停用广告账户（id 放入请求体） */
export function disableAccount(id: string) {
  return request.post<unknown>({
    url: `${CONFIG_MANAGEMENT_BASE}/account/disable`,
    data: { id },
    showErrorMessage: false
  })
}

/** 启用广告账户（id 放入请求体） */
export function enableAccount(id: string) {
  return request.post<unknown>({
    url: `${CONFIG_MANAGEMENT_BASE}/account/enable`,
    data: { id },
    showErrorMessage: false
  })
}

/** 账户充值（id 放入请求体） */
export function rechargeAccount(id: string, data: RechargeFormModel) {
  return request.post<unknown>({
    url: `${CONFIG_MANAGEMENT_BASE}/account/recharge`,
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 导出账户列表 */
export async function exportAccountList(params: Partial<AccountTableQuery>) {
  await downloadExportFile(`${CONFIG_MANAGEMENT_BASE}/account/export`, params, 'accounts')
}

/** 批量导入账户 */
export function importAccountList(data: { items: AccountFormModel[] }) {
  return request.post<unknown>({
    url: `${CONFIG_MANAGEMENT_BASE}/account/import`,
    data,
    showErrorMessage: false
  })
}

/** 代理商分页列表 */
export function fetchAgencyTable(params: AgencyTableQuery) {
  return request.post<Api.Common.PaginatedResponse<AgencyItem>>({
    url: `${CONFIG_MANAGEMENT_BASE}/agency/table`,
    data: params,
    showErrorMessage: false
  })
}

/** 新增代理商 */
export function createAgency(data: AgencyFormModel) {
  return request.post<AgencyItem>({
    url: `${CONFIG_MANAGEMENT_BASE}/agency`,
    data,
    showErrorMessage: false
  })
}

/** 编辑代理商（id 放入请求体） */
export function updateAgency(id: string, data: Partial<AgencyFormModel>) {
  return request.post<AgencyItem>({
    url: `${CONFIG_MANAGEMENT_BASE}/agency/update`,
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 删除代理商（id 放入请求体） */
export function deleteAgency(id: string) {
  return request.post<unknown>({
    url: `${CONFIG_MANAGEMENT_BASE}/agency/delete`,
    data: { id },
    showErrorMessage: false
  })
}

/** 导出代理商列表 */
export async function exportAgencyList(params: Partial<AgencyTableQuery>) {
  await downloadExportFile(`${CONFIG_MANAGEMENT_BASE}/agency/export`, params, 'agencies')
}

/** 凭据分页列表 */
export function fetchCredentialTable(params: CredentialTableQuery) {
  return request.post<Api.Common.PaginatedResponse<CredentialItem>>({
    url: `${CONFIG_MANAGEMENT_BASE}/credential/table`,
    data: params,
    showErrorMessage: false
  })
}

/** 新建凭据 */
export function createCredential(data: CredentialFormModel) {
  return request.post<CredentialItem>({
    url: `${CONFIG_MANAGEMENT_BASE}/credential`,
    data,
    showErrorMessage: false
  })
}

/** 更新凭据（id 放入请求体） */
export function updateCredential(id: string, data: Partial<CredentialFormModel>) {
  return request.post<CredentialItem>({
    url: `${CONFIG_MANAGEMENT_BASE}/credential/update`,
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 手动触发凭据验证 */
export function validateCredential(id: string) {
  return request.post<CredentialValidateResult>({
    url: `${CONFIG_MANAGEMENT_BASE}/credential/validate`,
    data: { id },
    showErrorMessage: false
  })
}

/** 删除凭据（id 放入请求体） */
export function deleteCredential(id: string) {
  return request.post<unknown>({
    url: `${CONFIG_MANAGEMENT_BASE}/credential/delete`,
    data: { id },
    showErrorMessage: false
  })
}

/** 导出凭据列表 */
export async function exportCredentialList(params: Partial<CredentialTableQuery>) {
  await downloadExportFile(`${CONFIG_MANAGEMENT_BASE}/credential/export`, params, 'credentials')
}

/** 批量验证凭据 */
export function validateCredentialBatch(ids?: string[]) {
  return request.post<unknown>({
    url: `${CONFIG_MANAGEMENT_BASE}/credential/validate-batch`,
    data: { ids: ids ?? [] },
    showErrorMessage: false
  })
}

/** 开户记录分页列表 */
export function fetchOpenAccountTable(params: OpenAccountTableQuery) {
  return request.post<Api.Common.PaginatedResponse<OpenAccountItem>>({
    url: `${OPEN_ACCOUNT_BASE}/table`,
    data: params,
    showErrorMessage: false
  })
}

export interface OpenAccountOverviewStatsResponse {
  total: number
  pending: number
  active: number
  failed: number
}

/** 开户管理统计卡片（总数/待分配/已激活/失败） */
export function fetchOpenAccountOverviewStats(params: Partial<OpenAccountTableQuery>) {
  return request.post<OpenAccountOverviewStatsResponse>({
    url: `${OPEN_ACCOUNT_BASE}/overview-stats`,
    data: params,
    showErrorMessage: false
  })
}

/** 开户筛选项（状态、代理商） */
export function fetchOpenAccountFilterOptions() {
  return request.post<{
    statusOptions: { label: string; value: string; count?: number }[]
    agencyOptions: { label: string; value: string }[]
  }>({
    url: `${OPEN_ACCOUNT_BASE}/filter-options`,
    data: {},
    showErrorMessage: false
  })
}

/** 新建开户记录 */
export function createOpenAccount(data: OpenAccountFormModel) {
  return request.post<OpenAccountItem>({
    url: `${OPEN_ACCOUNT_BASE}/create`,
    data,
    showErrorMessage: false
  })
}

/** 分配凭据并激活（id 放入请求体） */
export function assignOpenAccountCredential(id: string, credential: string) {
  return request.post<OpenAccountItem>({
    url: `${OPEN_ACCOUNT_BASE}/assign`,
    data: { id, credential },
    showErrorMessage: false
  })
}

/** 删除开户记录（id 放入请求体） */
export function deleteOpenAccount(id: string) {
  return request.post<unknown>({
    url: `${OPEN_ACCOUNT_BASE}/delete`,
    data: { id },
    showErrorMessage: false
  })
}

/** 导出开户记录 */
export async function exportOpenAccountList(params: Partial<OpenAccountTableQuery>) {
  await downloadExportFile(`${OPEN_ACCOUNT_BASE}/export`, params, 'open-accounts')
}

/** 读取飞书推送设置 */
export function fetchOpenAccountFeishuConfig() {
  return request.post<{ enabled: boolean; webhook?: string; mentionAll?: boolean }>({
    url: `${OPEN_ACCOUNT_BASE}/feishu-config/fetch`,
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
    url: `${OPEN_ACCOUNT_BASE}/feishu-config/save`,
    data,
    showErrorMessage: false
  })
}

/** BC/BM 分页列表 */
export function fetchBcTable(params: BcTableQuery) {
  return request.post<Api.Common.PaginatedResponse<BcItem>>({
    url: `${BC_MANAGEMENT_BASE}/table`,
    data: params,
    showErrorMessage: false
  })
}

export interface BcOverviewStatsResponse {
  total: number
  healthy: number
  banned: number
  monthOpen: number
}

/** BC 概览统计（页面顶部 4 张卡片） */
export function fetchBcOverviewStats(params: Partial<BcTableQuery>) {
  return request.post<BcOverviewStatsResponse>({
    url: `${BC_MANAGEMENT_BASE}/overview-stats`,
    data: params,
    showErrorMessage: false
  })
}

/** 新建 BC */
export function createBc(data: BcFormModel) {
  return request.post<BcItem>({
    url: `${BC_MANAGEMENT_BASE}/create`,
    data,
    showErrorMessage: false
  })
}

/** 编辑 BC */
export function updateBc(id: string, data: Partial<BcFormModel>) {
  return request.post<BcItem>({
    url: `${BC_MANAGEMENT_BASE}/update`,
    data: { id, ...data },
    showErrorMessage: false
  })
}

/** 删除 BC */
export function deleteBc(id: string) {
  return request.post<unknown>({
    url: `${BC_MANAGEMENT_BASE}/delete`,
    data: { id },
    showErrorMessage: false
  })
}

/** 导出 BC 列表 */
export async function exportBcList(params: Partial<BcTableQuery>) {
  await downloadExportFile(`${BC_MANAGEMENT_BASE}/export`, params, 'bc')
}
