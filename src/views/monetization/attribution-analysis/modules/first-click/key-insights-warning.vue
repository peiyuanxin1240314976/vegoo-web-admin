<template>
  <div class="key-insights art-card">
    <ElIcon class="insight-icon"><WarningFilled /></ElIcon>
    <div class="insight-content">
      <p class="insight-text"><strong>关键洞察:</strong> {{ insight }}</p>
      <p v-if="suggestion" class="insight-suggestion"><strong>建议:</strong> {{ suggestion }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { WarningFilled } from '@element-plus/icons-vue'

  defineOptions({ name: 'KeyInsightsWarning' })

  withDefaults(
    defineProps<{
      insight?: string
      suggestion?: string
    }>(),
    {
      insight: 'TikTok在首次点击模型下显示35%更高的归因,说明其在吸引新用户方面的强大影响力。',
      suggestion: '考虑增加TikTok的品牌宣传预算。'
    }
  )
</script>

<style scoped lang="scss">
  .key-insights {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 16px;
    background: rgb(230 162 60 / 8%);
    border: 1px solid rgb(230 162 60 / 35%);
    border-radius: var(--el-border-radius-base);
  }

  .insight-icon {
    flex-shrink: 0;
    font-size: 20px;
    color: var(--el-color-warning);
  }

  .insight-content {
    flex: 1;
    min-width: 0;
  }

  .insight-text,
  .insight-suggestion {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }

  .insight-suggestion {
    margin-top: 6px;
  }

  strong {
    color: var(--el-text-color-primary);
  }

  html.dark .key-insights {
    background: rgb(230 162 60 / 12%);
    border-color: rgb(230 162 60 / 40%);
  }
</style>
