# 配置管理（config-management）

路由与页面入口见 `src/router` 与各子目录 `index.vue`。

## Mock 与 API 数据源约定

全项目通用说明见 `.cursor/rules/project-conventions.mdc` 中 **「Mock 与数据源开关」** 及 **「配置管理 Mock 分层」**。

### 本目录下的分层原则

1. **已统一走 `src/api/config-management.ts` 的子模块**（子目录内 `config/data-source.ts` + `mock/*-api-mock.ts`，页面仅 `@/api/config-management`）

   - 国家管理 `country-management`
   - 成本系数 `cost-coefficient`
   - 汇率管理 `exchange-rate-management`

2. **其余子模块**（订单导入、绩效配置、账户管理、应用管理 等）
   - **不强制**与上列子模块同一套「API 层 Mock + 按端点开关」形态。
   - **允许**保留页面内本地 mock、静态或较重的本地数据；后续接网关时再按需补契约、`fetch*` 与子模块 `config`。
   - 本条为**团队约定下的非硬性要求**，避免误以为必须全部重写。
