# account-management backend-api 契约索引

父级 API：`/api/config-management`

本目录按“一接口一文件”维护 `account-management` 契约 JSON，当前覆盖五个子域：

- 广告账户：`01~07`
- 代理商管理：`08~11`
- 凭据管理：`12~16`
- 开户管理：`17~20`
- 扩展接口：`21~27`
- **BC/BM 管理**：`28~32`（路由 `/account-management/bc-management`）

## 接口清单（含紧急程度）

- `01-account-table.json`：广告账户列表（P0）
- `02-account-create.json`：新建广告账户（P0）
- `03-account-update.json`：编辑广告账户（P0）
- `04-account-recharge.json`：账户充值（P0）
- `05-account-disable.json`：账户停用（P0）
- `06-account-enable.json`：账户启用（P0）
- `07-account-export.json`：广告账户导出（P1）
- `08-agency-table.json`：代理商列表（P0）
- `09-agency-create.json`：新增代理商（P0）
- `10-agency-update.json`：编辑代理商（P0）
- `11-agency-delete.json`：删除代理商（P0）
- `12-credential-table.json`：凭据列表（P0）
- `13-credential-create.json`：新建凭据（P0）
- `14-credential-validate.json`：凭据验证（P0）
- `15-credential-update.json`：编辑凭据（P0）
- `16-credential-delete.json`：删除凭据（P0）
- `17-open-account-table.json`：开户记录列表（P0）
- `18-open-account-create.json`：新建开户记录（P0）
- `19-open-account-assign.json`：分配凭据并激活（P0）
- `20-open-account-delete.json`：删除开户记录（P0）
- `21-open-account-overview-stats.json`：开户统计卡片（P0）
- `21-account-import.json`：广告账户批量导入（P1）
- `22-agency-export.json`：代理商导出（P1）
- `23-credential-export.json`：凭据导出（P1）
- `24-credential-validate-batch.json`：凭据批量验证（P1）
- `25-open-account-feishu-config-fetch.json`：开户飞书推送设置读取（P1）
- `26-open-account-feishu-config-save.json`：开户飞书推送设置保存（P1）
- `27-open-account-export.json`：开户记录导出（P1）
- `28-bc-table.json`：BC/BM 分页列表（P0）
- `29-bc-create.json`：新建 BC（P0）
- `30-bc-update.json`：编辑 BC（P0）
- `31-bc-delete.json`：删除 BC（P0）
- `32-bc-export.json`：BC 列表导出（P1）

## 场景 → 接口（路由：`/config-management/account-management`）

| 场景 | 触发时机 | 契约 JSON | `src/api` 方法 |
| --- | --- | --- | --- |
| 广告账户列表首屏 | 切换「广告账户」Tab | `01-account-table.json` | `fetchAccountTable` |
| 新建/编辑广告账户 | 表单提交 | `02` / `03` | `createAccount` / `updateAccount` |
| 充值 / 停用 / 启用 | 行操作、弹窗确认 | `04` ~ `06` | `rechargeAccount` / `disableAccount` / `enableAccount` |
| 导入 / 导出账户 | 页头按钮 | `07` / `21` | `exportAccountList` / `importAccountList` |
| 代理商列表与 CRUD | 「代理商管理」Tab | `08` ~ `11` | `fetchAgencyTable` / `createAgency` / `updateAgency` / `deleteAgency` |
| 代理商导出 | Tab 内导出 | `22` | `exportAgencyList` |
| 凭据列表与 CRUD、验证 | 「凭据管理」Tab | `12` ~ `16` | `fetchCredentialTable` / `createCredential` / … / `deleteCredential` |
| 凭据导出 / 批量验证 | Tab 内按钮 | `23` / `24` | `exportCredentialList` / `validateCredentialBatch` |
| 开户列表与 CRUD | 「开户管理」Tab | `17` ~ `20` | `fetchOpenAccountTable` / `createOpenAccount` / `assignOpenAccountCredential` / `deleteOpenAccount` |
| 开户统计卡片 | 「开户管理」Tab | `21-open-account-overview-stats.json` | `fetchOpenAccountOverviewStats` |
| 飞书推送设置 | 开户 Tab 设置入口 | `25` / `26` | `fetchOpenAccountFeishuConfig` / `saveOpenAccountFeishuConfig` |
| 开户记录导出 | 开户 Tab 导出 | `27` | `exportOpenAccountList` |

## 场景 → 接口（路由：`/account-management/bc-management`）

| 场景 | 触发时机 | 契约 JSON | `src/api` 方法 |
| --- | --- | --- | --- |
| BC 列表首屏 | `bc-tab` 挂载 / 刷新 | `28-bc-table.json` | `fetchBcTable` |
| 新建/编辑 BC | 表单提交（父页 `handleFormSuccess`） | `29` / `30` | `createBc` / `updateBc` |
| 删除 BC | 删除确认 | `31` | `deleteBc` |
| 导出 | 页头导出 | `32` | `exportBcList` |

各 JSON 根级 `interaction` 与上表一致；联调以 **`src/api/config-management/account-management.ts` 实际 URL、方法** 为准。

## 开关与 Mock 语义

开关文件：`../../config/data-source.ts`。

- **`true`**：优先使用 **页面内本地 mock**（各 Tab 内 `clone*Mock` 等），**不**调用网关；与常见「isMock」命名相反，修改前务必读文件头注释。
- **`false`**：调用 `request` 走真实接口；失败时可仍有本地兜底（见各 Tab 实现）。

`src/api` **不**根据本开关分支；与 `optimizer-management` / `app-assignment` 模式不同。

## 网关包裹

若网关统一返回 `{ code, message, data }`，`sampleResponse` 中的业务体位于 `data`（部分文件已示例）；以前端 `http` 解包后的类型为准。

## 开关映射

要求 `AccountApiSource` 按键与契约 / `fetch*` 一一对应，便于单接口联调。
