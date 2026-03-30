<template>
  <div class="ad-performance-table-tab">
    <ElTable
      :data="tableData"
      row-key="id"
      :tree-props="treeProps"
      :default-expand-all="false"
      :expand-row-keys="expandedRowKeys"
      :row-class-name="getRowClassName"
      @expand-change="handleExpand"
      size="default"
      class="ad-performance-table__el-table"
    >
      <!-- 优化师 (required) -->
      <ElTableColumn label="优化师" min-width="220">
        <template #default="{ row }">
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
              <span class="ad-performance-table__channel">
                <span
                  class="ad-performance-table__channel-icon"
                  :class="`ad-performance-table__channel-icon--${row.channel ?? ''}`"
                  aria-hidden="true"
                  >{{ channelShort(row.channel) }}</span
                >
              </span>
              <span class="ad-performance-table__country" :title="row.country ?? ''">
                {{ countryFlag(row.country) }}
              </span>
            </div>
          </template>
        </template>
      </ElTableColumn>

      <!-- 职级 -->
      <ElTableColumn v-if="isVisible('level')" label="职级" width="120" align="left">
        <template #default="{ row }">
          <template v-if="isOwnerRow(row) && row.level">
            <ElTag :type="LEVEL_TAG_TYPE[row.level] ?? 'info'" size="small" effect="plain">
              {{ LEVEL_LABEL[row.level] ?? row.level }}
            </ElTag>
          </template>
          <span v-else class="ad-performance-table__muted">-</span>
        </template>
      </ElTableColumn>

      <!-- 负责应用数 -->
      <ElTableColumn v-if="isVisible('appCount')" label="负责应用数" width="120" align="left">
        <template #default="{ row }">
          <span v-if="isOwnerRow(row) && row.appCount != null">{{ row.appCount }} 个应用</span>
          <span v-else class="ad-performance-table__muted">-</span>
        </template>
      </ElTableColumn>

      <!-- 广告支出 (required) -->
      <ElTableColumn label="广告支出" width="110" align="left">
        <template #default="{ row }">{{ formatMoney(row.spend, 0) }}</template>
      </ElTableColumn>

      <!-- 活跃系列数 -->
      <ElTableColumn
        v-if="isVisible('activeCampaignCount')"
        label="活跃系列数"
        width="120"
        align="left"
      >
        <template #default="{ row }">
          <span v-if="isOwnerRow(row) && row.activeCampaignCount != null">
            {{ row.activeCampaignCount }} 个系列
          </span>
          <span v-else class="ad-performance-table__muted">-</span>
        </template>
      </ElTableColumn>

      <!-- 平均CPI -->
      <ElTableColumn v-if="isVisible('avgCpi')" label="平均CPI" width="100" align="left">
        <template #default="{ row }">
          <span v-if="isOwnerRow(row)">
            {{ row.avgCpi != null ? formatMoney(row.avgCpi, 2) : '—' }}
          </span>
          <span v-else>{{ row.cpi != null ? formatMoney(row.cpi, 2) : '—' }}</span>
        </template>
      </ElTableColumn>

      <!-- 平均点击率 -->
      <ElTableColumn v-if="isVisible('avgCtr')" label="平均点击率" width="110" align="left">
        <template #default="{ row }">
          <span v-if="isOwnerRow(row)">{{ row.avgCtr != null ? `${row.avgCtr}%` : '—' }}</span>
          <span v-else>{{ row.ctr != null ? `${row.ctr}%` : '—' }}</span>
        </template>
      </ElTableColumn>

      <!-- 平均转化率 -->
      <ElTableColumn v-if="isVisible('avgCvr')" label="平均转化率" width="110" align="left">
        <template #default="{ row }">
          <span v-if="isOwnerRow(row)">{{ row.avgCvr != null ? `${row.avgCvr}%` : '—' }}</span>
          <span v-else>{{ row.cvr != null ? `${row.cvr}%` : '—' }}</span>
        </template>
      </ElTableColumn>

      <!-- 首日ROI -->
      <ElTableColumn v-if="isVisible('roi1')" label="首日ROI" width="90" align="left">
        <template #default="{ row }">
          <span v-if="row.roi1 == null" class="ad-performance-table__muted">—</span>
          <span v-else :class="roiClass(row.roi1)">{{ row.roi1 }}%</span>
        </template>
      </ElTableColumn>

      <!-- 7日ROI -->
      <ElTableColumn v-if="isVisible('roi7')" label="7日ROI" width="90" align="left">
        <template #default="{ row }">
          <span v-if="row.roi7 == null" class="ad-performance-table__muted">—</span>
          <span v-else :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
        </template>
      </ElTableColumn>

      <!-- 预估利润 -->
      <ElTableColumn
        v-if="isVisible('estimatedProfit')"
        label="预估利润"
        min-width="110"
        align="left"
      >
        <template #default="{ row }">
          <span v-if="row.estimatedProfit == null" class="ad-performance-table__muted">—</span>
          <span v-else :class="profitClass(row.estimatedProfit)">
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
  import type {
    AdPerformanceOwnerRow,
    AdPerformanceOwnerCampaignRow,
    OwnerLevel
  } from '../../types'
  import { useTabColumnVisibility } from '../../composables/useTabColumnVisibility'
  import { useTabExpand } from '../../composables/useTabExpand'
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

  defineExpose({ openCustomColumns: openDialog })

  // --- 展开状态 ---
  const { expandedRowKeys, onExpandChange } = useTabExpand(() => props.keyword)
  const treeProps = { children: 'children', hasChildren: 'hasChildren' } as const

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

  // --- 行类型判断 ---
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

  function getRowClassName({ row }: { row: OwnerMixedRow }) {
    return isOwnerRow(row) ? 'is-level-owner' : 'is-level-owner-campaign'
  }

  function handleExpand(row: OwnerMixedRow) {
    if (!isOwnerRow(row)) return
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
