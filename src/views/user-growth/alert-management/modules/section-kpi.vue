<template>
  <div class="am-kpi">
    <article
      v-for="c in summaryCards"
      :key="c.id"
      class="am-kpi__card"
      :class="`is-accent-${c.accent}`"
    >
      <div class="am-kpi__top">
        <div class="am-kpi__meta">
          <div class="am-kpi__title">{{ c.title }}</div>
          <div class="am-kpi__value">{{ c.value }}</div>
          <div v-if="c.badge" class="am-kpi__badge-wrap">
            <span
              class="am-kpi__badge"
              :class="{
                'is-danger': c.accent === 'danger' && c.badge !== '启用中',
                'is-success': c.accent === 'success',
                'is-muted': c.badge === '启用中'
              }"
            >
              {{ c.badge }}
            </span>
          </div>
        </div>
        <div class="am-kpi__icon" aria-hidden="true">
          <ElIcon :size="22">
            <Bell v-if="c.icon === 'bell'" />
            <Clock v-else-if="c.icon === 'clock'" />
            <CircleCheck v-else-if="c.icon === 'check'" />
            <Setting v-else />
          </ElIcon>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
  import { Bell, Clock, CircleCheck, Setting } from '@element-plus/icons-vue'
  import type { AlertSummaryCard } from '../types'

  defineOptions({ name: 'AmSectionKpi' })

  defineProps<{
    summaryCards: AlertSummaryCard[]
  }>()
</script>

<style scoped lang="scss">
  .am-kpi {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    @media (width <= 1200px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (width <= 600px) {
      grid-template-columns: 1fr;
    }
  }

  .am-kpi__card {
    padding: 14px 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-left-width: 4px;
    border-radius: 12px;

    &.is-accent-danger {
      border-left-color: var(--art-danger);
    }

    &.is-accent-warning {
      border-left-color: var(--art-warning);
    }

    &.is-accent-success {
      border-left-color: var(--art-success);
    }

    &.is-accent-primary {
      border-left-color: var(--art-primary);
    }
  }

  .am-kpi__top {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .am-kpi__meta {
    min-width: 0;
  }

  .am-kpi__title {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .am-kpi__value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--art-gray-900);
  }

  .am-kpi__badge-wrap {
    margin-top: 6px;
  }

  .am-kpi__badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 9999px;

    &.is-danger {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 14%, transparent);
    }

    &.is-success {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 14%, transparent);
    }

    &.is-muted {
      color: var(--art-primary);
      background: color-mix(in srgb, var(--art-primary) 14%, transparent);
    }
  }

  .am-kpi__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: var(--art-gray-900);
    background: color-mix(in srgb, var(--art-gray-600) 12%, transparent);
    border-radius: 12px;
  }

  .is-accent-danger .am-kpi__icon {
    color: var(--art-danger);
    background: color-mix(in srgb, var(--art-danger) 18%, transparent);
  }

  .is-accent-warning .am-kpi__icon {
    color: var(--art-warning);
    background: color-mix(in srgb, var(--art-warning) 18%, transparent);
  }

  .is-accent-success .am-kpi__icon {
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 18%, transparent);
  }

  .is-accent-primary .am-kpi__icon {
    color: var(--art-primary);
    background: color-mix(in srgb, var(--art-primary) 18%, transparent);
  }
</style>
