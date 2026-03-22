/**
 * 用户增长 - 广告平台分析详情（从综合分析 drill-down 进入）（当前为 mock）
 */
import { buildMockPlatformAnalysisDetailData } from '@/views/user-growth/platform-analysis-detail/mock/data'

/** 广告平台分析详情页（当前：mock；后端：`POST /api/user-growth/platform-analysis-detail/overview`） */
export function fetchPlatformAnalysisDetailData(params: { name: string; from: string }) {
  return Promise.resolve(buildMockPlatformAnalysisDetailData(params))
}
