<template>
  <ElCard class="map-detail-spend-panel" shadow="never">
    <template #header>
      <span>投放分析</span>
    </template>
    <div class="panel-block">
      <div class="panel-header">
        <span class="panel-title">渠道投放效果对比</span>
      </div>
      <ArtTable
        :data="channelData"
        :columns="channelColumns"
        size="small"
        height="220"
        show-summary
        :summary-method="channelSummaries"
      />
    </div>
    <div class="panel-block">
      <div class="panel-header">
        <span class="panel-title">当前投放中 Campaign (Top 5)</span>
      </div>
      <ArtTable :data="campaignData" :columns="campaignColumns" size="small" height="200">
        <template #roi="{ row }">
          <span class="roi-dot" :class="getRoiClass(row.roi)"></span>
          <span>{{ row.roi }}</span>
        </template>
      </ArtTable>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'

  defineOptions({ name: 'MapDetailSpendPanel' })

  export interface ChannelRow {
    channel: string
    spend: number
    installs: number
    cpi: number
    roi: number
    roas: string
    trend: string
  }

  export interface CampaignRow {
    name: string
    amount: number
    count: number
    roi: number
    status: string
  }

  const props = withDefaults(
    defineProps<{
      channelData?: ChannelRow[]
      campaignData?: CampaignRow[]
    }>(),
    { channelData: () => [], campaignData: () => [] }
  )

  function fmtMoneyK(n: number) {
    return `$${(n / 1000).toFixed(0)}K`
  }

  const channelColumns: ColumnOption[] = [
    { prop: 'channel', label: '渠道', minWidth: 100 },
    {
      prop: 'spend',
      label: '消耗',
      minWidth: 80,
      align: 'right',
      formatter: (row: ChannelRow) => fmtMoneyK(row.spend)
    },
    {
      prop: 'installs',
      label: '安装量',
      minWidth: 80,
      align: 'right',
      formatter: (row: ChannelRow) => row.installs?.toLocaleString()
    },
    { prop: 'cpi', label: 'CPI', width: 70, align: 'right' },
    { prop: 'roi', label: 'ROI', width: 70, align: 'right' },
    { prop: 'roas', label: 'ROAS', width: 70, align: 'right' },
    { prop: 'trend', label: '趋势', width: 60, align: 'center' }
  ]

  const campaignColumns: ColumnOption[] = [
    { prop: 'name', label: 'Campaign Name', minWidth: 180 },
    {
      prop: 'amount',
      label: '金额',
      width: 90,
      align: 'right',
      formatter: (row: CampaignRow) => fmtMoneyK(row.amount)
    },
    {
      prop: 'count',
      label: '数量',
      width: 80,
      align: 'right',
      formatter: (row: CampaignRow) => row.count?.toLocaleString()
    },
    { prop: 'roi', label: 'ROI', width: 80, align: 'right', useSlot: true },
    { prop: 'status', label: '状态', width: 70 }
  ]

  function channelSummaries(): string[] {
    const total = props.channelData.reduce((a, b) => a + b.spend, 0)
    const totalInstalls = props.channelData.reduce((a, b) => a + b.installs, 0)
    return ['合计', fmtMoneyK(total), String(totalInstalls.toLocaleString()), '—', '—', '—', '']
  }

  function getRoiClass(roi: number): string {
    if (roi >= 1.5) return 'roi-good'
    if (roi >= 1.0) return 'roi-mid'
    return 'roi-low'
  }
</script>

<style scoped lang="scss">
  .map-detail-spend-panel {
    :deep(.el-card__header) {
      font-weight: 500;
    }

    .panel-block + .panel-block {
      margin-top: 16px;
    }

    .panel-header {
      margin-bottom: 8px;

      .panel-title {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .roi-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 6px;
      vertical-align: middle;
      border-radius: 50%;

      &.roi-good {
        background: #10b981;
      }

      &.roi-mid {
        background: #f59e0b;
      }

      &.roi-low {
        background: #ef4444;
      }
    }
  }
</style>
