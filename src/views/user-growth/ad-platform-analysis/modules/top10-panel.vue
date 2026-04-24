<template>
  <div class="panel panel-top10">
    <div class="panel-title">Top10 广告系列</div>
    <div class="top10-table-wrap">
      <div v-if="pending" class="aps-module-skeleton aps-module-skeleton--top10">
        <ElSkeleton animated :rows="10" />
      </div>
      <ElTable
        v-show="!pending"
        :data="rows"
        :row-key="rowKey"
        :stripe="false"
        size="small"
        :max-height="240"
        :header-cell-style="{
          color: 'var(--aps-table-header-text)',
          fontSize: '12px',
          padding: '6px 0',
          borderBottom: '1px solid var(--aps-table-divider-strong)'
        }"
        :cell-style="{
          background: 'transparent',
          color: 'var(--aps-text-secondary)',
          fontSize: '12px',
          padding: '6px 0',
          borderBottom: '1px solid var(--aps-table-divider-weak)'
        }"
      >
        <ElTableColumn prop="campaign" label="Campaign" min-width="80" show-overflow-tooltip />
        <ElTableColumn label="广告平台" width="auto" align="center">
          <template #default="{ row }">
            <span
              class="top10-source-badge"
              :class="`top10-source-badge--${row.sourceKey}`"
              :title="row.channel"
            >
              {{ sourceBadgeShort(row.sourceKey) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="花费" width="auto" align="left">
          <template #default="{ row }">{{ formatTopCurrency(row.cost) }}</template>
        </ElTableColumn>
        <ElTableColumn label="CPI" width="auto" align="left">
          <template #default="{ row }">
            <span class="top10-cpi">{{ formatNum2(row.cpi) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="ROI" width="auto" align="left">
          <template #default="{ row }">
            <span class="top10-roi" :class="roiTone(row.roi)"
              >{{ formatNum2(row.roi * 100) }}%</span
            >
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="auto" align="center">
          <template #default="{ row }">
            <ElButton type="primary" link round @click="onView(row)">查看</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TopCampaignRow } from '../mock'

  defineProps<{
    pending: boolean
    rows: TopCampaignRow[]
    rowKey: (row: TopCampaignRow) => string
    formatTopCurrency: (n: number) => string
    formatNum2: (v: unknown) => string
    sourceBadgeShort: (key: string) => string
    roiTone: (roi: number) => string
    onView: (row: TopCampaignRow) => void
  }>()
</script>

<script lang="ts">
  export default { name: 'ApaTop10Panel' }
</script>
