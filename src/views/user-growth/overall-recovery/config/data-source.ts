/**
 * 整体回收 - 数据源开关（小模块内 config，与 `mock/backend-api` 契约 1:1）
 *
 * - `true` = 使用本地 Mock（`views/user-growth/overall-recovery/mock/overall-recovery-api-mock.ts`）
 * - `false` = 走真实 HTTP（`src/api/user-growth/overall-recovery.ts`）
 *
 * 顶栏筛选项 **不在此枚举**：复用公用 **`GET .../cockpit/meta-filter-options`**（见 `useOverallRecoveryFilters`）。
 *
 * 默认全部为 `false`，统一走线上 HTTP；本地调试可将对应项改为 `true`。
 */
export enum OverallRecoveryEndpoint {
  /** 02-overall-tab */
  OverallTab = 'overallTab',
  /** 03-organic-tab */
  OrganicTab = 'organicTab'
}

export const OVERALL_RECOVERY_USE_MOCK: Record<OverallRecoveryEndpoint, boolean> = {
  [OverallRecoveryEndpoint.OverallTab]: false,
  [OverallRecoveryEndpoint.OrganicTab]: false
}

export function isOverallRecoveryEndpointMock(endpoint: OverallRecoveryEndpoint): boolean {
  return OVERALL_RECOVERY_USE_MOCK[endpoint]
}
