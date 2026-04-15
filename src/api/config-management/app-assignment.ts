/**
 * 配置管理 · 应用分配 API（与 `views/config-management/app-assignment` 对齐）
 */
import request, { requestBlob } from '@/utils/http'
import FileSaver from 'file-saver'
import { getAppNow } from '@/utils/app-now'
import type {
  AppAssignmentItem,
  AppAssignmentMetaAssignableAppsResponse,
  AppAssignmentMetaFilterResponse,
  AppAssignmentMetaVersionsResponse,
  AppAssignmentOverviewResponse,
  AssignmentCreatePayload,
  AssignmentTableQuery,
  AssignmentUpdatePayload
} from '@/views/config-management/app-assignment/types'
import {
  AppAssignmentEndpoint,
  isAppAssignmentEndpointMock
} from '@/views/config-management/app-assignment/config/data-source'
import * as appAssignmentMock from '@/views/config-management/app-assignment/mock/app-assignment-api-mock'

const APP_ASSIGNMENT_EXPORT_URL = '/api/config-management/app-assignment/export'

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

async function downloadAppAssignmentExport(params: Partial<AssignmentTableQuery>) {
  const res = await requestBlob({
    url: APP_ASSIGNMENT_EXPORT_URL,
    method: 'POST',
    data: params,
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*'
    },
    showErrorMessage: false
  })

  const contentType = String(res.headers?.['content-type'] ?? '').toLowerCase()

  if (contentType.includes('application/json')) {
    let text = ''
    try {
      text = await res.data.text()
    } catch {
      /* ignore */
    }
    throw new Error(
      text ? `导出接口未返回文件流（返回 JSON）：${text}` : '导出接口未返回文件流（返回 JSON）'
    )
  }

  const filenameFromHeader = getFilenameFromContentDisposition(res.headers?.['content-disposition'])
  const hasAttachment = !!filenameFromHeader
  if (
    !hasAttachment &&
    !contentType.includes('spreadsheetml') &&
    !contentType.includes('excel') &&
    !contentType.includes('text/csv')
  ) {
    throw new Error(`导出接口未返回可识别的文件流（content-type=${contentType || 'unknown'}）`)
  }
  const ext =
    contentType.includes('text/csv') || contentType.includes('application/csv') ? 'csv' : 'xlsx'
  const fallback = `app-assignment_${getAppNow().getTime()}.${ext}`
  const filename = filenameFromHeader || fallback

  FileSaver.saveAs(res.data, filename)
}

/** 页头 KPI */
export function fetchAppAssignmentOverview() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Overview)) {
    return appAssignmentMock.mockFetchAppAssignmentOverview()
  }
  return request.post<AppAssignmentOverviewResponse>({
    url: '/api/config-management/app-assignment/overview',
    data: {},
    showErrorMessage: false
  })
}

/** 筛选栏下拉 */
export function fetchAppAssignmentMetaFilterOptions() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaFilterOptions)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaFilterOptions()
  }
  return request.post<AppAssignmentMetaFilterResponse>({
    url: '/api/config-management/app-assignment/meta-filter-options',
    data: {},
    showErrorMessage: false
  })
}

/** 新建可选应用 */
export function fetchAppAssignmentMetaAssignableApps() {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaAssignableApps)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaAssignableApps()
  }
  return request.post<AppAssignmentMetaAssignableAppsResponse>({
    url: '/api/config-management/app-assignment/meta-assignable-apps',
    data: {},
    showErrorMessage: false
  })
}

/** 按应用拉取绩效版本 */
export function fetchAppAssignmentMetaPerformanceVersions(body: { appId: string }) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.MetaPerformanceVersions)) {
    return appAssignmentMock.mockFetchAppAssignmentMetaPerformanceVersions(body)
  }
  return request.post<AppAssignmentMetaVersionsResponse>({
    url: '/api/config-management/app-assignment/meta-performance-versions',
    data: body,
    showErrorMessage: false
  })
}

/** 分页列表 */
export function fetchAppAssignmentTable(params: AssignmentTableQuery) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Table)) {
    return appAssignmentMock.mockFetchAppAssignmentTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<AppAssignmentItem>>({
    url: '/api/config-management/app-assignment/table',
    data: params,
    showErrorMessage: false
  })
}

/** 单条详情 */
export function fetchAppAssignmentDetail(body: { id: string }) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Detail)) {
    return appAssignmentMock.mockFetchAppAssignmentDetail(body)
  }
  return request.post<AppAssignmentItem | null>({
    url: '/api/config-management/app-assignment/detail',
    data: body,
    showErrorMessage: false
  })
}

/** 新建分配 */
export function createAppAssignment(data: AssignmentCreatePayload) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Create)) {
    return appAssignmentMock.mockCreateAppAssignment(data)
  }
  return request.post<AppAssignmentItem>({
    url: '/api/config-management/app-assignment',
    data,
    showErrorMessage: false
  })
}

/** 更新分配 */
export function updateAppAssignment(data: AssignmentUpdatePayload) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Update)) {
    return appAssignmentMock.mockUpdateAppAssignment(data)
  }
  return request.post<AppAssignmentItem>({
    url: '/api/config-management/app-assignment/update',
    data,
    showErrorMessage: false
  })
}

/** 导出（文件流，成功后由浏览器保存） */
export async function exportAppAssignmentList(params: Partial<AssignmentTableQuery>) {
  if (isAppAssignmentEndpointMock(AppAssignmentEndpoint.Export)) {
    return appAssignmentMock.mockExportAppAssignmentList(params)
  }
  await downloadAppAssignmentExport(params)
}
