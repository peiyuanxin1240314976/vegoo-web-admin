# 预警管理 — Mock 说明

- 类型见 [`../types.ts`](../types.ts)，聚合数据见 [`data.ts`](./data.ts)。
- `src/api/user-growth.ts` 中 `fetchAlertManagementOverview(params)` 当前走 `buildMockAlertManagementOverview(params)`；接入后端 `POST /api/user-growth/alert-management/overview` 时对 `params` 调 `request.post` 即可。

契约说明见 [`backend-api/README.md`](./backend-api/README.md)。
