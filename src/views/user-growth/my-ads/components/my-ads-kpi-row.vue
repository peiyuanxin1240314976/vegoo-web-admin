<template>
  <div class="my-ads-kpi-row" :class="{ 'is-embedded': embedded }">
    <div
      v-for="(item, index) in kpiList"
      :key="index"
      class="my-ads-kpi-item"
      :class="[item.type ? `my-ads-kpi-item--${item.type}` : '']"
    >
      <div class="kpi-label">{{ item.label }}</div>
      <div class="kpi-value-row">
        <span class="kpi-value">{{ item.value }}</span>
        <span v-if="item.trend === 'up'" class="kpi-trend up">
          <ElIcon><Top /></ElIcon>
          {{ item.sub }}
        </span>
        <span v-else-if="item.sub" class="kpi-sub">{{ item.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Top } from '@element-plus/icons-vue'
  import type { MyAdsKpiItem } from '../types'

  defineOptions({ name: 'MyAdsKpiRow' })

  withDefaults(
    defineProps<{
      kpiList?: MyAdsKpiItem[]
      embedded?: boolean
    }>(),
    { kpiList: () => [], embedded: false }
  )
</script>

<style lang="scss" scoped>
  @use '../styles/my-ads-common.scss' as *;

  .my-ads-kpi-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .my-ads-kpi-item {
    padding: 12px 14px;
    background: $my-ads-panel-bg;
    border: 1px solid $my-ads-panel-border;
    border-radius: $my-ads-panel-radius;
    box-shadow: 0 10px 30px rgb(15 23 42 / 40%);

    .kpi-label {
      margin-bottom: 4px;
      font-size: 12px;
      color: $my-ads-text-secondary;
    }

    .kpi-value-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: baseline;
    }

    .kpi-value {
      font-size: 18px;
      font-weight: 600;
      color: $my-ads-text-primary;
    }

    .kpi-sub {
      font-size: 12px;
      color: $my-ads-text-secondary;
    }

    .kpi-trend {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      font-size: 12px;

      &.up {
        color: $my-ads-success;
      }

      &.down {
        color: $my-ads-danger;
      }
    }

    &.my-ads-kpi-item--primary .kpi-value {
      color: $my-ads-primary;
    }

    &.my-ads-kpi-item--success .kpi-value {
      color: $my-ads-success;
    }

    &.my-ads-kpi-item--warning .kpi-value {
      color: $my-ads-warning;
    }
  }

  .my-ads-kpi-row.is-embedded {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 22px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;

    .my-ads-kpi-item {
      flex: 1 1 140px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;

      .kpi-label {
        margin-bottom: 4px;
        font-size: 12px;
        color: $my-ads-text-secondary;
      }

      .kpi-value {
        font-size: 18px;
        font-weight: 650;
      }

      .kpi-sub {
        font-size: 12px;
      }
    }
  }

  @media (width <= 1200px) {
    .my-ads-kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 768px) {
    .my-ads-kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
