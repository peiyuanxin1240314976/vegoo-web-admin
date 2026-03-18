/**
 * 用户增长 - 转化管理 API
 * 占位接口，后端就绪后替换 URL 与实现
 */
import request from '@/utils/http'

/** 获取转化映射列表（占位：可先使用 views 下 mock 的 fetchConversionMappingListMock） */
export function fetchConversionMappingList(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Api.UserGrowth.ConversionMappingList>({
    url: '/api/user-growth/conversion-mapping/list',
    params
  })
}

/** 获取转化映射详情（占位） */
export function fetchConversionMappingDetail(id: string) {
  return request.get<Api.UserGrowth.ConversionMappingItem>({
    url: `/api/user-growth/conversion-mapping/${id}`
  })
}

/** 新增转化映射（占位） */
export function createConversionMapping(data: Record<string, unknown>) {
  return request.post<unknown>({
    url: '/api/user-growth/conversion-mapping',
    data
  })
}

/** 更新转化映射（占位） */
export function updateConversionMapping(id: string, data: Record<string, unknown>) {
  return request.put<unknown>({
    url: `/api/user-growth/conversion-mapping/${id}`,
    data
  })
}

/** 删除转化映射（占位） */
export function deleteConversionMapping(id: string) {
  return request.del<unknown>({
    url: `/api/user-growth/conversion-mapping/${id}`
  })
}

/** 获取转化管理右侧统计（占位） */
export function fetchConversionStats() {
  return request.get<{
    typeDistribution: Api.UserGrowth.ConversionTypeDistributionItem[]
    mappingStats: Api.UserGrowth.MappingStats
    platformStats: Api.UserGrowth.PlatformStats
  }>({
    url: '/api/user-growth/conversion-mapping/stats'
  })
}

/** 导出映射表（占位） */
export function exportMappingTable(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Blob>({
    url: '/api/user-growth/conversion-mapping/export',
    params,
    responseType: 'blob'
  })
}
