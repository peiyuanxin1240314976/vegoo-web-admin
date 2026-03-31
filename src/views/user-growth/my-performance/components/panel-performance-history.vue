<template>
  <div class="panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="panel__header">
          <ElSkeletonItem variant="text" class="hist-sk-title" />
        </div>
        <div class="panel__body">
          <div class="timeline-scroll hist-sk-scroll">
            <div class="hist-sk-nodes">
              <div v-for="i in 5" :key="i" class="hist-sk-node">
                <ElSkeletonItem variant="circle" class="hist-sk-dot" />
                <ElSkeletonItem variant="text" class="hist-sk-label" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="panel__header">
          <span class="title">{{ title }}</span>
        </div>
        <div class="panel__body">
          <div class="timeline-scroll">
            <div class="timeline">
              <div
                v-for="(it, idx) in list"
                :key="it.period + '_' + idx"
                class="node"
                :class="[
                  {
                    'is-active': idx === activeIndex,
                    'is-first': idx === 0,
                    'is-last': idx === list.length - 1
                  }
                ]"
                :style="nodeStyle(it)"
              >
                <span v-if="idx === activeIndex" class="active-star">
                  <ElIcon><StarFilled /></ElIcon>
                </span>

                <span class="dot" aria-hidden="true"></span>
                <span class="label">[{{ it.score }}]{{ it.period }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { StarFilled } from '@element-plus/icons-vue'
  import type { MyPerformanceHistoryItem } from '../types'

  defineOptions({ name: 'MyPerformancePanelPerformanceHistory' })

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      title: string
      list: MyPerformanceHistoryItem[]
      activePeriod?: string
    }>(),
    { loading: false, list: () => [] }
  )

  const activeIndex = computed(() => {
    if (!props.list.length) return -1
    if (props.activePeriod) {
      const idx = props.list.findIndex((x) => x.period === props.activePeriod)
      if (idx >= 0) return idx
    }
    return props.list.length - 1
  })

  const COLOR_PALETTE = [
    'rgb(34 211 238 / 95%)', // cyan
    'rgb(16 185 129 / 95%)', // green
    'rgb(59 130 246 / 95%)', // blue
    'rgb(249 115 22 / 95%)', // orange
    'rgb(244 63 94 / 95%)', // rose
    'rgb(168 85 247 / 95%)', // purple
    'rgb(245 158 11 / 95%)' // amber
  ]

  function hashStringToIndex(input: string, mod: number) {
    let h = 5381
    for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i)
    return Math.abs(h) % mod
  }

  function nodeStyle(it: MyPerformanceHistoryItem) {
    const key = it.period || String(it.score)
    const color = COLOR_PALETTE[hashStringToIndex(key, COLOR_PALETTE.length)] || COLOR_PALETTE[0]
    return {
      '--node-color': color,
      '--node-line-color': color
    } as Record<string, string>
  }
</script>

