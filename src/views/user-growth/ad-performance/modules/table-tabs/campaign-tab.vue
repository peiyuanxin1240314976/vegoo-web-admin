<template>
  <div class="ad-performance-table-tab">
    <ElTable
      :key="lazyMode ? 'lazy' : 'normal'"
      :data="tableData"
      row-key="id"
      :tree-props="treeProps"
      :default-expand-all="!lazyMode"
      :lazy="lazyMode"
      :load="lazyMode ? loadChildren : undefined"
      :row-class-name="getRowClassName"
      :row-style="getRowStyle"
      size="default"
      class="ad-performance-table__el-table"
    >
      <!-- 应用 (required) -->
      <ElTableColumn show-overflow-tooltip label="应用" min-width="100">
        <template #default="{ row }">
          <div class="ad-performance-table__dim">
            <span v-if="isNestedRow(row)" class="ad-performance-table__badge" aria-hidden="true"
              >AD</span
            >
            <span v-else class="ad-performance-table__app-icon" aria-hidden="true"></span>
            <span class="ad-performance-table__dim-main" :title="row.appName">
              {{ isNestedRow(row) ? '' : row.appName }}
            </span>
          </div>
        </template>
      </ElTableColumn>

      <!-- 广告系列名称 (required) -->
      <ElTableColumn show-overflow-tooltip label="广告系列名称" min-width="150">
        <template #default="{ row }">
          <div class="ad-performance-table__dim">
            <span class="ad-performance-table__dim-main" :title="row.name">{{ row.name }}</span>
          </div>
        </template>
      </ElTableColumn>

      <!-- 广告平台 -->
      <ElTableColumn
        v-if="isVisible('channel')"
        show-overflow-tooltip
        label="广告平台"
        width="100"
        align="left"
      >
        <template #default="{ row }">
          <span v-if="isNestedRow(row)" class="ad-performance-table__muted">-</span>
          <span v-else class="ad-performance-table__channel">
            <span
              class="ad-performance-table__channel-icon"
              :class="`ad-performance-table__channel-icon--${row.channel}`"
              aria-hidden="true"
              >{{ channelShort(row.channel) }}</span
            >
          </span>
        </template>
      </ElTableColumn>

      <!-- 国家 -->
      <ElTableColumn
        v-if="isVisible('country')"
        show-overflow-tooltip
        label="国家"
        width="80"
        align="left"
      >
        <template #default="{ row }">
          <span v-if="isNestedRow(row)" class="ad-performance-table__muted">-</span>
          <span v-else class="ad-performance-table__country" :title="row.country">
            {{ countryFlag(row.country) }}
          </span>
        </template>
      </ElTableColumn>

      <!-- 状态 -->
      <ElTableColumn v-if="isVisible('status')" label="状态" width="100" align="left">
        <template #default="{ row }">
          <ElTag :type="statusTagType(row.status)" size="small" effect="plain">
            {{ statusLabel(row.status) }}
          </ElTag>
        </template>
      </ElTableColumn>

      <!-- 花费/预算 -->
      <ElTableColumn v-if="isVisible('spendBudget')" label="花费/预算" min-width="130" align="left">
        <template #default="{ row }">
          {{ formatMoney(row.spend, 0) }}/{{ formatMoney(row.budget, 0) }}
          <span class="ad-performance-table__percent">({{ row.spendBudgetPercent }}%)</span>
        </template>
      </ElTableColumn>

      <!-- CPI -->
      <ElTableColumn v-if="isVisible('cpi')" label="CPI" width="80" align="left">
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

      <!-- 7日ROI -->
      <ElTableColumn v-if="isVisible('roi7')" label="7日ROI" width="90" align="left">
        <template #default="{ row }">
          <span :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
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
      /** 父行 id -> 子行数组（展开时 ElTable lazy/load 读取） */
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

  defineExpose({ openCustomColumns: openDialog })

  // 无关键字时用懒加载（初始只渲染父行），有关键字时全树渲染以显示匹配子行
  const lazyMode = computed(() => !props.keyword?.trim())

  const treeProps = { children: 'children', hasChildren: 'hasChildren' } as const

  // 懒加载回调：从内存 Map 即时返回，无网络请求
  function loadChildren(
    row: AdPerformanceCampaignRow,
    _treeNode: unknown,
    resolve: (data: AdPerformanceCampaignRow[]) => void
  ) {
    resolve(props.childrenMap?.get(row.id) ?? [])
  }

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

  // --- 行类型判断 ---
  function isNestedRow(row: AdPerformanceCampaignRow): boolean {
    return String(row.id ?? '').includes('-') || String(row.name ?? '').startsWith('AdGroup_')
  }

  // --- 过滤 + 懒加载数据准备 ---
  const tableData = computed(() => {
    const list = props.rows ?? []
    const kw = props.keyword?.trim().toLowerCase()
    if (!kw) {
      // 懒加载模式：父组件已剥离 children；这里只需保证 hasChildren 存在即可
      return list
    }
    // 关键字模式：全树过滤，结果由 :default-expand-all="true" 自动展开
    const fullTree = list.map((row) => ({
      ...row,
      children: props.childrenMap?.get(row.id) ?? []
    }))
    const filter = (rows: AdPerformanceCampaignRow[]): AdPerformanceCampaignRow[] =>
      rows
        .map((row) => {
          const match =
            row.appName.toLowerCase().includes(kw) ||
            row.name.toLowerCase().includes(kw) ||
            row.channel.toLowerCase().includes(kw) ||
            row.country.toLowerCase().includes(kw)
          if (match) return row
          if (row.children?.length) {
            const filtered = filter(row.children)
            if (filtered.length) return { ...row, children: filtered }
          }
          return null
        })
        .filter(Boolean) as AdPerformanceCampaignRow[]
    return filter(fullTree)
  })

  // rowStyleMap 从 props.rows + childrenMap 遍历（懒加载时 props.rows 无 children）
  const rowStyleMap = computed(() => {
    const map = new Map<string, Record<string, string>>()
    for (const row of props.rows ?? []) {
      map.set(row.id, { '--row-accent': accentColor(row.channel) })
      const children = props.childrenMap?.get(row.id) ?? []
      for (const child of children)
        map.set(child.id, { '--row-accent': accentColor(child.channel) })
    }
    return map
  })

  function getRowStyle({ row }: { row: AdPerformanceCampaignRow }) {
    return rowStyleMap.value.get(row.id) ?? {}
  }

  function getRowClassName({ row }: { row: AdPerformanceCampaignRow }) {
    return isNestedRow(row) ? 'is-level-adgroup' : 'is-level-campaign'
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
</style>
