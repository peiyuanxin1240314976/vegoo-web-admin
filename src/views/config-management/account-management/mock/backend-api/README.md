# account-management backend-api 契约索引

父级 API：`/api/config-management`

本目录按“一接口一文件”维护 `account-management` 契约 JSON，当前覆盖四个子域：

- 广告账户：`01~07`
- 代理商管理：`08~11`
- 凭据管理：`12~16`
- 开户管理：`17~20`
- 扩展接口：`21~27`

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
- `21-account-import.json`：广告账户批量导入（P1）
- `22-agency-export.json`：代理商导出（P1）
- `23-credential-export.json`：凭据导出（P1）
- `24-credential-validate-batch.json`：凭据批量验证（P1）
- `25-open-account-feishu-config-fetch.json`：开户飞书推送设置读取（P1）
- `26-open-account-feishu-config-save.json`：开户飞书推送设置保存（P1）
- `27-open-account-export.json`：开户记录导出（P1）

## 开关映射

开关文件：`../../config/data-source.ts`  
要求按接口粒度一一对应，便于单接口联调。
