import type { AppAssignmentItem, PerformanceVersion } from '../types'

// ─── 公共绩效版本模板 ────────────────────────────────────────────────────────

const makeVersions = (
  targetRates: [string, string, string],
  minRates: [string, string, string]
): PerformanceVersion[] => [
  {
    id: 'v3',
    version: 'v3',
    status: '已发布',
    isActive: true,
    date: '2024-03-15',
    creator: '张三',
    evalMethod: 'ROI',
    evalDays: 3,
    targetRate: targetRates[2],
    minRate: minRates[2],
    difficulty: 1.2,
    minProfit: '-',
    extraCondition: '-'
  },
  {
    id: 'v2',
    version: 'v2',
    status: '已发布',
    isActive: false,
    date: '2024-03-10',
    creator: '李四',
    evalMethod: 'ROI',
    evalDays: 3,
    targetRate: targetRates[1],
    minRate: minRates[1],
    difficulty: 1.1,
    minProfit: '-',
    extraCondition: '-'
  },
  {
    id: 'v1',
    version: 'v1',
    status: '已归档',
    isActive: false,
    date: '2024-03-01',
    creator: '王五',
    evalMethod: 'ROI',
    evalDays: 3,
    targetRate: targetRates[0],
    minRate: minRates[0],
    difficulty: 1.0,
    minProfit: '-',
    extraCondition: '-'
  }
]

const weather8Versions = makeVersions(['47%', '50%', '53%'], ['44%', '47%', '50%'])

const healthVersions = makeVersions(['40%', '44%', '48%'], ['37%', '41%', '45%'])

const defaultVersions = (draft = false): PerformanceVersion[] => [
  {
    id: 'v2',
    version: 'v2',
    status: draft ? '草稿' : '已发布',
    isActive: !draft,
    date: '2024-02-20',
    creator: '张三',
    evalMethod: 'ROI',
    evalDays: 3,
    targetRate: '45%',
    minRate: '42%',
    difficulty: 1.0,
    minProfit: '-',
    extraCondition: '-'
  },
  {
    id: 'v1',
    version: 'v1',
    status: '已归档',
    isActive: false,
    date: '2024-02-01',
    creator: '李四',
    evalMethod: 'ROI',
    evalDays: 3,
    targetRate: '40%',
    minRate: '38%',
    difficulty: 1.0,
    minProfit: '-',
    extraCondition: '-'
  }
]

// ─── 分配列表 ────────────────────────────────────────────────────────────────

