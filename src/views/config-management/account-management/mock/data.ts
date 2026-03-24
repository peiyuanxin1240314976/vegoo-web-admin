import type { AdAccountItem } from '../types'

export const mockAccountList: AdAccountItem[] = [
  {
    id: 'ACC-001',
    accountName: 'Google-US-Main',
    source: 'Google Ads',
    agency: '直投',
    accountType: '直投',
    balance: 12450,
    monthSpend: 85420,
    status: '正常',
    bcBm: 'Vegoo Google BM',
    apps: ['BloodSugar2', 'WeatherApp'],
    platform: ['安卓'],
    purposes: ['广告投放', '用户获取'],
    credential: 'AdCost',
    spendLimit: 200000,
    spendProgress: 42.7,
    currency: 'USD',
    lastRechargeTime: '2024-01-25',
    lastRechargeAmount: 2000,
    createTime: '2023-01-15',
    remark: '美国主力投放账户'
  },
  {
    id: 'ACC-012',
    accountName: 'FB-Agency-A-01',
    source: 'Meta Ads',
    agency: 'Agency-A',
    accountType: '代投',
    balance: 6200,
    monthSpend: 62180,
    status: '正常',
    bcBm: 'Agency-A BM',
    apps: ['BloodSugar2'],
    platform: ['安卓', 'iOS'],
    purposes: ['广告投放', '用户获取'],
    credential: 'Facebook1',
    spendLimit: 200000,
    spendProgress: 31.1,
    currency: 'USD',
    lastRechargeTime: '2024-01-20',
    lastRechargeAmount: 5000,
    createTime: '2023-03-10',
    remark: ''
  },
  {
    id: 'ACC-023',
    accountName: 'TikTok-B-01',
    source: 'TikTok Ads',
    agency: 'Agency-B',
    accountType: '代投',
    balance: 3100,
    monthSpend: 45920,
    status: '正常',
    bcBm: 'Agency-B BM',
    apps: ['WeatherApp'],
    platform: ['安卓'],
    purposes: ['广告投放'],
    credential: 'TikTok1',
    spendLimit: 100000,
    spendProgress: 45.9,
    currency: 'USD',
    lastRechargeTime: '2024-01-18',
    lastRechargeAmount: 3000,
    createTime: '2023-04-05',
    remark: ''
  },
  {
    id: 'ACC-034',
    accountName: 'Google-EU-01',
    source: 'Google Ads',
    agency: 'Agency-A',
    accountType: '代投',
    balance: 5600,
    monthSpend: 38450,
    status: '正常',
    bcBm: 'Agency-A BM',
    apps: ['BloodSugar2', 'WeatherApp'],
    platform: ['安卓', 'iOS'],
    purposes: ['广告投放', '用户获取', '品牌建设'],
    credential: 'Google2',
    spendLimit: 150000,
    spendProgress: 25.6,
    currency: 'EUR',
    lastRechargeTime: '2024-01-15',
    lastRechargeAmount: 4000,
    createTime: '2023-05-20',
    remark: '欧洲市场账户'
  },
  {
    id: 'ACC-045',
    accountName: 'Mintegral-01',
    source: 'Mintegral',
    agency: '直投',
    accountType: '直投',
    balance: 1200,
    monthSpend: 28120,
    status: '余额不足',
    bcBm: 'Vegoo主客BC',
    apps: ['BloodSugar2'],
    platform: ['安卓'],
    purposes: ['广告投放'],
    credential: 'Mintegral1',
    spendLimit: 80000,
    spendProgress: 35.2,
    currency: 'USD',
    lastRechargeTime: '2023-12-28',
    lastRechargeAmount: 2000,
    createTime: '2023-06-01',
    remark: ''
  },
  {
    id: 'ACC-056',
    accountName: 'Apple-Search-01',
    source: 'Apple Search',
    agency: '直投',
    accountType: '直投',
    balance: 9800,
    monthSpend: 15680,
    status: '正常',
    bcBm: 'Vegoo Apple BM',
    apps: ['WeatherApp'],
    platform: ['iOS'],
    purposes: ['广告投放', '用户获取'],
    credential: 'Apple1',
    spendLimit: 50000,
    spendProgress: 31.4,
    currency: 'USD',
    lastRechargeTime: '2024-01-10',
    lastRechargeAmount: 5000,
    createTime: '2023-07-15',
    remark: ''
  },
  {
    id: 'ACC-067',
    accountName: 'Unity-Agency-C',
    source: 'Unity Ads',
    agency: 'Agency-C',
    accountType: '代投',
    balance: 0,
    monthSpend: 8750,
    status: '已停用',
    bcBm: 'Agency-C BM',
    apps: [],
    platform: ['安卓'],
    purposes: ['广告投放'],
    credential: 'Unity1',
    spendLimit: 50000,
    spendProgress: 17.5,
    currency: 'USD',
    lastRechargeTime: '2023-11-20',
    lastRechargeAmount: 1000,
    createTime: '2023-08-01',
    remark: ''
  },
  {
    id: 'ACC-078',
    accountName: 'TikTok-US-02',
    source: 'TikTok Ads',
    agency: '直投',
    accountType: '直投',
    balance: 4500,
    monthSpend: 6200,
    status: '正常',
    bcBm: 'Vegoo主客BC',
    apps: ['BloodSugar2'],
    platform: ['安卓', 'iOS'],
    purposes: ['广告投放', '用户获取'],
    credential: 'TikTok2',
    spendLimit: 100000,
    spendProgress: 6.2,
    currency: 'USD',
    lastRechargeTime: '2024-01-08',
    lastRechargeAmount: 2000,
    createTime: '2023-09-10',
    remark: '美国 TikTok 次要账户'
  }
]

