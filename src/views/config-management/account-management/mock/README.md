# account-management mock 说明

本目录用于 `account-management` 页面在后端接口未就绪时的本地模拟数据联调。

- `data.ts`：广告账户、代理商、凭据、开户管理四个页签的 mock 数据与选项数据。
- `backend-api/`：接口契约示例文件，按接口一文件维护。
- 数据源开关位于 `../config/data-source.ts`，按接口粒度控制 `mock` / `remote`。

联调建议：

1. 先维护 `backend-api/*.json` 契约；
2. 再更新 `types.ts` 与 `src/api/config-management.ts`；
3. 最后按需切换 `data-source.ts` 中单接口开关。
