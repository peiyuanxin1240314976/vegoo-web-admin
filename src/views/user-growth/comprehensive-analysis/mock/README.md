# 综合分析 — Mock 说明

本目录与 `mock/backend-api/` 用于 **接口契约与联调说明**，页面类型定义见 `../types.ts`，真实请求封装见 `src/api/user-growth.ts`（`fetchComprehensiveAnalysisFilterOptions`、`fetchComprehensiveAnalysisData`）。

- **筛选「全部」**：请求体中对应字段为空字符串 `''`（由 `utils/buildApiParams.ts` 从 UI 的 `all` 转换）。
- **viewMode**（数据 / 看板 / 图表 / 报表）仅前端状态，**不参与请求**。
- 网关统一包裹时，业务数据置于响应 `data` 内（与项目 `request` 解包一致）。
