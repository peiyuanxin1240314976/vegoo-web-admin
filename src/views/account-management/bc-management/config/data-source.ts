/**
 * BC 管理页面数据源开关（按接口粒度）。
 * true: 使用页面本地 mock
 * false: 调用真实接口
 */

import { AccountApiSource } from '@/views/config-management/account-management/config/data-source'

export enum BcManagementEndpoint {
  Table = 'table',
  FilterOptions = 'filterOptions',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Export = 'export'
}

const BC_MANAGEMENT_ENDPOINT_TO_SOURCE_KEY: Record<
  BcManagementEndpoint,
  keyof typeof AccountApiSource
> = {
  [BcManagementEndpoint.Table]: 'bcTable',
  [BcManagementEndpoint.FilterOptions]: 'bcTable',
  [BcManagementEndpoint.Create]: 'createBc',
  [BcManagementEndpoint.Update]: 'updateBc',
  [BcManagementEndpoint.Delete]: 'deleteBc',
  [BcManagementEndpoint.Export]: 'exportBc'
}

export function isBcManagementEndpointMock(endpoint: BcManagementEndpoint): boolean {
  return AccountApiSource[BC_MANAGEMENT_ENDPOINT_TO_SOURCE_KEY[endpoint]]
}

export function getBcManagementEndpointMockMap() {
  return Object.fromEntries(
    Object.entries(BC_MANAGEMENT_ENDPOINT_TO_SOURCE_KEY).map(([k, sourceKey]) => [
      k,
      AccountApiSource[sourceKey]
    ])
  ) as Record<BcManagementEndpoint, boolean>
}
