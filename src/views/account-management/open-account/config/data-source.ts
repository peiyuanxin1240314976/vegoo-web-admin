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
  [SubjectSettingEndpoint.OverviewCards]: false,
  [SubjectSettingEndpoint.FilterOptions]: false,
  [SubjectSettingEndpoint.List]: false,
  [SubjectSettingEndpoint.Save]: false,
  [SubjectSettingEndpoint.TogglePlatform]: false,
  [SubjectSettingEndpoint.UploadLicense]: false,
  [SubjectSettingEndpoint.Delete]: false
}

export function isSubjectSettingEndpointMock(endpoint: SubjectSettingEndpoint): boolean {
  return SUBJECT_SETTING_ENDPOINT_MOCK_MAP[endpoint]
}
