/**
 * 商品运营 - 评论与评分监控
 * 与 views/.../mock/backend-api 契约 1:1；数据源开关见页面 config/data-source.ts
 */
import request from '@/utils/http'
import {
  ReviewMonitorEndpoint,
  isReviewMonitorEndpointMock
} from '@/views/product-operations/reviews-ratings-monitor/config/data-source'
import * as reviewMonitorMock from '@/views/product-operations/reviews-ratings-monitor/mock/review-monitor-api-mock'
import { toAppsRequestBody } from '@/utils/app-id-request'

const BASE_URL = '/api/v1/datacenter/analysis/product-operations/reviews-ratings-monitor'

// ─────────────────────────────────────────────
// 类型定义（与 backend-api 契约一致）
// ─────────────────────────────────────────────
export interface GlobalFilter {
  /** 顶栏应用范围；单选页：`[]` 不限，`[id]` 某一应用（与 cockpit `settingApps.sAppId` 一致） */
  appIds: string[]
  platform?: string
  startDate?: string
  endDate?: string
  language?: string
}

function withApps<T extends { appIds: string[] }>(filter: T) {
  return {
    ...filter,
    apps: toAppsRequestBody(filter.appIds)
  }
}

export interface KpiMetrics {
  avgRating: number
  avgRatingDelta: number
  newReviews: number
  newReviewsPct: number
  positiveRate: number
  positiveRateDelta: number
  negativeRate: number
  negativeRateDelta: number
  pendingReply: number
}

export interface RatingDistributionItem {
  star: number
  count: number
  percent: number
}

export interface DailyReviewItem {
  date: string
  star1: number
  star2: number
  star3: number
  star4: number
  star5: number
  total: number
}

export interface AppRankItem {
  appName: string
  count: number
}

/** 近 N 日评分走势点（与订单退款分析 types 中 TrendPoint 区分命名，避免 barrel 重导出冲突） */
export interface RatingTrendPoint {
  date: string
  rating: number
}

export interface ReviewTypeItem {
  type: string
  count: number
  color?: string
}

export interface LanguageItem {
  language: string
  displayName: string
  percent: number
}

export interface DeviceItem {
  device: string
  percent: number
}

