import type { ApplicationAppItem } from '../types'

export const applicationMockList: ApplicationAppItem[] = [
  {
    id: 'Weather5A',
    appName: 'Weather5',
    iconColor: '#2dd4bf',
    platform: 'Android',
    bundleId: 'com.accurate.weather.forecast.live',
    packageId: 'com.accurate.weather.forecast.live',
    shortName: 'W5',
    category: 'Weather',
    timezone: 'PST',
    priority: 12,
    status: '正常',
    creator: '张三',
    createTime: '2024-01-15',
    toolEnabled: true,
    preGenReport: true
  },
  {
    id: 'Weather5I',
    appName: 'Weather5',
    iconColor: '#2dd4bf',
    platform: 'iOS',
    bundleId: 'com.accurate.forecast.weather.swift',
    packageId: 'com.accurate.forecast.weather.swift',
    shortName: 'W5',
    category: 'Weather',
    timezone: 'PST',
    priority: 13,
    status: '正常',
    creator: '张三',
    createTime: '2024-01-15'
  },
  {
    id: 'Weather6A',
    appName: 'Weather6',
    iconColor: '#60a5fa',
    platform: 'Android',
    bundleId: 'com.accurate.local.weather.forecast.live',
    packageId: 'com.accurate.local.weather.forecast.live',
    shortName: 'W6',
    category: 'Weather',
    timezone: 'PST',
    priority: 14,
    status: '正常',
    creator: '李四',
    createTime: '2024-01-20'
  },
  {
    id: 'Weather8A',
    appName: 'Weather8',
    iconColor: '#a78bfa',
    platform: 'Android',
    bundleId: 'com.accurate.live.weather.widget',
    packageId: 'com.accurate.live.weather.widget',
    shortName: 'W8',
    category: 'Weather',
    timezone: 'PST',
    priority: 15,
    status: '正常',
    creator: '张三',
    createTime: '2024-02-01'
  },
  {
    id: 'HealthBP2A',
    appName: 'BloodPressure2',
    iconColor: '#f97316',
    platform: 'Android',
    bundleId: 'com.blood.pressure.bptracker',
    packageId: 'com.blood.pressure.bptracker',
    shortName: 'BP2',
    category: 'Health',
    timezone: 'PST',
    priority: 51,
    status: '正常',
    creator: '王五',
    createTime: '2024-02-10'
  },
  {
    id: 'HealthBS2A',
    appName: 'BloodSugar2',
    iconColor: '#f97316',
    platform: 'Android',
    bundleId: 'com.blood.sugar.monitor',
    packageId: 'com.blood.sugar.monitor',
    shortName: 'BS2',
    category: 'Health',
    timezone: 'PST',
    priority: 52,
    status: '正常',
    creator: '王五',
    createTime: '2024-02-10'
  },
  {
    id: 'HealthHT2A',
    appName: 'HealthTracker2',
    iconColor: '#2dd4bf',
    platform: 'Android',
    bundleId: 'com.bloodpressure.health.healthtracker',
    packageId: 'com.bloodpressure.health.healthtracker',
    shortName: 'HT2',
    category: 'Health',
    timezone: 'PST',
    priority: 53,
    status: '正常',
    creator: '李四',
    createTime: '2024-03-01'
  },
  {
    id: 'HealthHRA',
    appName: 'HeartRate',
    iconColor: '#ec4899',
    platform: 'Android',
    bundleId: 'com.pulse.heartrate',
    packageId: 'com.pulse.heartrate',
    shortName: 'HR',
    category: 'Health',
    timezone: 'PST',
    priority: 56,
    status: '正常',
    creator: '张三',
    createTime: '2024-03-05'
  }
]

export const applicationCategoryOptions = [
  { label: 'Weather', value: 'Weather' },
  { label: 'Health', value: 'Health' },
  { label: 'Finance', value: 'Finance' }
]

export const applicationCreatorOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' }
]
