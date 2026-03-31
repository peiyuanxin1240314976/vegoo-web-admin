<template>
  <div class="ca-section-app">
    <!-- 层级筛选 tab -->
    <div class="ca-level-tabs">
      <button
        v-for="t in levelTabs"
        :key="t.key"
        type="button"
        class="ca-level-tab"
        :class="{ 'is-active': activeLevel === t.key }"
        @click="activeLevel = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 三栏布局 -->
    <div class="ca-app-grid">
      <!-- 左：应用 CPI 排行表格 + 趋势图 -->
      <div class="ca-app-left">
        <!-- 应用 CPI 排行 -->
        <ElCard class="ca-panel ca-neon-panel" shadow="never">
          <template #header>应用 CPI 排行</template>
          <ElTable
            :data="data?.appCpiRank ?? []"
            size="small"
            style="width: 100%"
            :row-class-name="rowClass"
            @row-click="onAppRankRowClick"
            class="ca-rank-table"
          >
            <ElTableColumn prop="rank" label="#" width="36" />
            <ElTableColumn prop="appName" label="应用" min-width="100">
              <template #default="{ row }">
                <span class="app-name" :class="{ 'is-highlight': row.isHighlight }">
                  {{ row.appName }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="cpi" label="CPI" width="72">
              <template #default="{ row }"> ${{ row.cpi.toFixed(2) }} </template>
            </ElTableColumn>
            <ElTableColumn prop="change" label="变化" width="72">
              <template #default="{ row }">
                <span :class="row.change >= 0 ? 'text-up' : 'text-down'">
                  {{ row.change >= 0 ? '+' : '' }}{{ row.change }}%
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>

        <!-- 应用 CPI 趋势图 -->
        <ElCard class="ca-panel ca-neon-panel" shadow="never">
          <template #header>应用 CPI 趋势分析</template>
          <div ref="appTrendRef" class="ca-chart ca-chart--app-trend"></div>
        </ElCard>
      </div>

      <!-- 右：广告平台 × 国家矩阵表 -->
      <ElCard class="ca-panel ca-neon-panel ca-panel--matrix" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>广告平台 × 国家矩阵表</span>
            <ElButton size="small" plain>导出</ElButton>
          </div>
        </template>
        <div class="matrix-scroll">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="th-platform">广告平台</th>
                <th
                  v-for="country in data?.platformCountryMatrix?.countries ?? []"
                  :key="country"
                  class="th-country"
                  colspan="2"
                >
                  {{ country }}
                </th>
              </tr>
              <tr>
                <th class="th-platform"></th>
                <template
                  v-for="country in data?.platformCountryMatrix?.countries ?? []"
                  :key="country"
                >
                  <th class="th-sub">CPI</th>
                  <th class="th-sub">变化</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data?.platformCountryMatrix?.rows ?? []" :key="row.platform">
                <td class="td-platform">{{ row.platform }}</td>
                <template
                  v-for="country in data?.platformCountryMatrix?.countries ?? []"
                  :key="country"
                >
                  <td class="td-cell" :class="cellClass(row.cells[country]?.highlight)">
                    {{ row.cells[country]?.value ?? '—' }}
                  </td>
                  <td class="td-cell td-change" :class="cellClass(row.cells[country]?.highlight)">
                    {{ row.cells[country]?.changeRate ?? '—' }}
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </ElCard>
    </div>

    <!-- 底部预警栏 -->
    <div class="ca-alert-bar">
      <el-icon class="alert-icon"><Warning /></el-icon>
      <span>
        国家层级 红色问题提示：可点击进入智能预警
        <el-button text size="small" type="warning" @click="emit('drill-down', '__alert__')"
          >查看预警 →</el-button
        >
      </span>
      <span class="alert-sep">|</span>
      <span>广告平台层级可点击查看详细数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import { Warning } from '@element-plus/icons-vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { SectionAppData, AppCpiRankRow } from '../types'

  defineOptions({ name: 'CaSectionApp' })

  const props = defineProps<{ data: SectionAppData | null }>()
  const emit = defineEmits<{ 'drill-down': [name: string] }>()

  const activeLevel = ref<'country' | 'app' | 'platform' | 'comprehensive'>('country')

  const levelTabs = [
    { key: 'country' as const, label: '← 国家层级回传' },
    { key: 'app' as const, label: '应用选择' },
    { key: 'platform' as const, label: '广告平台筛选' },
    { key: 'comprehensive' as const, label: '国家筛选' }
  ]

  // 应用 CPI 趋势图
  const appTrendChart = useChart()
  const appTrendRef = appTrendChart.chartRef

  function onAppRankRowClick(row: AppCpiRankRow) {
    emit('drill-down', row.appName)
  }

  function rowClass({ row }: { row: { isHighlight?: boolean } }) {
    return row.isHighlight ? 'row-highlight' : ''
  }

  function cellClass(highlight?: string) {
    if (highlight === 'warn') return 'cell-warn'
    if (highlight === 'good') return 'cell-good'
    return ''
  }

  function buildAppTrendOption(): EChartsOption {
    const d = props.data?.appCpiTrend
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } =
      appTrendChart
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        data: d.series.map((s) => s.name),
        bottom: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 }
      },
      grid: { top: 10, right: 10, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...getAxisLabelStyle(), formatter: '${value}' },
        splitLine: getSplitLineStyle()
      },
      series: d.series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        lineStyle: { color: s.color, width: 2 },
        itemStyle: { color: s.color },
        symbol: 'circle',
        symbolSize: 4
      }))
    }
  }

  watch(
    () => props.data,
    () => appTrendChart.initChart(buildAppTrendOption()),
    { deep: true }
  )
  onMounted(() => appTrendChart.initChart(buildAppTrendOption()))
