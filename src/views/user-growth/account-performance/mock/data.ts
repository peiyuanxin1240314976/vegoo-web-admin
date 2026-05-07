/**
 * 账户成效页 Mock 数据（按设计图还原，后续对接真实接口可整体替换）
 */
import type { AccountPerformanceMock } from '../types'

export const MOCK_ACCOUNT_PERFORMANCE: AccountPerformanceMock = {
  dateRange: ['2026-03-05', '2026-03-05'],
  summaryText: '共 6 个应用 / 31 个广告账户',

  kpi: [
    {
      type: 'accounts',
      label: '广告账户数',
      value: '97个',
      sub: '在投 31个'
    },
    {
      type: 'spend',
      label: '近7天广告支出',
      value: '$17,022',
      compare: '周环比 +8.5%',
      compareUp: true
    },
    {
      type: 'roi1',
      label: '首日ROI均值',
      value: '97%',
      detail: '达标线 85% 达标',
      compareUp: true
    },
    {
      type: 'installs',
      label: '买量用户',
      value: '208,794',
      compare: '周环比 +12%',
      compareUp: true
    },
    {
      type: 'apps',
      label: '在投应用数',
      value: '6个',
      sub: '广告系列 231个'
    },
    {
      type: 'alert',
      label: '预警账户',
      value: '3个',
      sub: '超预算/余额不足',
      alert: true
    }
  ],

  tableTree: [
    {
      id: 'app-1',
      campaignId: 'camp-app-1',
      type: 'app',
      name: 'PhoneTracker',
      spend: 1607,
      budget: 8600,
      usageRate: 18.7,
      cpi: 0.14,
      installs: 15401,
      roi1: 108,
      roi3: 103,
      roi7: 98,
      status: 'normal',
      children: [
        {
          id: 'plat-1-1',
          type: 'platform',
          name: 'TikTok 安卓',
          spend: 1607,
          budget: 8600,
          usageRate: 18.7,
          cpi: 0.14,
          installs: 15401,
          roi1: 108,
          roi3: 103,
          roi7: 98,
          status: 'normal',
          children: [
            {
              id: 'acc-1-1-1',
              type: 'account',
              name: 'panda-VEGOO-PT-02',
              spend: 502,
              budget: 3200,
              usageRate: 15.7,
              cpi: 0.19,
              installs: 2649,
              roi1: 104,
              roi3: 109,
              roi7: 96,
              status: 'normal'
            },
            {
              id: 'acc-1-1-2',
              type: 'account',
              name: 'BV_ZL_TT_PT_06',
              spend: 502,
              budget: 3200,
              usageRate: 5.5,
              cpi: 0.15,
              installs: 1290,
              roi1: 104,
              roi3: 109,
              roi7: 96,
              status: 'normal'
            },
            {
              id: 'acc-1-1-3',
              type: 'account',
              name: 'BV_ZL_PT_04',
              spend: 500,
              budget: 3200,
              usageRate: 15.7,
              cpi: 0.14,
              installs: 2649,
              roi1: 74,
              roi3: 74,
              roi7: 94,
              status: 'normal'
            },
            {
              id: 'acc-1-1-4',
              type: 'account',
              name: 'OM_TT_Vegoo_VD3_05',
              spend: 196,
              budget: 3200,
              usageRate: 4.9,
              cpi: 0.14,
              installs: 1121,
              roi1: 30,
              roi3: 30,
              roi7: 90,
              status: 'normal'
            },
            {
              id: 'acc-1-1-5',
              type: 'account',
              name: 'OM_TT_Vegoo_PT_02',
              spend: 166,
              budget: 3200,
              usageRate: 6.5,
              cpi: 0.16,
              installs: 879,
              roi1: 63,
              roi3: 33,
              roi7: 62,
              status: 'normal'
            }
          ]
        }
      ]
    },
    {
      id: 'app-2',
      campaignId: 'camp-app-2',
      type: 'app',
      name: 'VideoDownloader',
      spend: 1607,
      budget: 8600,
      usageRate: 18.7,
      cpi: 0.14,
      installs: 15401,
      roi1: 108,
      roi3: 103,
      roi7: 98,
      status: 'normal',
      children: []
    },
    {
      id: 'app-3',
      campaignId: 'camp-app-3',
      type: 'app',
      name: 'VideoDownloader3',
      spend: 1603,
      budget: 8600,
      usageRate: 34.7,
      cpi: 0.14,
      installs: 5401,
      roi1: 98,
      roi3: 74,
      roi7: 97,
      status: 'normal',
      children: []
    },
    {
      id: 'app-4',
      campaignId: 'camp-app-4',
      type: 'app',
      name: 'DramaVue',
      spend: 502,
      budget: 3200,
      usageRate: 34.7,
      cpi: 0.15,
      installs: 1359,
      roi1: 78,
      roi3: 66,
      roi7: 94,
      status: 'normal',
      children: []
    },
    {
      id: 'app-5',
      campaignId: 'camp-app-5',
      type: 'app',
      name: 'PhoneTracker3',
      spend: 1607,
      budget: 8600,
      usageRate: 18.7,
      cpi: 0.14,
      installs: 15401,
      roi1: 64,
      roi3: 69,
      roi7: 62,
      status: 'roi_low',
      statusText: 'ROI偏低',
      children: []
    }
  ],

  channelSpend: [
    { name: 'TikTok', value: 52, percent: 52 },
    { name: 'Facebook', value: 31, percent: 31 },
    { name: 'Google', value: 8, percent: 8 },
    { name: 'Mintegral', value: 5, percent: 5 },
    { name: 'Kwai', value: 3, percent: 3 },
    { name: 'NewsBreak', value: 1, percent: 1 }
  ],

  budgetUsageBuckets: [
    { range: '0-20%', count: 3 },
    { range: '20-40%', count: 8 },
    { range: '40-60%', count: 15 },
    { range: '60-80%', count: 52 },
    { range: '80-100%', count: 19 }
  ],

  day1RoiTrend: [
    { date: '2/26', roi: 95 },
    { date: '2/27', roi: 97 },
    { date: '2/28', roi: 99 },
    { date: '3/1', roi: 101 },
    { date: '3/2', roi: 103 },
    { date: '3/3', roi: 106 },
    { date: '3/4', roi: 108 }
  ],

  /** 预警事项：待真实接口联调后再补示例；当前保持空数组 */
  alerts: [],

  spendPace7Days: [
    { date: '2/26', value: 180 },
    { date: '2/27', value: 210 },
    { date: '2/28', value: 235 },
    { date: '3/1', value: 260 },
    { date: '3/2', value: 245 },
    { date: '3/3', value: 225 },
    { date: '3/4', value: 255 }
  ]
}
