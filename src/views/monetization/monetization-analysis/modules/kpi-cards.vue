<template>
  <div class="monetization-kpi-row">
    <div
      v-for="(item, index) in kpiList"
      :key="index"
      class="monetization-kpi-card"
      :class="`monetization-kpi-card--${item.type}`"
    >
      <div class="kpi-mini-trend" :class="item.compareUp ? 'trend-up' : 'trend-down'" />
      <div class="kpi-label">{{ item.label }}</div>
      <div class="kpi-value-row">
        <span class="kpi-value">{{ item.value }}</span>
        <ElIcon v-if="item.compare" class="kpi-arrow" :class="item.compareUp ? 'up' : 'down'">
          <component :is="item.compareUp ? ArrowUp : ArrowDown" />
        </ElIcon>
      </div>
      <div v-if="item.compare" class="kpi-compare" :class="item.compareUp ? 'up' : 'down'">
        {{ item.compare }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
  import type { MonetizationKpiCard } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationKpiCards' })

  const props = withDefaults(defineProps<{ kpiList?: MonetizationKpiCard[] }>(), {
    kpiList: () => []
  })

  const kpiList = computed(() =>
    props.kpiList?.length ? props.kpiList : MOCK_MONETIZATION_ANALYSIS.kpi
  )
</script>

<style scoped lang="scss">
  .monetization-kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (width <= 1200px) {
    .monetization-kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 768px) {
    .monetization-kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 480px) {
    .monetization-kpi-row {
      grid-template-columns: 1fr;
    }
  }

  .monetization-kpi-card {
    position: relative;
    box-sizing: border-box;
    min-height: 100px;
    padding: 16px;
    border: 1px solid transparent;
    border-radius: 10px;

    .kpi-mini-trend {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 48px;
      height: 28px;
      border-radius: 6px;
      opacity: 0.4;

      &.trend-up {
        background: linear-gradient(135deg, #67c23a 0%, transparent 100%);
      }

      &.trend-down {
        background: linear-gradient(135deg, #f56c6c 0%, transparent 100%);
      }
    }

    .kpi-label {
      margin-bottom: 6px;
      font-size: 13px;
      opacity: 0.9;
    }

    .kpi-value-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .kpi-value {
      font-size: 20px;
      font-weight: 600;
      line-height: 1.3;
    }

    .kpi-arrow {
      font-size: 14px;

      &.up {
        color: var(--el-color-success);
      }

      &.down {
        color: var(--el-color-danger);
      }
    }

    .kpi-compare {
      margin-top: 6px;
      font-size: 12px;

      &.up {
        color: var(--el-color-success);
      }

      &.down {
        color: var(--el-color-danger);
      }
    }

    &--income {
      background: linear-gradient(135deg, rgb(103 194 58 / 12%) 0%, rgb(103 194 58 / 4%) 100%);
      border-color: rgb(103 194 58 / 25%);

      .kpi-value {
        color: #67c23a;
      }
    }

    &--adRevenue {
      background: linear-gradient(135deg, rgb(64 158 255 / 12%) 0%, rgb(64 158 255 / 4%) 100%);
      border-color: rgb(64 158 255 / 28%);

      .kpi-value {
        color: #409eff;
      }
    }

    &--iap {
      background: linear-gradient(135deg, rgb(230 162 60 / 14%) 0%, rgb(230 162 60 / 4%) 100%);
      border-color: rgb(230 162 60 / 30%);

      .kpi-value {
        color: #e6a23c;
      }
    }

    &--arpu {
      background: linear-gradient(135deg, rgb(114 46 209 / 12%) 0%, rgb(114 46 209 / 4%) 100%);
      border-color: rgb(114 46 209 / 28%);

      .kpi-value {
        color: #722ed1;
      }
    }

    &--dau {
      background: linear-gradient(135deg, rgb(64 158 255 / 12%) 0%, rgb(64 158 255 / 4%) 100%);
      border-color: rgb(64 158 255 / 28%);

      .kpi-value {
        color: #409eff;
      }
    }
  }

  html.dark .monetization-kpi-card .kpi-label {
    color: rgb(255 255 255 / 82%);
  }
</style>
