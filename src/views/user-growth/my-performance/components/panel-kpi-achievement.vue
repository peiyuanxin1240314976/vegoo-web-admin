<template>
  <div class="panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="panel__header">
          <ElSkeletonItem variant="text" class="panel__sk-title" />
        </div>
        <div class="panel__body panel__body--sk">
          <ElSkeletonItem variant="circle" class="panel__sk-ring" />
          <div class="panel__sk-table">
            <div class="panel__sk-row panel__sk-row--head">
              <ElSkeletonItem v-for="c in 5" :key="c" variant="text" class="panel__sk-cell" />
            </div>
            <div v-for="r in 4" :key="r" class="panel__sk-row">
              <ElSkeletonItem v-for="c in 5" :key="c" variant="text" class="panel__sk-cell" />
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="panel__header">
          <span class="title">{{ title }}</span>
        </div>
        <div class="panel__body">
          <div class="kpi-ring">
            <ElProgress
              type="circle"
              :percentage="ringPercentageForProgress"
              :stroke-width="10"
              :width="140"
              :color="ringColor"
            >
              <template #default>
                <div class="ring-center">
                  <div class="ring-score">{{ ringPercentageRounded }}%</div>
                  <div class="ring-sub">{{ achievement.hint || achievement.label }}</div>
                </div>
              </template>
            </ElProgress>
          </div>

          <div class="breakdown">
            <div class="head">
              <span class="cell cell--label">{{ colLabel }}</span>
              <span class="cell">{{ colTarget }}</span>
              <span class="cell">{{ colActual }}</span>
              <span class="cell">{{ colRate }}</span>
              <span class="cell">{{ colScore }}</span>
            </div>
            <div v-for="(r, idx) in achievement.breakdown" :key="idx" class="row">
              <span class="cell cell--label">{{ r.label }}</span>
              <span class="cell">{{ r.target }}</span>
              <span class="cell">{{ r.actual }}</span>
              <span class="cell">{{ r.rate }}</span>
              <span class="cell">{{ r.score }}</span>
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, nextTick } from 'vue'
  import { useTransition, TransitionPresets, usePreferredReducedMotion } from '@vueuse/core'
  import type { MyPerformanceKpiAchievement } from '../types'

  defineOptions({ name: 'MyPerformancePanelKpiAchievement' })

  function clampScore(n: number | null | undefined) {
    if (n === null || n === undefined) return 0
    if (!Number.isFinite(n)) return 0
    return Math.min(100, Math.max(0, n))
  }

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      title: string
      achievement: MyPerformanceKpiAchievement
      colLabel?: string
      colTarget?: string
      colActual?: string
      colRate?: string
      colScore?: string
    }>(),
    {
      loading: false,
      colLabel: '指标',
      colTarget: '目标',
      colActual: '实际',
      colRate: '达成率',
      colScore: '评分'
    }
  )

  const ringColor = computed(() => {
    const v = props.achievement.score
    if (v === null || v === undefined) return 'var(--text-tertiary)'
    if (v >= 90) return 'var(--art-success)'
    if (v >= 80) return 'var(--art-primary)'
    return 'var(--art-warning)'
  })

  /** 驱动圆环与中间数字：0 → 目标值，切换口径/刷新时重演 */
  const reduceMotion = usePreferredReducedMotion()
  const ringTarget = ref(0)
  const ringPercentage = useTransition(ringTarget, {
    duration: computed(() => (reduceMotion.value ? 1 : 1150)),
    transition: TransitionPresets.easeOutCubic
  })
  const ringPercentageRounded = computed(() => Math.round(ringPercentage.value))
  const ringPercentageForProgress = computed(() =>
    Math.min(100, Math.max(0, Number(ringPercentage.value.toFixed(2))))
  )

  watch(
    () => [props.loading, props.achievement.score] as const,
    async ([loading, score]) => {
      if (loading) {
        ringTarget.value = 0
        return
      }
      const next = clampScore(score)
      await nextTick()
      if (reduceMotion.value) {
        ringTarget.value = next
        return
      }
      ringTarget.value = 0
      requestAnimationFrame(() => {
        ringTarget.value = next
      })
    },
    { immediate: true }
  )

  const colLabel = computed(() => props.colLabel)
  const colTarget = computed(() => props.colTarget)
  const colActual = computed(() => props.colActual)
  const colRate = computed(() => props.colRate)
  const colScore = computed(() => props.colScore)
