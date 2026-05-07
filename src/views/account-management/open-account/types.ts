export type SubjectPlatformKey = 'facebook' | 'tiktok'

export interface SubjectSettingItem {
  subjectId: string
  subjectName: string
  businessLicense: string
  facebookEnabled: boolean
  facebookRemark: string
  tiktokEnabled: boolean
  tiktokRemark: string
  inputTime: string
  creatorId: number | null
  createTime: string
  updaterId: number | null
  updateTime: string
}

export interface SubjectSettingSaveParams {
  subjectId: string
  subjectName: string
  businessLicense: string
  facebookEnabled: boolean
  facebookRemark: string
  tiktokEnabled: boolean
  tiktokRemark: string
}

export interface SubjectSettingStats {
  total: number
  facebookEnabled: number
  tiktokEnabled: number
  bothEnabled: number
}

export interface SubjectSettingListParams {
  keyword?: string
  platformStatus?: 'all' | 'facebook' | 'tiktok' | 'both' | 'none'
  hasBusinessLicense?: 'all' | 'yes' | 'no'
  sortOrder?: 'updated_desc' | 'updated_asc'
  current?: number
  size?: number
}

export interface SubjectSettingListResponse {
  records: SubjectSettingItem[]
  current: number
  size: number
  total: number
}

export interface SubjectSettingOverviewCardsResponse extends SubjectSettingStats {
  latestUpdateTime: string
}

export interface SubjectSettingLicenseUploadParams {
  fileName: string
  fileType: string
  fileSize: number
  fileContentBase64: string
}

export interface SubjectSettingLicenseUploadResponse {
  licenseUrl: string
  fileId: string
  uploadedAt: string
}

export interface SubjectSettingOptionItem {
  label: string
  value: string
}

export interface SubjectSettingFilterOptionsResponse {
  platformStatusOptions: SubjectSettingOptionItem[]
  licenseStatusOptions: SubjectSettingOptionItem[]
  sortOrderOptions: SubjectSettingOptionItem[]
}
