<template>
  <div class="channel-platform-panel cockpit-panel">
    <div class="panel-title">广告平台/平台</div>
    <ElTable :data="tableData" stripe size="default" class="monetization-table" style="width: 100%">
      <ElTableColumn prop="channel" label="广告平台" min-width="120" />
      <ElTableColumn prop="platform" label="平台" min-width="120" />
      <ElTableColumn prop="spend" label="消耗" min-width="100" />
      <ElTableColumn prop="revenue" label="收入" min-width="100" />
      <ElTableColumn prop="roi" label="ROI" min-width="100" />
    </ElTable>
  </div>
</template>

<script setup lang="ts">
  import type { MonetizationChannelPlatformRow } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationChannelPlatformTable' })

  const props = withDefaults(defineProps<{ data?: MonetizationChannelPlatformRow[] }>(), {
    data: () => []
  })

  const tableData = computed(() =>
    props.data?.length ? props.data : MOCK_MONETIZATION_ANALYSIS.channelPlatformTable
  )
</script>

<style scoped lang="scss">
  .channel-platform-panel {
    padding: 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    .panel-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .monetization-table {
      --el-table-border-color: var(--el-border-color-lighter);
    }
  }

  html.dark .channel-platform-panel {
    border-color: var(--el-border-color);
  }
</style>
