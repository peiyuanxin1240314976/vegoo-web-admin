/**
 * 开户页面数据源开关（按接口粒度）。
 * true: 使用本页面 mock 实现
 * false: 调用远程接口
 */

import { AccountApiSource } from '@/views/config-management/account-management/config/data-source'

export enum OpenAccountEndpoint {
  Table = 'table',
  FilterOptions = 'filterOptions',
  Create = 'create',
  Assign = 'assign',
  Delete = 'delete',
  FeishuConfigFetch = 'feishuConfigFetch',
  FeishuConfigSave = 'feishuConfigSave',
  Export = 'export'
}

const OPEN_ACCOUNT_ENDPOINT_TO_SOURCE_KEY: Record<
  OpenAccountEndpoint,
  keyof typeof AccountApiSource
> = {
  [OpenAccountEndpoint.Table]: 'openAccountTable',
  [OpenAccountEndpoint.FilterOptions]: 'openAccountTable',
  [OpenAccountEndpoint.Create]: 'createOpenAccount',
  [OpenAccountEndpoint.Assign]: 'assignOpenAccountCredential',
  [OpenAccountEndpoint.Delete]: 'deleteOpenAccount',
  [OpenAccountEndpoint.FeishuConfigFetch]: 'fetchOpenAccountFeishuConfig',
  [OpenAccountEndpoint.FeishuConfigSave]: 'saveOpenAccountFeishuConfig',
  [OpenAccountEndpoint.Export]: 'exportOpenAccount'
}

export function isOpenAccountEndpointMock(endpoint: OpenAccountEndpoint): boolean {
  return AccountApiSource[OPEN_ACCOUNT_ENDPOINT_TO_SOURCE_KEY[endpoint]]
}

export function getOpenAccountEndpointMockMap() {
  return Object.fromEntries(
    Object.entries(OPEN_ACCOUNT_ENDPOINT_TO_SOURCE_KEY).map(([k, sourceKey]) => [
      k,
      AccountApiSource[sourceKey]
    ])
  ) as Record<OpenAccountEndpoint, boolean>
}
