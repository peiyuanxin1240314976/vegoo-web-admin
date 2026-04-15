<template>
  <div class="cockpit-today-cards">
    <div v-for="card in safeCards" :key="card.key" class="cockpit-panel today-card">
      <div class="today-card__title">
        <span class="today-card__dot" />
        <span class="today-card__title-text">{{ card.title }}</span>
      </div>

      <div class="today-card__list">
        <div v-for="(row, idx) in card.items" :key="idx" class="today-card__row">
          <div class="today-card__left">
            <span class="today-card__bullet" />
            <span class="today-card__label">{{ row.label }}</span>
          </div>

          <div class="today-card__right">
            <span class="today-card__value">{{ row.valueText }}</span>
            <span v-if="row.changeText && row.trend" class="today-card__change" :class="row.trend">
              <ElIcon class="today-card__change-icon">
                <Top v-if="row.trend === 'up'" />
                <Bottom v-else />
              </ElIcon>
              {{ row.changeText }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Top, Bottom } from '@element-plus/icons-vue'
  import type { CockpitTodaySummaryCard } from '../types'

  defineOptions({ name: 'CockpitTodaySummaryCards' })

  const props = withDefaults(
    defineProps<{
      cards?: CockpitTodaySummaryCard[]
    }>(),
    { cards: () => [] }
  )

  const safeCards = computed(() => (Array.isArray(props.cards) ? props.cards : []))
</script>

<style scoped lang="scss">
  .cockpit-today-cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .today-card {
    min-width: 0;
    padding: 12px 14px;
    border-radius: 10px;
  }

  .today-card__title {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgb(148 163 184 / 18%);
  }

  .today-card__dot {
    width: 10px;
    height: 10px;
    background: var(--el-color-primary);
    border-radius: 9999px;
    box-shadow: 0 0 0 3px rgb(59 130 246 / 14%);
  }

  .today-card__title-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0.02em;
  }

  .today-card__list {
    display: grid;
    gap: 8px;
  }

  .today-card__row {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .today-card__left {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .today-card__bullet {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    background: rgb(148 163 184 / 60%);
    border-radius: 9999px;
  }

  .today-card__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .today-card__right {
    display: inline-flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    font-variant-numeric: tabular-nums;
  }

  .today-card__value {
    color: var(--el-text-color-primary);
  }

  .today-card__change {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-weight: 500;

    &.up {
      color: var(--el-color-success);
    }

    &.down {
      color: var(--el-color-danger);
    }
  }

  .today-card__change-icon {
    font-size: 14px;
  }

  @media (width <= 1200px) {
    .cockpit-today-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 768px) {
    .cockpit-today-cards {
      grid-template-columns: 1fr;
    }
  }
</style>