<style scoped lang="scss">
  @use '../styles/mp-card-fx.scss' as *;

  .panel {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px) saturate(1.1);
    border: 1px solid rgb(63 63 70 / 42%);
    border-radius: 16px;

    @include mp-neon-stack;
    @include mp-card-mesh;
    @include mp-panel-hover-lift;
    @include mp-panel-header-title-hover;

    &::before {
      position: absolute;
      right: -25%;
      bottom: -35%;
      z-index: 0;
      width: 65%;
      height: 75%;
      pointer-events: none;
      content: '';
      background: radial-gradient(circle at 60% 60%, rgb(168 85 247 / 10%) 0%, transparent 62%);
      animation: history-panel-orb 9s ease-in-out infinite alternate;
    }
  }

  @keyframes history-panel-orb {
    0% {
      opacity: 0.45;
      transform: translate(0, 0) scale(1);
    }

    100% {
      opacity: 0.95;
      transform: translate(-6%, -4%) scale(1.06);
    }
  }

  .panel__header {
    position: relative;
    z-index: 1;
    padding: 12px 16px;
    border-bottom: 1px solid rgb(63 63 70 / 30%);
  }

  .title {
    font-size: 14px;

    @include mp-title-gradient;
  }

  .hist-sk-title {
    width: 36% !important;
    height: 16px !important;
  }

  .hist-sk-scroll {
    min-height: 72px;
  }

  .hist-sk-nodes {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
    padding: 8px 4px 4px;
    overflow: hidden;
  }

  .hist-sk-node {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    min-width: 72px;
  }

  .hist-sk-dot {
    width: 14px !important;
    height: 14px !important;
  }

  .hist-sk-label {
    width: 64px !important;
    height: 12px !important;
  }

  .panel__body {
    position: relative;
    z-index: 1;
    padding: 12px 14px 14px;
  }

  .timeline-scroll {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding-top: 22px;
    padding-bottom: 4px;
    overflow: auto visible;
    -webkit-overflow-scrolling: touch;
  }

  .timeline {
    position: relative;
    display: flex;
    gap: 0;
    align-items: center;
    min-width: max-content;
    padding: 14px 10px;
    overflow: hidden;
    background:
      radial-gradient(ellipse 70% 80% at 50% 0%, rgb(59 130 246 / 8%) 0%, transparent 55%),
      linear-gradient(145deg, rgb(39 39 42 / 42%), rgb(24 24 27 / 55%));
    border: 1px solid rgb(72 72 80 / 42%);
    border-radius: 14px;
    box-shadow:
      inset 0 1px 0 rgb(244 244 245 / 6%),
      0 4px 20px rgb(0 0 0 / 15%);
    transition:
      border-color 0.35s var(--ease-out),
      box-shadow 0.35s var(--ease-out);
  }

  .panel:hover .timeline {
    border-color: rgb(96 165 250 / 35%);
    box-shadow:
      inset 0 1px 0 rgb(244 244 245 / 8%),
      0 8px 28px rgb(0 0 0 / 22%),
      0 0 32px rgb(59 130 246 / 8%);
  }

  .node {
    position: relative;
    display: grid;

    --dot-row-height: 18px;
    --line-height: 3px;

    grid-template-rows: var(--dot-row-height) 14px;
    gap: 8px;
    place-items: center center;
    min-width: 88px;
    padding: 0 10px;
    transition: transform var(--duration-fast) var(--ease-default);

    &:hover {
      transform: translateY(-3px);
    }
  }

  .node::before {
    position: absolute;
    top: calc(var(--dot-row-height) / 2);
    left: -50%;
    width: 100%;
    height: var(--line-height);
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--node-line-color, rgb(244 244 245 / 18%)) 32%,
      rgb(255 255 255 / 45%) 50%,
      var(--node-line-color, rgb(244 244 245 / 18%)) 68%,
      transparent 100%
    );
    background-size: 220% 100%;
    border-radius: 9999px;
    opacity: 0.55;
    transform: translateY(-50%);
    animation: timeline-flow 2.4s linear infinite;
  }

  @keyframes timeline-flow {
    0% {
      background-position: 100% 0;
    }

    100% {
      background-position: -100% 0;
    }
  }

  .node.is-first::before {
    display: none;
  }

  .dot {
    position: relative;
    z-index: 1;
    width: 10px;
    height: 10px;
    background: var(--node-color, rgb(161 161 170 / 65%));
    border-radius: 9999px;
    box-shadow:
      0 0 0 3px rgb(24 24 27 / 60%),
      0 0 10px var(--node-color, rgb(161 161 170 / 25%));
    transition:
      transform var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default);
  }

  .node:hover .dot {
    box-shadow:
      0 0 0 3px rgb(24 24 27 / 60%),
      0 0 18px var(--node-color, rgb(161 161 170 / 45%));
    transform: scale(1.2);
  }

  .node.is-active .dot {
    width: 13px;
    height: 13px;
    box-shadow:
      0 0 0 4px rgb(24 24 27 / 55%),
      0 0 0 8px rgb(244 244 245 / 8%),
      0 0 22px var(--node-color, rgb(16 185 129 / 40%));
  }

  .node.is-active .dot::after {
    position: absolute;
    inset: -8px;
    content: '';
    border: 1px solid var(--node-color, rgb(16 185 129 / 50%));
    border-radius: 9999px;
    animation: node-ripple 1.9s ease-out infinite;
  }

  @keyframes node-ripple {
    0% {
      opacity: 0.65;
      transform: scale(0.65);
    }

    100% {
      opacity: 0;
      transform: scale(2.4);
    }
  }

  .label {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--node-color, rgb(161 161 170 / 88%));
    white-space: nowrap;
    opacity: 0.9;
  }

  .active-star {
    position: absolute;
    top: -22px;
    left: 50%;
    z-index: 2;
    color: var(--node-color, var(--art-success));
    filter: drop-shadow(0 0 8px var(--node-color, rgb(16 185 129 / 40%)));
    transform: translateX(-50%);
    animation: star-pulse 2s ease-in-out infinite;
  }

  @keyframes star-pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 6px var(--node-color, rgb(16 185 129 / 35%)));
      opacity: 0.85;
    }

    50% {
      filter: drop-shadow(0 0 12px var(--node-color, rgb(16 185 129 / 55%)));
      opacity: 1;
    }
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

    .panel::before {
      animation: none;
    }

    .panel::after {
      opacity: 0.12;
    }

    .timeline {
      transition: none;
    }

    .node::before,
    .node.is-active .dot::after,
    .active-star {
      animation: none;
    }

    .node.is-active .dot::after {
      opacity: 0.35;
      transform: scale(1.2);
    }
  }
</style>
