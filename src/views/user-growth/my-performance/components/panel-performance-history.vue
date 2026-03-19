<template>
  <div class="panel">
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
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { StarFilled } from '@element-plus/icons-vue'
  import type { MyPerformanceHistoryItem } from '../types'

  defineOptions({ name: 'MyPerformancePanelPerformanceHistory' })

  const props = withDefaults(
    defineProps<{
      title: string
      list: MyPerformanceHistoryItem[]
      activePeriod?: string
    }>(),
    { list: () => [] }
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
  .panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .panel__header {
    padding: 10px 14px;
    border-bottom: 1px solid var(--default-border);
  }

  .title {
    font-size: 14px;
    font-weight: 650;
    color: var(--art-gray-900);
  }

  .panel__body {
    padding: 12px 14px 14px;
  }

  .timeline-scroll {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding-top: 18px;
    padding-bottom: 4px;
    overflow: auto visible;
    -webkit-overflow-scrolling: touch;
  }

  .timeline {
    display: flex;
    gap: 0;
    align-items: center;
    min-width: max-content;
    padding: 12px 8px;
    background: rgb(39 39 42 / 18%);
    border: 1px solid rgb(39 39 42 / 40%);
    border-radius: 14px;
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
  }

  .node::before {
    position: absolute;
    top: calc(var(--dot-row-height) / 2);
    left: -50%;
    width: 100%;
    height: var(--line-height);
    content: '';
    background: var(--node-line-color, rgb(244 244 245 / 14%));
    opacity: 0.35;
    transform: translateY(-50%);
  }

  .node.is-first::before {
    display: none;
  }

  .dot {
    width: 10px;
    height: 10px;
    background: var(--node-color, rgb(161 161 170 / 65%));
    border-radius: 9999px;
    box-shadow: 0 0 0 4px rgb(24 24 27 / 55%);
  }

  .node.is-active .dot {
    width: 12px;
    height: 12px;
    box-shadow:
      0 0 0 4px rgb(24 24 27 / 55%),
      0 0 0 9px rgb(244 244 245 / 10%);
  }

  .label {
    font-size: 12px;
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
    filter: drop-shadow(0 2px 8px rgb(0 0 0 / 25%));
    transform: translateX(-50%);
  }
</style>
