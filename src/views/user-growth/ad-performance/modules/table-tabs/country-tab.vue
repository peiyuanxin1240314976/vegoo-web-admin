<template>
  <div class="ad-performance-table-tab">
    <ArtVirtualTable
      ref="tableRef"
      :columns="visibleColumns"
      :data="tableData"
      expand-column-key="country"
      :row-class="getRowClass"
      :row-style="getRowStyle"
    >
      <!-- 国家 -->
      <template #cell:country="{ row }">
        <template v-if="isAggregateRow(row)">
          <span class="ad-performance-table__country" :title="row.country">
            {{ countryFlag(row.country) }}
            <span class="ml-2 text-sm text-g-900">{{ countryLabel(row.country) }}</span>
          </span>
        </template>
        <template v-else>
          <div class="ad-performance-country__campaign">
            <span class="ad-performance-table__app-icon" aria-hidden="true"></span>
            <span class="ad-performance-country__campaign-app" :title="row.appName">
              {{ row.appName }}
            </span>
            <span class="ad-performance-country__campaign-name" :title="row.name">
              {{ row.name }}
            </span>
            <span
              class="ad-performance-table__channel-icon"
              :class="`ad-performance-table__channel-icon--${row.channel}`"
              aria-hidden="true"
            >
              {{ channelShort(row.channel) }}
            </span>
            <span class="ad-performance-table__country" :title="row.country">
              {{ countryFlag(row.country) }}
            </span>
          </div>
        </template>
      </template>

      <!-- 广告支出 -->
      <template #cell:spend="{ row }">{{ formatMoney(row.spend, 0) }}</template>

      <!-- 支出占比 -->
      <template #cell:spendSharePercent="{ row }">
        <template v-if="isAggregateRow(row)">
          <div class="ad-performance-table__progress-cell">
            <div class="ad-performance-table__progress-bg">
              <div
                class="ad-performance-table__progress-fill ad-performance-table__progress-fill--teal"
                :style="{ width: `${row.spendSharePercent}%` }"
              ></div>
            </div>
            <span class="ad-performance-table__progress-text">{{ row.spendSharePercent }}%</span>
          </div>
        </template>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- CPI -->
      <template #cell:cpi="{ row }">{{ formatMoney(row.cpi, 2) }}</template>

      <!-- 点击率 -->
      <template #cell:ctr="{ row }">{{ row.ctr }}%</template>

      <!-- 转化率 -->
      <template #cell:cvr="{ row }">{{ row.cvr }}%</template>

      <!-- 首日ROI -->
      <template #cell:roi1="{ row }">
        <span :class="roiClass(row.roi1)">{{ row.roi1 }}%</span>
      </template>

      <!-- 3日ROI -->
      <template #cell:roi3="{ row }">
        <span v-if="isAggregateRow(row)" :class="roiClass(row.roi3)">{{ row.roi3 }}%</span>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 7日ROI -->
      <template #cell:roi7="{ row }">
        <span :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
      </template>

      <!-- 累ROI -->
      <template #cell:roiTotal="{ row }">
        <span v-if="isAggregateRow(row)" :class="roiClass(row.roiTotal)">
          {{ row.roiTotal }}%
        </span>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 预估利润 -->
      <template #cell:estimatedProfit="{ row }">
        <span :class="profitClass(row.estimatedProfit)">
          {{ row.estimatedProfit >= 0 ? '+' : '' }}{{ formatMoney(row.estimatedProfit, 0) }}
        </span>
      </template>

      <!-- 操作 -->
      <template #cell:actions="{ row }">
        <ElButton link type="primary" size="small" @click="$emit('detail', row)">详情</ElButton>
      </template>
    </ArtVirtualTable>

    <!-- 自定义列弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      width="520px"
      :close-on-click-modal="false"
      :append-to-body="true"
      title="自定义列"
    >
      <div class="ad-performance-table__custom-header">
        <ElCheckbox v-model="allChecked" :indeterminate="indeterminate">全选</ElCheckbox>
        <ElButton link type="primary" @click="resetDialog">重置</ElButton>
      </div>
      <ElCheckboxGroup v-model="checkedKeys" class="ad-performance-table__custom-grid">
        <ElCheckbox
          v-for="col in allColumns"
          :key="col.key"
          :label="col.key"
          :disabled="col.required"
        >
          {{ col.label }}
        </ElCheckbox>
      </ElCheckboxGroup>
      <template #footer>
        <ElButton round @click="dialogVisible = false">取消</ElButton>
        <ElButton round type="primary" @click="confirmDialog">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import ArtVirtualTable from '@/components/core/art-virtual-table/index.vue'
  import type { ArtVirtualTableColumn } from '@/components/core/art-virtual-table/index.vue'
  import type { AdPerformanceCampaignRow, AdPerformanceCountryRow } from '../../types'
  import { useTabColumnVisibility } from '../../composables/useTabColumnVisibility'
  import {
    channelShort,
    countryFlag,
    countryLabel,
    formatMoney,
    roiClass,
    profitClass,
    accentColor
  } from '../../utils/tab-utils'

  defineOptions({ name: 'AdPerformanceCountryTab' })

  type CountryMixedRow = AdPerformanceCountryRow | AdPerformanceCampaignRow

  const props = withDefaults(
    defineProps<{
      rows: AdPerformanceCountryRow[]
      keyword?: string
    }>(),
    { rows: () => [], keyword: '' }
  )

  defineEmits<{ (e: 'detail', row: CountryMixedRow): void }>()

  // --- 列可见性 ---
  const ALL_COLUMNS = [
    { key: 'country', label: '国家', required: true },
    { key: 'spend', label: '广告支出', required: true },
    { key: 'spendSharePercent', label: '支出占比' },
    { key: 'cpi', label: 'CPI' },
    { key: 'ctr', label: '点击率' },
    { key: 'cvr', label: '转化率' },
    { key: 'roi1', label: '首日ROI' },
    { key: 'roi3', label: '3日ROI' },
    { key: 'roi7', label: '7日ROI' },
    { key: 'roiTotal', label: '累ROI' },
    { key: 'estimatedProfit', label: '预估利润' }
  ] as const

  const {
    allColumns,
    isVisible,
    dialogVisible,
    checkedKeys,
    allChecked,
    indeterminate,
    openDialog,
    resetDialog,
    confirmDialog
  } = useTabColumnVisibility('ad-performance:table:country:visible-columns', ALL_COLUMNS)

  const visibleColumns = computed<ArtVirtualTableColumn[]>(() => {
    const cols: ArtVirtualTableColumn[] = []
    cols.push({ key: 'country', title: '国家', width: 220, flexGrow: 1 })
    cols.push({ key: 'spend', title: '广告支出', width: 110 })
    if (isVisible('spendSharePercent'))
      cols.push({ key: 'spendSharePercent', title: '支出占比', width: 160 })
    if (isVisible('cpi')) cols.push({ key: 'cpi', title: 'CPI', width: 90 })
    if (isVisible('ctr')) cols.push({ key: 'ctr', title: '点击率', width: 100 })
    if (isVisible('cvr')) cols.push({ key: 'cvr', title: '转化率', width: 100 })
    if (isVisible('roi1')) cols.push({ key: 'roi1', title: '首日ROI', width: 90 })
    if (isVisible('roi3')) cols.push({ key: 'roi3', title: '3日ROI', width: 90 })
    if (isVisible('roi7')) cols.push({ key: 'roi7', title: '7日ROI', width: 90 })
    if (isVisible('roiTotal')) cols.push({ key: 'roiTotal', title: '累ROI', width: 90 })
    if (isVisible('estimatedProfit'))
      cols.push({ key: 'estimatedProfit', title: '预估利润', width: 120 })
    cols.push({ key: 'actions', title: '操作', width: 90, fixed: 'right', align: 'center' })
    return cols
  })

  const tableRef = ref<InstanceType<typeof ArtVirtualTable> | null>(null)

  defineExpose({ openCustomColumns: openDialog })

  // --- 汇总行判断（国家汇总行有 spendSharePercent 字段，子行是 campaign 结构）---
  const aggregateIdSet = computed(() => {
    const s = new Set<string>()
    for (const row of props.rows) s.add(row.id)
    return s
  })

  function isAggregateRow(row: CountryMixedRow): boolean {
    return aggregateIdSet.value.has(row.id)
  }

  // --- 过滤数据 ---
  function filterCampaignTree(
    rows: AdPerformanceCampaignRow[],
    kw: string
  ): AdPerformanceCampaignRow[] {
    return rows
      .map((row) => {
        const match =
          row.appName.toLowerCase().includes(kw) ||
          row.name.toLowerCase().includes(kw) ||
          row.channel.toLowerCase().includes(kw) ||
          row.country.toLowerCase().includes(kw)
        if (match) return row
        if (row.children?.length) {
          const filtered = filterCampaignTree(row.children, kw)
          if (filtered.length) return { ...row, children: filtered }
        }
        return null
      })
      .filter(Boolean) as AdPerformanceCampaignRow[]
  }

  const tableData = computed(() => {
    const list = props.rows ?? []
    const kw = props.keyword?.trim().toLowerCase()
    if (!kw) return list
    return list
      .map((row) => {
        if (row.country.toLowerCase().includes(kw)) return row
        if (row.children?.length) {
          const filtered = filterCampaignTree(row.children, kw)
          if (filtered.length) return { ...row, children: filtered }
        }
        return null
      })
      .filter(Boolean) as AdPerformanceCountryRow[]
  })

  watch(
    () => props.keyword,
    (kw) => {
      if (kw?.trim()) tableRef.value?.expandAll()
      else tableRef.value?.collapseAll()
    }
  )

  // --- 行样式 ---
  const rowStyleMap = computed(() => {
    const map = new Map<string, Record<string, string>>()
    for (const row of tableData.value) {
      map.set(row.id, { '--row-accent': 'var(--art-success)' })
      if (row.children?.length) {
        for (const child of row.children) {
          map.set(child.id, { '--row-accent': accentColor(child.channel) })
        }
      }
    }
    return map
  })

  function getRowStyle({ rowData }: { rowData: CountryMixedRow }) {
    return rowStyleMap.value.get(rowData.id) ?? {}
  }

  function getRowClass({ rowData }: { rowData: CountryMixedRow }): string {
    return isAggregateRow(rowData) ? 'is-level-country' : 'is-level-country-campaign'
  }
</script>

<style scoped lang="scss">
  .ad-performance-table__custom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .ad-performance-table__custom-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
    max-height: 360px;
    padding-right: 4px;
    overflow: auto;
  }

  .ad-performance-country__campaign {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-country__campaign-app {
    min-width: 0;
    max-width: 120px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-country__campaign-name {
    min-width: 0;
    max-width: 280px;
    overflow: hidden;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
