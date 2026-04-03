/**
 * 用户增长 - 转化管理 API
 *
 * 筛选项（应用/广告平台等公用维度）：请使用 `fetchComprehensiveAnalysisFilterOptions`（`./comprehensive-analysis`），勿单独请求已废弃的 `conversion-management/meta-filter-options`。
 * 联调路径与 POST 契约以 `views/user-growth/conversion-management/mock/backend-api/README.md` 为准；下方部分方法仍为历史占位。
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'

const USER_GROWTH_ANALYSIS_BASE = `${ANALYSIS_API_BASE}/user-growth`

/** 获取转化映射列表（占位：可先使用 views 下 mock 的 fetchConversionMappingListMock） */
export function fetchConversionMappingList(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Api.UserGrowth.ConversionMappingList>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/list`,
    params
  })
}

/** 获取转化映射详情（占位） */
export function fetchConversionMappingDetail(id: string) {
  return request.get<Api.UserGrowth.ConversionMappingItem>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/${id}`
  })
}

/** 新增转化映射（占位） */
export function createConversionMapping(data: Record<string, unknown>) {
  return request.post<unknown>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping`,
    data
  })
}

/** 更新转化映射（占位） */
export function updateConversionMapping(id: string, data: Record<string, unknown>) {
  return request.put<unknown>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/${id}`,
    data
  })
}

/** 删除转化映射（占位） */
export function deleteConversionMapping(id: string) {
  return request.del<unknown>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/${id}`
  })
}

/** 获取转化管理右侧统计（占位） */
export function fetchConversionStats() {
  return request.get<{
    typeDistribution: Api.UserGrowth.ConversionTypeDistributionItem[]
    mappingStats: Api.UserGrowth.MappingStats
    platformStats: Api.UserGrowth.PlatformStats
  }>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/stats`
  })
}

/** 导出映射表（占位） */
export function exportMappingTable(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Blob>({
    url: `${USER_GROWTH_ANALYSIS_BASE}/conversion-mapping/export`,
    params,
    responseType: 'blob'
  })
}
