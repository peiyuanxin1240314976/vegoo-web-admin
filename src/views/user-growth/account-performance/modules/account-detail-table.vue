<!-- 我是应用页面 -->
<template>
  <div>
    <div class="ap-table-scroll">
      <ArtVirtualTable
        :columns="virtualColumns"
        :data="tableData"
        row-key="id"
        expand-column-key="name"
        :expanded-row-keys="expandedRowKeys"
        @update:expanded-row-keys="onExpandedKeysUpdate"
        :row-style="rowStyleAdapter"
        class="ap-detail-table"
        :height-offset="520"
        :min-height="480"
      >
        <template #cell:name="{ row }">
          <span class="ap-cell-name">
            <span v-if="row.type === 'app'" class="ap-app-logo" :style="getAppLogoStyle(row.name)">
              {{ getAppInitial(row.name) }}
            </span>
            <ElIcon v-else-if="row.type === 'platform'" class="ap-row-icon ap-row-icon--platform">
              <Iphone />
            </ElIcon>
            <span
              class="ap-name-text"
              :class="row.type === 'account' ? 'ap-cell-account' : ''"
              :style="getNameStyle(row)"
            >
              {{ row.name }}
            </span>
          </span>
        </template>

        <template #cell:spend="{ row }">{{ formatMoney(row.spend) }}</template>
        <template #cell:budget="{ row }">{{ formatMoney(row.budget) }}</template>

        <template #cell:usageRate="{ row }">
          <div class="ap-usage-cell">
            <ElProgress
              v-if="hasFiniteNumber(row.usageRate)"
              :percentage="Math.min(100, round2Number(row.usageRate) ?? 0)"
              :color="getUsageRateColor(round2Number(row.usageRate) ?? 0)"
              :show-text="false"
              :stroke-width="6"
              class="ap-usage-bar"
            />
            <span class="ap-usage-value">{{ formatPercentFixed2OrEmpty(row.usageRate) }}</span>
          </div>
        </template>

        <template #cell:cpi="{ row }">{{ formatFixed2OrEmpty(row.cpi) }}</template>
        <template #cell:installs="{ row }">{{ formatNumber(row.installs) }}</template>

        <template #cell:roi1="{ row }">
          <span v-if="hasFiniteNumber(row.roi1)" :class="getRoiClass(round2Number(row.roi1) ?? 0)">
            {{ formatPercentFixed2OrEmpty(row.roi1) }}
          </span>
          <span v-else>无数据</span>
        </template>

        <template #cell:roi3="{ row }">
          <span v-if="hasFiniteNumber(row.roi3)" :class="getRoiClass(round2Number(row.roi3) ?? 0)">
            {{ formatPercentFixed2OrEmpty(row.roi3) }}
          </span>
          <span v-else>无数据</span>
        </template>

        <template #cell:roi7="{ row }">
          <span v-if="hasFiniteNumber(row.roi7)" :class="getRoiClass(round2Number(row.roi7) ?? 0)">
            {{ formatPercentFixed2OrEmpty(row.roi7) }}
          </span>
          <span v-else>无数据</span>
        </template>

        <template #cell:status="{ row }">
          <span v-if="row.status === 'normal'" class="ap-status ap-status--normal">正常</span>
          <span v-else-if="row.status === 'warning'" class="ap-status ap-status--warning"
            >注意</span
          >
          <span v-else-if="row.status === 'roi_low'" class="ap-status ap-status--warning">
            {{ row.statusText || 'ROI偏低' }}
          </span>
          <span v-else>无数据</span>
        </template>

        <template #cell:operation="{ row }">
          <template v-if="row.type === 'account'">
            <ElButton round link type="primary" size="small" @click="goCampaignDetail(row)">
              系列
            </ElButton>
          </template>
          <template v-else-if="row.type === 'app'">
            <ElButton round link type="primary" size="small" @click="goCampaignDetailFromApp(row)">
              详情
            </ElButton>
            <ElButton
              v-if="rowHasChildren(row)"
              round
              link
              type="primary"
              size="small"
              @click="onToggleExpand(row)"
            >
              {{ isRowExpanded(row) ? '收起' : '展开' }}
            </ElButton>
          </template>
          <template v-else>
            <ElButton
              v-if="rowHasChildren(row)"
              round
              link
              type="primary"
              size="small"
              @click="onToggleExpand(row)"
            >
              {{ isRowExpanded(row) ? '收起' : '展开' }}
            </ElButton>
          </template>
        </template>
      </ArtVirtualTable>
    </div>

    <div class="ap-table-footer">{{ summaryText }}</div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AccountDetailRow } from '../types'
  import { Iphone } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Vetur 对 <script setup> 的误报：.vue 无 default export
  import ArtVirtualTable from '@/components/core/art-virtual-table/index.vue'
  import type { ArtVirtualTableColumn } from '@/components/core/art-virtual-table/index.vue'

  defineOptions({ name: 'AccountDetailTable' })

  const router = useRouter()

  const props = defineProps<{
    tableData: AccountDetailRow[]
    expandedRowKeys: string[]
    summaryText: string
    // Element Plus style 回调签名在不同版本里参数类型略有差异
    // 这里用 `any` 放宽，以避免父组件严格类型无法赋值。
    getRowStyle: (arg: any) => any
    getCellStyle: (arg: any) => any
    getNameStyle: (row: any) => any
    formatMoney: (n: number | null | undefined) => string
    formatNumber: (n: number | null | undefined) => string
    getRoiClass: (roi: number) => string
    getUsageRateColor: (rate: number) => string
  }>()

  const emit = defineEmits<{
    toggleExpand: [row: AccountDetailRow]
  }>()

  const virtualColumns = computed<ArtVirtualTableColumn[]>(() => [
    { key: 'name', title: '应用 / 平台 / 账户', width: 320, flexGrow: 1 },
    { key: 'spend', title: '广告支出', width: 120, align: 'left' },
    { key: 'budget', title: '预算', width: 120, align: 'center' },
    { key: 'usageRate', title: '使用率', width: 160, align: 'center' },
    { key: 'cpi', title: 'CPI', width: 90, align: 'center' },
    { key: 'installs', title: '买量用户', width: 120, align: 'center' },
    { key: 'roi1', title: '首日ROI', width: 110, align: 'center' },
    { key: 'roi3', title: '3日ROI', width: 100, align: 'center' },
    { key: 'roi7', title: '7日ROI', width: 100, align: 'center' },
    { key: 'status', title: '状态', width: 120, align: 'center' },
    { key: 'operation', title: '操作', width: 140, align: 'center' }
  ])

  function onExpandedKeysUpdate(keys: Array<string | number>) {
    const prev = new Set((props.expandedRowKeys ?? []).map((k) => String(k)))
    const next = new Set(keys.map((k) => String(k)))

    const changed: string[] = []
    for (const k of next) if (!prev.has(k)) changed.push(k)
    for (const k of prev) if (!next.has(k)) changed.push(k)

    for (const id of changed) {
      const row = findRowById(props.tableData ?? [], id)
      if (row) emit('toggleExpand', row)
    }
  }

  function rowStyleAdapter(params: { rowData: AccountDetailRow; rowIndex: number }) {
    return props.getRowStyle({ row: params.rowData, rowIndex: params.rowIndex })
  }

  function findRowById(rows: AccountDetailRow[], id: string): AccountDetailRow | null {
    for (const r of rows) {
      if (String(r.id) === id) return r
      const child = r.children?.length ? findRowById(r.children as AccountDetailRow[], id) : null
      if (child) return child
    }
    return null
  }

  function rowHasChildren(row: AccountDetailRow) {
    return Boolean(row.children?.length)
  }

  function isRowExpanded(row: AccountDetailRow) {
    return props.expandedRowKeys.includes(String(row.id))
  }

  function onToggleExpand(row: AccountDetailRow) {
    if (!rowHasChildren(row)) return
    emit('toggleExpand', row)
  }

  /** 系列详情：与广告成效系列页 query 约定一致（appId / appName） */
  function goCampaignDetail(row: AccountDetailRow) {
    router.push({
      name: 'CampaignDetail',
      query: {
        id: String(row.id),
        appId: String(row.id),
        appName: row.name
      }
    })
  }

  function goCampaignDetailFromApp(row: AccountDetailRow) {
    router.push({
      name: 'CampaignDetail',
      query: {
        // CampaignDetail 页面读取 route.query.id 作为 campaignId
        id: String(row.id ?? ''),
        appId: String(row.id ?? ''),
        appName: String(row.name ?? '')
      }
    })
  }

  const EMPTY_TEXT = '无数据'

  function toFiniteNumber(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }

  function round2Number(v: unknown): number | null {
    const n = toFiniteNumber(v)
    return n === null ? null : Number(n.toFixed(2))
  }

  function hasFiniteNumber(v: unknown): boolean {
    return toFiniteNumber(v) !== null
  }

  function formatFixed2OrEmpty(v: unknown): string {
    const n = toFiniteNumber(v)
    return n === null ? EMPTY_TEXT : n.toFixed(2)
  }

  function formatPercentFixed2OrEmpty(v: unknown): string {
    const n = toFiniteNumber(v)
    return n === null ? EMPTY_TEXT : `${n.toFixed(2)}%`
  }

  function getAppInitial(name?: string) {
    const text = String(name ?? '').trim()
    if (!text) return 'A'
    const match = text.match(/[A-Za-z0-9]/)
    return (match?.[0] ?? text[0] ?? 'A').toUpperCase()
  }

  function getAppLogoStyle(name?: string) {
    const palettes = [
      { bg: 'linear-gradient(180deg, #4d8dff 0%, #2f6fe4 100%)', border: 'rgb(143 188 255 / 38%)' },
      { bg: 'linear-gradient(180deg, #5b8cff 0%, #3565d6 100%)', border: 'rgb(157 190 255 / 38%)' },
      { bg: 'linear-gradient(180deg, #77839a 0%, #5f6b82 100%)', border: 'rgb(203 213 225 / 24%)' },
      { bg: 'linear-gradient(180deg, #8792a8 0%, #6c778d 100%)', border: 'rgb(203 213 225 / 24%)' }
    ]

    const text = String(name ?? '').trim()
    const hash = Array.from(text).reduce((total, char) => total + char.charCodeAt(0), 0)
    const palette = palettes[hash % palettes.length]

    return {
      '--app-logo-bg': palette.bg,
      '--app-logo-border': palette.border
    }
  }
