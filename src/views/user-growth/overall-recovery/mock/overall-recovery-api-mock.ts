import type { OverallRecoveryDetailRecordsBody, OrganicTabData, RecoveryDetailRow } from '../types'
import { MOCK_OVERALL_TAB_DATA, MOCK_ORGANIC_TAB_DATA } from './data'

export function mockFetchOverallTabKpis() {
  return Promise.resolve({ kpis: MOCK_OVERALL_TAB_DATA.kpis })
}

export function mockFetchOverallTabRecoveryCurve() {
  return Promise.resolve({ recoveryCurve: MOCK_OVERALL_TAB_DATA.recoveryCurve })
}

export function mockFetchOverallTabDailyVolume() {
  return Promise.resolve({ dailyVolume: MOCK_OVERALL_TAB_DATA.dailyVolume })
}

export function mockFetchOverallTabRoiCompare() {
  return Promise.resolve({ roiCompare: MOCK_OVERALL_TAB_DATA.roiCompare })
}

function filterDetailRows(
  rows: RecoveryDetailRow[],
  body: OverallRecoveryDetailRecordsBody
): RecoveryDetailRow[] {
  const { detailApp: da, detailChannel: dc } = body
  return rows.filter((row) => {
    if (da) {
      if (row.detailApp !== undefined && row.detailApp !== da) return false
    }
    if (dc) {
      if (row.detailChannel !== undefined && row.detailChannel !== dc) return false
    }
    return true
  })
}

export function mockFetchOverallTabDetailRecords(body: OverallRecoveryDetailRecordsBody) {
  const detailRows = filterDetailRows([...MOCK_OVERALL_TAB_DATA.detailRows], body)
  return Promise.resolve({ detailRows })
}

export function mockFetchOverallRecoveryOrganicTab() {
  return Promise.resolve<OrganicTabData>(MOCK_ORGANIC_TAB_DATA)
}
