import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import {
  isPerformanceAnalysisEndpointMock,
  PerformanceAnalysisEndpoint
} from '@/views/user-growth/performance-analysis/config/data-source'
import { mockFetchPerformanceCompareCandidates } from '@/views/user-growth/performance-analysis/mock/performance-analysis-api-mock'

export interface PerformanceCompareCandidatesRequest {
  startDate: string
  endDate: string
  personFilter?: string
  appFilter?: string
  statusFilter?: string
  keyword?: string
  excludeIds: string[]
  current?: number
  size?: number
}

export interface PerformanceCompareCandidatesItem {
  id: string
  name: string
  level: string
  status: string
  statusClass: string
  score: number
}

export interface PerformanceCompareCandidatesResponse {
  list: PerformanceCompareCandidatesItem[]
  total: number
}

export const PERFORMANCE_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/user-growth/performance-analysis`

export function fetchPerformanceCompareCandidates(body: PerformanceCompareCandidatesRequest) {
  if (isPerformanceAnalysisEndpointMock(PerformanceAnalysisEndpoint.CompareCandidates)) {
    return mockFetchPerformanceCompareCandidates(body)
  }
  return request.post<PerformanceCompareCandidatesResponse>({
    url: `${PERFORMANCE_ANALYSIS_BASE}/compare-candidates`,
    data: body
  })
}
