# 优化师管理 · Mock 说明

- `data.ts`：本地演示种子 `systemUsers`、`cloneOptimizerMockList()`（页面失败回退时仍可用）。
- `optimizer-api-mock.ts`：与 `backend-api` 对齐的可变 Mock；由 `../config/data-source.ts`（`OptimizerEndpoint`）在 `src/api/config-management.ts` 中切换。
- `backend-api/`：接口契约与场景说明（见 `backend-api/README.md`）。

页面类型见 `../types.ts`。默认开关下首屏即走 Mock 成功路径；若需直连网关，将 `config/data-source.ts` 对应项改为 `false`。
