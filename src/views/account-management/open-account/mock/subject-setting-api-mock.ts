import type { SubjectPlatformKey, SubjectSettingItem, SubjectSettingListParams } from '../types'
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
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export async function mockFetchSubjectSettings(params: SubjectSettingListParams) {
  const filtered = applyFilters(subjectSettingState, params)
  return sortRows(filtered, params.sortOrder ?? 'updated_desc').map((item) => ({ ...item }))
}

export async function mockSaveSubjectSetting(payload: SubjectSettingItem) {
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
