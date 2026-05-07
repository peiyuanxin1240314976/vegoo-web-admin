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
  [AdAccountManagementEndpoint.Table]: false,
  // top overview stat cards
  [AdAccountManagementEndpoint.OverviewStats]: false,
  // AddAccountDialog save action
  [AdAccountManagementEndpoint.Create]: false,
  // AccountDetailDialog edit-save action
  [AdAccountManagementEndpoint.Update]: false,
  // row action: enable
  [AdAccountManagementEndpoint.Enable]: false,
  // row action: disable
  [AdAccountManagementEndpoint.Disable]: false,
  // row action: delete
  [AdAccountManagementEndpoint.Delete]: false,
  // page header export button
  [AdAccountManagementEndpoint.Export]: true
}

export function isAdAccountManagementEndpointMock(endpoint: AdAccountManagementEndpoint): boolean {
  return AdAccountManagementApiSource[endpoint]
}
