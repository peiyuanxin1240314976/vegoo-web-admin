<template>
  <ElCard class="api-panel" shadow="never">
    <template #header>
      <div class="api-panel__header">
        <div class="api-panel__title">Top 10 国家</div>
        <div class="api-panel__hint">按收入排序</div>
      </div>
    </template>

    <div class="api-panel__body">
      <ArtTable
        :data="rows"
        :columns="columns"
        row-key="rank"
        :stripe="false"
        :border="false"
        size="small"
        :show-table-header="true"
      >
        <template #country="{ row }">
          <span class="api-country-cell">
            <span
              :class="'fi fi-' + (row.s_country_code?.toLowerCase() || '')"
              class="api-flag"
            ></span>
            {{ row.countryName }}
          </span>
        </template>
        <template #roi="{ row }">
          <span class="api-roi" :class="row.roi >= 0 ? 'is-pos' : 'is-neg'">
            {{
              row.roi.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            }}%
          </span>
        </template>
      </ArtTable>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { ColumnOption } from '@/types'
  import type { AdPlatformInfoTopRow } from '../types'
  import ArtTable from '@/components/core/tables/art-table/index.vue'

  defineOptions({ name: 'ApiTop10Table' })

  defineProps<{ rows: AdPlatformInfoTopRow[] }>()

  const columns = computed<ColumnOption[]>(() => [
    { prop: 'rank', label: '#', width: 46 },
    { prop: 'countryName', label: '国家', minWidth: 120, useSlot: true, slotName: 'country' },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 86,
      align: 'left',
      formatter: (r: AdPlatformInfoTopRow) =>
        '$' +
        r.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    {
      prop: 'roi',
      label: 'ROI',
      minWidth: 74,
      align: 'left',
      useSlot: true,
      slotName: 'roi'
    },
    {
      prop: 'profit',
      label: '利润',
      minWidth: 86,
      align: 'left',
      formatter: (r: AdPlatformInfoTopRow) =>
        '$' +
        r.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  ])
</script>

<style scoped lang="scss">
  @use '../styles/api-info-fx.scss' as fx;

  .api-panel {
    @include fx.api-panel-card;

    :deep(.el-card__body) {
      padding: 0;
      overflow: hidden;
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

  .api-country-cell {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .api-flag {
    display: inline-block;
    width: 20px;
    height: 14px;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgb(39 39 42 / 80%);
  }

  .api-roi {
    font-weight: 700;

    &.is-pos {
      color: var(--art-success);
    }

    &.is-neg {
      color: var(--art-danger);
    }
  }

  :deep(.art-table) {
    --el-table-header-bg-color: rgb(24 24 27 / 50%);
  }
</style>
