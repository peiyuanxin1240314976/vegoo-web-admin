/**
 * 整体回收 - 数据源开关（小模块内 config，与 `mock/backend-api` 契约 1:1）
 *
 * - `true` = 使用本地 Mock（`views/user-growth/overall-recovery/mock/overall-recovery-api-mock.ts`）
 * - `false` = 走真实 HTTP（`src/api/user-growth/overall-recovery.ts`）
 *
 * 顶栏筛选项 **不在此枚举**：复用公用 **`GET .../cockpit/meta-filter-options`**（见 `useOverallRecoveryFilters`）。
 *
 * **当前默认全部为 `true`（全 Mock）**：Tab1 拆分的 5 个接口尚未上线，先整体走本地 Mock；后端就绪后将对应项改为 `false`。
 *
 * Tab1：仅契约与前端拆成 5 段；Tab2 仍为单一 `organic-tab`，**未**再拆子接口。
 *
 * Tab1 五段若混用 Mock/远程会数据不一致，**建议 Tab1 五段同开或同关**。
 */
export enum OverallRecoveryEndpoint {
  /** Tab1 — 02-overall-tab-kpis.json */
  OverallTabKpis = 'overallTabKpis',
  /** Tab1 — 02-overall-tab-recovery-curve.json */
  OverallTabRecoveryCurve = 'overallTabRecoveryCurve',
  /** Tab1 — 02-overall-tab-daily-volume.json */
  OverallTabDailyVolume = 'overallTabDailyVolume',
  /** Tab1 — 02-overall-tab-roi-compare.json */
  OverallTabRoiCompare = 'overallTabRoiCompare',
  /** Tab1 — 02-overall-tab-detail-records.json */
  OverallTabDetailRecords = 'overallTabDetailRecords',
  /** Tab2 — 03-organic-tab.json */
  OrganicTab = 'organicTab'
}

export const OVERALL_RECOVERY_USE_MOCK: Record<OverallRecoveryEndpoint, boolean> = {
  [OverallRecoveryEndpoint.OverallTabKpis]: false,
  [OverallRecoveryEndpoint.OverallTabRecoveryCurve]: false,
  [OverallRecoveryEndpoint.OverallTabDailyVolume]: false,
  [OverallRecoveryEndpoint.OverallTabRoiCompare]: false,
  [OverallRecoveryEndpoint.OverallTabDetailRecords]: false,
  [OverallRecoveryEndpoint.OrganicTab]: false
}

export function isOverallRecoveryEndpointMock(endpoint: OverallRecoveryEndpoint): boolean {
  return OVERALL_RECOVERY_USE_MOCK[endpoint]
}
