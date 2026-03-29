/**
 * 权限管理页 - 假数据（左侧角色列表、中间列权限模块、右侧用户列表、权限摘要）
 * 后续接入真实接口后可移除此文件或改为接口数据
 */

/** 角色列表项（与 Api.SystemManage.RoleListItem 结构一致，用于接口无数据时兜底） */
export interface MockRoleListItem {
  roleId: number
  roleName: string
  roleCode: string
  description: string
  enabled: boolean
  createTime: string
}

/** 左侧 - 角色列表假数据（接口无数据或失败时使用，保证中间/右侧列能展示） */
export const MOCK_ROLE_LIST: MockRoleListItem[] = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleCode: 'super_admin',
    description: '系统最高权限',
    enabled: true,
    createTime: '2025-01-01 00:00:00'
  },
  {
    roleId: 2,
    roleName: 'CEO管理',
    roleCode: 'ceo',
    description: '经营决策时图',
    enabled: true,
    createTime: '2025-01-01 00:00:00'
  },
  {
    roleId: 3,
    roleName: '投放人员',
    roleCode: 'delivery',
    description: '投放操作与分析',
    enabled: true,
    createTime: '2025-01-01 00:00:00'
  },
  {
    roleId: 4,
    roleName: '变现人员',
    roleCode: 'revenue',
    description: '变现数据分析与配置',
    enabled: true,
    createTime: '2025-01-01 00:00:00'
  },
  {
    roleId: 5,
    roleName: '素材设计师',
    roleCode: 'material',
    description: '素材上传于管理',
    enabled: true,
    createTime: '2025-01-01 00:00:00'
  },
  {
    roleId: 6,
    roleName: '运营维护',
    roleCode: 'ops',
    description: '系统配置与维护',
    enabled: true,
    createTime: '2025-01-01 00:00:00'
  }
]

/** 功能权限模块项 */
export interface MockPermissionItem {
  key: string
  name: string
  view: string
  operation: string
  dataScope: string
}

/** 功能权限模块 */
export interface MockPermissionModule {
  key: string
  name: string
  enabled: boolean
  viewCount: number
  opCount: number
  dataScopeText: string
  permissions: MockPermissionItem[]
}

/** 中间列 - 权限配置假数据 */
export const MOCK_PERMISSION_MODULES: MockPermissionModule[] = [
  {
    key: 'cockpit',
    name: '经营驾驶舱',
    enabled: true,
    viewCount: 5,
    opCount: 2,
    dataScopeText: '全部应用',
    permissions: [
      { key: '1', name: '查看核心KPI指标', view: '查看', operation: '—', dataScope: '全部应用' },
      { key: '2', name: '导出报表', view: '查看', operation: '操作', dataScope: '仅自己负责的' },
      { key: '3', name: '删除报表', view: '×禁止', operation: '×禁止', dataScope: '×禁止' }
    ]
  },
  {
    key: 'delivery',
    name: '投放管理',
    enabled: true,
    viewCount: 6,
    opCount: 3,
    dataScopeText: '全部',
    permissions: [
      { key: '1', name: '查看广告系列列表', view: '查看', operation: '—', dataScope: '全部' },
      { key: '2', name: '创建广告系列', view: '—', operation: '操作', dataScope: '仅自己创建的' },
      { key: '3', name: '删除广告', view: '—', operation: '×禁止', dataScope: '仅自己负责的' }
    ]
  },
  {
    key: 'revenue',
    name: '变现管理',
    enabled: false,
    viewCount: 5,
    opCount: 0,
    dataScopeText: '只读',
    permissions: []
  },
  {
    key: 'material',
    name: '素材管理',
    enabled: true,
    viewCount: 4,
    opCount: 2,
    dataScopeText: '全部素材',
    permissions: [
      { key: '1', name: '查看素材库', view: '查看', operation: '—', dataScope: '全部素材' },
      { key: '2', name: '上传素材', view: '—', operation: '操作', dataScope: '仅自己上传的' },
      { key: '3', name: '删除素材', view: '—', operation: '操作', dataScope: '仅自己上传的' }
    ]
  },
  {
    key: 'analytics',
    name: '数据分析',
    enabled: false,
    viewCount: 3,
    opCount: 1,
    dataScopeText: '—',
    permissions: [{ key: '1', name: '查看报表', view: '查看', operation: '—', dataScope: '—' }]
  },
  {
    key: 'system',
    name: '系统管理',
    enabled: false,
    viewCount: 0,
    opCount: 0,
    dataScopeText: '全部禁止',
    permissions: []
  }
]

