/**
 * 优化师管理 · 按接口 Mock / 远程开关。
 *
 * - `true`：`src/api/config-management/optimizer-management.ts` 中对应 `fetchOptimizer*` /
 *   `createOptimizer` / `updateOptimizer` / `exportOptimizerList` 走 `mock/optimizer-api-mock.ts`
 * - `false`：走真实网关 POST URL（`update` 为 `POST .../optimizer/update`，非 PUT）
 *
 * 读取方：仅 `config-management.ts` 优化师段；页面 `index.vue` 无需 import 本文件。
 */

export enum OptimizerEndpoint {
  Table = 'table',
  Overview = 'overview',
  MetaSystemUsers = 'metaSystemUsers',
  Create = 'create',
  Update = 'update',
  Export = 'export'
}

type UseMock = boolean

const OptimizerApiMockDefaults: Record<OptimizerEndpoint, UseMock> = {
  [OptimizerEndpoint.Table]: false,
  [OptimizerEndpoint.Overview]: false,
  [OptimizerEndpoint.MetaSystemUsers]: false,
  [OptimizerEndpoint.Create]: false,
  [OptimizerEndpoint.Update]: false,
  [OptimizerEndpoint.Export]: false
}

export function isOptimizerEndpointMock(endpoint: OptimizerEndpoint): boolean {
  return OptimizerApiMockDefaults[endpoint]
}
