/**
 * 评论与评分监控 - Mock 实现
 * 与 mock/backend-api 契约及 api-mock/*.json 对齐
 */
import type {
  GlobalFilter,
  DetailFilter,
  SummaryData,
  ReviewListData,
  ReplyTemplate
} from '@/api/product-operations/reviews-ratings-monitor'

import {
  mockSummaryData,
  mockReviewList,
  mockTemplates
} from '@/api/product-operations/reviews-ratings-monitor'

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Mock: 汇总分析 */
export async function mockFetchOverviewSummary(filter: GlobalFilter): Promise<SummaryData> {
  void filter
  await delay(600)
  return mockSummaryData
}

/** Mock: 评论明细列表 */
export async function mockFetchTableList(filter: DetailFilter): Promise<ReviewListData> {
  await delay(400)
  const filtered = mockReviewList.list.filter((r) => {
    if (filter.starRating != null && r.starRating !== filter.starRating) return false
    if (filter.keyword && !r.content.includes(filter.keyword)) return false
    if (filter.replied === 'yes' && !r.replied) return false
    if (filter.replied === 'no' && r.replied) return false
    if (filter.reviewType && filter.reviewType !== '') {
      const rt = filter.reviewType
      if (rt === 'positive' || rt === 'negative' || rt === 'neutral') {
        if (r.sentiment !== rt) return false
      } else if (rt === 'ads') {
        if (!r.content.includes('广告')) return false
      } else if (rt === 'feature') {
        if (!r.content.includes('功能') && !r.content.includes('建议')) return false
      } else if (rt === 'bug') {
        const c = r.content.toLowerCase()
        if (!c.includes('崩溃') && !c.includes('bug')) return false
      } else if (r.sentiment !== rt) {
        return false
      }
    }
    if (filter.autoReplied === 'yes' && !r.autoReplied) return false
    if (filter.autoReplied === 'no' && r.autoReplied) return false
    return true
  })

  const start = (filter.page - 1) * filter.pageSize
  const list = filtered.slice(start, start + filter.pageSize)

  return {
    total: filtered.length,
    page: filter.page,
    pageSize: filter.pageSize,
    list
  }
}

/** Mock: 回复评论 */
export async function mockFetchReplyAction(reviewId: string, content: string): Promise<void> {
  void reviewId
  void content
  await delay(500)
}

/** Mock: AI 自动生成回复 */
export async function mockFetchAutoReply(reviewId: string, content: string): Promise<string> {
  void reviewId
  await delay(800)
  return `感谢您的反馈！针对您提到的"${content.slice(0, 10)}..."问题，我们团队已收到并正在处理，感谢您的耐心等待。`
}

/** Mock: 回复模板列表 */
export async function mockFetchTemplates(): Promise<ReplyTemplate[]> {
  return mockTemplates
}
