# 应用内广告平台表现 — Mock 说明

本目录为路由 **`/business-insight/ad-platform-detail/app-ad-platform-performance`** 对应页的接口契约（`backend-api/*.json`）。

- **筛选**：页面仅 **日期范围**、**国家**；**应用**由父页跳转时的路由 **`query.app`** 固定，**不作为筛选项**，请求体中的 **`appId`** 由前端从该 query 解析（展示名或自有 ID，以联调为准）。
- **广告平台**：路由 **`query.source`** / **`sourceLabel`** 传入上下文，请求体带 **`source`**（可选，与父页一致）。
- **公用 meta**：国家下拉与驾驶舱同构时读 **`useCockpitMetaFilterStore()`**，不重复建 `meta-filter-options` JSON；说明见 `../mock/backend-api/README.md`。
