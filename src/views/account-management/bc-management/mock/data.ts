import type { BcItem } from '@/views/config-management/account-management/types'

export const bcStatusOptions = [
  { label: '全部', value: '' },
  { label: '健康', value: '健康' },
  { label: '可用', value: '可用' },
  { label: '不再使用', value: '不再使用' },
  { label: '封禁', value: '封禁' },
  { label: '其他', value: '其他' }
]

export const bcOwnerTypeOptions = [
  { label: '全部', value: '' },
  { label: '企业户', value: '企业户' },
  { label: '个人户', value: '个人户' },
  { label: '小额广告户', value: '小额广告户' }
]

export const bcBanRecordOptions = [
  { label: '全部', value: '' },
  { label: '有封户记录', value: '有' },
  { label: '无封户记录', value: '无' }
]

export const mockBcList: BcItem[] = [
  {
    id: 'BM-101',
    bmId: '823456789012345',
    bmName: 'Vegoo主务BC',
    source: 'Meta Ads',
    group: 'Google组',
    status: '健康',
    ownerType: '企业户',
    manager: '张三',
    banRecord: '无',
    banDesc: '',
    createTime: '2025-12-15',
    remark: '主投放账户组',
    linkedAccounts: 45,
    activeAccounts: 41,
    inactiveAccounts: 4,
    monthSpend: 128450,
    monthOpenCount: 8
  },
  {
    id: 'BM-102',
    bmId: '834567890123456',
    bmName: 'Agency-A-BM',
    source: 'Meta Ads',
    group: 'Agency-A组',
    status: '可用',
    ownerType: '企业户',
    manager: '李四',
    banRecord: '有',
    banDesc: '历史封户已解封',
    createTime: '2026-01-08',
    remark: '',
    linkedAccounts: 26,
    activeAccounts: 22,
    inactiveAccounts: 4,
    monthSpend: 78320,
    monthOpenCount: 4
  },
  {
    id: 'BM-103',
    bmId: '845678901234567',
    bmName: 'TT-主务BM',
    source: 'TikTok Ads',
    group: 'TikTok组',
    status: '封禁',
    ownerType: '小额广告户',
    manager: '王五',
    banRecord: '有',
    banDesc: '风控封禁',
    createTime: '2026-01-22',
    remark: '',
    linkedAccounts: 10,
    activeAccounts: 0,
    inactiveAccounts: 10,
    monthSpend: 0,
    monthOpenCount: 0
  },
  {
    id: 'BM-104',
    bmId: '856789012345678',
    bmName: '备用BM-01',
    source: 'Meta Ads',
    group: '备用组',
    status: '不再使用',
    ownerType: '个人户',
    manager: '赵六',
    banRecord: '无',
    banDesc: '',
    createTime: '2025-08-01',
    remark: '历史备用',
    linkedAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    monthSpend: 0,
    monthOpenCount: 0
  },
  {
    id: 'BM-105',
    bmId: '867890123456789',
    bmName: 'TT-实验BM',
    source: 'TikTok Ads',
    group: '实验组',
    status: '其他',
    ownerType: '企业户',
    manager: '孙七',
    banRecord: '无',
    banDesc: '',
    createTime: '2026-02-11',
    remark: '灰度实验',
    linkedAccounts: 6,
    activeAccounts: 5,
    inactiveAccounts: 1,
    monthSpend: 12430,
    monthOpenCount: 1
  }
]

export function cloneBcManagementMockList(): BcItem[] {
  return mockBcList.map((i) => ({ ...i }))
}
