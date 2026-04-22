<template>
  <div class="panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="panel__body">
          <div class="sk-grid">
            <ElSkeletonItem v-for="i in 32" :key="i" variant="text" class="sk-item" />
          </div>
        </div>
      </template>

      <template #default>
        <div class="panel__body">
          <slot name="prepend"></slot>

          <div class="hierarchy-shell">
            <div class="hierarchy-table-wrap">
              <table class="hierarchy-table">
                <colgroup>
                  <col
                    v-for="column in columns"
                    :key="column.key"
                    :style="{ width: column.width }"
                  />
                </colgroup>
                <thead>
                  <tr>
                    <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
                  </tr>
                </thead>

                <tbody v-if="displayRows.length">
                  <tr
                    v-for="row in displayRows"
                    :key="row.key"
                    class="hierarchy-row"
                    :class="[row.kind, { clickable: row.showToggle }]"
                    :style="getRowStyle(row)"
                    @click="onRowClick(row)"
                  >
                    <td>
                      <div class="cell-app" :class="{ child: row.kind === 'child' }">
                        <button
                          v-if="row.showToggle"
                          type="button"
                          class="tree-toggle"
                          :aria-label="`toggle-${row.appId}`"
                          @click.stop="toggleGroup(row.appId)"
                        >
                          <ElIcon class="tree-toggle__icon" :class="{ open: row.expanded }">
                            <CaretRight />
                          </ElIcon>
                        </button>
                        <span v-else class="tree-toggle ghost"></span>
                        <span v-if="row.kind === 'child'" class="tree-branch"></span>
                        <span v-if="row.kind === 'parent'" class="app-badge">
                          {{ appBadgeText(row.appDisplayName) }}
                        </span>
                        <span class="app-name">{{ row.appDisplayName }}</span>
                      </div>
                    </td>
                    <td>{{ dash(row.platform) }}</td>
                    <td>
                      <div class="source-cell">
                        <span class="source-badge" :class="sourceBadgeClass(row)">
                          <i
                            v-if="row.sourceIconClass"
                            class="iconfont"
                            :class="row.sourceIconClass"
                          ></i>
                          <template v-else>{{ row.sourceLetter }}</template>
                        </span>
                        <span>{{ dash(row.sourceName) }}</span>
                      </div>
                    </td>
                    <td>{{ dash(row.windowLabel) }}</td>
                    <td>{{ pct(row.reachRate) }}</td>
                    <td>{{ pct(row.minRate) }}</td>
                    <td>{{ num(row.deviationCoef) }}</td>
                    <td>{{ money(row.minProfit) }}</td>
                    <td class="accent">{{ money(row.adSpend) }}</td>
                    <td class="accent">{{ money(row.calculatedSpend) }}</td>
                    <td>
                      <span class="metric-pill" :class="roiClass(row.roi)">
                        {{ pct(row.roi) }}
                      </span>
                    </td>
                    <td>{{ money(row.commissionSpend) }}</td>
                    <td class="profit" :class="profitClass(row.estimatedProfit)">
                      {{ money(row.estimatedProfit) }}
                    </td>
                    <td>{{ currency(row.cpa) }}</td>
                    <td class="score" :class="scoreClass(row.score)">{{ score(row.score) }}</td>
                    <td>
                      <div class="status-pill" :class="statusClass(row.status)">
                        <span>{{ row.statusMain }}</span>
                        <small v-if="row.statusExtra">{{ row.statusExtra }}</small>
                      </div>
                    </td>
                  </tr>
                </tbody>

                <tbody v-else>
                  <tr class="empty-row">
                    <td :colspan="columns.length">{{ t('myPerformance.tableSwitch.empty') }}</td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr class="summary-row">
                    <td>{{ t('myPerformance.tableSwitch.summaryLabel') }}</td>
                    <td>{{ DASH }}</td>
                    <td>{{ DASH }}</td>
                    <td>{{ DASH }}</td>
                    <td>{{ DASH }}</td>
                    <td>{{ DASH }}</td>
                    <td>{{ DASH }}</td>
                    <td>{{ DASH }}</td>
                    <td class="accent">{{ money(summary.adSpend) }}</td>
                    <td class="accent">{{ money(summary.calculatedSpend) }}</td>
                    <td>{{ pct(summary.roi) }}</td>
                    <td>{{ money(summary.commissionSpend) }}</td>
                    <td class="profit" :class="profitClass(summary.estimatedProfit)">
                      {{ money(summary.estimatedProfit) }}
                    </td>
                    <td>{{ currency(summary.cpa) }}</td>
                    <td class="score" :class="scoreClass(summary.score)">
                      {{ score(summary.score) }}
                    </td>
                    <td>{{ DASH }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="hierarchy-footer">
              <div class="hierarchy-footer__meta">
                <span>{{ t('myPerformance.tableSwitch.total', { n: totalApps }) }}</span>
                <span>{{ t('myPerformance.tableSwitch.pageSize', { n: pageSize }) }}</span>
              </div>
              <ElPagination
                v-if="pageCount > 1"
                v-model:current-page="currentPage"
                small
                background
                layout="prev, pager, next"
                :page-size="pageSize"
                :pager-count="5"
                :total="totalApps"
              />
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { CaretRight } from '@element-plus/icons-vue'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { getAdPlatformIconDisplay } from '@/utils/ui/ad-platform-iconfont'
  import type { MyPerformanceAppTableSummary, MyPerformanceAppTreeRow } from '../types'

  type DisplayRowKind = 'parent' | 'child'

  type DisplayRow = {
    key: string
    appId: string
    appDisplayName: string
    kind: DisplayRowKind
    themeIndex: number
    showToggle: boolean
    expanded: boolean
    platform?: string
    sourceName?: string
    sourceIconClass?: string
    sourceLetter: string
    windowLabel?: string
    reachRate?: number
    minRate?: number
    deviationCoef?: number
    minProfit?: number
    adSpend?: number
    calculatedSpend?: number
    roi?: number
    commissionSpend?: number
    estimatedProfit?: number
    cpa?: number
    score?: number
    status?: string
    statusMain: string
    statusExtra?: string
  }

  defineOptions({ name: 'MyPerformancePanelAppHierarchyTable' })

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      list: MyPerformanceAppTreeRow[]
      summary: MyPerformanceAppTableSummary
    }>(),
    {
      loading: false
    }
  )

  const DASH = '--'
  const pageSize = 10

  const { t } = useI18n()
  const currentPage = ref(1)
  const expandedMap = ref<Record<string, boolean>>({})

  const loading = computed(() => props.loading)
  const summary = computed(() => props.summary)
  const totalApps = computed(() => props.list.length)
  const pageCount = computed(() => Math.max(1, Math.ceil(totalApps.value / pageSize)))
  const pagedApps = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return props.list.slice(start, start + pageSize)
  })

  const columns = computed(() => [
    { key: 'app', label: t('myPerformance.table.col.app'), width: '188px' },
    { key: 'platform', label: t('myPerformance.table.col.platform'), width: '84px' },
    { key: 'source', label: t('myPerformance.table.col.source'), width: '116px' },
    { key: 'window', label: t('myPerformance.table.col.window'), width: '72px' },
    { key: 'reachRate', label: t('myPerformance.table.col.reachRate'), width: '88px' },
    { key: 'minRate', label: t('myPerformance.table.col.minRate'), width: '88px' },
    { key: 'deviationCoef', label: t('myPerformance.table.col.deviationCoef'), width: '88px' },
    { key: 'minProfit', label: t('myPerformance.table.col.minProfit'), width: '96px' },
    { key: 'adSpend', label: t('myPerformance.table.col.adSpend'), width: '112px' },
    { key: 'calculatedSpend', label: t('myPerformance.table.col.calculatedSpend'), width: '112px' },
    { key: 'roi', label: t('myPerformance.table.col.roi'), width: '80px' },
    {
      key: 'commissionSpend',
      label: t('myPerformance.table.col.commissionSpend'),
      width: '96px'
    },
    {
      key: 'estimatedProfit',
      label: t('myPerformance.table.col.estimatedProfit'),
      width: '112px'
    },
    { key: 'cpa', label: t('myPerformance.table.col.cpa'), width: '84px' },
    { key: 'score', label: t('myPerformance.table.col.score'), width: '72px' },
    { key: 'status', label: t('myPerformance.table.col.status'), width: '128px' }
  ])

  const displayRows = computed<DisplayRow[]>(() =>
    pagedApps.value.flatMap((app, pageIndex) => buildRows(app, pageIndex))
  )

  watch(
    () => props.list,
    (list) => {
      currentPage.value = 1
      const nextExpanded: Record<string, boolean> = {}
      list.forEach((app) => {
        if (getDetailChildren(app).length > 0) {
          nextExpanded[app.id] = expandedMap.value[app.id] ?? true
        }
      })
      expandedMap.value = nextExpanded
    },
    { deep: true, immediate: true }
  )

  function buildRows(app: MyPerformanceAppTreeRow, pageIndex: number): DisplayRow[] {
    const allChildren = getSourceChildren(app)
    const aggregateRow = getAggregateRow(app, allChildren)
    const detailChildren = getDetailChildren(app)
    const canExpand = detailChildren.length > 0
    const expanded = expandedMap.value[app.id] ?? true
    const themeIndex = (currentPage.value - 1) * pageSize + pageIndex
    const appName = cleanAppName(app.name)

    const parentRow = mapRow({
      source: aggregateRow,
      appId: app.id,
      appDisplayName: appName,
      themeIndex,
      kind: 'parent',
      showToggle: canExpand,
      expanded
    })

    if (!canExpand || !expanded) {
      return [parentRow]
    }

    const childRows = detailChildren.map((child) =>
      mapRow({
        source: child,
        appId: app.id,
        appDisplayName: appName,
        themeIndex,
        kind: 'child',
        showToggle: false,
        expanded
      })
    )

    return [parentRow, ...childRows]
  }

  function getSourceChildren(app: MyPerformanceAppTreeRow) {
    return (app.children ?? []).filter((item) => item && item.type === 'source')
  }

  function getAggregateChild(children: MyPerformanceAppTreeRow[]) {
    return children.find((item) => isAllSource(item.name))
  }

  function getAggregateRow(app: MyPerformanceAppTreeRow, children: MyPerformanceAppTreeRow[]) {
    const aggregateChild = getAggregateChild(children)
    if (aggregateChild) {
      return aggregateChild
    }
    if (children.length > 0) {
      return aggregateSourceRows(children)
    }
    return app
  }

  function getDetailChildren(app: MyPerformanceAppTreeRow) {
    const children = getSourceChildren(app)
    const aggregateChild = getAggregateChild(children)
    if (aggregateChild) {
      return children.filter((child) => child.id !== aggregateChild.id)
    }
    return children
  }

  function aggregateSourceRows(children: MyPerformanceAppTreeRow[]): MyPerformanceAppTreeRow {
    return {
      id: `${children[0]?.id ?? 'app'}__aggregate`,
      type: 'source',
      name: t('myPerformance.tableSwitch.allLabel'),
      platform: common(children.map((item) => item.platform)),
      windowLabel: common(children.map((item) => normalizeDash(item.windowLabel))),
      reachRate: average(children.map((item) => toNumber(item.reachRate))),
      minRate: average(children.map((item) => toNumber(item.minRate))),
      deviationCoef: average(children.map((item) => toNumber(item.deviationCoef))),
      minProfit: sum(children.map((item) => toNumber(item.minProfit))),
      adSpend: sum(children.map((item) => toNumber(item.adSpend))),
      calculatedSpend: sum(children.map((item) => toNumber(item.calculatedSpend))),
      roi: average(children.map((item) => toNumber(item.roi))),
      commissionSpend: sum(children.map((item) => toNumber(item.commissionSpend))),
      estimatedProfit: sum(children.map((item) => toNumber(item.estimatedProfit))),
      cpa: average(children.map((item) => toNumber(item.cpa))),
      score: average(children.map((item) => toNumber(item.score))),
      status: groupStatus(children),
      statusText: children.find((item) => item.statusText)?.statusText
    }
  }

  function mapRow(input: {
    source: MyPerformanceAppTreeRow
    appId: string
    appDisplayName: string
    themeIndex: number
    kind: DisplayRowKind
    showToggle: boolean
    expanded: boolean
  }): DisplayRow {
    const { source, appId, appDisplayName, themeIndex, kind, showToggle, expanded } = input
    const sourceName = normalizeSourceName(source.name)
    const sourceIcon = getAdPlatformIconDisplay({ name: sourceName })
    const statusText = splitStatus(source.statusText || fallbackStatus(source.status))

    return {
      key: `${appId}-${kind}-${source.id}`,
      appId,
      appDisplayName,
      kind,
      themeIndex,
      showToggle,
      expanded,
      platform: normalizeText(source.platform),
      sourceName,
      sourceIconClass: sourceIcon.iconClass,
      sourceLetter: sourceIcon.letter || sourceName.slice(0, 1).toUpperCase() || 'A',
      windowLabel: normalizeDash(source.windowLabel),
      reachRate: toNumber(source.reachRate),
      minRate: toNumber(source.minRate),
      deviationCoef: toNumber(source.deviationCoef),
      minProfit: toNumber(source.minProfit),
      adSpend: toNumber(source.adSpend),
      calculatedSpend: toNumber(source.calculatedSpend),
      roi: toNumber(source.roi),
      commissionSpend: toNumber(source.commissionSpend),
      estimatedProfit: toNumber(source.estimatedProfit),
      cpa: toNumber(source.cpa),
      score: toNumber(source.score),
      status: source.status,
      statusMain: statusText.main,
      statusExtra: statusText.extra
    }
  }

  function toggleGroup(appId: string) {
    expandedMap.value = {
      ...expandedMap.value,
      [appId]: !(expandedMap.value[appId] ?? true)
    }
  }

  function onRowClick(row: DisplayRow) {
    if (row.showToggle) {
      toggleGroup(row.appId)
    }
  }

  function getRowStyle(row: DisplayRow) {
    const theme = ROW_THEMES[row.themeIndex % ROW_THEMES.length][row.kind]
    return {
      '--row-bg': theme.bg,
      '--row-border': theme.border,
      '--row-glow': theme.glow,
      '--badge-bg': theme.badgeBg
    }
  }

  function sourceBadgeClass(row: DisplayRow) {
    const name = String(row.sourceName ?? '')
      .trim()
      .toLowerCase()
    return {
      'is-google': name === 'google',
      'is-facebook': name === 'facebook',
      'is-all': name === 'all' || name === '全部'
    }
  }

  function appBadgeText(name: string) {
    const compact = String(name).replace(/[^a-zA-Z0-9]/g, '')
    return compact.slice(0, 2).toUpperCase() || String(name).slice(0, 1).toUpperCase() || 'A'
  }

  function cleanAppName(name?: string) {
    return normalizeText(name)?.replace(/（汇总）|\(汇总\)/g, '') || ''
  }

  function normalizeText(value?: string | null) {
    if (value === undefined || value === null) {
      return undefined
    }
    const text = String(value).trim()
    return text.length > 0 ? text : undefined
  }

  function normalizeDash(value?: string | null) {
    const text = normalizeText(value)
    if (!text || text === '-' || text === '--') {
      return undefined
    }
    return text
  }

  function normalizeSourceName(value?: string | null) {
    return normalizeText(value) || t('myPerformance.tableSwitch.allLabel')
  }

  function isAllSource(name?: string | null) {
    const normalized = String(name ?? '')
      .trim()
      .toLowerCase()
    return normalized === 'all' || normalized === '全部'
  }

  function splitStatus(text?: string) {
    const raw = String(text ?? '').trim()
    if (!raw) {
      return { main: DASH, extra: '' }
    }

    const match = raw.match(/^(.+?)[(（]([^()（）]+)[)）]$/)
    if (!match) {
      return { main: raw, extra: '' }
    }

    return {
      main: match[1]?.trim() || raw,
      extra: match[2]?.trim() || ''
    }
  }

  function fallbackStatus(status?: string) {
    if (status === 'paused') return t('myPerformance.tableSwitch.statusPaused')
    if (status === 'warning') return t('myPerformance.tableSwitch.statusWarning')
    if (status === 'running') return t('myPerformance.tableSwitch.statusRunning')
    return ''
  }

  function groupStatus(children: MyPerformanceAppTreeRow[]) {
    if (children.some((item) => item.status === 'warning')) return 'warning'
    if (children.some((item) => item.status === 'paused')) return 'paused'
    if (children.some((item) => item.status === 'running')) return 'running'
    return undefined
  }

  function toNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined
  }

  function sum(values: Array<number | undefined>) {
    const numbers = values.filter((item): item is number => typeof item === 'number')
    return numbers.length ? numbers.reduce((total, item) => total + item, 0) : undefined
  }

  function average(values: Array<number | undefined>) {
    const numbers = values.filter((item): item is number => typeof item === 'number')
    return numbers.length
      ? numbers.reduce((total, item) => total + item, 0) / numbers.length
      : undefined
  }

  function common(values: Array<string | undefined>) {
    const counter = new Map<string, number>()
    values
      .filter((item): item is string => !!item)
      .forEach((item) => counter.set(item, (counter.get(item) ?? 0) + 1))

    let winner = ''
    let maxCount = 0
    counter.forEach((count, key) => {
      if (count > maxCount) {
        winner = key
        maxCount = count
      }
    })
    return winner || undefined
  }

  function pct(value?: number) {
    return value === undefined ? DASH : `${Math.round(value)}%`
  }

  function num(value?: number) {
    if (value === undefined) return DASH
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  }

  function money(value?: number) {
    if (value === undefined) return DASH
    const digits = Number.isInteger(Math.abs(value)) ? 0 : 2
    const text = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })
    return `${value < 0 ? '-' : ''}$${text}`
  }

  function currency(value?: number) {
    if (value === undefined) return DASH
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  function score(value?: number) {
    return value === undefined ? DASH : `${Math.round(value)}分`
  }

  function dash(value?: string) {
    return value || DASH
  }

  function roiClass(value?: number) {
    if (value === undefined) return 'neutral'
    if (value >= 90) return 'great'
    if (value >= 70) return 'good'
    return 'warn'
  }

  function profitClass(value?: number) {
    if (value === undefined) return ''
    return value < 0 ? 'negative' : 'positive'
  }

  function scoreClass(value?: number) {
    if (value === undefined) return ''
    if (value <= 0) return 'danger'
    if (value >= 20) return 'positive'
    return 'warn'
  }

  function statusClass(status?: string) {
    return {
      running: status === 'running',
      paused: status === 'paused',
      warning: status === 'warning'
    }
  }

  const ROW_THEMES = [
    {
      parent: {
        bg: 'linear-gradient(90deg, rgba(21,104,88,.96), rgba(16,60,68,.96))',
        border: 'rgba(79,215,177,.3)',
        glow: 'rgba(68,255,199,.18)',
        badgeBg: 'linear-gradient(135deg,#3cd479,#1e8f60)'
      },
      child: {
        bg: 'linear-gradient(90deg, rgba(27,39,60,.96), rgba(19,28,45,.96))',
        border: 'rgba(112,138,190,.22)',
        glow: 'rgba(108,164,255,.16)',
        badgeBg: 'linear-gradient(135deg,#5d8df8,#2852cb)'
      }
    },
    {
      parent: {
        bg: 'linear-gradient(90deg, rgba(110,81,24,.96), rgba(61,43,17,.96))',
        border: 'rgba(230,181,74,.28)',
        glow: 'rgba(241,180,57,.18)',
        badgeBg: 'linear-gradient(135deg,#ffcb55,#f1a42b)'
      },
      child: {
        bg: 'linear-gradient(90deg, rgba(36,38,67,.96), rgba(24,27,46,.96))',
        border: 'rgba(133,144,215,.22)',
        glow: 'rgba(129,140,248,.16)',
        badgeBg: 'linear-gradient(135deg,#6f6ef6,#4a42ca)'
      }
    }
  ] as const
</script>

<style scoped lang="scss">
  .panel {
    overflow: hidden;
    background: linear-gradient(180deg, rgb(15 23 42 / 96%) 0%, rgb(17 24 39 / 94%) 100%);
    backdrop-filter: blur(16px) saturate(1.08);
    border: 1px solid rgb(82 91 111 / 48%);
    border-radius: 18px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 26%),
      inset 0 1px 0 rgb(255 255 255 / 7%);
  }

  .panel__body {
    padding: 14px;
  }

  .hierarchy-shell {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .hierarchy-table-wrap {
    display: block;
    max-width: 100%;
    padding-bottom: 8px;
    overflow: scroll hidden;
    border: 1px solid rgb(255 255 255 / 9%);
    border-radius: 16px;
    scrollbar-gutter: stable;
    scrollbar-width: auto;
    scrollbar-color: rgb(96 165 250 / 92%) rgb(15 23 42 / 76%);
  }

  .hierarchy-table-wrap::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  .hierarchy-table-wrap::-webkit-scrollbar-track {
    background: rgb(15 23 42 / 76%);
    border-radius: 999px;
  }

  .hierarchy-table-wrap::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgb(96 165 250 / 96%), rgb(59 130 246 / 96%));
    border: 2px solid rgb(15 23 42 / 76%);
    border-radius: 999px;
  }

  .hierarchy-table-wrap::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgb(125 211 252 / 96%), rgb(37 99 235 / 96%));
  }

  .hierarchy-table-wrap::-webkit-scrollbar-corner {
    background: rgb(15 23 42 / 76%);
  }

  .hierarchy-table {
    width: max-content;
    min-width: 100%;
    color: rgb(241 245 249 / 92%);
    border-spacing: 0;
    border-collapse: separate;
  }

  .hierarchy-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 12px 10px;
    font-size: 12px;
    font-weight: 700;
    color: rgb(226 232 240 / 82%);
    text-align: left;
    white-space: nowrap;
    background: linear-gradient(180deg, rgb(45 55 72 / 96%) 0%, rgb(27 33 45 / 96%) 100%);
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .hierarchy-row {
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 2%);
  }

  .hierarchy-row td {
    padding: 11px 10px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    background: var(--row-bg);
    border-bottom: 1px solid var(--row-border);
  }

  .hierarchy-row.clickable {
    cursor: pointer;
  }

  .hierarchy-row.parent:hover td {
    box-shadow: inset 0 0 0 999px rgb(255 255 255 / 2%);
  }

  .cell-app,
  .source-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .cell-app.child {
    gap: 6px;
  }

  .tree-toggle {
    display: inline-flex;
    flex: 0 0 16px;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    color: rgb(226 232 240 / 78%);
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .tree-toggle.ghost {
    cursor: default;
    opacity: 0;
  }

  .tree-toggle__icon {
    font-size: 14px;
    transition: transform 0.16s ease;
  }

  .tree-toggle__icon.open {
    transform: rotate(90deg);
  }

  .tree-branch {
    position: relative;
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
  }

  .tree-branch::before,
  .tree-branch::after {
    position: absolute;
    content: '';
    background: rgb(203 213 225 / 42%);
  }

  .tree-branch::before {
    top: -3px;
    left: 8px;
    width: 1px;
    height: 21px;
  }

  .tree-branch::after {
    top: 9px;
    left: 8px;
    width: 10px;
    height: 1px;
  }

  .app-badge,
  .source-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: var(--badge-bg);
    border-radius: 7px;
  }

  .app-badge {
    width: 22px;
    height: 22px;
    font-size: 10px;
    font-weight: 800;
  }

  .source-badge {
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    background: linear-gradient(135deg, #64748b, #475569);
    border-radius: 6px;
  }

  .source-badge.is-google {
    background: linear-gradient(135deg, #4285f4, #ea4335);
  }

  .source-badge.is-facebook {
    background: linear-gradient(135deg, #1877f2, #2563eb);
  }

  .source-badge.is-all {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  .app-name {
    max-width: 220px;
    overflow: hidden;
    font-size: 13px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .metric-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    padding: 4px 10px;
    font-weight: 800;
    border-radius: 999px;
  }

  .metric-pill.great {
    color: #ecfeff;
    background: linear-gradient(135deg, rgb(16 185 129 / 88%), rgb(6 182 212 / 72%));
  }

  .metric-pill.good {
    color: #fffbeb;
    background: linear-gradient(135deg, rgb(217 119 6 / 84%), rgb(245 158 11 / 72%));
  }

  .metric-pill.warn,
  .metric-pill.neutral {
    color: #f8fafc;
    background: linear-gradient(135deg, rgb(100 116 139 / 80%), rgb(71 85 105 / 72%));
  }

  .status-pill {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    min-width: 70px;
    padding: 4px 10px;
    font-weight: 800;
    line-height: 1.1;
    color: #fff;
    border-radius: 999px;
  }

  .status-pill small {
    font-size: 10px;
    opacity: 0.86;
  }

  .status-pill.running {
    background: linear-gradient(135deg, rgb(22 163 74 / 92%), rgb(16 185 129 / 84%));
  }

  .status-pill.paused {
    background: linear-gradient(135deg, rgb(217 119 6 / 92%), rgb(202 138 4 / 84%));
  }

  .status-pill.warning {
    background: linear-gradient(135deg, rgb(168 85 247 / 92%), rgb(236 72 153 / 84%));
  }

  .accent {
    color: rgb(56 189 248 / 96%);
  }

  .profit.positive,
  .score.positive {
    color: rgb(74 222 128 / 96%);
  }

  .profit.negative,
  .score.danger {
    color: rgb(248 113 113 / 96%);
  }

  .score.warn {
    color: rgb(251 191 36 / 96%);
  }

  .summary-row td {
    padding: 14px 10px;
    font-size: 12px;
    font-weight: 800;
    color: rgb(226 232 240 / 86%);
    white-space: nowrap;
    background: linear-gradient(180deg, rgb(32 38 53 / 98%) 0%, rgb(23 29 41 / 98%) 100%);
    border-bottom: 0;
  }

  .empty-row td {
    padding: 36px 18px;
    font-size: 13px;
    color: rgb(148 163 184 / 88%);
    text-align: center;
    background: linear-gradient(180deg, rgb(15 23 42 / 96%) 0%, rgb(17 24 39 / 96%) 100%);
  }

  .hierarchy-footer {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .hierarchy-footer__meta {
    display: flex;
    gap: 14px;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: rgb(203 213 225 / 74%);
  }

  .sk-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .sk-item {
    width: 100% !important;
    height: 22px !important;
  }

  @media (width <= 1100px) {
    .hierarchy-footer {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
