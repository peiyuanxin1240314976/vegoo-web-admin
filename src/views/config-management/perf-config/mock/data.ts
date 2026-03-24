import type { PerfConfigItem, PerfVersion } from '../types'

const mkVer = (
  v: number, status: 'published' | 'draft' | 'archived',
  by: string, date: string,
  target: number, min: number, days = 3, factor = 1.2,
  isActive = false, minProfit: number | null = null, extra = ''
): PerfVersion => ({
  version: v, status, publishedAt: date, publishedBy: by,
  evalMethod: 'ROI', evalDays: days, targetRate: target, minRate: min,
  difficultyFactor: factor, minProfit, extraCondition: extra, isActive
})

const RAW: PerfConfigItem[] = [
  {
    id: '1', appName: 'Weather8', appIcon: '#6366f1', appPlatform: 'android',
    adPlatform: 'Facebook', runStatus: 'running', allowMulti: true,
    activeVersion: mkVer(3, 'published', '张三', '2024-03-15', 53, 50, 3, 1.2, true, 90000, '日均消耗>$5K'),
    versions: [
      mkVer(3, 'published', '张三', '2024-03-15', 53, 50, 3, 1.2, true, 90000, '日均消耗>$5K'),
      mkVer(2, 'published', '李四', '2024-03-10', 50, 47, 3, 1.2),
      mkVer(1, 'archived',  '王五', '2024-03-01', 47, 44, 3, 1.0)
    ]
  },
  {
    id: '2', appName: 'Weather8', appIcon: '#6366f1', appPlatform: 'android',
    adPlatform: 'Google', runStatus: 'running', allowMulti: true,
    activeVersion: mkVer(2, 'published', '李四', '2024-03-10', 53, 50, 3, 1.2, true),
    versions: [
      mkVer(2, 'published', '李四', '2024-03-10', 53, 50, 3, 1.2, true),
      mkVer(1, 'archived',  '王五', '2024-02-20', 48, 45, 3, 1.0)
    ]
  },
  {
    id: '3', appName: 'BloodSugar2', appIcon: '#ef4444', appPlatform: 'android',
    adPlatform: 'Google', runStatus: 'running', allowMulti: false,
    activeVersion: mkVer(1, 'published', '张三', '2024-03-12', 100, 95, 3, 1.0, true),
    versions: [mkVer(1, 'published', '张三', '2024-03-12', 100, 95, 3, 1.0, true)]
  },
  {
    id: '4', appName: 'PhoneTracker', appIcon: '#8b5cf6', appPlatform: 'android',
    adPlatform: 'Facebook', runStatus: 'running', allowMulti: true,
    activeVersion: mkVer(2, 'published', '李四', '2024-03-08', 97, 92, 1, 1.2, true),
    versions: [
      mkVer(2, 'published', '李四', '2024-03-08', 97, 92, 1, 1.2, true),
      mkVer(1, 'published', '王五', '2024-02-15', 90, 85, 1, 1.0)
    ]
  },
  {
    id: '5', appName: 'PhoneTracker', appIcon: '#8b5cf6', appPlatform: 'android',
    adPlatform: 'TikTok', runStatus: 'running', allowMulti: true,
    activeVersion: mkVer(1, 'published', '王五', '2024-03-01', 95, 90, 1, 1.0, true),
    versions: [mkVer(1, 'published', '王五', '2024-03-01', 95, 90, 1, 1.0, true)]
  },
  {
    id: '6', appName: 'DeepSearch', appIcon: '#0ea5e9', appPlatform: 'android',
    adPlatform: 'Google', runStatus: 'paused', allowMulti: false,
    activeVersion: mkVer(1, 'draft', '张三', '2024-03-14', 35, 30, 3, 2.0, true),
    versions: [mkVer(1, 'draft', '张三', '2024-03-14', 35, 30, 3, 2.0, true)]
  },
  {
    id: '7', appName: 'FaceMe', appIcon: '#f97316', appPlatform: 'android',
    adPlatform: 'Google', runStatus: 'running', allowMulti: true,
    activeVersion: mkVer(1, 'published', '李四', '2024-03-05', 60, 57, 7, 0.5, true),
    versions: [mkVer(1, 'published', '李四', '2024-03-05', 60, 57, 7, 0.5, true)]
  },
  {
    id: '8', appName: 'HealthTracker3', appIcon: '#22c55e', appPlatform: 'android',
    adPlatform: 'Google', runStatus: 'stopped', allowMulti: false,
    activeVersion: { ...mkVer(1, 'archived', '王五', '2024-02-01', 0, 0, 0, 0, true), evalMethod: 'CPA', targetRate: 10, minRate: 15 },
    versions: [{ ...mkVer(1, 'archived', '王五', '2024-02-01', 0, 0, 0, 0, true), evalMethod: 'CPA', targetRate: 10, minRate: 15 }]
  },
  {
    id: '9', appName: 'KDrama', appIcon: '#ec4899', appPlatform: 'android',
    adPlatform: 'Facebook', runStatus: 'running', allowMulti: true,
    activeVersion: mkVer(1, 'published', '张三', '2024-03-11', 95, 90, 3, 1.2, true),
    versions: [mkVer(1, 'published', '张三', '2024-03-11', 95, 90, 3, 1.2, true)]
  },
  {
    id: '10', appName: 'YearCam', appIcon: '#eab308', appPlatform: 'android',
    adPlatform: 'Google', runStatus: 'running', allowMulti: false,
    activeVersion: mkVer(1, 'draft', '李四', '2024-03-13', 60, 57, 7, 0.5, true),
    versions: [mkVer(1, 'draft', '李四', '2024-03-13', 60, 57, 7, 0.5, true)]
  }
]

export const clonePerfList = (): PerfConfigItem[] =>
  RAW.map(item => ({ ...item, versions: item.versions.map(v => ({ ...v })) }))

export const APP_LIST = ['Weather8', 'BloodSugar2', 'PhoneTracker', 'DeepSearch', 'FaceMe', 'HealthTracker3', 'KDrama', 'YearCam', 'TravelPlus', 'FitTrack']

export const AD_PLATFORMS = ['Google', 'Facebook', 'TikTok', 'Kwai', 'Mintegral', 'NewsBreak', 'Unity', 'IronSource'] as const

export const APP_ICON_COLORS: Record<string, string> = {
  Weather8: '#6366f1', BloodSugar2: '#ef4444', PhoneTracker: '#8b5cf6',
  DeepSearch: '#0ea5e9', FaceMe: '#f97316', HealthTracker3: '#22c55e',
  KDrama: '#ec4899', YearCam: '#eab308', TravelPlus: '#14b8a6', FitTrack: '#f59e0b'
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: '已发布', color: '#22c55e', bg: 'rgb(34 197 94 / 12%)' },
  draft:     { label: '草稿',   color: '#f59e0b', bg: 'rgb(245 158 11 / 12%)' },
  archived:  { label: '已归档', color: '#64748b', bg: 'rgb(100 116 139 / 12%)' }
}

export const RUN_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  running: { label: '投放中', color: '#22c55e' },
  paused:  { label: '未投放', color: '#f59e0b' },
  stopped: { label: '已停止', color: '#64748b' }
}
