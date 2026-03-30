<template>
  <div class="ad-performance-table-tab">
    <ElTable
      :data="data"
      row-key="id"
      :tree-props="treeProps"
      :default-expand-all="false"
      :expand-row-keys="expandedRowKeys"
      :row-class-name="getRowClassName"
      @expand-change="onExpandChange"
      stripe
      size="default"
      class="ad-performance-table__el-table"
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
          <template v-if="col.key === 'accountName'">
            <template v-if="isAccountRow(row)">
              <div class="ad-performance-account__cell">
                <span class="ad-performance-account__name" :title="row.accountName ?? ''">
                  {{ row.accountName }}
                </span>
                <ElTag
                  v-if="row.status"
                  :type="accountStatusTagType(row.status)"
                  size="small"
                  effect="plain"
                >
                  {{ accountStatusLabel(row.status) }}
                </ElTag>
              </div>
            </template>
            <template v-else>
              <div class="ad-performance-account__campaign">
                <span class="ad-performance-table__app-icon" aria-hidden="true"></span>
                <span class="ad-performance-account__campaign-name" :title="row.campaignName">
                  {{ row.campaignName }}
                </span>
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

          <template v-else-if="col.key === 'platform'">
            <template v-if="isAccountRow(row)">
              <span class="ad-performance-account__platform" :title="row.platform ?? ''">
                <span
                  class="ad-performance-account__platform-icon"
                  :class="`ad-performance-account__platform-icon--${row.platform ?? ''}`"
                  aria-hidden="true"
                >
                  {{ channelShort(row.platform ?? '') }}
                </span>
              </span>
            </template>
            <span v-else class="ad-performance-table__muted">-</span>
          </template>

          <template v-else-if="col.key === 'balance'">
            <template v-if="isAccountRow(row) && row.balance != null">{{
              formatMoney(row.balance, 0)
            }}</template>
            <span v-else-if="isAccountRow(row)" class="ad-performance-table__muted">-</span>
            <span v-else class="ad-performance-table__muted">-</span>
          </template>

          <template v-else-if="col.key === 'spend'">{{ formatMoney(row.spend, 0) }}</template>

          <template v-else-if="col.key === 'budgetProgressPercent'">
            <template v-if="isAccountRow(row) && row.budgetProgressPercent != null">
              <div class="ad-performance-table__progress-cell">
                <div class="ad-performance-table__progress-bg">
                  <div
                    class="ad-performance-table__progress-fill"
                    :class="budgetProgressClass(row.budgetProgressPercent)"
                    :style="{ width: `${row.budgetProgressPercent}%` }"
                  ></div>
                </div>
                <span class="ad-performance-table__progress-text"
                  >{{ row.budgetProgressPercent }}%</span
                >
              </div>
            </template>
            <span v-else-if="isAccountRow(row)" class="ad-performance-table__muted">-</span>
            <span v-else class="ad-performance-table__muted">-</span>
          </template>

          <template v-else-if="col.key === 'activeCampaignCount'">
            <template v-if="isAccountRow(row) && row.activeCampaignCount != null"
              >{{ row.activeCampaignCount }} 个系列</template
            >
            <span v-else-if="isAccountRow(row)" class="ad-performance-table__muted">-</span>
            <span v-else class="ad-performance-table__muted">-</span>
          </template>

          <template v-else-if="col.key === 'avgCpi'">
            <template v-if="isAccountRow(row)">{{
              row.avgCpi != null ? formatMoney(row.avgCpi, 2) : '—'
            }}</template>
            <span v-else>{{ row.cpi != null ? formatMoney(row.cpi, 2) : '—' }}</span>
          </template>

          <template v-else-if="col.key === 'avgCtr'">
            <template v-if="isAccountRow(row)">{{
              row.avgCtr != null ? `${row.avgCtr}%` : '—'
            }}</template>
            <span v-else>{{ row.ctr != null ? `${row.ctr}%` : '—' }}</span>
          </template>

          <template v-else-if="col.key === 'avgCvr'">
            <template v-if="isAccountRow(row)">{{
              row.avgCvr != null ? `${row.avgCvr}%` : '—'
            }}</template>
            <span v-else>{{ row.cvr != null ? `${row.cvr}%` : '—' }}</span>
          </template>

          <template v-else-if="col.key === 'roi1'">
            <span v-if="row.roi1 == null" class="ad-performance-table__muted">—</span>
            <span v-else :class="roiClass(row.roi1)">{{ row.roi1 }}%</span>
          </template>

          <template v-else-if="col.key === 'roi7'">
            <span v-if="row.roi7 == null" class="ad-performance-table__muted">—</span>
            <span v-else :class="roiClass(row.roi7)">{{ row.roi7 }}%</span>
          </template>

          <template v-else-if="col.key === 'estimatedProfit'">
            <span v-if="row.estimatedProfit == null" class="ad-performance-table__muted">—</span>
            <span v-else :class="profitClass(row.estimatedProfit)">
              {{ row.estimatedProfit >= 0 ? '+' : '' }}{{ formatMoney(row.estimatedProfit, 0) }}
            </span>
          </template>
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="90" align="center" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="onDetail(row)">详情</ElButton>
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
  import type {
    AdAccountStatus,
    AdPerformanceAccountCampaignRow,
    AdPerformanceAccountRow,
    CampaignRowStatus
  } from '../../types'

  defineOptions({ name: 'AdPerformanceAccountTab' })

  type AccountMixedRow = AdPerformanceAccountRow | AdPerformanceAccountCampaignRow

  type ColumnKey =
    | 'accountName'
    | 'platform'
    | 'balance'
    | 'spend'
    | 'budgetProgressPercent'
    | 'activeCampaignCount'
    | 'avgCpi'
    | 'avgCtr'
    | 'avgCvr'
    | 'roi1'
    | 'roi7'
    | 'estimatedProfit'

  type ColumnDef = {
    key: ColumnKey
    label: string
    prop?: string
    width?: number
    minWidth?: number
    align?: 'left' | 'center' | 'right'
    required?: boolean
  }

  const props = withDefaults(
    defineProps<{
      rows: AdPerformanceAccountRow[]
      keyword?: string
    }>(),
    { rows: () => [], keyword: '' }
  )

  const emit = defineEmits<{
    (e: 'detail', row: AccountMixedRow): void
  }>()

  const expandedRowKeys = ref<string[]>([])

  watch(
    () => props.keyword,
    () => {
      expandedRowKeys.value = []
    }
  )

  const STORAGE_KEY_COLUMNS = 'ad-performance:table:account:visible-columns'

  const ALL_COLUMNS: ColumnDef[] = [
    { key: 'accountName', label: '广告账户', minWidth: 220, required: true },
    { key: 'platform', label: '平台', width: 90, align: 'left' },
    { key: 'balance', label: '账户余额', width: 110, align: 'left' },
    { key: 'spend', label: '广告支出', width: 110, align: 'left', required: true },
    { key: 'budgetProgressPercent', label: '预算进度', minWidth: 160 },
    { key: 'activeCampaignCount', label: '活跃系列数', width: 120, align: 'left' },
    { key: 'avgCpi', label: '平均CPI', width: 100, align: 'left' },
    { key: 'avgCtr', label: '平均点击率', width: 110, align: 'left' },
    { key: 'avgCvr', label: '平均转化率', width: 110, align: 'left' },
    { key: 'roi1', label: '首日ROI', width: 90, align: 'left' },
    { key: 'roi7', label: '7日ROI', width: 90, align: 'left' },
    { key: 'estimatedProfit', label: '预估利润', minWidth: 110, align: 'left' }
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

  function isAccountRow(row: AccountMixedRow): row is AdPerformanceAccountRow {
    return row.accountName != null && String(row.accountName).trim() !== ''
  }

  const filteredData = computed<AdPerformanceAccountRow[]>(() => {
    const list = props.rows ?? []
    const kw = props.keyword?.trim().toLowerCase()
    if (!kw) return list
    return list
      .map((acc) => {
        const accMatch = (acc.accountName ?? '').toLowerCase().includes(kw)
        if (accMatch) return acc
        const children =
          acc.children?.filter((c) => (c.campaignName ?? '').toLowerCase().includes(kw)) ?? []
        if (children.length) return { ...acc, children }
        return null
      })
      .filter(Boolean) as AdPerformanceAccountRow[]
  })

  const data = computed(() => filteredData.value)

  function onExpandChange(row: AccountMixedRow) {
    if (!isAccountRow(row)) return
    const id = row.id
    const idx = expandedRowKeys.value.indexOf(id)
    if (idx >= 0) expandedRowKeys.value.splice(idx, 1)
    else expandedRowKeys.value.push(id)
  }

  function getRowClassName({ row }: { row: AccountMixedRow }) {
    return isAccountRow(row) ? 'is-level-account' : 'is-level-account-campaign'
  }

  function onDetail(row: AccountMixedRow) {
    emit('detail', row)
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
      BR: '🇧🇷'
    }
    return map[c] ?? c
  }

  function accountStatusLabel(s: AdAccountStatus | CampaignRowStatus | string | null | undefined) {
    if (s == null || s === '') return ''
    const map: Record<string, string> = {
      sufficient: '充足',
      low_balance: '低余额',
      insufficient: '余额不足',
      over_budget: '超预算',
      active: '激活',
      paused: '已暂停',
      low_efficiency: '低效'
    }
    return map[s] ?? String(s)
  }

  function accountStatusTagType(
    s: AdAccountStatus | CampaignRowStatus | string | null | undefined
  ): 'success' | 'warning' | 'danger' | 'info' {
    if (s == null || s === '') return 'info'
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      sufficient: 'success',
      low_balance: 'warning',
      insufficient: 'danger',
      over_budget: 'warning',
      active: 'success',
      paused: 'info',
      low_efficiency: 'warning'
    }
    return map[s] ?? 'info'
  }

  function budgetProgressClass(percent: number) {
    if (percent >= 90) return 'ad-performance-table__progress-fill--danger'
    if (percent >= 75) return 'ad-performance-table__progress-fill--warning'
    return 'ad-performance-table__progress-fill--success'
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
