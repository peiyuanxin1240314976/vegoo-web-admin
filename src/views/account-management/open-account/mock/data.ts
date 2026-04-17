import type { SubjectSettingItem } from '../types'

export const subjectSettingMockData: SubjectSettingItem[] = [
  {
    subjectId: 'SUBJ-HK-001',
    subjectName: 'Vegoo Hong Kong Limited',
    businessLicense: 'oss://licenses/vegoo-hk-001.pdf',
    facebookEnabled: true,
    facebookRemark: '香港主体可直接用于 Meta 开户，优先投放港澳台地区。',
    tiktokEnabled: true,
    tiktokRemark: 'TikTok 可开户，需提前确认结算主体一致。',
    inputTime: '2026-04-12 10:00:00',
    creatorId: 1001,
    createTime: '2026-04-12 10:00:00',
    updaterId: 1003,
    updateTime: '2026-04-17 09:24:00'
  },
  {
    subjectId: 'SUBJ-US-002',
    subjectName: 'Vegoo Media LLC',
    businessLicense: 'oss://licenses/vegoo-us-002.pdf',
    facebookEnabled: true,
    facebookRemark: '美国主体适合做主投账户，历史稳定性较好。',
    tiktokEnabled: false,
    tiktokRemark: '暂未开放，等待补充税务文件。',
    inputTime: '2026-04-10 14:30:00',
    creatorId: 1002,
    createTime: '2026-04-10 14:30:00',
    updaterId: 1002,
    updateTime: '2026-04-16 18:20:00'
  },
  {
    subjectId: 'SUBJ-SG-003',
    subjectName: 'Vegoo Growth SG Pte. Ltd.',
    businessLicense: '',
    facebookEnabled: false,
    facebookRemark: '执照待补充，目前不建议发起开户。',
    tiktokEnabled: true,
    tiktokRemark: '新加坡主体适配东南亚投放，可优先申请 TikTok。',
    inputTime: '2026-04-08 11:15:00',
    creatorId: 1004,
    createTime: '2026-04-08 11:15:00',
    updaterId: 1005,
    updateTime: '2026-04-15 13:40:00'
  },
  {
    subjectId: 'SUBJ-AE-004',
    subjectName: 'Vegoo Digital FZ-LLC',
    businessLicense: '',
    facebookEnabled: false,
    facebookRemark: '',
    tiktokEnabled: false,
    tiktokRemark: '',
    inputTime: '2026-04-05 16:20:00',
    creatorId: 1006,
    createTime: '2026-04-05 16:20:00',
    updaterId: 1006,
    updateTime: '2026-04-14 17:05:00'
  }
]

export function cloneSubjectSettingMockData() {
  return subjectSettingMockData.map((item) => ({ ...item }))
}
