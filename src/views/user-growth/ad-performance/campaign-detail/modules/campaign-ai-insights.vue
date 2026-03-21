<template>
  <ElCard class="cai" shadow="never">
    <template #header>
      <div class="cai__header">
        <span class="cai__title">AI洞察与建议</span>
        <el-icon class="cai__brain-icon"
          ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M9.5 3a4.5 4.5 0 0 1 4.495 4.301L14 7.5h.5a3.5 3.5 0 0 1 .206 6.994L14.5 14.5h-.5v5a1 1 0 0 1-2 0v-5H9.5v5a1 1 0 0 1-2 0v-5H7a3.5 3.5 0 0 1-.204-6.994L6.5 7.5h.5a4.5 4.5 0 0 1 2.5-4.422V3Z"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg
        ></el-icon>
      </div>
    </template>

    <div class="cai__list">
      <div v-for="item in insights" :key="item.id" class="cai__item">
        <div class="cai__item-icon" :class="`cai__item-icon--${item.level}`">
          <el-icon v-if="item.level === 'danger'"><Warning /></el-icon>
          <el-icon v-else-if="item.level === 'warning'"><InfoFilled /></el-icon>
          <el-icon v-else><SuccessFilled /></el-icon>
        </div>
        <div class="cai__item-body">
          <div class="cai__item-title" :class="`cai__item-title--${item.level}`">{{
            item.title
          }}</div>
          <div class="cai__item-content">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { Warning, InfoFilled, SuccessFilled } from '@element-plus/icons-vue'
  import type { AiInsightItem } from '../types'

  defineOptions({ name: 'CampaignAiInsights' })

  withDefaults(
    defineProps<{
      insights?: AiInsightItem[]
    }>(),
    { insights: () => [] }
  )
</script>

<style scoped lang="scss">
  .cai {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 14px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 10px 14px 12px;
    }
  }

  .cai__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cai__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .cai__brain-icon {
    font-size: 18px;
    color: var(--art-primary);
    opacity: 0.7;
  }

  .cai__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .cai__item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px;
    background: color-mix(in srgb, var(--default-border) 30%, transparent);
    border-radius: 8px;
  }

  .cai__item-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 16px;
    border-radius: 50%;

    &--info {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 15%, transparent);
    }

    &--warning {
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 15%, transparent);
    }

    &--danger {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 15%, transparent);
    }
  }

  .cai__item-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .cai__item-title {
    font-size: 12px;
    font-weight: 600;

    &--info {
      color: var(--art-success);
    }

    &--warning {
      color: var(--art-warning);
    }

    &--danger {
      color: var(--art-danger);
    }
  }

  .cai__item-content {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
</style>
