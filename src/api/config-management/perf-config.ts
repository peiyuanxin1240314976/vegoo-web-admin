/**
 * 配置管理 · 绩效配置 API（与 `views/config-management/perf-config` 对齐）
 */
import request from '@/utils/http'
import type {
  PerfConfigItem,
  PerfStep1Form,
  PerfStep2Form,
  SaveMode
} from '@/views/config-management/perf-config/types'

/** 绩效配置分页列表 */
export function fetchPerfTable(params: {
  page: number
  pageSize: number
  keyword?: string
  appPlatform?: string
  adPlatform?: string
  status?: string
}) {
  return request.post<Api.Common.PaginatedResponse<PerfConfigItem>>({
    url: '/api/config-management/perf-config/table',
    data: params,
    showErrorMessage: false
  })
}

/** 新建绩效配置（支持草稿 / 直接发布） */
export function createPerfConfig(data: {
  step1: PerfStep1Form
  step2: PerfStep2Form
  saveMode: SaveMode
}) {
  return request.post<PerfConfigItem>({
    url: '/api/config-management/perf-config',
    data,
    showErrorMessage: false
  })
}

/** 激活指定版本 */
export function activatePerfConfig(id: string, version: number) {
  return request.post<PerfConfigItem>({
    url: `/api/config-management/perf-config/${id}/activate`,
    data: { version },
    showErrorMessage: false
  })
}

/** 导出绩效配置列表 */
export function exportPerfConfig(params: {
  keyword?: string
  appPlatform?: string
  adPlatform?: string
  status?: string
}) {
  return request.post<unknown>({
    url: '/api/config-management/perf-config/export',
    data: params,
    showErrorMessage: false
  })
}
