/**
 * 成本系数管理（`/config-management/cost-coefficient`）数据源开关。
 *
 * - **`true`**：`config-management.ts` 走 `mock/cost-coefficient-api-mock.ts`。
 * - **`false`**：真实网关。页面一律 `@/api/config-management`。
 */

type UseMock = boolean

export enum CostCoefficientEndpoint {
  CoefficientTable = 'coefficientTable',
  CreateCoefficient = 'createCoefficient',
  UpdateCoefficient = 'updateCoefficient',
  DeleteCoefficient = 'deleteCoefficient',
  CoefficientHistory = 'coefficientHistory'
}

export const CostCoefficientApiSource: Record<CostCoefficientEndpoint, UseMock> = {
  [CostCoefficientEndpoint.CoefficientTable]: true,
  [CostCoefficientEndpoint.CreateCoefficient]: true,
  [CostCoefficientEndpoint.UpdateCoefficient]: true,
  [CostCoefficientEndpoint.DeleteCoefficient]: true,
  [CostCoefficientEndpoint.CoefficientHistory]: true
}

/** 读取方：`src/api/config-management.ts` 成本系数段 */
export function isCostCoefficientEndpointMock(endpoint: CostCoefficientEndpoint): boolean {
  return CostCoefficientApiSource[endpoint]
}
