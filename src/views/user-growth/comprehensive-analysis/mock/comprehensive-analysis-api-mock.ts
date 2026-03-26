import type {
  AppCpiRankItem,
  ComprehensiveAnalysisApiParams,
  ComprehensiveAnalysisFilterOptions,
  EcpmAnalysis,
  KpiCard,
  PlatformCpiBarData,
  PlatformCpiTrend,
  AlertItem,
  CountryCpiMapItem,
  CountryCpiTopItem
} from '../types'
import {
  buildMockComprehensiveAnalysisData,
  MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS
} from './data'

export function mockFetchComprehensiveAnalysisMetaFilterOptions() {
  return Promise.resolve<ComprehensiveAnalysisFilterOptions>(
    MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS
  )
}

export function mockFetchComprehensiveAnalysisKpi(params: ComprehensiveAnalysisApiParams) {
  return Promise.resolve<KpiCard[]>(buildMockComprehensiveAnalysisData(params).kpis)
}

export function mockFetchComprehensiveAnalysisPlatformCpiBar(
  params: ComprehensiveAnalysisApiParams
) {
  return Promise.resolve<PlatformCpiBarData>(
    buildMockComprehensiveAnalysisData(params).platformCpiBar
  )
}

export function mockFetchComprehensiveAnalysisAppCpiRank(params: ComprehensiveAnalysisApiParams) {
  return Promise.resolve<AppCpiRankItem[]>(buildMockComprehensiveAnalysisData(params).appCpiRank)
}

export function mockFetchComprehensiveAnalysisCountryDistribution(
  params: ComprehensiveAnalysisApiParams
) {
  const d = buildMockComprehensiveAnalysisData(params)
  return Promise.resolve<{ mapItems: CountryCpiMapItem[]; top8: CountryCpiTopItem[] }>({
    mapItems: d.countryCpiMap,
    top8: d.countryTop8
  })
}

export function mockFetchComprehensiveAnalysisAlerts(params: ComprehensiveAnalysisApiParams) {
  return Promise.resolve<AlertItem[]>(buildMockComprehensiveAnalysisData(params).alerts)
}

export function mockFetchComprehensiveAnalysisPlatformCpiTrend(
  params: ComprehensiveAnalysisApiParams
) {
  return Promise.resolve<PlatformCpiTrend>(
    buildMockComprehensiveAnalysisData(params).platformCpiTrend
  )
}

export function mockFetchComprehensiveAnalysisEcpmAnalysis(params: ComprehensiveAnalysisApiParams) {
  return Promise.resolve<EcpmAnalysis>(buildMockComprehensiveAnalysisData(params).ecpmAnalysis)
}
