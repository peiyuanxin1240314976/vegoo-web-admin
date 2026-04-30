<template>
  <div
    ref="containerRef"
    class="art-virtual-table"
    :class="{ 'art-virtual-table--h-scroll': minTotalWidth != null && minTotalWidth > 0 }"
  >
    <ElTableV2
      v-if="tableWidth > 0"
      :columns="computedColumns"
      :data="data"
      :width="tableWidth"
      :height="tableHeight"
      :row-height="rowHeight"
      :header-height="headerHeight"
      :expand-column-key="expandColumnKey"
      :row-key="rowKey"
      v-model:expandedRowKeys="expandedKeys"
      :row-class="rowClass ? rowClassWrapper : undefined"
      :row-props="rowStyle ? rowPropsWrapper : undefined"
      class="art-virtual-table__inner"
    />
  </div>
</template>

<script lang="ts">
  export interface ArtVirtualTableColumn {
    key: string
    title: string
    width: number
    flexGrow?: number
    fixed?: 'left' | 'right'
    align?: 'left' | 'center' | 'right'
    showOverflowTooltip?: boolean
  }
</script>

<script setup lang="ts">
  import { computed, Fragment, h, onMounted, onUnmounted, ref, useSlots, watch } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import type { CSSProperties } from 'vue'
  import { TableV2FixedDir } from 'element-plus'

  defineOptions({ name: 'ArtVirtualTable' })

  type ExpandedKey = string | number

  const props = withDefaults(
    defineProps<{
      columns: ArtVirtualTableColumn[]
      data: any[]
      rowKey?: string
      expandColumnKey?: string
      /** 受控展开行 keys（用于树表/分组展开） */
      expandedRowKeys?: ExpandedKey[]
      rowHeight?: number
      headerHeight?: number
      /** 从 window.innerHeight 减去多少来算表格高度，对应 calc(100vh - N) */
      heightOffset?: number
      minHeight?: number
      /**
       * 表格内容最小总宽度（各列宽之和）。大于容器宽度时由外层横向滚动条承载（需在页面侧包一层 overflow-x: auto）。
       */
      minTotalWidth?: number
      rowClass?: (params: { rowData: any; rowIndex: number; columns: any[] }) => string
      rowStyle?: (params: { rowData: any; rowIndex: number }) => CSSProperties
    }>(),
    {
      rowKey: 'id',
      rowHeight: 44,
      headerHeight: 44,
      heightOffset: 600,
      minHeight: 300
    }
  )

  const emit = defineEmits<{
    (e: 'update:expandedRowKeys', v: ExpandedKey[]): void
  }>()

  const slots = useSlots()

  // 容器宽度：ResizeObserver 监听
  const containerRef = ref<HTMLElement | null>(null)
  const tableWidth = ref(0)

  function resolveTableWidth(viewportW: number): number {
    const minW = props.minTotalWidth
    if (typeof minW === 'number' && minW > 0) return Math.max(viewportW, minW)
    return viewportW
  }

  function syncTableWidthFromContainer() {
    const el = containerRef.value
    if (!el) return
    tableWidth.value = resolveTableWidth(el.clientWidth)
  }

  onMounted(() => {
    const el = containerRef.value
    if (!el) return
    const ro = new ResizeObserver(() => syncTableWidthFromContainer())
    ro.observe(el)
    syncTableWidthFromContainer()
    onUnmounted(() => ro.disconnect())
  })

  watch(
    () => props.minTotalWidth,
    () => syncTableWidthFromContainer()
  )

  // 表格高度：响应 window 尺寸变化，等价于 CSS min(calc(100vh - offset), 60vh)
  const { height: windowHeight } = useWindowSize()
  const tableHeight = computed(() => {
    const vh60 = windowHeight.value * 0.6
    const offset = windowHeight.value - props.heightOffset
    return Math.max(props.minHeight, Math.min(offset, vh60))
  })

  // 展开/收起状态（内部管理 + 支持外部 v-model 控制）
  const innerExpandedKeys = ref<ExpandedKey[]>([])
  const expandedKeys = computed<ExpandedKey[]>({
    get: () => props.expandedRowKeys ?? innerExpandedKeys.value,
    set: (v) => {
      innerExpandedKeys.value = v
      emit('update:expandedRowKeys', v)
    }
  })

  // 将 columns 映射为 ElTableV2 所需格式，cellRenderer 调用具名 slot
  const computedColumns = computed(() =>
    props.columns.map((col) => ({
      key: col.key,
      dataKey: col.key,
      title: col.title,
      width: col.width,
      flexGrow: col.flexGrow,
      fixed: col.fixed
        ? col.fixed === 'left'
          ? TableV2FixedDir.LEFT
          : TableV2FixedDir.RIGHT
        : undefined,
      align: col.align ?? 'left',
      showOverflowTooltip: col.showOverflowTooltip,
      cellRenderer: ({ rowData, rowIndex, cellData, columnIndex }: any) => {
        const slotFn = slots[`cell:${col.key}`]
        if (slotFn) {
          const nodes = slotFn({ row: rowData, rowIndex, cellData, columnIndex })
          return h(Fragment, null, nodes)
        }
        return h('span', String(cellData ?? ''))
      }
    }))
  )

  function rowClassWrapper(params: any): string {
    return props.rowClass?.(params) ?? ''
  }

  function rowPropsWrapper(params: any): Record<string, any> {
    const style = props.rowStyle?.(params)
    return style ? { style } : {}
  }

  /** 展开所有有子行的父行 */
  function expandAll() {
    const keys: ExpandedKey[] = []
    const collect = (rows: any[]) => {
      for (const row of rows) {
        if (row.children?.length) {
          keys.push(row[props.rowKey])
          collect(row.children)
        }
      }
    }
    collect(props.data)
    expandedKeys.value = keys
  }

  /** 收起所有行 */
  function collapseAll() {
    expandedKeys.value = []
  }

  defineExpose({ expandAll, collapseAll, expandedKeys })
</script>

<style scoped lang="scss">
  .art-virtual-table {
    width: 100%;
    overflow: hidden;
  }

  /** 列总宽大于容器时由页面外层 overflow-x: auto 承担横向滚动 */
  .art-virtual-table--h-scroll {
    width: max-content;
    min-width: 100%;
    overflow: visible hidden;
  }

  .art-virtual-table__inner {
    // 覆盖 ElTableV2 内部颜色，适配深色主题
    :deep(.el-table-v2__header-wrapper) {
      background: var(--default-box-color);
    }

    :deep(.el-table-v2__header-cell) {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      background: var(--default-box-color);
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-table-v2__row) {
      border-bottom: 1px solid color-mix(in srgb, var(--default-border) 50%, transparent);
      transition: background 0.1s ease;

      &:hover {
        background: color-mix(in srgb, var(--art-success) 6%, var(--default-box-color));
      }
    }

    :deep(.el-table-v2__cell-text) {
      overflow: hidden;
      font-size: 13px;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // 展开图标
    :deep(.el-table-v2__expand-icon) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s ease;

      &:hover {
        background: color-mix(in srgb, var(--art-success) 14%, transparent);
      }

      svg {
        color: var(--el-text-color-secondary);
        transition: transform 0.2s ease;
      }

      &.is-expanded svg {
        color: var(--art-success);
      }
    }

    // 行内操作按钮
    :deep(.el-button.is-link) {
      font-size: 12px;
    }

    // 修复右固定列阴影
    :deep([class*='el-table-v2__body']) {
      background: var(--default-box-color);
    }
  }
</style>
