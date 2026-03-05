<template>
  <ElCard class="app-health-panel" shadow="never">
    <template #header>
      <span>用户留存热力图</span>
    </template>
    <div class="retention-table-wrap">
      <table class="retention-table">
        <thead>
          <tr>
            <th></th>
            <th>D1 留存</th>
            <th>D3 留存</th>
            <th>D7 留存</th>
            <th>D714 留存</th>
            <th>D30 留存</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in retentionList" :key="row.week">
            <td class="retention-week">{{ row.week }}</td>
            <td v-for="(key, ci) in retentionKeys" :key="key" :class="cellClass(row, key, ri, ci)">
              {{ formatCell(row[key], key) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AppHealthRetentionRow } from '../types'
  import { MOCK_APP_HEALTH } from '../mock/data'

  defineOptions({ name: 'AppHealthRetentionHeatmap' })

  const props = withDefaults(defineProps<{ data?: AppHealthRetentionRow[] }>(), {
    data: () => []
  })

  const retentionList = computed(() =>
    props.data?.length ? props.data : MOCK_APP_HEALTH.retention
  )

  const retentionKeys = computed(() => ['d1', 'd3', 'd7', 'd714', 'd30'] as const)

  function formatCell(val: number | string, key: string): string {
    if (key === 'd30' && typeof val === 'string' && val.startsWith('$')) return val
    if (typeof val === 'number') return val + '%'
    return String(val)
  }

  function cellClass(
    row: AppHealthRetentionRow,
    key: string,
    rowIndex: number,
    colIndex: number
  ): string {
    console.log('cellClass', row, key, rowIndex, colIndex)
    const v = row[key as keyof AppHealthRetentionRow]
    if (key === 'd30' && typeof v === 'string') return 'retention-cell retention-currency'
    const n = typeof v === 'number' ? v : 0
    if (n >= 50) return 'retention-cell retention-high'
    if (n >= 30) return 'retention-cell retention-mid'
    return 'retention-cell retention-low'
  }
</script>

<style scoped lang="scss">
  .app-health-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 320px;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      min-height: 0;
      padding: 12px;
    }
  }

  .retention-table-wrap {
    flex: 1;
    overflow: auto;
  }

  .retention-table {
    width: 100%;
    font-size: 13px;
    border-collapse: collapse;

    th,
    td {
      padding: 8px 12px;
      text-align: center;
      border: 1px solid var(--el-border-color-lighter);
    }

    th {
      font-weight: 600;
      color: var(--el-text-color-regular);
      background: var(--el-fill-color-light);
    }

    .retention-week {
      font-weight: 500;
      color: var(--el-text-color-primary);
      text-align: left;
      background: var(--el-fill-color-lighter);
    }

    .retention-cell {
      font-weight: 500;

      &.retention-high {
        color: var(--el-color-success);
        background: rgb(103 194 58 / 25%);
      }

      &.retention-mid {
        color: var(--el-color-warning);
        background: rgb(230 162 60 / 25%);
      }

      &.retention-low {
        color: var(--el-color-danger);
        background: rgb(245 108 108 / 25%);
      }

      &.retention-currency {
        color: var(--el-text-color-primary);
        background: var(--el-fill-color-lighter);
      }
    }
  }
</style>
