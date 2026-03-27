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

// ─── 优化师管理（契约 + Mock：`views/.../optimizer-management`）────────────────
import {
  OptimizerEndpoint,
  isOptimizerEndpointMock
} from '@/views/config-management/optimizer-management/config/data-source'
import * as optimizerMock from '@/views/config-management/optimizer-management/mock/optimizer-api-mock'

/** 分页列表（筛选与分页由服务端处理） */
export function fetchOptimizerTable(params: Api.ConfigManagement.Optimizer.TableQuery) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Table)) {
    return optimizerMock.mockFetchOptimizerTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<Api.ConfigManagement.Optimizer.ListItem>>({
    url: '/api/config-management/optimizer/table',
    data: params,
    showErrorMessage: false
  })
}

/** 页头 KPI 卡片 */
export function fetchOptimizerOverview() {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Overview)) {
    return optimizerMock.mockFetchOptimizerOverview()
  }
  return request.post<Api.ConfigManagement.Optimizer.OverviewResponse>({
    url: '/api/config-management/optimizer/overview',
    data: {},
    showErrorMessage: false
  })
}

/** 新建弹窗：可选系统用户列表 */
export function fetchOptimizerMetaSystemUsers() {
  if (isOptimizerEndpointMock(OptimizerEndpoint.MetaSystemUsers)) {
    return optimizerMock.mockFetchOptimizerMetaSystemUsers()
  }
  return request.post<Api.ConfigManagement.Optimizer.MetaSystemUserItem[]>({
    url: '/api/config-management/optimizer/meta-system-users',
    data: {},
    showErrorMessage: false
  })
}

/** 新增优化师 */
export function createOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Create)) {
    return optimizerMock.mockCreateOptimizer(data)
  }
  return request.post<Api.ConfigManagement.Optimizer.ListItem>({
    url: '/api/config-management/optimizer',
    data,
    showErrorMessage: false
  })
}

/** 更新优化师（POST + body 含 id，与契约一致） */
export function updateOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload & { id: string }) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Update)) {
    return optimizerMock.mockUpdateOptimizer(data)
  }
  return request.post<Api.ConfigManagement.Optimizer.ListItem>({
    url: '/api/config-management/optimizer/update',
    data,
    showErrorMessage: false
  })
}

/** 导出（联调时若返回文件流需在 http 层单独处理 responseType） */
export function exportOptimizerList(params: Partial<Api.ConfigManagement.Optimizer.TableQuery>) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Export)) {
    return optimizerMock.mockExportOptimizerList(params)
  }
  return request.post<Api.ConfigManagement.Optimizer.ExportResponse>({
    url: '/api/config-management/optimizer/export',
    data: params,
    showErrorMessage: false
  })
}

// ─── 账户管理 ───────────────────────────────────────────

