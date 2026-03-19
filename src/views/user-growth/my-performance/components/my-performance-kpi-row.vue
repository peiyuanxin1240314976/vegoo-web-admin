<template>
  <div class="kpi-row">
    <div v-for="(k, idx) in list" :key="idx" class="kpi-item" :class="k.type ? `is-${k.type}` : ''">
      <div class="kpi-label">{{ k.label }}</div>
      <div class="kpi-value">
        <span class="value">{{ k.value }}</span>
        <span v-if="k.sub" class="sub">{{ k.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { MyPerformanceTopKpiItem } from '../types'

  defineOptions({ name: 'MyPerformanceKpiRow' })

  withDefaults(
    defineProps<{
      list?: MyPerformanceTopKpiItem[]
    }>(),
    { list: () => [] }
  )
</script>

<style scoped lang="scss">
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .kpi-item {
    padding: 12px 14px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .kpi-label {
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .kpi-value {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  .value {
    font-size: 18px;
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .sub {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .kpi-item.is-primary .value {
    color: var(--art-primary);
  }

  .kpi-item.is-success .value {
    color: var(--art-success);
  }

  .kpi-item.is-warning .value {
    color: var(--art-warning);
  }

  @media (width <= 1200px) {
    .kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 768px) {
    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
