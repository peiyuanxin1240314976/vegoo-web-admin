<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>Waterfall 配置</span>
    </template>
    <div class="waterfall-list">
      <div
        v-for="(level, index) in levels"
        :key="index"
        class="waterfall-item"
        :class="{ 'waterfall-item--last': index === levels.length - 1 }"
      >
        <span class="waterfall-priority">Level {{ level.priority }}</span>
        <span class="waterfall-name">{{ level.name }}</span>
        <span v-if="level.ecpm !== '-'" class="waterfall-meta"
          >eCPM: {{ level.ecpm }}, Fill Rate: {{ level.fillRate }}</span
        >
        <span v-else class="waterfall-meta">Fill Rate: {{ level.fillRate }}</span>
      </div>
    </div>
    <div class="waterfall-footer">
      <span class="waterfall-total">总填充率: 100%</span>
      <ElButton type="primary" size="small">编辑 Waterfall</ElButton>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { MonetizationWaterfallLevel } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationWaterfallConfig' })

  const props = withDefaults(defineProps<{ data?: MonetizationWaterfallLevel[] }>(), {
    data: () => []
  })

  const levels = computed(() =>
    props.data?.length ? props.data : MOCK_MONETIZATION_ANALYSIS.waterfallLevels
  )
</script>

<style scoped lang="scss">
  .monetization-panel {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .waterfall-list {
    margin-bottom: 12px;
  }

  .waterfall-item {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    &--last .waterfall-name {
      color: var(--el-text-color-secondary);
    }
  }

  .waterfall-priority {
    min-width: 56px;
    font-weight: 500;
    color: var(--el-color-primary);
  }

  .waterfall-name {
    flex: 1;
    min-width: 120px;
  }

  .waterfall-meta {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .waterfall-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);

    .waterfall-total {
      font-size: 13px;
      font-weight: 500;
    }
  }
</style>