/** 右侧 - 角色用户项假数据 */
export interface MockRoleUserItem {
  id: string | number
  userName: string
  userEmail: string
  avatarText: string
  statusText: string
  statusClass: string
  lastActive: string
  isLast?: boolean
}

/** 按角色 ID 的用户列表假数据（未传 roleId 时用默认列表） */
const MOCK_USERS_BY_ROLE: Record<number, MockRoleUserItem[]> = {
  1: [
    {
      id: '1',
      userName: '管理员',
      userEmail: 'admin@vegoo.com',
      avatarText: 'GL',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-03-08',
      isLast: true
    }
  ],
  2: [
    {
      id: '2',
      userName: '赵总',
      userEmail: 'zhao@vegoo.com',
      avatarText: 'ZZ',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-03-07'
    },
    {
      id: '3',
      userName: '钱经理',
      userEmail: 'qian@vegoo.com',
      avatarText: 'QJ',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-03-06'
    },
    {
      id: '4',
      userName: '孙助理',
      userEmail: 'sun@vegoo.com',
      avatarText: 'SZ',
      statusText: '离线',
      statusClass: 'status-dot--offline',
      lastActive: '2026-03-05',
      isLast: true
    }
  ],
  3: [
    {
      id: '5',
      userName: '张三',
      userEmail: 'zhangsan@vegoo.com',
      avatarText: 'ZS',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-01-15'
    },
    {
      id: '6',
      userName: '李四',
      userEmail: 'lisi@vegoo.com',
      avatarText: 'LS',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-01-10'
    },
    {
      id: '7',
      userName: '王五',
      userEmail: 'wangwu@vegoo.com',
      avatarText: 'WW',
      statusText: '离线',
      statusClass: 'status-dot--offline',
      lastActive: '2026-01-08',
      isLast: true
    }
  ],
  4: [
    {
      id: '8',
      userName: '周六',
      userEmail: 'zhouliu@vegoo.com',
      avatarText: 'ZL',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-02-20'
    },
    {
      id: '9',
      userName: '吴七',
      userEmail: 'wuqi@vegoo.com',
      avatarText: 'WQ',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-02-18',
      isLast: true
    }
  ],
  5: [
    {
      id: '10',
      userName: '郑八',
      userEmail: 'zhenba@vegoo.com',
      avatarText: 'ZB',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-02-15'
    },
    {
      id: '11',
      userName: '王九',
      userEmail: 'wangjiu@vegoo.com',
      avatarText: 'WJ',
      statusText: '离线',
      statusClass: 'status-dot--offline',
      lastActive: '2026-02-10',
      isLast: true
    }
  ],
  6: [
    {
      id: '12',
      userName: '冯十',
      userEmail: 'fengshi@vegoo.com',
      avatarText: 'FS',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-03-01'
    },
    {
      id: '13',
      userName: '陈十一',
      userEmail: 'chen11@vegoo.com',
      avatarText: 'CS',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-02-28',
      isLast: true
    }
  ]
}

