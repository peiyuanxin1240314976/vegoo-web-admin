<template>
  <div class="panel">
    <div class="panel__top">
      <slot name="prepend"></slot>
    </div>

    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="panel__header">
          <ElSkeletonItem variant="text" class="table-sk-title" />
          <ElSkeletonItem variant="text" class="table-sk-hint" />
        </div>
        <div class="panel__body">
          <div class="table-sk-shell">
            <div class="table-sk-grid table-sk-grid--summary">
              <ElSkeletonItem
                v-for="i in 9"
                :key="`summary-${i}`"
                variant="text"
                class="table-sk-cell"
              />
            </div>
            <div class="table-sk-grid table-sk-grid--detail">
              <ElSkeletonItem
                v-for="i in 12"
                :key="`detail-${i}`"
                variant="text"
                class="table-sk-cell"
              />
            </div>
          </div>
        </div>
      </template>

      <template #default>
        <div v-if="resolvedHeaderHint" class="panel__header">
          <div class="header-copy">
            <div class="hint">{{ resolvedHeaderHint }}</div>
          </div>
        </div>

        <div class="panel__body">
          <div class="dimension-shell">
            <section class="dimension-section">
              <!-- <div class="dimension-section__head">
                <div>
                  <div class="dimension-section__eyebrow">Overview</div>
                  <div class="dimension-section__title">7D Overview</div>
                </div>
                <div class="dimension-section__meta">
                  <span>{{ summaryRows.length }} metrics</span>
                  <span>{{ resolvedExcelTables.dateHeaders.length }} days</span>
                </div>
              </div> -->

              <div class="dimension-table-wrap">
                <table class="dimension-table dimension-table--summary">
                  <colgroup>
                    <col
                      v-for="column in summaryColumns"
                      :key="column.key"
                      :style="{ width: column.width }"
                    />
                  </colgroup>
                  <thead>
                    <tr>
                      <th v-for="column in summaryColumns" :key="column.key">{{ column.label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in summaryRows" :key="row.label">
                      <td class="cell-label">{{ row.label }}</td>
                      <td class="cell-strong">{{ row.total }}</td>
                      <td
                        v-for="(value, index) in row.days"
                        :key="`${row.label}-${index}`"
                        class="cell-strong"
                      >
                        {{ value }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="dimension-section">
              <!-- <div class="dimension-section__head">
                <div>
                  <div class="dimension-section__eyebrow">Breakdown</div>
                  <div class="dimension-section__title">App Breakdown</div>
                </div>
                <div class="dimension-section__meta">
                  <span>{{ resolvedExcelTables.appBlocks.length }} apps</span>
                  <span>grouped by source</span>
                </div>
              </div> -->

              <div class="dimension-table-wrap dimension-table-wrap--detail">
                <table class="dimension-table dimension-table--detail">
                  <colgroup>
                    <col
                      v-for="column in detailColumns"
                      :key="column.key"
                      :style="{ width: column.width }"
                    />
                  </colgroup>
                  <thead>
                    <tr>
                      <th v-for="column in detailColumns" :key="column.key">{{ column.label }}</th>
                    </tr>
                  </thead>
                  <tbody v-if="detailRows.length">
                    <tr v-for="row in detailRows" :key="row.key" :class="{ 'is-alt': row.alt }">
                      <td v-if="row.showApp" :rowspan="row.appRowSpan" class="cell-app cell-strong">
                        {{ row.app }}
                      </td>
                      <td
                        v-if="row.showPlatform"
                        :rowspan="row.platformRowSpan"
                        class="cell-platform cell-strong"
                      >
                        {{ row.platform }}
                      </td>
                      <td
                        v-if="row.showAdPlatform"
                        :rowspan="row.adPlatformRowSpan"
                        class="cell-ad-platform cell-strong"
                      >
                        {{ row.adPlatform }}
                      </td>
                      <td class="cell-label cell-strong">{{ row.label }}</td>
                      <td
                        v-for="(value, index) in row.values"
                        :key="`${row.key}-${index}`"
                        :class="['cell-value', { 'is-negative': isNegativeValue(value) }]"
                      >
                        {{ value }}
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr class="empty-row">
                      <td :colspan="detailColumns.length">No data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import {
    panelAppDimensionAppBlocks,
    panelAppDimensionDateHeaders,
    panelAppDimensionSummaryRows,
    panelAppDimensionText
  } from '../mock/panel-app-dimension-table.mock'
  import type {
    MyPerformanceAppTableSummary,
    MyPerformanceAppTreeRow,
    MyPerformanceExcelAppBlock,
    MyPerformanceExcelSummaryRow,
    MyPerformanceExcelTables
  } from '../types'

  defineOptions({ name: 'MyPerformancePanelAppDimensionTable' })

  const MY_PERFORMANCE_NOW_OFFSET_DAYS = -2

  function getMyPerformanceNow() {
    const now = cloneAppDate(getAppNow())
    now.setDate(now.getDate() + MY_PERFORMANCE_NOW_OFFSET_DAYS)
    return now
  }

  type DetailDisplayRow = {
    key: string
    app: string
    platform: string
    adPlatform: string
    label: string
    values: Array<string | number>
    alt: boolean
    showApp: boolean
    showPlatform: boolean
    showAdPlatform: boolean
    appRowSpan: number
    platformRowSpan: number
    adPlatformRowSpan: number
  }

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      list: MyPerformanceAppTreeRow[]
      summary: MyPerformanceAppTableSummary
      excelTables?: MyPerformanceExcelTables
      headerHint?: string
    }>(),
    {
      loading: false
    }
  )

  const loading = computed(() => props.loading)
  const resolvedHeaderHint = computed(() => {
    if (props.headerHint) return props.headerHint
    const endDate = getMyPerformanceNow()
    const startDate = cloneAppDate(endDate)
    startDate.setDate(startDate.getDate() - 7)
    return `计算周期：${formatYYYYMMDD(startDate)} 至 ${formatYYYYMMDD(endDate)} | 应用层级预估利润基于真实收入计算，广告平台预估利润基于回收计算`
  })

  const resolvedExcelTables = computed<MyPerformanceExcelTables>(() => {
    if (props.excelTables?.dateHeaders?.length) {
      return props.excelTables
    }

    return {
      dateHeaders: [...panelAppDimensionDateHeaders],
      summaryRows: [...panelAppDimensionSummaryRows],
      appBlocks: panelAppDimensionAppBlocks.map((block) => ({
        app: block.app,
        platform: block.platform,
        allRows: block.allRows ?? null,
        sourceRows: block.sourceRows,
        alt: block.alt
      }))
    }
  })

  const summaryColumns = computed(() => [
    { key: 'item', label: panelAppDimensionText.item, width: '128px' },
    { key: 'total', label: panelAppDimensionText.total, width: '112px' },
    ...resolvedExcelTables.value.dateHeaders.map((label, index) => ({
      key: `day-${index}`,
      label,
      width: '112px'
    }))
  ])

  const detailColumns = computed(() => [
    { key: 'app', label: panelAppDimensionText.app, width: '132px' },
    { key: 'platform', label: panelAppDimensionText.platform, width: '72px' },
    { key: 'adPlatform', label: panelAppDimensionText.adPlatform, width: '124px' },
    { key: 'item', label: panelAppDimensionText.item, width: '96px' },
    ...resolvedExcelTables.value.dateHeaders.map((label, index) => ({
      key: `detail-day-${index}`,
      label,
      width: '100px'
    }))
  ])

  const summaryRows = computed<MyPerformanceExcelSummaryRow[]>(
    () => resolvedExcelTables.value.summaryRows
  )

  const detailRows = computed<DetailDisplayRow[]>(() =>
    resolvedExcelTables.value.appBlocks.flatMap((block, blockIndex) =>
      buildDetailRows(block, blockIndex)
    )
  )

  function buildDetailRows(
    block: MyPerformanceExcelAppBlock,
    blockIndex: number
  ): DetailDisplayRow[] {
    const rows: DetailDisplayRow[] = []
    const allRows = block.allRows ?? []
    const sourceRows = block.sourceRows ?? []
    const sourceRowsTotal = sourceRows.reduce((total, group) => total + group.rows.length, 0)
    const totalRows = allRows.length + sourceRowsTotal
    const alt = !!block.alt

    let hasRenderedMergedCell = false

    allRows.forEach((row, index) => {
      rows.push({
        key: `${blockIndex}-all-${index}`,
        app: block.app,
        platform: block.platform,
        adPlatform: panelAppDimensionText.all,
        label: row.label,
        values: row.values,
        alt,
        showApp: !hasRenderedMergedCell,
        showPlatform: !hasRenderedMergedCell,
        showAdPlatform: index === 0,
        appRowSpan: totalRows,
        platformRowSpan: totalRows,
        adPlatformRowSpan: allRows.length
      })
      hasRenderedMergedCell = true
    })

    sourceRows.forEach((group, groupIndex) => {
      group.rows.forEach((row, rowIndex) => {
        rows.push({
          key: `${blockIndex}-source-${groupIndex}-${rowIndex}`,
          app: block.app,
          platform: block.platform,
          adPlatform: group.sourceName,
          label: row.label,
          values: row.values,
          alt,
          showApp: !hasRenderedMergedCell,
          showPlatform: !hasRenderedMergedCell,
          showAdPlatform: rowIndex === 0,
          appRowSpan: totalRows,
          platformRowSpan: totalRows,
          adPlatformRowSpan: group.rows.length
        })
        hasRenderedMergedCell = true
      })
    })

    return rows
  }

  function isNegativeValue(value: string | number) {
    return String(value).trim().startsWith('-')
  }
</script>

<style scoped lang="scss">
  .panel {
    --panel-bg: linear-gradient(180deg, rgb(15 23 42 / 96%) 0%, rgb(17 24 39 / 94%) 100%);
    --panel-border: rgb(82 91 111 / 48%);
    --panel-shadow: 0 12px 30px rgb(0 0 0 / 18%), inset 0 1px 0 rgb(255 255 255 / 7%);
    --panel-header-border: rgb(255 255 255 / 8%);
    --panel-hint-color: rgb(203 213 225 / 66%);
    --table-shell-bg: linear-gradient(180deg, rgb(16 24 39 / 92%) 0%, rgb(18 27 45 / 92%) 100%);
    --table-shell-border: rgb(255 255 255 / 9%);
    --section-bg: linear-gradient(180deg, rgb(12 19 33 / 50%) 0%, rgb(15 23 42 / 26%) 100%);
    --section-border: rgb(255 255 255 / 6%);
    --section-shadow: inset 0 1px 0 rgb(255 255 255 / 3%);
    --section-eyebrow: rgb(148 163 184 / 72%);
    --section-title: rgb(248 250 252 / 96%);
    --section-meta: rgb(148 163 184 / 72%);
    --table-wrap-bg: rgb(15 23 42 / 88%);
    --table-wrap-border: rgb(255 255 255 / 7%);
    --table-head-bg: linear-gradient(180deg, rgb(42 52 70 / 96%) 0%, rgb(28 35 49 / 96%) 100%);
    --table-head-text: rgb(226 232 240 / 74%);
    --table-text: rgb(226 232 240 / 88%);
    --table-cell-bg: rgb(23 33 52 / 90%);
    --table-cell-alt-bg: rgb(24 45 62 / 90%);
    --table-border: rgb(255 255 255 / 7%);
    --table-strong: rgb(241 245 249 / 90%);
    --table-negative: rgb(248 113 113 / 96%);
    --table-hover: rgb(255 255 255 / 2%);
    --table-app-cell: linear-gradient(180deg, rgb(27 39 60 / 94%) 0%, rgb(24 34 54 / 94%) 100%);
    --table-ad-platform-cell: #162033;
    --scrollbar-track: rgb(15 23 42 / 76%);
    --scrollbar-thumb-start: rgb(96 165 250 / 96%);
    --scrollbar-thumb-end: rgb(59 130 246 / 96%);
    --scrollbar-thumb-hover-start: rgb(125 211 252 / 96%);
    --scrollbar-thumb-hover-end: rgb(37 99 235 / 96%);
    --sk-grid-bg: rgb(255 255 255 / 5%);
    --sk-grid-border: rgb(255 255 255 / 8%);

    overflow: hidden;
    background: var(--panel-bg);
    backdrop-filter: blur(16px) saturate(1.08);
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    box-shadow: var(--panel-shadow);
  }

  .panel__top {
    padding: 14px 14px 0;
  }

  :global(html:not(.dark)) .panel {
    --panel-bg:
      linear-gradient(180deg, rgb(255 255 255 / 96%) 0%, rgb(247 250 252 / 98%) 100%),
      radial-gradient(circle at top right, rgb(59 130 246 / 8%), transparent 35%);
    --panel-border: rgb(203 213 225 / 88%);
    --panel-shadow: 0 10px 24px rgb(15 23 42 / 8%), inset 0 1px 0 rgb(255 255 255 / 92%);
    --panel-header-border: rgb(226 232 240 / 92%);
    --panel-hint-color: rgb(71 85 105 / 70%);
    --table-shell-bg: linear-gradient(
      180deg,
      rgb(255 255 255 / 92%) 0%,
      rgb(248 250 252 / 92%) 100%
    );
    --table-shell-border: rgb(203 213 225 / 90%);
    --section-bg: linear-gradient(180deg, rgb(255 255 255 / 78%) 0%, rgb(248 250 252 / 84%) 100%);
    --section-border: rgb(203 213 225 / 58%);
    --section-shadow: inset 0 1px 0 rgb(255 255 255 / 86%);
    --section-eyebrow: rgb(100 116 139 / 72%);
    --section-title: rgb(15 23 42 / 96%);
    --section-meta: rgb(100 116 139 / 76%);
    --table-wrap-bg: #fff;
    --table-wrap-border: #d2d7df;
    --table-head-bg: #fff;
    --table-head-text: rgb(31 41 55 / 78%);
    --table-text: rgb(31 41 55 / 88%);
    --table-cell-bg: #fff;
    --table-cell-alt-bg: rgb(241 245 249 / 94%);
    --table-border: rgb(143 143 143 / 72%);
    --table-strong: rgb(31 41 55 / 92%);
    --table-negative: #111827;
    --table-hover: rgb(148 163 184 / 6%);
    --table-app-cell: linear-gradient(
      180deg,
      rgb(248 250 252 / 98%) 0%,
      rgb(241 245 249 / 98%) 100%
    );
    --table-ad-platform-cell: #162033;
    --scrollbar-track: rgb(226 232 240 / 92%);
    --scrollbar-thumb-start: rgb(148 163 184 / 96%);
    --scrollbar-thumb-end: rgb(100 116 139 / 96%);
    --scrollbar-thumb-hover-start: rgb(120 137 167 / 96%);
    --scrollbar-thumb-hover-end: rgb(71 85 105 / 96%);
    --sk-grid-bg: rgb(255 255 255 / 88%);
    --sk-grid-border: rgb(226 232 240 / 92%);
  }

  .panel__header {
    padding: 14px 18px 10px;
    border-bottom: 1px solid var(--panel-header-border);
  }

  .header-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hint {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
    color: var(--panel-hint-color);
  }

  .panel__body {
    padding: 12px 14px 16px;
  }

  .dimension-shell {
    display: grid;
    gap: 16px;
    min-width: 0;
    padding: 12px;
    background: var(--table-shell-bg);
    border: 1px solid var(--table-shell-border);
    border-radius: 16px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 5%),
      0 6px 18px rgb(0 0 0 / 12%);
  }

  .dimension-section {
    display: grid;
    gap: 10px;
    padding: 12px;
    background: var(--section-bg);
    border: 1px solid var(--section-border);
    border-radius: 16px;
    box-shadow: var(--section-shadow);
  }

  .dimension-section__head {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    justify-content: space-between;
    padding: 2px 2px 0;
  }

  .dimension-section__eyebrow {
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 800;
    color: var(--section-eyebrow);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .dimension-section__title {
    font-size: 15px;
    font-weight: 800;
    color: var(--section-title);
    letter-spacing: 0.01em;
  }

  .dimension-section__meta {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--section-meta);
  }

  .dimension-section__meta span {
    padding: 4px 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 999px;
  }

  :global(html:not(.dark)) .dimension-section__meta span {
    background: rgb(255 255 255 / 76%);
    border-color: rgb(203 213 225 / 92%);
  }

  .dimension-table-wrap {
    max-width: 100%;
    overflow: auto;
    background: var(--table-wrap-bg);
    border: 1px solid var(--table-wrap-border);
    border-radius: 14px;
    scrollbar-gutter: stable;
    scrollbar-width: auto;
    scrollbar-color: var(--scrollbar-thumb-end) var(--scrollbar-track);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 4%),
      0 6px 18px rgb(2 6 23 / 8%);
  }

  .dimension-table-wrap--detail {
    max-height: 576px;
    overflow-y: auto;
  }

  .dimension-table-wrap::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  .dimension-table-wrap::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
    border-radius: 999px;
  }

  .dimension-table-wrap::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--scrollbar-thumb-start), var(--scrollbar-thumb-end));
    border: 2px solid var(--scrollbar-track);
    border-radius: 999px;
  }

  .dimension-table-wrap::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      180deg,
      var(--scrollbar-thumb-hover-start),
      var(--scrollbar-thumb-hover-end)
    );
  }

  .dimension-table {
    width: max-content;
    min-width: 100%;
    color: var(--table-text);
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: collapse;
  }

  .dimension-table th,
  .dimension-table td {
    padding: 10px;
    font-size: 12px;
    line-height: 1.25;
    white-space: nowrap;
    border: 1px solid var(--table-border);
  }

  .dimension-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    font-weight: 700;
    color: var(--table-head-text);
    text-align: center;
    background: var(--table-head-bg);
    backdrop-filter: blur(8px);
  }

  .dimension-table td {
    font-weight: 500;
    background: var(--table-cell-bg);
    transition: background-color 160ms ease;
  }

  .dimension-table tbody tr.is-alt td {
    background: var(--table-cell-alt-bg);
  }

  .dimension-table tbody tr:hover td {
    background: color-mix(in srgb, var(--table-cell-bg) 88%, var(--table-hover));
  }

  .dimension-table tbody tr.is-alt:hover td {
    background: color-mix(in srgb, var(--table-cell-alt-bg) 88%, var(--table-hover));
  }

  .cell-app,
  .cell-platform,
  .cell-ad-platform,
  .cell-label {
    color: var(--table-strong);
  }

  .cell-app {
    max-width: 132px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    background: var(--table-app-cell) !important;
  }

  .cell-platform {
    vertical-align: middle;
  }

  .cell-ad-platform {
    vertical-align: middle;
    background: var(--table-ad-platform-cell) !important;
  }

  .cell-strong {
    font-weight: 600;
  }

  .dimension-table--summary td:not(:first-child),
  .dimension-table--detail td:not(.cell-app, .cell-platform, .cell-ad-platform, .cell-label) {
    font-variant-numeric: tabular-nums;
  }

  .cell-value.is-negative {
    color: var(--table-negative);
  }

  .empty-row td {
    padding: 24px 16px;
    text-align: center;
  }

  .table-sk-title {
    width: 180px !important;
    height: 16px !important;
    margin-bottom: 8px;
  }

  .table-sk-hint {
    width: 58% !important;
    height: 12px !important;
  }

  .table-sk-shell {
    display: grid;
    gap: 16px;
    padding: 8px;
  }

  .table-sk-grid {
    display: grid;
    gap: 6px;
    padding: 12px;
    background: var(--sk-grid-bg);
    border: 1px solid var(--sk-grid-border);
    border-radius: 12px;
  }

  .table-sk-grid--summary {
    grid-template-columns: repeat(9, 1fr);
  }

  .table-sk-grid--detail {
    grid-template-columns: repeat(6, 1fr);
  }

  .table-sk-cell {
    width: 100% !important;
    height: 18px !important;
  }

  @media (width <= 1200px) {
    .dimension-section__head {
      flex-direction: column;
      align-items: flex-start;
    }

    .dimension-section__meta {
      flex-wrap: wrap;
    }
  }
</style>
