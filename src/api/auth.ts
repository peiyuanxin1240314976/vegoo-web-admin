import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/v1/datacenter/biz/user/login',
    params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 获取当前用户信息（需已登录，请求头带 Authorization: token）
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/v1/datacenter/biz/user/get'
  })
}

/**
 * 退出登录（请求头带 Authorization: token，后端使 token 失效）
 */
export function fetchLogout() {
  return request.post<void>({
    url: '/api/v1/datacenter/biz/user/logout'
  })
}

/**
 * 修改当前用户邮箱（请求头带 Authorization）
 * @param email 新邮箱
 */
export function fetchChangeEmail(email: string) {
  return request.put<void>({
    url: '/api/v1/datacenter/biz/user/detail/change-email',
    params: { email },
    data: {} // 保持 params 作为 query，不写入 body
  })
}

/**
 * 修改当前用户密码（请求头带 Authorization）
 * @param id 用户 id（用户接口返回）
 * @param oldPassword 当前密码
 * @param newPassword 新密码
 */
export function fetchChangePwd(params: { id: number; oldPassword: string; newPassword: string }) {
  return request.put<void>({
    url: '/api/v1/datacenter/biz/user/detail/change-pwd',
    params
  })
}
