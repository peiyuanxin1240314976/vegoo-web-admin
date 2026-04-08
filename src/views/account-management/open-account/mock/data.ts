import type { OpenAccountItem } from '@/views/config-management/account-management/types'

export const openAccountAppOptions = [
  'BloodSugar2',
  'WeatherApp',
  'PhoneTracker2',
  'HealthTracker2'
]
export const openAccountAgencyOptions = ['星达传媒', '天联广告', '海潮营销', '亚太传播']

export const openAccountMockRecords: OpenAccountItem[] = [
  {
    id: 'OA-101',
    source: 'Meta Ads',
    app: 'BloodSugar2',
    platform: '安卓',
    accountType: '企业户',
    agency: '星达传媒',
    amount: 5000,
    applicant: '张三',
    registerTime: '2026-04-01 09:30',
    status: '已激活',
    remark: '美国主投账户',
    adAccountId: 'act_901001',
    adAccountName: 'Vegoo_Meta_US_01',
    activateTime: '2026-04-01 14:20',
    credential: 'Meta-Token-A',
    credentialStatus: '验证正常',
    feishuRecords: [
      { time: '2026-04-01 09:31', event: '开户登记', result: '成功', target: '广告账户群' },
      { time: '2026-04-01 14:21', event: '凭据分配激活', result: '成功', target: '@张三' }
    ]
  },
  {
    id: 'OA-102',
    source: 'Google Ads',
    app: 'WeatherApp',
    platform: 'iOS',
    accountType: '个人户',
    agency: '天联广告',
    amount: 3000,
    applicant: '李四',
    registerTime: '2026-04-02 10:10',
    status: '待分配',
    remark: '',
    adAccountId: '',
    adAccountName: '',
    credential: '',
    credentialStatus: '',
    feishuRecords: [
      { time: '2026-04-02 10:11', event: '开户登记', result: '成功', target: '@李四' }
    ]
  },
  {
    id: 'OA-103',
    source: 'TikTok Ads',
    app: 'PhoneTracker2',
    platform: '网页',
    accountType: '小额广告户',
    agency: '海潮营销',
    amount: 1500,
    applicant: '王五',
    registerTime: '2026-04-02 15:45',
    status: '开户失败',
    remark: '资质审核未通过',
    feishuRecords: [
      { time: '2026-04-02 16:02', event: '开户失败', result: '成功', target: '@王五' }
    ]
  },
  {
    id: 'OA-104',
    source: 'Apple Search',
    app: 'HealthTracker2',
    platform: 'iOS',
    accountType: '企业户',
    agency: '亚太传播',
    amount: 4200,
    applicant: '赵六',
    registerTime: '2026-04-03 11:00',
    status: '已激活',
    remark: '',
    adAccountId: 'act_901004',
    adAccountName: 'Vegoo_Apple_ASA_01',
    activateTime: '2026-04-03 16:00',
    credential: 'Apple-ASA-A',
    credentialStatus: '验证正常',
    feishuRecords: [
      { time: '2026-04-03 11:01', event: '开户登记', result: '成功', target: '广告账户群' },
      { time: '2026-04-03 16:01', event: '凭据分配激活', result: '成功', target: '@赵六' }
    ]
  }
]

export function cloneOpenAccountLocalMock(): OpenAccountItem[] {
  return openAccountMockRecords.map((item) => ({
    ...item,
    feishuRecords: item.feishuRecords.map((i) => ({ ...i }))
  }))
}
