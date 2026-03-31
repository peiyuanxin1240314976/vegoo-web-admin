<template>
  <ElCard class="map-detail-revenue-panel" shadow="never">
    <template #header>
      <span>变现分析</span>
    </template>

    <!-- A: 收入构成 -->
    <div class="revenue-composition">
      <div class="composition-bar-wrap">
        <div class="panel-header section-header">
          <span class="section-badge">A</span>
          <span class="section-title">收入构成</span>
        </div>
        <div class="composition-labels">
          <template v-for="(s, i) in compositionData" :key="'label-' + i">
            <ElTooltip
              v-if="s.percent < 10"
              :content="`${s.label} ${s.value} (${s.percent}%)`"
              placement="top"
              :show-after="0"
            >
              <div
                class="composition-label composition-label--hidden"
                :style="{ width: s.percent + '%', minWidth: '28px', color: s.color }"
              >
                {{ s.label }}
              </div>
            </ElTooltip>
            <div
              v-else
              class="composition-label"
              :style="{ width: s.percent + '%', color: s.color }"
            >
              {{ s.label }}
            </div>
          </template>
        </div>
        <div class="composition-values">
          <template v-for="(s, i) in compositionData" :key="'value-' + i">
            <ElTooltip
              v-if="s.percent < 10"
              :content="`${s.label} ${s.value} (${s.percent}%)`"
              placement="top"
              :show-after="0"
            >
              <div
                class="composition-value composition-value--hidden"
                :style="{ width: s.percent + '%', minWidth: '28px', color: s.color }"
              >
                {{ s.value }} ({{ s.percent }}%)
              </div>
            </ElTooltip>
            <div
              v-else
              class="composition-value"
              :style="{ width: s.percent + '%', color: s.color }"
            >
              {{ s.value }} ({{ s.percent }}%)
            </div>
          </template>
        </div>
        <div class="composition-bar">
          <template v-for="(s, i) in compositionData" :key="'segment-' + i">
            <ElTooltip
              v-if="s.percent < 10"
              :content="`${s.label} ${s.value} (${s.percent}%)`"
              placement="top"
              :show-after="0"
            >
              <div
                class="composition-segment"
                :style="{
                  width: s.percent + '%',
                  minWidth: '8px',
                  backgroundColor: s.color,
                  '--segment-color': s.color,
                  animationDelay: i * 0.08 + 's'
                }"
              />
            </ElTooltip>
            <div
              v-else
              class="composition-segment"
              :style="{
                width: s.percent + '%',
                backgroundColor: s.color,
                '--segment-color': s.color,
                animationDelay: i * 0.08 + 's'
              }"
            />
          </template>
        </div>
      </div>

      <!-- 三指标卡片 -->
      <div class="revenue-metrics">
        <div class="rm-card rm-card--ecpm">
          <span class="rm-icon">📡</span>
          <div class="rm-body">
            <span class="rm-label">eCPM</span>
            <div class="rm-value-row">
              <span class="rm-value tabular-nums">{{ metrics.ecpm }}</span>
              <span :class="ecpmTrendClass" class="rm-trend">{{ metrics.ecpmTrend }}</span>
            </div>
          </div>
        </div>
        <div class="rm-card rm-card--fill">
          <span class="rm-icon">📶</span>
          <div class="rm-body">
            <span class="rm-label">广告充展率</span>
            <span class="rm-value tabular-nums">{{ metrics.fillRate }}</span>
          </div>
        </div>
        <div class="rm-card rm-card--arpu">
          <span class="rm-icon">💰</span>
          <div class="rm-body">
            <span class="rm-label">ARPU</span>
            <span class="rm-value tabular-nums">{{ metrics.arpu }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- B: 各 App 表现 -->
    <div class="app-performance-block">
      <div class="panel-header section-header">
        <span class="section-badge">B</span>
        <span class="section-title">各 App 在{{ regionLabel }}表现</span>
      </div>
      <ElSkeleton v-if="appLoading" :rows="6" animated class="table-skeleton" />
      <ArtTable v-else :data="appTableData" :columns="appColumns" size="small" height="260" />
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'

  defineOptions({ name: 'MapDetailRevenuePanel' })

  export interface RevenueCompositionItem {
    label: string
    value: string
    percent: number
    color: string
  }

  /** 各 App 在区域表现（/api/v1/datacenter/analysis/countryInfo/appLaunch） */
  export interface AppPerformanceRow {
    app: string
    arpu: number
    dAdRevenue: number
    dIapRevenue: number
    remainDay1: number
  }

  const props = withDefaults(
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

  const ecpmTrendClass = computed(() => {
    const t = props.metrics?.ecpmTrend ?? ''
    if (!t || t === '—') return 'revenue-metric-trend--flat'
    if (t.startsWith('↑') || /^\+/.test(t)) return 'revenue-metric-trend--up'
    if (t.startsWith('↓') || (t.includes('-') && t !== '—')) return 'revenue-metric-trend--down'
    return 'revenue-metric-trend--flat'
  })

  function fmtMoneyK(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
    if (n >= 100) return `$${n.toFixed(0)}`
    return `$${n.toFixed(2)}`
  }

  const appColumns: ColumnOption<AppPerformanceRow>[] = [
    { prop: 'app', label: 'App 名称', minWidth: 120 },
    {
      prop: 'arpu',
      label: 'ARPU',
      minWidth: 80,
      align: 'left',
      formatter: (row: AppPerformanceRow) => `$${Number(row.arpu ?? 0).toFixed(2)}`
    },
    {
      prop: 'dAdRevenue',
      label: '广告收入',
      minWidth: 86,
      align: 'left',
      formatter: (row: AppPerformanceRow) => fmtMoneyK(row.dAdRevenue)
    },
    {
      prop: 'dIapRevenue',
      label: '内购收入',
      minWidth: 86,
      align: 'left',
      formatter: (row: AppPerformanceRow) => fmtMoneyK(row.dIapRevenue)
    },
    {
      prop: 'remainDay1',
      label: '次留数据',
      width: 82,
      align: 'left',
      formatter: (row: AppPerformanceRow) => {
        const v = Number(row.remainDay1 ?? 0)
        const pct = v <= 1 && v >= 0 ? v * 100 : v
        return `${pct.toFixed(1)}%`
      }
    }
  ]
</script>

<style scoped lang="scss">
  .map-detail-revenue-panel {
    :deep(.el-card__header) {
      font-weight: 500;
    }

    /* ── 深色主题表格覆盖 ── */
    :deep(.el-table) {
      --el-table-bg-color: transparent;
      --el-table-tr-bg-color: transparent;
      --el-table-row-hover-bg-color: rgb(255 255 255 / 5%);
      --el-table-header-bg-color: rgb(255 255 255 / 4%);

      background: transparent;

      &::before {
        display: none;
      }

      th.el-table__cell {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
        background-color: rgb(255 255 255 / 4%);
        border-bottom: 1px solid var(--default-border, rgb(255 255 255 / 10%));
      }

      td.el-table__cell {
        font-size: 13px;
        color: var(--text-primary);
        border-bottom: 1px solid var(--default-border, rgb(255 255 255 / 6%));
      }

      .el-table__body tr:last-child td.el-table__cell {
        border-bottom: none;
      }
    }
  }

  .revenue-composition {
    margin-bottom: 16px;
  }

  .composition-bar-wrap {
    width: 100%;
    margin-bottom: 14px;
  }

  .composition-labels,
  .composition-bar,
  .composition-values {
    display: flex;
    width: 100%;
  }

  .composition-labels {
    margin-bottom: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .composition-label {
    flex-shrink: 0;
    min-width: 0;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;

    &.composition-label--hidden {
      min-width: 28px;
      cursor: help;
      visibility: hidden;
      user-select: none;
    }
  }

  .composition-bar {
    height: 32px;
    overflow: visible;
    border-radius: 6px;
  }

  .composition-segment {
    flex-shrink: 0;
    height: 100%;
    transition:
      box-shadow 0.25s ease,
      transform 0.25s ease;
    transform-origin: left center;
    animation: segment-slide-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;

    &:not(:first-child) {
      border-left: 1px solid rgb(255 255 255 / 20%);
    }

    &:hover {
      box-shadow:
        0 -2px 0 0 var(--segment-color),
        0 2px 0 0 var(--segment-color);
      transform: scaleX(1) scaleY(1.12);
      transform-origin: center center;
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
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .composition-value {
    flex-shrink: 0;
    min-width: 0;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;

    &.composition-value--hidden {
      min-width: 28px;
      cursor: help;
      visibility: hidden;
      user-select: none;
    }
  }

  /* ── 三指标卡片 ── */
  .revenue-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 12px;
  }

  .rm-card {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-left: 3px solid transparent;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: rgb(255 255 255 / 6%);
    }

    &--ecpm {
      background: linear-gradient(135deg, rgb(59 130 246 / 8%), rgb(59 130 246 / 2%));
      border-left-color: #3b82f6;
    }

    &--fill {
      background: linear-gradient(135deg, rgb(16 185 129 / 8%), rgb(16 185 129 / 2%));
      border-left-color: #10b981;
    }

    &--arpu {
      background: linear-gradient(135deg, rgb(245 158 11 / 8%), rgb(245 158 11 / 2%));
      border-left-color: #f59e0b;
    }
  }

  .rm-icon {
    flex-shrink: 0;
    font-size: 18px;
    line-height: 1;
    filter: saturate(0.9);
  }

  .rm-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .rm-label {
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .rm-value-row {
    display: flex;
    gap: 5px;
    align-items: baseline;
  }

  .rm-value {
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .rm-trend {
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;

    &.revenue-metric-trend--up {
      color: var(--art-success, #10b981);
    }

    &.revenue-metric-trend--down {
      color: var(--art-danger, #ef4444);
    }

    &.revenue-metric-trend--flat {
      color: var(--text-secondary);
    }
  }

  .section-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .section-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    background: linear-gradient(135deg, #29b6f6 0%, #039be5 100%);
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgb(41 182 246 / 25%);
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .app-performance-block {
    .table-skeleton {
      height: 260px;
      padding: 8px 0;
    }
  }
</style>
