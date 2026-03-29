<template>
  <div class="api-campaign-table">
    <ElCard class="api-panel api-panel--table" shadow="never">
      <template #header>
        <div class="api-panel__header">
          <div class="api-panel__title">活动明细</div>
        </div>
      </template>

      <div class="api-panel__body">
        <ArtTable
          :data="rows"
          :columns="columns"
          row-key="id"
          height="360"
          size="small"
          :stripe="false"
          :border="false"
        >
          <template #profit="{ row }">
            <span :class="row.profit >= 0 ? 'is-pos' : 'is-neg'">${{ fmtUsd2(row.profit) }}</span>
          </template>
          <template #status="{ row }">
            <ElTag :type="row.status === 'active' ? 'success' : 'info'" effect="dark">
              {{ row.status === 'active' ? '投放中' : '已暂停' }}
            </ElTag>
          </template>
          <template #action="{ row }">
            <ElButton round size="small" type="primary" link @click="openDetail(row)">
              详情
            </ElButton>
            <ElButton round size="small" type="primary" link @click="toggleStatus(row)">
              {{ row.status === 'active' ? '暂停' : '启用' }}
            </ElButton>
          </template>
        </ArtTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'
  import type { AdPlatformInfoCampaignRow } from '../types'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ApiCampaignTable' })

  defineProps<{ rows: AdPlatformInfoCampaignRow[] }>()

  function fmtUsd2(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function fmtPct2(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
  }

  const columns: ColumnOption[] = [
    {
      prop: 'campaign',
      label: '活动名称',
      width: 'auto',
      showOverflowTooltip: true
    },
    {
      prop: 'spend',
      label: '支出',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => `$${fmtUsd2(r.spend)}`
    },
    {
      prop: 'revenue',
      label: '收入',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => `$${fmtUsd2(r.revenue)}`
    },
    {
      prop: 'profit',
      label: '利润',
      width: 'auto',
      align: 'left',
      useSlot: true,
      showOverflowTooltip: true
    },
    {
      prop: 'roi',
      label: 'ROI',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => fmtPct2(r.roi)
    },
    {
      prop: 'cpi',
      label: 'CPI',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => `$${fmtUsd2(r.cpi)}`
    },
    {
      prop: 'installs',
      label: '安装量',
      width: 'auto',
      align: 'right',
      formatter: (r: AdPlatformInfoCampaignRow) => r.installs.toLocaleString('en-US')
    },
    { prop: 'status', label: '状态', width: 'auto', align: 'center', useSlot: true },
    { prop: 'action', label: '操作', width: 'auto', align: 'center', fixed: 'right', useSlot: true }
  ]

  function openDetail(row: AdPlatformInfoCampaignRow) {
    ElMessage.info(`详情面板待接入：${row.campaign}`)
  }

  function toggleStatus(row: AdPlatformInfoCampaignRow) {
    const next = row.status === 'active' ? 'paused' : 'active'
    ElMessage.success(`已切换状态：${row.campaign} → ${next === 'active' ? '投放中' : '已暂停'}`)
  }
</script>

<style scoped lang="scss">
  @use '../styles/api-info-fx.scss' as fx;

  .api-campaign-table {
    min-width: 0;
    min-height: 0;
  }

  .api-panel {
    @include fx.api-panel-card;

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .api-panel__header {
    display: flex;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
  }

  .api-panel__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--art-gray-900);
  }

  .api-panel__hint {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-table {
    --el-table-header-bg-color: rgb(24 24 27 / 50%);
    --el-table-row-hover-bg-color: rgb(39 39 42 / 55%);
  }

  .is-pos {
    font-weight: 800;
    color: var(--art-success);
  }

  .is-neg {
    font-weight: 800;
    color: var(--art-danger);
  }
</style>
