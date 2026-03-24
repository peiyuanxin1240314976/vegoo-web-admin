/**
 * 国家管理 - 数据源开关
 * true: 使用 mock
 * false: 使用 remote
 */

type UseMock = boolean

export const CountryApiSource: Record<
  'countryTable' | 'createCountry' | 'updateCountry' | 'deleteCountry' | 'exportCountry' | 'importCountry',
  UseMock
> = {
  countryTable: true,
  createCountry: true,
  updateCountry: true,
  deleteCountry: true,
  exportCountry: true,
  importCountry: true
}
