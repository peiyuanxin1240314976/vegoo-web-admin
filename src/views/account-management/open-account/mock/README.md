# 开户页面 Mock 说明

本目录为路由 `src/views/account-management/open-account/index.vue` 提供独立 Mock 资产，便于后续将页面从配置管理模块平滑迁移到本页面自身契约。

## 目录

- `backend-api/`：接口契约（`fieldDescription`、`sampleRequest`、`sampleResponse`、`interaction`）。
- `data.ts`：页面级本地 mock 数据（完整字段示例，可直接用于组件联调）。

## 数据源约定

- 顶栏「应用 / 广告平台」选项为公用 cockpit 能力，页面应读取 `useCockpitMetaFilterStore().data`。
- 本目录 **不新增** `meta-filter-options` 契约 JSON；相关说明见 `backend-api/README.md`。

## 字段规范

- JSON 业务字段统一 camelCase。
- 筛选入参使用 `source`、`app`、`status`、`agency` 等页面实际存在字段；不额外堆砌无 UI 维度。
