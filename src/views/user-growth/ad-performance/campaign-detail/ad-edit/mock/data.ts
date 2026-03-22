/**
 * 编辑页表单 Mock（与 types.ts、子组件默认值一致）
 */
import type { AdEditFormData } from '../types'

export const MOCK_AD_EDIT_FORM: AdEditFormData = {
  basic: {
    name: '',
    app: 'Weather5',
    region: 'US',
    channel: ''
  },
  budget: {
    dailyBudget: 500,
    totalBudget: '15,000',
    scheduleType: 'always',
    startDate: '2026-01-15',
    endDate: '2026-03-31',
    bidStrategy: 'target_cpi',
    bidValue: '3.50'
  },
  targeting: {
    devicePhone: true,
    deviceTablet: false,
    iosMin: 14,
    androidMin: 10,
    ageRange: [18, 45],
    gender: 'all'
  },
  creatives: {
    items: [
      { id: 'c1', name: 'Banner_US_v1', thumb: 'https://picsum.photos/seed/c1/160/100' },
      { id: 'c2', name: 'Video_30s_v2', thumb: 'https://picsum.photos/seed/c2/160/100' },
      { id: 'c3', name: 'Native_v3', thumb: 'https://picsum.photos/seed/c3/160/100' },
      { id: 'c4', name: 'Banner_UK_v1', thumb: 'https://picsum.photos/seed/c4/160/100' },
      { id: 'c5', name: 'Video_15s_v1', thumb: 'https://picsum.photos/seed/c5/160/100' },
      { id: 'c6', name: 'Interstitial_v2', thumb: 'https://picsum.photos/seed/c6/160/100' }
    ],
    selectedIds: ['c1', 'c3']
  },
  sidebar: {
    refItems: [
      { id: 'r1', name: 'Weather5_US_Q4', roi: '3.2x', cpi: '2.80', spend: '12,400' },
      { id: 'r2', name: 'Weather5_UK_Jan', roi: '2.9x', cpi: '3.10', spend: '8,200' },
      { id: 'r3', name: 'BloodSugar_US_v2', roi: '3.5x', cpi: '2.50', spend: '15,600' }
    ],
    tips: [
      '建议将日预算设置在目标 CPI 的 10 倍以上，以获得足够的学习数据。',
      '投放初期建议选择"持续投放"，让算法充分优化再切换自定义时间。',
      '素材至少上传 3 组以上，多样化素材有助于提升整体 CTR。'
    ],
    budgetForecastValues: [480, 510, 495, 520, 505, 530, 515, 540, 525, 550, 535, 560, 545, 580]
  }
}
