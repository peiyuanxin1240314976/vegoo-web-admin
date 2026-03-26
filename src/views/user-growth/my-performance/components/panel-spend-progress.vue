<template>
  <div class="spend-panel">
    <div class="spend-panel__header">
      <span class="spend-panel__title">{{ title }}</span>
    </div>
    <div class="spend-panel__body">
      <div class="spend-row">
        <span class="spend-current">{{ money(spend) }}</span>
        <span class="spend-target">— {{ money(target) }}</span>
      </div>
      <div class="spend-divider"></div>
      <div class="spend-bar-wrap">
        <div class="spend-track">
          <div class="spend-fill" :style="{ width: Math.min(100, rate) + '%' }" />
          <span class="spend-rate" :style="{ left: Math.min(100, rate) + '%' }">{{ rate }}%</span>
        </div>
      </div>
      <div class="spend-hint">{{ hintText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { MyPerformanceSpendProgress } from '../types'

  defineOptions({ name: 'MyPerformancePanelSpendProgress' })

  const props = withDefaults(
    defineProps<{
      title: string
      data?: MyPerformanceSpendProgress
      hintText?: string
    }>(),
    {
      data: () => ({ spend: 0, target: 0, rate: 0 })
    }
  )

  const spend = computed(() => props.data?.spend ?? 0)
  const target = computed(() => props.data?.target ?? 0)
  const rate = computed(() => props.data?.rate ?? 0)

  function money(n: number) {
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
</script>

<style scoped lang="scss">
  .spend-panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .spend-panel__header {
    padding: 14px 16px 0;
  }

  .spend-panel__title {
    font-size: 14px;
    font-weight: 650;
    color: var(--art-gray-900);
  }

  .spend-panel__body {
    padding: 12px 16px 16px;
  }

  .spend-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: baseline;
  }

  .spend-current {
    font-size: 22px;
    font-weight: 700;
    color: rgb(74 144 226);
  }

  .spend-target {
    font-size: 14px;
    color: rgb(138 142 153);
  }

  .spend-divider {
    height: 0;
    margin: 12px 0 14px;
    border: none;
    border-top: 1px dashed rgb(51 59 74);
  }

  .spend-bar-wrap {
    width: 100%;
  }

  .spend-track {
    position: relative;
    height: 16px;
    overflow: visible;
    background: rgb(161 161 170 / 18%);
    border-radius: 9999px;
  }

  .spend-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    min-width: 0;
    background: linear-gradient(90deg, rgb(20 184 166 / 95%), rgb(59 130 246 / 95%));
    border-radius: 9999px;
    transition: width 0.2s ease;
  }

  .spend-rate {
    position: absolute;
    top: 50%;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 25%);
    white-space: nowrap;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .spend-hint {
    margin-top: 12px;
    font-size: 12px;
    color: var(--art-gray-600);
  }
</style>
