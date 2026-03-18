<template>
  <div class="ad-performance-alerts">
    <ElCard class="ad-performance-alerts__card" shadow="never">
      <template #header>
        {{ tr('adPerformance.alerts', '异常预警') }}
        <span v-if="alerts.length" class="ad-performance-alerts__count"
          >({{ alerts.length }}项)</span
        >
      </template>
      <ul v-if="alerts.length" class="ad-performance-alerts__list">
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
      <div v-else class="ad-performance-alerts__empty">
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
    }>(),
    { alerts: () => [] }
  )

  defineEmits<{
    (e: 'action', item: AdPerformanceAlertItem): void
  }>()
</script>

<style scoped lang="scss">
  .ad-performance-alerts {
    margin-bottom: 16px;
  }

  .ad-performance-alerts__card {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .ad-performance-alerts__count {
    margin-left: 4px;
    font-size: 12px;
    font-weight: normal;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-alerts__list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ad-performance-alerts__item {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--default-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .ad-performance-alerts__title {
    flex-shrink: 0;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .ad-performance-alerts__desc {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--art-warning);
  }

  .ad-performance-alerts__empty {
    padding: 16px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
</style>
