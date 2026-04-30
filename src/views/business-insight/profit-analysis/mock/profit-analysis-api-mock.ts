import type {
  ProfitAppProfitResponseDto,
  ProfitCountryProfitResponseDto,
  ProfitFilterOptions,
  ProfitKpiOverviewDto,
  ProfitSankeyDto,
  ProfitTrend30d
} from '../types'
import {
  MOCK_APP_PROFIT_ROOT,
  MOCK_COUNTRY_ROWS,
  MOCK_KPI_CARDS,
  MOCK_MAP_DATA,
  MOCK_MAP_SCATTER,
  MOCK_SANKEY_LINKS,
  MOCK_SANKEY_NODES,
  MOCK_TREND_30D
} from './data'

export function mockFetchProfitMetaFilterOptions(): ProfitFilterOptions {
  return {
    appOptions: [
      { label: '全部', value: 'all' },
      { label: 'Weather5', value: 'weather5' },
      { label: 'PhoneTracker', value: 'phonetracker' },
      { label: 'BloodSugar2', value: 'bloodsugar2' }
    ],
    platformOptions: [
      { label: '全部', value: 'all' },
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' }
    ],
    countryOptions: [
      { label: '全部', value: 'all' },
      { label: '美国', value: 'us' },
      { label: '韩国', value: 'kr' },
      { label: '德国', value: 'de' }
    ],
    datePresets: [
      { label: '近7天', value: '7' },
      { label: '近14天', value: '14' },
      { label: '近30天', value: '30' }
    ]
  }
}

export function mockFetchProfitOverviewKpi(): ProfitKpiOverviewDto {
  return { kpis: MOCK_KPI_CARDS }
}

export function mockFetchProfitTableAppProfit(): ProfitAppProfitResponseDto {
  return { root: MOCK_APP_PROFIT_ROOT }
}

export function mockFetchProfitOverviewCountryProfit(): ProfitCountryProfitResponseDto {
  return {
    countryRows: MOCK_COUNTRY_ROWS,
    mapData: MOCK_MAP_DATA,
    mapScatter: MOCK_MAP_SCATTER
  }
}

export function mockFetchProfitOverviewTrend30d(): ProfitTrend30d {
  return MOCK_TREND_30D
}

export function mockFetchProfitOverviewSankey(): ProfitSankeyDto {
  return { nodes: MOCK_SANKEY_NODES, links: MOCK_SANKEY_LINKS }
}
