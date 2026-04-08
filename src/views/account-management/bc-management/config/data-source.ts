/**
 * BC 管理页面数据源开关（按接口粒度）。
 * true: 使用页面本地 mock
 * false: 调用真实接口
 */

export enum BcManagementEndpoint {
  Table = 'table',
  FilterOptions = 'filterOptions',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Export = 'export'
}

const BC_MANAGEMENT_ENDPOINT_MOCK_MAP: Record<BcManagementEndpoint, boolean> = {
  [BcManagementEndpoint.Table]: true,
  [BcManagementEndpoint.FilterOptions]: true,
  [BcManagementEndpoint.Create]: true,
  [BcManagementEndpoint.Update]: true,
  [BcManagementEndpoint.Delete]: true,
  [BcManagementEndpoint.Export]: true
}

export function isBcManagementEndpointMock(endpoint: BcManagementEndpoint): boolean {
  return BC_MANAGEMENT_ENDPOINT_MOCK_MAP[endpoint]
}

export function getBcManagementEndpointMockMap() {
  return { ...BC_MANAGEMENT_ENDPOINT_MOCK_MAP }
}
