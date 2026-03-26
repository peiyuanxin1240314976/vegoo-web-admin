export enum PerformanceAnalysisEndpoint {
  CompareCandidates = 'compareCandidates'
}

export const PERFORMANCE_ANALYSIS_USE_MOCK: Record<PerformanceAnalysisEndpoint, boolean> = {
  [PerformanceAnalysisEndpoint.CompareCandidates]: true
}

export function isPerformanceAnalysisEndpointMock(endpoint: PerformanceAnalysisEndpoint): boolean {
  return PERFORMANCE_ANALYSIS_USE_MOCK[endpoint]
}
