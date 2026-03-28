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
  @import '../../styles/ap-card-fx';

  .cai {
    position: relative;
    overflow: hidden;
    background-color: rgb(8 6 18 / 98%);
    background-image:
      radial-gradient(
        ellipse 95% 60% at 100% -8%,
        rgb(139 92 246 / 38%) 0%,
        rgb(168 85 247 / 16%) 35%,
        transparent 55%
      ),
      radial-gradient(ellipse 65% 50% at -5% 108%, rgb(59 130 246 / 28%) 0%, transparent 52%),
      radial-gradient(ellipse 45% 38% at 80% 100%, rgb(236 72 153 / 18%) 0%, transparent 50%),
      linear-gradient(158deg, rgb(22 12 46 / 92%) 0%, rgb(8 6 18 / 96%) 50%, rgb(6 6 24 / 88%) 100%);
    border-color: rgb(139 92 246 / 35%);
    border-radius: 14px;
    box-shadow:
      0 12px 48px rgb(0 0 0 / 52%),
      0 0 0 1px rgb(139 92 246 / 12%),
      inset 0 1px 0 rgb(196 181 253 / 14%),
      0 0 32px rgb(139 92 246 / 14%);
    transition:
      transform 0.38s var(--ease-out),
      box-shadow 0.42s var(--ease-out),
      border-color 0.32s var(--ease-default);

    &:hover {
      border-color: rgb(167 139 250 / 65%);
      box-shadow:
        0 24px 72px rgb(0 0 0 / 52%),
        0 0 0 1px rgb(167 139 250 / 25%),
        inset 0 1px 0 rgb(196 181 253 / 18%),
        0 0 72px rgb(139 92 246 / 28%),
        0 0 120px rgb(168 85 247 / 14%);
      transform: translateY(-6px);
    }

    /* 顶部紫色 AI 光线 */
    &::before {
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
        rgb(139 92 246 / 80%),
        rgb(236 72 153 / 75%),
        rgb(96 165 250 / 65%),
        transparent
      );
      filter: blur(0.5px);
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 12px;
      background: transparent;
      border-bottom: 1px solid rgb(139 92 246 / 22%);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 16px;
      background: transparent;
    }
  }

  .cai__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cai__title {
    display: inline-block;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.03em;
    background-color: transparent;
    background-image: linear-gradient(92deg, #f0f9ff 0%, #c4b5fd 40%, #f0abfc 80%, #818cf8 100%);
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 100%;
    -webkit-text-fill-color: transparent;
  }

  .cai__brain-icon {
    font-size: 18px;
    color: #a78bfa;
    filter: drop-shadow(0 0 8px rgb(139 92 246 / 60%));
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
    background: rgb(139 92 246 / 8%);
    border: 1px solid rgb(139 92 246 / 18%);
    border-radius: 8px;
    transition:
      background 0.22s ease,
      border-color 0.22s ease;

    &:hover {
      background: rgb(139 92 246 / 14%);
      border-color: rgb(167 139 250 / 35%);
    }
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
