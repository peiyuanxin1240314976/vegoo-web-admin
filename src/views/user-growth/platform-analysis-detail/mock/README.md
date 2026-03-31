# 应用详情 — Mock 说明

本页由「综合分析」等入口钻取进入，类型见 `../types.ts`，请求封装见 `src/api/user-growth.ts` 中的 `fetchPlatformAnalysisDetailData`。

## 运行时本地 Mock

- `fetchPlatformAnalysisDetailData` 当前返回 **`mock/data.ts`** 中 `buildMockPlatformAnalysisDetailData({ name, from })`，不请求后端；接入真实接口时在 `src/api/user-growth.ts` 中改为 `request.post`。
- `name` 与路由 `query.name` 一致，用于展示应用名与轻微随机抖动。

契约详情见 `mock/backend-api/README.md`。
