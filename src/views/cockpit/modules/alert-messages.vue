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
  import { Opportunity, TrendCharts, WarningFilled, Top, Bottom } from '@element-plus/icons-vue'
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
    warning: Opportunity,
    opportunity: TrendCharts,
    risk: WarningFilled
  } as const

  function formatChange(n: number): string {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
</script>

<style scoped lang="scss">
  .alert-empty {
    font-size: 12px;
    color: rgb(148 163 184 / 78%);
    letter-spacing: 0.02em;
  }

  .cockpit-alerts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }

  .alert-block {
    --alert-theme: var(--theme-color, var(--art-primary, var(--el-color-primary, #3b82f6)));

    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    min-height: 42px;
    padding: 9px 12px;
    background:
      linear-gradient(180deg, rgb(9 16 34 / 92%), rgb(7 12 26 / 88%)),
      radial-gradient(
        circle at top,
        color-mix(in srgb, var(--alert-theme) 10%, transparent),
        transparent 62%
      );
    backdrop-filter: blur(14px);
    border: 1px solid color-mix(in srgb, var(--alert-theme) 22%, transparent);
    border-radius: 14px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 6%),
      0 10px 24px rgb(2 6 23 / 20%),
      0 0 0 1px rgb(24 36 72 / 48%);
  }

  .alert-block--metrics {
    flex: 0 0 59%;
    color: rgb(226 232 240 / 92%);

    .metrics-inner {
      display: flex;
      flex-wrap: wrap;
      gap: 2px 10px;
      align-content: center;
      align-items: center;
      width: 100%;
      min-height: 22px;
      font-size: 12px;
      line-height: 1;
    }

    .metric-sep {
      position: relative;
      align-self: center;
      width: 1px;
      height: 15px;
      overflow: hidden;
      font-size: 0;
      color: transparent;
      user-select: none;
      background: linear-gradient(180deg, transparent, rgb(96 165 250 / 34%), transparent);
      opacity: 0.9;
    }

    .metric-item {
      display: inline-flex;
      gap: 5px;
      align-items: center;
      min-width: 0;
      min-height: 22px;
    }

    .metric-label {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      color: rgb(226 232 240 / 88%);
      white-space: nowrap;
    }

    .metric-change {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      min-height: 18px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1;

      &.down {
        color: #f87171;
      }

      &.up {
        color: #34d399;
      }

      :deep(.el-icon) {
        font-size: 11px;
        transform: translateY(0.5px);
      }
    }
  }

  .alert-block--list {
    flex: 0 0 40%;
    justify-content: center;
    min-height: 42px;
    text-align: center;

    .alert-item {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      min-height: 22px;
      font-size: 13px;
      line-height: 1;
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

  @media (width <= 992px) {
    .alert-block--metrics,
    .alert-block--list {
      flex: 0 0 100%;
    }
  }
</style>