export function cloneAccountMockList(): AdAccountItem[] {
  return mockAccountList.map((item) => ({ ...item, apps: [...item.apps], platform: [...item.platform], purposes: [...item.purposes] }))
}

export const appOptions = ['BloodSugar2', 'WeatherApp', 'FitLife', 'GamePro', 'ShopEasy']

export const bcBmOptions = [
  'Vegoo Google BM',
  'Vegoo主客BC',
  'Vegoo Apple BM',
  'Agency-A BM',
  'Agency-B BM',
  'Agency-C BM'
]

export const credentialOptions = [
  'AdCost',
  'Facebook1',
  'TikTok1',
  'TikTok2',
  'Google2',
  'Apple1',
  'Mintegral1',
  'Unity1'
]

export const agencyOptions = ['星达传媒', 'Agency-A', 'Agency-B', 'Agency-C', '直投']

// ─── 代理商管理 Mock 数据 ────────────────────────────────────

import type { AgencyItem } from '../types'

export const mockAgencyList: AgencyItem[] = [
  {
    id: 'AGY-001',
    agencyName: '星达传媒',
    source: 'Meta Ads',
    coopMode: '授权代理',
    managedAccounts: 32,
    monthSpend: 128450,
    expireDate: '2025-01-14',
    status: '已合作',
    contact: '张三',
    email: 'zhang3@xingda.com',
    phone: '+86 138-0000-1234',
    startDate: '2023-01-15',
    remark: '主要负责Meta平台开户',
    activeAccounts: 28,
    pausedAccounts: 4,
    monthRevenue: 8991,
    bcBmList: [
      { name: 'Vegoo主务BC', source: 'Meta Ads', type: 'BC', accountCount: 45, status: '正常' },
      { name: 'Vegoo备用BC', source: 'Meta Ads', type: 'BC', accountCount: 28, status: '正常' }
    ]
  },
  {
    id: 'AGY-002',
    agencyName: '天联广告',
    source: 'Google Ads',
    coopMode: '授权代理',
    managedAccounts: 28,
    monthSpend: 98230,
    expireDate: '2025-06-30',
    status: '已合作',
    contact: '李四',
    email: 'li4@tianlian.com',
    phone: '+86 139-0000-5678',
    startDate: '2022-07-01',
    remark: '',
    activeAccounts: 25,
    pausedAccounts: 3,
    monthRevenue: 6200,
    bcBmList: [
      { name: 'Vegoo Google BM', source: 'Google Ads', type: 'BM', accountCount: 28, status: '正常' }
    ]
  },
  {
    id: 'AGY-003',
    agencyName: '海潮营销',
    source: 'TikTok Ads',
    coopMode: '授权代理',
    managedAccounts: 18,
    monthSpend: 56780,
    expireDate: '2025-12-31',
    status: '已合作',
    contact: '王五',
    email: 'wang5@haichao.com',
    phone: '+86 137-0000-9012',
    startDate: '2023-03-01',
    remark: 'TikTok主要合作商',
    activeAccounts: 16,
    pausedAccounts: 2,
    monthRevenue: 4100,
    bcBmList: [
      { name: 'Vegoo TikTok BC', source: 'TikTok Ads', type: 'BC', accountCount: 18, status: '正常' }
    ]
  },
  {
    id: 'AGY-004',
    agencyName: '亚太传播',
    source: 'Apple Search',
    coopMode: '直接开户',
    managedAccounts: 12,
    monthSpend: 34560,
    expireDate: '2025-09-30',
    status: '已合作',
    contact: '赵六',
    email: 'zhao6@yatai.com',
    phone: '+86 136-0000-3456',
    startDate: '2023-06-01',
    remark: '',
    activeAccounts: 10,
    pausedAccounts: 2,
    monthRevenue: 2800,
    bcBmList: []
  },
  {
    id: 'AGY-005',
    agencyName: '全球联盟',
    source: 'Snapchat Ads',
    coopMode: '授权代理',
    managedAccounts: 8,
    monthSpend: 10430,
    expireDate: '2025-03-31',
    status: '已合作',
    contact: '孙七',
    email: 'sun7@quanqiu.com',
    phone: '+86 135-0000-7890',
    startDate: '2024-04-01',
    remark: '',
    activeAccounts: 7,
    pausedAccounts: 1,
    monthRevenue: 980,
    bcBmList: []
  },
  {
    id: 'AGY-006',
    agencyName: '新兴传媒',
    source: 'Kwai Ads',
    coopMode: '授权代理',
    managedAccounts: 4,
    monthSpend: 0,
    expireDate: '--',
    status: '洽谈中',
    contact: '周八',
    email: 'zhou8@xinxing.com',
    phone: '+86 134-0000-1122',
    startDate: '',
    remark: '正在洽谈合作条款',
    activeAccounts: 0,
    pausedAccounts: 0,
    monthRevenue: 0,
    bcBmList: []
  },
  {
    id: 'AGY-007',
    agencyName: '海外传媒',
    source: 'Meta Ads',
    coopMode: '授权代理',
    managedAccounts: 6,
    monthSpend: 0,
    expireDate: '2024-12-31',
    status: '已终止',
    contact: '吴九',
    email: 'wu9@haiwai.com',
    phone: '+86 133-0000-3344',
    startDate: '2022-01-01',
    remark: '合同到期后未续约',
    activeAccounts: 0,
    pausedAccounts: 6,
    monthRevenue: 0,
    bcBmList: []
  },
  {
    id: 'AGY-008',
    agencyName: '天龙广告',
    source: 'Mintegral',
    coopMode: '直接开户',
    managedAccounts: 16,
    monthSpend: 0,
    expireDate: '2025-08-31',
    status: '已合作',
    contact: '郑十',
    email: 'zheng10@tianlong.com',
    phone: '+86 132-0000-5566',
    startDate: '2023-09-01',
    remark: '',
    activeAccounts: 14,
    pausedAccounts: 2,
    monthRevenue: 1200,
    bcBmList: []
  }
]