import type {
  AdAccountItem,
  AccountFormModel,
  AccountTableQuery,
  RechargeFormModel
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

// ─── 代理商管理 ───────────────────────────────────────

import type {
  AgencyItem,
  AgencyFormModel,
  AgencyTableQuery
} from '@/views/config-management/account-management/types'

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

// ─── 凭据管理 ───────────────────────────────────────────

import type {
  CredentialItem,
  CredentialFormModel,
  CredentialTableQuery,
  CredentialValidateResult
} from '@/views/config-management/account-management/types'

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

// ─── 开户管理 ────────────────────────────────────────

import type {
  OpenAccountItem,
  OpenAccountFormModel,
  OpenAccountTableQuery
} from '@/views/config-management/account-management/types'

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

// ─── 国家管理 ────────────────────────────────────────────

import type {
  CountryItem,
  CountryFormModel,
  CountryTableQuery
} from '@/views/config-management/country-management/types'

/** 国家分页列表 */
export function fetchCountryTable(params: CountryTableQuery) {
  return request.post<Api.Common.PaginatedResponse<CountryItem>>({
    url: '/api/config-management/country/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增国家 */
export function createCountry(data: CountryFormModel) {
  return request.post<CountryItem>({
    url: '/api/config-management/country',
    data,
    showErrorMessage: false
  })
}

/** 更新国家 */
export function updateCountry(code: string, data: Partial<CountryFormModel>) {
  return request.put<CountryItem>({
    url: `/api/config-management/country/${code}`,
    data,
    showErrorMessage: false
  })
}

/** 删除国家 */
export function deleteCountry(code: string) {
  return request.del<unknown>({
    url: `/api/config-management/country/${code}`,
    showErrorMessage: false
  })
}

/** 导出国家列表 */
export function exportCountryList(params: Partial<CountryTableQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/country/export',
    data: params,
    showErrorMessage: false
  })
}

/** 批量导入国家 */
export function importCountryList(data: { items: CountryFormModel[] }) {
  return request.post<unknown>({
    url: '/api/config-management/country/import',
    data,
    showErrorMessage: false
  })
}

// ──────────────────────────────────────────────────────────
// 汇率管理
// ──────────────────────────────────────────────────────────
import type {
  ExchangeRateQuery,
  ManualRateFormModel,
  SyncConfig
} from '@/views/config-management/exchange-rate-management/types'

/** 汇率列表 */
export function fetchExchangeRateTable(params: ExchangeRateQuery) {
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/table',
    data: params,
    showErrorMessage: false
  })
}

/** 手动新增汇率 */
export function createExchangeRate(data: ManualRateFormModel) {
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate',
    data,
    showErrorMessage: false
  })
}

/** 触发汇率同步 */
export function syncExchangeRates(pairs: string[], source: string) {
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/sync',
    data: { pairs, source },
    showErrorMessage: false
  })
}

/** 保存同步设置 */
export function saveSyncConfig(data: SyncConfig) {
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/sync-config',
    data,
    showErrorMessage: false
  })
}

/** 更新覆盖自动同步状态 */
export function updateExchangeRateOverride(id: string, overrideAuto: boolean) {
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/override',
    data: { id, overrideAuto },
    showErrorMessage: false
  })
}

/** 导出汇率列表 */
export function exportExchangeRates(params: Partial<ExchangeRateQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/exchange-rate/export',
    data: params,
    showErrorMessage: false
  })
}

// ──────────────────────────────────────────────────────────
// 成本系数管理
// ──────────────────────────────────────────────────────────
import type {
  CostCoefficientQuery,
  CostCoefficientFormModel
} from '@/views/config-management/cost-coefficient/types'

