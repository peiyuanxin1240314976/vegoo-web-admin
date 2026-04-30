/**
 * 配置管理 · 国家管理 API（与 `views/config-management/country-management` 对齐）
 */
import request from '@/utils/http'
import type {
  CountryItem,
  CountryFormModel,
  CountryMainMarketShareItem,
  CountryMetaOptionsResponse,
  CountryOverviewKpi,
  CountryRegionDistributionItem,
  CountryTableQuery
} from '@/views/config-management/country-management/types'
import {
  CountryEndpoint,
  isCountryEndpointMock
} from '@/views/config-management/country-management/config/data-source'
import * as countryMock from '@/views/config-management/country-management/mock/country-api-mock'

/** 兼容后端 `{ items: T[] }` 与直连数组两种业务体 */
function unwrapItemsList<T>(data: T[] | { items?: T[] } | undefined): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items
  return []
}

/** 国家分页列表 */
export function fetchCountryTable(params: CountryTableQuery) {
  if (isCountryEndpointMock(CountryEndpoint.CountryTable)) {
    return countryMock.mockFetchCountryTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<CountryItem>>({
    url: '/api/v1/datacenter/analysis/config-management/country/table',
    data: params,
    showErrorMessage: false
  })
}

/** 国家详情 */
export function fetchCountryDetail(params: { code: string }) {
  if (isCountryEndpointMock(CountryEndpoint.Detail)) {
    return countryMock.mockFetchCountryDetail(params)
  }
  return request.post<CountryItem>({
    url: '/api/v1/datacenter/analysis/config-management/country/detail',
    data: params,
    showErrorMessage: false
  })
}

/** 国家模块筛选/表单元数据（时区、地区、货币） */
export function fetchCountryMetaOptions() {
  if (isCountryEndpointMock(CountryEndpoint.MetaOptions)) {
    return countryMock.mockFetchCountryMetaOptions()
  }
  return request.post<CountryMetaOptionsResponse>({
    url: '/api/v1/datacenter/analysis/config-management/country/meta-options',
    data: {},
    showErrorMessage: false
  })
}

/** 国家 KPI：与列表同筛选、全量聚合（非当前页） */
export function fetchCountryOverviewKpi(params: {
  keyword?: string
  region?: string
  currency?: string
}) {
  if (isCountryEndpointMock(CountryEndpoint.OverviewKpi)) {
    return countryMock.mockFetchCountryOverviewKpi(params)
  }
  return request.post<CountryOverviewKpi>({
    url: '/api/v1/datacenter/analysis/config-management/country/overview/kpi',
    data: params,
    showErrorMessage: false
  })
}

/** 地区分布图表：与列表同筛选、全量聚合 */
export function fetchCountryRegionDistribution(params: {
  keyword?: string
  region?: string
  currency?: string
}) {
  if (isCountryEndpointMock(CountryEndpoint.RegionDistribution)) {
    return countryMock.mockFetchCountryRegionDistribution(params)
  }
  return request
    .post<CountryRegionDistributionItem[] | { items: CountryRegionDistributionItem[] }>({
      url: '/api/v1/datacenter/analysis/config-management/country/charts/region-distribution',
      data: params,
      showErrorMessage: false
    })
    .then(unwrapItemsList)
}

/** 主要市场占比图表：与列表同筛选、全量聚合 */
export function fetchCountryMainMarketShare(params: {
  keyword?: string
  region?: string
  currency?: string
}) {
  if (isCountryEndpointMock(CountryEndpoint.MainMarketShare)) {
    return countryMock.mockFetchCountryMainMarketShare(params)
  }
  return request
    .post<CountryMainMarketShareItem[] | { items: CountryMainMarketShareItem[] }>({
      url: '/api/v1/datacenter/analysis/config-management/country/charts/main-market-share',
      data: params,
      showErrorMessage: false
    })
    .then(unwrapItemsList)
}

/** 国旗图标上传（multipart）；Mock 时返回 data URL 模拟网关返回的 `url` */
export function uploadCountryFlagIcon(file: File) {
  if (isCountryEndpointMock(CountryEndpoint.FlagIconUpload)) {
    return countryMock.mockUploadCountryFlagIcon(file)
  }
  const fd = new FormData()
  fd.append('file', file)
  return request.post<{ url: string }>({
    url: '/api/v1/datacenter/analysis/config-management/country/flag-icon/upload',
    data: fd,
    showErrorMessage: false
  })
}

/** 新增国家 */
export function createCountry(data: CountryFormModel) {
  if (isCountryEndpointMock(CountryEndpoint.CreateCountry)) {
    return countryMock.mockCreateCountry(data)
  }
  return request.post<CountryItem>({
    url: '/api/v1/datacenter/analysis/config-management/country',
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
    url: `/api/v1/datacenter/analysis/config-management/country/${code}`,
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
    url: `/api/v1/datacenter/analysis/config-management/country/${code}`,
    showErrorMessage: false
  })
}

/** 导出国家列表 */
export function exportCountryList(params: Partial<CountryTableQuery>) {
  if (isCountryEndpointMock(CountryEndpoint.ExportCountry)) {
    return countryMock.mockExportCountryList(params)
  }
  return request.post<unknown>({
    url: '/api/v1/datacenter/analysis/config-management/country/export',
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
    url: '/api/v1/datacenter/analysis/config-management/country/import',
    data,
    showErrorMessage: false
  })
}
