<template>
  <ElCard class="cockpit-panel" shadow="never">
    <template #header>
      <span>Top10 Campaigns</span>
      <ElButton type="primary" link size="small">查看更多</ElButton>
    </template>
    <ElTable :data="tableData" size="small" stripe max-height="280">
      <ElTableColumn prop="campaign" label="Campaign" min-width="120" />
      <ElTableColumn label="渠道" width="80">
        <template #default="{ row }">
          <span class="channel-tag">{{ row.channel }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="spend" label="消耗" width="90" />
      <ElTableColumn prop="revenue" label="收入" width="90" />
      <ElTableColumn prop="roi" label="ROI" width="70" />
      <ElTableColumn label="操作" width="70" fixed="right">
        <template #default>
          <ElButton type="primary" link size="small">查看</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CockpitTop10CampaignItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitTop10Campaigns' })

  const props = withDefaults(defineProps<{ tableData?: CockpitTop10CampaignItem[] }>(), {
    tableData: () => []
  })

  const tableData = computed(() =>
    props.tableData?.length ? props.tableData : MOCK_COCKPIT_OVERVIEW.top10Campaigns
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

  .channel-tag {
    padding: 2px 6px;
    font-size: 12px;
    background: var(--el-fill-color);
    border-radius: 4px;
  }
</style>
