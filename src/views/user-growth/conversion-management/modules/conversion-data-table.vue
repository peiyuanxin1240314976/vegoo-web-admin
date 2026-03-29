<template>
  <div class="conversion-data-table">
    <div class="conversion-data-table__card">
      <div class="conversion-data-table__header">
        <div class="conversion-data-table__title">
          {{ $t('conversionManagement.dataTableTitle') }}
        </div>
        <div class="conversion-data-table__actions">
          <ElButton
            type="success"
            plain
            round
            class="conversion-data-table__action-btn"
            @click="handleExpandAll"
          >
            {{
              isAllExpanded
                ? $t('conversionManagement.actionCollapseAll')
                : $t('conversionManagement.actionExpandAll')
            }}
          </ElButton>
          <ElButton
            type="success"
            plain
            round
            class="conversion-data-table__action-btn"
            @click="handleExport"
          >
            {{ $t('conversionManagement.actionExport') }}
          </ElButton>
          <div class="conversion-data-table__source">
            <span class="conversion-data-table__source-label">
              {{ $t('conversionManagement.dataSourceLabel') }}
            </span>
            <span class="conversion-data-table__source-value">
              {{ $t('conversionManagement.dataSourceGoogleAdsApi') }}
            </span>
          </div>
        </div>
      </div>
      <div class="conversion-data-table__body">
        <div class="conversion-data-table__table-wrap">
          <ArtTable
            class="conversion-data-table__art"
            :data="pagedData"
            :columns="columns"
            :loading="loading"
            size="small"
            stripe
            row-key="id"
            :tree-props="{ children: 'children' }"
            :expand-row-keys="expandedRowKeys"
            :row-class-name="getRowClassName"
            :row-style="getRowStyle"
            :show-table-header="false"
          />
        </div>
        <div class="conversion-data-table__footer">
          <div class="conversion-data-table__footer-grid">
            <div class="conversion-data-table__footer-cell is-left">
              <span class="conversion-data-table__footer-total">TOTAL</span>
              <span class="conversion-data-table__footer-sub">
                {{ $t('conversionManagement.dataTableSubtotal') }}
              </span>
            </div>
            <div class="conversion-data-table__footer-cell is-muted">-</div>
            <div class="conversion-data-table__footer-cell is-muted">-</div>
            <div class="conversion-data-table__footer-cell is-num">
              {{ n(totalConversionCount) }}
            </div>
            <div class="conversion-data-table__footer-cell is-num">
              {{ formatCurrency(totalConversionValue) }}
            </div>
            <div class="conversion-data-table__footer-cell is-num">{{ totalShareText }}</div>
            <div class="conversion-data-table__footer-cell is-muted">--</div>
          </div>
        </div>
        <div class="conversion-data-table__pagination">
          <div class="conversion-data-table__pagination-left">
            {{
              $t('conversionManagement.dataTableSummary', {
                a: summary.accountCount,
                s: summary.seriesCount,
                c: summary.conversionCount
              })
            }}
          </div>
          <ElPagination
            v-model:current-page="pageCurrent"
            v-model:page-size="pageSize"
            :total="pageTotal"
            small
            background
            :page-sizes="pageSizes"
            layout="prev, pager, next, sizes"
            :pager-count="5"
            :hide-on-single-page="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElMessage, ElTag } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import type { ColumnOption } from '@/types'
  import type { ConversionDataRow } from '../types'

  defineOptions({ name: 'ConversionDataTable' })

  const { t, n } = useI18n()

  const props = withDefaults(
    defineProps<{
      data: ConversionDataRow[]
      loading?: boolean
    }>(),
    { data: () => [], loading: false }
  )

  const expandedRowKeys = ref<string[]>([])
  const pageCurrent = ref(1)
  const pageSize = ref(5)
  const pageSizes = [2, 5, 10, 20]
  const pageTotal = computed(() => props.data?.length ?? 0)

  const pagedData = computed(() => {
    const list = props.data ?? []
    const start = (pageCurrent.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  })

  watch(
    () => [props.data?.length, pageSize.value],
    () => {
      const maxPage = Math.max(1, Math.ceil((props.data?.length ?? 0) / pageSize.value))
      if (pageCurrent.value > maxPage) pageCurrent.value = maxPage
      if (pageCurrent.value < 1) pageCurrent.value = 1
      expandedRowKeys.value = []
    }
  )

  const allExpandableRowKeys = computed(() => {
    const keys: string[] = []
    const walk = (rows: ConversionDataRow[]) => {
      rows.forEach((r) => {
        if (r.children?.length) {
          keys.push(r.id)
          walk(r.children)
        }
      })
    }
    walk(pagedData.value ?? [])
    return keys
  })

  const isAllExpanded = computed(() => {
    const all = allExpandableRowKeys.value
    if (!all.length) return false
    const current = new Set(expandedRowKeys.value)
    return all.every((k) => current.has(k))
  })

  const totalConversionCount = computed(() => {
    const walk = (rows: ConversionDataRow[]): number =>
      rows.reduce(
        (sum, r) => sum + (r.conversionCount ?? 0) + (r.children ? walk(r.children) : 0),
        0
      )
    return walk(props.data ?? [])
  })

  const totalConversionValue = computed(() => {
    const walk = (rows: ConversionDataRow[]): number =>
      rows.reduce(
        (sum, r) => sum + (r.conversionValue ?? 0) + (r.children ? walk(r.children) : 0),
        0
      )
    return walk(props.data ?? [])
  })

  const totalShareText = computed(() => {
    const hasData = totalConversionCount.value > 0
    return `${hasData ? 100 : 0}%`
  })

  const summary = computed(() => {
    const list = props.data ?? []
    const accountCount = list.length
    const seriesCount = list.reduce((sum, r) => sum + (r.children?.length ?? 0), 0)
    const conversionCount = list.reduce((sum, r) => {
      const accounts = r.children ?? []
      return sum + accounts.reduce((accSum, a) => accSum + (a.children?.length ?? 0), 0)
    }, 0)
    return { accountCount, seriesCount, conversionCount }
  })

  function handleExpandAll() {
    expandedRowKeys.value = isAllExpanded.value ? [] : [...allExpandableRowKeys.value]
  }

  function handleExport() {
    ElMessage.info(t('conversionManagement.actionTodo'))
  }

  const LEVEL_ACCENT_COLORS = ['#22c1c3', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7']

  function getGroupIndexFromId(id: string) {
    const m = String(id).match(/^g-(\d+)/)
    if (!m) return 0
    const n = Number(m[1])
    return Number.isFinite(n) && n > 0 ? n - 1 : 0
  }

  function getRowAccentColor(row: ConversionDataRow) {
    const idx = getGroupIndexFromId(row.id)
    return LEVEL_ACCENT_COLORS[idx % LEVEL_ACCENT_COLORS.length]
  }

  function getRowClassName({ row }: { row: Record<string, any>; rowIndex: number }) {
    const level = String(row?.level ?? '')
    return level ? `is-level-${level}` : ''
  }

  function getRowStyle({ row }: { row: Record<string, any>; rowIndex: number }) {
    const color = getRowAccentColor(row as ConversionDataRow)
    return { '--row-accent': color } as unknown as import('vue').CSSProperties
  }

  const TYPE_TAG_COLOR: Record<string, string> = {
    PHONE_CALL_LEAD: '#4ABEFF',
    DOWNLOAD: '#67c23a',
    PURCHASE: '#e6a23c',
    ADD_TO_CART: '#722ed1',
    PAGE_VIEW: '#909399',
    BEGIN_CHECKOUT: '#f56c6c'
  }

  function formatCurrency(v: number) {
    return `$${n(v)}`
  }

  function renderDimension(row: ConversionDataRow) {
    const label =
      row.level === 'group'
        ? row.accountGroupName
        : row.level === 'account'
          ? row.accountName
          : row.conversionName

    const secondary =
      row.level === 'conversion'
        ? [row.accountName, row.appPackage].filter(Boolean).join(' · ')
        : row.level === 'account'
          ? row.accountGroupName
          : ''

    return h('div', { class: ['conversion-data-table__dim', `is-${row.level}`] }, [
      h('div', { class: 'conversion-data-table__dim-main' }, label || '-'),
      secondary
        ? h('div', { class: 'conversion-data-table__dim-sub' }, secondary)
        : h('div', { class: 'conversion-data-table__dim-sub is-empty' }, '')
    ])
  }

  function renderTypeTag(row: ConversionDataRow) {
    if (row.level !== 'conversion') return h('span', { class: 'conversion-data-table__muted' }, '-')
    const type = row.platformConversionType || '-'
    const color = TYPE_TAG_COLOR[String(type)] ?? '#909399'
    return h(
      ElTag,
      {
        size: 'small',
        class: 'conversion-data-table__type-tag',
        style: {
          backgroundColor: color,
          borderColor: color,
          color: '#fff',
          borderRadius: '9999px'
        }
      },
      () => String(type)
    )
  }

  function hexToRgba(hex: string, alpha: number) {
    const h = String(hex).replace('#', '').trim()
    const full =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(103,194,58,${alpha})`
    return `rgba(${r},${g},${b},${alpha})`
  }

  function sanitizeId(id: string) {
    return String(id).replace(/[^a-zA-Z0-9_-]/g, '_')
  }

  function renderTrend(row: ConversionDataRow) {
    const points = row.trendPoints ?? []
    const w = 96
    const hgt = 26
    if (!points?.length) return h('span', { class: 'conversion-data-table__muted' }, '-')

    const min = Math.min(...points)
    const max = Math.max(...points)
    const span = Math.max(1, max - min)
    const stepX = w / Math.max(1, points.length - 1)

    const coords = points.map((v, i) => {
      const x = roundNum(i * stepX, 2)
      const y = roundNum(hgt - ((v - min) / span) * hgt, 2)
      return { x, y }
    })
    const path = coords.map((p) => `${p.x},${p.y}`).join(' ')
    const areaPoints = `0,${hgt} ${path} ${w},${hgt}`

    const accent = getRowAccentColor(row)
    const gradId = `trendGrad_${sanitizeId(row.id)}`
    const top = hexToRgba(accent, 0.28)
    const bottom = hexToRgba(accent, 0)

    return h(
      'svg',
      { width: w, height: hgt, viewBox: `0 0 ${w} ${hgt}`, class: 'conversion-data-table__spark' },
      [
        h('defs', {}, [
          h('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' }, [
            h('stop', { offset: '0%', 'stop-color': top }),
            h('stop', { offset: '100%', 'stop-color': bottom })
          ])
        ]),
        h('polygon', {
          points: areaPoints,
          fill: `url(#${gradId})`
        }),
        h('polyline', {
          points: path,
          fill: 'none',
          stroke: accent,
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          opacity: 0.95
        })
      ]
    )
  }

  function roundNum(v: number, digits = 2) {
    const p = 10 ** digits
    return Math.round(v * p) / p
  }

  const columns = computed<ColumnOption<ConversionDataRow>[]>(() => [
    {
      prop: 'dimension',
      label: t('conversionManagement.dataTableDimension'),
      minWidth: 220,
      formatter: (row) => renderDimension(row)
    },
    {
      prop: 'appPackage',
      label: t('conversionManagement.appPackage'),
      minWidth: 130,
      showOverflowTooltip: true,
      formatter: (row) =>
        row.level === 'conversion'
          ? h('span', { class: 'conversion-data-table__app' }, row.appPackage ?? '-')
          : h('span', { class: 'conversion-data-table__muted' }, '-')
    },
    {
      prop: 'platformConversionType',
      label: t('conversionManagement.dataTableConversionType'),
      width: 140,
      formatter: (row) => renderTypeTag(row)
    },
    {
      prop: 'conversionCount',
      label: t('conversionManagement.dataTableConversionCount'),
      width: 110,
      align: 'right',
      formatter: (row) =>
        h('span', { class: 'conversion-data-table__num' }, n(row.conversionCount ?? 0))
    },
    {
      prop: 'conversionValue',
      label: t('conversionManagement.dataTableConversionValue'),
      width: 120,
      align: 'right',
      formatter: (row) =>
        h('span', { class: 'conversion-data-table__num' }, formatCurrency(row.conversionValue ?? 0))
    },
    {
      prop: 'share',
      label: t('conversionManagement.dataTableShare'),
      width: 80,
      align: 'right',
      formatter: (row) => h('span', { class: 'conversion-data-table__num' }, `${row.share ?? 0}%`)
    },
    {
      prop: 'trend',
      label: t('conversionManagement.dataTableTrend'),
      width: 110,
      formatter: (row) => renderTrend(row)
    }
  ])
