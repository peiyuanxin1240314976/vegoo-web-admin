<template>
  <div class="ad-performance-alerts">
    <ElCard class="ad-performance-alerts__card" shadow="never">
      <template #header>
        <span class="ad-performance-alerts__card-title">
          {{ tr('adPerformance.alerts', '异常预警') }}
        </span>
        <span v-if="!loading && alerts.length" class="ad-performance-alerts__count">
          ({{ alerts.length }}项)
        </span>
      </template>

      <!-- 骨架态 -->
      <div v-if="loading" class="ad-performance-alerts__sk-list">
        <div v-for="i in 3" :key="i" class="alert-sk-item">
          <ElSkeletonItem variant="circle" class="alert-sk-item__dot" />
          <div class="alert-sk-item__body">
            <ElSkeletonItem variant="text" class="alert-sk-item__title" />
            <ElSkeletonItem variant="text" class="alert-sk-item__desc" />
          </div>
          <ElSkeletonItem variant="button" class="alert-sk-item__btn" />
        </div>
      </div>

      <ul v-else-if="alerts.length" class="ad-performance-alerts__list">
        <li v-for="item in alerts" :key="item.id" class="ad-performance-alerts__item">
          <span class="ad-performance-alerts__title">{{ item.title }}</span>
          <span class="ad-performance-alerts__desc">{{ item.desc }}</span>
          <ElButton
            v-if="item.actionType === 'pause'"
            type="danger"
            size="small"
            round
            @click="$emit('action', { ...item, actionType: 'pause' })"
          >
            {{ tr('adPerformance.actionPause', '暂停') }}
          </ElButton>
          <ElButton
            v-else-if="item.actionType === 'view'"
            type="primary"
            size="small"
            round
            @click="$emit('action', { ...item, actionType: 'view' })"
          >
            {{ tr('adPerformance.actionView', '查看') }}
          </ElButton>
          <ElButton
            v-else
            type="warning"
            size="small"
            round
            @click="$emit('action', { ...item, actionType: 'optimize' })"
          >
            {{ tr('adPerformance.actionOptimize', '优化') }}
          </ElButton>
        </li>
      </ul>
      <div v-else-if="!loading" class="ad-performance-alerts__empty">
        {{ tr('adPerformance.noAlerts', '暂无异常预警') }}
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import type { AdPerformanceAlertItem } from '../types'

  defineOptions({ name: 'AdPerformanceAlerts' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  withDefaults(
    defineProps<{
      alerts: AdPerformanceAlertItem[]
      loading?: boolean
    }>(),
    { alerts: () => [], loading: false }
  )

  defineEmits<{
    (e: 'action', item: AdPerformanceAlertItem): void
  }>()
</script>

<style scoped lang="scss">
  @use '../styles/ap-card-fx.scss' as *;

  .ad-performance-alerts {
    margin-bottom: 16px;
  }

  .ad-performance-alerts__card {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    overflow: hidden;
    border-radius: 12px;

    /* 顶部危险主题高亮线 */
    &::after {
      position: absolute;
      top: 0;
      left: 5%;
      z-index: 0;
      width: 90%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(239 68 68 / 75%),
        rgb(249 115 22 / 85%),
        rgb(251 191 36 / 65%),
        transparent
      );
      filter: blur(0.5px);
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      font-size: 15px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      letter-spacing: 0.03em;
      background: transparent;
      border-bottom: 1px solid rgb(63 63 70 / 35%);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      background: transparent;
    }
  }

  .ad-performance-alerts__card-title {
    @include ap-title-gradient;

    font-size: 15px;
    font-weight: 700;
  }

  .ad-performance-alerts__count {
    margin-left: 4px;
    font-size: 12px;
    font-weight: 700;
    color: #ef4444;
    text-shadow:
      0 0 6px #ef4444,
      0 0 14px rgb(239 68 68 / 55%),
      0 0 28px rgb(239 68 68 / 28%);
  }

  /* 骨架 */
  .ad-performance-alerts__sk-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 2px 0;
  }

  .alert-sk-item {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px 8px;
    border-radius: 10px;
  }

  .alert-sk-item__dot {
    flex-shrink: 0;
    width: 24px !important;
    height: 24px !important;
    border-radius: 50% !important;
  }

  .alert-sk-item__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .alert-sk-item__title {
    width: 55% !important;
    height: 12px !important;
    border-radius: 6px !important;
  }

  .alert-sk-item__desc {
    width: 85% !important;
    height: 10px !important;
    border-radius: 6px !important;
  }

  .alert-sk-item__btn {
    flex-shrink: 0;
    width: 52px !important;
    height: 26px !important;
    border-radius: 9999px !important;
  }

  .ad-performance-alerts__list {
    max-height: 320px;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    list-style: none;
  }

  .ad-performance-alerts__item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 10px 8px;
    margin: 2px 0;
    border: 1px solid transparent;
    border-radius: 10px;
    transition:
      background-color 0.22s var(--ease-out),
      border-color 0.22s var(--ease-default),
      box-shadow 0.26s var(--ease-out);

    &:not(:last-child) {
      border-bottom-color: rgb(63 63 70 / 35%);
    }

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: linear-gradient(135deg, rgb(239 68 68 / 8%) 0%, rgb(249 115 22 / 5%) 100%);
      border-color: rgb(239 68 68 / 25%);
      box-shadow:
        0 4px 20px rgb(0 0 0 / 20%),
        0 0 0 1px rgb(239 68 68 / 10%);
    }
  }

  .ad-performance-alerts__title {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ad-performance-alerts__desc {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: var(--art-warning);
  }

  .ad-performance-alerts__empty {
    padding: 16px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .ad-performance-alerts__card {
      transition: none;

      &:hover {
        transform: none;
      }
    }

    .ad-performance-alerts__item {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }
</style>