export function cloneAgencyMockList(): AgencyItem[] {
  return mockAgencyList.map((item) => ({
    ...item,
    bcBmList: item.bcBmList.map((b) => ({ ...b }))
  }))
}

// ─── 凭据管理 Mock 数据 ───────────────────────────────────────

import type { CredentialItem } from '../types'

export const mockCredentialList: CredentialItem[] = [
  {
    id: 'CRED-001',
    name: 'Facebook1',
    source: 'Meta Ads',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '获取Meta广告成效',
    apps: ['BloodSugar2', 'HealthTracker2'],
    accountCount: 8,
    accountIds: ['ACC-012', 'ACC-034', 'ACC-056', 'ACC-078', 'ACC-091', 'ACC-102', 'ACC-115', 'ACC-127'],
    status: '验证正常',
    lastValidateTime: '03-13 08:00',
    config: {
      account: 'f8smivd72o7u8tuj8.app..t.com',
      password: 'GOCSPX-••••••••',
      clientId: '829887976••••••••',
      clientSecret: '••••••••',
      accessToken: 'EAAKJEMOnM••••••••',
      refreshToken: '••••••••'
    },
    validateHistory: [
      { time: '2026-03-13 08:00', status: '验证成功', trigger: '自动定时', detail: '权限: 广告账户管理员, 广告主' },
      { time: '2026-03-12 08:00', status: '验证成功', trigger: '自动定时' },
      { time: '2026-03-10 14:23', status: '验证成功', trigger: '手动', operator: '张三' },
      { time: '2026-03-07 09:12', status: '验证失败', trigger: '自动定时', detail: 'Token过期' },
      { time: '2026-03-06 08:00', status: '验证成功', trigger: '自动定时' }
    ]
  },
  {
    id: 'CRED-002',
    name: 'AdCost',
    source: 'Google Ads',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '',
    apps: ['WeatherApp', 'BloodSugar2'],
    accountCount: 12,
    accountIds: ['ACC-001', 'ACC-034'],
    status: '验证正常',
    lastValidateTime: '03-13 08:00',
    config: {
      account: 'adcost@vegoo.com',
      clientId: '1094815734••••••••',
      clientSecret: '••••••••',
      accessToken: 'ya29.A0ARrda••••••••',
      refreshToken: '1//0gPi••••••••'
    },
    validateHistory: [
      { time: '2026-03-13 08:00', status: '验证成功', trigger: '自动定时' },
      { time: '2026-03-12 08:00', status: '验证成功', trigger: '自动定时' }
    ]
  },
  {
    id: 'CRED-003',
    name: 'AdCost2',
    source: 'Google Ads',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '',
    apps: ['HealthTracker2'],
    accountCount: 6,
    accountIds: ['ACC-034'],
    status: '验证正常',
    lastValidateTime: '03-13 08:00',
    config: {
      account: 'adcost2@vegoo.com',
      clientId: '2085926845••••••••',
      clientSecret: '••••••••',
      accessToken: 'ya29.B1ARrda••••••••'
    },
    validateHistory: [
      { time: '2026-03-13 08:00', status: '验证成功', trigger: '自动定时' }
    ]
  },
  {
    id: 'CRED-004',
    name: 'TikTok1',
    source: 'TikTok Ads',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '获取TikTok广告成效',
    apps: ['WeatherApp', 'DramaVue'],
    accountCount: 5,
    accountIds: ['ACC-023', 'ACC-045', 'ACC-089'],
    status: '验证失败',
    lastValidateTime: '03-10 08:00',
    config: {
      account: 'tiktok_app@vegoo.com',
      clientId: '7123456789012345678',
      clientSecret: '••••••••',
      accessToken: '••••••••'
    },
    validateHistory: [
      { time: '2026-03-10 08:00', status: '验证失败', trigger: '自动定时', detail: 'Token失效' },
      { time: '2026-03-09 08:00', status: '验证成功', trigger: '自动定时' }
    ]
  },
  {
    id: 'CRED-005',
    name: 'KwaiAdCost1',
    source: 'Kwai Ads',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '',
    apps: ['BloodSugar2'],
    accountCount: 3,
    accountIds: ['ACC-023', 'ACC-045', 'ACC-089'],
    status: '验证失败',
    lastValidateTime: '03-08 08:00',
    config: {
      account: 'kwai_app@vegoo.com',
      clientId: '9823456780••••••••',
      accessToken: '••••••••'
    },
    validateHistory: [
      { time: '2026-03-08 08:00', status: '验证失败', trigger: '自动定时', detail: 'Token失效' }
    ]
  },
  {
    id: 'CRED-006',
    name: 'BigQuery',
    source: 'Google Ads',
    group: 'Google',
    credentialType: '服务号',
    remark: '',
    apps: ['数据平台'],
    accountCount: 1,
    accountIds: [],
    status: '验证正常',
    lastValidateTime: '03-13 08:00',
    config: {
      account: 'bigquery-sa@vegoo.iam.gserviceaccount.com'
    },
    validateHistory: [
      { time: '2026-03-13 08:00', status: '验证成功', trigger: '自动定时' }
    ]
  },
  {
    id: 'CRED-007',
    name: 'Admob',
    source: 'Google Ads',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '',
    apps: ['全部应用'],
    accountCount: 18,
    accountIds: [],
    status: '验证正常',
    lastValidateTime: '03-13 08:00',
    config: {
      account: 'admob@vegoo.com',
      clientId: '3076037956••••••••',
      accessToken: 'ya29.C2ARrda••••••••'
    },
    validateHistory: [
      { time: '2026-03-13 08:00', status: '验证成功', trigger: '自动定时' }
    ]
  },
  {
    id: 'CRED-008',
    name: 'MintegralAdCost1',
    source: 'Mintegral',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '',
    apps: ['BloodSugar2'],
    accountCount: 4,
    accountIds: [],
    status: '待验证',
    lastValidateTime: '--',
    config: {
      account: 'mintegral@vegoo.com',
      clientId: '4512••••••••',
      accessToken: '••••••••'
    },
    validateHistory: []
  },
  {
    id: 'CRED-009',
    name: 'NewsBreakCost1',
    source: 'Snapchat Ads',
    group: 'Google',
    credentialType: '客户端Token',
    remark: '',
    apps: ['WeatherApp'],
    accountCount: 2,
    accountIds: [],
    status: '验证正常',
    lastValidateTime: '03-13 08:00',
    config: {
      account: 'newsbreak@vegoo.com',
      accessToken: '••••••••'
    },
    validateHistory: [
      { time: '2026-03-13 08:00', status: '验证成功', trigger: '自动定时' }
    ]
  }
]

