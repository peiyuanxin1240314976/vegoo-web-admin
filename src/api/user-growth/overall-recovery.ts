/**
 * 用户增长 - 整体回收 API（当前为 mock；接入真实接口时改为 request）
 */
import type {
  OverallRecoveryFilterOptions,
  OverallTabData,
  OrganicTabData
} from '@/views/user-growth/overall-recovery/types'
import {
  MOCK_OVERALL_RECOVERY_FILTER_OPTIONS,
  MOCK_OVERALL_TAB_DATA,
  MOCK_ORGANIC_TAB_DATA
} from '@/views/user-growth/overall-recovery/mock/data'

/** 整体回收 - 下拉筛选选项 */
export function fetchOverallRecoveryFilterOptions() {
  return Promise.resolve<OverallRecoveryFilterOptions>(MOCK_OVERALL_RECOVERY_FILTER_OPTIONS)
}

/** 整体回收 - Tab1 整体回收数据 */
export function fetchOverallTabData(_params: {
  dateRange: string
  s_app_id: string
  source: string
  s_country_code: string
}) {
  void _params
  return Promise.resolve<OverallTabData>(MOCK_OVERALL_TAB_DATA)
}

/** 整体回收 - Tab2 自然量分析数据 */
export function fetchOrganicTabData(_params: {
  dateRange: string
  s_app_id: string
  source: string
  s_country_code: string
}) {
  void _params
  return Promise.resolve<OrganicTabData>(MOCK_ORGANIC_TAB_DATA)
}
