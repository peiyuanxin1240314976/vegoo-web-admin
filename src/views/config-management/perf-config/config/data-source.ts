/**
 * 绩效配置（/config-management/perf-config）数据源开关。
 *
 * - `true`：该能力优先走页面内 mock / 本地逻辑，**不**发起对应 `request`（与账户模块 `AccountApiSource` 语义一致）。
 * - `false`：调用 `src/api/config-management.ts` 中真实封装（联调以网关为准）。
 *
 * Mock 数据可参考 `../mock/`；`index.vue` 与各接口方法名见 README 场景表。
 */

type UseMock = boolean

export enum PerfConfigEndpoint {
  Table = 'perfTable',
  OverviewKpi = 'perfOverviewKpi',
  Create = 'perfCreate',
  Activate = 'perfActivate',
  Export = 'perfExport',
  ExportVersionCompare = 'perfExportVersionCompare'
}

export const PerfConfigApiSource: Record<PerfConfigEndpoint, UseMock> = {
  [PerfConfigEndpoint.Table]: false,
  [PerfConfigEndpoint.OverviewKpi]: false,
  [PerfConfigEndpoint.Create]: false,
  [PerfConfigEndpoint.Activate]: false,
  [PerfConfigEndpoint.Export]: false,
  [PerfConfigEndpoint.ExportVersionCompare]: false
}
