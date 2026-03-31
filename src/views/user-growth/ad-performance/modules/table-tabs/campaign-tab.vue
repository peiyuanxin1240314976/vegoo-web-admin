<template>
  <div class="ad-performance-table-tab">
    <ArtVirtualTable
      ref="tableRef"
      :columns="visibleColumns"
      :data="tableData"
      expand-column-key="appName"
      :row-class="getRowClass"
      :row-style="getRowStyle"
    >
      <!-- 应用 -->
      <template #cell:appName="{ row }">
        <div class="ad-performance-table__dim">
          <span v-if="isNestedRow(row)" class="ad-performance-table__badge" aria-hidden="true">
            AD
          </span>
          <span v-else class="ad-performance-table__app-icon" aria-hidden="true"></span>
          <span class="ad-performance-table__dim-main" :title="row.appName">
            {{ isNestedRow(row) ? '' : row.appName }}
          </span>
        </div>
      </template>

      <!-- 广告系列名称 -->
      <template #cell:name="{ row }">
        <div class="ad-performance-table__dim">
          <span class="ad-performance-table__dim-main" :title="row.name">{{ row.name }}</span>
        </div>
      </template>

      <!-- 广告平台 -->
      <template #cell:channel="{ row }">
        <span v-if="isNestedRow(row)" class="ad-performance-table__muted">-</span>
        <span
          v-else
          class="ad-performance-table__channel-icon"
          :class="`ad-performance-table__channel-icon--${row.channel}`"
          aria-hidden="true"
        >
          {{ channelShort(row.channel) }}
        </span>
      </template>

      <!-- 国家 -->
      <template #cell:country="{ row }">
        <span v-if="isNestedRow(row)" class="ad-performance-table__muted">-</span>
        <span v-else class="ad-performance-table__country" :title="row.country">
          {{ countryFlag(row.country) }}
        </span>
      </template>

      <!-- 状态 -->
      <template #cell:status="{ row }">
        <ElTag :type="statusTagType(row.status)" size="small" effect="plain">
          {{ statusLabel(row.status) }}
        </ElTag>
      </template>

      <!-- 花费/预算 -->
      <template #cell:spendBudget="{ row }">
        {{ formatMoney(row.spend, 0) }}/{{ formatMoney(row.budget, 0) }}
        <span class="ad-performance-table__percent">({{ row.spendBudgetPercent }}%)</span>
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

      <!-- 7日ROI -->
      <template #cell:roi7="{ row }">
        <span :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
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
      class="ad-performance__global-dialog"
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
  import type { AdPerformanceCampaignRow, CampaignRowStatus } from '../../types'
  import { useTabColumnVisibility } from '../../composables/useTabColumnVisibility'
  import {
    channelShort,
    countryFlag,
    formatMoney,
    roiClass,
    profitClass,
    accentColor
  } from '../../utils/tab-utils'

  defineOptions({ name: 'AdPerformanceCampaignTab' })

  const props = withDefaults(
    defineProps<{
      rows: AdPerformanceCampaignRow[]
      childrenMap?: Map<string, AdPerformanceCampaignRow[]>
      keyword?: string
    }>(),
    { rows: () => [], childrenMap: () => new Map(), keyword: '' }
  )

  defineEmits<{ (e: 'detail', row: AdPerformanceCampaignRow): void }>()

  // --- 列可见性 ---
  const ALL_COLUMNS = [
    { key: 'appName', label: '应用', required: true },
    { key: 'name', label: '广告系列名称', required: true },
    { key: 'channel', label: '广告平台' },
    { key: 'country', label: '国家' },
    { key: 'status', label: '状态' },
    { key: 'spendBudget', label: '花费/预算' },
    { key: 'cpi', label: 'CPI' },
    { key: 'ctr', label: '点击率' },
    { key: 'cvr', label: '转化率' },
    { key: 'roi1', label: '首日ROI' },
    { key: 'roi7', label: '7日ROI' },
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
  } = useTabColumnVisibility('ad-performance:table:campaign:visible-columns', ALL_COLUMNS)

  // 可见列配置 → ArtVirtualTable columns
  const visibleColumns = computed<ArtVirtualTableColumn[]>(() => {
    const cols: ArtVirtualTableColumn[] = []
    cols.push({ key: 'appName', title: '应用', width: 120 })
    cols.push({ key: 'name', title: '广告系列名称', width: 200, flexGrow: 1 })
    if (isVisible('channel')) cols.push({ key: 'channel', title: '广告平台', width: 100 })
    if (isVisible('country')) cols.push({ key: 'country', title: '国家', width: 80 })
    if (isVisible('status')) cols.push({ key: 'status', title: '状态', width: 100 })
    if (isVisible('spendBudget')) cols.push({ key: 'spendBudget', title: '花费/预算', width: 160 })
    if (isVisible('cpi')) cols.push({ key: 'cpi', title: 'CPI', width: 80 })
    if (isVisible('ctr')) cols.push({ key: 'ctr', title: '点击率', width: 90 })
    if (isVisible('cvr')) cols.push({ key: 'cvr', title: '转化率', width: 90 })
    if (isVisible('roi1')) cols.push({ key: 'roi1', title: '首日ROI', width: 90 })
    if (isVisible('roi7')) cols.push({ key: 'roi7', title: '7日ROI', width: 90 })
    if (isVisible('estimatedProfit'))
      cols.push({ key: 'estimatedProfit', title: '预估利润', width: 120 })
    cols.push({ key: 'actions', title: '操作', width: 90, fixed: 'right', align: 'center' })
    return cols
  })

  const tableRef = ref<InstanceType<typeof ArtVirtualTable> | null>(null)

  defineExpose({ openCustomColumns: openDialog })

  // --- 状态枚举映射 ---
  const STATUS_LABEL: Record<CampaignRowStatus, string> = {
    active: '激活',
    over_budget: '超预算',
    low_efficiency: '低效',
    paused: '暂停'
  }
  const STATUS_TAG_TYPE: Record<CampaignRowStatus, 'success' | 'danger' | 'warning' | 'info'> = {
    active: 'success',
    over_budget: 'danger',
    low_efficiency: 'warning',
    paused: 'info'
  }

  function statusLabel(s: CampaignRowStatus): string {
    return STATUS_LABEL[s] ?? s
  }
  function statusTagType(s: CampaignRowStatus): 'success' | 'danger' | 'warning' | 'info' {
    return STATUS_TAG_TYPE[s] ?? 'info'
  }

  function isNestedRow(row: AdPerformanceCampaignRow): boolean {
    return String(row.id ?? '').includes('-') || String(row.name ?? '').startsWith('AdGroup_')
  }

  // 数据：合并 childrenMap 到 rows，关键字过滤
  const tableData = computed(() => {
    const list = (props.rows ?? []).map((row) => ({
      ...row,
      children: props.childrenMap?.get(row.id) ?? row.children ?? []
    }))
    const kw = props.keyword?.trim().toLowerCase()
    if (!kw) return list
    const filter = (rows: AdPerformanceCampaignRow[]): AdPerformanceCampaignRow[] =>
      rows
        .map((row) => {
          const match =
            row.appName.toLowerCase().includes(kw) ||
            row.name.toLowerCase().includes(kw) ||
            row.channel.toLowerCase().includes(kw) ||
            row.country.toLowerCase().includes(kw)
          if (match) return row
          if ((row as any).children?.length) {
            const filtered = filter((row as any).children)
            if (filtered.length) return { ...row, children: filtered }
          }
          return null
        })
        .filter(Boolean) as AdPerformanceCampaignRow[]
    return filter(list)
  })

  // 关键字变化时展开/收起
  watch(
    () => props.keyword,
    (kw) => {
      if (kw?.trim()) tableRef.value?.expandAll()
      else tableRef.value?.collapseAll()
    }
  )

  // 行颜色
  const rowStyleMap = computed(() => {
    const map = new Map<string, Record<string, string>>()
    for (const row of props.rows ?? []) {
      map.set(row.id, { '--row-accent': accentColor(row.channel) })
      const children = props.childrenMap?.get(row.id) ?? []
      for (const child of children) {
        map.set(child.id, { '--row-accent': accentColor(child.channel) })
      }
    }
    return map
  })

  function getRowStyle({ rowData }: { rowData: AdPerformanceCampaignRow }) {
    return rowStyleMap.value.get(rowData.id) ?? {}
  }

  function getRowClass({ rowData }: { rowData: AdPerformanceCampaignRow }): string {
    return isNestedRow(rowData) ? 'is-level-adgroup' : 'is-level-campaign'
  }
</script>

<style scoped lang="scss">
  /* 弹窗内容较多时：内部滚动，不撑出窗口 */
  :deep(.ad-performance__global-dialog .el-dialog__body) {
    max-height: min(60vh, calc(100vh - 240px));
    overflow: auto;
  }

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
</style>
