# 广告平台详情 — Mock 说明

本目录为 **`/business-insight/ad-platform-detail`** 页的接口契约（`backend-api/*.json`）与后续 MSW / 联调示例的归属地。

- **类型与页面**：契约字段与 `index.vue` 中 KPI、趋势图、应用维度表、AI 洞察等模块对齐；接远程前可在页面 `config/data-source.ts`（待建）按接口粒度切换 mock/remote（见 `module-api-mock-config.mdc`）。
- **公用顶栏筛选项**：应用 / 国家等与驾驶舱同构的下拉 **不** 在本目录建 `meta-filter-options` JSON，统一使用 **`GET`** `.../analysis/cockpit/meta-filter-options`（`useCockpitMetaFilterStore().data`）；说明见 `backend-api/README.md`。
- **应用内广告平台表现子页**（`/ad-platform-detail/app-ad-platform-performance`）契约见同级目录 **`../app-ad-platform-performance/mock/backend-api/`**（筛选仅为日期 + 国家；`appId` 来自路由）。
