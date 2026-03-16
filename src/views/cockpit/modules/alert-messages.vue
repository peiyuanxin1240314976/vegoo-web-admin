<template>
  <div class="cockpit-alerts">
    <!-- 左块：运营摘要指标 -->
    <div class="cockpit-panel alert-block alert-block--metrics">
      <div v-if="summaryMetrics.length" class="metrics-inner">
        <template v-for="(metric, index) in summaryMetrics" :key="metric.label">
          <span v-if="index > 0" class="metric-sep">|</span>
          <span class="metric-item">
            <span class="metric-label">{{ metric.label }} {{ metric.value }}</span>
            <template v-if="metric.change != null && metric.trend">
              <span v-if="metric.trend === 'down'" class="metric-change down">
                <ElIcon><Bottom /></ElIcon>{{ formatChange(metric.change) }}
              </span>
              <span v-else class="metric-change up">
                <ElIcon><Top /></ElIcon>{{ formatChange(metric.change) }}
              </span>
            </template>
          </span>
        </template>
      </div>
      <span v-else class="alert-empty">暂无数据</span>
    </div>

    <!-- 右块：警示列表（带彩色图标） -->
    <div class="cockpit-panel alert-block alert-block--list">
      <template v-if="alertBanners.length">
        <div
          v-for="(item, index) in alertBanners"
          :key="index"
          class="alert-item"
          :class="item.type"
        >
          <component :is="iconMap[item.type]" class="alert-icon" />
          <span class="alert-text">{{ item.text }}</span>
        </div>
      </template>
      <span v-else class="alert-empty">暂无数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ReadingLamp, TrendCharts, WarningFilled, Top, Bottom } from '@element-plus/icons-vue'
  import type { CockpitAlertBanner, CockpitAlertSummaryMetric } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitAlertMessages' })

  const props = withDefaults(
    defineProps<{
      alertSummaryMetrics?: CockpitAlertSummaryMetric[]
      alertBanners?: CockpitAlertBanner[]
    }>(),
    { alertSummaryMetrics: () => [], alertBanners: () => [] }
  )

  const summaryMetrics = computed(() =>
    Array.isArray(props.alertSummaryMetrics)
      ? props.alertSummaryMetrics
      : (MOCK_COCKPIT_OVERVIEW.alertSummaryMetrics ?? [])
  )

  const alertBanners = computed(() =>
    Array.isArray(props.alertBanners) ? props.alertBanners : MOCK_COCKPIT_OVERVIEW.alertBanners
  )

  const iconMap = {
    warning: ReadingLamp,
    opportunity: TrendCharts,
    risk: WarningFilled
  } as const

  function formatChange(n: number): string {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
</script>

<style scoped lang="scss">
  .alert-empty {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .cockpit-alerts {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  .alert-block {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    min-height: 48px;
    padding: 12px 16px;
    border-radius: 10px;
  }

  .alert-block--metrics {
    color: var(--el-text-color-primary);

    .metrics-inner {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;
      align-items: center;
      font-size: 13px;
    }

    .metric-sep {
      color: var(--el-text-color-secondary);
      user-select: none;
      opacity: 0.8;
    }

    .metric-item {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }

    .metric-label {
      white-space: nowrap;
    }

    .metric-change {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      font-size: 12px;
      font-weight: 500;

      &.down {
        color: var(--el-color-danger);
      }

      &.up {
        color: var(--el-color-success);
      }
    }
  }

  .alert-block--list {
    flex-flow: row wrap;
    gap: 8px 16px;
    background: rgb(140 100 60 / 25%);
    border: 1px solid rgb(180 130 80 / 35%);

    .alert-item {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      color: var(--el-text-color-primary);
      white-space: nowrap;

      .alert-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }

      .alert-text {
        flex: 0 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &.warning .alert-icon {
        color: #e6a23c;
      }

      &.opportunity .alert-icon {
        color: var(--el-color-success);
      }

      &.risk .alert-icon {
        color: var(--el-color-danger);
      }
    }
  }
</style>
