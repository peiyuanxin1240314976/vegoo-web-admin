<template>
  <div class="ad-performance-table-tab">
    <ArtVirtualTable
      ref="tableRef"
      :columns="visibleColumns"
      :data="tableData"
      expand-column-key="ownerName"
      :row-class="getRowClass"
    >
      <!-- 优化师 -->
      <template #cell:ownerName="{ row }">
        <template v-if="isOwnerRow(row)">
          <div class="ad-performance-owner__cell">
            <div class="ad-performance-owner__avatar">{{ avatarText(row.ownerName ?? '') }}</div>
            <span class="ad-performance-owner__name" :title="row.ownerName ?? ''">
              {{ row.ownerName }}
            </span>
          </div>
        </template>
        <template v-else>
          <div class="ad-performance-owner__campaign">
            <span class="ad-performance-table__app-icon" aria-hidden="true"></span>
            <span class="ad-performance-owner__campaign-name" :title="row.campaignName ?? ''">
              {{ row.campaignName }}
            </span>
            <span
              class="ad-performance-table__channel-icon"
              :class="`ad-performance-table__channel-icon--${row.channel ?? ''}`"
              aria-hidden="true"
            >
              {{ channelShort(row.channel) }}
            </span>
            <span class="ad-performance-table__country" :title="row.country ?? ''">
              {{ countryFlag(row.country) }}
            </span>
          </div>
        </template>
      </template>

      <!-- 职级 -->
      <template #cell:level="{ row }">
        <template v-if="isOwnerRow(row) && row.level">
          <ElTag :type="LEVEL_TAG_TYPE[row.level] ?? 'info'" size="small" effect="plain">
            {{ LEVEL_LABEL[row.level] ?? row.level }}
          </ElTag>
        </template>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 负责应用数 -->
      <template #cell:appCount="{ row }">
        <span v-if="isOwnerRow(row) && row.appCount != null">{{ row.appCount }} 个应用</span>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 广告支出 -->
      <template #cell:spend="{ row }">{{ formatMoney(row.spend, 0) }}</template>

      <!-- 活跃系列数 -->
      <template #cell:activeCampaignCount="{ row }">
        <span v-if="isOwnerRow(row) && row.activeCampaignCount != null">
          {{ row.activeCampaignCount }} 个系列
        </span>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 平均CPI -->
      <template #cell:avgCpi="{ row }">
        <span v-if="isOwnerRow(row)">
          {{ row.avgCpi != null ? formatMoney(row.avgCpi, 2) : '—' }}
        </span>
        <span v-else>{{ row.cpi != null ? formatMoney(row.cpi, 2) : '—' }}</span>
      </template>

      <!-- 平均点击率 -->
      <template #cell:avgCtr="{ row }">
        <span v-if="isOwnerRow(row)">{{ row.avgCtr != null ? `${row.avgCtr}%` : '—' }}</span>
        <span v-else>{{ row.ctr != null ? `${row.ctr}%` : '—' }}</span>
      </template>

      <!-- 平均转化率 -->
      <template #cell:avgCvr="{ row }">
        <span v-if="isOwnerRow(row)">{{ row.avgCvr != null ? `${row.avgCvr}%` : '—' }}</span>
        <span v-else>{{ row.cvr != null ? `${row.cvr}%` : '—' }}</span>
      </template>

      <!-- 首日ROI -->
      <template #cell:roi1="{ row }">
        <span v-if="row.roi1 == null" class="ad-performance-table__muted">—</span>
        <span v-else :class="roiClass(row.roi1)">{{ row.roi1 }}%</span>
      </template>

      <!-- 7日ROI -->
      <template #cell:roi7="{ row }">
        <span v-if="row.roi7 == null" class="ad-performance-table__muted">—</span>
        <span v-else :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
      </template>

      <!-- 预估利润 -->
      <template #cell:estimatedProfit="{ row }">
        <span v-if="row.estimatedProfit == null" class="ad-performance-table__muted">—</span>
        <span v-else :class="profitClass(row.estimatedProfit)">
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
  import type {
    AdPerformanceOwnerRow,
    AdPerformanceOwnerCampaignRow,
    OwnerLevel
  } from '../../types'
  import { useTabColumnVisibility } from '../../composables/useTabColumnVisibility'
  import {
    channelShort,
    countryFlag,
    formatMoney,
    roiClass,
    profitClass
  } from '../../utils/tab-utils'

  defineOptions({ name: 'AdPerformanceOwnerTab' })

  type OwnerMixedRow = AdPerformanceOwnerRow | AdPerformanceOwnerCampaignRow

  const props = withDefaults(
    defineProps<{
      rows: AdPerformanceOwnerRow[]
      keyword?: string
    }>(),
    { rows: () => [], keyword: '' }
  )

  defineEmits<{ (e: 'detail', row: OwnerMixedRow): void }>()

  // --- 列可见性 ---
  const ALL_COLUMNS = [
    { key: 'ownerName', label: '优化师', required: true },
    { key: 'level', label: '职级' },
    { key: 'appCount', label: '负责应用数' },
    { key: 'spend', label: '广告支出', required: true },
    { key: 'activeCampaignCount', label: '活跃系列数' },
    { key: 'avgCpi', label: '平均CPI' },
    { key: 'avgCtr', label: '平均点击率' },
    { key: 'avgCvr', label: '平均转化率' },
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
  } = useTabColumnVisibility('ad-performance:table:owner:visible-columns', ALL_COLUMNS)

  const visibleColumns = computed<ArtVirtualTableColumn[]>(() => {
    const cols: ArtVirtualTableColumn[] = []
    cols.push({ key: 'ownerName', title: '优化师', width: 240, flexGrow: 1 })
    if (isVisible('level')) cols.push({ key: 'level', title: '职级', width: 120 })
    if (isVisible('appCount')) cols.push({ key: 'appCount', title: '负责应用数', width: 130 })
    cols.push({ key: 'spend', title: '广告支出', width: 110 })
    if (isVisible('activeCampaignCount'))
      cols.push({ key: 'activeCampaignCount', title: '活跃系列数', width: 130 })
    if (isVisible('avgCpi')) cols.push({ key: 'avgCpi', title: '平均CPI', width: 110 })
    if (isVisible('avgCtr')) cols.push({ key: 'avgCtr', title: '平均点击率', width: 120 })
    if (isVisible('avgCvr')) cols.push({ key: 'avgCvr', title: '平均转化率', width: 120 })
    if (isVisible('roi1')) cols.push({ key: 'roi1', title: '首日ROI', width: 90 })
    if (isVisible('roi7')) cols.push({ key: 'roi7', title: '7日ROI', width: 90 })
    if (isVisible('estimatedProfit'))
      cols.push({ key: 'estimatedProfit', title: '预估利润', width: 120 })
    cols.push({ key: 'actions', title: '操作', width: 90, fixed: 'right', align: 'center' })
    return cols
  })

  const tableRef = ref<InstanceType<typeof ArtVirtualTable> | null>(null)

  defineExpose({ openCustomColumns: openDialog })

  // --- 枚举映射 ---
  const LEVEL_LABEL: Record<OwnerLevel, string> = {
    junior: '初级优化师',
    mid: '中级优化师',
    senior: '高级优化师'
  }
  const LEVEL_TAG_TYPE: Record<OwnerLevel, 'success' | 'warning' | 'info'> = {
    junior: 'info',
    mid: 'success',
    senior: 'warning'
  }

  function isOwnerRow(row: OwnerMixedRow): row is AdPerformanceOwnerRow {
    return row.ownerName != null && String(row.ownerName).trim() !== ''
  }

  function avatarText(name: string): string {
    const t = String(name ?? '').trim()
    return t ? t.slice(0, 1) : '?'
  }

  // --- 过滤数据 ---
  const tableData = computed(() => {
    const list = props.rows ?? []
    const kw = props.keyword?.trim().toLowerCase()
    if (!kw) return list
    return list
      .map((owner) => {
        if ((owner.ownerName ?? '').toLowerCase().includes(kw)) return owner
        const children =
          owner.children?.filter((c) => (c.campaignName ?? '').toLowerCase().includes(kw)) ?? []
        if (children.length) return { ...owner, children }
        return null
      })
      .filter(Boolean) as AdPerformanceOwnerRow[]
  })

  watch(
    () => props.keyword,
    (kw) => {
      if (kw?.trim()) tableRef.value?.expandAll()
      else tableRef.value?.collapseAll()
    }
  )

  function getRowClass({ rowData }: { rowData: OwnerMixedRow }): string {
    return isOwnerRow(rowData) ? 'is-level-owner' : 'is-level-owner-campaign'
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

  .ad-performance-owner__cell {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-owner__avatar {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 13px;
    font-weight: 800;
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 12%, transparent);
    border-radius: 9999px;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 30%, transparent) inset;
  }

  .ad-performance-owner__name {
    min-width: 0;
    overflow: hidden;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-owner__campaign {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-owner__campaign-name {
    min-width: 0;
    max-width: 360px;
    overflow: hidden;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
