<template>
  <div class="panel">
    <div class="panel__header">
      <span class="title">{{ title }}</span>
    </div>
    <div class="panel__body">
      <div class="kpi-ring">
        <ElProgress
          type="circle"
          :percentage="achievement.score"
          :stroke-width="10"
          :width="140"
          :color="ringColor"
        >
          <template #default>
            <div class="ring-center">
              <div class="ring-score">{{ achievement.score }}%</div>
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
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { MyPerformanceKpiAchievement } from '../types'

  defineOptions({ name: 'MyPerformancePanelKpiAchievement' })

  const props = withDefaults(
    defineProps<{
      title: string
      achievement: MyPerformanceKpiAchievement
      colLabel?: string
      colTarget?: string
      colActual?: string
      colRate?: string
      colScore?: string
    }>(),
    {
      colLabel: '指标',
      colTarget: '目标',
      colActual: '实际',
      colRate: '达成率',
      colScore: '评分'
    }
  )

  const ringColor = computed(() => {
    const v = props.achievement.score
    if (v >= 90) return 'var(--art-success)'
    if (v >= 80) return 'var(--art-primary)'
    return 'var(--art-warning)'
  })

  const colLabel = computed(() => props.colLabel)
  const colTarget = computed(() => props.colTarget)
  const colActual = computed(() => props.colActual)
  const colRate = computed(() => props.colRate)
  const colScore = computed(() => props.colScore)
</script>

<style scoped lang="scss">
  .panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .panel__header {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--default-border);
  }

  .title {
    font-size: 14px;
    font-weight: 650;
    color: var(--art-gray-900);
  }

  .panel__body {
    padding: 14px;
  }

  .kpi-ring {
    display: grid;
    place-items: center;
    margin-bottom: 12px;
  }

  .ring-center {
    display: grid;
    gap: 2px;
    place-items: center;
  }

  .ring-score {
    font-size: 22px;
    font-weight: 750;
    color: rgb(148 163 184 / 92%);
  }

  .ring-sub {
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .breakdown {
    font-size: 13px;
  }

  .head,
  .row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 0.8fr 0.7fr;
    gap: 10px;
    align-items: center;
  }

  .head {
    padding-bottom: 8px;
    margin-bottom: 8px;
    color: var(--art-gray-600);
    border-bottom: none;
  }

  .row {
    padding: 6px 0;
    color: var(--art-gray-900);
    opacity: 0.9;
  }

  .cell--label {
    color: var(--art-gray-900);
    opacity: 0.85;
  }
</style>