const DEFAULT_MOCK_USERS: MockRoleUserItem[] = [
  {
    id: '1',
    userName: '张三',
    userEmail: 'zhangsan@vegoo.com',
    avatarText: 'ZS',
    statusText: '活跃',
    statusClass: 'status-dot--active',
    lastActive: '2026-01-15'
  },
  {
    id: '2',
    userName: '李四',
    userEmail: 'lisi@vegoo.com',
    avatarText: 'LS',
    statusText: '活跃',
    statusClass: 'status-dot--active',
    lastActive: '2026-01-10'
  },
  {
    id: '3',
    userName: '王五',
    userEmail: 'wangwu@vegoo.com',
    avatarText: 'WW',
    statusText: '离线',
    statusClass: 'status-dot--offline',
    lastActive: '2026-01-08',
    isLast: true
  }
]

export function getMockRoleUsers(roleId: number | undefined): MockRoleUserItem[] {
  if (roleId !== undefined && MOCK_USERS_BY_ROLE[roleId]) {
    return MOCK_USERS_BY_ROLE[roleId]
  }
  return DEFAULT_MOCK_USERS
}

/** 权限摘要项 */
export interface MockPermissionSummaryRole {
  roleId: number
  roleName: string
  percent: number
  isCurrent?: boolean
}

export interface MockPermissionSummary {
  funcEnabled: number
  funcTotal: number
  dataScope: string
  percent: number
  rolePercentList: MockPermissionSummaryRole[]
}

/** 按角色 ID 的权限摘要假数据 */
const MOCK_SUMMARY_BY_ROLE: Record<
  number,
  Omit<MockPermissionSummary, 'rolePercentList'> & {
    rolePercentList: (currentRoleId: number) => MockPermissionSummaryRole[]
  }
> = {
  1: {
    funcEnabled: 58,
    funcTotal: 58,
    dataScope: '全部',
    percent: 100,
    rolePercentList: (currentRoleId) => [
      { roleId: 1, roleName: '超级管理员', percent: 100, isCurrent: currentRoleId === 1 },
      { roleId: 2, roleName: 'CEO管理', percent: 85 },
      { roleId: 3, roleName: '投放人员', percent: 55 },
      { roleId: 4, roleName: '变现人员', percent: 40 },
      { roleId: 5, roleName: '素材设计师', percent: 35 },
      { roleId: 6, roleName: '运营维护', percent: 30 }
    ]
  },
  2: {
    funcEnabled: 49,
    funcTotal: 58,
    dataScope: '较宽范围',
    percent: 85,
    rolePercentList: (currentRoleId) => [
      { roleId: 1, roleName: '超级管理员', percent: 100 },
      { roleId: 2, roleName: 'CEO管理', percent: 85, isCurrent: currentRoleId === 2 },
      { roleId: 3, roleName: '投放人员', percent: 55 },
      { roleId: 4, roleName: '变现人员', percent: 40 },
      { roleId: 5, roleName: '素材设计师', percent: 35 },
      { roleId: 6, roleName: '运营维护', percent: 30 }
    ]
  },
  3: {
    funcEnabled: 32,
    funcTotal: 58,
    dataScope: '中等范围',
    percent: 55,
    rolePercentList: (currentRoleId) => [
      { roleId: 1, roleName: '超级管理员', percent: 100 },
      { roleId: 2, roleName: 'CEO管理', percent: 85 },
      { roleId: 3, roleName: '投放人员', percent: 55, isCurrent: currentRoleId === 3 },
      { roleId: 4, roleName: '变现人员', percent: 40 },
      { roleId: 5, roleName: '素材设计师', percent: 35 },
      { roleId: 6, roleName: '运营维护', percent: 30 }
    ]
  },
  4: {
    funcEnabled: 23,
    funcTotal: 58,
    dataScope: '中等范围',
    percent: 40,
    rolePercentList: (currentRoleId) => [
      { roleId: 1, roleName: '超级管理员', percent: 100 },
      { roleId: 2, roleName: 'CEO管理', percent: 85 },
      { roleId: 3, roleName: '投放人员', percent: 55 },
      { roleId: 4, roleName: '变现人员', percent: 40, isCurrent: currentRoleId === 4 },
      { roleId: 5, roleName: '素材设计师', percent: 35 },
      { roleId: 6, roleName: '运营维护', percent: 30 }
    ]
  },
  5: {
    funcEnabled: 20,
    funcTotal: 58,
    dataScope: '部分素材',
    percent: 35,
    rolePercentList: (currentRoleId) => [
      { roleId: 1, roleName: '超级管理员', percent: 100 },
      { roleId: 2, roleName: 'CEO管理', percent: 85 },
      { roleId: 3, roleName: '投放人员', percent: 55 },
      { roleId: 4, roleName: '变现人员', percent: 40 },
      { roleId: 5, roleName: '素材设计师', percent: 35, isCurrent: currentRoleId === 5 },
      { roleId: 6, roleName: '运营维护', percent: 30 }
    ]
  },
  6: {
    funcEnabled: 17,
    funcTotal: 58,
    dataScope: '受限',
    percent: 30,
    rolePercentList: (currentRoleId) => [
      { roleId: 1, roleName: '超级管理员', percent: 100 },
      { roleId: 2, roleName: 'CEO管理', percent: 85 },
      { roleId: 3, roleName: '投放人员', percent: 55 },
      { roleId: 4, roleName: '变现人员', percent: 40 },
      { roleId: 5, roleName: '素材设计师', percent: 35 },
      { roleId: 6, roleName: '运营维护', percent: 30, isCurrent: currentRoleId === 6 }
    ]
  }
}

