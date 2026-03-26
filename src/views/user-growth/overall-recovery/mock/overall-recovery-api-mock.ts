import type { OverallRecoveryFilterOptions, OverallTabData, OrganicTabData } from '../types'
import {
  MOCK_OVERALL_RECOVERY_FILTER_OPTIONS,
  MOCK_OVERALL_TAB_DATA,
  MOCK_ORGANIC_TAB_DATA
} from './data'

export function mockFetchOverallRecoveryMetaFilterOptions() {
  return Promise.resolve<OverallRecoveryFilterOptions>(MOCK_OVERALL_RECOVERY_FILTER_OPTIONS)
}

export function mockFetchOverallRecoveryOverallTab() {
  return Promise.resolve<OverallTabData>(MOCK_OVERALL_TAB_DATA)
}

export function mockFetchOverallRecoveryOrganicTab() {
  return Promise.resolve<OrganicTabData>(MOCK_ORGANIC_TAB_DATA)
}
