import type { OverallTabData, OrganicTabData } from '../types'
import { MOCK_OVERALL_TAB_DATA, MOCK_ORGANIC_TAB_DATA } from './data'

export function mockFetchOverallRecoveryOverallTab() {
  return Promise.resolve<OverallTabData>(MOCK_OVERALL_TAB_DATA)
}

export function mockFetchOverallRecoveryOrganicTab() {
  return Promise.resolve<OrganicTabData>(MOCK_ORGANIC_TAB_DATA)
}