export const assignmentMockList: AppAssignmentItem[] = [
  {
    id: 'asgn-001',
    appName: 'Weather8',
    appId: 'Weather8A',
    iconColor: '#a78bfa',
    platform: 'Android',
    adPlatform: 'Facebook',
    optimizer: '张三',
    configVersionId: 'v3',
    configVersionLabel: 'v3 已发布',
    assignTime: '2024-03-15',
    effectiveTime: '2024-03-15',
    status: '活跃',
    operator: '管理员A',
    note: '负责Weather8-Facebook投放优化',
    availableVersions: weather8Versions,
    changeLogs: [
      {
        id: 'log-001-3',
        time: '2024-03-15 10:30:22',
        type: '配置变更',
        operator: '管理员A',
        content: '绩效配置版本变更：v2 → v3（已发布）',
        note: '-',
        status: '有效'
      },
      {
        id: 'log-001-2',
        time: '2024-03-10 09:15:44',
        type: '优化师变更',
        operator: '管理员A',
        content: '负责优化师：李四 → 张三',
        note: '工作调动',
        status: '有效'
      },
      {
        id: 'log-001-5',
        time: '2024-03-08 16:20:11',
        type: '配置变更',
        operator: '管理员B',
        content: '绩效配置版本变更：v1 → v2（已发布）',
        note: '第一季度调整',
        status: '有效'
      },
      {
        id: 'log-001-4',
        time: '2024-03-05 11:00:00',
        type: '备注更新',
        operator: '管理员A',
        content: '分配备注更新：无 → "负责Weather8-Facebook投放优化"',
        note: '-',
        status: '有效'
      },
      {
        id: 'log-001-1',
        time: '2024-03-01 14:00:33',
        type: '初始分配',
        operator: '管理员B',
        content: '初始分配：应用 Weather8-安卓-Facebook 分配给 李四，使用 v1 配置',
        note: '-',
        status: '有效'
      },
      {
        id: 'log-001-del',
        time: '2024-02-20 09:30:15',
        type: '已删除',
        operator: '管理员A',
        content: '绩效配置版本：v1 → v1（草稿）',
        note: '操作错误，已撤销',
        status: '已删除'
      }
    ]
  },
  {
    id: 'asgn-002',
    appName: 'Weather8',
    appId: 'Weather8A',
    iconColor: '#a78bfa',
    platform: 'Android',
    adPlatform: 'Google',
    optimizer: '李四',
    configVersionId: 'v2',
    configVersionLabel: 'v2 已发布',
    assignTime: '2024-03-10',
    effectiveTime: '2024-03-10',
    status: '活跃',
    operator: '管理员A',
    note: 'Weather8 Google渠道投放',
    availableVersions: weather8Versions,
    changeLogs: [
      {
        id: 'log-002-1',
        time: '2024-03-10 09:00:00',
        type: '初始分配',
        operator: '管理员A',
        content: '初始分配：应用 Weather8-安卓-Google 分配给 李四，使用 v2 配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-003',
    appName: 'BloodSugar2',
    appId: 'HealthBS2A',
    iconColor: '#f97316',
    platform: 'Android',
    adPlatform: 'Google',
    optimizer: '王五',
    configVersionId: 'v2',
    configVersionLabel: 'v2 已发布',
    assignTime: '2024-03-08',
    effectiveTime: '2024-03-08',
    status: '活跃',
    operator: '管理员B',
    note: '',
    availableVersions: healthVersions,
    changeLogs: [
      {
        id: 'log-003-1',
        time: '2024-03-08 10:00:00',
        type: '初始分配',
        operator: '管理员B',
        content: '初始分配：应用 BloodSugar2-安卓-Google 分配给 王五，使用 v2 配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-004',
    appName: 'PhoneTracker',
    appId: 'PhoneTrackerA',
    iconColor: '#8b5cf6',
    platform: 'Android',
    adPlatform: 'Facebook',
    optimizer: '张三',
    configVersionId: 'v2',
    configVersionLabel: 'v2 已发布',
    assignTime: '2024-03-12',
    effectiveTime: '2024-03-12',
    status: '活跃',
    operator: '管理员A',
    note: 'Facebook 渠道重点优化',
    availableVersions: defaultVersions(),
    changeLogs: [
      {
        id: 'log-004-1',
        time: '2024-03-12 14:00:00',
        type: '初始分配',
        operator: '管理员A',
        content: '初始分配：应用 PhoneTracker-安卓-Facebook 分配给 张三，使用 v2 配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-005',
    appName: 'PhoneTracker',
    appId: 'PhoneTrackerA',
    iconColor: '#8b5cf6',
    platform: 'Android',
    adPlatform: 'TikTok',
    optimizer: '李四',
    configVersionId: 'v2',
    configVersionLabel: 'v2 已发布',
    assignTime: '2024-03-05',
    effectiveTime: '2024-03-05',
    status: '活跃',
    operator: '管理员B',
    note: '',
    availableVersions: defaultVersions(),
    changeLogs: [
      {
        id: 'log-005-1',
        time: '2024-03-05 09:30:00',
        type: '初始分配',
        operator: '管理员B',
        content: '初始分配：应用 PhoneTracker-安卓-TikTok 分配给 李四，使用 v2 配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-006',
    appName: 'DeepSearch',
    appId: 'DeepSearchA',
    iconColor: '#06b6d4',
    platform: 'Android',
    adPlatform: 'Google',
    optimizer: '赵六',
    configVersionId: 'v2',
    configVersionLabel: 'v2 草稿',
    assignTime: '2024-03-01',
    effectiveTime: '2024-03-01',
    status: '草稿配置',
    operator: '管理员A',
    note: '',
    availableVersions: defaultVersions(true),
    changeLogs: [
      {
        id: 'log-006-1',
        time: '2024-03-01 11:00:00',
        type: '初始分配',
        operator: '管理员A',
        content: '初始分配：应用 DeepSearch-安卓-Google 分配给 赵六，使用 v2（草稿）配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-007',
    appName: 'KDrama',
    appId: 'KDramaA',
    iconColor: '#ec4899',
    platform: 'Android',
    adPlatform: 'Facebook',
    optimizer: '王五',
    configVersionId: 'v2',
    configVersionLabel: 'v2 已发布',
    assignTime: '2024-02-28',
    effectiveTime: '2024-02-28',
    status: '活跃',
    operator: '管理员B',
    note: 'KDrama Facebook 常规投放',
    availableVersions: defaultVersions(),
    changeLogs: [
      {
        id: 'log-007-1',
        time: '2024-02-28 15:00:00',
        type: '初始分配',
        operator: '管理员B',
        content: '初始分配：应用 KDrama-安卓-Facebook 分配给 王五，使用 v2 配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-008',
    appName: 'YearCam',
    appId: 'YearCamA',
    iconColor: '#eab308',
    platform: 'Android',
    adPlatform: 'Google',
    optimizer: '赵六',
    configVersionId: 'v2',
    configVersionLabel: 'v2 草稿',
    assignTime: '2024-02-25',
    effectiveTime: '2024-02-25',
    status: '草稿配置',
    operator: '管理员A',
    note: '',
    availableVersions: defaultVersions(true),
    changeLogs: [
      {
        id: 'log-008-1',
        time: '2024-02-25 10:00:00',
        type: '初始分配',
        operator: '管理员A',
        content: '初始分配：应用 YearCam-安卓-Google 分配给 赵六，使用 v2（草稿）配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-009',
    appName: 'FaceMe',
    appId: 'FaceMeA',
    iconColor: '#22c55e',
    platform: 'Android',
    adPlatform: 'Google',
    optimizer: '张三',
    configVersionId: 'v2',
    configVersionLabel: 'v2 已发布',
    assignTime: '2024-02-20',
    effectiveTime: '2024-02-20',
    status: '活跃',
    operator: '管理员B',
    note: '',
    availableVersions: defaultVersions(),
    changeLogs: [
      {
        id: 'log-009-1',
        time: '2024-02-20 09:00:00',
        type: '初始分配',
        operator: '管理员B',
        content: '初始分配：应用 FaceMe-安卓-Google 分配给 张三，使用 v2 配置',
        note: '-',
        status: '有效'
      }
    ]
  },
  {
    id: 'asgn-010',
    appName: 'HealthTracker3',
    appId: 'HealthHT3A',
    iconColor: '#2dd4bf',
    platform: 'Android',
    adPlatform: '全部',
    optimizer: '李四',
    configVersionId: 'v1',
    configVersionLabel: 'v1 已归档',
    assignTime: '2024-01-15',
    effectiveTime: '2024-01-15',
    status: '已归档',
    operator: '管理员A',
    note: '',
    availableVersions: [
      {
        id: 'v1',
        version: 'v1',
        status: '已归档',
        isActive: false,
        date: '2024-01-10',
        creator: '李四',
        evalMethod: 'ROI',
        evalDays: 3,
        targetRate: '38%',
        minRate: '35%',
        difficulty: 0.9,
        minProfit: '-',
        extraCondition: '-'
      }
    ],
    changeLogs: [
      {
        id: 'log-010-1',
        time: '2024-01-15 09:00:00',
        type: '初始分配',
        operator: '管理员A',
        content: '初始分配：应用 HealthTracker3-安卓-全部 分配给 李四，使用 v1 配置',
        note: '-',
        status: '有效'
      }
    ]
  }
]

// ─── 筛选选项 ────────────────────────────────────────────────────────────────

export const adPlatformOptions = [
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Google', value: 'Google' },
  { label: 'TikTok', value: 'TikTok' },
  { label: '全部', value: '全部' }
]

export const optimizerOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' }
]

export const appOptions = [
  { label: 'Weather8 (安卓)', value: 'Weather8A', appName: 'Weather8', iconColor: '#a78bfa' },
  {
    label: 'BloodSugar2 (安卓)',
    value: 'HealthBS2A',
    appName: 'BloodSugar2',
    iconColor: '#f97316'
  },
  {
    label: 'PhoneTracker (安卓)',
    value: 'PhoneTrackerA',
    appName: 'PhoneTracker',
    iconColor: '#8b5cf6'
  },
  { label: 'DeepSearch (安卓)', value: 'DeepSearchA', appName: 'DeepSearch', iconColor: '#06b6d4' },
  { label: 'KDrama (安卓)', value: 'KDramaA', appName: 'KDrama', iconColor: '#ec4899' },
  { label: 'YearCam (安卓)', value: 'YearCamA', appName: 'YearCam', iconColor: '#eab308' },
  { label: 'FaceMe (安卓)', value: 'FaceMeA', appName: 'FaceMe', iconColor: '#22c55e' },
  {
    label: 'HealthTracker3 (安卓)',
    value: 'HealthHT3A',
    appName: 'HealthTracker3',
    iconColor: '#2dd4bf'
  }
]

/** appId → 可用绩效版本列表（新建分配时使用） */
export const versionsByApp: Record<string, PerformanceVersion[]> = {
  Weather8A: weather8Versions,
  HealthBS2A: healthVersions,
  PhoneTrackerA: defaultVersions(),
  DeepSearchA: defaultVersions(true),
  KDramaA: defaultVersions(),
  YearCamA: defaultVersions(true),
  FaceMeA: defaultVersions(),
  HealthHT3A: defaultVersions()
}