</script>

<style scoped lang="scss">
  .ap-table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    :deep(.el-table) {
      /* 与列宽合计大致一致，避免首列被压成仅显示省略号 */
      min-width: 1120px;
    }
  }

  .ap-detail-table {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);

    /* 树形列：缩进 / 占位 / 展开图标与自定义内容同一行，避免 width:100% 把内容挤到第二行 */
    :deep(.el-table__header th:first-child .cell),
    :deep(.el-table__body td:first-child .cell) {
      display: flex;
      flex-wrap: nowrap;
      gap: 4px;
      align-items: center;
    }

    :deep(.el-table__body td:first-child .el-table__expand-icon) {
      flex-shrink: 0;
    }
  }

  html.dark .ap-detail-table {
    --el-table-border-color: var(--el-border-color);
    --el-table-header-bg-color: var(--el-fill-color-dark);
    --el-table-header-text-color: #fff;

    :deep(.el-table__header-wrapper th),
    :deep(.el-table__header-wrapper th .cell),
    :deep(.el-table__header-wrapper th .sort-caret) {
      color: #fff;
    }
  }

  .ap-cell-name {
    box-sizing: border-box;
    display: flex;
    flex: 1 1 0;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  /* flex 子项默认 min-width:auto，不设 0 时无法收缩，tooltip 会几乎整格都是 … */
  .ap-name-text {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ap-row-icon {
    flex-shrink: 0;
    font-size: 16px;
    color: var(--el-text-color-secondary);

    &.ap-row-icon--app {
      color: var(--el-color-primary);
    }

    &.ap-row-icon--platform {
      color: var(--el-text-color-regular);
    }
  }

  .ap-app-logo {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    overflow: hidden;
    font-size: 18px;
    font-weight: 800;
    line-height: 1;
    color: #fff;
    background: var(--app-logo-bg);
    border: 1px solid var(--app-logo-border);
    border-radius: 9px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 12%),
      0 4px 10px rgb(15 23 42 / 18%);
  }

  .ap-cell-account {
    font-family: ui-monospace, monospace;
    font-size: 12px;
  }

  .ap-usage-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }

  .ap-usage-value {
    flex-shrink: 0;
    font-size: 13px;
  }

  .ap-usage-bar {
    flex-shrink: 0;
    width: 48px;

    :deep(.el-progress-bar) {
      width: 100%;
    }
  }

  .ap-status {
    display: inline-flex;
    align-items: center;
    font-size: 12px;

    &--normal {
      color: var(--el-color-success);

      &::before {
        margin-right: 4px;
        font-size: 10px;
        content: '●';
      }
    }

    &--warning {
      color: var(--el-color-warning);

      &::before {
        margin-right: 4px;
        font-size: 10px;
        content: '▲';
      }
    }
  }

  .ap-roi-green {
    color: var(--el-color-success);
  }

  .ap-roi-red {
    color: var(--el-color-danger);
  }

  .ap-table-footer {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
