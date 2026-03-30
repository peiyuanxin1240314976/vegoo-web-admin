<template>
  <div class="ad-performance-table-tab">
    <ElTable
      :data="tableData"
      row-key="id"
      :tree-props="treeProps"
      :default-expand-all="false"
      :expand-row-keys="expandedRowKeys"
      :row-class-name="getRowClassName"
      :row-style="getRowStyle"
      @expand-change="handleExpand"
      size="default"
      class="ad-performance-table__el-table"
    >
      <!-- 国家 (required) -->
      <ElTableColumn label="国家" min-width="200">
        <template #default="{ row }">
          <template v-if="isAggregateId(row.id)">
            <span class="ad-performance-table__country" :title="row.country">
              {{ countryFlag(row.country) }}
              <span class="ml-2 text-sm text-g-900">{{ countryLabel(row.country) }}</span>
            </span>
          </template>
          <template v-else>
            <div class="ad-performance-country__campaign">
              <span class="ad-performance-table__app-icon" aria-hidden="true"></span>
              <span class="ad-performance-country__campaign-app" :title="row.appName">{{
                row.appName
              }}</span>
              <span class="ad-performance-country__campaign-name" :title="row.name">{{
                row.name
              }}</span>
              <span class="ad-performance-table__channel">
                <span
                  class="ad-performance-table__channel-icon"
                  :class="`ad-performance-table__channel-icon--${row.channel}`"
                  aria-hidden="true"
                  >{{ channelShort(row.channel) }}</span
                >
              </span>
              <span class="ad-performance-table__country" :title="row.country">
                {{ countryFlag(row.country) }}
              </span>
            </div>
          </template>
        </template>
      </ElTableColumn>

      <!-- 广告支出 (required) -->
      <ElTableColumn label="广告支出" width="110" align="left">
        <template #default="{ row }">{{ formatMoney(row.spend, 0) }}</template>
      </ElTableColumn>

      <!-- 支出占比 -->
      <ElTableColumn v-if="isVisible('spendSharePercent')" label="支出占比" min-width="150">
        <template #default="{ row }">
          <template v-if="isAggregateId(row.id)">
            <div class="ad-performance-table__progress-cell">
              <div class="ad-performance-table__progress-bg">
                <div
                  class="ad-performance-table__progress-fill ad-performance-table__progress-fill--teal"
                  :style="progressStyleMap.get(row.id)"
                ></div>
              </div>
              <span class="ad-performance-table__progress-text">{{ row.spendSharePercent }}%</span>
            </div>
          </template>
          <span v-else class="ad-performance-table__muted">-</span>
        </template>
      </ElTableColumn>

      <!-- CPI -->
      <ElTableColumn v-if="isVisible('cpi')" label="CPI" width="90" align="left">
        <template #default="{ row }">{{ formatMoney(row.cpi, 2) }}</template>
      </ElTableColumn>

      <!-- 点击率 -->
      <ElTableColumn v-if="isVisible('ctr')" label="点击率" width="100" align="left">
        <template #default="{ row }">{{ row.ctr }}%</template>
      </ElTableColumn>

      <!-- 转化率 -->
      <ElTableColumn v-if="isVisible('cvr')" label="转化率" width="100" align="left">
        <template #default="{ row }">{{ row.cvr }}%</template>
      </ElTableColumn>

      <!-- 首日ROI -->
      <ElTableColumn v-if="isVisible('roi1')" label="首日ROI" width="90" align="left">
        <template #default="{ row }">
          <span :class="roiClass(row.roi1)">{{ row.roi1 }}%</span>
        </template>
      </ElTableColumn>

      <!-- 3日ROI（仅国家汇总行有值） -->
      <ElTableColumn v-if="isVisible('roi3')" label="3日ROI" width="90" align="left">
        <template #default="{ row }">
          <span v-if="isAggregateId(row.id)" :class="roiClass(row.roi3)">{{ row.roi3 }}%</span>
          <span v-else class="ad-performance-table__muted">-</span>
        </template>
      </ElTableColumn>

      <!-- 7日ROI -->
      <ElTableColumn v-if="isVisible('roi7')" label="7日ROI" width="90" align="left">
        <template #default="{ row }">
          <span :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
        </template>
      </ElTableColumn>

      <!-- 累ROI（仅国家汇总行有值） -->
      <ElTableColumn v-if="isVisible('roiTotal')" label="累ROI" width="90" align="left">
        <template #default="{ row }">
          <span v-if="isAggregateId(row.id)" :class="roiClass(row.roiTotal)"
            >{{ row.roiTotal }}%</span
          >
          <span v-else class="ad-performance-table__muted">-</span>
        </template>
      </ElTableColumn>

      <!-- 预估利润 -->
      <ElTableColumn
        v-if="isVisible('estimatedProfit')"
        label="预估利润"
        min-width="100"
        align="left"
      >
        <template #default="{ row }">
          <span :class="profitClass(row.estimatedProfit)">
            {{ row.estimatedProfit >= 0 ? '+' : '' }}{{ formatMoney(row.estimatedProfit, 0) }}
          </span>
        </template>
      </ElTableColumn>

      <!-- 操作 -->
      <ElTableColumn label="操作" width="90" align="center" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="$emit('detail', row)">详情</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

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
          >{{ col.label }}</ElCheckbox
        >
      </ElCheckboxGroup>
      <template #footer>
        <ElButton round @click="dialogVisible = false">取消</ElButton>
        <ElButton round type="primary" @click="confirmDialog">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AdPerformanceCampaignRow, AdPerformanceCountryRow } from '../../types'
  import { useTabColumnVisibility } from '../../composables/useTabColumnVisibility'
  import { useTabExpand } from '../../composables/useTabExpand'
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

  defineExpose({ openCustomColumns: openDialog })

  // --- 展开状态 ---
  const { expandedRowKeys, onExpandChange } = useTabExpand(() => props.keyword)
  const treeProps = { children: 'children', hasChildren: 'hasChildren' } as const

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

  // --- 国家汇总行 ID 集合（O(1) 查找，替代 hasOwnProperty 逐格判断）---
  const aggregateIdSet = computed(() => {
    const s = new Set<string>()
    for (const row of tableData.value) s.add(row.id)
    return s
  })

  function isAggregateId(id: string): boolean {
    return aggregateIdSet.value.has(id)
  }

  // --- 行样式 ---
  const rowStyleMap = computed(() => {
    const map = new Map<string, Record<string, string>>()
    for (const row of tableData.value) {
      // 国家汇总行无 channel，使用默认色
      map.set(row.id, { '--row-accent': 'var(--art-success)' })
      if (row.children?.length) {
        for (const child of row.children) {
          map.set(child.id, { '--row-accent': accentColor(child.channel) })
        }
      }
    }
    return map
  })

  // 进度条宽度缓存
  const progressStyleMap = computed(() => {
    const map = new Map<string, { width: string }>()
    for (const row of tableData.value) {
      map.set(row.id, { width: `${row.spendSharePercent}%` })
    }
    return map
  })

  function getRowStyle({ row }: { row: CountryMixedRow }) {
    return rowStyleMap.value.get(row.id) ?? {}
  }

  function getRowClassName({ row }: { row: CountryMixedRow }) {
    return isAggregateId(row.id) ? 'is-level-country' : 'is-level-country-campaign'
  }

  function handleExpand(row: CountryMixedRow) {
    // 子行不处理展开
    if (!isAggregateId(row.id)) return
    onExpandChange(row.id)
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
