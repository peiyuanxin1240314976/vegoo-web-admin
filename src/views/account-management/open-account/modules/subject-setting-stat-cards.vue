<template>
  <div class="subject-stats">
    <article
      v-for="card in cards"
      :key="card.key"
      class="subject-stats__card"
      :class="`subject-stats__card--${card.key}`"
    >
      <p class="subject-stats__label">{{ card.label }}</p>
      <strong class="subject-stats__value">{{ card.value }}</strong>
      <span class="subject-stats__hint">{{ card.hint }}</span>
    </article>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { SubjectSettingStats } from '../types'

  defineOptions({ name: 'SubjectSettingStatCards' })

  const props = defineProps<{
    stats: SubjectSettingStats
  }>()

  const cards = computed(() => [
    {
      key: 'total',
      label: '主体总数',
      value: props.stats.total,
      hint: '当前纳入配置管理的主体数量'
    },
    {
      key: 'facebook',
      label: 'Facebook 已启用',
      value: props.stats.facebookEnabled,
      hint: '适合快速查看平台开通覆盖面'
    },
    {
      key: 'tiktok',
      label: 'TikTok 已启用',
      value: props.stats.tiktokEnabled,
      hint: '便于识别投放资源是否就绪'
    },
    {
      key: 'both',
      label: '双平台可用',
      value: props.stats.bothEnabled,
      hint: '同一主体可跨平台复用时重点关注'
    }
  ])
</script>

<style lang="scss" scoped>
  .subject-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .subject-stats__card {
    padding: 18px 20px;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 86%, transparent),
        color-mix(in srgb, var(--default-box-color) 72%, transparent)
      ),
      color-mix(in srgb, var(--default-box-color) 82%, transparent);
    backdrop-filter: blur(14px);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 22px;
    box-shadow:
      0 16px 40px rgb(0 0 0 / 20%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
  }

  .subject-stats__card--facebook {
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--art-primary) 12%, transparent),
        color-mix(in srgb, var(--default-box-color) 92%, transparent)
      ),
      color-mix(in srgb, var(--default-box-color) 82%, transparent);
  }

  .subject-stats__card--tiktok {
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--theme-color) 12%, transparent),
        color-mix(in srgb, var(--default-box-color) 92%, transparent)
      ),
      color-mix(in srgb, var(--default-box-color) 82%, transparent);
  }

  .subject-stats__card--both {
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--theme-color) 10%, transparent),
        color-mix(in srgb, var(--art-primary) 8%, transparent)
      ),
      color-mix(in srgb, var(--default-box-color) 82%, transparent);
  }

  .subject-stats__label,
  .subject-stats__hint {
    display: block;
  }

  .subject-stats__label {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .subject-stats__value {
    display: block;
    margin-bottom: 8px;
    font-size: 30px;
    line-height: 1;
    color: var(--text-primary);
  }

  .subject-stats__hint {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  @media (width <= 1080px) {
    .subject-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 640px) {
    .subject-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
