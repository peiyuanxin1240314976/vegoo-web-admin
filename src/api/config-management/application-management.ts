/**
 * 配置管理 · 应用管理 API（与 `views/config-management/application-management` 对齐）
 */
import request, { requestBlob } from '@/utils/http'
import FileSaver from 'file-saver'
import { getAppNow } from '@/utils/app-now'
import type {
  ApplicationAppItem,
  ApplicationFilterFormOptions,
  ApplicationFormPayload,
  ApplicationOverviewStats,
  ApplicationOverviewStatsQuery,
  ApplicationTableQuery
} from '@/views/config-management/application-management/types'
import {
  ApplicationEndpoint,
  isApplicationEndpointMock
} from '@/views/config-management/application-management/config/data-source'
import * as applicationMock from '@/views/config-management/application-management/mock/application-api-mock'

const APPLICATION_EXPORT_URL = '/api/v1/datacenter/analysis/config-management/application/export'

function getFilenameFromContentDisposition(value?: string): string | undefined {
  if (!value) return
  const v = String(value)
  const mStar = v.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (mStar?.[1]) {
    try {
      return decodeURIComponent(mStar[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return mStar[1].trim().replace(/^"|"$/g, '')
    }
  }
  const m = v.match(/filename\s*=\s*("?)([^";]+)\1/i)
  if (m?.[2]) return m[2].trim()
}

function inferApplicationExportExtension(contentType: string): string {
  const ct = contentType.toLowerCase()
  if (ct.includes('text/csv') || ct.includes('application/csv')) return 'csv'
  if (ct.includes('spreadsheetml') || ct.includes('excel')) return 'xlsx'
  if (ct.includes('application/json')) return 'json'
  return 'bin'
}

async function downloadApplicationExport(params: Partial<ApplicationTableQuery>) {
  const res = await requestBlob({
    url: APPLICATION_EXPORT_URL,
    method: 'POST',
    data: params,
    headers: { Accept: '*/*' },
    showErrorMessage: false
  })

  const contentType = String(res.headers?.['content-type'] ?? '')
    .split(';')[0]
    .trim()
  const filenameFromHeader = getFilenameFromContentDisposition(res.headers?.['content-disposition'])
  const ext = inferApplicationExportExtension(contentType)
  const fallback = `applications_${getAppNow().getTime()}.${ext}`
  const filename = filenameFromHeader || fallback

  FileSaver.saveAs(res.data, filename)
}

/** 分页列表 */
export function fetchApplicationTable(params: ApplicationTableQuery) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Table)) {
    return applicationMock.mockFetchApplicationTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<ApplicationAppItem>>({
    url: '/api/v1/datacenter/analysis/config-management/application/table',
    data: params,
    showErrorMessage: false
  })
}

/** 顶部统计卡片（与列表契约分离） */
export function fetchApplicationOverviewStats(params: ApplicationOverviewStatsQuery) {
  if (isApplicationEndpointMock(ApplicationEndpoint.OverviewStats)) {
    return applicationMock.mockFetchApplicationOverviewStats(params)
  }
  return request.post<ApplicationOverviewStats>({
    url: '/api/v1/datacenter/analysis/config-management/application/overview-stats',
    data: params,
    showErrorMessage: false
  })
}

/** 筛选与新增/编辑弹窗选项 */
export function fetchApplicationFilterFormOptions() {
  if (isApplicationEndpointMock(ApplicationEndpoint.FilterFormOptions)) {
    return applicationMock.mockFetchApplicationFilterFormOptions()
  }
  return request.post<ApplicationFilterFormOptions>({
    url: '/api/v1/datacenter/analysis/config-management/application/filter-form-options',
    data: {},
    showErrorMessage: false
  })
}

/** 新增应用 */
export function createApplication(data: ApplicationFormPayload) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Create)) {
    return applicationMock.mockCreateApplication(data)
  }
  return request.post<ApplicationAppItem>({
    url: '/api/v1/datacenter/analysis/config-management/application',
    data,
    showErrorMessage: false
  })
}

/** 更新应用 */
export function updateApplication(data: ApplicationFormPayload) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Update)) {
    return applicationMock.mockUpdateApplication(data)
  }
  return request.put<ApplicationAppItem>({
    url: `/api/v1/datacenter/analysis/config-management/application/${data.id}`,
    data,
    showErrorMessage: false
  })
}

/** 删除应用 */
export function deleteApplication(id: string) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Delete)) {
    return applicationMock.mockDeleteApplication(id)
  }
  return request.del<unknown>({
    url: `/api/v1/datacenter/analysis/config-management/application/${id}`,
    showErrorMessage: false
  })
}

/**
 * 导出列表（HTTP 二进制文件流）。
 * Mock：`mockExportApplicationList` 本地 CSV；远程：`requestBlob` + `FileSaver.saveAs`。
 */
export async function exportApplicationList(params: Partial<ApplicationTableQuery>) {
  if (isApplicationEndpointMock(ApplicationEndpoint.Export)) {
    return applicationMock.mockExportApplicationList(params)
  }
  await downloadApplicationExport(params)
}
