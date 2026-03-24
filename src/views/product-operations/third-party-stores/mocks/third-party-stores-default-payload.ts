import type { ThirdPartyStoresDashboardPayload } from '../types'

/** 與原頁面內嵌靜態數據一致的預設儀表板 payload（供 Mock / 聯調對照） */
export const THIRD_PARTY_STORES_DEFAULT_PAYLOAD: ThirdPartyStoresDashboardPayload = {
  statusSummary: {
    connectedPlatforms: 6,
    totalApps: 42,
    pendingSync: 3,
    newPlatformsThisMonth: 1,
    newPlatformName: 'Amazon Appstore'
  },
  summary: {
    newUsers: 496,
    totalRevenue: 6187,
    adRevenue: 4046,
    paidRevenue: 2141,
    arpu: 12.47
  },
  donut: {
    legend: ['自然流量', 'TikTok', 'Mintegral', 'Kwai'],
    slices: [
      { value: 45, name: '自然流量', color: '#22c55e' },
      { value: 30, name: 'TikTok', color: '#3b82f6' },
      { value: 15, name: 'Mintegral', color: '#8b5cf6' },
      { value: 10, name: 'Kwai', color: '#f59e0b' }
    ]
  },
  bar: {
    apps: ['WeatherPro', 'ClapFinder', 'Dressup', 'YearCam', 'FaceMe'],
    values: [300, 360, 480, 520, 680],
    ratios: [13, 15, 21, 22, 29]
  },
  platformCards: [
    {
      id: 'google',
      name: 'Google Play',
      icon: 'google-play',
      iconBg: '#1a73e8',
      status: 'connected',
      appCount: 38,
      lastSync: '5min ago'
    },
    {
      id: 'apple',
      name: 'App Store',
      icon: 'app-store',
      iconBg: '#555',
      status: 'connected',
      appCount: 32,
      lastSync: '3min ago'
    },
    {
      id: 'huawei',
      name: 'Huawei AppGallery',
      icon: 'huawei',
      iconBg: '#e31837',
      status: 'connected',
      appCount: 18,
      lastSync: '10min ago'
    },
    {
      id: 'samsung',
      name: 'Samsung Galaxy Store',
      icon: 'samsung',
      iconBg: '#1428a0',
      status: 'warning',
      appCount: 12,
      lastSync: 'Sync Error - Auth expired'
    },
    {
      id: 'xiaomi',
      name: 'Xiaomi App Store',
      icon: 'xiaomi',
      iconBg: '#ff6900',
      status: 'connected',
      appCount: 15,
      lastSync: '20min ago'
    },
    {
      id: 'amazon',
      name: 'Amazon Appstore',
      icon: 'amazon',
      iconBg: '#232f3e',
      status: 'pending',
      appCount: 0,
      lastSync: 'Not configured'
    }
  ],
  appStoreData: [
    {
      key: 'weather8',
      app: 'Weather8',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 297,
      totalRevenue: 380,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'w8-1',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'organic',
          newUsers: 297,
          totalRevenue: 380,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        },
        {
          key: 'w8-2',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'TikTok',
          newUsers: 0,
          totalRevenue: 862,
          adRevenue: 862,
          paidRevenue: 0,
          adRatio: 100
        }
      ]
    },
    {
      key: 'health2',
      app: 'HealthTracker2',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 80,
      totalRevenue: 540,
      adRevenue: 240,
      paidRevenue: 0,
      adRatio: 44,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'h2-1',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'organic',
          newUsers: 80,
          totalRevenue: 440,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        },
        {
          key: 'h2-2',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'TikTok',
          newUsers: 0,
          totalRevenue: 48,
          adRevenue: 48,
          paidRevenue: 0,
          adRatio: 100
        },
        {
          key: 'h2-3',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'Mintegral',
          newUsers: 0,
          totalRevenue: 52,
          adRevenue: 52,
          paidRevenue: 0,
          adRatio: 100
        }
      ]
    },
    {
      key: 'cpu',
      app: 'CPUMonitor',
      platform: '安卓',
      adStore: 'XIAOMI+OPPO',
      adPlatform: '—',
      newUsers: 69,
      totalRevenue: 320,
      adRevenue: 180,
      paidRevenue: 0,
      adRatio: 56,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'cpu-1',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'organic',
          newUsers: 63,
          totalRevenue: 240,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        },
        {
          key: 'cpu-2',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'TikTok',
          newUsers: 0,
          totalRevenue: 60,
          adRevenue: 60,
          paidRevenue: 0,
          adRatio: 100
        },
        {
          key: 'cpu-3',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'Mintegral',
          newUsers: 0,
          totalRevenue: 40,
          adRevenue: 40,
          paidRevenue: 0,
          adRatio: 100
        },
        {
          key: 'cpu-4',
          app: '',
          platform: '',
          adStore: 'OPPO',
          adPlatform: 'organic',
          newUsers: 6,
          totalRevenue: 0,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        }
      ]
    },
    {
      key: 'bp2',
      app: 'BloodPressure2',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 43,
      totalRevenue: 285,
      adRevenue: 150,
      paidRevenue: 0,
      adRatio: 53,
      isGroup: true,
      expanded: false
    },
    {
      key: 'weather5',
      app: 'Weather5',
      platform: '安卓',
      adStore: 'XIAOMI+OPPO',
      adPlatform: '—',
      newUsers: 38,
      totalRevenue: 203,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0,
      isGroup: true,
      expanded: false
    },
    {
      key: 'faceme',
      app: 'FaceMe',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: 'organic',
      newUsers: 7,
      totalRevenue: 60,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0
    },
    {
      key: 'weather6',
      app: 'Weather6',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 2,
      totalRevenue: 243,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0,
      isGroup: true,
      expanded: false
    }
  ],
  channelData: [
    {
      key: 'faceme-ch',
      app: 'FaceMe',
      platform: '—',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 680,
      adRevenue: 580,
      paidRevenue: 100,
      channelRatio: 29,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'f-1',
          app: '',
          platform: 'iOS',
          channel: 'InAppShare',
          adCampaign: 'FaceMe_InAppShare',
          newUsers: 0,
          totalRevenue: 340,
          adRevenue: 290,
          paidRevenue: 50,
          channelRatio: 0
        },
        {
          key: 'f-2',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'FaceMe_InAppShare',
          newUsers: 0,
          totalRevenue: 340,
          adRevenue: 290,
          paidRevenue: 50,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'yearcam-ch',
      app: 'YearCam',
      platform: '安卓',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 520,
      adRevenue: 420,
      paidRevenue: 100,
      channelRatio: 22,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'y-1',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'YearCam_InAppShare',
          newUsers: 0,
          totalRevenue: 520,
          adRevenue: 420,
          paidRevenue: 100,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'dressup-ch',
      app: 'Dressup',
      platform: '安卓',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 480,
      adRevenue: 380,
      paidRevenue: 100,
      channelRatio: 21,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'd-1',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'Dressup_InAppShare',
          newUsers: 0,
          totalRevenue: 480,
          adRevenue: 380,
          paidRevenue: 100,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'clapfinder-ch',
      app: 'ClapFinder',
      platform: '—',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 360,
      adRevenue: 290,
      paidRevenue: 70,
      channelRatio: 15,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'c-1',
          app: '',
          platform: 'iOS',
          channel: 'InAppShare',
          adCampaign: 'ClapFinder_InAppShare',
          newUsers: 0,
          totalRevenue: 200,
          adRevenue: 160,
          paidRevenue: 40,
          channelRatio: 0
        },
        {
          key: 'c-2',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'ClapFinder_InAppShare',
          newUsers: 0,
          totalRevenue: 160,
          adRevenue: 130,
          paidRevenue: 30,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'weatherpro-ch',
      app: 'WeatherPro',
      platform: '安卓',
      channel: 'InAppShare',
      adCampaign: 'WeatherPro_InAppShare',
      newUsers: 0,
      totalRevenue: 300,
      adRevenue: 220,
      paidRevenue: 80,
      channelRatio: 13
    }
  ]
}