</script>

<style scoped lang="scss">
  @import '../styles/ca-card-fx';

  .ca-section-app {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // 层级 tab
  .ca-level-tabs {
    display: flex;
    gap: 8px;
  }

  .ca-level-tab {
    padding: 6px 14px;
    font-size: 12px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 9999px;
    transition:
      color 0.2s,
      border-color 0.2s,
      background 0.2s;

    &:hover {
      color: var(--art-primary);
      border-color: var(--art-primary);
    }

    &.is-active {
      color: #fff;
      background: var(--art-primary);
      border-color: var(--art-primary);
    }
  }

  // 三栏布局
  .ca-app-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 16px;
    align-items: start;
  }

  @media (width <= 980px) {
    .ca-app-grid {
      grid-template-columns: 1fr;
    }
  }

  .ca-app-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ca-panel {
    :deep(.el-card__header) {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-800);
    }

    :deep(.el-card__body) {
      padding: 0 0 8px;
    }
  }

  .ca-panel--matrix {
    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .ca-chart {
    width: 100%;

    &--app-trend {
      height: 180px;
    }
  }

  // 矩阵表
  .matrix-scroll {
    max-height: 400px;
    overflow: auto;
  }

  .matrix-table {
    width: max-content;
    min-width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th,
    td {
      padding: 6px 10px;
      white-space: nowrap;
      border: 1px solid var(--default-border);
    }

    th {
      font-weight: 600;
      color: var(--art-gray-700);
      text-align: center;
      background: var(--default-box-color);
    }

    .th-platform,
    .td-platform {
      position: sticky;
      left: 0;
      z-index: 1;
      min-width: 100px;
      font-weight: 600;
      color: var(--art-gray-800);
      background: var(--default-box-color);
    }

    .th-country {
      background: color-mix(in srgb, var(--art-primary) 8%, var(--default-box-color));
    }

    .th-sub {
      font-size: 11px;
      color: var(--art-gray-500);
    }

    .td-cell {
      color: var(--art-gray-700);
      text-align: right;
    }

    .td-change {
      font-size: 11px;
    }

    .cell-warn {
      color: #f87171;
      background: rgb(248 113 113 / 8%);
    }

    .cell-good {
      color: #14b8a6;
      background: rgb(20 184 166 / 8%);
    }
  }

  // 应用排行表
  :deep(.row-highlight) {
    background: color-mix(in srgb, var(--art-primary) 6%, transparent) !important;
  }

  .app-name.is-highlight {
    font-weight: 600;
    color: var(--art-primary);
  }

  .text-up {
    color: #14b8a6;
  }

  .text-down {
    color: #f87171;
  }

  // 预警栏
  .ca-alert-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 14px;
    font-size: 12px;
    color: var(--art-gray-700);
    background: color-mix(in srgb, #f59e0b 10%, var(--default-box-color));
    border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
    border-radius: 8px;

    .alert-icon {
      color: #f59e0b;
    }

    .alert-sep {
      color: var(--art-gray-400);
    }
  }

  .panel-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  // 排行表行可点击
  .ca-rank-table {
    :deep(tr) {
      cursor: pointer;
      transition: background 0.15s;

      &:hover td {
        background: color-mix(in srgb, var(--art-primary) 6%, var(--default-box-color)) !important;
      }
    }
  }
</style>
