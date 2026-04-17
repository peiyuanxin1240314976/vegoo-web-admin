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
}
