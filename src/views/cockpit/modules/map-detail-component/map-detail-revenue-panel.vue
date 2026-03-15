<template>
  <ElCard class="map-detail-revenue-panel" shadow="never">
    <template #header>
      <span>变现分析</span>
    </template>

    <!-- A: 收入构成 - 固定宽高横向色块，上 label 下数值(占比)，无 echarts -->
    <div class="revenue-composition">
      <div class="composition-bar-wrap">
        <div class="panel-header section-header">
          <span class="section-badge">A</span>
          <span class="section-title">收入构成</span>
        </div>
        <div class="composition-labels">
          <div
            v-for="(s, i) in compositionData"
            :key="i"
            class="composition-label"
            :style="{ width: s.percent + '%' }"
          >
            {{ s.label }}
          </div>
        </div>
        <div class="composition-bar">
          <div
            v-for="(s, i) in compositionData"
            :key="i"
            class="composition-segment"
            :style="{
              width: s.percent + '%',
              backgroundColor: s.color,
              animationDelay: i * 0.08 + 's'
            }"
          />
        </div>
        <div class="composition-values">
          <div
            v-for="(s, i) in compositionData"
            :key="i"
            class="composition-value"
            :style="{ width: s.percent + '%' }"
          >
            {{ s.value }} ({{ s.percent }}%)
          </div>
        </div>
      </div>
      <div class="revenue-metrics">
        <span>eCPM: {{ metrics.ecpm }} {{ metrics.ecpmTrend }}</span>
        <span>广告充展率: {{ metrics.fillRate }}</span>
        <span>ARPU: {{ metrics.arpu }}</span>
      </div>
    </div>

    <!-- B: 各 App 表现 - art-table -->
    <div class="app-performance-block">
      <div class="panel-header section-header">
        <span class="section-badge">B</span>
        <span class="section-title">各 App 在{{ regionLabel }}表现</span>
      </div>
      <ElSkeleton v-if="appLoading" :rows="6" animated class="table-skeleton" />
      <ArtTable v-else :data="appTableData" :columns="appColumns" size="small" height="220" />
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'

  defineOptions({ name: 'MapDetailRevenuePanel' })

  export interface RevenueCompositionItem {
    label: string
    value: string
    percent: number
    color: string
  }

  /** 各 App 在区域表现（与 top5Campaign 接口一致：消耗、安装量、ROI） */
  export interface AppPerformanceRow {
    appName: string
    amount: number
    count: number
    roi: number
  }

  withDefaults(
    defineProps<{
      metrics?: { ecpm: string; ecpmTrend: string; fillRate: string; arpu: string }
      compositionData?: RevenueCompositionItem[]
      appTableData?: AppPerformanceRow[]
      regionLabel?: string
      appLoading?: boolean
    }>(),
    {
      metrics: () => ({ ecpm: '$8.20', ecpmTrend: '↑+3%', fillRate: '94%', arpu: '$22.8' }),
      compositionData: () => [
        { label: '广告收入', value: '$780K', percent: 76, color: '#3984F1' },
        { label: '内购收入', value: '$250K', percent: 24, color: '#f59e0b' }
      ],
      appTableData: () => [],
      regionLabel: '美国',
      appLoading: false
    }
  )

  function fmtMoneyK(n: number) {
    return `$${(n / 1000).toFixed(0)}K`
  }

  const appColumns: ColumnOption<AppPerformanceRow>[] = [
    { prop: 'appName', label: 'App名称', minWidth: 120 },
    {
      prop: 'amount',
      label: '消耗',
      minWidth: 90,
      align: 'right',
      formatter: (row: AppPerformanceRow) => fmtMoneyK(row.amount)
    },
    {
      prop: 'count',
      label: '安装量',
      minWidth: 80,
      align: 'right',
      formatter: (row: AppPerformanceRow) => row.count?.toLocaleString()
    },
    { prop: 'roi', label: 'ROI', width: 80, align: 'right' }
  ]
</script>

<style scoped lang="scss">
  .map-detail-revenue-panel {
    :deep(.el-card__header) {
      font-weight: 500;
    }
  }

  .revenue-composition {
    min-height: 190px;
    margin-bottom: 16px;
  }

  .composition-bar-wrap {
    width: 100%;
    margin-bottom: 12px;
  }

  .composition-labels,
  .composition-bar,
  .composition-values {
    display: flex;
    width: 100%;
  }

  .composition-labels {
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .composition-label {
    flex-shrink: 0;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .composition-bar {
    height: 32px;
    overflow: hidden;
    border-radius: 6px;
  }

  .composition-segment {
    flex-shrink: 0;
    height: 100%;
    transform-origin: left;
    animation: segment-slide-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;

    &:not(:first-child) {
      border-left: 1px solid rgba(255 255 255 / 20%);
    }
  }

  @keyframes segment-slide-in {
    from {
      opacity: 0.7;
      transform: scaleX(0);
    }

    to {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  .composition-values {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .composition-value {
    flex-shrink: 0;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .revenue-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: space-between;
    font-size: 13px;
    color: var(--el-text-color-regular);

    span {
      width: 30%;
      padding: 5px 0;
      text-align: center;
      background-color: var(--el-fill-color-light);
      border-radius: 6px;
    }
  }

  .section-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    background: linear-gradient(135deg, #29b6f6 0%, #039be5 100%);
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgb(41 182 246 / 25%);
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .app-performance-block {
    .panel-header {
      margin-bottom: 8px;
    }

    .table-skeleton {
      height: 220px;
      padding: 8px 0;
    }
  }
</style>
