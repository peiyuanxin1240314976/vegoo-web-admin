# 综合分析 — Mock 说明

## 运行时本地 Mock

- `src/api/user-growth.ts` 中 `fetchComprehensiveAnalysisFilterOptions`、`fetchComprehensiveAnalysisData` 当前使用 **`data.ts`**，不请求后端；接入真实接口时在 API 层改为 `request.post`。
- `buildMockComprehensiveAnalysisData(apiParams)`：随筛选（应用 / 广告平台 / 国家 / 日期）变化 KPI、柱图、地图、趋势等。
- `buildMockSectionAppData(apiParams)`：看板视图 `SectionApp` 用，随筛选变化。

## 接口契约（backend-api）

`mock/backend-api/` 用于 **接口契约与联调说明**，页面类型定义见 `../types.ts`。

- **筛选「全部」**：请求体中对应字段为空字符串 `''`（由 `utils/buildApiParams.ts` 从 UI 的 `all` 转换）。
- **viewMode**（数据 / 看板 / 图表 / 报表）仅前端状态，**不参与请求**。
- 网关统一包裹时，业务数据置于响应 `data` 内（与项目 `request` 解包一致）。
