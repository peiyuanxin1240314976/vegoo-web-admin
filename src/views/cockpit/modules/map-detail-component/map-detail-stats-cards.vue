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
    padding: 16px;
    color: #fff;
    border-radius: 10px;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    &:hover {
      animation: stat-card-bounce 0.4s ease-out forwards;
    }

    .stat-label {
      margin-bottom: 6px;
      font-size: 12px;
      opacity: 0.9;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
    }

    .stat-compare {
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

  @keyframes stat-card-bounce {
    0% {
      transform: translateY(0);
    }

    60% {
      transform: translateY(-10px);
    }

    100% {
      transform: translateY(-6px);
    }
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
