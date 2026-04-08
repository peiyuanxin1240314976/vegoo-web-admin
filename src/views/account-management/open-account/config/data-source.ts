/**
 * 开户页面数据源开关（按接口粒度）。
 * true: 使用本页面 mock 实现
 * false: 调用远程接口
 */

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

const OPEN_ACCOUNT_ENDPOINT_MOCK_MAP: Record<OpenAccountEndpoint, boolean> = {
  [OpenAccountEndpoint.Table]: true,
  [OpenAccountEndpoint.FilterOptions]: true,
  [OpenAccountEndpoint.Create]: true,
  [OpenAccountEndpoint.Assign]: true,
  [OpenAccountEndpoint.Delete]: true,
  [OpenAccountEndpoint.FeishuConfigFetch]: true,
  [OpenAccountEndpoint.FeishuConfigSave]: true,
  [OpenAccountEndpoint.Export]: true
}

export function isOpenAccountEndpointMock(endpoint: OpenAccountEndpoint): boolean {
  return OPEN_ACCOUNT_ENDPOINT_MOCK_MAP[endpoint]
}

export function getOpenAccountEndpointMockMap() {
  return { ...OPEN_ACCOUNT_ENDPOINT_MOCK_MAP }
}
