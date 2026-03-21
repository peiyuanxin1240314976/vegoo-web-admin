<template>
  <ElCard class="cct5" shadow="never">
    <template #header>
      <div class="cct5__header">
        <span class="cct5__title">素材表现Top5</span>
        <button type="button" class="cct5__more">查看更多</button>
      </div>
    </template>

    <div class="cct5__grid">
      <div v-for="item in items" :key="item.id" class="cct5__item">
        <div class="cct5__thumb">
          <!-- 占位图（灰色渐变背景模拟视频缩略图） -->
          <div class="cct5__img-placeholder">
            <div class="cct5__play-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="rgba(0,0,0,0.55)" />
                <path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="white" />
              </svg>
            </div>
          </div>
          <div class="cct5__overlay">
            <span class="cct5__roi"
              >ROI: <em>{{ item.roi }}%</em></span
            >
            <span class="cct5__ctr">CTR: {{ item.ctr }}</span>
          </div>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { CreativeTop5Item } from '../types'

  defineOptions({ name: 'CampaignCreativeTop5' })

  withDefaults(
    defineProps<{
      items?: CreativeTop5Item[]
    }>(),
    { items: () => [] }
  )
</script>

<style scoped lang="scss">
  .cct5 {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 14px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 10px;
    }
  }

  .cct5__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cct5__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .cct5__more {
    font-size: 12px;
    color: var(--art-primary);
    cursor: pointer;
    background: transparent;
    border: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .cct5__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .cct5__item {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 8px;

    &:hover .cct5__img-placeholder {
      transform: scale(1.03);
    }
  }

  .cct5__thumb {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
  }

  .cct5__img-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--art-primary) 25%, var(--default-box-color)),
      color-mix(in srgb, var(--art-success) 20%, var(--default-box-color))
    );
    transition: transform 0.2s ease;
  }

  .cct5__play-btn {
    position: relative;
    z-index: 1;
  }

  .cct5__overlay {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px;
    font-size: 11px;
    background: linear-gradient(to top, rgb(0 0 0 / 70%), transparent);
    border-radius: 0 0 8px 8px;
  }

  .cct5__roi {
    font-weight: 500;
    color: #fff;

    em {
      font-style: normal;
      font-weight: 700;
      color: #4ade80;
    }
  }

  .cct5__ctr {
    color: rgb(255 255 255 / 80%);
  }
</style>
