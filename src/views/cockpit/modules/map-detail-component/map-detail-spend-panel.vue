<template>
  <ElCard class="map-detail-spend-panel" shadow="never">
    <template #header>
      <span>投放分析</span>
    </template>
    <div class="panel-block">
      <div class="panel-header section-header">
        <span class="section-badge">A</span>
        <span class="section-title">渠道投放效果对比</span>
      </div>
      <ArtTable :data="channelData" :columns="channelColumns" size="small" height="150" />
    </div>
    <div class="panel-block">
      <div class="panel-header section-header">
        <span class="section-badge">B</span>
        <span class="section-title">当前投放中 Campaign (Top 5)</span>
      </div>
      <ArtTable :data="campaignData" :columns="campaignColumns" size="small" height="150">
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

  withDefaults(
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

  // function channelSummaries(): string[] {
  //   const total = props.channelData.reduce((a, b) => a + b.spend, 0)
  //   const totalInstalls = props.channelData.reduce((a, b) => a + b.installs, 0)
  //   return ['合计', fmtMoneyK(total), String(totalInstalls.toLocaleString()), '—', '—', '—', '']
  // }

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

    .panel-header.section-header {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 12px;
    }

    .section-badge {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
      color: #fff;
      background: linear-gradient(135deg, #29b6f6 0%, #039be5 100%);
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgb(41 182 246 / 25%);
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
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
