<template>
  <div class="app-health-kpi-row">
    <div
      v-for="(card, index) in cardList"
      :key="card.appId || index"
      class="app-health-kpi-card"
      :class="card.theme ? `app-health-kpi-card--${card.theme}` : ''"
    >
      <div class="kpi-card-icon">
        <span class="kpi-icon-letter">{{ (card.appName || 'A').charAt(0) }}</span>
      </div>
      <div class="kpi-card-body">
        <div class="kpi-card-name">{{ card.appName }}</div>
        <div class="kpi-score-wrap">
          <div
            class="kpi-score-semi"
            :style="{ '--score-pct': String((card.healthScore / (card.healthMax ?? 100)) * 180) }"
          >
            <span class="kpi-score-value">{{ card.healthScore }}/{{ card.healthMax ?? 100 }}</span>
          </div>
        </div>
        <div class="kpi-metrics">
          <div class="kpi-metric">
            <span class="kpi-metric-label">收入:</span>
            <span class="kpi-metric-value">{{ card.revenue }}</span>
            <span
              v-if="card.revenueCompare"
              class="kpi-metric-compare"
              :class="card.revenueUp ? 'up' : 'down'"
            >
              ({{ card.revenueCompare }})
            </span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-metric-label">DAU:</span>
            <span class="kpi-metric-value">{{ card.dau }}</span>
            <span
              v-if="card.dauCompare"
              class="kpi-metric-compare"
              :class="card.dauUp ? 'up' : 'down'"
            >
              ({{ card.dauCompare }})
            </span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-metric-label">D7:</span>
            <span class="kpi-metric-value">{{ card.d7 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AppHealthKpiCard } from '../types'
  import { MOCK_APP_HEALTH } from '../mock/data'

  defineOptions({ name: 'AppHealthKpiCards' })

  const props = withDefaults(defineProps<{ cards?: AppHealthKpiCard[] }>(), {
    cards: () => []
  })

  const cardList = computed(() => (props.cards?.length ? props.cards : MOCK_APP_HEALTH.kpiCards))
</script>

<style scoped lang="scss">
  .app-health-kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (width <= 1200px) {
    .app-health-kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 768px) {
    .app-health-kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 480px) {
    .app-health-kpi-row {
      grid-template-columns: 1fr;
    }
  }

  .app-health-kpi-card {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  .kpi-card-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-radius: 10px;
  }

  .app-health-kpi-card--blue .kpi-card-icon {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  }

  .app-health-kpi-card--blue {
    background: linear-gradient(135deg, rgb(64 158 255 / 12%) 0%, rgb(64 158 255 / 4%) 100%);
    border-color: rgb(64 158 255 / 28%);
  }

  .app-health-kpi-card--green .kpi-card-icon {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  }

  .app-health-kpi-card--green {
    background: linear-gradient(135deg, rgb(103 194 58 / 12%) 0%, rgb(103 194 58 / 4%) 100%);
    border-color: rgb(103 194 58 / 28%);
  }

  .app-health-kpi-card--orange .kpi-card-icon {
    background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  }

  .app-health-kpi-card--orange {
    background: linear-gradient(135deg, rgb(230 162 60 / 14%) 0%, rgb(230 162 60 / 4%) 100%);
    border-color: rgb(230 162 60 / 30%);
  }

  .app-health-kpi-card--purple .kpi-card-icon {
    background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
  }

  .app-health-kpi-card--purple {
    background: linear-gradient(135deg, rgb(114 46 209 / 12%) 0%, rgb(114 46 209 / 4%) 100%);
    border-color: rgb(114 46 209 / 28%);
  }

  .app-health-kpi-card--cyan .kpi-card-icon {
    background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
  }

  .app-health-kpi-card--cyan {
    background: linear-gradient(135deg, rgb(19 194 194 / 12%) 0%, rgb(19 194 194 / 4%) 100%);
    border-color: rgb(19 194 194 / 28%);
  }

  .kpi-icon-letter {
    line-height: 1;
  }

  .kpi-card-body {
    flex: 1;
    min-width: 0;
  }

  .kpi-card-name {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .kpi-score-wrap {
    margin-bottom: 10px;
  }

  .kpi-score-semi {
    position: relative;
    width: 64px;
    height: 32px;
    overflow: hidden;
    background: var(--el-border-color-lighter);
    border-radius: 32px 32px 0 0;

    &::before {
      position: absolute;
      inset: 0;
      content: '';
      background: conic-gradient(
        from 0.5turn at 50% 100%,
        #67c23a 0deg calc(var(--score-pct, 0) * 1deg),
        var(--el-border-color-lighter) calc(var(--score-pct, 0) * 1deg) 180deg
      );
      border-radius: 32px 32px 0 0;
    }
  }

  .kpi-score-value {
    position: absolute;
    bottom: 2px;
    left: 50%;
    z-index: 1;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    transform: translateX(-50%);
  }

  .kpi-metrics {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }

  .kpi-metric {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: baseline;
  }

  .kpi-metric-label {
    color: var(--el-text-color-secondary);
  }

  .kpi-metric-value {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .kpi-metric-compare {
    &.up {
      color: var(--el-color-success);
    }

    &.down {
      color: var(--el-color-danger);
    }
  }
</style>
