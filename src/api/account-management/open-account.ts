import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  SubjectSettingEndpoint,
  isSubjectSettingEndpointMock
} from '@/views/account-management/open-account/config/data-source'
import {
  mockDeleteSubjectSetting,
  mockFetchSubjectSettingFilterOptions,
  mockFetchSubjectSettingOverviewCards,
  mockFetchSubjectSettings,
  mockSaveSubjectSetting,
  mockToggleSubjectPlatform,
  mockUploadSubjectLicense
} from '@/views/account-management/open-account/mock/subject-setting-api-mock'
import type {
  SubjectPlatformKey,
  SubjectSettingItem,
  SubjectSettingLicenseUploadParams,
  SubjectSettingLicenseUploadResponse,
  SubjectSettingSaveParams,
  SubjectSettingFilterOptionsResponse,
  SubjectSettingListParams,
  SubjectSettingListResponse,
  SubjectSettingOverviewCardsResponse
} from '@/views/account-management/open-account/types'

const OPEN_ACCOUNT_BASE = `${ANALYSIS_API_BASE}/account-management/open-account`

export function fetchSubjectSettingOverviewCards(params: SubjectSettingListParams) {
  if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.OverviewCards)) {
    return mockFetchSubjectSettingOverviewCards(params)
  }

  return request.post<SubjectSettingOverviewCardsResponse>({
    url: `${OPEN_ACCOUNT_BASE}/subject-settings/overview-cards`,
    data: params,
    showErrorMessage: false
  })
}

export function fetchSubjectSettingList(params: SubjectSettingListParams) {
  if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.List)) {
    return mockFetchSubjectSettings(params)
  }

  return request.post<SubjectSettingListResponse>({
    url: `${OPEN_ACCOUNT_BASE}/subject-settings/list`,
    data: params,
    showErrorMessage: false
  })
}

export function fetchSubjectSettingFilterOptions() {
  if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.FilterOptions)) {
    return mockFetchSubjectSettingFilterOptions()
  }

  return request.post<SubjectSettingFilterOptionsResponse>({
    url: `${OPEN_ACCOUNT_BASE}/subject-settings/filter-options`,
    data: {},
    showErrorMessage: false
  })
}

export function saveSubjectSetting(payload: SubjectSettingSaveParams) {
  if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.Save)) {
    return mockSaveSubjectSetting(payload)
  }

  return request.post<{
    record: SubjectSettingItem
    action: 'created' | 'updated'
  }>({
    url: `${OPEN_ACCOUNT_BASE}/subject-settings/save`,
    data: payload,
    showErrorMessage: false
  })
}

export function toggleSubjectSettingPlatform(payload: {
  id: string
  platform: SubjectPlatformKey
  enabled: boolean
}) {
  if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.TogglePlatform)) {
    return mockToggleSubjectPlatform(payload)
  }

  return request.post<{
    record: SubjectSettingItem
  }>({
    url: `${OPEN_ACCOUNT_BASE}/subject-settings/toggle-platform`,
    data: payload,
    showErrorMessage: false
  })
}

export function uploadSubjectSettingLicense(params: SubjectSettingLicenseUploadParams) {
  if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.UploadLicense)) {
    return mockUploadSubjectLicense(params)
  }

  return request.post<SubjectSettingLicenseUploadResponse>({
    url: `${OPEN_ACCOUNT_BASE}/subject-settings/license-upload`,
    data: params,
    showErrorMessage: false
  })
}

export function deleteSubjectSetting(subjectId: string) {
  if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.Delete)) {
    return mockDeleteSubjectSetting(subjectId)
  }

  return request.post<{
    success: boolean
    deletedId: string
  }>({
    url: `${OPEN_ACCOUNT_BASE}/subject-settings/delete`,
    data: { subjectId },
    showErrorMessage: false
  })
}
