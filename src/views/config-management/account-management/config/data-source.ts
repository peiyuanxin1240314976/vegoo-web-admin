/**
 * 账户管理 - 数据源开关
 * 每个接口独立控制是否使用 mock
 */

type UseMock = boolean

export const AccountApiSource: Record<
  | 'accountTable'
  | 'createAccount'
  | 'updateAccount'
  | 'disableAccount'
  | 'enableAccount'
  | 'rechargeAccount'
  | 'exportAccount'
  | 'importAccount'
  | 'agencyTable'
  | 'createAgency'
  | 'updateAgency'
  | 'deleteAgency'
  | 'exportAgency'
  | 'credentialTable'
  | 'createCredential'
  | 'updateCredential'
  | 'validateCredential'
  | 'deleteCredential'
  | 'exportCredential'
  | 'validateCredentialBatch'
  | 'openAccountTable'
  | 'createOpenAccount'
  | 'assignOpenAccountCredential'
  | 'deleteOpenAccount'
  | 'exportOpenAccount'
  | 'fetchOpenAccountFeishuConfig'
  | 'saveOpenAccountFeishuConfig',
  UseMock
> = {
  accountTable: true,
  createAccount: true,
  updateAccount: true,
  disableAccount: true,
  enableAccount: true,
  rechargeAccount: true,
  exportAccount: true,
  importAccount: true,
  agencyTable: true,
  createAgency: true,
  updateAgency: true,
  deleteAgency: true,
  exportAgency: true,
  credentialTable: true,
  createCredential: true,
  updateCredential: true,
  validateCredential: true,
  deleteCredential: true,
  exportCredential: true,
  validateCredentialBatch: true,
  openAccountTable: true,
  createOpenAccount: true,
  assignOpenAccountCredential: true,
  deleteOpenAccount: true,
  exportOpenAccount: true,
  fetchOpenAccountFeishuConfig: true,
  saveOpenAccountFeishuConfig: true
}
