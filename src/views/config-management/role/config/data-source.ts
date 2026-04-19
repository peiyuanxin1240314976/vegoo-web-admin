/**
 * Role page data-source switches.
 *
 * Each fetch* endpoint has its own mock switch so the role page can move to
 * remote APIs incrementally without blocking the main page flow.
 */
export enum RoleEndpoint {
  LIST = 'list',
  DETAIL_SAVE = 'detailSave',
  PERMISSION_PAGES = 'permissionPages',
  PERMISSION_DATE = 'permissionDate',
  PERMISSION_SUMMARY = 'permissionSummary',
  USERS = 'users',
  PERMISSIONS_UPDATE = 'permissionsUpdate'
}

export const RoleMockConfig: Record<RoleEndpoint, boolean> = {
  [RoleEndpoint.LIST]: false,
  [RoleEndpoint.DETAIL_SAVE]: false,
  [RoleEndpoint.PERMISSION_PAGES]: false,
  [RoleEndpoint.PERMISSION_DATE]: false,
  [RoleEndpoint.PERMISSION_SUMMARY]: false,
  [RoleEndpoint.USERS]: false,
  [RoleEndpoint.PERMISSIONS_UPDATE]: false
}

export function isRoleEndpointMock(endpoint: RoleEndpoint): boolean {
  return RoleMockConfig[endpoint]
}