/** 成本系数列表 */
export function fetchCostCoefficientTable(params: CostCoefficientQuery) {
  return request.post<unknown>({
    url: '/api/config-management/cost-coefficient/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增成本系数 */
export function createCostCoefficient(data: CostCoefficientFormModel) {
  return request.post<unknown>({
    url: '/api/config-management/cost-coefficient',
    data,
    showErrorMessage: false
  })
}

/** 编辑成本系数 */
export function updateCostCoefficient(id: string, data: Partial<CostCoefficientFormModel>) {
  return request.put<unknown>({
    url: `/api/config-management/cost-coefficient/${id}`,
    data,
    showErrorMessage: false
  })
}

/** 删除成本系数（逻辑删除） */
export function deleteCostCoefficient(id: string) {
  return request.del<unknown>({
    url: `/api/config-management/cost-coefficient/${id}`,
    showErrorMessage: false
  })
}

/** 成本系数调整历史 */
export function fetchCostCoefficientHistory(id: string) {
  return request.post<unknown>({
    url: '/api/config-management/cost-coefficient/history',
    data: { id },
    showErrorMessage: false
  })
}

/** 导出成本系数列表 */
export function exportCostCoefficient(params: Partial<CostCoefficientQuery>) {
  return request.post<unknown>({
    url: '/api/config-management/cost-coefficient/export',
    data: params,
    showErrorMessage: false
  })
}

// ──────────────────────────────────────────────────────────
// 导入商店订单
// ──────────────────────────────────────────────────────────
import type { ImportTask, ImportReportDetail } from '@/views/config-management/order-import/types'

/** 上传历史分页列表 */
export function fetchOrderImportTable(params: {
  page: number
  pageSize: number
  dataSource?: string
  status?: string
}) {
  return request.post<Api.Common.PaginatedResponse<ImportTask>>({
    url: '/api/config-management/order-import/table',
    data: params,
    showErrorMessage: false
  })
}

/** 今日导入统计（顶部 KPI） */
export function fetchOrderImportSummary() {
  return request.post<{
    todayTotal: number
    completed: number
    processing: number
    failed: number
  }>({
    url: '/api/config-management/order-import/summary',
    data: {},
    showErrorMessage: false
  })
}

/** 提交导入任务（multipart，前端模拟时传 FormData） */
export function submitOrderImport(data: FormData) {
  return request.post<{ taskId: string }>({
    url: '/api/config-management/order-import/submit',
    data,
    showErrorMessage: false
  })
}

/** 暂停导入任务 */
export function pauseOrderImport(taskId: string) {
  return request.post<unknown>({
    url: '/api/config-management/order-import/pause',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 取消导入任务 */
export function cancelOrderImport(taskId: string) {
  return request.post<unknown>({
    url: '/api/config-management/order-import/cancel',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 获取导入报告详情 */
export function fetchOrderImportReport(taskId: string) {
  return request.post<ImportReportDetail>({
    url: '/api/config-management/order-import/report',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 导出导入报告 */
export function exportOrderImportReport(taskId: string) {
  return request.post<unknown>({
    url: '/api/config-management/order-import/report/export',
    data: { taskId },
    showErrorMessage: false
  })
}

/** 下载导入模板 */
export function fetchOrderImportTemplate(dataSource: 'appstore' | 'googleplay') {
  return request.post<unknown>({
    url: '/api/config-management/order-import/template',
    data: { dataSource },
    showErrorMessage: false
  })
}

// ──────────────────────────────────────────────────────────
// 绩效配置
// ──────────────────────────────────────────────────────────
import type {
  PerfConfigItem,
  PerfStep1Form,
  PerfStep2Form,
  SaveMode
} from '@/views/config-management/perf-config/types'

/** 绩效配置分页列表 */
export function fetchPerfTable(params: {
  page: number
  pageSize: number
  keyword?: string
  appPlatform?: string
  adPlatform?: string
  status?: string
}) {
  return request.post<Api.Common.PaginatedResponse<PerfConfigItem>>({
    url: '/api/config-management/perf-config/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新建绩效配置（支持草稿 / 直接发布） */
export function createPerfConfig(data: {
  step1: PerfStep1Form
  step2: PerfStep2Form
  saveMode: SaveMode
}) {
  return request.post<PerfConfigItem>({
    url: '/api/config-management/perf-config',
    data,
    showErrorMessage: false
  })
}

/** 编辑绩效配置（新建一个版本） */
export function updatePerfConfig(
  id: string,
  data: {
    step1?: Partial<PerfStep1Form>
    step2: PerfStep2Form
    saveMode: SaveMode
  }
) {
  return request.put<PerfConfigItem>({
    url: `/api/config-management/perf-config/${id}`,
    data,
    showErrorMessage: false
  })
}

/** 发布草稿版本 */
export function publishPerfConfig(id: string, version: number) {
  return request.post<PerfConfigItem>({
    url: `/api/config-management/perf-config/${id}/publish`,
    data: { version },
    showErrorMessage: false
  })
}

/** 归档指定版本 */
export function archivePerfConfig(id: string, version: number) {
  return request.post<PerfConfigItem>({
    url: `/api/config-management/perf-config/${id}/archive`,
    data: { version },
    showErrorMessage: false
  })
}

/** 激活指定版本 */
export function activatePerfConfig(id: string, version: number) {
  return request.post<PerfConfigItem>({
    url: `/api/config-management/perf-config/${id}/activate`,
    data: { version },
    showErrorMessage: false
  })
}

/** 导出绩效配置列表 */
export function exportPerfConfig(params: {
  keyword?: string
  appPlatform?: string
  adPlatform?: string
  status?: string
}) {
  return request.post<unknown>({
    url: '/api/config-management/perf-config/export',
    data: params,
    showErrorMessage: false
  })
}

// ──────────────────────────────────────────────────────────
// 应用分配（契约：`views/.../app-assignment/mock/backend-api`）
// ──────────────────────────────────────────────────────────
import type {
  AppAssignmentExportResponse,
  AppAssignmentItem,
  AppAssignmentMetaAssignableAppsResponse,
  AppAssignmentMetaFilterResponse,
  AppAssignmentMetaVersionsResponse,
  AppAssignmentOverviewResponse,
  AssignmentCreatePayload,
  AssignmentTableQuery,
  AssignmentUpdatePayload
} from '@/views/config-management/app-assignment/types'
import {
  AppAssignmentEndpoint,
  isAppAssignmentEndpointMock
} from '@/views/config-management/app-assignment/config/data-source'
import * as appAssignmentMock from '@/views/config-management/app-assignment/mock/app-assignment-api-mock'

/** 页头 KPI */
export function fetchAppAssignmentOverview() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Overview)) {
    return appAssignmentMock.mockFetchAppAssignmentOverview()
  }
  return request.post<AppAssignmentOverviewResponse>({
    url: '/api/config-management/app-assignment/overview',
    data: {},
    showErrorMessage: false
  })
}

/** 筛选栏下拉 */
export function fetchAppAssignmentMetaFilterOptions() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaFilterOptions)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaFilterOptions()
  }
  return request.post<AppAssignmentMetaFilterResponse>({
    url: '/api/config-management/app-assignment/meta-filter-options',
    data: {},
    showErrorMessage: false
  })
}

/** 新建可选应用 */
export function fetchAppAssignmentMetaAssignableApps() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaAssignableApps)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaAssignableApps()
  }
  return request.post<AppAssignmentMetaAssignableAppsResponse>({
    url: '/api/config-management/app-assignment/meta-assignable-apps',
    data: {},
    showErrorMessage: false
  })
}

/** 按应用拉取绩效版本 */
export function fetchAppAssignmentMetaPerformanceVersions(body: { appId: string }) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaPerformanceVersions)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaPerformanceVersions(body)
  }
  return request.post<AppAssignmentMetaVersionsResponse>({
    url: '/api/config-management/app-assignment/meta-performance-versions',
    data: body,
    showErrorMessage: false
  })
}

/** 分页列表 */
export function fetchAppAssignmentTable(params: AssignmentTableQuery) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Table)) {
    return appAssignmentMock.mockFetchAppAssignmentTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<AppAssignmentItem>>({
    url: '/api/config-management/app-assignment/table',
    data: params,
    showErrorMessage: false
  })
}

/** 单条详情 */
export function fetchAppAssignmentDetail(body: { id: string }) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Detail)) {
    return appAssignmentMock.mockFetchAppAssignmentDetail(body)
  }
  return request.post<AppAssignmentItem | null>({
    url: '/api/config-management/app-assignment/detail',
    data: body,
    showErrorMessage: false
  })
}

/** 新建分配 */
export function createAppAssignment(data: AssignmentCreatePayload) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Create)) {
    return appAssignmentMock.mockCreateAppAssignment(data)
  }
  return request.post<AppAssignmentItem>({
    url: '/api/config-management/app-assignment',
    data,
    showErrorMessage: false
  })
}

/** 更新分配 */
export function updateAppAssignment(data: AssignmentUpdatePayload) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Update)) {
    return appAssignmentMock.mockUpdateAppAssignment(data)
  }
  return request.post<AppAssignmentItem>({
    url: '/api/config-management/app-assignment/update',
    data,
    showErrorMessage: false
  })
}

/** 导出 */
export function exportAppAssignmentList(params: Partial<AssignmentTableQuery>) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Export)) {
    return appAssignmentMock.mockExportAppAssignmentList(params)
  }
  return request.post<AppAssignmentExportResponse>({
    url: '/api/config-management/app-assignment/export',
    data: params,
    showErrorMessage: false
  })
}
