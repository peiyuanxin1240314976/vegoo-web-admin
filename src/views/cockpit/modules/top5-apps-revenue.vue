<template>
  <ElCard class="cockpit-panel" shadow="never">
    <template #header>
      <span>收入 Top 5 Apps</span>
      <ElButton type="primary" link size="small">查看更多</ElButton>
    </template>
    <div class="app-list">
      <div v-for="(item, index) in list" :key="index" class="app-row">
        <div class="app-icon">{{ item.name.slice(0, 1) }}</div>
        <div class="app-info">
          <span class="app-name">{{ item.name }}</span>
          <span class="app-revenue">${{ item.revenue }} | ROAS {{ item.roas }}</span>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CockpitTop5AppItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitTop5AppsRevenue' })

  const props = withDefaults(defineProps<{ list?: CockpitTop5AppItem[] }>(), { list: () => [] })

  const list = computed(() => (props.list?.length ? props.list : MOCK_COCKPIT_OVERVIEW.top5Apps))
</script>

<style scoped lang="scss">
  .cockpit-panel {
    height: 100%;

    :deep(.el-card__header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .app-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .app-row {
    display: flex;
    gap: 10px;
    align-items: center;

    .app-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-radius: 8px;
    }

    .app-info {
      display: flex;
      flex-direction: column;

      .app-name {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }

      .app-revenue {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
