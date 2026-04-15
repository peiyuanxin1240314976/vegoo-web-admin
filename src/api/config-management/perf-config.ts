/**
 * 配置管理 · 绩效配置 API（与 `views/config-management/perf-config` 对齐）
 */
import FileSaver from 'file-saver'
import { getAppNow } from '@/utils/app-now'
import request, { requestBlob } from '@/utils/http'
import {
  PerfConfigApiSource,
  PerfConfigEndpoint
} from '@/views/config-management/perf-config/config/data-source'
import * as perfConfigMock from '@/views/config-management/perf-config/mock/perf-config-api-mock'
import type {
  PerfConfigItem,
  PerfConfigOverviewKpi,
  PerfStep1Form,
  PerfStep2Form,
  SaveMode
} from '@/views/config-management/perf-config/types'

function getFilenameFromContentDisposition(value?: string): string | undefined {
  if (!value) return
  const mStar = String(value).match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (mStar?.[1]) {
    try {
      return decodeURIComponent(mStar[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return mStar[1].trim().replace(/^"|"$/g, '')
    }
  }

  const m = String(value).match(/filename\s*=\s*("?)([^";]+)\1/i)
  return m?.[2]?.trim()
}

/** 顶栏 KPI：与列表相同筛选、全量聚合（非当前页） */
export function fetchPerfOverviewKpi(
  params: {
    keyword?: string
    appId?: string
    platform?: string
    source?: string
    status?: string
  },
  /** Mock 时传入页面完整 `list`，以便含新建未写入 seed 的行 */
  clientList?: PerfConfigItem[]
) {
  if (PerfConfigApiSource[PerfConfigEndpoint.OverviewKpi]) {
    return Promise.resolve(perfConfigMock.computePerfOverviewKpi(params, clientList))
  }
  return request.post<PerfConfigOverviewKpi>({
    url: '/api/config-management/perf-config/overview/kpi',
    data: params,
    showErrorMessage: false
  })
}

/** 绩效配置分页列表 */
export function fetchPerfTable(params: {
  page: number
  pageSize: number
  keyword?: string
  appId?: string
  platform?: string
  source?: string
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

/** 导出绩效配置列表（二进制流；Mock 时本地生成 CSV） */
export async function exportPerfConfig(params: {
  keyword?: string
  appId?: string
  platform?: string
  source?: string
  status?: string
}) {
  if (PerfConfigApiSource[PerfConfigEndpoint.Export]) {
    const { blob, fileName } = await perfConfigMock.mockExportPerfConfigList(params)
    FileSaver.saveAs(blob, fileName)
    return
  }

  const response = await requestBlob({
    url: '/api/config-management/perf-config/export',
    method: 'POST',
    data: params,
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*'
    }
  })

  const fileName =
    getFilenameFromContentDisposition(response.headers?.['content-disposition']) ??
    `perf-config-${getAppNow().getTime()}.xlsx`

  FileSaver.saveAs(response.data, fileName)
}

export type PerfVersionCompareExportParams = perfConfigMock.PerfVersionCompareExportParams

/** 导出版本对比（两版本差异表；二进制流；Mock 时本地生成 CSV） */
export async function exportPerfVersionCompare(params: PerfVersionCompareExportParams) {
  if (PerfConfigApiSource[PerfConfigEndpoint.ExportVersionCompare]) {
    const { blob, fileName } = await perfConfigMock.mockExportPerfVersionCompare(params)
    FileSaver.saveAs(blob, fileName)
    return
  }

  const response = await requestBlob({
    url: '/api/config-management/perf-config/version-compare/export',
    method: 'POST',
    data: params,
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*'
    }
  })

  const fileName =
    getFilenameFromContentDisposition(response.headers?.['content-disposition']) ??
    `perf-config-compare-${params.configId}-v${params.versionA}-vs-v${params.versionB}-${getAppNow().getTime()}.csv`

  FileSaver.saveAs(response.data, fileName)
}
