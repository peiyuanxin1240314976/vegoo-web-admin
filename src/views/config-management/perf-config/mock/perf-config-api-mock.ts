import { getAppNow } from '@/utils/app-now'
import type { PerfConfigItem, PerfConfigOverviewKpi, PerfVersion } from '../types'
import { formatPerfRequirementDisplay } from '../utils/perf-requirement-display'
import { STATUS_CONFIG, clonePerfList } from './data'

export type PerfExportParams = {
  keyword?: string
  appId?: string
  platform?: string
  source?: string
  status?: string
}

function sourceCodes(row: PerfConfigItem): string[] {
  return row.sourceList?.length ? row.sourceList : [row.source]
}

export function matchesFilter(row: PerfConfigItem, params: PerfExportParams): boolean {
  const kw = String(params.keyword ?? '')
    .trim()
    .toLowerCase()
  if (kw && !row.appName.toLowerCase().includes(kw) && !row.appId.toLowerCase().includes(kw)) {
    return false
  }
  if (params.appId && row.appId !== params.appId) return false
  if (params.platform && row.platform !== params.platform) return false
  if (params.source && !sourceCodes(row).includes(params.source)) return false
  if (params.status && row.activeVersion.status !== params.status) return false
  return true
}

/**
 * 与列表相同筛选下，按激活版本状态聚合 KPI（全量，非当前页）。
 * `clientList`：页面本地维护的完整列表（含新建未入库行）；不传则用 `clonePerfList()`。
 */
export function computePerfOverviewKpi(
  params: PerfExportParams,
  clientList?: PerfConfigItem[]
): PerfConfigOverviewKpi {
  const base = clientList != null ? clientList : clonePerfList()
  const filtered = base.filter((row) => matchesFilter(row, params))
  let published = 0
  let draft = 0
  let archived = 0
  for (const row of filtered) {
    const s = row.activeVersion.status
    if (s === 'published') published++
    else if (s === 'draft') draft++
    else if (s === 'archived') archived++
  }
  return {
    total: filtered.length,
    published,
    draft,
    archived
  }
}

export async function mockExportPerfConfigList(
  params: PerfExportParams
): Promise<{ blob: Blob; fileName: string }> {
  const filtered = clonePerfList().filter((row) => matchesFilter(row, params))
  const header = [
    'id',
    'appId',
    'appName',
    'platform',
    'source',
    'sourceList',
    'runStatus',
    'allowMulti',
    'version',
    'versionStatus',
    'evalMethod',
    'evalDays',
    'targetRate',
    'minRate',
    'difficultyFactor',
    'minProfit',
    'extraCondition',
    'publishedAt',
    'publishedBy'
  ]
  const rows = filtered.map((item) => {
    const v = item.activeVersion
    return [
      item.id,
      item.appId,
      item.appName,
      item.platform,
      item.source,
      sourceCodes(item).join('|'),
      item.runStatus,
      String(item.allowMulti),
      String(v.version),
      v.status,
      v.evalMethod,
      String(v.evalDays),
      String(v.targetRate),
      String(v.minRate),
      String(v.difficultyFactor),
      v.minProfit != null ? String(v.minProfit) : '',
      v.extraCondition,
      v.publishedAt,
      v.publishedBy
    ]
  })
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return {
    blob: new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    fileName: `perf-config-${getAppNow().getTime()}.csv`
  }
}

export type PerfVersionCompareExportParams = {
  configId: string
  versionA: number
  versionB: number
}

function fmtRate(v: PerfVersion, rate: number) {
  return formatPerfRequirementDisplay(v.evalMethod, rate)
}

function compareRowsForCsv(a: PerfVersion, b: PerfVersion): string[][] {
  const rows: string[][] = []
  const push = (field: string, label: string, valA: string, valB: string, changed: boolean) => {
    rows.push([field, label, valA, valB, changed ? '1' : '0'])
  }

  push(
    'status',
    '状态',
    STATUS_CONFIG[a.status]?.label ?? a.status,
    STATUS_CONFIG[b.status]?.label ?? b.status,
    a.status !== b.status
  )
  push('evalMethod', '评估方式', a.evalMethod, b.evalMethod, a.evalMethod !== b.evalMethod)
  push('evalDays', '评估天数', `${a.evalDays} 天`, `${b.evalDays} 天`, a.evalDays !== b.evalDays)
  push(
    'targetRate',
    '达标要求',
    fmtRate(a, a.targetRate),
    fmtRate(b, b.targetRate),
    a.targetRate !== b.targetRate || a.evalMethod !== b.evalMethod
  )
  push(
    'minRate',
    '最低要求',
    fmtRate(a, a.minRate),
    fmtRate(b, b.minRate),
    a.minRate !== b.minRate || a.evalMethod !== b.evalMethod
  )
  push(
    'difficultyFactor',
    '难度系数',
    String(a.difficultyFactor),
    String(b.difficultyFactor),
    a.difficultyFactor !== b.difficultyFactor
  )
  push(
    'minProfit',
    '最低利润',
    a.minProfit != null ? `$${a.minProfit.toLocaleString('en-US')}` : '-',
    b.minProfit != null ? `$${b.minProfit.toLocaleString('en-US')}` : '-',
    a.minProfit !== b.minProfit
  )
  push(
    'extraCondition',
    '附加条件',
    a.extraCondition || '-',
    b.extraCondition || '-',
    a.extraCondition !== b.extraCondition
  )
  push('publishedAt', '发布时间', a.publishedAt, b.publishedAt, a.publishedAt !== b.publishedAt)
  push('publishedBy', '发布人', a.publishedBy, b.publishedBy, a.publishedBy !== b.publishedBy)
  return rows
}

/** 版本对比导出 Mock：与弹窗内对比字段一致 */
export async function mockExportPerfVersionCompare(
  params: PerfVersionCompareExportParams
): Promise<{ blob: Blob; fileName: string }> {
  const item = clonePerfList().find((x) => x.id === params.configId)
  if (!item) {
    throw new Error('配置不存在')
  }
  const va = item.versions.find((v) => v.version === params.versionA)
  const vb = item.versions.find((v) => v.version === params.versionB)
  if (!va || !vb) {
    throw new Error('版本不存在')
  }

  const meta = [
    'meta',
    'configId',
    'appName',
    'versionA',
    'versionB',
    item.id,
    item.appName,
    String(params.versionA),
    String(params.versionB)
  ]
  const header = ['fieldKey', 'fieldLabel', 'valueVersionA', 'valueVersionB', 'changed']
  const dataRows = compareRowsForCsv(va, vb)
  const csv = [meta, header, ...dataRows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return {
    blob: new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    fileName: `perf-config-compare-${params.configId}-v${params.versionA}-vs-v${params.versionB}-${getAppNow().getTime()}.csv`
  }
}
