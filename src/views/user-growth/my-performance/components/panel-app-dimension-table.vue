<template>
  <div class="panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="panel__header">
          <ElSkeletonItem variant="text" class="excel-sk-title" />
          <ElSkeletonItem variant="text" class="excel-sk-hint" />
        </div>
        <div class="panel__body">
          <div class="excel-sk-shell">
            <div class="excel-sk-grid excel-sk-grid--summary">
              <ElSkeletonItem v-for="c in 9" :key="`s-${c}`" variant="text" class="excel-sk-cell" />
            </div>
            <div class="excel-sk-grid excel-sk-grid--detail">
              <ElSkeletonItem
                v-for="c in 11"
                :key="`h-${c}`"
                variant="text"
                class="excel-sk-cell"
              />
              <template v-for="r in 9" :key="`r-${r}`">
                <ElSkeletonItem
                  v-for="c in 11"
                  :key="`r-${r}-c-${c}`"
                  variant="text"
                  class="excel-sk-cell"
                />
              </template>
            </div>
          </div>
        </div>
      </template>

      <template #default>
        <div v-if="resolvedHeaderHint" class="panel__header">
          <div class="header-copy">
            <!-- <div class="title">{{ title }}</div> -->
            <div class="hint">{{ resolvedHeaderHint }}</div>
          </div>
        </div>

        <div class="panel__body">
          <slot name="prepend"></slot>
          <div ref="excelShellRef" class="excel-shell" tabindex="0" @keydown="onShellKeydown">
            <!-- <div class="excel-toolbar">
              <div class="excel-toolbar__hint">
                拖拽可框选，按 <span>Ctrl/Cmd + C</span> 复制选区内容
              </div>
              <div class="excel-toolbar__selection">{{ selectionLabel }}</div>
            </div> -->

            <div ref="excelScrollRef" class="excel-scroll">
              <div class="excel-sheet">
                <section class="excel-section">
                  <div class="excel-table-wrap" :style="getWrapStyle(summarySection)">
                    <div
                      v-if="summarySelectionStyle"
                      class="excel-selection"
                      :style="summarySelectionStyle"
                    ></div>

                    <table class="excel-table">
                      <colgroup>
                        <col
                          v-for="(width, index) in summarySection.columns"
                          :key="`summary-col-${index}`"
                          :style="{ width: `${width}px` }"
                        />
                      </colgroup>
                      <tbody>
                        <tr
                          v-for="(row, rowIndex) in summarySection.renderRows"
                          :key="`summary-row-${rowIndex}`"
                          :style="{ height: `${summarySection.rows[rowIndex]}px` }"
                        >
                          <template
                            v-for="(cell, cellIndex) in row"
                            :key="cell?.id ?? `summary-empty-${rowIndex}-${cellIndex}`"
                          >
                            <td
                              v-if="cell"
                              :rowspan="cell.rowSpan ?? 1"
                              :colspan="cell.colSpan ?? 1"
                              class="excel-cell"
                              :class="getCellClass(summarySection, cell)"
                              :style="{ textAlign: cell.align ?? 'left' }"
                              @mousedown.left.prevent="
                                onCellPointerDown(summarySection.key, cell, $event)
                              "
                              @mouseenter="onCellPointerEnter(summarySection.key, cell)"
                            >
                              <span class="excel-cell__text">{{ cell.text }}</span>
                            </td>
                          </template>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section class="excel-section">
                  <div class="excel-table-wrap" :style="getWrapStyle(detailSection)">
                    <div
                      v-if="detailSelectionStyle"
                      class="excel-selection"
                      :style="detailSelectionStyle"
                    ></div>

                    <table class="excel-table">
                      <colgroup>
                        <col
                          v-for="(width, index) in detailSection.columns"
                          :key="`detail-col-${index}`"
                          :style="{ width: `${width}px` }"
                        />
                      </colgroup>
                      <tbody>
                        <tr
                          v-for="(row, rowIndex) in detailSection.renderRows"
                          :key="`detail-row-${rowIndex}`"
                          :style="{ height: `${detailSection.rows[rowIndex]}px` }"
                        >
                          <template
                            v-for="(cell, cellIndex) in row"
                            :key="cell?.id ?? `detail-empty-${rowIndex}-${cellIndex}`"
                          >
                            <td
                              v-if="cell"
                              :rowspan="cell.rowSpan ?? 1"
                              :colspan="cell.colSpan ?? 1"
                              class="excel-cell"
                              :class="getCellClass(detailSection, cell)"
                              :style="{ textAlign: cell.align ?? 'left' }"
                              @mousedown.left.prevent="
                                onCellPointerDown(detailSection.key, cell, $event)
                              "
                              @mouseenter="onCellPointerEnter(detailSection.key, cell)"
                            >
                              <span class="excel-cell__text">{{ cell.text }}</span>
                            </td>
                          </template>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import {
    panelAppDimensionAppBlocks,
    panelAppDimensionDateHeaders,
    panelAppDimensionSummaryRows,
    panelAppDimensionText
  } from '../mock/panel-app-dimension-table.mock'
  import type { MyPerformanceAppTableSummary, MyPerformanceAppTreeRow } from '../types'

  defineOptions({ name: 'MyPerformancePanelAppDimensionTable' })

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      // title: string
      list: MyPerformanceAppTreeRow[]
      summary: MyPerformanceAppTableSummary
      headerHint?: string
    }>(),
    {
      loading: false,
      headerHint: (() => {
        const endDate = getAppNow()
        const startDate = cloneAppDate(endDate)
        startDate.setDate(startDate.getDate() - 7)
        return `计算周期：${formatYYYYMMDD(startDate)} 至 ${formatYYYYMMDD(endDate)} | 应用层级预估利润基于真实收入计算，广告平台预估利润基于回收计算`
      })()
    }
  )

  type CellAlign = 'left' | 'center' | 'right'

  type GridCell = {
    id: string
    row: number
    col: number
    rowSpan?: number
    colSpan?: number
    text: string
    align?: CellAlign
    header?: boolean
    strong?: boolean
    alt?: boolean
    negative?: boolean
  }

  type GridSection = {
    key: 'summary' | 'detail'
    columns: number[]
    rows: number[]
    cells: GridCell[]
    values: string[][]
    renderRows: Array<Array<GridCell | null>>
  }

  type CellPoint = {
    section: GridSection['key']
    row: number
    col: number
  }

  const excelShellRef = ref<HTMLDivElement>()
  const excelScrollRef = ref<HTMLDivElement>()
  const dragging = ref(false)
  const activeCell = ref<CellPoint | null>(null)
  const selectionStart = ref<CellPoint | null>(null)
  const selectionEnd = ref<CellPoint | null>(null)
  const availableWidth = ref(910)
  const MIN_SECTION_WIDTH = 910
  const SUMMARY_BASE_COLUMNS = [90, 78, 78, 78, 78, 78, 78, 78, 78]
  const DETAIL_BASE_COLUMNS = [114, 24, 80, 64, 54, 54, 54, 54, 54, 54, 54]
  let resizeObserver: ResizeObserver | null = null

  const textMap = panelAppDimensionText
  // const title = computed(() => props.title)
  const resolvedHeaderHint = computed(() => props.headerHint)

  const summarySection = computed<GridSection>(() => buildSummarySection())
  const detailSection = computed<GridSection>(() => buildDetailSection())

  const currentSelection = computed(() => {
    const start = selectionStart.value
    const end = selectionEnd.value
    if (!start || !end || start.section !== end.section) return null

    return {
      section: start.section,
      startRow: Math.min(start.row, end.row),
      endRow: Math.max(start.row, end.row),
      startCol: Math.min(start.col, end.col),
      endCol: Math.max(start.col, end.col)
    }
  })

  // const selectionLabel = computed(() => {
  //   const selection = currentSelection.value
  //   if (!selection) return '未选择单元格'

  //   const rows = selection.endRow - selection.startRow + 1
  //   const cols = selection.endCol - selection.startCol + 1
  //   const sectionLabel = selection.section === 'summary' ? '汇总区' : '明细区'
  //   return `${sectionLabel} ${rows} × ${cols}`
  // })

  const summarySelectionStyle = computed(() =>
    getSelectionStyle(summarySection.value, currentSelection.value)
  )
  const detailSelectionStyle = computed(() =>
    getSelectionStyle(detailSection.value, currentSelection.value)
  )

  onMounted(() => {
    window.addEventListener('mouseup', stopDragging)
    updateAvailableWidth()

    if (typeof ResizeObserver !== 'undefined' && excelScrollRef.value) {
      resizeObserver = new ResizeObserver(() => {
        updateAvailableWidth()
      })
      resizeObserver.observe(excelScrollRef.value)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mouseup', stopDragging)
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  function buildSummarySection(): GridSection {
    const headers = [textMap.item, textMap.total, ...panelAppDimensionDateHeaders]
    const rows = [40, 34, 34, 34, 34]
    const columns = buildResponsiveColumns(SUMMARY_BASE_COLUMNS)
    const values = Array.from({ length: rows.length }, () =>
      Array.from({ length: columns.length }, () => '')
    )
    const cells: GridCell[] = []

    headers.forEach((label, col) => {
      cells.push({
        id: `summary-header-${col}`,
        row: 0,
        col,
        text: label,
        header: true,
        align: 'center',
        strong: true
      })
      values[0][col] = label
    })

    panelAppDimensionSummaryRows.forEach((row, index) => {
      const rowIndex = index + 1
      const rowLabel = String(row.label)
      const rowTotal = String(row.total)

      cells.push({
        id: `summary-label-${rowIndex}`,
        row: rowIndex,
        col: 0,
        text: rowLabel,
        strong: true
      })
      values[rowIndex][0] = rowLabel

      cells.push({
        id: `summary-total-${rowIndex}`,
        row: rowIndex,
        col: 1,
        text: rowTotal,
        strong: true,
        align: 'left'
      })
      values[rowIndex][1] = rowTotal

      row.days.forEach((value, dayIndex) => {
        const text = String(value)
        cells.push({
          id: `summary-value-${rowIndex}-${dayIndex}`,
          row: rowIndex,
          col: dayIndex + 2,
          text,
          strong: true,
          align: 'left'
        })
        values[rowIndex][dayIndex + 2] = text
      })
    })

    return createSection('summary', columns, rows, cells, values)
  }

  function buildDetailSection(): GridSection {
    const headers = [
      textMap.app,
      textMap.platform,
      textMap.adPlatform,
      textMap.item,
      ...panelAppDimensionDateHeaders
    ]
    const columns = buildResponsiveColumns(DETAIL_BASE_COLUMNS)
    const rows = [34, ...Array.from({ length: panelAppDimensionAppBlocks.length * 4 }, () => 28)]
    const values = Array.from({ length: rows.length }, () =>
      Array.from({ length: columns.length }, () => '')
    )
    const cells: GridCell[] = []

    headers.forEach((label, col) => {
      cells.push({
        id: `detail-header-${col}`,
        row: 0,
        col,
        text: label,
        header: true,
        align: 'center',
        strong: true
      })
      values[0][col] = label
    })

    let rowOffset = 1

    panelAppDimensionAppBlocks.forEach((block, blockIndex) => {
      const blockAlt = !!block.alt
      const blockRows = [...block.allRows, ...block.googleRows]

      cells.push({
        id: `detail-app-${blockIndex}`,
        row: rowOffset,
        col: 0,
        rowSpan: 4,
        text: block.app,
        strong: true,
        alt: blockAlt
      })
      values[rowOffset][0] = block.app

      cells.push({
        id: `detail-platform-${blockIndex}`,
        row: rowOffset,
        col: 1,
        rowSpan: 4,
        text: block.platform,
        strong: true,
        align: 'center',
        alt: blockAlt
      })
      values[rowOffset][1] = block.platform

      cells.push({
        id: `detail-all-${blockIndex}`,
        row: rowOffset,
        col: 2,
        rowSpan: 2,
        text: textMap.all,
        strong: true,
        alt: blockAlt
      })
      values[rowOffset][2] = textMap.all

      cells.push({
        id: `detail-google-${blockIndex}`,
        row: rowOffset + 2,
        col: 2,
        rowSpan: 2,
        text: 'Google',
        strong: true,
        alt: blockAlt
      })
      values[rowOffset + 2][2] = 'Google'

      blockRows.forEach((metricRow, metricIndex) => {
        const rowIndex = rowOffset + metricIndex

        cells.push({
          id: `detail-metric-${blockIndex}-${metricIndex}`,
          row: rowIndex,
          col: 3,
          text: metricRow.label,
          strong: true,
          alt: blockAlt
        })
        values[rowIndex][3] = metricRow.label

        metricRow.values.forEach((rawValue, dayIndex) => {
          const text = String(rawValue)
          cells.push({
            id: `detail-value-${blockIndex}-${metricIndex}-${dayIndex}`,
            row: rowIndex,
            col: dayIndex + 4,
            text,
            strong: true,
            align: 'left',
            negative: isNegative(text),
            alt: blockAlt
          })
          values[rowIndex][dayIndex + 4] = text
        })
      })

      rowOffset += 4
    })

    return createSection('detail', columns, rows, cells, values)
  }

  function createSection(
    key: GridSection['key'],
    columns: number[],
    rows: number[],
    cells: GridCell[],
    values: string[][]
  ): GridSection {
    return {
      key,
      columns,
      rows,
      cells,
      values,
      renderRows: buildRenderRows(rows.length, columns.length, cells)
    }
  }

  function buildRenderRows(rowCount: number, columnCount: number, cells: GridCell[]) {
    const matrix = Array.from({ length: rowCount }, () =>
      Array.from({ length: columnCount }, () => null as GridCell | null)
    )

    cells.forEach((cell) => {
      matrix[cell.row][cell.col] = cell
      for (let rowOffset = 0; rowOffset < (cell.rowSpan ?? 1); rowOffset += 1) {
        for (let colOffset = 0; colOffset < (cell.colSpan ?? 1); colOffset += 1) {
          if (rowOffset === 0 && colOffset === 0) continue
          matrix[cell.row + rowOffset][cell.col + colOffset] = null
        }
      }
    })

    return matrix
  }

  function getWrapStyle(section: GridSection) {
    const width = `${sum(section.columns)}px`

    return {
      width,
      minWidth: width,
      maxWidth: width,
      height: `${sum(section.rows)}px`
    }
  }

  function buildResponsiveColumns(baseColumns: number[]) {
    const targetWidth = Math.max(MIN_SECTION_WIDTH, availableWidth.value)
    const baseTotal = sum(baseColumns)

    if (targetWidth <= baseTotal) {
      return [...baseColumns]
    }

    return scaleColumns(baseColumns, targetWidth)
  }

  function scaleColumns(baseColumns: number[], targetWidth: number) {
    const baseTotal = sum(baseColumns)
    const ratio = targetWidth / baseTotal
    const scaled = baseColumns.map((width) => Math.max(32, Math.round(width * ratio)))
    const diff = targetWidth - sum(scaled)

    scaled[scaled.length - 1] += diff

    return scaled
  }

  function updateAvailableWidth() {
    const element = excelScrollRef.value
    if (!element) return

    const computedStyle = window.getComputedStyle(element)
    const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 0
    const paddingRight = Number.parseFloat(computedStyle.paddingRight) || 0
    const nextWidth = Math.floor(element.clientWidth - paddingLeft - paddingRight)

    availableWidth.value = Math.max(MIN_SECTION_WIDTH, nextWidth)
  }

  function getCellClass(section: GridSection, cell: GridCell) {
    const active = activeCell.value?.section === section.key ? activeCell.value : null
    const selection =
      currentSelection.value?.section === section.key ? currentSelection.value : null

    return {
      'is-header': !!cell.header,
      'is-strong': !!cell.strong,
      'is-alt': !!cell.alt,
      'is-negative': !!cell.negative,
      'is-active': isCellActive(active, cell),
      'is-highlight-row': isCellInHighlightedRow(active, cell),
      'is-highlight-col': isCellInHighlightedCol(active, cell),
      'is-selected': isCellIntersectSelection(selection, cell)
    }
  }

  function onCellPointerDown(section: GridSection['key'], cell: GridCell, event: MouseEvent) {
    const point = {
      section,
      row: cell.row,
      col: cell.col
    }

    dragging.value = true
    activeCell.value = point
    selectionStart.value = point
    selectionEnd.value = point
    excelShellRef.value?.focus()

    if (event.detail === 2) {
      copyCurrentSelection()
    }
  }

  function onCellPointerEnter(section: GridSection['key'], cell: GridCell) {
    if (!dragging.value || !selectionStart.value) return

    selectionEnd.value = {
      section,
      row: cell.row,
      col: cell.col
    }
  }

  function stopDragging() {
    dragging.value = false
  }

  function onShellKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault()
      copyCurrentSelection()
      return
    }

    if (!activeCell.value) return

    const section = getSectionByKey(activeCell.value.section)
    const next = moveActiveCell(section, activeCell.value, event.key)
    if (!next) return

    event.preventDefault()
    activeCell.value = next
    selectionStart.value = next
    selectionEnd.value = next
  }

  function moveActiveCell(section: GridSection, point: CellPoint, key: string) {
    let row = point.row
    let col = point.col

    if (key === 'ArrowUp') row -= 1
    else if (key === 'ArrowDown') row += 1
    else if (key === 'ArrowLeft') col -= 1
    else if (key === 'ArrowRight') col += 1
    else return null

    return {
      section: section.key,
      row: clamp(row, 0, section.rows.length - 1),
      col: clamp(col, 0, section.columns.length - 1)
    }
  }

  async function copyCurrentSelection() {
    const selection = currentSelection.value
    if (!selection) return

    const section = getSectionByKey(selection.section)
    const text = section.values
      .slice(selection.startRow, selection.endRow + 1)
      .map((row) => row.slice(selection.startCol, selection.endCol + 1).join('\t'))
      .join('\n')

    await copyText(text)
  }

  function getSectionByKey(key: GridSection['key']) {
    return key === 'summary' ? summarySection.value : detailSection.value
  }

  function getSelectionStyle(
    section: GridSection,
    selection: {
      section: GridSection['key']
      startRow: number
      endRow: number
      startCol: number
      endCol: number
    } | null
  ) {
    if (!selection || selection.section !== section.key) return null

    const top = getOffset(section.rows, selection.startRow)
    const left = getOffset(section.columns, selection.startCol)
    const width = spanSize(
      section.columns,
      selection.startCol,
      selection.endCol - selection.startCol + 1
    )
    const height = spanSize(
      section.rows,
      selection.startRow,
      selection.endRow - selection.startRow + 1
    )

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${Math.max(width, 1)}px`,
      height: `${Math.max(height, 1)}px`
    }
  }

  function isCellActive(active: CellPoint | null, cell: GridCell) {
    if (!active) return false
    return active.row === cell.row && active.col === cell.col
  }

  function isCellInHighlightedRow(active: CellPoint | null, cell: GridCell) {
    if (!active) return false
    return active.row >= cell.row && active.row < cell.row + (cell.rowSpan ?? 1)
  }

  function isCellInHighlightedCol(active: CellPoint | null, cell: GridCell) {
    if (!active) return false
    return active.col >= cell.col && active.col < cell.col + (cell.colSpan ?? 1)
  }

  function isCellIntersectSelection(
    selection: {
      startRow: number
      endRow: number
      startCol: number
      endCol: number
    } | null,
    cell: GridCell
  ) {
    if (!selection) return false

    const rowEnd = cell.row + (cell.rowSpan ?? 1) - 1
    const colEnd = cell.col + (cell.colSpan ?? 1) - 1

    return !(
      selection.endRow < cell.row ||
      selection.startRow > rowEnd ||
      selection.endCol < cell.col ||
      selection.startCol > colEnd
    )
  }

  async function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return
      } catch {
        // fall through
      }
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  function getOffset(sizes: number[], start: number) {
    return sum(sizes.slice(0, start))
  }

  function spanSize(sizes: number[], start: number, span: number) {
    return sum(sizes.slice(start, start + span))
  }

  function sum(values: number[]) {
    return values.reduce((total, current) => total + current, 0)
  }

  function isNegative(value: string) {
    return value.trim().startsWith('-')
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }
</script>

<style scoped lang="scss">
  .panel {
    position: relative;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgb(17 24 39 / 96%) 0%, rgb(19 28 44 / 92%) 100%),
      radial-gradient(circle at top right, rgb(59 130 246 / 10%), transparent 35%);
    backdrop-filter: blur(16px) saturate(1.08);
    border: 1px solid rgb(82 91 111 / 48%);
    border-radius: 18px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 26%),
      inset 0 1px 0 rgb(255 255 255 / 7%);
  }

  .panel__header {
    position: relative;
    z-index: 1;
    padding: 14px 18px 10px;
    border-bottom: 1px solid rgb(255 255 255 / 8%);
  }

  .header-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .title {
    font-size: 14px;
    font-weight: 700;
    color: rgb(244 244 245 / 96%);
    letter-spacing: 0.01em;
  }

  .hint {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
    color: rgb(226 232 240 / 72%);
  }

  .panel__body {
    position: relative;
    z-index: 1;
    padding: 12px 14px 16px;
  }

  .excel-shell {
    position: relative;
    padding: 10px;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgb(8 15 27 / 52%) 0%, rgb(10 18 30 / 18%) 100%),
      linear-gradient(135deg, rgb(255 255 255 / 3%), transparent 44%);
    border: 1px solid rgb(138 150 174 / 22%);
    border-radius: 14px;
    outline: none;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 9%),
      0 8px 24px rgb(0 0 0 / 22%);
  }

  .excel-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 10px;
    color: rgb(226 232 240 / 80%);
  }

  .excel-toolbar__hint,
  .excel-toolbar__selection {
    font-size: 12px;
    line-height: 1.4;
  }

  .excel-toolbar__hint span {
    font-weight: 700;
    color: #fff;
  }

  .excel-toolbar__selection {
    font-variant-numeric: tabular-nums;
    color: rgb(191 219 254 / 90%);
  }

  .excel-scroll {
    width: 100%;
    max-width: 100%;
    max-height: 620px;
    padding: 10px;
    overflow: auto;
    background: linear-gradient(180deg, #f5f7fa 0%, #edf1f5 100%);
    border: 1px solid rgb(124 134 152 / 22%);
    border-radius: 12px;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 84%);
    scrollbar-gutter: stable both-edges;
    scrollbar-width: auto;
    scrollbar-color: rgb(120 137 167 / 88%) rgb(222 228 237 / 92%);
  }

  .excel-scroll::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  .excel-scroll::-webkit-scrollbar-track {
    background: rgb(222 228 237 / 92%);
    border-radius: 999px;
  }

  .excel-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgb(148 163 184 / 96%), rgb(100 116 139 / 96%));
    border: 2px solid rgb(222 228 237 / 92%);
    border-radius: 999px;
  }

  .excel-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgb(120 137 167 / 96%), rgb(71 85 105 / 96%));
  }

  .excel-scroll::-webkit-scrollbar-corner {
    background: rgb(222 228 237 / 92%);
  }

  .excel-sheet {
    display: inline-flex;
    flex-direction: column;
    gap: 12px;
    width: max-content;
    min-width: max-content;
  }

  .excel-section {
    display: inline-block;
    width: max-content;
    min-width: max-content;
    max-width: none;
    padding: 6px;
    background: #fff;
    border: 1px solid #d2d7df;
    border-radius: 6px;
  }

  .excel-table-wrap {
    position: relative;
    display: inline-block;
    width: max-content;
    min-width: max-content;
  }

  .excel-table {
    width: max-content;
    min-width: max-content;
    max-width: none;
    table-layout: auto;
    border-collapse: collapse;
    user-select: none;
    background: #fff;
    border: 1px solid #8f8f8f;
  }

  .excel-selection {
    position: absolute;
    z-index: 3;
    box-sizing: border-box;
    pointer-events: none;
    background: rgb(34 197 94 / 10%);
    border: 2px solid #16a34a;
  }

  .excel-cell {
    position: relative;
    z-index: 1;
    padding: 2px 6px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.1;
    color: #1f2937;
    vertical-align: middle;
    background: #fff;
    border: 1px solid #8f8f8f;
    transition:
      background-color 120ms ease,
      box-shadow 120ms ease;
  }

  .excel-cell__text {
    display: block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .excel-cell.is-header {
    font-weight: 700;
    text-align: center !important;
    background: #fff;
  }

  .excel-cell.is-strong .excel-cell__text {
    font-weight: 700;
  }

  .excel-cell.is-alt {
    background: #d9d9d9;
  }

  .excel-cell.is-negative {
    color: #111827;
  }

  .excel-cell.is-highlight-row,
  .excel-cell.is-highlight-col {
    background: #eef6ff;
  }

  .excel-cell.is-highlight-row.is-alt,
  .excel-cell.is-highlight-col.is-alt {
    background: #d5e3f2;
  }

  .excel-cell.is-selected {
    background: #e7f7ed;
  }

  .excel-cell.is-selected.is-alt {
    background: #d8ebdf;
  }

  .excel-cell.is-active {
    z-index: 4;
    box-shadow: inset 0 0 0 2px #16a34a;
  }

  .excel-sk-title {
    width: 180px !important;
    height: 16px !important;
    margin-bottom: 8px;
  }

  .excel-sk-hint {
    width: 58% !important;
    height: 12px !important;
  }

  .excel-sk-shell {
    display: grid;
    gap: 16px;
    padding: 8px;
  }

  .excel-sk-grid {
    display: grid;
    gap: 6px;
    padding: 12px;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 12px;
  }

  .excel-sk-grid--summary {
    grid-template-columns: 1.4fr 1.2fr repeat(7, 1fr);
  }

  .excel-sk-grid--detail {
    grid-template-columns: 1.3fr 0.8fr 1fr 1fr repeat(7, 1fr);
  }

  .excel-sk-cell {
    width: 100% !important;
    height: 18px !important;
  }

  @media (width <= 1200px) {
    .hint {
      line-height: 1.6;
    }

    .excel-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
