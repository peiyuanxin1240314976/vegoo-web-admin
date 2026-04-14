/**
 * Ad account management (`/config-management/ad-account-management`) API source switches.
 *
 * This module currently has one business page, but all endpoint switches must still live in
 * one root-level config file so `src/api` can read a single source of truth.
 *
 * Rule:
 * - `true`: use local mock implementation under `../mock/`
 * - `false`: use real backend API under `src/api/config-management/ad-account-management.ts`
 *
 * Contracts:
 * - `../mock/backend-api/*.json`
 */

type UseMock = boolean

export enum AdAccountManagementEndpoint {
  Table = 'table',
  OverviewStats = 'overview-stats',
  Create = 'create',
  Update = 'update',
  Enable = 'enable',
  Disable = 'disable',
  Delete = 'delete',
  Export = 'export'
}

export const AdAccountManagementApiSource: Record<AdAccountManagementEndpoint, UseMock> = {
  // index.vue main table list
  [AdAccountManagementEndpoint.Table]: true,
  // top overview stat cards
  [AdAccountManagementEndpoint.OverviewStats]: true,
  // AddAccountDialog save action
  [AdAccountManagementEndpoint.Create]: true,
  // AccountDetailDialog edit-save action
  [AdAccountManagementEndpoint.Update]: true,
  // row action: enable
  [AdAccountManagementEndpoint.Enable]: true,
  // row action: disable
  [AdAccountManagementEndpoint.Disable]: true,
  // row action: delete
  [AdAccountManagementEndpoint.Delete]: true,
  // page header export button
  [AdAccountManagementEndpoint.Export]: true
}

export function isAdAccountManagementEndpointMock(endpoint: AdAccountManagementEndpoint): boolean {
  return AdAccountManagementApiSource[endpoint]
}
