import request from '@/utils/http'

/**
 * 个人中心 · 通知设置 - 查询当前用户配置
 * POST body 为空；鉴权依赖 Authorization
 */
export function fetchUserCenterNotificationSettings() {
  return request.post<Api.UserCenter.UserNotificationSettings>({
    url: '/api/v1/datacenter/analysis/system/user-center/notification-settings/query',
    data: {}
  })
}

/**
 * 个人中心 · 通知设置 - 保存
 */
export function fetchUserCenterNotificationSettingsSave(
  payload: Api.UserCenter.UserNotificationSettings
) {
  return request.post<Api.UserCenter.NotificationSettingsSaveResult>({
    url: '/api/v1/datacenter/analysis/system/user-center/notification-settings/save',
    data: payload
  })
}
