import type { UserItem, UserRole } from '../types'

export const USER_ROLE_OPTIONS: { label: UserRole; value: UserRole }[] = [
  { label: '管理层/老板', value: '管理层/老板' },
  { label: '投放人员', value: '投放人员' },
  { label: '变现人员', value: '变现人员' },
  { label: '素材设计师', value: '素材设计师' },
  { label: '运营维护', value: '运营维护' }
]

export const userRoleOptions = USER_ROLE_OPTIONS

export const USER_APP_OPTIONS = [
  { label: 'Weather1', value: 'Weather1' },
  { label: 'Weather2', value: 'Weather2' },
  { label: 'Finance Pro', value: 'Finance Pro' },
  { label: 'Fitness App', value: 'Fitness App' },
  { label: 'Travel Guide', value: 'Travel Guide' }
]

export const userAppOptions = USER_APP_OPTIONS

const USER_MOCK_SEED: UserItem[] = [
  {
    id: 'u001',
    userName: '张三',
    email: 'zhangsan@vegoo.com',
    avatarColor: '#F97316',
    role: '管理层/老板',
    status: '活跃',
    lastLogin: '2小时前',
    joinTime: '2024-01-15',
    accessibleApps: ['Weather1', 'Weather2', 'Finance Pro'],
    remark: ''
  },
  {
    id: 'u002',
    userName: '李四',
    email: 'lisi@vegoo.com',
    avatarColor: '#10B981',
    role: '投放人员',
    status: '活跃',
    lastLogin: '30分钟前',
    joinTime: '2024-01-20',
    accessibleApps: ['Weather1', 'Weather2'],
    remark:
      '这是一个备注/这是一个备注/这是一个备注/这是一个备注/这是一个备注/这是一个备注/这是一个备注/这是一个备注/这是一个备注/这是一个备注/'
  },
  {
    id: 'u003',
    userName: '王五',
    email: 'wangwu@vegoo.com',
    avatarColor: '#3B82F6',
    role: '投放人员',
    status: '活跃',
    lastLogin: '1天前',
    joinTime: '2024-02-01',
    accessibleApps: ['Weather1'],
    remark: ''
  },
  {
    id: 'u004',
    userName: '赵六',
    email: 'zhaoliu@vegoo.com',
    avatarColor: '#10B981',
    role: '变现人员',
    status: '活跃',
    lastLogin: '3小时前',
    joinTime: '2024-01-25',
    accessibleApps: ['Finance Pro'],
    remark: ''
  },
  {
    id: 'u005',
    userName: '孙七',
    email: 'sunqi@vegoo.com',
    avatarColor: '#8B5CF6',
    role: '素材设计师',
    status: '活跃',
    lastLogin: '2天前',
    joinTime: '2024-02-05',
    accessibleApps: ['Weather1', 'Weather2'],
    remark: ''
  },
  {
    id: 'u006',
    userName: '周八',
    email: 'zhouba@vegoo.com',
    avatarColor: '#64748B',
    role: '运营维护',
    status: '待激活',
    lastLogin: '未登录',
    joinTime: '2024-02-20',
    accessibleApps: [],
    remark: ''
  },
  {
    id: 'u007',
    userName: '吴九',
    email: 'wujiu@vegoo.com',
    avatarColor: '#EF4444',
    role: '投放人员',
    status: '已禁用',
    lastLogin: '1月前',
    joinTime: '2024-01-10',
    accessibleApps: ['Weather1'],
    remark: ''
  },
  {
    id: 'u008',
    userName: '郑十',
    email: 'zhengshi@vegoo.com',
    avatarColor: '#F97316',
    role: '管理层/老板',
    status: '活跃',
    lastLogin: '5小时前',
    joinTime: '2024-01-12',
    accessibleApps: ['Weather1', 'Weather2', 'Finance Pro', 'Fitness App'],
    remark: ''
  }
]

export function cloneUserMockList(): UserItem[] {
  return JSON.parse(JSON.stringify(USER_MOCK_SEED))
}
