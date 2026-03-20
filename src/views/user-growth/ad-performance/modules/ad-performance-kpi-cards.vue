<template>
  <ElRow :gutter="16" class="ad-performance-kpi-cards">
    <ElCol v-for="(item, index) in kpi" :key="item.type" :xs="24" :sm="12" :md="8" :lg="4">
      <div
        class="ad-performance-kpi-cards__card"
        :class="[
          { 'ad-performance-kpi-cards__card--alert': item.alert },
          `ad-performance-kpi-cards__card--${cardTheme(index)}`
        ]"
      >
        <div class="ad-performance-kpi-cards__label">{{ item.label }}</div>
        <!-- 异常系列：保持原样（图标在数字右侧） -->
        <div v-if="item.alert" class="ad-performance-kpi-cards__value-row">
          <div class="ad-performance-kpi-cards__value">{{ item.value }}</div>
          <ElIcon class="ad-performance-kpi-cards__alert-icon">
            <WarningFilled />
          </ElIcon>
        </div>
        <div v-if="item.alert" class="ad-performance-kpi-cards__tip-row"></div>

        <!-- 其它：tip/对比值放到数字下方 -->
        <div v-else class="ad-performance-kpi-cards__value-stack">
          <div class="ad-performance-kpi-cards__value">{{ item.value }}</div>
          <div class="ad-performance-kpi-cards__tip-row">
            <div
              v-if="item.compare"
              class="ad-performance-kpi-cards__compare"
              :class="item.compareUp ? 'is-up' : 'is-down'"
            >
              {{ item.compare }}
            </div>
          </div>
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { WarningFilled } from '@element-plus/icons-vue'
  import type { AdPerformanceKpi } from '../types'

  defineOptions({ name: 'AdPerformanceKpiCards' })

  withDefaults(
    defineProps<{
      kpi: AdPerformanceKpi[]
    }>(),
    { kpi: () => [] }
  )

  /** 设计稿 6 卡背景：橙褐/墨绿/深蓝/暗红/绿/紫 */
  function cardTheme(index: number): string {
    const themes = ['spend', 'cpi', 'active', 'alert', 'roi', 'profit']
    return themes[index] ?? 'spend'
  }
</script>

<style scoped lang="scss">
  .ad-performance-kpi-cards {
    margin-bottom: 16px;

    :deep(.el-col) {
      display: flex;
    }
  }

  .ad-performance-kpi-cards__card {
    --kpi-accent: var(--art-primary);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 90px;
    padding: 16px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--kpi-accent) 10%, var(--default-box-color)) 0%,
      color-mix(in srgb, var(--kpi-accent) 22%, var(--default-box-color)) 100%
    );
    border: 2px solid var(--default-border);
    border-radius: 10px;

    &--spend {
      --kpi-accent: var(--art-warning);

      border-color: color-mix(in srgb, var(--art-warning) 45%, transparent);
    }

    &--cpi {
      --kpi-accent: var(--art-success);

      border-color: color-mix(in srgb, var(--art-success) 45%, transparent);
    }

    &--active {
      --kpi-accent: var(--art-primary);

      border-color: color-mix(in srgb, var(--art-primary) 45%, transparent);
    }

    &--alert {
      --kpi-accent: var(--art-danger);

      border-color: color-mix(in srgb, var(--art-danger) 50%, transparent);
    }

    &--roi {
      --kpi-accent: var(--art-success);

      border-color: color-mix(in srgb, var(--art-success) 45%, transparent);
    }

    &--profit {
      --kpi-accent: #7c3aed;

      border-color: color-mix(in srgb, #7c3aed 45%, transparent);
    }
  }

  .ad-performance-kpi-cards__label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .ad-performance-kpi-cards__value-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  .ad-performance-kpi-cards__value-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }

  .ad-performance-kpi-cards__value {
    font-size: 20px;
    font-weight: 600;
    color: var(--kpi-accent);
    text-align: center;
  }

  .ad-performance-kpi-cards__tip-row {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 18px;
    margin-top: 6px;
  }

  .ad-performance-kpi-cards__alert-icon {
    font-size: 18px;
    color: var(--kpi-accent);
  }

  .ad-performance-kpi-cards__compare {
    font-size: 12px;
    text-align: center;

    &.is-up {
      color: var(--art-success);
    }

    &.is-down {
      color: var(--art-danger);
    }
  }
</style>
