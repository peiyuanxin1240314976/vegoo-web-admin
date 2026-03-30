<template>
  <section class="row row-3 aps-entry-4">
    <div class="panel panel-table">
      <div class="panel-title">广告平台指标比较详情</div>
      <div class="table-wrap aps-metrics-table-host">
        <div v-if="pending" class="aps-module-skeleton aps-module-skeleton--metrics-table">
          <ElSkeleton animated :rows="skeletonRows" />
        </div>
        <div v-show="!pending" class="aps-metrics-table-real">
          <ArtTable
            :data="rows"
            :columns="columns"
            class="aps-metrics-table"
            row-key="channel"
            :stripe="false"
            :border="false"
            size="default"
            :pagination="pagination"
            :paginationOptions="{ align: 'center', pageSizes: [10, 20, 30], background: false }"
            @pagination:current-change="onCurrentChange"
            @pagination:size-change="onSizeChange"
            @sort-change="onSortChange"
          >
            <template #roi="{ row }">
              <span class="detail-cell detail-cell--metric">
                <span class="detail-metric-value">{{ formatNum2(row.roi) }}</span>
                <div
                  class="detail-sparkline"
                  :class="row.roiTrendUp ? 'is-good' : 'is-bad'"
                  role="img"
                  :aria-label="`ROI 趋势 ${formatNum2(row.roi)}`"
                >
                  <span
                    v-for="(h, i) in metricSparklineBars(row, 'roi')"
                    :key="i"
                    class="detail-sparkline__bar"
                    :style="{ height: `${Math.round(h * 20)}px` }"
                  />
                </div>
              </span>
            </template>
            <template #cpi="{ row }">
              <span class="detail-cell detail-cell--metric">
                <span class="detail-metric-value">{{ formatUsd2(row.cpi) }}</span>
                <div
                  class="detail-sparkline"
                  :class="!row.cpiTrendUp ? 'is-good' : 'is-bad'"
                  role="img"
                  :aria-label="`CPI 趋势 ${formatUsd2(row.cpi)}`"
                >
                  <span
                    v-for="(h, i) in metricSparklineBars(row, 'cpi')"
                    :key="i"
                    class="detail-sparkline__bar"
                    :style="{ height: `${Math.round(h * 20)}px` }"
                  />
                </div>
              </span>
            </template>
            <template #userQualityD7="{ row }">
              <div class="detail-uq-cell">
                <span class="detail-uq-value">{{ formatNum2(row.userQualityD7) }}%</span>
                <span class="arrow" :class="row.userQualityD7TrendUp ? 'up' : 'down'">{{
                  row.userQualityD7TrendUp ? '↑' : '↓'
                }}</span>
                <ElProgress
                  :percentage="userQualityProgressPercent(row.userQualityD7)"
                  :stroke-width="4"
                  :show-text="false"
                  :color="userQualityProgressColor(row.userQualityD7TrendUp)"
                  class="detail-uq-progress"
                />
              </div>
            </template>
            <template #userQualityPay="{ row }">
              <div class="detail-uq-cell">
                <span class="detail-uq-value">{{ formatNum2(row.userQualityPay) }}%</span>
                <span class="arrow" :class="row.userQualityPayTrendUp ? 'up' : 'down'">{{
                  row.userQualityPayTrendUp ? '↑' : '↓'
                }}</span>
                <ElProgress
                  :percentage="userQualityProgressPercent(row.userQualityPay)"
                  :stroke-width="4"
                  :show-text="false"
                  :color="userQualityProgressColor(row.userQualityPayTrendUp)"
                  class="detail-uq-progress"
                />
              </div>
            </template>
            <template #status="{ row }">
              <span class="detail-cell">
                <span class="status-dot" :class="row.status"></span>
                {{ statusText(row.status) }}
              </span>
            </template>
            <template #metricsDetailAction="{ row }">
              <ElButton type="primary" link round @click="onViewDetail(row)">详情</ElButton>
            </template>
          </ArtTable>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ColumnOption } from '@/types'
  import type { ChannelMetricRow } from '../mock'

  defineProps<{
    pending: boolean
    skeletonRows: number
    rows: ChannelMetricRow[]
    columns: ColumnOption<ChannelMetricRow>[]
    pagination: { current: number; size: number; total: number }
    onCurrentChange: (p: number) => void
    onSizeChange: (size: number) => void
    onSortChange: (payload: {
      column: any
      prop: string
      order: 'ascending' | 'descending' | null
    }) => void
    formatNum2: (v: unknown) => string
    formatUsd2: (v: unknown) => string
    statusText: (s: any) => string
    metricSparklineBars: (row: ChannelMetricRow, kind: 'roi' | 'cpi') => number[]
    userQualityProgressPercent: (value: number) => number
    userQualityProgressColor: (trendUp: boolean) => string
    onViewDetail: (row: ChannelMetricRow) => void
  }>()
</script>

<script lang="ts">
  export default { name: 'ApaMetricsTablePanel' }
</script>

<style scoped lang="scss">
  .aps-metrics-table {
    :deep(.el-table) {
      margin-top: 6px;
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper),
    :deep(.el-table__header-wrapper),
    :deep(.el-table__body-wrapper),
    :deep(.el-scrollbar__view) {
      background: transparent !important;
    }

    :deep(.el-table__body tr.el-table__row) {
      background: transparent;
    }

    :deep(.el-table__inner-wrapper::before) {
      height: 0;
    }

    :deep(.el-table__header thead tr) {
      background: var(--aps-table-header-gradient);
    }

    :deep(.el-table th.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: var(--aps-table-header-text);
      background: transparent !important;
      border-bottom: 1px solid var(--aps-table-divider-strong);
    }

    :deep(.el-table td.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: var(--aps-text-secondary);
      background: transparent;
      border-bottom: 1px solid var(--aps-table-divider-weak);
    }

    :deep(.el-table__cell .cell) {
      padding: 0 8px;
    }

    :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
      background: var(--aps-bg-row-hover);
    }

    :deep(.el-button.is-link) {
      padding: 0;
      font-size: 12px;
    }
  }
</style>