export function cloneCredentialMockList(): CredentialItem[] {
  return mockCredentialList.map((item) => ({
    ...item,
    apps: [...item.apps],
    accountIds: [...item.accountIds],
    config: { ...item.config },
    validateHistory: item.validateHistory.map((h) => ({ ...h }))
  }))
}

export const credentialGroupOptions = ['Google', 'Meta', 'TikTok', 'Global']

// ─── 开户管理 Mock 数据 ───────────────────────────────────────

import type { OpenAccountItem } from '../types'

export const mockOpenAccountList: OpenAccountItem[] = [
  {
    id: 'OA-001', source: 'Meta Ads', app: 'BloodSugar2', platform: '安卓',
    accountType: '企业户', agency: '星达传媒', amount: 500, applicant: '张三',
    registerTime: '2024-01-28 10:32', status: '已激活', remark: '主力美国市场',
    adAccountId: 'act_123456789', adAccountName: 'Vegoo-Meta-001',
    activateTime: '2024-01-28 16:45', credential: 'Facebook1', credentialStatus: '验证正常',
    feishuRecords: [
      { time: '2024-01-28 16:45', event: '开户已激活', result: '成功', target: '广告账户群, @张三' },
      { time: '2024-01-28 11:00', event: '凭据分配', result: '成功', target: '@张三' },
      { time: '2024-01-28 10:32', event: '开户登记入', result: '成功', target: '广告账户群' }
    ]
  },
  {
    id: 'OA-002', source: 'Google Ads', app: 'HealthTracker2', platform: '安卓',
    accountType: '企业户', agency: '天联广告', amount: 1000, applicant: '李四',
    registerTime: '2024-01-29', status: '已激活', remark: '',
    adAccountId: 'act_234567890', adAccountName: 'Vegoo-Google-001',
    activateTime: '2024-01-29 14:00', credential: 'AdCost', credentialStatus: '验证正常',
    feishuRecords: [
      { time: '2024-01-29 14:00', event: '开户已激活', result: '成功', target: '广告账户群' }
    ]
  },
  {
    id: 'OA-003', source: 'TikTok Ads', app: 'WeatherApp', platform: '安卓',
    accountType: '企业户', agency: '海潮营销', amount: 500, applicant: '王五',
    registerTime: '2024-01-30', status: '已激活', remark: '',
    adAccountId: 'act_345678901', adAccountName: 'Vegoo-TikTok-001',
    activateTime: '2024-01-30 15:30', credential: 'TikTok1', credentialStatus: '验证失败',
    feishuRecords: [
      { time: '2024-01-30 15:30', event: '开户已激活', result: '成功', target: '广告账户群' }
    ]
  },
  {
    id: 'OA-004', source: 'Meta Ads', app: 'DramaVue', platform: '安卓',
    accountType: '企业户', agency: '星达传媒', amount: 500, applicant: '张三',
    registerTime: '2024-01-30', status: '已激活', remark: '',
    adAccountId: 'act_456789012', adAccountName: 'Vegoo-Meta-002',
    activateTime: '2024-01-30 16:00', credential: 'Facebook1', credentialStatus: '验证正常',
    feishuRecords: [
      { time: '2024-01-30 16:00', event: '开户已激活', result: '成功', target: '@张三' }
    ]
  },
  {
    id: 'OA-005', source: 'Apple Search', app: 'FaceMe', platform: 'iOS',
    accountType: '企业户', agency: '亚太传播', amount: 2000, applicant: '李四',
    registerTime: '2024-01-31', status: '已激活', remark: '',
    adAccountId: 'act_567890123', adAccountName: 'Vegoo-Apple-001',
    activateTime: '2024-01-31 10:00', credential: 'Apple1', credentialStatus: '验证正常',
    feishuRecords: [
      { time: '2024-01-31 10:00', event: '开户已激活', result: '成功', target: '广告账户群' }
    ]
  },
  {
    id: 'OA-006', source: 'Snapchat Ads', app: 'BloodSugar2', platform: '安卓',
    accountType: '企业户', agency: '全球联盟', amount: 300, applicant: '王五',
    registerTime: '2024-01-31', status: '已激活', remark: '',
    adAccountId: 'act_678901234', adAccountName: 'Vegoo-Snap-001',
    activateTime: '2024-01-31 11:30', credential: 'NewsBreakCost1', credentialStatus: '验证正常',
    feishuRecords: [
      { time: '2024-01-31 11:30', event: '开户已激活', result: '成功', target: '@王五' }
    ]
  },
  {
    id: 'OA-007', source: 'Kwai Ads', app: 'PhoneTracker2', platform: '安卓',
    accountType: '企业户', agency: '新兴传媒', amount: 200, applicant: '张三',
    registerTime: '2024-01-28', status: '开户失败', remark: '审核未通过',
    feishuRecords: [
      { time: '2024-01-28 12:00', event: '开户失败', result: '成功', target: '@张三' }
    ]
  },
  {
    id: 'OA-008', source: 'Google Ads', app: 'WeatherApp', platform: 'iOS',
    accountType: '企业户', agency: '天联广告', amount: 1000, applicant: '李四',
    registerTime: '2024-02-01', status: '待分配', remark: '',
    adAccountId: 'act_987654321', adAccountName: 'Vegoo-Google-iOS-003',
    feishuRecords: [
      { time: '2024-02-01 09:00', event: '开户登记', result: '成功', target: '广告账户群' }
    ]
  },
  {
    id: 'OA-009', source: 'Mintegral', app: 'BloodSugar2', platform: '安卓',
    accountType: '企业户', agency: '天龙广告', amount: 800, applicant: '张三',
    registerTime: '2024-02-03', status: '待分配', remark: '',
    adAccountId: 'act_876543210', adAccountName: 'Vegoo-MTG-001',
    feishuRecords: []
  }
]

export function cloneOpenAccountMockList(): OpenAccountItem[] {
  return mockOpenAccountList.map((item) => ({
    ...item,
    feishuRecords: item.feishuRecords.map((r) => ({ ...r }))
  }))
}
