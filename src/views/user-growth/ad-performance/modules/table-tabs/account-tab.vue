<template>
  <div class="ad-performance-table-tab">
    <ArtVirtualTable
      ref="tableRef"
      :columns="visibleColumns"
      :data="tableData"
      expand-column-key="accountName"
      :row-class="getRowClass"
    >
      <!-- 广告账户 -->
      <template #cell:accountName="{ row }">
        <template v-if="isAccountRow(row)">
          <div class="ad-performance-account__cell">
            <span class="ad-performance-account__name" :title="row.accountName ?? ''">
              {{ row.accountName }}
            </span>
            <ElTag
              v-if="row.status"
              :type="ACCOUNT_STATUS_TAG_TYPE[row.status ?? ''] ?? 'info'"
              size="small"
              effect="plain"
            >
              {{ ACCOUNT_STATUS_LABEL[row.status ?? ''] ?? String(row.status) }}
            </ElTag>
          </div>
        </template>
        <template v-else>
          <div class="ad-performance-account__campaign">
            <span class="ad-performance-table__app-icon" aria-hidden="true"></span>
            <span class="ad-performance-account__campaign-name" :title="row.campaignName ?? ''">
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

      <!-- 平台 -->
      <template #cell:platform="{ row }">
        <template v-if="isAccountRow(row)">
          <span
            class="ad-performance-account__platform-icon"
            :class="`ad-performance-account__platform-icon--${row.platform ?? ''}`"
            :title="row.platform ?? ''"
          >
            {{ channelShort(row.platform) }}
          </span>
        </template>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 账户余额 -->
      <template #cell:balance="{ row }">
        <span v-if="isAccountRow(row) && row.balance != null">
          {{ formatMoney(row.balance, 0) }}
        </span>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 广告支出 -->
      <template #cell:spend="{ row }">{{ formatMoney(row.spend, 0) }}</template>

      <!-- 预算进度 -->
      <template #cell:budgetProgressPercent="{ row }">
        <template v-if="isAccountRow(row) && row.budgetProgressPercent != null">
          <div class="ad-performance-table__progress-cell">
            <div class="ad-performance-table__progress-bg">
              <div
                class="ad-performance-table__progress-fill"
                :class="budgetProgressClass(row.budgetProgressPercent)"
                :style="{ width: `${row.budgetProgressPercent}%` }"
              ></div>
            </div>
            <span class="ad-performance-table__progress-text">
              {{ row.budgetProgressPercent }}%
            </span>
          </div>
        </template>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 活跃系列数 -->
      <template #cell:activeCampaignCount="{ row }">
        <span v-if="isAccountRow(row) && row.activeCampaignCount != null">
          {{ row.activeCampaignCount }} 个系列
        </span>
        <span v-else class="ad-performance-table__muted">-</span>
      </template>

      <!-- 平均CPI -->
      <template #cell:avgCpi="{ row }">
        <span v-if="isAccountRow(row)">
          {{ row.avgCpi != null ? formatMoney(row.avgCpi, 2) : '—' }}
        </span>
        <span v-else>{{ row.cpi != null ? formatMoney(row.cpi, 2) : '—' }}</span>
      </template>

      <!-- 平均点击率 -->
      <template #cell:avgCtr="{ row }">
        <span v-if="isAccountRow(row)">{{ row.avgCtr != null ? `${row.avgCtr}%` : '—' }}</span>
        <span v-else>{{ row.ctr != null ? `${row.ctr}%` : '—' }}</span>
      </template>

      <!-- 平均转化率 -->
      <template #cell:avgCvr="{ row }">
        <span v-if="isAccountRow(row)">{{ row.avgCvr != null ? `${row.avgCvr}%` : '—' }}</span>
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
  import type { AdPerformanceAccountRow, AdPerformanceAccountCampaignRow } from '../../types'
  import { useTabColumnVisibility } from '../../composables/useTabColumnVisibility'
  import {
    channelShort,
    countryFlag,
    formatMoney,
    roiClass,
    profitClass
  } from '../../utils/tab-utils'

  defineOptions({ name: 'AdPerformanceAccountTab' })

  type AccountMixedRow = AdPerformanceAccountRow | AdPerformanceAccountCampaignRow

  const props = withDefaults(
    defineProps<{
      rows: AdPerformanceAccountRow[]
      keyword?: string
    }>(),
    { rows: () => [], keyword: '' }
  )

  defineEmits<{ (e: 'detail', row: AccountMixedRow): void }>()

  // --- 列可见性 ---
  const ALL_COLUMNS = [
    { key: 'accountName', label: '广告账户', required: true },
    { key: 'platform', label: '平台' },
    { key: 'balance', label: '账户余额' },
    { key: 'spend', label: '广告支出', required: true },
    { key: 'budgetProgressPercent', label: '预算进度' },
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
  } = useTabColumnVisibility('ad-performance:table:account:visible-columns', ALL_COLUMNS)

  const visibleColumns = computed<ArtVirtualTableColumn[]>(() => {
    const cols: ArtVirtualTableColumn[] = []
    cols.push({ key: 'accountName', title: '广告账户', width: 240, flexGrow: 1 })
    if (isVisible('platform')) cols.push({ key: 'platform', title: '平台', width: 90 })
    if (isVisible('balance')) cols.push({ key: 'balance', title: '账户余额', width: 110 })
    cols.push({ key: 'spend', title: '广告支出', width: 110 })
    if (isVisible('budgetProgressPercent'))
      cols.push({ key: 'budgetProgressPercent', title: '预算进度', width: 170 })
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

  // --- 状态枚举映射 ---
  const ACCOUNT_STATUS_LABEL: Record<string, string> = {
    sufficient: '充足',
    low_balance: '低余额',
    insufficient: '余额不足',
    over_budget: '超预算',
    active: '激活',
    paused: '已暂停',
    low_efficiency: '低效'
  }
  const ACCOUNT_STATUS_TAG_TYPE: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    sufficient: 'success',
    low_balance: 'warning',
    insufficient: 'danger',
    over_budget: 'warning',
    active: 'success',
    paused: 'info',
    low_efficiency: 'warning'
  }

  function isAccountRow(row: AccountMixedRow): row is AdPerformanceAccountRow {
    return row.accountName != null && String(row.accountName).trim() !== ''
  }

  function budgetProgressClass(percent: number): string {
    if (percent >= 90) return 'ad-performance-table__progress-fill--danger'
    if (percent >= 75) return 'ad-performance-table__progress-fill--warning'
    return 'ad-performance-table__progress-fill--success'
  }

  // --- 过滤数据 ---
  const tableData = computed(() => {
    const list = props.rows ?? []
    const kw = props.keyword?.trim().toLowerCase()
    if (!kw) return list
    return list
      .map((acc) => {
        if ((acc.accountName ?? '').toLowerCase().includes(kw)) return acc
        const children =
          acc.children?.filter((c) => (c.campaignName ?? '').toLowerCase().includes(kw)) ?? []
        if (children.length) return { ...acc, children }
        return null
      })
      .filter(Boolean) as AdPerformanceAccountRow[]
  })

  watch(
    () => props.keyword,
    (kw) => {
      if (kw?.trim()) tableRef.value?.expandAll()
      else tableRef.value?.collapseAll()
    }
  )

  function getRowClass({ rowData }: { rowData: AccountMixedRow }): string {
    return isAccountRow(rowData) ? 'is-level-account' : 'is-level-account-campaign'
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

  .ad-performance-account__cell {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-account__name {
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .ad-performance-account__platform-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 12px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    background: color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 6px;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-primary) 35%, transparent) inset;
  }

  .ad-performance-account__campaign {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-account__campaign-name {
    min-width: 0;
    max-width: 360px;
    overflow: hidden;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
