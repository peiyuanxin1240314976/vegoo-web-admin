/**
 * 广告详情页 Mock 数据（模块根统一存放）
 * 路由：/campaign-detail/ad-detail
 * 类型：../campaign-detail/ad-detail/types.ts
 */
import type { AdDetailData } from '../campaign-detail/ad-detail/types'

export const MOCK_AD_DETAIL: AdDetailData = {
  adId: '1',
  adGroupName: 'AdGroup_Android_Male_25-35',
  campaignName: 'USA_Android_T1_Purchase',
  campaignId: '0032021863838Z7',
  status: 'active',

  targeting: {
    geoCode: 'US',
    geoName: '美国',
    platform: 'Android 12+',
    gender: 'Male',
    ageRange: '25-35'
  },

  kpiMetrics: {
    spend: 45000,
    installs: 28000,
    cpi: 1.61,
    roi: 142
  },

  kpiTrends: {
    spend: 'up',
    installs: 'up',
    cpi: 'down',
    roi: 'up'
  },

  trendData: [
    { date: '01-01', spend: 2800, installs: 1600, cpi: 1.75, roi: 98 },
    { date: '01-02', spend: 3200, installs: 1900, cpi: 1.68, roi: 105 },
    { date: '01-03', spend: 3500, installs: 2100, cpi: 1.67, roi: 108 },
    { date: '01-04', spend: 3900, installs: 2400, cpi: 1.63, roi: 118 },
    { date: '01-05', spend: 4100, installs: 2500, cpi: 1.64, roi: 115 },
    { date: '01-06', spend: 4400, installs: 2750, cpi: 1.6, roi: 122 },
    { date: '01-07', spend: 4600, installs: 2900, cpi: 1.59, roi: 128 }
  ],

  creatives: [
    {
      id: 'CR58392',
      type: 'video',
      name: 'Video_Male_25-35_v1.mp4',
      thumbnail: '',
      spend: 25000,
      installs: 16000,
      ctr: 3.2,
      cvr: 45,
      cpi: 1.56,
      roi: 155,
      status: 'active'
    },
    {
      id: 'CR58401',
      type: 'video',
      name: 'Video_Male_25-35_v2.mp4',
      thumbnail: '',
      spend: 25000,
      installs: 16000,
      ctr: 3.2,
      cvr: 45,
      cpi: 1.56,
      roi: 155,
      status: 'active'
    },
    {
      id: 'CR10948',
      type: 'image',
      name: 'Banner_Male_25-35_a.jpg',
      thumbnail: '',
      spend: 25000,
      installs: 16000,
      ctr: 3.2,
      cvr: 45,
      cpi: 1.56,
      roi: 155,
      status: 'active'
    },
    {
      id: 'CR10952',
      type: 'image',
      name: 'Banner_Male_25-35_b.jpg',
      thumbnail: '',
      spend: 25000,
      installs: 16000,
      ctr: 3.2,
      cvr: 45,
      cpi: 1.56,
      roi: 155,
      status: 'paused'
    }
  ],

  creativeSuggestion:
    '视频素材 #CR58392 的表现最佳 (ROI 155%)，建议为此类素材创建更多变体或增加预算。图片素材 #CR10948 的 CP 较高，建议暂停观察。'
}
