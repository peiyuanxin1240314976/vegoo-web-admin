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
      stripe
      size="default"
      class="ad-performance-table__el-table"
      @expand-change="onExpandChange"
    >
      <ElTableColumn
        v-for="col in visibleColumnDefs"
        :key="col.key"
        :label="col.label"
        :prop="col.prop || undefined"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
      >
        <template #default="{ row }">
          <template v-if="col.key === 'country'">
            <template v-if="isCountryAggregateRow(row)">
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
                  >
                    {{ channelShort(row.channel) }}
                  </span>
                </span>
                <span class="ad-performance-table__country" :title="row.country">
                  {{ countryFlag(row.country) }}
                </span>
              </div>
            </template>
          </template>
          <template v-else-if="col.key === 'spend'">
            {{ formatMoney(rowSpend(row), 0) }}
          </template>
          <template v-else-if="col.key === 'spendSharePercent'">
            <template v-if="isCountryAggregateRow(row)">
              <div class="ad-performance-table__progress-cell">
                <div class="ad-performance-table__progress-bg">
                  <div
                    class="ad-performance-table__progress-fill ad-performance-table__progress-fill--teal"
                    :style="{ width: `${row.spendSharePercent}%` }"
                  ></div>
                </div>
                <span class="ad-performance-table__progress-text"
                  >{{ row.spendSharePercent }}%</span
                >
              </div>
            </template>
            <span v-else class="ad-performance-table__muted">-</span>
          </template>
          <template v-else-if="col.key === 'cpi'">{{ formatMoney(rowCpi(row), 2) }}</template>
          <template v-else-if="col.key === 'ctr'">{{ rowCtr(row) }}%</template>
          <template v-else-if="col.key === 'cvr'">{{ rowCvr(row) }}%</template>
          <template v-else-if="col.key === 'roi1'">
            <span :class="roiClass(row.roi1)">{{ row.roi1 }}%</span>
          </template>
          <template v-else-if="col.key === 'roi3'">
            <span v-if="isCountryAggregateRow(row)" :class="roiClass(row.roi3)"
              >{{ row.roi3 }}%</span
            >
            <span v-else class="ad-performance-table__muted">-</span>
          </template>
          <template v-else-if="col.key === 'roi7'">
            <span :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
          </template>
          <template v-else-if="col.key === 'roiTotal'">
            <span v-if="isCountryAggregateRow(row)" :class="roiClass(row.roiTotal)"
              >{{ row.roiTotal }}%</span
            >
            <span v-else class="ad-performance-table__muted">-</span>
          </template>
          <template v-else-if="col.key === 'estimatedProfit'">
            <span :class="profitClass(rowEstimatedProfit(row))">
              {{ rowEstimatedProfit(row) >= 0 ? '+' : ''
              }}{{ formatMoney(rowEstimatedProfit(row), 0) }}
            </span>
          </template>
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="90" align="center" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="emit('detail', row)">详情</ElButton>
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
  import type { AdPerformanceCampaignRow, AdPerformanceCountryRow } from '../../types'

  defineOptions({ name: 'AdPerformanceCountryTab' })

  type CountryMixedRow = AdPerformanceCountryRow | AdPerformanceCampaignRow

  type ColumnKey =
    | 'country'
    | 'spend'
    | 'spendSharePercent'
    | 'cpi'
    | 'ctr'
    | 'cvr'
    | 'roi1'
    | 'roi3'
    | 'roi7'
    | 'roiTotal'
    | 'estimatedProfit'

  type ColumnDef = {
    key: ColumnKey
    label: string
    prop?: keyof AdPerformanceCountryRow
    width?: number
    minWidth?: number
    align?: 'left' | 'center' | 'right'
    required?: boolean
  }

  const props = withDefaults(
    defineProps<{
      rows: AdPerformanceCountryRow[]
      keyword?: string
    }>(),
    { rows: () => [], keyword: '' }
  )

  const emit = defineEmits<{
    (e: 'detail', row: CountryMixedRow): void
  }>()

  const expandedRowKeys = ref<string[]>([])

  watch(
    () => props.keyword,
    () => {
      expandedRowKeys.value = []
    }
  )

  const STORAGE_KEY_COLUMNS = 'ad-performance:table:country:visible-columns'

  const ALL_COLUMNS: ColumnDef[] = [
    { key: 'country', label: '国家', prop: 'country', minWidth: 200, required: true },
    { key: 'spend', label: '广告支出', prop: 'spend', width: 110, align: 'right', required: true },
    { key: 'spendSharePercent', label: '支出占比', prop: 'spendSharePercent', minWidth: 150 },
    { key: 'cpi', label: 'CPI', prop: 'cpi', width: 90, align: 'right' },
    { key: 'ctr', label: '点击率', prop: 'ctr', width: 100, align: 'right' },
    { key: 'cvr', label: '转化率', prop: 'cvr', width: 100, align: 'right' },
    { key: 'roi1', label: '首日ROI', prop: 'roi1', width: 90, align: 'right' },
    { key: 'roi3', label: '3日ROI', prop: 'roi3', width: 90, align: 'right' },
    { key: 'roi7', label: '7日ROI', prop: 'roi7', width: 90, align: 'right' },
    { key: 'roiTotal', label: '累ROI', prop: 'roiTotal', width: 90, align: 'right' },
    {
      key: 'estimatedProfit',
      label: '预估利润',
      prop: 'estimatedProfit',
      minWidth: 100,
      align: 'right'
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

  function isCountryAggregateRow(row: CountryMixedRow): row is AdPerformanceCountryRow {
    return Object.prototype.hasOwnProperty.call(row, 'spendSharePercent')
  }

  function filterCampaignRowsTree(
    rows: AdPerformanceCampaignRow[],
    kw: string
  ): AdPerformanceCampaignRow[] {
    if (!kw) return rows
    return rows
      .map((row) => {
        const match =
          row.appName.toLowerCase().includes(kw) ||
          row.name.toLowerCase().includes(kw) ||
          row.channel.toLowerCase().includes(kw) ||
          row.country.toLowerCase().includes(kw)
        if (match) return row
        if (row.children?.length) {
          const filtered = filterCampaignRowsTree(row.children, kw)
          if (filtered.length) return { ...row, children: filtered }
        }
        return null
      })
      .filter(Boolean) as AdPerformanceCampaignRow[]
  }

  function filterCountryRows(
    rows: AdPerformanceCountryRow[],
    kw: string
  ): AdPerformanceCountryRow[] {
    if (!kw) return rows
    return rows
      .map((row) => {
        if (row.country.toLowerCase().includes(kw)) return row
        if (row.children?.length) {
          const filtered = filterCampaignRowsTree(row.children, kw)
          if (filtered.length) return { ...row, children: filtered }
        }
        return null
      })
      .filter(Boolean) as AdPerformanceCountryRow[]
  }

  const tableData = computed(() => filterCountryRows(props.rows ?? [], props.keyword?.trim() ?? ''))

  function rowSpend(row: CountryMixedRow) {
    return row.spend
  }

  function rowCpi(row: CountryMixedRow) {
    return row.cpi
  }

  function rowCtr(row: CountryMixedRow) {
    return row.ctr
  }

  function rowCvr(row: CountryMixedRow) {
    return row.cvr
  }

  function rowEstimatedProfit(row: CountryMixedRow) {
    return row.estimatedProfit
  }

  function onExpandChange(row: CountryMixedRow) {
    if (!isCountryAggregateRow(row)) return
    const id = row.id
    const idx = expandedRowKeys.value.indexOf(id)
    if (idx >= 0) expandedRowKeys.value.splice(idx, 1)
    else expandedRowKeys.value.push(id)
  }

  const LEVEL_ACCENT_COLORS: Record<string, string> = {
    google: '#3B82F6',
    facebook: '#2563EB',
    tiktok: '#10B981',
    meta: '#8B5CF6',
    kwai: '#F97316',
    mintegral: '#EC4899'
  }

  function getRowAccentColor(row: CountryMixedRow) {
    const ch = String((row as AdPerformanceCampaignRow).channel ?? '')
    return LEVEL_ACCENT_COLORS[ch] ?? 'var(--art-success)'
  }

  function getRowClassName({ row }: { row: CountryMixedRow }) {
    return isCountryAggregateRow(row) ? 'is-level-country' : 'is-level-country-campaign'
  }

  function getRowStyle({ row }: { row: CountryMixedRow }) {
    const color = getRowAccentColor(row)
    return { '--row-accent': color } as Record<string, string>
  }

  function formatMoney(n: number, digits: 0 | 2) {
    return (
      '$' +
      n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    )
  }

  function roiClass(roi: number): string {
    return roi >= 80 ? 'ad-performance-table__roi--up' : 'ad-performance-table__roi--down'
  }

  function profitClass(profit: number): string {
    return profit >= 0 ? 'ad-performance-table__profit--up' : 'ad-performance-table__profit--down'
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

  function countryLabel(country: string) {
    const c = String(country ?? '').toUpperCase()
    const map: Record<string, string> = {
      US: '美国(US)',
      UK: '英国(UK)',
      CA: '加拿大(CA)',
      JP: '日本(JP)',
      BR: '巴西(BR)',
      MX: '墨西哥(MX)',
      CO: '哥伦比亚(CO)',
      AR: '阿根廷(AR)',
      TH: '泰国(TH)',
      VN: '越南(VN)',
      ES: '西班牙(ES)'
    }
    return map[c] ?? c
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
