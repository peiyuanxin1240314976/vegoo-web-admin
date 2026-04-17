export enum SubjectSettingEndpoint {
  List = 'list',
  Save = 'save',
  TogglePlatform = 'togglePlatform'
}

const SUBJECT_SETTING_ENDPOINT_MOCK_MAP: Record<SubjectSettingEndpoint, boolean> = {
  [SubjectSettingEndpoint.List]: true,
  [SubjectSettingEndpoint.Save]: true,
  [SubjectSettingEndpoint.TogglePlatform]: true
}

export function isSubjectSettingEndpointMock(endpoint: SubjectSettingEndpoint): boolean {
  return SUBJECT_SETTING_ENDPOINT_MOCK_MAP[endpoint]
}
