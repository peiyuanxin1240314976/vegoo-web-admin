import type { PerfConfigItem, PerfVersion } from '../types'

const mkVer = (
  v: number,
  status: 'published' | 'draft' | 'archived',
  by: string,
  date: string,
  target: number,
  min: number,
  days = 3,
  factor = 1.2,
  isActive = false,
  minProfit: number | null = null,
  extra = ''
): PerfVersion => ({
  version: v,
  status,
  publishedAt: date,
  publishedBy: by,
  evalMethod: 'ROI',
  evalDays: days,
  targetRate: target,
  minRate: min,
  difficultyFactor: factor,
  minProfit,
  extraCondition: extra,
  isActive
})

const RAW: PerfConfigItem[] = [
  {
    id: '1',
    appId: 'com.accurate.live.weather.widget',
    appName: 'Weather8',
    appIcon: '#6366f1',
    platform: '0',
    source: '2',
    sourceList: ['2'],
    runStatus: 'running',
    allowMulti: true,
    activeVersion: mkVer(
      3,
      'published',
      '张三',
      '2024-03-15',
      53,
      50,
      3,
      1.2,
      true,
      90000,
      '日均消耗>$5K'
    ),
    versions: [
      mkVer(3, 'published', '张三', '2024-03-15', 53, 50, 3, 1.2, true, 90000, '日均消耗>$5K'),
      mkVer(2, 'published', '李四', '2024-03-10', 50, 47, 3, 1.2),
      mkVer(1, 'archived', '王五', '2024-03-01', 47, 44, 3, 1.0)
    ]
  },
  {
    id: '2',
    appId: 'com.accurate.live.weather.widget',
    appName: 'Weather8',
    appIcon: '#6366f1',
    platform: '0',
    source: '1',
    sourceList: ['1'],
    runStatus: 'running',
    allowMulti: true,
    activeVersion: mkVer(2, 'published', '李四', '2024-03-10', 53, 50, 3, 1.2, true),
    versions: [
      mkVer(2, 'published', '李四', '2024-03-10', 53, 50, 3, 1.2, true),
      mkVer(1, 'archived', '王五', '2024-02-20', 48, 45, 3, 1.0)
    ]
  },
  {
    id: '3',
    appId: 'com.blood.sugar.monitor',
    appName: 'BloodSugar2',
    appIcon: '#ef4444',
    platform: '0',
    source: '1',
    sourceList: ['1'],
    runStatus: 'running',
    allowMulti: false,
    activeVersion: mkVer(1, 'published', '张三', '2024-03-12', 100, 95, 3, 1.0, true),
    versions: [mkVer(1, 'published', '张三', '2024-03-12', 100, 95, 3, 1.0, true)]
  },
  {
    id: '4',
    appId: 'com.locate.phone.track',
    appName: 'PhoneTracker',
    appIcon: '#8b5cf6',
    platform: '0',
    source: '2',
    sourceList: ['2'],
    runStatus: 'running',
    allowMulti: true,
    activeVersion: mkVer(2, 'published', '李四', '2024-03-08', 97, 92, 1, 1.2, true),
    versions: [
      mkVer(2, 'published', '李四', '2024-03-08', 97, 92, 1, 1.2, true),
      mkVer(1, 'published', '王五', '2024-02-15', 90, 85, 1, 1.0)
    ]
  },
  {
    id: '5',
    appId: 'com.locate.phone.track',
    appName: 'PhoneTracker',
    appIcon: '#8b5cf6',
    platform: '0',
    source: '10',
    sourceList: ['10'],
    runStatus: 'running',
    allowMulti: true,
    activeVersion: mkVer(1, 'published', '王五', '2024-03-01', 95, 90, 1, 1.0, true),
    versions: [mkVer(1, 'published', '王五', '2024-03-01', 95, 90, 1, 1.0, true)]
  },
  {
    id: '6',
    appId: 'ai.deep.search.pro',
    appName: 'DeepSearch',
    appIcon: '#0ea5e9',
    platform: '0',
    source: '1',
    sourceList: ['1'],
    runStatus: 'paused',
    allowMulti: false,
    activeVersion: mkVer(1, 'draft', '张三', '2024-03-14', 35, 30, 3, 2.0, true),
    versions: [mkVer(1, 'draft', '张三', '2024-03-14', 35, 30, 3, 2.0, true)]
  },
  {
    id: '7',
    appId: 'com.ai.photoeditor.fx',
    appName: 'FaceMe',
    appIcon: '#f97316',
    platform: '0',
    source: '1',
    sourceList: ['1'],
    runStatus: 'running',
    allowMulti: true,
    activeVersion: mkVer(1, 'published', '李四', '2024-03-05', 60, 57, 7, 0.5, true),
    versions: [mkVer(1, 'published', '李四', '2024-03-05', 60, 57, 7, 0.5, true)]
  },
  {
    id: '8',
    appId: 'com.blood.pressure.healthapp',
    appName: 'HealthTracker3',
    appIcon: '#22c55e',
    platform: '0',
    source: '1',
    sourceList: ['1'],
    runStatus: 'stopped',
    allowMulti: false,
    activeVersion: {
      ...mkVer(1, 'archived', '王五', '2024-02-01', 0, 0, 0, 0, true),
      evalMethod: 'CPA',
      targetRate: 10,
      minRate: 15
    },
    versions: [
      {
        ...mkVer(1, 'archived', '王五', '2024-02-01', 0, 0, 0, 0, true),
        evalMethod: 'CPA',
        targetRate: 10,
        minRate: 15
      }
    ]
  },
  {
    id: '9',
    appId: 'drama.short.reel.video.series.episode.story',
    appName: 'KDrama',
    appIcon: '#ec4899',
    platform: '0',
    source: '2',
    sourceList: ['2'],
    runStatus: 'running',
    allowMulti: true,
    activeVersion: mkVer(1, 'published', '张三', '2024-03-11', 95, 90, 3, 1.2, true),
    versions: [mkVer(1, 'published', '张三', '2024-03-11', 95, 90, 3, 1.2, true)]
  },
  {
    id: '10',
    appId: 'com.generator.art.ai',
    appName: 'YearCam',
    appIcon: '#eab308',
    platform: '0',
    source: '1',
    sourceList: ['1'],
    runStatus: 'running',
    allowMulti: false,
    activeVersion: mkVer(1, 'draft', '李四', '2024-03-13', 60, 57, 7, 0.5, true),
    versions: [mkVer(1, 'draft', '李四', '2024-03-13', 60, 57, 7, 0.5, true)]
  }
]

export const clonePerfList = (): PerfConfigItem[] =>
  RAW.map((item) => ({ ...item, versions: item.versions.map((v) => ({ ...v })) }))

/** 应用展示名色块（按应用名 key，与 cockpit label 可并存） */
export const APP_ICON_COLORS: Record<string, string> = {
  Weather8: '#6366f1',
  BloodSugar2: '#ef4444',
  PhoneTracker: '#8b5cf6',
  DeepSearch: '#0ea5e9',
  FaceMe: '#f97316',
  HealthTracker3: '#22c55e',
  KDrama: '#ec4899',
  YearCam: '#eab308',
  TravelPlus: '#14b8a6',
  FitTrack: '#f59e0b'
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: '已发布', color: '#22c55e', bg: 'rgb(34 197 94 / 12%)' },
  draft: { label: '草稿', color: '#f59e0b', bg: 'rgb(245 158 11 / 12%)' },
  archived: { label: '已归档', color: '#64748b', bg: 'rgb(100 116 139 / 12%)' }
}

export const RUN_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  running: { label: '投放中', color: '#22c55e' },
  paused: { label: '未投放', color: '#f59e0b' },
  stopped: { label: '已停止', color: '#64748b' }
}
