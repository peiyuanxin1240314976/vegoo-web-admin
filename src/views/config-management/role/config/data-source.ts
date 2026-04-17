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
  [RoleEndpoint.LIST]: true,
  [RoleEndpoint.DETAIL_SAVE]: true,
  [RoleEndpoint.PERMISSION_PAGES]: true,
  [RoleEndpoint.PERMISSION_DATE]: true,
  [RoleEndpoint.PERMISSION_SUMMARY]: true,
  [RoleEndpoint.USERS]: true,
  [RoleEndpoint.PERMISSIONS_UPDATE]: true
}

export function isRoleEndpointMock(endpoint: RoleEndpoint): boolean {
  return RoleMockConfig[endpoint]
}
