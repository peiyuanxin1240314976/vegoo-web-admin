<template>
  <div class="top-card">
    <div class="left">
      <div class="avatar">{{ person.avatarLetter }}</div>
      <div class="info">
        <div class="name">{{ person.name }}</div>
        <div class="role">{{ person.role }}</div>
        <div class="apps">
          <span class="apps-label">{{ responsibleLabel }}</span>
          <span class="apps-list">{{ person.apps.join('，') }}</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="right">
      <div
        v-for="(k, idx) in kpis"
        :key="idx"
        class="kpi"
        :class="[
          k.type ? `is-${k.type}` : '',
          k.highlight ? `is-total-score is-score-${scoreTone(k.value)}` : ''
        ]"
      >
        <template v-if="k.highlight">
          <div class="score-card">
            <div class="score-card__label">{{ k.label }}</div>
            <div class="score-card__value">{{ k.value }}</div>
            <div class="score-card__badge" :class="`is-${scoreTone(k.value)}`">
              <ElIcon class="score-card__badge-icon"><StarFilled /></ElIcon>
              <span class="score-card__badge-text">{{ scoreLevelText(k.value) }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="kpi-card">
            <div class="kpi-label-row">
              <span class="kpi-label">{{ k.label }}</span>
              <span class="kpi-dot" :class="k.type ? `is-${k.type}` : 'is-default'"></span>
            </div>
            <div class="kpi-value">
              <span class="value">{{ k.value }}</span>
              <span v-if="k.sub" class="sub">{{ k.sub }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { StarFilled } from '@element-plus/icons-vue'
  import type { MyPerformancePersonOption, MyPerformanceTopKpiItem } from '../types'

  defineOptions({ name: 'MyPerformanceTopCard' })

  withDefaults(
    defineProps<{
      person: MyPerformancePersonOption
      kpis: MyPerformanceTopKpiItem[]
      responsibleLabel?: string
    }>(),
    { responsibleLabel: '负责' }
  )

  function parseScore(value: string) {
    const m = value.match(/(\d+(?:\.\d+)?)/)
    if (!m?.[1]) return undefined
    const n = Number(m[1])
    return Number.isFinite(n) ? n : undefined
  }

  function scoreTone(value: string) {
    const n = parseScore(value)
    if (n == null) return 'neutral'
    if (n >= 90) return 'good'
    if (n >= 80) return 'mid'
    return 'low'
  }

  function scoreLevelText(value: string) {
    const n = parseScore(value)
    if (n == null) return '—'
    if (n >= 90) return '优秀'
    if (n >= 80) return '良好'
    return '待提升'
  }
</script>

<style scoped lang="scss">
  .top-card {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 14px 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 14px;
  }

  .left {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 260px;
  }

  .avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 77%;
    min-height: 56px;
    aspect-ratio: 1 / 1;
    font-size: 20px;
    font-weight: 700;
    color: rgb(244 244 245 / 96%);
    background: rgb(16 185 129 / 85%);
    border-radius: 9999px;
  }

  .info {
    min-width: 0;
  }

  .name {
    font-size: 15px;
    font-weight: 750;
    color: var(--art-gray-900);
  }

  .role {
    margin-top: 2px;
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .apps {
    margin-top: 6px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .apps-label {
    margin-right: 4px;
  }

  .apps-list {
    color: rgb(244 244 245 / 70%);
    word-break: break-all;
  }

  .divider {
    align-self: stretch;
    width: 1px;
    background: rgb(39 39 42 / 70%);
  }

  .right {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 18px;
    align-items: center;
    min-width: 0;
  }

  .kpi {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-width: 0;
    height: 100%;
  }

  .kpi-label {
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .kpi-label-row {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
    height: 18px;
    margin-bottom: 6px;
  }

  .kpi-dot {
    flex: none;
    width: 10px;
    height: 10px;
    background: rgb(161 161 170 / 35%);
    border-radius: 9999px;
    box-shadow: 0 0 0 3px rgb(24 24 27 / 35%);
  }

  .kpi-dot.is-primary {
    background: rgb(96 165 250 / 95%);
    box-shadow: 0 0 0 3px rgb(96 165 250 / 18%);
  }

  .kpi-dot.is-success {
    background: rgb(16 185 129 / 95%);
    box-shadow: 0 0 0 3px rgb(16 185 129 / 18%);
  }

  .kpi-dot.is-warning {
    background: rgb(249 115 22 / 95%);
    box-shadow: 0 0 0 3px rgb(249 115 22 / 18%);
  }

  .kpi-value {
    display: flex;
    gap: 6px;
    align-items: baseline;
    min-height: 30px;
  }

  .kpi-card {
    display: grid;
    gap: 6px;
    align-content: center;
    height: 100%;
    min-height: 86px;
    padding: 10px 12px;
    background: linear-gradient(180deg, rgb(39 39 42 / 18%), rgb(24 24 27 / 14%));
    border: 1px solid rgb(39 39 42 / 38%);
    border-radius: 12px;
  }

  .value {
    font-size: 24px;
    font-weight: 800;
    color: rgb(148 163 184 / 92%);
    letter-spacing: 0.01em;
  }

  .sub {
    font-size: 13px;
    color: rgb(161 161 170 / 85%);
  }

  .kpi.is-primary .value {
    color: rgb(96 165 250 / 98%);
  }

  .kpi.is-success .value {
    color: rgb(16 185 129 / 98%);
  }

  .kpi.is-warning .value {
    color: rgb(249 115 22 / 98%);
  }

  .score-card {
    display: grid;
    gap: 6px;
    align-content: center;
    height: 100%;
    min-height: 86px;
    padding: 10px 12px;
    background: linear-gradient(180deg, rgb(39 39 42 / 40%), rgb(24 24 27 / 35%));
    border: 1px solid rgb(39 39 42 / 55%);
    border-radius: 12px;
  }

  .score-card__label {
    font-size: 13px;
    font-weight: 650;
    color: rgb(161 161 170 / 90%);
  }

  .score-card__value {
    font-size: 34px;
    font-weight: 850;
    line-height: 1.05;
    color: rgb(244 244 245 / 98%);
    letter-spacing: 0.01em;
  }

  .kpi.is-total-score.is-score-good .score-card__value {
    color: rgb(16 185 129 / 98%);
  }

  .kpi.is-total-score.is-score-mid .score-card__value {
    color: rgb(56 189 248 / 98%);
  }

  .kpi.is-total-score.is-score-low .score-card__value {
    color: rgb(249 115 22 / 98%);
  }

  .score-card__badge {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-self: start;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    color: rgb(244 244 245 / 85%);
    background: rgb(39 39 42 / 25%);
    border: 1px solid transparent;
    border-radius: 9999px;
  }

  .score-card__badge-icon {
    font-size: 14px;
  }

  .score-card__badge.is-good {
    color: rgb(16 185 129 / 95%);
    background: rgb(16 185 129 / 16%);
    border-color: rgb(16 185 129 / 30%);
  }

  .score-card__badge.is-mid {
    color: rgb(56 189 248 / 95%);
    background: rgb(56 189 248 / 16%);
    border-color: rgb(56 189 248 / 30%);
  }

  .score-card__badge.is-low {
    color: rgb(249 115 22 / 95%);
    background: rgb(249 115 22 / 16%);
    border-color: rgb(249 115 22 / 30%);
  }

  @media (width <= 1200px) {
    .top-card {
      flex-direction: column;
      align-items: stretch;
    }

    .divider {
      width: 100%;
      height: 1px;
    }

    .right {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
  }

  @media (width <= 768px) {
    .right {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
