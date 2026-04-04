/**
 * 综合分析 — 契约级 HTTP Mock（与 `config/data-source.ts`、`mock/backend-api/02~08` 对应）
 *
 * | mockFetch* | 契约文件 |
 * | --- | --- |
 * | mockFetchComprehensiveAnalysisKpi | 02-kpi.json |
 * | mockFetchComprehensiveAnalysisPlatformCpiBar | 03-platform-cpi-bar.json |
 * | mockFetchComprehensiveAnalysisAppCpiRank | 04-app-cpi-rank.json |
 * | mockFetchComprehensiveAnalysisCountryDistribution | 05-country-distribution.json |
 * | mockFetchComprehensiveAnalysisAlerts | 06-alerts.json |
 * | mockFetchComprehensiveAnalysisPlatformCpiTrend | 07-platform-cpi-trend.json |
 * | mockFetchComprehensiveAnalysisEcpmAnalysis | 08-ecpm-analysis.json |
 *
 * 筛选项 **不在此文件**：公用 `GET .../cockpit/meta-filter-options` → `useCockpitMetaFilterStore`。
 * 数据由 `buildMockComprehensiveAnalysisData` 按筛选参数生成；基线见 `mock/data.ts`。
 */
import type {
  AppCpiRankItem,
  ComprehensiveAnalysisApiParams,
  EcpmAnalysis,
  KpiCard,
  PlatformCpiBarData,
  PlatformCpiTrend,
  AlertItem,
  CountryCpiMapItem,
  CountryCpiTopItem
} from '../types'
import { buildMockComprehensiveAnalysisData } from './data'

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
