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
      @expand-change="onExpandChange"
      stripe
      size="default"
      class="ad-performance-table__el-table"
    >
      <ElTableColumn
        show-overflow-tooltip
        v-for="col in visibleColumnDefs"
        :key="col.key"
        :label="col.label"
        :prop="col.prop || undefined"
        :width="col.width"
        :min-width="col.minWidth"
        align="left"
      >
        <template #default="{ row }">
          <template v-if="col.key === 'appName'">
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
          <template v-else-if="col.key === 'name'">
            <div class="ad-performance-table__dim">
              <span class="ad-performance-table__dim-main" :title="row.name">{{ row.name }}</span>
            </div>
          </template>
          <template v-else-if="col.key === 'channel'">
            <span v-if="isNestedRow(row)" class="ad-performance-table__muted">-</span>
            <span v-else class="ad-performance-table__channel">
              <span
                class="ad-performance-table__channel-icon"
                :class="`ad-performance-table__channel-icon--${row.channel}`"
                aria-hidden="true"
              >
                {{ channelShort(row.channel) }}
              </span>
            </span>
          </template>
          <template v-else-if="col.key === 'country'">
            <span v-if="isNestedRow(row)" class="ad-performance-table__muted">-</span>
            <span v-else class="ad-performance-table__country" :title="row.country">
              {{ countryFlag(row.country) }}
            </span>
          </template>
          <template v-else-if="col.key === 'status'">
            <ElTag :type="statusTagType(row.status)" size="small" effect="plain">
              {{ statusLabel(row.status) }}
            </ElTag>
          </template>
          <template v-else-if="col.key === 'spendBudget'">
            {{ formatMoney(row.spend, 0) }}/{{ formatMoney(row.budget, 0) }}
            <span class="ad-performance-table__percent">({{ row.spendBudgetPercent }}%)</span>
          </template>
          <template v-else-if="col.key === 'cpi'">{{ formatMoney(row.cpi, 2) }}</template>
          <template v-else-if="col.key === 'ctr'">{{ row.ctr }}%</template>
          <template v-else-if="col.key === 'cvr'">{{ row.cvr }}%</template>
          <template v-else-if="col.key === 'roi1'">
            <span :class="roiClass(row.roi1)">{{ row.roi1 }}%</span>
          </template>
          <template v-else-if="col.key === 'roi7'">
            <span :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
          </template>
          <template v-else-if="col.key === 'estimatedProfit'">
            <span :class="profitClass(row.estimatedProfit)">
              {{ row.estimatedProfit >= 0 ? '+' : '' }}{{ formatMoney(row.estimatedProfit, 0) }}
            </span>
          </template>
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="90" align="center" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="$emit('detail', row)"> 详情 </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElDialog
      v-model="customColumnsVisible"
      width="520px"
      :close-on-click-modal="false"
      title="自定义列"
    >
      <div class="ad-performance-table__custom-header">
        <ElCheckbox v-model="customAllChecked" :indeterminate="customIndeterminate"
          >全选</ElCheckbox
        >
        <ElButton link type="primary" @click="onCustomReset">重置</ElButton>
      </div>
      <ElCheckboxGroup v-model="customCheckedKeys" class="ad-performance-table__custom-grid">
        <ElCheckbox
          v-for="opt in ALL_COLUMNS"
          :key="opt.key"
          :label="opt.key"
          :disabled="opt.required"
        >
          {{ opt.label }}
        </ElCheckbox>
      </ElCheckboxGroup>
      <template #footer>
        <ElButton round @click="customColumnsVisible = false">取消</ElButton>
        <ElButton round type="primary" @click="onCustomConfirm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { AdPerformanceCampaignRow, CampaignRowStatus } from '../../types'

  defineOptions({ name: 'AdPerformanceCampaignTab' })

  type ColumnKey =
    | 'appName'
    | 'name'
    | 'channel'
    | 'country'
    | 'status'
    | 'spendBudget'
    | 'cpi'
    | 'ctr'
    | 'cvr'
    | 'roi1'
    | 'roi7'
    | 'estimatedProfit'

  type ColumnDef = {
    key: ColumnKey
    label: string
    prop?: keyof AdPerformanceCampaignRow
    width?: number
    minWidth?: number
    align?: 'left' | 'center' | 'right'
    required?: boolean
  }

  const props = withDefaults(
    defineProps<{
      data: AdPerformanceCampaignRow[]
      keyword?: string
    }>(),
    { data: () => [], keyword: '' }
  )

  defineEmits<{
    (e: 'detail', row: AdPerformanceCampaignRow): void
  }>()

  const expandedRowKeys = ref<string[]>([])

  watch(
    () => props.keyword,
    () => {
      expandedRowKeys.value = []
    }
  )

  const STORAGE_KEY_COLUMNS = 'ad-performance:table:campaign:visible-columns'

  const ALL_COLUMNS: ColumnDef[] = [
    { key: 'appName', label: '应用', prop: 'appName', minWidth: 100, required: true },
    { key: 'name', label: '广告系列名称', prop: 'name', minWidth: 150, required: true },
    { key: 'channel', label: '广告平台', prop: 'channel', width: 100 },
    { key: 'country', label: '国家', prop: 'country', width: 80 },
    { key: 'status', label: '状态', prop: 'status', width: 100, align: 'left' },
    { key: 'spendBudget', label: '花费/预算', minWidth: 130, align: 'left' },
    { key: 'cpi', label: 'CPI', prop: 'cpi', width: 80, align: 'left' },
    { key: 'ctr', label: '点击率', prop: 'ctr', width: 100, align: 'left' },
    { key: 'cvr', label: '转化率', prop: 'cvr', width: 100, align: 'left' },
    { key: 'roi1', label: '首日ROI', prop: 'roi1', width: 90, align: 'left' },
    { key: 'roi7', label: '7日ROI', prop: 'roi7', width: 90, align: 'left' },
    {
      key: 'estimatedProfit',
      label: '预估利润',
      prop: 'estimatedProfit',
      minWidth: 100,
      align: 'left'
    }
  ]

  const requiredKeys = computed<ColumnKey[]>(() =>
    ALL_COLUMNS.filter((c) => c.required).map((c) => c.key)
  )

  function loadVisibleKeys(): ColumnKey[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COLUMNS)
      if (!raw) return ALL_COLUMNS.map((c) => c.key)
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return ALL_COLUMNS.map((c) => c.key)
      const set = new Set(parsed.filter((k) => typeof k === 'string') as string[])
      const keys = ALL_COLUMNS.map((c) => c.key).filter((k) => set.has(k))
      for (const k of requiredKeys.value) {
        if (!keys.includes(k)) keys.unshift(k)
      }
      return keys
    } catch {
      return ALL_COLUMNS.map((c) => c.key)
    }
  }

  const visibleColumnKeys = ref<ColumnKey[]>(loadVisibleKeys())

  watch(
    visibleColumnKeys,
    (val) => {
      localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(val))
    },
    { deep: true }
  )

  const visibleColumnDefs = computed<ColumnDef[]>(() => {
    const set = new Set(visibleColumnKeys.value)
    return ALL_COLUMNS.filter((c) => set.has(c.key))
  })

  const customColumnsVisible = ref(false)
  const customCheckedKeys = ref<ColumnKey[]>([])

  const customAllChecked = computed({
    get() {
      return customCheckedKeys.value.length === ALL_COLUMNS.length
    },
    set(val: boolean) {
      customCheckedKeys.value = val ? ALL_COLUMNS.map((c) => c.key) : [...requiredKeys.value]
    }
  })

  const customIndeterminate = computed(() => {
    const len = customCheckedKeys.value.length
    return len > 0 && len < ALL_COLUMNS.length
  })

  function openCustomColumns() {
    customCheckedKeys.value = [...visibleColumnKeys.value]
    customColumnsVisible.value = true
  }

  function onCustomReset() {
    customCheckedKeys.value = ALL_COLUMNS.map((c) => c.key)
  }

  function onCustomConfirm() {
    const set = new Set(customCheckedKeys.value)
    for (const k of requiredKeys.value) set.add(k)
    visibleColumnKeys.value = ALL_COLUMNS.map((c) => c.key).filter((k) => set.has(k))
    customColumnsVisible.value = false
  }

  defineExpose({ openCustomColumns })

  const treeProps = { children: 'children', hasChildren: 'hasChildren' } as const

  const filteredData = computed(() => {
    const list = props.data ?? []
    const kw = props.keyword?.trim().toLowerCase()
    if (!kw) return list
    const filterTree = (rows: AdPerformanceCampaignRow[]): AdPerformanceCampaignRow[] =>
      rows
        .map((row) => {
          const match =
            row.appName.toLowerCase().includes(kw) ||
            row.name.toLowerCase().includes(kw) ||
            row.channel.toLowerCase().includes(kw) ||
            row.country.toLowerCase().includes(kw)
          if (match) return row
          if (row.children?.length) {
            const filtered = filterTree(row.children)
            if (filtered.length) return { ...row, children: filtered }
          }
          return null
        })
        .filter(Boolean) as AdPerformanceCampaignRow[]
    return filterTree(list)
  })

  const tableData = computed(() => filteredData.value)

  function formatMoney(n: number, digits: 0 | 2) {
    return (
      '$' +
      n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    )
  }

  function channelShort(channel: string) {
    const map: Record<string, string> = {
      google: 'G',
      facebook: 'F',
      tiktok: 'T',
      meta: 'M',
      kwai: 'K',
      mintegral: 'Mi'
    }
    return (
      map[channel] ??
      String(channel ?? '')
        .slice(0, 1)
        .toUpperCase()
    )
  }

  function isNestedRow(row: AdPerformanceCampaignRow) {
    const id = String(row.id ?? '')
    if (id.includes('-')) return true
    return String(row.name ?? '').startsWith('AdGroup_')
  }

  function countryFlag(country: string) {
    const c = String(country ?? '').toUpperCase()
    const map: Record<string, string> = {
      US: '🇺🇸',
      UK: '🇬🇧',
      CA: '🇨🇦',
      JP: '🇯🇵',
      BR: '🇧🇷',
      MX: '🇲🇽',
      CO: '🇨🇴',
      AR: '🇦🇷',
      TH: '🇹🇭',
      VN: '🇻🇳',
      ES: '🇪🇸'
    }
    return map[c] ?? c
  }

  const LEVEL_ACCENT_COLORS: Record<string, string> = {
    google: '#3B82F6',
    facebook: '#2563EB',
    tiktok: '#10B981',
    meta: '#8B5CF6',
    kwai: '#F97316',
    mintegral: '#EC4899'
  }

  function getRowAccentColor(row: AdPerformanceCampaignRow) {
    const ch = String(row.channel ?? '')
    return LEVEL_ACCENT_COLORS[ch] ?? 'var(--art-success)'
  }

  function getRowClassName({ row }: { row: AdPerformanceCampaignRow }) {
    return isNestedRow(row) ? 'is-level-adgroup' : 'is-level-campaign'
  }

  function getRowStyle({ row }: { row: AdPerformanceCampaignRow }) {
    const color = getRowAccentColor(row)
    return { '--row-accent': color } as Record<string, string>
  }

  function onExpandChange(row: AdPerformanceCampaignRow) {
    const id = row.id
    const idx = expandedRowKeys.value.indexOf(id)
    if (idx >= 0) expandedRowKeys.value.splice(idx, 1)
    else expandedRowKeys.value.push(id)
  }

  function statusLabel(s: CampaignRowStatus): string {
    const map: Record<CampaignRowStatus, string> = {
      active: '激活',
      over_budget: '超预算',
      low_efficiency: '低效',
      paused: '暂停'
    }
    return map[s] ?? s
  }

  function statusTagType(s: CampaignRowStatus): 'success' | 'danger' | 'warning' | 'info' {
    const map: Record<CampaignRowStatus, 'success' | 'danger' | 'warning' | 'info'> = {
      active: 'success',
      over_budget: 'danger',
      low_efficiency: 'warning',
      paused: 'info'
    }
    return map[s] ?? 'info'
  }

  function roiClass(roi: number): string {
    return roi >= 80 ? 'ad-performance-table__roi--up' : 'ad-performance-table__roi--down'
  }

  function profitClass(profit: number): string {
    return profit >= 0 ? 'ad-performance-table__profit--up' : 'ad-performance-table__profit--down'
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