</script>

<style scoped lang="scss">
  @import '../../ad-performance/styles/ap-card-fx';

  .conversion-data-table {
    margin-bottom: 16px;
  }

  .conversion-data-table__card {
    @include ap-neon-bg;
    @include ap-card-mesh;

    position: relative;
    overflow: hidden;
    border-radius: 14px;
  }

  .conversion-data-table__header {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-success) 22%, var(--default-border));
    box-shadow: inset 0 -1px 0 rgb(59 130 246 / 6%);
  }

  .conversion-data-table__title {
    @include ap-title-gradient;

    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;
  }

  .conversion-data-table__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .conversion-data-table__action-btn {
    color: var(--art-success);
    touch-action: manipulation;
    background: color-mix(in srgb, var(--art-success) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 48%, transparent);
    border-radius: 9999px;
    box-shadow: 0 0 12px rgb(16 185 129 / 12%);
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover,
    &:focus {
      background: color-mix(in srgb, var(--art-success) 16%, transparent);
      border-color: color-mix(in srgb, var(--art-success) 72%, transparent);
      box-shadow: 0 0 18px rgb(16 185 129 / 22%);
    }
  }

  .conversion-data-table__source {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .conversion-data-table__source-value {
    color: var(--el-text-color-primary);
  }

  .conversion-data-table__body {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
  }

  .conversion-data-table__table-wrap {
    flex: 1;
    min-height: 0;
    padding: 0 10px;
  }

  .conversion-data-table__footer {
    padding: 10px 14px;
    background: color-mix(in srgb, rgb(8 10 16) 94%, rgb(16 185 129 / 4%));
    border-top: 1px solid color-mix(in srgb, var(--art-success) 18%, var(--default-border));
  }

  .conversion-data-table__footer-grid {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(130px, 1fr) 140px 110px 120px 80px 110px;
    gap: 0;
    align-items: center;
  }

  .conversion-data-table__footer-total {
    margin-right: 10px;
    letter-spacing: 0.5px;
  }

  .conversion-data-table__footer-sub {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }

  .conversion-data-table__footer-cell {
    display: flex;
    align-items: center;
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--el-text-color-primary);
  }

  .conversion-data-table__footer-cell.is-left {
    justify-content: flex-start;
  }

  .conversion-data-table__footer-cell.is-num {
    justify-content: flex-end;
  }

  .conversion-data-table__footer-cell.is-muted {
    justify-content: center;
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }

  .conversion-data-table__pagination {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px 12px;
    background: transparent;
  }

  .conversion-data-table__pagination-left {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  /* 分页按钮绿色主题 */
  :deep(.conversion-data-table__pagination .el-pagination) {
    --el-pagination-hover-color: var(--el-color-success);
    --el-pagination-button-color: var(--el-text-color-regular);
    --el-pagination-button-bg-color: transparent;
    --el-pagination-bg-color: transparent;
    --el-pagination-border-radius: 9999px;
  }

  :deep(.conversion-data-table__pagination .el-pagination .btn-prev),
  :deep(.conversion-data-table__pagination .el-pagination .btn-next) {
    color: var(--el-color-success);
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--el-color-success) 55%, transparent);
    border-radius: 9999px;
  }

  :deep(.conversion-data-table__pagination .el-pagination .el-pager li) {
    border-radius: 9999px;
  }

  :deep(.conversion-data-table__pagination .el-pagination .el-pager li.is-active) {
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, rgb(16 185 129 / 88%), rgb(5 150 105 / 82%));
    box-shadow: 0 0 14px rgb(16 185 129 / 35%);
  }

  :deep(
    .conversion-data-table__pagination .el-pagination .el-select .el-input__wrapper.is-focused
  ) {
    box-shadow: 0 0 0 1px var(--art-success) inset !important;
  }

  .conversion-data-table__art {
    :deep(.el-table) {
      --el-table-border-color: color-mix(in srgb, var(--default-border) 90%, rgb(16 185 129 / 12%));
      --el-table-row-hover-bg-color: color-mix(
        in srgb,
        var(--default-box-color) 88%,
        rgb(34 211 238 / 5%)
      );

      background: transparent;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.el-table__body tr:hover > td) {
      background-color: color-mix(
        in srgb,
        var(--default-box-color) 82%,
        rgb(34 211 238 / 6%)
      ) !important;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--art-success) 10%, transparent);
    }

    :deep(.el-table td) {
      border-color: color-mix(in srgb, var(--default-border) 92%, transparent);
    }
  }

  /* 树表父级左侧彩色标识条 + 左圆角 */
  :deep(.el-table__row.is-level-group td:first-child .cell),
  :deep(.el-table__row.is-level-account td:first-child .cell) {
    position: relative;
    padding-left: 14px;
  }

  :deep(.el-table__row.is-level-group td:first-child .cell::before),
  :deep(.el-table__row.is-level-account td:first-child .cell::before) {
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 6px;
    width: 4px;
    content: '';
    background: var(--row-accent);
    border-radius: 9999px;
  }

  :deep(.el-table__row.is-level-group) {
    background: color-mix(in srgb, var(--default-box-color) 86%, var(--row-accent) 14%);
  }

  :deep(.el-table__row.is-level-account) {
    background: color-mix(in srgb, var(--default-box-color) 92%, var(--row-accent) 8%);
  }

  /* 展开/收起图标：收起=箭头指向文字(>), 展开=向下 */
  :deep(.el-table__body td:first-child .cell) {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  :deep(.el-table__expand-icon) {
    display: inline-flex;
    flex: 0 0 16px;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: transparent; /* 隐藏默认图标颜色 */
  }

  :deep(.el-table__expand-icon .el-icon),
  :deep(.el-table__expand-icon i) {
    display: none !important;
  }

  /* 默认（收起）：右箭头(>)，指向文字 */
  :deep(.el-table__expand-icon::before) {
    display: inline-block;
    width: 7px;
    height: 7px;
    content: '';
    border-top: 2px solid var(--el-text-color-secondary);
    border-right: 2px solid var(--el-text-color-secondary);
    transform: rotate(45deg);
  }

  /* 展开：向下三角（兼容不同展开态 class/aria，强制覆盖） */
  :deep(.el-table__expand-icon--expanded::before),
  :deep(.el-table__expand-icon.is-expanded::before),
  :deep(.el-table__expand-icon[aria-expanded='true']::before) {
    width: 0 !important;
    height: 0 !important;
    border: none !important;
    border-top: 7px solid var(--el-text-color-secondary) !important;
    border-right: 6px solid transparent !important;
    border-left: 6px solid transparent !important;
    transform: translateY(-6px) rotate(-90deg) !important;
  }

  :deep(.conversion-data-table__type-tag.el-tag) {
    border: none;
  }

  :deep(.conversion-data-table__dim) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  :deep(.conversion-data-table__dim-main) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.conversion-data-table__dim-sub) {
    font-size: 11px;
    color: var(--el-text-color-secondary);

    &.is-empty {
      height: 14px;
    }
  }

  :deep(.conversion-data-table__dim.is-group .conversion-data-table__dim-main) {
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  :deep(.conversion-data-table__dim.is-account .conversion-data-table__dim-main) {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.conversion-data-table__dim.is-conversion .conversion-data-table__dim-main) {
    color: var(--el-text-color-primary);
  }

  :deep(.conversion-data-table__app) {
    color: var(--el-color-success);
  }

  :deep(.conversion-data-table__muted) {
    color: var(--el-text-color-secondary);
  }

  :deep(.conversion-data-table__num) {
    font-variant-numeric: tabular-nums;
  }

  :deep(.conversion-data-table__spark) {
    display: block;
  }
</style>
