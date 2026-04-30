<template>
  <ElCard class="map-detail-spend-panel" shadow="never">
    <template #header>
      <span>投放分析</span>
    </template>
    <div class="panel-block">
      <div class="panel-header section-header">
        <span class="section-badge">A</span>
        <span class="section-title">广告平台投放效果对比</span>
      </div>
      <ElSkeleton v-if="channelLoading" :rows="5" animated class="table-skeleton" />
      <ArtTable v-else :data="channelData" :columns="channelColumns" size="small" height="220">
        <template #trend="{ row }">
          <span class="trend-cell" :class="row.trendClass ?? 'trend-empty'">{{ row.trend }}</span>
        </template>
      </ArtTable>
    </div>
    <div class="panel-block">
      <div class="panel-header section-header">
        <span class="section-badge">B</span>
        <span class="section-title">当前投放中 Campaign (Top 5)</span>
      </div>
      <ElSkeleton v-if="campaignLoading" :rows="5" animated class="table-skeleton" />
      <ArtTable v-else :data="campaignData" :columns="campaignColumns" size="small" height="220">
        <template #roi="{ row }">
          <span class="roi-dot" :class="getRoiClass(row.roi)"></span>
          <span>{{ formatRoiPercent(row.roi) }}</span>
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
    /** 趋势样式：trend-up 绿，trend-down 红，trend-right/trend-empty 灰 */
    trendClass?: 'trend-up' | 'trend-right' | 'trend-down' | 'trend-empty'
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
      channelLoading?: boolean
      campaignLoading?: boolean
    }>(),
    {
      channelData: () => [],
      campaignData: () => [],
      channelLoading: false,
      campaignLoading: false
    }
  )

  function fmtMoneyK(n: number) {
    return `$${(n / 1000).toFixed(0)}K`
  }

  function fmtMoney(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
    if (n >= 100) return `$${n.toFixed(0)}`
    return `$${n.toFixed(2)}`
  }

  function formatRoiPercent(roi: number): string {
    if (!Number.isFinite(Number(roi))) return '—'
    const pct = Number(roi) * 100
    return pct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
  }

  const channelColumns: ColumnOption[] = [
    { prop: 'channel', label: '广告平台', minWidth: 90, showOverflowTooltip: true },
    {
      prop: 'spend',
      label: '消耗',
      minWidth: 72,
      align: 'left',
      formatter: (row: ChannelRow) => fmtMoneyK(row.spend)
    },
    {
      prop: 'installs',
      label: '安装量',
      minWidth: 72,
      align: 'left',
      formatter: (row: ChannelRow) => row.installs?.toLocaleString()
    },
    {
      prop: 'cpi',
      label: 'CPI',
      minWidth: 72,
      align: 'left',
      formatter: (row: ChannelRow) => `$${Number(row.cpi).toFixed(2)}`
    },
    {
      prop: 'roi',
      label: 'ROI',
      minWidth: 62,
      align: 'left',
      formatter: (row: ChannelRow) => formatRoiPercent(row.roi)
    },
    // { prop: 'roas', label: 'ROAS', minWidth: 62, align: 'left', showOverflowTooltip: true },
    { prop: 'trend', label: '趋势', width: 60, align: 'center', useSlot: true }
  ]

  const campaignColumns: ColumnOption[] = [
    { prop: 'name', label: 'Campaign', minWidth: 140, showOverflowTooltip: true },
    {
      prop: 'amount',
      label: '消耗',
      width: 80,
      align: 'left',
      formatter: (row: CampaignRow) => fmtMoney(row.amount)
    },
    {
      prop: 'count',
      label: '安装',
      width: 68,
      align: 'left',
      formatter: (row: CampaignRow) => row.count?.toLocaleString()
    },
    {
      prop: 'roi',
      label: 'ROI',
      width: 100,
      align: 'left',
      useSlot: true,
      showOverflowTooltip: true
    }
  ]

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
      margin-bottom: 10px;
    }

    .section-badge {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      color: #fff;
      background: linear-gradient(135deg, #29b6f6 0%, #039be5 100%);
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgb(41 182 246 / 25%);
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    /* ── 深色主题表格覆盖 ── */
    :deep(.el-table) {
      --el-table-bg-color: transparent;
      --el-table-tr-bg-color: transparent;
      --el-table-row-hover-bg-color: rgb(255 255 255 / 5%);
      --el-table-header-bg-color: rgb(255 255 255 / 4%);

      background: transparent;

      &::before {
        display: none;
      }

      th.el-table__cell {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
        background-color: rgb(255 255 255 / 4%);
        border-bottom: 1px solid var(--default-border, rgb(255 255 255 / 10%));
      }

      td.el-table__cell {
        font-size: 13px;
        color: var(--text-primary);
        border-bottom: 1px solid var(--default-border, rgb(255 255 255 / 6%));
      }

      .el-table__body tr:last-child td.el-table__cell {
        border-bottom: none;
      }
    }

    .roi-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      margin-right: 5px;
      vertical-align: middle;
      border-radius: 50%;

      &.roi-good {
        background: #10b981;
        box-shadow: 0 0 4px rgb(16 185 129 / 60%);
      }

      &.roi-mid {
        background: #f59e0b;
        box-shadow: 0 0 4px rgb(245 158 11 / 60%);
      }

      &.roi-low {
        background: #ef4444;
        box-shadow: 0 0 4px rgb(239 68 68 / 60%);
      }
    }

    .trend-cell {
      font-size: 13px;

      &.trend-up {
        color: #10b981;
      }

      &.trend-down {
        color: #ef4444;
      }

      &.trend-right,
      &.trend-empty {
        color: var(--el-text-color-secondary);
      }
    }

    .table-skeleton {
      height: 220px;
      padding: 8px 0;
    }
  }
</style>
