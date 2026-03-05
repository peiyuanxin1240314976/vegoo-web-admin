<template>
  <div class="channel-total-card cockpit-panel">
    <div class="card-label">{{ data?.label ?? '渠道总数' }}</div>
    <div class="card-value">{{ data?.value ?? '--' }}</div>
  </div>
</template>

<script setup lang="ts">
  import type { MonetizationChannelTotal } from '../types'

  defineOptions({ name: 'MonetizationChannelTotalCard' })

  defineProps<{ data?: MonetizationChannelTotal | null }>()
</script>

<style scoped lang="scss">
  .channel-total-card {
    padding: 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    .card-label {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .card-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  html.dark .channel-total-card {
    border-color: var(--el-border-color);
  }
</style>
