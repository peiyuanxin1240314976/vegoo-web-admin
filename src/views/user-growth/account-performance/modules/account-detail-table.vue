<!-- 我是应用页面 -->
<template>
  <div>
    <div class="ap-table-scroll">
      <ElTable
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :expand-row-keys="expandedRowKeys"
        :row-style="getRowStyle"
        :cell-style="getCellStyle"
        stripe
        size="default"
        class="ap-detail-table"
      >
        <ElTableColumn label="应用 / 平台 / 账户" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="ap-cell-name">
              <ElIcon v-if="row.type === 'app'" class="ap-row-icon ap-row-icon--app">
                <Monitor />
              </ElIcon>
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
        </ElTableColumn>

        <ElTableColumn label="广告支出" width="100" align="left" show-overflow-tooltip>
          <template #default="{ row }">{{ formatMoney(row.spend) }}</template>
        </ElTableColumn>

        <ElTableColumn label="预算" width="90" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ formatMoney(row.budget) }}</template>
        </ElTableColumn>

        <ElTableColumn label="使用率" width="115" align="center" show-overflow-tooltip>
          <template #default="{ row }">
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
        </ElTableColumn>

        <ElTableColumn label="CPI" width="70" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFixed2OrEmpty(row.cpi) }}</template>
        </ElTableColumn>

        <ElTableColumn label="安装数" width="95" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ formatNumber(row.installs) }}</template>
        </ElTableColumn>

        <ElTableColumn label="首日ROI" width="90" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi1)"
              :class="getRoiClass(round2Number(row.roi1) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi1) }}
            </span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="3日ROI" width="80" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi3)"
              :class="getRoiClass(round2Number(row.roi3) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi3) }}
            </span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="7日ROI" width="80" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi7)"
              :class="getRoiClass(round2Number(row.roi7) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi7) }}
            </span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="状态" width="100" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.status === 'normal'" class="ap-status ap-status--normal">正常</span>
            <span v-else-if="row.status === 'warning'" class="ap-status ap-status--warning"
              >注意</span
            >
            <span v-else-if="row.status === 'roi_low'" class="ap-status ap-status--warning">{{
              row.statusText || 'ROI偏低'
            }}</span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="80" align="center" fixed="right" show-overflow-tooltip>
          <template #default="{ row }">
            <template v-if="row.type === 'account'">
              <ElButton round link type="primary" size="small" @click="goCampaignDetail(row)">
                系列
              </ElButton>
              <!-- <ElButton link type="primary" size="small">详情</ElButton> -->
            </template>
            <template v-else-if="row.type === 'platform'">
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
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="ap-table-footer">{{ summaryText }}</div>
  </div>
</template>

<script setup lang="ts">
  import type { AccountDetailRow } from '../types'
  import { Monitor, Iphone } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'

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