export interface TopicWord {
  word: string
  weight: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface ComplaintTopic {
  topic: string
  count: number
}

export interface SummaryData {
  kpi: KpiMetrics
  ratingDistribution: RatingDistributionItem[]
  dailyReviews: DailyReviewItem[]
  appTopList: AppRankItem[]
  trend30Days: RatingTrendPoint[]
  reviewTypes: ReviewTypeItem[]
  languageDistribution: LanguageItem[]
  deviceDistribution: DeviceItem[]
  topicWords: TopicWord[]
  complaintTopics: ComplaintTopic[]
}

export interface DetailFilter extends GlobalFilter {
  starRating?: number | null
  reviewType?: string
  replied?: string
  autoReplied?: string
  keyword?: string
  sortBy?: 'latest' | 'oldest' | 'rating_asc' | 'rating_desc'
  page: number
  pageSize: number
}

export interface ReviewItem {
  id: string
  userId: string
  userName: string
  avatar?: string
  starRating: number
  content: string
  date: string
  platform: 'google_play' | 'app_store'
  appName: string
  appVersion: string
  countryCode: string
  language: string
  sentiment: 'positive' | 'negative' | 'neutral'
  replied: boolean
  autoReplied: boolean
  replyContent?: string
  replyDate?: string
}

export interface ReviewListData {
  total: number
  page: number
  pageSize: number
  list: ReviewItem[]
}

export interface ReplyTemplate {
  id: string
  title: string
  content: string
}

// ─────────────────────────────────────────────
// Mock 源数据（与 mock/api-mock、契约 sampleResponse 对齐）
// ─────────────────────────────────────────────
export const mockSummaryData: SummaryData = {
  kpi: {
    avgRating: 4.2,
    avgRatingDelta: 0.1,
    newReviews: 1284,
    newReviewsPct: 18,
    positiveRate: 78.5,
    positiveRateDelta: 2.3,
    negativeRate: 8.2,
    negativeRateDelta: -0.5,
    pendingReply: 23
  },
  ratingDistribution: [
    { star: 5, count: 619, percent: 62 },
    { star: 4, count: 160, percent: 16 },
    { star: 3, count: 79, percent: 8 },
    { star: 2, count: 60, percent: 6 },
    { star: 1, count: 79, percent: 8 }
  ],
  dailyReviews: [
    { date: '2/28', star1: 14, star2: 10, star3: 20, star4: 50, star5: 87, total: 181 },
    { date: '2/29', star1: 18, star2: 12, star3: 25, star4: 58, star5: 90, total: 203 },
    { date: '3/1', star1: 12, star2: 8, star3: 15, star4: 40, star5: 63, total: 138 },
    { date: '3/2', star1: 16, star2: 10, star3: 22, star4: 50, star5: 80, total: 178 },
    { date: '3/4', star1: 15, star2: 10, star3: 20, star4: 52, star5: 85, total: 182 },
    { date: '3/5', star1: 10, star2: 6, star3: 12, star4: 30, star5: 48, total: 106 }
  ],
  appTopList: [
    { appName: 'ClapFinder', count: 219 },
    { appName: 'CRMonitor', count: 191 },
    { appName: 'Weather5', count: 80 },
    { appName: 'WeatherS', count: 73 },
    { appName: 'PhoneTracker', count: 52 },
    { appName: 'VideoDominos', count: 48 }
  ],
  trend30Days: [
    { date: '2/6', rating: 4.05 },
    { date: '2/10', rating: 4.08 },
    { date: '2/13', rating: 4.06 },
    { date: '2/14', rating: 4.1 },
    { date: '2/28', rating: 4.05 },
    { date: '2/30', rating: 4.12 },
    { date: '3/1', rating: 4.08 },
    { date: '3/5', rating: 4.15 },
    { date: '3/6', rating: 4.2 }
  ],
  reviewTypes: [
    { type: '正面评价', count: 658, color: '#00d4aa' },
    { type: '其他', count: 104, color: '#4e8ef7' },
    { type: '广告过多', count: 67, color: '#f59e0b' },
    { type: '价格过高', count: 36, color: '#f97316' },
    { type: '功能问题', count: 29, color: '#ef4444' },
    { type: '内容问题', count: 23, color: '#e879f9' },
    { type: '功能建议', count: 20, color: '#8b5cf6' },
    { type: 'BUG', count: 20, color: '#ef4444' }
  ],
  languageDistribution: [
    { language: 'en', displayName: 'English', percent: 26.9 },
    { language: 'es', displayName: 'Spanish', percent: 15.2 },
    { language: 'pt', displayName: 'Português', percent: 12.6 },
    { language: 'sz', displayName: 'Szdah...', percent: 8.6 },
    { language: 'zh', displayName: '英语', percent: 6.2 },
    { language: 'tr', displayName: 'Transg...', percent: 1.3 },
    { language: 'other', displayName: '其他', percent: 29.2 }
  ],
  deviceDistribution: [
    { device: '未知', percent: 23.7 },
    { device: 'Samsung a06', percent: 10.2 },
    { device: 'Samsung a06', percent: 9.2 },
    { device: 'Devic 28', percent: 5.7 },
    { device: 'Devic 22', percent: 3.7 },
    { device: 'Samsung a06', percent: 3.2 },
    { device: '其他', percent: 44.3 }
  ],
  topicWords: [
    { word: 'smooth', weight: 8, sentiment: 'positive' },
    { word: 'crash', weight: 10, sentiment: 'negative' },
    { word: 'helpful', weight: 7, sentiment: 'positive' },
    { word: '崩溃', weight: 9, sentiment: 'negative' },
    { word: '广告', weight: 6, sentiment: 'negative' },
    { word: '卡顿', weight: 7, sentiment: 'negative' },
    { word: 'easy to use', weight: 9, sentiment: 'positive' },
    { word: 'expensive', weight: 5, sentiment: 'negative' },
    { word: 'keyword', weight: 4, sentiment: 'neutral' },
    { word: 'slow', weight: 5, sentiment: 'negative' },
    { word: 'healthy', weight: 6, sentiment: 'positive' },
    { word: 'camora', weight: 4, sentiment: 'neutral' }
  ],
  complaintTopics: [
    { topic: '崩溃', count: 625 },
    { topic: '卡顿', count: 380 },
    { topic: '价格', count: 295 },
    { topic: '功能缺失', count: 210 },
    { topic: '广告', count: 150 }
  ]
}

export const mockReviewList: ReviewListData = {
  total: 990,
  page: 1,
  pageSize: 10,
  list: [
    {
      id: '1',
      userId: 'u1',
      userName: '匿名用户',
      starRating: 1,
      content: '应用经常崩溃，希望尽快修复',
      date: '2026-03-05',
      platform: 'google_play',
      appName: 'ClapFinder',
      appVersion: '2.0.8',
      countryCode: 'cn',
      language: 'zh',
      sentiment: 'negative',
      replied: true,
      autoReplied: false,
      replyContent: '这个应用最近更新后就一直崩溃，已经影响我的正常使用。希望尽快修复这个问题。'
    },
    {
      id: '2',
      userId: 'u2',
      userName: 'John M.',
      starRating: 1,
      content: '应用经常崩溃一步，希望快修复，正开帐她五的缘',
      date: '2026-03-05',
      platform: 'google_play',
      appName: 'ClapFinder',
      appVersion: '2.0.8',
      countryCode: 'cn',
      language: 'zh',
      sentiment: 'negative',
      replied: false,
      autoReplied: false
    },
    {
      id: '3',
      userId: 'u3',
      userName: '匿名用户',
      starRating: 1,
      content: '应用经常崩溃，希望尽快修复',
      date: '2026-03-05',
      platform: 'google_play',
      appName: 'ClapFinder',
      appVersion: '2.0.8',
      countryCode: 'cn',
      language: 'zh',
      sentiment: 'negative',
      replied: false,
      autoReplied: false
    },
    {
      id: '4',
      userId: 'u4',
      userName: 'Sarah K.',
      starRating: 1,
      content: '应用经常崩溃，希望尽快修复',
      date: '2026-03-05',
      platform: 'app_store',
      appName: 'ClapFinder',
      appVersion: '2.0.8',
      countryCode: 'cn',
      language: 'zh',
      sentiment: 'negative',
      replied: false,
      autoReplied: false
    },
    {
      id: '5',
      userId: 'u5',
      userName: 'Emma W.',
      starRating: 1,
      content: '应用经常崩溃，希望尽快修复',
      date: '2026-03-05',
      platform: 'google_play',
      appName: 'ClapFinder',
      appVersion: '2.0.8',
      countryCode: 'cn',
      language: 'zh',
      sentiment: 'negative',
      replied: false,
      autoReplied: false
    },
    {
      id: '6',
      userId: 'u6',
      userName: 'Alex T.',
      starRating: 5,
      content: 'Great app! Works perfectly after the update.',
      date: '2026-03-04',
      platform: 'app_store',
      appName: 'ClapFinder',
      appVersion: '2.0.8',
      countryCode: 'us',
      language: 'en',
      sentiment: 'positive',
      replied: true,
      autoReplied: true
    },
    {
      id: '7',
      userId: 'u7',
      userName: 'Maria G.',
      starRating: 4,
      content: 'Very smooth and easy to use. Minor UI improvements needed.',
      date: '2026-03-04',
      platform: 'google_play',
      appName: 'Weather5',
      appVersion: '1.3.2',
      countryCode: 'es',
      language: 'es',
      sentiment: 'positive',
      replied: false,
      autoReplied: false
    },
    {
      id: '8',
      userId: 'u8',
      userName: '用户88888',
      starRating: 2,
      content: '广告太多了，严重影响使用体验',
      date: '2026-03-03',
      platform: 'google_play',
      appName: 'VideoDominos',
      appVersion: '3.1.0',
      countryCode: 'cn',
      language: 'zh',
      sentiment: 'negative',
      replied: false,
      autoReplied: false
    },
    {
      id: '9',
      userId: 'u9',
      userName: 'Lee',
      starRating: 3,
      content: '还可以，无功无过，期待后续优化',
      date: '2026-03-03',
      platform: 'google_play',
      appName: 'Weather5',
      appVersion: '1.2.0',
      countryCode: 'es',
      language: 'zh',
      sentiment: 'neutral',
      replied: false,
      autoReplied: false
    },
    {
      id: '10',
      userId: 'u10',
      userName: 'Chen',
      starRating: 4,
      content: '希望尽快增加暗黑模式功能，现在晚上用太刺眼',
      date: '2026-03-02',
      platform: 'google_play',
      appName: 'ClapFinder',
      appVersion: '2.0.7',
      countryCode: 'cn',
      language: 'zh',
      sentiment: 'positive',
      replied: false,
      autoReplied: false
    }
  ]
}

export const mockTemplates: ReplyTemplate[] = [
  {
    id: 't1',
    title: '崩溃问题回复',
    content:
      '非常抱歉给您带来不便，我们已经注意到这个问题，正在紧急修复中，预计下个版本更新时解决。感谢您的反馈！'
  },
  {
    id: 't2',
    title: '好评感谢模板',
    content: '感谢您的五星好评！您的支持是我们前进的动力，我们会持续优化产品体验。'
  },
  {
    id: 't3',
    title: '功能建议回复',
    content:
      '非常感谢您的建议！我们已将您的需求记录，团队会认真评估并在后续版本中考虑加入，请继续关注我们的更新。'
  }
]

// ─────────────────────────────────────────────
// API 请求方法（按 config 分支 mock / remote）
// ─────────────────────────────────────────────
export const reviewMonitorApi = {
  async getSummary(filter: GlobalFilter): Promise<SummaryData> {
    if (isReviewMonitorEndpointMock(ReviewMonitorEndpoint.OverviewSummary)) {
      return reviewMonitorMock.mockFetchOverviewSummary(filter)
    }
    return request.post<SummaryData>({
      url: `${BASE_URL}/overview/summary`,
      data: withApps(filter)
    })
  },

  async getList(filter: DetailFilter): Promise<ReviewListData> {
    if (isReviewMonitorEndpointMock(ReviewMonitorEndpoint.TableList)) {
      return reviewMonitorMock.mockFetchTableList(filter)
    }
    return request.post<ReviewListData>({
      url: `${BASE_URL}/table/list`,
      data: withApps(filter)
    })
  },

  async replyReview(reviewId: string, content: string): Promise<void> {
    if (isReviewMonitorEndpointMock(ReviewMonitorEndpoint.ReplyAction)) {
      return reviewMonitorMock.mockFetchReplyAction(reviewId, content)
    }
    return request.post<void>({
      url: `${BASE_URL}/reply`,
      data: { reviewId, content }
    })
  },

  async autoGenerateReply(reviewId: string, content: string): Promise<string> {
    if (isReviewMonitorEndpointMock(ReviewMonitorEndpoint.AutoReply)) {
      return reviewMonitorMock.mockFetchAutoReply(reviewId, content)
    }
    const res = await request.post<{ reply: string }>({
      url: `${BASE_URL}/auto-reply`,
      data: { reviewId, content }
    })
    return res.reply
  },

  async getTemplates(): Promise<ReplyTemplate[]> {
    if (isReviewMonitorEndpointMock(ReviewMonitorEndpoint.Templates)) {
      return reviewMonitorMock.mockFetchTemplates()
    }
    return request.get<ReplyTemplate[]>({
      url: `${BASE_URL}/templates`
    })
  }
}
