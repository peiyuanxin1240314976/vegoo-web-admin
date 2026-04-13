<template>
  <div class="kpi-card" :style="{ background: metric.bg, borderColor: metric.color + '40' }">
    <div class="kpi-header">
      <span class="kpi-label">{{ metric.label }}</span>
      <span v-if="metric.badge" class="kpi-badge">{{ metric.badge }}</span>
    </div>
    <div class="kpi-value">{{ metric.value }}</div>
    <div class="kpi-footer">
      <span class="kpi-change" :style="{ color: metric.change >= 0 ? '#00D4A1' : '#FF5C5C' }">
        {{ metric.changeLabel }}
      </span>
      <SparklineChart
        :data="metric.sparkline ?? []"
        :color="metric.color"
        :width="90"
        :height="36"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { KpiMetric } from '../types'
  import SparklineChart from './SparklineChart.vue'

  defineProps<{ metric: KpiMetric }>()
</script>

<style scoped>
  .kpi-card {
    min-width: 0;
    padding: 14px 16px 12px;
    cursor: default;
    border: 1px solid;
    border-radius: 10px;
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }

  .kpi-card:hover {
    box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
    transform: translateY(-2px);
  }

  .kpi-header {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 500;
    color: rgb(255 255 255 / 65%);
    letter-spacing: 0.02em;
  }

  .kpi-badge {
    padding: 1px 5px;
    font-size: 9px;
    font-weight: 600;
    color: rgb(255 255 255 / 70%);
    letter-spacing: 0.05em;
    background: rgb(255 255 255 / 10%);
    border-radius: 4px;
  }

  .kpi-value {
    margin-bottom: 6px;
    overflow: hidden;
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    text-overflow: ellipsis;
    letter-spacing: -0.03em;
    white-space: nowrap;
  }

  .kpi-footer {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    justify-content: space-between;
  }

  .kpi-change {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
  }
</style>
