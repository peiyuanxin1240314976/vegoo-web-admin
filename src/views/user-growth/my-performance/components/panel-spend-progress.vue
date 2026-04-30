<template>
  <div class="spend-panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="spend-panel__header">
          <ElSkeletonItem variant="text" class="spend-sk-title" />
        </div>
        <div class="spend-panel__body spend-panel__body--sk">
          <div v-for="n in 3" :key="n" class="spend-sk-block">
            <div class="spend-sk-row">
              <ElSkeletonItem variant="text" class="spend-sk-line spend-sk-line--sm" />
              <ElSkeletonItem variant="text" class="spend-sk-line spend-sk-line--md" />
            </div>
            <ElSkeletonItem variant="text" class="spend-sk-bar" />
          </div>
        </div>
      </template>
      <template #default>
        <div class="spend-panel__header">
          <span class="spend-panel__title">{{ title }}</span>
        </div>
        <div class="spend-panel__body">
          <div
            v-for="(row, idx) in list"
            :key="idx + '_' + row.label"
            class="spend-block"
            :class="{ 'spend-block--total': row.label.includes('总消耗') }"
          >
            <div class="spend-row-head">
              <span class="spend-label">{{ row.label }}</span>
              <span class="spend-value">{{ row.value }}</span>
            </div>
            <div class="spend-bar-wrap">
              <div class="spend-track">
                <div
                  class="spend-fill"
                  :class="'spend-fill--' + fillTone(row)"
                  :style="{ width: Math.min(100, row.rate) + '%' }"
                />
                <span class="spend-rate" :style="{ left: Math.min(100, row.rate) + '%' }"
                  >{{ row.rate }}%</span
                >
              </div>
            </div>
          </div>
          <div v-if="hintText" class="spend-hint">{{ hintText }}</div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import type { MyPerformanceSpendProgressItem, MyPerformanceSpendProgressTone } from '../types'

  defineOptions({ name: 'MyPerformancePanelSpendProgress' })

  withDefaults(
    defineProps<{
      loading?: boolean
      title: string
      list?: MyPerformanceSpendProgressItem[]
      hintText?: string
    }>(),
    {
      loading: false,
      list: () => []
    }
  )

  const TONES: MyPerformanceSpendProgressTone[] = [
    'success',
    'warning',
    'danger',
    'primary',
    'default'
  ]

  function fillTone(row: MyPerformanceSpendProgressItem): MyPerformanceSpendProgressTone {
    const t = row.type
    if (t && TONES.includes(t)) return t
    return 'success'
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
    gap: 16px;
  }

  .spend-sk-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .spend-sk-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .spend-sk-line--sm {
    width: 32% !important;
    height: 14px !important;
  }

  .spend-sk-line--md {
    width: 44% !important;
    height: 14px !important;
  }

  .spend-sk-bar {
    width: 100% !important;
    height: 20px !important;
    border-radius: 9999px;
  }

  .spend-panel__body {
    position: relative;
    z-index: 1;
    padding: 12px 16px 16px;
  }

  .spend-block {
    padding-bottom: 14px;

    &:not(:last-of-type) {
      margin-bottom: 4px;
      border-bottom: 1px dashed rgb(63 63 70 / 45%);
    }
  }

  .spend-block--total .spend-value {
    font-size: 18px;
    font-weight: 800;
    color: rgb(96 165 250 / 98%);
    text-shadow:
      0 0 18px rgb(59 130 246 / 24%),
      0 0 36px rgb(34 211 238 / 10%);
  }

  .spend-row-head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .spend-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .spend-value {
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
    text-align: right;
    word-break: break-word;
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
    border-radius: 9999px;
    box-shadow:
      0 0 18px rgb(34 211 238 / 35%),
      0 0 32px rgb(59 130 246 / 15%);
    transition: width var(--duration-normal) var(--ease-out);
    animation: fill-glow 2.8s ease-in-out infinite alternate;
  }

  .spend-fill--success {
    background: linear-gradient(
      90deg,
      rgb(20 184 166 / 95%) 0%,
      rgb(34 211 238 / 92%) 45%,
      rgb(59 130 246 / 95%) 100%
    );
  }

  .spend-fill--primary {
    background: linear-gradient(
      90deg,
      rgb(37 99 235 / 95%) 0%,
      rgb(59 130 246 / 92%) 50%,
      rgb(96 165 250 / 95%) 100%
    );
  }

  .spend-fill--warning {
    background: linear-gradient(
      90deg,
      rgb(234 88 12 / 95%) 0%,
      rgb(249 115 22 / 90%) 55%,
      rgb(251 191 36 / 88%) 100%
    );
  }

  .spend-fill--danger {
    background: linear-gradient(
      90deg,
      rgb(220 38 38 / 95%) 0%,
      rgb(239 68 68 / 92%) 50%,
      rgb(244 63 94 / 90%) 100%
    );
  }

  .spend-fill--default {
    background: linear-gradient(90deg, rgb(82 82 91 / 95%) 0%, rgb(113 113 122 / 90%) 100%);
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
    .spend-fill::after {
      animation: none;
    }

    .spend-panel::after {
      opacity: 0.12;
    }
  }
</style>
