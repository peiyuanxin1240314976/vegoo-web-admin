<template>
  <div class="spend-panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="spend-panel__header">
          <ElSkeletonItem variant="text" class="spend-sk-title" />
        </div>
        <div class="spend-panel__body spend-panel__body--sk">
          <div class="spend-sk-row">
            <ElSkeletonItem variant="text" class="spend-sk-line spend-sk-line--lg" />
            <ElSkeletonItem variant="text" class="spend-sk-line spend-sk-line--md" />
          </div>
          <ElSkeletonItem variant="text" class="spend-sk-bar" />
          <ElSkeletonItem variant="text" class="spend-sk-hint" />
        </div>
      </template>
      <template #default>
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
              <span class="spend-rate" :style="{ left: Math.min(100, rate) + '%' }"
                >{{ rate }}%</span
              >
            </div>
          </div>
          <div class="spend-hint">{{ hintText }}</div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { MyPerformanceSpendProgress } from '../types'

  defineOptions({ name: 'MyPerformancePanelSpendProgress' })

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      title: string
      data?: MyPerformanceSpendProgress
      hintText?: string
    }>(),
    {
      loading: false,
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
  @use '../styles/mp-card-fx.scss' as *;

  .spend-panel {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px) saturate(1.12);
    border: 1px solid rgb(63 63 70 / 40%);
    border-radius: 16px;

    @include mp-neon-stack;
    @include mp-card-mesh;
    @include mp-panel-hover-lift;
    @include mp-spend-header-title-hover;

    &::before {
      position: absolute;
      top: -30%;
      right: -15%;
      z-index: 0;
      width: 55%;
      height: 90%;
      pointer-events: none;
      content: '';
      background: radial-gradient(circle at 70% 40%, rgb(59 130 246 / 18%) 0%, transparent 65%);
      animation: spend-orb 7s ease-in-out infinite alternate;
    }
  }

  @keyframes spend-orb {
    0% {
      opacity: 0.45;
      transform: scale(1);
    }

    100% {
      opacity: 0.95;
      transform: scale(1.08) translate(-4%, 2%);
    }
  }

  .spend-panel__header {
    position: relative;
    z-index: 1;
    padding: 14px 16px 0;
  }

  .spend-panel__title {
    font-size: 14px;

    @include mp-title-gradient;
  }

  .spend-sk-title {
    width: 40% !important;
    height: 16px !important;
  }

  .spend-panel__body--sk {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .spend-sk-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .spend-sk-line--lg {
    width: 38% !important;
    height: 28px !important;
  }

  .spend-sk-line--md {
    width: 32% !important;
    height: 18px !important;
  }

  .spend-sk-bar {
    width: 100% !important;
    height: 22px !important;
    border-radius: 9999px;
  }

  .spend-sk-hint {
    width: 92% !important;
    height: 14px !important;
  }

  .spend-panel__body {
    position: relative;
    z-index: 1;
    padding: 12px 16px 16px;
  }

  .spend-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: baseline;
  }

  .spend-current {
    display: inline-block;
    font-size: 26px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: rgb(96 165 250 / 98%);
    text-shadow:
      0 0 22px rgb(59 130 246 / 28%),
      0 0 44px rgb(34 211 238 / 12%);
    transition:
      transform 0.35s var(--ease-out),
      text-shadow 0.35s var(--ease-out);
    animation: spend-num-pulse 3.5s ease-in-out infinite;
  }

  .spend-panel:hover .spend-current {
    text-shadow:
      0 0 28px rgb(59 130 246 / 42%),
      0 0 52px rgb(34 211 238 / 18%);
    transform: scale(1.04);
  }

  @keyframes spend-num-pulse {
    0%,
    100% {
      filter: brightness(1);
    }

    50% {
      filter: brightness(1.08);
    }
  }

  .spend-target {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .spend-divider {
    height: 0;
    margin: 12px 0 14px;
    border: none;
    border-top: 1px dashed rgb(63 63 70 / 50%);
  }

  .spend-bar-wrap {
    width: 100%;
  }

  .spend-track {
    position: relative;
    height: 20px;
    overflow: visible;
    background: rgb(39 39 42 / 55%);
    border: 1px solid rgb(63 63 70 / 35%);
    border-radius: 9999px;
    box-shadow:
      inset 0 2px 6px rgb(0 0 0 / 28%),
      0 0 0 1px rgb(244 244 245 / 3%);
    transition:
      border-color 0.35s var(--ease-out),
      box-shadow 0.35s var(--ease-out);
  }

  .spend-panel:hover .spend-track {
    border-color: rgb(96 165 250 / 38%);
    box-shadow:
      inset 0 2px 6px rgb(0 0 0 / 28%),
      0 0 0 1px rgb(96 165 250 / 12%),
      0 0 24px rgb(59 130 246 / 12%);
  }

  .spend-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    min-width: 0;
    overflow: hidden;
    background: linear-gradient(
      90deg,
      rgb(20 184 166 / 95%) 0%,
      rgb(34 211 238 / 92%) 45%,
      rgb(59 130 246 / 95%) 100%
    );
    border-radius: 9999px;
    box-shadow:
      0 0 18px rgb(34 211 238 / 35%),
      0 0 32px rgb(59 130 246 / 15%);
    transition: width var(--duration-normal) var(--ease-out);
    animation: fill-glow 2.8s ease-in-out infinite alternate;
  }

  @keyframes fill-glow {
    0% {
      box-shadow:
        0 0 14px rgb(34 211 238 / 28%),
        0 0 28px rgb(59 130 246 / 12%);
    }

    100% {
      box-shadow:
        0 0 24px rgb(34 211 238 / 45%),
        0 0 48px rgb(59 130 246 / 18%);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }

    100% {
      transform: translateX(200%);
    }
  }

  .spend-fill::after {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgb(255 255 255 / 22%) 50%,
      transparent 100%
    );
    border-radius: 9999px;
    animation: shimmer 2.2s ease-in-out infinite;
  }

  .spend-fill::before {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(
      90deg,
      rgb(255 255 255 / 8%) 0%,
      transparent 35%,
      transparent 65%,
      rgb(255 255 255 / 6%) 100%
    );
    border-radius: 9999px;
    opacity: 0.7;
    animation: shimmer 3.8s ease-in-out infinite reverse;
  }

  .spend-rate {
    position: absolute;
    top: 50%;
    font-size: 12px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: #fff;
    text-shadow:
      0 0 8px rgb(59 130 246 / 45%),
      0 1px 4px rgb(0 0 0 / 45%);
    white-space: nowrap;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .spend-hint {
    margin-top: 12px;
    font-size: var(--font-size-aux);
    color: var(--text-secondary);
  }

  @media (prefers-reduced-motion: reduce) {
    .spend-panel {
      transition: none;
    }

    .spend-panel:hover {
      transform: none;
    }

    .spend-panel:hover .spend-panel__title {
      filter: none;
      transform: none;
    }

    .spend-panel:hover .spend-current {
      transform: none;
    }

    .spend-track {
      transition: none;
    }

    .spend-panel:hover .spend-track {
      box-shadow:
        inset 0 2px 6px rgb(0 0 0 / 28%),
        0 0 0 1px rgb(244 244 245 / 3%);
    }

    .spend-panel::before,
    .spend-fill,
    .spend-fill::before,
    .spend-fill::after,
    .spend-current {
      animation: none;
    }

    .spend-panel::after {
      opacity: 0.12;
    }
  }
</style>
