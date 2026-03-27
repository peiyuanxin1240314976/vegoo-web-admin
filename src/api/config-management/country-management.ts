/**
 * 配置管理 · 国家管理 API（与 `views/config-management/country-management` 对齐）
 */
import request from '@/utils/http'
import type {
  CountryItem,
  CountryFormModel,
  CountryTableQuery
} from '@/views/config-management/country-management/types'
import {
  CountryEndpoint,
  isCountryEndpointMock
} from '@/views/config-management/country-management/config/data-source'
import * as countryMock from '@/views/config-management/country-management/mock/country-api-mock'

/** 国家分页列表 */
export function fetchCountryTable(params: CountryTableQuery) {
  if (isCountryEndpointMock(CountryEndpoint.CountryTable)) {
    return countryMock.mockFetchCountryTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<CountryItem>>({
    url: '/api/config-management/country/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新增国家 */
export function createCountry(data: CountryFormModel) {
  if (isCountryEndpointMock(CountryEndpoint.CreateCountry)) {
    return countryMock.mockCreateCountry(data)
  }
  return request.post<CountryItem>({
    url: '/api/config-management/country',
    data,
    showErrorMessage: false
  })
}

/** 更新国家 */
export function updateCountry(code: string, data: Partial<CountryFormModel>) {
  if (isCountryEndpointMock(CountryEndpoint.UpdateCountry)) {
    return countryMock.mockUpdateCountry(code, data)
  }
  return request.put<CountryItem>({
    url: `/api/config-management/country/${code}`,
    data,
    showErrorMessage: false
  })
}

/** 删除国家 */
export function deleteCountry(code: string) {
  if (isCountryEndpointMock(CountryEndpoint.DeleteCountry)) {
    return countryMock.mockDeleteCountry(code)
  }
  return request.del<unknown>({
    url: `/api/config-management/country/${code}`,
    showErrorMessage: false
  })
}

/** 导出国家列表 */
export function exportCountryList(params: Partial<CountryTableQuery>) {
  if (isCountryEndpointMock(CountryEndpoint.ExportCountry)) {
    return countryMock.mockExportCountryList(params)
  }
  return request.post<unknown>({
    url: '/api/config-management/country/export',
    data: params,
    showErrorMessage: false
  })
}

/** 批量导入国家 */
export function importCountryList(data: { items: CountryFormModel[] }) {
  if (isCountryEndpointMock(CountryEndpoint.ImportCountry)) {
    return countryMock.mockImportCountryList(data)
  }
  return request.post<unknown>({
    url: '/api/config-management/country/import',
    data,
    showErrorMessage: false
  })
}
