# 侧边栏 `(M)` 菜单临时隐藏说明（完整清单）

## 目的

- 临时在侧边栏隐藏所有文案带 `(M)` 的菜单项。
- 不删除路由、不删除页面，仅通过路由 `meta.isHide` 控制显示。
- 后续可以按清单快速恢复。

## 统计结果（基于 `src/locales/langs/zh.json`）

- `(M)` 菜单总数：16 项
- 已隐藏：15 项
- 未隐藏/未定位到可改路由：1 项

## 已隐藏清单（15 项）

### 一级菜单（5 项，均已隐藏）

- i18n Key：`menus.monetization.title`｜中文：变现管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/monetization.ts`
- i18n Key：`menus.productOperations.title`｜中文：商品运营(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/product-operations.ts`
- i18n Key：`menus.productInsight.title`｜中文：产品洞察(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/product-insight.ts`
- i18n Key：`menus.accountManagement.title`｜中文：账户管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/account-management.ts`
- i18n Key：`menus.system.title`｜中文：系统管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/system.ts`

### 二级菜单（10 项，均已隐藏）

- i18n Key：`menus.businessInsight.adPlatformDetail`｜中文：广告平台详情(M)｜状态：已隐藏（原本已隐藏）｜路由文件：`src/router/modules/business-insight.ts`
- i18n Key：`menus.configManagement.appStoreManagement`｜中文：应用商店管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/config-management.ts`
- i18n Key：`menus.configManagement.countryManagement`｜中文：国家管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/config-management.ts`
- i18n Key：`menus.configManagement.exchangeRateManagement`｜中文：汇率管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/config-management.ts`
- i18n Key：`menus.configManagement.costCoefficient`｜中文：成本系数管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/config-management.ts`
- i18n Key：`menus.configManagement.orderImport`｜中文：导入商店订单(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/config-management.ts`
- i18n Key：`menus.configManagement.orderImportReport`｜中文：导入报告(M)｜状态：已隐藏（原本已隐藏）｜路由文件：`src/router/modules/config-management.ts`
- i18n Key：`menus.userGrowth.conversionManagement`｜中文：转化管理(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/user-growth.ts`
- i18n Key：`menus.userGrowth.performanceAnalysis`｜中文：人员成效(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/user-growth.ts`
- i18n Key：`menus.userGrowth.overallRecovery`｜中文：整体回收(M)｜状态：已隐藏（显式 `isHide: true`）｜路由文件：`src/router/modules/user-growth.ts`

## 未隐藏/未定位清单（1 项）

- i18n Key：`menus.configManagement.accountManagement`｜中文：账户管理(M)｜状态：未定位到可改路由（在当前 `src/router/modules/config-management.ts` 中没有对应二级路由项）

## 本次实际修改文件

- `src/router/modules/monetization.ts`
- `src/router/modules/product-operations.ts`
- `src/router/modules/product-insight.ts`
- `src/router/modules/account-management.ts`
- `src/router/modules/system.ts`
- `src/router/modules/config-management.ts`
- `src/router/modules/user-growth.ts`

## 恢复步骤（建议）

1. 在上面“本次实际修改文件”中搜索 `isHide: true`。
2. 仅删除与 `(M)` 菜单对应路由的 `isHide: true`（或改为 `false`）。
3. 保存并刷新前端页面（必要时重启 `pnpm dev`）。

## 补充说明

- 本次是“前端侧边栏可见性控制”，不涉及后端权限、接口和数据。
- 即使侧边栏隐藏，页面路由本身仍存在（除非同时做权限/守卫限制）。
