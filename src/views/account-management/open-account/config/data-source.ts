export enum SubjectSettingEndpoint {
  OverviewCards = 'overviewCards',
  FilterOptions = 'filterOptions',
  List = 'list',
  Save = 'save',
  TogglePlatform = 'togglePlatform',
  UploadLicense = 'uploadLicense',
  Delete = 'delete'
}

const SUBJECT_SETTING_ENDPOINT_MOCK_MAP: Record<SubjectSettingEndpoint, boolean> = {
  [SubjectSettingEndpoint.OverviewCards]: true,
  [SubjectSettingEndpoint.FilterOptions]: true,
  [SubjectSettingEndpoint.List]: true,
  [SubjectSettingEndpoint.Save]: true,
  [SubjectSettingEndpoint.TogglePlatform]: true,
  [SubjectSettingEndpoint.UploadLicense]: true,
  [SubjectSettingEndpoint.Delete]: true
}

export function isSubjectSettingEndpointMock(endpoint: SubjectSettingEndpoint): boolean {
  return SUBJECT_SETTING_ENDPOINT_MOCK_MAP[endpoint]
}
