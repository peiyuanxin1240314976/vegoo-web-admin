/** 账户管理：列表 / 详情 / 表单共用类型 */

export type AdPlatform =
  | 'Google Ads'
  | 'Meta Ads'
  | 'TikTok Ads'
  | 'Apple Search'
  | 'Mintegral'
  | 'Unity Ads'
  | 'Snapchat Ads'
  | 'Kwai Ads'

export type AccountType = '直投' | '代投'

export type AccountStatus = '正常' | '余额不足' | '已停用'

export interface AdAccountItem {
  id: string
  /** 账户名称 */
  accountName: string
  /** 广告平台 */
  source: AdPlatform
  /** 代理商 */
  agency: string
  /** 账户类型 */
  accountType: AccountType
  /** 账户余额 */
  balance: number
  /** 本月消耗 */
  monthSpend: number
  /** 状态 */
  status: AccountStatus
  /** 归属BC/BM */
  bcBm: string
  /** 投放应用列表 */
  apps: string[]
  /** 投放平台 */
  platform: string[]
  /** 账户用途 */
  purposes: string[]
  /** 关联凭据 */
  credential: string
  /** 消耗上限（月） */
  spendLimit: number
  /** 消耗进度（百分比） */
  spendProgress: number
  /** 货币 */
  currency: string
  /** 最近充值时间 */
  lastRechargeTime: string
  /** 最近充值金额 */
  lastRechargeAmount: number
  /** 创建时间 */
  createTime: string
  /** 备注 */
  remark: string
}

/** 新增 / 编辑表单模型 */
export interface AccountFormModel {
  /** 新建时由用户填写，编辑时只读 */
  id: string
  source: AdPlatform | ''
  accountName: string
  accountType: AccountType
  bcBm: string
  agency: string
  platform: string[]
  apps: string[]
  spendLimit: string
  currency: string
  remark: string
}

/** 充值表单模型 */
export interface RechargeFormModel {
  amount: number
  customAmount: string
  method: 'platform' | 'small-campaign' | 'other'
  remark: string
}

/** 统计数据 */
export interface AccountStats {
  total: number
  active: number
  proxy: number
  newThisMonth: number
  newThisMonthDelta: number
}

/** 表格查询参数 */
export interface AccountTableQuery {
  current: number
  size: number
  keyword?: string
  source?: string
  accountType?: string
  status?: string
  app?: string
}

/** 广告平台配置 */
export interface PlatformConfig {
  value: string
  label: string
  shortLabel: string
  color: string
  bg: string
}

// ─── 代理商管理 ────────────────────────────────────────────

export type AgencyCoopMode = '授权代理' | '直接开户'
export type AgencyStatus = '已合作' | '洽谈中' | '已终止'

export interface AgencyBcBmItem {
  name: string
  source: string
  type: string
  accountCount: number
  status: string
}

export interface AgencyItem {
  id: string
  /** 代理商名称 */
  agencyName: string
  /** 广告平台 */
  source: AdPlatform
  /** 合作模式 */
  coopMode: AgencyCoopMode
  /** 管理账户数 */
  managedAccounts: number
  /** 本月消耗 */
  monthSpend: number
  /** 到期日期 */
  expireDate: string
  /** 合作状态 */
  status: AgencyStatus
  /** 联系人 */
  contact: string
  /** 联系邮箱 */
  email: string
  /** 联系电话 */
  phone: string
  /** 合作开始日期 */
  startDate: string
  /** 备注 */
  remark: string
  /** 活跃账户数 */
  activeAccounts: number
  /** 暂停账户数 */
  pausedAccounts: number
  /** 本月收入 */
  monthRevenue: number
  /** 关联BC/BM */
  bcBmList: AgencyBcBmItem[]
}

export interface AgencyFormModel {
  agencyName: string
  source: AdPlatform | ''
  coopMode: AgencyCoopMode
  contact: string
  email: string
  phone: string
  agencyAccount: string
  startDate: string
  expireDate: string
  remark: string
}

export interface AgencyTableQuery {
  current: number
  size: number
  keyword?: string
  source?: string
  coopMode?: string
  status?: string
}

// ─── 凭据管理 ──────────────────────────────────────────────

export type CredentialType = '客户端Token' | '服务号' | '证书文件'
export type CredentialStatus = '验证正常' | '验证失败' | '待验证'

export interface CredentialValidateRecord {
  time: string
  status: '验证成功' | '验证失败'
  trigger: '自动定时' | '手动'
  operator?: string
  detail?: string
}

export interface CredentialItem {
  id: string
  /** 凭据名称 */
  name: string
  /** 广告平台 */
  source: AdPlatform
  /** 分组 */
  group: string
  /** 凭据类型 */
  credentialType: CredentialType
  /** 备注 */
  remark: string
  /** 关联应用 */
  apps: string[]
  /** 关联账户数 */
  accountCount: number
  /** 关联账户ID列表（删除时展示） */
  accountIds: string[]
  /** 验证状态 */
  status: CredentialStatus
  /** 最后验证时间 */
  lastValidateTime: string
  /** 凭据配置字段 */
  config: {
    account?: string
    password?: string
    clientId?: string
    clientSecret?: string
    accessToken?: string
    refreshToken?: string
  }
  /** 验证历史 */
  validateHistory: CredentialValidateRecord[]
}