</script>

<style scoped lang="scss">
  @use '../styles/mp-card-fx.scss' as *;

  .panel {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px) saturate(1.12);
    border: 1px solid rgb(63 63 70 / 40%);
    border-radius: 16px;

    @include mp-neon-stack;
    @include mp-card-mesh;
    @include mp-panel-hover-lift;
    @include mp-panel-header-title-hover;

    &::before {
      position: absolute;
      top: -80px;
      right: -60px;
      z-index: 0;
      width: 180px;
      height: 180px;
      pointer-events: none;
      content: '';
      background: radial-gradient(circle, rgb(16 185 129 / 14%) 0%, transparent 65%);
      animation: panel-orb 6s ease-in-out infinite alternate;
    }
  }

  @keyframes panel-orb {
    0% {
      opacity: 0.5;
      transform: translate(0, 0) scale(1);
    }

    100% {
      opacity: 1;
      transform: translate(-15px, 15px) scale(1.2);
    }
  }

  .panel__header {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgb(63 63 70 / 30%);
  }

  .title {
    font-size: 14px;

    @include mp-title-gradient;
  }

  .panel__sk-title {
    width: 42% !important;
    height: 16px !important;
  }

  .panel__body--sk {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-items: center;
  }

  .panel__sk-ring {
    flex-shrink: 0;
    width: 140px !important;
    height: 140px !important;
  }

  .panel__sk-table {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .panel__sk-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 0.8fr 0.7fr;
    gap: 10px;
    align-items: center;
  }

  .panel__sk-row--head .panel__sk-cell {
    height: 12px !important;
  }

  .panel__sk-cell {
    width: 100% !important;
    height: 14px !important;
  }

  .panel__body {
    position: relative;
    z-index: 1;
    padding: 16px;
  }

  .kpi-ring {
    display: grid;
    place-items: center;
    margin-bottom: 14px;
    transition:
      transform 0.45s var(--ease-out),
      filter 0.45s var(--ease-out);
    transform-origin: center center;

    :deep(.el-progress) {
      filter: drop-shadow(0 0 14px rgb(16 185 129 / 20%));
    }

    :deep(.el-progress__text) {
      filter: drop-shadow(0 0 12px rgb(16 185 129 / 18%));
    }

    :deep(.el-progress svg) {
      filter: drop-shadow(0 0 8px rgb(16 185 129 / 25%));
    }

    /* 与 useTransition 同步：去掉 EP 默认 0.6s dash 过渡，避免与数值插值「打架」 */
    :deep(.el-progress--circle svg path:nth-of-type(2)) {
      transition:
        stroke-dasharray 0s linear,
        stroke var(--duration-normal) var(--ease-out),
        opacity var(--duration-normal) var(--ease-default) !important;
    }
  }

  .panel:hover .kpi-ring {
    filter: drop-shadow(0 10px 28px rgb(16 185 129 / 22%));
    transform: scale(1.05);
  }

  .panel:hover .ring-score {
    text-shadow:
      0 0 24px rgb(148 163 184 / 28%),
      0 0 48px rgb(16 185 129 / 14%);
    transform: scale(1.04);
  }

  .ring-center {
    display: grid;
    gap: 2px;
    place-items: center;
  }

  .ring-score {
    font-size: 26px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: rgb(148 163 184 / 98%);
    text-shadow:
      0 0 20px rgb(148 163 184 / 20%),
      0 0 40px rgb(16 185 129 / 10%);
    transition:
      transform 0.4s var(--ease-out),
      text-shadow 0.4s var(--ease-out);
    animation: score-glow 3s ease-in-out infinite;
  }

  @keyframes score-glow {
    0%,
    100% {
      text-shadow:
        0 0 20px rgb(148 163 184 / 18%),
        0 0 40px rgb(16 185 129 / 8%);
    }

    50% {
      text-shadow:
        0 0 28px rgb(148 163 184 / 30%),
        0 0 56px rgb(16 185 129 / 15%);
    }
  }

  .ring-sub {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .breakdown {
    padding: 6px 4px 10px;
    margin-top: 2px;
    font-size: 13px;
    background: linear-gradient(
      165deg,
      rgb(24 24 27 / 55%) 0%,
      rgb(24 24 27 / 28%) 55%,
      rgb(39 39 42 / 22%) 100%
    );
    border: 1px solid rgb(63 63 70 / 28%);
    border-radius: 12px;
    box-shadow:
      inset 0 1px 0 rgb(244 244 245 / 5%),
      0 4px 20px rgb(0 0 0 / 12%);
  }

  .head,
  .row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 0.8fr 0.7fr;
    gap: 10px;
    align-items: center;
  }

  .head {
    padding: 4px 8px 10px;
    margin: 0 2px 2px;
    font-size: var(--font-size-aux);
    color: var(--text-secondary);
    border-bottom: 1px solid rgb(63 63 70 / 35%);
  }

  .row {
    position: relative;
    padding: 9px 10px 9px 12px;
    margin: 0 2px;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
    isolation: isolate;
    border: 1px solid transparent;
    border-radius: 10px;
    opacity: 0.92;
    transition:
      background-color var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      opacity var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &::before {
      position: absolute;
      top: 50%;
      left: 3px;
      z-index: 0;
      width: 3px;
      height: 0;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        180deg,
        rgb(34 211 238 / 90%) 0%,
        rgb(16 185 129 / 85%) 50%,
        rgb(59 130 246 / 75%) 100%
      );
      border-radius: 3px;
      box-shadow: 0 0 12px rgb(34 211 238 / 35%);
      opacity: 0;
      transition:
        height var(--duration-normal) var(--ease-out),
        opacity var(--duration-normal) var(--ease-out),
        transform var(--duration-normal) var(--ease-out);
      transform: translateY(-50%) scaleY(0.35);
    }

    .cell {
      position: relative;
      z-index: 1;
    }

    &:hover {
      z-index: 2;
      background: linear-gradient(
        100deg,
        rgb(16 185 129 / 10%) 0%,
        rgb(39 39 42 / 72%) 32%,
        rgb(39 39 42 / 58%) 100%
      );
      border-color: rgb(34 211 238 / 32%);
      box-shadow:
        0 10px 28px rgb(0 0 0 / 32%),
        0 0 0 1px rgb(59 130 246 / 14%) inset,
        0 0 32px rgb(16 185 129 / 14%),
        0 0 48px rgb(34 211 238 / 8%);
      opacity: 1;

      &::before {
        height: 62%;
        opacity: 1;
        transform: translateY(-50%) scaleY(1);
      }
    }

    &:active {
      transition-duration: var(--duration-fast);
    }
  }

  .cell--label {
    font-weight: 500;
    color: var(--text-primary);
    opacity: 0.88;
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      transition: none;
    }

    .panel:hover {
      transform: none;
    }

    .panel:hover .panel__header .title {
      filter: none;
      transform: none;
    }

    .panel:hover .kpi-ring {
      filter: none;
      transform: none;
    }

    .panel:hover .ring-score {
      transform: none;
    }

    .ring-score {
      transition: none;
    }

    .kpi-ring {
      transition: none;
    }

    .row {
      transition:
        background-color 0.2s,
        opacity 0.2s,
        box-shadow 0.2s,
        border-color 0.2s;
    }

    .row:hover {
      transform: none;
    }

    .row::before {
      display: none;
    }

    .row:active {
      transform: none;
    }

    .panel::before,
    .ring-score {
      animation: none;
    }

    .panel::after {
      opacity: 0.12;
    }
  }
</style>
