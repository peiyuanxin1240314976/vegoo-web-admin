<template>
  <div class="cockpit-alerts">
    <div v-for="(item, index) in alertBanners" :key="index" class="alert-item" :class="item.type">
      <component :is="iconMap[item.type]" class="alert-icon" />
      <span class="alert-text">{{ item.text }}</span>
      <span class="alert-suggestion">{{ item.suggestion }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { WarningFilled, Top, CircleCloseFilled } from '@element-plus/icons-vue'
  import type { CockpitAlertBanner } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitAlertMessages' })

  const props = withDefaults(defineProps<{ alertBanners?: CockpitAlertBanner[] }>(), {
    alertBanners: () => []
  })

  const alertBanners = computed(() =>
    props.alertBanners?.length ? props.alertBanners : MOCK_COCKPIT_OVERVIEW.alertBanners
  )

  const iconMap = {
    warning: WarningFilled,
    opportunity: Top,
    risk: CircleCloseFilled
  } as const
</script>

<style scoped lang="scss">
  .cockpit-alerts {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  .alert-item {
    display: inline-flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    min-width: 200px;
    padding: 10px 14px;
    font-size: 13px;
    border-radius: 8px;

    .alert-icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
    }

    .alert-text {
      flex-shrink: 0;
      font-weight: 500;
    }

    .alert-suggestion {
      color: var(--el-text-color-regular);
    }

    &.warning {
      background: rgb(230 162 60 / 12%);
      border: 1px solid rgb(230 162 60 / 30%);

      .alert-icon {
        color: #e6a23c;
      }
    }

    &.opportunity {
      background: rgb(103 194 58 / 12%);
      border: 1px solid rgb(103 194 58 / 30%);

      .alert-icon {
        color: var(--el-color-success);
      }
    }

    &.risk {
      background: rgb(245 108 108 / 12%);
      border: 1px solid rgb(245 108 108 / 30%);

      .alert-icon {
        color: var(--el-color-danger);
      }
    }
  }
</style>
