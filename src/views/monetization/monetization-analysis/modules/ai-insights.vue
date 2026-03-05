<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>AI 洞察与建议</span>
    </template>
    <div class="ai-insights-list">
      <div v-for="(item, index) in insights" :key="index" class="ai-insight-item">
        <div class="ai-insight-title">{{ item.title }}</div>
        <div class="ai-insight-content">{{ item.content }}</div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { MonetizationAiInsight } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationAiInsights' })

  const props = withDefaults(defineProps<{ data?: MonetizationAiInsight[] }>(), {
    data: () => []
  })

  const insights = computed(() =>
    props.data?.length ? props.data : MOCK_MONETIZATION_ANALYSIS.aiInsights
  )
</script>

<style scoped lang="scss">
  .monetization-panel {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .ai-insights-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ai-insight-item {
    padding: 12px;
    background: var(--el-fill-color-light);
    border-left: 3px solid var(--el-color-primary);
    border-radius: 8px;
  }

  .ai-insight-title {
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ai-insight-content {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  html.dark .ai-insight-item {
    background: var(--el-fill-color-darker);
  }
</style>
