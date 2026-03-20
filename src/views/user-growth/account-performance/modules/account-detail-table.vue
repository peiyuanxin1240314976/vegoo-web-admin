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
        <ElTableColumn label="应用 / 平台 / 账户" min-width="200">
          <template #default="{ row }">
            <span class="ap-cell-name">
              <ElIcon v-if="row.type === 'app'" class="ap-row-icon ap-row-icon--app">
                <Monitor />
              </ElIcon>
              <ElIcon v-else-if="row.type === 'platform'" class="ap-row-icon ap-row-icon--platform">
                <Iphone />
              </ElIcon>
              <span
                :class="row.type === 'account' ? 'ap-cell-account' : ''"
                :style="getNameStyle(row)"
              >
                {{ row.name }}
              </span>
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="广告支出" width="100" align="center">
          <template #default="{ row }">{{ formatMoney(row.spend) }}</template>
        </ElTableColumn>

        <ElTableColumn label="预算" width="90" align="center">
          <template #default="{ row }">{{ formatMoney(row.budget) }}</template>
        </ElTableColumn>

        <ElTableColumn label="使用率" width="115" align="center">
          <template #default="{ row }">
            <div class="ap-usage-cell">
              <ElProgress
                :percentage="Math.min(100, row.usageRate)"
                :color="getUsageRateColor(row.usageRate)"
                :show-text="false"
                :stroke-width="6"
                class="ap-usage-bar"
              />
              <span class="ap-usage-value">{{ row.usageRate }}%</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="CPI" width="70" align="center">
          <template #default="{ row }">{{ row.cpi.toFixed(2) }}</template>
        </ElTableColumn>

        <ElTableColumn label="安装数" width="95" align="center">
          <template #default="{ row }">{{ formatNumber(row.installs) }}</template>
        </ElTableColumn>

        <ElTableColumn label="首日ROI" width="90" align="center">
          <template #default="{ row }">
            <span :class="getRoiClass(row.roi1)">{{ row.roi1 }}%</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="3日ROI" width="80" align="center">
          <template #default="{ row }">
            <span :class="getRoiClass(row.roi3)">{{ row.roi3 }}%</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="7日ROI" width="80" align="center">
          <template #default="{ row }">
            <span :class="getRoiClass(row.roi7)">{{ row.roi7 }}%</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 'normal'" class="ap-status ap-status--normal">正常</span>
            <span v-else class="ap-status ap-status--warning">{{
              row.statusText || 'ROI偏低'
            }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row.type === 'account'">
              <ElButton link type="primary" size="small">系列</ElButton>
              <ElButton link type="primary" size="small">详情</ElButton>
            </template>
            <template v-else-if="row.type === 'platform'">
              <ElButton link type="primary" size="small">系列</ElButton>
              <ElButton link type="primary" size="small">详情</ElButton>
            </template>
            <template v-else>
              <ElButton link type="primary" size="small">详情</ElButton>
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

  defineOptions({ name: 'AccountDetailTable' })

  defineProps<{
    tableData: AccountDetailRow[]
    expandedRowKeys: string[]
    summaryText: string
    // Element Plus style 回调签名在不同版本里参数类型略有差异
    // 这里用 `any` 放宽，以避免父组件严格类型无法赋值。
    getRowStyle: (arg: any) => any
    getCellStyle: (arg: any) => any
    getNameStyle: (row: any) => any
    formatMoney: (n: number) => string
    formatNumber: (n: number) => string
    getRoiClass: (roi: number) => string
    getUsageRateColor: (rate: number) => string
  }>()
</script>

<style scoped lang="scss">
  .ap-table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    :deep(.el-table) {
      min-width: 960px;
    }
  }

  .ap-detail-table {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);
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
    display: inline-flex;
    gap: 6px;
    align-items: center;
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
