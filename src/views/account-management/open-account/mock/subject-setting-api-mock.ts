import { getAppNow } from '@/utils/app-now'
import type {
  SubjectPlatformKey,
  SubjectSettingItem,
  SubjectSettingListParams,
  SubjectSettingListResponse,
  SubjectSettingLicenseUploadParams,
  SubjectSettingLicenseUploadResponse,
  SubjectSettingSaveParams,
  SubjectSettingFilterOptionsResponse,
  SubjectSettingOverviewCardsResponse
} from '../types'
import { cloneSubjectSettingMockData } from './data'

let subjectSettingState: SubjectSettingItem[] = cloneSubjectSettingMockData()

function sortRows(rows: SubjectSettingItem[], sortOrder: SubjectSettingListParams['sortOrder']) {
  return [...rows].sort((a, b) => {
    const aTime = new Date(a.updateTime).getTime()
    const bTime = new Date(b.updateTime).getTime()
    return sortOrder === 'updated_asc' ? aTime - bTime : bTime - aTime
  })
}

function applyFilters(rows: SubjectSettingItem[], params: SubjectSettingListParams) {
  const keyword = (params.keyword ?? '').trim().toLowerCase()

  return rows.filter((item) => {
    if (
      keyword &&
      !item.subjectId.toLowerCase().includes(keyword) &&
      !item.subjectName.toLowerCase().includes(keyword)
    ) {
      return false
    }

    if (params.hasBusinessLicense === 'yes' && !item.businessLicense) return false
    if (params.hasBusinessLicense === 'no' && item.businessLicense) return false

    if (params.platformStatus === 'facebook' && !item.facebookEnabled) return false
    if (params.platformStatus === 'tiktok' && !item.tiktokEnabled) return false
    if (params.platformStatus === 'both' && !(item.facebookEnabled && item.tiktokEnabled))
      return false
    if (params.platformStatus === 'none' && (item.facebookEnabled || item.tiktokEnabled))
      return false

    return true
  })
}

function nowString() {
  const now = getAppNow()
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export async function mockFetchSubjectSettings(
  params: SubjectSettingListParams
): Promise<SubjectSettingListResponse> {
  const filtered = applyFilters(subjectSettingState, params)
  const sorted = sortRows(filtered, params.sortOrder ?? 'updated_desc')
  const current = params.current ?? 1
  const size = params.size ?? 10
  const start = (current - 1) * size
  const end = start + size
  const pageRecords = sorted.slice(start, end).map((item) => ({ ...item }))

  return {
    records: pageRecords,
    current,
    size,
    total: sorted.length
  }
}

export async function mockFetchSubjectSettingOverviewCards(
  params: SubjectSettingListParams
): Promise<SubjectSettingOverviewCardsResponse> {
  const filtered = applyFilters(subjectSettingState, params)
  const sorted = sortRows(filtered, 'updated_desc')

  return {
    total: filtered.length,
    facebookEnabled: filtered.filter((item) => item.facebookEnabled).length,
    tiktokEnabled: filtered.filter((item) => item.tiktokEnabled).length,
    bothEnabled: filtered.filter((item) => item.facebookEnabled && item.tiktokEnabled).length,
    latestUpdateTime: sorted[0]?.updateTime ?? '--'
  }
}

export async function mockSaveSubjectSetting(payload: SubjectSettingSaveParams) {
  const index = subjectSettingState.findIndex((item) => item.subjectId === payload.subjectId)
  const timestamp = nowString()

  if (index >= 0) {
    subjectSettingState[index] = {
      ...subjectSettingState[index],
      ...payload,
      updaterId: 9999,
      updateTime: timestamp
    }
    return { ...subjectSettingState[index] }
  }

  const created: SubjectSettingItem = {
    ...payload,
    inputTime: timestamp,
    createTime: timestamp,
    updateTime: timestamp,
    creatorId: 9999,
    updaterId: 9999
  }
  subjectSettingState = [created, ...subjectSettingState]
  return { ...created }
}

export async function mockToggleSubjectPlatform(payload: {
  id: string
  platform: SubjectPlatformKey
  enabled: boolean
}) {
  const index = subjectSettingState.findIndex((item) => item.subjectId === payload.id)
  if (index < 0) throw new Error('subject not found')

  const current = subjectSettingState[index]
  subjectSettingState[index] = {
    ...current,
    facebookEnabled: payload.platform === 'facebook' ? payload.enabled : current.facebookEnabled,
    tiktokEnabled: payload.platform === 'tiktok' ? payload.enabled : current.tiktokEnabled,
    updaterId: 9999,
    updateTime: nowString()
  }

  return { ...subjectSettingState[index] }
}

export async function mockUploadSubjectLicense(
  params: SubjectSettingLicenseUploadParams
): Promise<SubjectSettingLicenseUploadResponse> {
  const now = getAppNow()
  const timestamp = nowString()

  return {
    licenseUrl: `oss://licenses/${params.fileName.replace(/\s+/g, '-').toLowerCase()}`,
    fileId: `lic_${now.getTime()}`,
    uploadedAt: timestamp
  }
}

export async function mockDeleteSubjectSetting(subjectId: string) {
  const index = subjectSettingState.findIndex((item) => item.subjectId === subjectId)
  if (index < 0) throw new Error('subject not found')

  subjectSettingState.splice(index, 1)
  return {
    success: true,
    deletedId: subjectId
  }
}

export async function mockFetchSubjectSettingFilterOptions(): Promise<SubjectSettingFilterOptionsResponse> {
  return {
    platformStatusOptions: [
      { label: '全部平台状态', value: 'all' },
      { label: 'Facebook 可用', value: 'facebook' },
      { label: 'TikTok 可用', value: 'tiktok' },
      { label: '双平台可用', value: 'both' },
      { label: '全部未启用', value: 'none' }
    ],
    licenseStatusOptions: [
      { label: '全部执照状态', value: 'all' },
      { label: '有营业执照', value: 'yes' },
      { label: '无营业执照', value: 'no' }
    ],
    sortOrderOptions: [
      { label: '最近更新优先', value: 'updated_desc' },
      { label: '最早更新优先', value: 'updated_asc' }
    ]
  }
}
