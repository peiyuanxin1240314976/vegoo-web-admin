/**
 * 账户管理（`/config-management/account-management`）按接口粒度的数据源开关。
 *
 * ## 语义（必读）
 *
 * - **`true`**：该接口优先走 **Tab 内本地 mock**（不发起 `fetch*` / `request`），用于无网关时的 UI 联调。
 * - **`false`**：应调用 `src/api/config-management.ts` 对应方法走真实网关；请求失败时部分 Tab 仍会 fallback 到本地数据。
 *
 * 本开关 **仅** 在 `views/.../account-management` 各 Tab / `index.vue` 中读取；**不在** `src/api` 内分支。
 *
 * Mock 参考：`../mock/`；契约：`../mock/backend-api/*.json`。
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
  // ── 广告账户 Tab ─────────────────────────────────────
  accountTable: true,
  createAccount: true,
  updateAccount: true,
  disableAccount: true,
  enableAccount: true,
  rechargeAccount: true,
  exportAccount: true,
  importAccount: true,
  // ── 代理商 Tab ───────────────────────────────────────
  agencyTable: true,
  createAgency: true,
  updateAgency: true,
  deleteAgency: true,
  exportAgency: true,
  // ── 凭据 Tab ─────────────────────────────────────────
  credentialTable: true,
  createCredential: true,
  updateCredential: true,
  validateCredential: true,
  deleteCredential: true,
  exportCredential: true,
  validateCredentialBatch: true,
  // ── 开户 Tab ─────────────────────────────────────────
  openAccountTable: true,
  createOpenAccount: true,
  assignOpenAccountCredential: true,
  deleteOpenAccount: true,
  exportOpenAccount: true,
  fetchOpenAccountFeishuConfig: true,
  saveOpenAccountFeishuConfig: true
}
