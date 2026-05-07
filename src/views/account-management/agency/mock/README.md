# agency mock 说明

当前页面：`/account-management/agency`，入口文件：`index.vue`。

本目录用于沉淀代理商页面的接口契约与联调示例，契约文件位于 `backend-api/`。

- API 实现：`src/api/config-management/account-management.ts`
- 数据源开关：`src/views/config-management/account-management/config/data-source.ts`
- 复用组件：`src/views/config-management/account-management/modules/agency-*.vue`

说明：

- 页面“广告平台”下拉与 cockpit 同构，复用 `useCockpitMetaFilterStore().data.sourceOptions`，不重复维护独立 `meta-filter-options` JSON。
- 页面独有筛选（合作模式、状态）在本目录以独立契约维护。
