<template>
  <div
    class="kpi-card"
    :style="{
      '--accent': metric.color,
      borderColor: 'color-mix(in srgb, var(--accent) 38%, transparent)'
    }"
  >
    <div class="kpi-header">
      <span class="kpi-label">{{ metric.label }}</span>
      <span v-if="metric.badge" class="kpi-badge">{{ metric.badge }}</span>
    </div>
    <div class="kpi-value">{{ metric.value }}</div>
    <div class="kpi-footer">
      <span class="kpi-change" :class="metric.change >= 0 ? 'is-pos' : 'is-neg'">
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
    position: relative;
    min-width: 0;
    padding: 14px 16px 12px;
    cursor: default;
    background-color: color-mix(in srgb, var(--default-box-color) 86%, transparent);
    background-image:
      radial-gradient(
        ellipse 85% 60% at 12% 10%,
        color-mix(in srgb, var(--accent) 22%, transparent) 0%,
        transparent 56%
      ),
      radial-gradient(
        ellipse 75% 55% at 88% 95%,
        color-mix(in srgb, var(--accent) 14%, transparent) 0%,
        transparent 52%
      );
    border: 1px solid;
    border-radius: 12px;
    transition:
      transform 0.2s var(--ease-out),
      box-shadow 0.25s var(--ease-out),
      border-color 0.2s var(--ease-default);
  }

  /* 顶部左边框发光线条 */
  .kpi-card::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 36px;
    height: 2px;
    content: '';
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px 0;
    opacity: 0.85;
  }

  /* 底部光条，增强“面板感” */
  .kpi-card::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--accent) 60%, transparent) 40%,
      var(--accent) 100%
    );
    border-radius: 0 0 2px 2px;
    opacity: 0.55;
    transition: opacity 0.25s var(--ease-out);
  }

  .kpi-card:hover {
    box-shadow:
      0 12px 32px rgb(0 0 0 / 28%),
      0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent),
      0 0 48px color-mix(in srgb, var(--accent) 10%, transparent);
    transform: translateY(-3px);
  }

  .kpi-card:hover::before {
    width: 52px;
    background: linear-gradient(
      90deg,
      var(--accent) 0%,
      color-mix(in srgb, var(--accent) 58%, transparent) 100%
    );
    opacity: 1;
  }

  .kpi-card:hover::after {
    opacity: 1;
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
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }

  .kpi-badge {
    padding: 1px 5px;
    font-size: 9px;
    font-weight: 600;
    color: rgb(255 255 255 / 70%);
    letter-spacing: 0.05em;
    background: color-mix(in srgb, var(--art-gray-900) 10%, transparent);
    border-radius: 4px;
  }

  .kpi-value {
    margin-bottom: 6px;
    overflow: hidden;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    text-overflow: ellipsis;
    text-shadow: 0 0 18px color-mix(in srgb, var(--accent) 14%, transparent);
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

  .kpi-change.is-pos {
    color: var(--art-success);
  }

  .kpi-change.is-neg {
    color: var(--art-danger);
  }

  @media (prefers-reduced-motion: reduce) {
    .kpi-card {
      transition: none;
    }

    .kpi-card::before {
      transition: none;
    }

    .kpi-card::after {
      transition: none;
    }

    .kpi-card:hover {
      transform: none;
    }
  }
</style>
