/**
 * 国家管理（`/config-management/country-management`）数据源开关。
 *
 * - **`true`**：`config-management.ts` 国家方法走 `mock/country-api-mock.ts`。
 * - **`false`**：真实网关；`index.vue` 一律通过 `@/api/config-management` 调用即可。
 *
 * 契约目录：`../mock/backend-api/`。
 */

type UseMock = boolean

export enum CountryEndpoint {
  CountryTable = 'countryTable',
  Detail = 'countryDetail',
  MetaOptions = 'countryMetaOptions',
  OverviewKpi = 'countryOverviewKpi',
  RegionDistribution = 'countryRegionDistribution',
  MainMarketShare = 'countryMainMarketShare',
  CreateCountry = 'createCountry',
  UpdateCountry = 'updateCountry',
  DeleteCountry = 'deleteCountry',
  ExportCountry = 'exportCountry',
  ImportCountry = 'importCountry',
  FlagIconUpload = 'countryFlagIconUpload'
}

export const CountryApiSource: Record<CountryEndpoint, UseMock> = {
  [CountryEndpoint.CountryTable]: false,
  [CountryEndpoint.Detail]: false,
  [CountryEndpoint.MetaOptions]: false,
  [CountryEndpoint.OverviewKpi]: false,
  [CountryEndpoint.RegionDistribution]: false,
  [CountryEndpoint.MainMarketShare]: false,
  [CountryEndpoint.CreateCountry]: false,
  [CountryEndpoint.UpdateCountry]: false,
  [CountryEndpoint.DeleteCountry]: false,
  [CountryEndpoint.ExportCountry]: false,
  [CountryEndpoint.ImportCountry]: false,
  [CountryEndpoint.FlagIconUpload]: false
}

/** 读取方：`src/api/config-management.ts` 国家段 */
export function isCountryEndpointMock(endpoint: CountryEndpoint): boolean {
  return CountryApiSource[endpoint]
}
