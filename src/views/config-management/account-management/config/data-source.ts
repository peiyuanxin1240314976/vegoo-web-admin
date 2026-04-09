/**
 * 账户管理（`/config-management/account-management`）按接口粒度的数据源开关。
 *
 * ## 语义（必读）
 *
 * - **`true`**：该接口优先走 **Tab 内本地 mock**（不发起 `fetch*` / `request`），用于无网关时的 UI 联调。
 * - **`false`**：应调用 `src/api/config-management/account-management.ts` 中对应 `fetch*` / `create*` 等方法走真实网关；请求失败时部分 Tab 仍会 fallback 到本地数据。
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
  | 'saveOpenAccountFeishuConfig'
  | 'bcTable'
  | 'createBc'
  | 'updateBc'
  | 'deleteBc'
  | 'exportBc',
  UseMock
> = {
  // ── 广告账户 Tab ─────────────────────────────────────
  accountTable: false,
  createAccount: false,
  updateAccount: false,
  disableAccount: false,
  enableAccount: false,
  rechargeAccount: false,
  exportAccount: false,
  importAccount: false,
  // ── 代理商 Tab ───────────────────────────────────────
  agencyTable: false,
  createAgency: false,
  updateAgency: false,
  deleteAgency: false,
  exportAgency: false,
  // ── 凭据 Tab ─────────────────────────────────────────
  credentialTable: false,
  createCredential: false,
  updateCredential: false,
  validateCredential: false,
  deleteCredential: false,
  exportCredential: false,
  validateCredentialBatch: false,
  // ── 开户 Tab ─────────────────────────────────────────
  openAccountTable: false,
  createOpenAccount: false,
  assignOpenAccountCredential: false,
  deleteOpenAccount: false,
  exportOpenAccount: false,
  fetchOpenAccountFeishuConfig: false,
  saveOpenAccountFeishuConfig: false,
  // ── BC/BM（路由 `/account-management/bc-management`）────────────────
  bcTable: false,
  createBc: false,
  updateBc: false,
  deleteBc: false,
  exportBc: false
}
