/**
 * 配置管理 · 优化师管理 API（与 `views/config-management/optimizer-management` 对齐）
 */
import request, { requestBlob } from '@/utils/http'
import FileSaver from 'file-saver'
import { getAppNow } from '@/utils/app-now'
import {
  OptimizerEndpoint,
  isOptimizerEndpointMock
} from '@/views/config-management/optimizer-management/config/data-source'
import * as optimizerMock from '@/views/config-management/optimizer-management/mock/optimizer-api-mock'

const OPTIMIZER_EXPORT_URL = '/api/v1/datacenter/analysis/config-management/optimizer/export'

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

function inferOptimizerExportExtension(contentType: string): string {
  const ct = contentType.toLowerCase()
  if (ct.includes('text/csv') || ct.includes('application/csv')) return 'csv'
  if (ct.includes('spreadsheetml') || ct.includes('excel')) return 'xlsx'
  if (ct.includes('application/json')) return 'json'
  return 'bin'
}

/** 始终以 blob 落盘；后端 Content-Type / 文件名过渡期不一致时不拦截 */
async function downloadOptimizerExport(params: Partial<Api.ConfigManagement.Optimizer.TableQuery>) {
  const res = await requestBlob({
    url: OPTIMIZER_EXPORT_URL,
    method: 'POST',
    data: params,
    headers: { Accept: '*/*' },
    showErrorMessage: false
  })

  const contentType = String(res.headers?.['content-type'] ?? '')
    .split(';')[0]
    .trim()
  const filenameFromHeader = getFilenameFromContentDisposition(res.headers?.['content-disposition'])
  const ext = inferOptimizerExportExtension(contentType)
  const fallback = `optimizers_${getAppNow().getTime()}.${ext}`
  const filename = filenameFromHeader || fallback

  FileSaver.saveAs(res.data, filename)
}

/** 分页列表（筛选与分页由服务端处理） */
export function fetchOptimizerTable(params: Api.ConfigManagement.Optimizer.TableQuery) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Table)) {
    return optimizerMock.mockFetchOptimizerTable(params)
  }
  return request.post<Api.Common.PaginatedResponse<Api.ConfigManagement.Optimizer.ListItem>>({
    url: '/api/v1/datacenter/analysis/config-management/optimizer/table',
    data: params,
    showErrorMessage: false
  })
}

/** 页头 KPI 卡片 */
export function fetchOptimizerOverview() {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Overview)) {
    return optimizerMock.mockFetchOptimizerOverview()
  }
  return request.post<Api.ConfigManagement.Optimizer.OverviewResponse>({
    url: '/api/v1/datacenter/analysis/config-management/optimizer/overview',
    data: {},
    showErrorMessage: false
  })
}

/** 新建弹窗：可选系统用户列表 */
export function fetchOptimizerMetaSystemUsers() {
  if (isOptimizerEndpointMock(OptimizerEndpoint.MetaSystemUsers)) {
    return optimizerMock.mockFetchOptimizerMetaSystemUsers()
  }
  return request.post<Api.ConfigManagement.Optimizer.MetaSystemUserItem[]>({
    url: '/api/v1/datacenter/analysis/config-management/optimizer/meta-system-users',
    data: {},
    showErrorMessage: false
  })
}

/** 新增优化师 */
export function createOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Create)) {
    return optimizerMock.mockCreateOptimizer(data)
  }
  return request.post<Api.ConfigManagement.Optimizer.ListItem>({
    url: '/api/v1/datacenter/analysis/config-management/optimizer',
    data,
    showErrorMessage: false
  })
}

/** 更新优化师（POST + body 含 id，与契约一致） */
export function updateOptimizer(data: Api.ConfigManagement.Optimizer.FormPayload & { id: string }) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Update)) {
    return optimizerMock.mockUpdateOptimizer(data)
  }
  return request.post<Api.ConfigManagement.Optimizer.ListItem>({
    url: '/api/v1/datacenter/analysis/config-management/optimizer/update',
    data,
    showErrorMessage: false
  })
}

/**
 * 导出列表（HTTP 二进制文件流）。
 * 远程：`@/utils/http` 的 `requestBlob`；Mock：本地生成 CSV 并 `FileSaver.saveAs`。
 */
export async function exportOptimizerList(
  params: Partial<Api.ConfigManagement.Optimizer.TableQuery>
) {
  if (isOptimizerEndpointMock(OptimizerEndpoint.Export)) {
    return optimizerMock.mockExportOptimizerList(params)
  }
  await downloadOptimizerExport(params)
}
