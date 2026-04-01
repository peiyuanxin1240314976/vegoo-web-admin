<template>
  <div class="map-detail-stats-cards">
    <div v-for="card in cards" :key="card.label" class="stat-card" :class="card.bgClass">
      <div class="stat-label">{{ card.label }}</div>
      <div class="stat-value">{{ card.value }}</div>
      <div class="stat-compare" :class="card.compareUp ? 'up' : 'down'">
        {{ card.compare }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'MapDetailStatsCards' })

  export interface StatCardItem {
    label: string
    value: string
    compare: string
    compareUp: boolean
    bgClass: string
  }

  withDefaults(defineProps<{ cards?: StatCardItem[] }>(), { cards: () => [] })
</script>

<style scoped lang="scss">
  .map-detail-stats-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    position: relative;
    padding: 16px;
    overflow: hidden;
    color: #fff;
    border: 1px solid rgb(255 255 255 / 25%);
    border-radius: 10px;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    /* 透明背景装饰：圆（数据点）+ 趋势线，浅色模式 */
    &::before {
      position: absolute;
      top: -40px;
      right: -40px;
      width: 120px;
      height: 120px;
      pointer-events: none;
      content: '';
      background: rgb(255 255 255 / 8%);
      border-radius: 50%;
    }

    /* 高低不一的柱状装饰，暗示柱状图/数据 */
    &::after {
      position: absolute;
      bottom: 14px;
      left: 14px;
      width: 44px;
      height: 28px;
      pointer-events: none;
      content: '';
      background:
        linear-gradient(
            to top,
            transparent 45%,
            rgb(255 255 255 / 12%) 45%,
            rgb(255 255 255 / 12%) 100%
          )
          0 0 / 28% 100%,
        linear-gradient(
            to top,
            transparent 15%,
            rgb(255 255 255 / 12%) 15%,
            rgb(255 255 255 / 12%) 100%
          )
          36% 0 / 28% 100%,
        linear-gradient(
            to top,
            transparent 55%,
            rgb(255 255 255 / 12%) 55%,
            rgb(255 255 255 / 12%) 100%
          )
          72% 0 / 28% 100%;
      background-repeat: no-repeat;
      border-radius: 4px;
    }

    &:hover {
      box-shadow:
        0 14px 34px rgb(0 0 0 / 18%),
        0 0 0 1px rgb(255 255 255 / 10%);
    }

    .stat-label {
      position: relative;
      z-index: 1;
      margin-bottom: 6px;
      font-size: 12px;
      opacity: 0.9;
    }

    .stat-value {
      position: relative;
      z-index: 1;
      font-size: 20px;
      font-weight: 600;
    }

    .stat-compare {
      position: relative;
      z-index: 1;
      margin-top: 4px;
      font-size: 12px;

      &.up,
      &.down {
        opacity: 0.9;
      }
    }

    &.bg-green {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 14px rgb(16 185 129 / 35%);

      &:hover {
        box-shadow:
          0 12px 28px rgb(16 185 129 / 45%),
          0 4px 8px rgb(0 0 0 / 12%);
      }
    }

    &.bg-orange {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 14px rgb(245 158 11 / 35%);

      &:hover {
        box-shadow:
          0 12px 28px rgb(245 158 11 / 45%),
          0 4px 8px rgb(0 0 0 / 12%);
      }
    }

    &.bg-blue {
      background: linear-gradient(135deg, #3984f1 0%, #2563eb 100%);
      box-shadow: 0 4px 14px rgb(57 132 241 / 35%);

      &:hover {
        box-shadow:
          0 12px 28px rgb(57 132 241 / 45%),
          0 4px 8px rgb(0 0 0 / 12%);
      }
    }

    &.bg-purple {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      box-shadow: 0 4px 14px rgb(139 92 246 / 35%);

      &:hover {
        box-shadow:
          0 12px 28px rgb(139 92 246 / 45%),
          0 4px 8px rgb(0 0 0 / 12%);
      }
    }
  }

  /* 深色模式：装饰与边框略提高对比度 */
  :deep(html.dark) .stat-card {
    border-color: rgb(255 255 255 / 35%);
  }

  :deep(html.dark) .stat-card::before {
    background: rgb(255 255 255 / 12%);
  }

  :deep(html.dark) .stat-card::after {
    background:
      linear-gradient(
          to top,
          transparent 45%,
          rgb(255 255 255 / 16%) 45%,
          rgb(255 255 255 / 16%) 100%
        )
        0 0 / 28% 100%,
      linear-gradient(
          to top,
          transparent 15%,
          rgb(255 255 255 / 16%) 15%,
          rgb(255 255 255 / 16%) 100%
        )
        36% 0 / 28% 100%,
      linear-gradient(
          to top,
          transparent 55%,
          rgb(255 255 255 / 16%) 55%,
          rgb(255 255 255 / 16%) 100%
        )
        72% 0 / 28% 100%;
    background-repeat: no-repeat;
  }

  @media (width <= 1200px) {
    .map-detail-stats-cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 768px) {
    .map-detail-stats-cards {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
