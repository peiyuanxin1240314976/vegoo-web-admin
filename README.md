# web-vegoo-admin

## 环境要求

- Node.js >= 20.19.0
- pnpm >= 8.8.0

## 安装依赖

```bash
pnpm install
```

## 开发

```bash
pnpm dev
```

## 打包

```bash
pnpm build
```

执行 `vue-tsc --noEmit` 进行类型检查，通过后使用 Vite 构建生产版本，产物输出到 `dist` 目录。

## 预览打包结果

```bash
pnpm serve
```

在本地启动静态服务预览打包后的站点。

## 接口与联调约定

业务页面在 `src/views/<模块>/<页面>/mock/backend-api/` 下用 JSON 描述接口契约（含字段说明与示例请求/响应）。**契约由前端在仓库内维护，后端按该 JSON 实现**；路径拆分、字段模板、变更流程等见 Cursor 规则 [`.cursor/rules/api-contract-and-mock-conventions.mdc`](.cursor/rules/api-contract-and-mock-conventions.mdc)。

使用 Mock 开发时，须在 **`src/api`** 按契约写好真实 **`fetch*`**，并在**该业务模块目录下**的 **`config/`** 中为每个接口配置 mock/remote 开关（禁止把仅本模块用的开关散落在无归属位置）。详见 [`.cursor/rules/module-api-mock-config.mdc`](.cursor/rules/module-api-mock-config.mdc)。

**默认值**：各业务 mock/remote 的默认取值写在**该小模块**的 **`config/`** 内（常量或导出配置），**不要**在仓库根目录的 **`.env` / `.env.development`** 里为单个业务模块增加 `VITE_*` 数据源类开关，以免环境文件与模块归属脱节；开发机临时切换可在该模块 `config` 内扩展 **localStorage** 等（商业洞察示例：`iap-analysis/config/data-source.ts`、`iaa-analysis/config/data-source.ts`）。
