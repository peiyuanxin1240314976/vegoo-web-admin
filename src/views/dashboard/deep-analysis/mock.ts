/**
 * 广告系列深度分析 - Mock 数据
 * 后续可替换为 API：GET /api/dashboard/deep-analysis/...
 */

/** 汇总指标 */
export interface SummaryStats {
  totalSpend: number
  totalCpi: number
  cumulativeRoi: number
  estimatedProfit: number
}

/** 按广告系列汇总 - 行 */
export interface CampaignSummaryRow {
  id: string
  campaignName: string
  spend: number
  cpi: number
  clickRate: number
  conversionRate: number
  d0Roi: number
  d3Roi: number
  d7Roi: number
  cumulativeRoi: number
  estimatedProfit: number
  /** 按日期展开数据 */
  dateBreakdown?: DateBreakdownRow[]
}

/** 按日期展开 - 行 */
export interface DateBreakdownRow {
  date: string
  spend: number
  cpi: number
  installs: number
  clickRate: number
  conversionRate: number
  d0Roi: number
  d3Roi: number
  d7Roi: number
  cumulativeRoi: number
  estimatedProfit: number
  /** 按国家展开数据 */
  countryBreakdown?: CountryBreakdownRow[]
}

/** 按国家展开 - 行 */
export interface CountryBreakdownRow {
  country: string
  countryCode: string
  spend: number
  cpi: number
  installs: number
  clickRate: number
  conversionRate: number
  d0Roi: number
  d3Roi: number
  d7Roi: number
  cumulativeRoi: number
  estimatedProfit: number
}

export const MOCK_SUMMARY_STATS: SummaryStats = {
  totalSpend: 12113,
  totalCpi: 0.21,
  cumulativeRoi: 94,
  estimatedProfit: -843
}

export const MOCK_CAMPAIGN_SUMMARY: CampaignSummaryRow[] = [
  {
    id: '1',
    campaignName: 'PT_262_as_3.0_17geo_0929_h2',
    spend: 12113,
    cpi: 0.21,
    clickRate: 2.2,
    conversionRate: 30.5,
    d0Roi: 83,
    d3Roi: 93,
    d7Roi: 94,
    cumulativeRoi: 94,
    estimatedProfit: -843,
    dateBreakdown: [
      {
        date: '2026-01-27',
        spend: 1938,
        cpi: 0.2,
        installs: 9789,
        clickRate: 1.9,
        conversionRate: 27.7,
        d0Roi: 85,
        d3Roi: -1,
        d7Roi: -1,
        cumulativeRoi: 85,
        estimatedProfit: -302,
        countryBreakdown: []
      },
      {
        date: '2026-01-26',
        spend: 2642,
        cpi: 0.24,
        installs: 11183,
        clickRate: 2.0,
        conversionRate: 28.3,
        d0Roi: 79,
        d3Roi: -1,
        d7Roi: -1,
        cumulativeRoi: 85,
        estimatedProfit: -398,
        countryBreakdown: [
          {
            country: '美国',
            countryCode: 'US',
            spend: 856,
            cpi: 1.05,
            installs: 815,
            clickRate: 2.1,
            conversionRate: 35.2,
            d0Roi: 75,
            d3Roi: -1,
            d7Roi: -1,
            cumulativeRoi: 85,
            estimatedProfit: -214
          },
          {
            country: '墨西哥',
            countryCode: 'MX',
            spend: 485,
            cpi: 0.16,
            installs: 3031,
            clickRate: 2.3,
            conversionRate: 32.1,
            d0Roi: 95,
            d3Roi: -1,
            d7Roi: -1,
            cumulativeRoi: 102,
            estimatedProfit: 9.7
          },
          {
            country: '哥伦比亚',
            countryCode: 'CO',
            spend: 312,
            cpi: 0.1,
            installs: 3120,
            clickRate: 2.0,
            conversionRate: 28.5,
            d0Roi: 82,
            d3Roi: -1,
            d7Roi: -1,
            cumulativeRoi: 88,
            estimatedProfit: -37.4
          }
        ]
      },
      {
        date: '2026-01-25',
        spend: 2025,
        cpi: 0.23,
        installs: 8720,
        clickRate: 2.3,
        conversionRate: 30.9,
        d0Roi: 83,
        d3Roi: 96,
        d7Roi: 96,
        cumulativeRoi: 96,
        estimatedProfit: -94.3,
        countryBreakdown: []
      }
    ]
  },
  {
    id: '2',
    campaignName: 'PT_262_as_3.0_ww_0917_T',
    spend: 5893,
    cpi: 0.19,
    clickRate: 2.1,
    conversionRate: 29.5,
    d0Roi: 88,
    d3Roi: 98,
    d7Roi: 98,
    cumulativeRoi: 99,
    estimatedProfit: -60.9,
    dateBreakdown: []
  },
  {
    id: '3',
    campaignName: 'PT_262_as_3.0_60geo_1105',
    spend: 3166,
    cpi: 0.1,
    clickRate: 2.1,
    conversionRate: 21.1,
    d0Roi: 89,
    d3Roi: 99,
    d7Roi: 98,
    cumulativeRoi: 99,
    estimatedProfit: -48.2,
    dateBreakdown: []
  }
]

/** 筛选选项 */
export const MOCK_APP_OPTIONS = ['PhoneTracker2', 'Weather8', 'BloodSugar2']
export const MOCK_PLATFORM_OPTIONS = ['Google Ads', 'Facebook', 'TikTok']
export const MOCK_AD_ACCOUNT_OPTIONS = ['523-793-2262', '523-793-2263', '523-793-2264']
