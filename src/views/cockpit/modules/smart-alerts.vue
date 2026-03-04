<template>
  <ElCard class="cockpit-panel" shadow="never">
    <template #header>
      <span>智能预警</span>
      <ElButton type="primary" link size="small">查看更多</ElButton>
    </template>
    <div class="alert-list">
      <div v-for="(item, index) in alerts" :key="index" class="alert-row">
        <span class="alert-icon" :class="item.type">
          <ElIcon v-if="item.type === 'risk'"><CircleCloseFilled /></ElIcon>
          <ElIcon v-else-if="item.type === 'warning'"><WarningFilled /></ElIcon>
          <ElIcon v-else><Top /></ElIcon>
        </span>
        <span class="alert-msg">{{ item.msg }}</span>
        <ElButton type="primary" link size="small">查看详情</ElButton>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { CircleCloseFilled, WarningFilled, Top } from '@element-plus/icons-vue'
  import type { CockpitSmartAlertItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitSmartAlerts' })

  const props = withDefaults(defineProps<{ alerts?: CockpitSmartAlertItem[] }>(), {
    alerts: () => []
  })

  const alerts = computed(() =>
    props.alerts?.length ? props.alerts : MOCK_COCKPIT_OVERVIEW.smartAlerts
  )
</script>

<style scoped lang="scss">
  .cockpit-panel {
    height: 100%;

    :deep(.el-card__header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .alert-row {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;

    .alert-icon {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;

      &.risk {
        color: var(--el-color-danger);
      }

      &.warning {
        color: #e6a23c;
      }

      &.growth {
        color: var(--el-color-success);
      }
    }

    .alert-msg {
      flex: 1;
      color: var(--el-text-color-regular);
    }
  }
</style>