export interface CredentialFormModel {
  name: string
  source: AdPlatform | ''
  group: string
  credentialType: CredentialType
  expireTime: string
  remark: string
  apps: string[]
  config: {
    account: string
    password: string
    clientId: string
    clientSecret: string
    accessToken: string
    refreshToken: string
  }
}

export interface CredentialValidateResult {
  success: boolean
  validateTime: string
  responseTime: number
  apiVersion: string
  permissions: { label: string; granted: boolean }[]
  accessibleAccounts: string[]
  totalAccountCount: number
}

export interface CredentialTableQuery {
  current: number
  size: number
  keyword?: string
  source?: string
  credentialType?: string
  status?: string
}

// ─── 开户管理 ──────────────────────────────────────────────

export type OpenAccountStatus = '待分配' | '已激活' | '开户失败'
export type OpenAccountType = '企业户' | '个人户' | '小额广告户'
export type OpenPlatform = '安卓' | 'iOS' | '网页'

export interface FeishuRecord {
  time: string
  event: string
  result: '成功' | '失败'
  target: string
}

export interface OpenAccountItem {
  id: string
  /** 广告平台 */
  source: AdPlatform
  /** 应用名称 */
  app: string
  /** 投放平台 */
  platform: OpenPlatform
  /** 开户类型 */
  accountType: OpenAccountType
  /** 归属代理商 */
  agency: string
  /** 开户金额（USD） */
  amount: number
  /** 申请人 */
  applicant: string
  /** 登记时间 */
  registerTime: string
  /** 状态 */
  status: OpenAccountStatus
  /** 备注 */
  remark: string
  /** 广告账户ID（开户后填写） */
  adAccountId?: string
  /** 广告账户名称 */
  adAccountName?: string
  /** 开通时间 */
  activateTime?: string
  /** 关联凭据名 */
  credential?: string
  /** 凭据验证状态 */
  credentialStatus?: string
  /** 飞书推送记录 */
  feishuRecords: FeishuRecord[]
}

export interface OpenAccountFormModel {
  source: AdPlatform | ''
  app: string
  platform: OpenPlatform
  accountType: OpenAccountType
  agency: string
  amount: string
  applicant: string
  adAccountId: string
  adAccountName: string
  credential: string
  remark: string
}

export interface OpenAccountTableQuery {
  current: number
  size: number
  keyword?: string
  source?: string
  status?: string
  agency?: string
  app?: string
}

// ─── BC / BM 管理 ──────────────────────────────────────────

export type BcStatus = '健康' | '可用' | '不再使用' | '封禁' | '其他'
export type BcOwnerType = '企业户' | '个人户' | '小额广告户'
export type BcBanRecord = '无' | '有'

export interface BcItem {
  id: string
  /** BM平台ID */
  bmId: string
  /** BM名称 */
  bmName: string
  /** 广告平台 */
  source: AdPlatform
  /** 归属组 */
  group: string
  /** 状态 */
  status: BcStatus
  /** 开户主体 */
  ownerType: BcOwnerType
  /** 管理员 */
  manager: string
  /** 封户记录 */
  banRecord: BcBanRecord
  /** 封户记录说明 */
  banDesc: string
  /** 创建时间 */
  createTime: string
  /** 备注 */
  remark: string
  /** 关联账户数 */
  linkedAccounts: number
  /** 活跃账户数 */
  activeAccounts: number
  /** 已停用账户数 */
  inactiveAccounts: number
  /** 本月消耗 */
  monthSpend: number
  /** 本月开户数 */
  monthOpenCount: number
}

export interface BcFormModel {
  source: AdPlatform | ''
  bmId: string
  bmName: string
  group: string
  status: BcStatus
  ownerType: BcOwnerType
  manager: string
  banRecord: BcBanRecord
  banDesc: string
  remark: string
}

export interface BcTableQuery {
  current: number
  size: number
  keyword?: string
  source?: string
  status?: string
  ownerType?: string
  banRecord?: string
}

// ─── 广告平台配置 ───────────────────────────────────────────

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  { value: 'Google Ads', label: 'Google Ads', shortLabel: 'G', color: '#4285f4', bg: 'rgb(66 133 244 / 12%)' },
  { value: 'Meta Ads', label: 'Meta Ads', shortLabel: 'f', color: '#1877f2', bg: 'rgb(24 119 242 / 12%)' },
  { value: 'TikTok Ads', label: 'TikTok Ads', shortLabel: 'TikTok', color: '#fe2c55', bg: 'rgb(254 44 85 / 12%)' },
  { value: 'Mintegral', label: 'Mintegral', shortLabel: 'M', color: '#ff6b35', bg: 'rgb(255 107 53 / 12%)' },
  { value: 'Apple Search', label: 'Apple Search', shortLabel: 'Apple', color: '#a2aaad', bg: 'rgb(162 170 173 / 12%)' },
  { value: 'Unity Ads', label: 'Unity Ads', shortLabel: 'Unity', color: '#222c37', bg: 'rgb(34 44 55 / 20%)' },
  { value: 'Snapchat Ads', label: 'Snapchat Ads', shortLabel: 'Snap', color: '#fffc00', bg: 'rgb(255 252 0 / 10%)' },
  { value: 'Kwai Ads', label: 'Kwai Ads', shortLabel: 'Kwai', color: '#ff5200', bg: 'rgb(255 82 0 / 12%)' }
]