const DEFAULT_SUMMARY: MockPermissionSummary = {
  funcEnabled: 32,
  funcTotal: 58,
  dataScope: '中等范围',
  percent: 55,
  rolePercentList: [
    { roleId: 1, roleName: '超级管理员', percent: 100 },
    { roleId: 2, roleName: 'CEO管理', percent: 85 },
    { roleId: 3, roleName: '投放人员', percent: 55, isCurrent: true },
    { roleId: 4, roleName: '变现人员', percent: 40 },
    { roleId: 5, roleName: '素材设计师', percent: 35 },
    { roleId: 6, roleName: '运营维护', percent: 30 }
  ]
}

export function getMockPermissionSummary(roleId: number | undefined): MockPermissionSummary {
  if (roleId !== undefined && MOCK_SUMMARY_BY_ROLE[roleId]) {
    const base = MOCK_SUMMARY_BY_ROLE[roleId]
    return {
      ...base,
      rolePercentList: base.rolePercentList(roleId)
    }
  }
  return DEFAULT_SUMMARY
}

/** 角色说明假数据（按角色名或编码匹配，未匹配时用默认） */
const MOCK_ROLE_DESCRIPTIONS: Record<string, string> = {
  超级管理员: '系统最高权限，可访问全部功能与数据。',
  CEO管理: '经营决策相关权限，可查看全局报表与核心指标。',
  投放人员:
    '可查看所有投放数据，可创建和编辑自己负责的广告系列，可调整预算，但不能删除广告，不能访问变现配置和系统管理功能。',
  变现人员: '可查看变现数据与配置，可调整变现策略，不可修改系统配置。',
  素材设计师: '可上传与管理素材，可查看投放与素材使用情况。',
  运营维护: '系统配置与维护权限，可管理基础设置与部分运维功能。'
}

const DEFAULT_ROLE_DESCRIPTION =
  '可查看所有投放数据，可创建和编辑自己负责的广告系列，可调整预算，但不能删除广告，不能访问变现配置和系统管理功能。'

export function getMockRoleDescription(roleName: string | undefined): string {
  if (roleName && MOCK_ROLE_DESCRIPTIONS[roleName]) {
    return MOCK_ROLE_DESCRIPTIONS[roleName]
  }
  return DEFAULT_ROLE_DESCRIPTION
}
