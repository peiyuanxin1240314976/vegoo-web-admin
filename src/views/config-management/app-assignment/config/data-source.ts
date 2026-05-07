/**
 * 应用分配页 · 按接口 Mock / 远程开关。
 *
 * - `true`：对应 `fetch*` 使用 `mock/app-assignment-api-mock.ts`
 * - `false`：走 `src/api/config-management.ts` 中 `request.post` 真实 URL
 *
 * 读取方：`config-management.ts` 内 `fetchAppAssignment*`、`createAppAssignment`、
 * `updateAppAssignment`、`exportAppAssignmentList` 通过 `isAppAssignmentEndpointMock` 分支。
 */

export enum AppAssignmentEndpoint {
  Overview = 'overview',
  MetaFilterOptions = 'metaFilterOptions',
  MetaAssignableApps = 'metaAssignableApps',
  MetaPerformanceVersions = 'metaPerformanceVersions',
  Table = 'table',
  Detail = 'detail',
  Create = 'create',
  Update = 'update',
  Export = 'export'
}

type UseMock = boolean

/** 列表页 / 弹窗 / 抽屉涉及的接口与契约 JSON 一一对应 */
const AppAssignmentApiMockDefaults: Record<AppAssignmentEndpoint, UseMock> = {
  [AppAssignmentEndpoint.Overview]: false,
  [AppAssignmentEndpoint.MetaFilterOptions]: false,
  [AppAssignmentEndpoint.MetaAssignableApps]: false,
  [AppAssignmentEndpoint.MetaPerformanceVersions]: false,
  [AppAssignmentEndpoint.Table]: false,
  [AppAssignmentEndpoint.Detail]: false,
  [AppAssignmentEndpoint.Create]: false,
  [AppAssignmentEndpoint.Update]: false,
  [AppAssignmentEndpoint.Export]: false
}

export function isAppAssignmentEndpointMock(endpoint: AppAssignmentEndpoint): boolean {
  return AppAssignmentApiMockDefaults[endpoint]
}
