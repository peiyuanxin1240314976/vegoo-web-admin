<template>
  <ElCard class="cockpit-panel" shadow="never">
    <template #header>
      <span>消耗节奏监控</span>
      <ElButton type="primary" link size="small">查看更多</ElButton>
    </template>
    <div class="pace-list">
      <div v-for="(item, index) in displayList" :key="index" class="pace-item">
        <div class="pace-name">{{ item.name }}</div>
        <ElProgress
          :percentage="item.percent"
          :stroke-width="8"
          :color="item.color ?? tagTypeColor[item.tagType]"
          :format="() => `${item.current}/${item.budget}`"
        />
        <ElTag size="small" :type="item.tagType">{{ item.status }}</ElTag>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CockpitSpendPaceItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitSpendPaceMonitor' })

  const props = withDefaults(defineProps<{ list?: CockpitSpendPaceItem[] }>(), { list: () => [] })

  const displayList = computed(() =>
    props.list.length ? props.list : MOCK_COCKPIT_OVERVIEW.spendPace
  )

  const tagTypeColor: Record<string, string> = {
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c'
  }
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

  .pace-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .pace-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: center;

    .pace-name {
      overflow: hidden;
      font-size: 13px;
      color: var(--el-text-color-regular);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-progress {
      min-width: 120px;
    }
  }
</style>
